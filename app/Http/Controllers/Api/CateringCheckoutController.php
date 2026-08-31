<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Catering;
use App\Models\CateringOrder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Stripe\Exception\SignatureVerificationException;
use Stripe\Stripe;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Webhook;
use UnexpectedValueException;

class CateringCheckoutController extends Controller
{
    /**
     * POST /api/v1/catering-checkout
     *
     * Creates a CateringOrder with status "awaiting_payment" and returns
     * a Stripe Checkout Session URL for the client to complete payment.
     */
    public function checkout(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'catering_id'   => ['required', 'exists:caterings,id'],
            'client_name'   => ['required', 'string', 'max:255'],
            'client_email'  => ['nullable', 'email', 'max:255'],
            'client_phone'  => ['nullable', 'string', 'max:50'],
            'delivery_date' => ['required', 'date', 'after:today'],
            'notes'         => ['nullable', 'string', 'max:2000'],
        ]);

        $catering = Catering::findOrFail($validated['catering_id']);

        // Create order with "awaiting_payment" status
        $order = CateringOrder::create([
            'catering_id'    => $catering->id,
            'client_name'    => $validated['client_name'],
            'client_email'   => $validated['client_email'],
            'client_phone'   => $validated['client_phone'],
            'delivery_date'  => $validated['delivery_date'],
            'notes'          => $validated['notes'] ?? null,
            'status'         => 'awaiting_payment',
            'payment_status' => 'unpaid',
            'total_price'    => $catering->price,
        ]);

        Log::info('[Stripe Checkout] Catering order created before payment.', [
            'order_id' => $order->id,
            'catering_id' => $catering->id,
            'amount_cents' => (int) round((float) $catering->price * 100),
            'payment_status' => $order->payment_status,
            'status' => $order->status,
        ]);

        // Build Stripe Checkout Session
        Stripe::setApiKey(config('services.stripe.secret'));

        $frontendUrl = config('services.frontend_url');

        $sessionPayload = [
            'payment_method_types' => ['card'],
            'line_items'           => [
                [
                    'price_data' => [
                        'currency'     => 'usd',
                        'unit_amount'  => (int) round($catering->price * 100), // cents
                        'product_data' => [
                            'name'        => $catering->name . ' — Catering para ' . $catering->pax . ' personas',
                            'description' => $catering->description ?? 'Paquete de catering AutoFuel',
                        ],
                    ],
                    'quantity'   => 1,
                ],
            ],
            'mode'        => 'payment',
            'metadata'    => [
                'order_id'    => $order->id,
                'catering_id' => $catering->id,
            ],
            'success_url' => $frontendUrl . '/catering/success?session_id={CHECKOUT_SESSION_ID}&order_id=' . $order->id,
            'cancel_url'  => $frontendUrl . '/catering/cancel?order_id=' . $order->id,
        ];

        if (!empty($validated['client_email'])) {
            $sessionPayload['customer_email'] = $validated['client_email'];
        }

        $session = StripeSession::create($sessionPayload);

        // Save Stripe session ID on the order
        $order->update(['stripe_session_id' => $session->id]);

        Log::info('[Stripe Checkout] Session created for catering order.', [
            'order_id' => $order->id,
            'stripe_session_id' => $session->id,
            'amount_cents' => (int) round((float) $catering->price * 100),
        ]);

        return response()->json([
            'message'      => 'Payment session created.',
            'order_id'     => $order->id,
            'checkout_url' => $session->url,
        ], 201);
    }

    /**
     * POST /api/stripe/webhook
     *
     * Handles Stripe webhook events (no auth/CSRF middleware).
     * Listens for "checkout.session.completed" to confirm payment.
     */
    public function webhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $webhookSecret = config('services.stripe.webhook_secret');

        if (! $webhookSecret) {
            Log::error('[Stripe Webhook] Missing STRIPE_WEBHOOK_SECRET.');

            return response()->json(['error' => 'Stripe webhook secret is not configured.'], 500);
        }

        // Validate webhook signature
        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $webhookSecret);
        } catch (UnexpectedValueException $e) {
            Log::warning('[Stripe Webhook] Invalid payload.', [
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Invalid payload.'], 400);
        } catch (SignatureVerificationException $e) {
            Log::warning('[Stripe Webhook] Invalid signature.', [
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Invalid signature.'], 400);
        }

        Log::info('[Stripe Webhook] Event received.', [
            'event_id' => $event->id ?? null,
            'event_type' => $event->type,
        ]);

        match ($event->type) {
            'checkout.session.completed' => $this->handleCheckoutSessionCompleted($event->data->object),
            default                      => null,
        };

        return response()->json(['received' => true]);
    }

    private function handleCheckoutSessionCompleted(StripeSession $session): void
    {
        $orderId = $session->metadata->order_id ?? null;

        if (! $orderId || $session->payment_status !== 'paid') {
            Log::warning('[Stripe Webhook] Checkout session ignored: missing order id or unpaid session.', [
                'stripe_session_id' => $session->id,
                'order_id' => $orderId,
                'stripe_payment_status' => $session->payment_status,
            ]);

            return;
        }

        $order = CateringOrder::find($orderId);

        if (! $order || $order->payment_status !== 'unpaid') {
            Log::warning('[Stripe Webhook] Checkout session ignored: order missing or not unpaid.', [
                'stripe_session_id' => $session->id,
                'order_id' => $orderId,
                'order_found' => (bool) $order,
                'order_payment_status' => $order?->payment_status,
            ]);

            return;
        }

        $expectedAmount = (int) round((float) $order->total_price * 100);

        if ($order->stripe_session_id !== $session->id || (int) $session->amount_total !== $expectedAmount) {
            Log::warning('[Stripe Webhook] Checkout session ignored: session or amount mismatch.', [
                'order_id' => $order->id,
                'expected_session_id' => $order->stripe_session_id,
                'received_session_id' => $session->id,
                'expected_amount_cents' => $expectedAmount,
                'received_amount_cents' => (int) $session->amount_total,
            ]);

            return;
        }

        $order->update([
            'payment_status' => 'paid',
            'status'         => 'pending', // Now visible for admin action
        ]);

        Log::info('[Stripe Webhook] Catering order marked as paid.', [
            'order_id' => $order->id,
            'stripe_session_id' => $session->id,
            'amount_cents' => (int) $session->amount_total,
        ]);
    }

}
