<?php

namespace App\Http\Controllers;

use App\Mail\CateringPaymentLinkMail;
use App\Models\CateringOrder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Stripe;

class CateringOrderController extends Controller
{
    public function index(): Response
    {
        $orders = CateringOrder::with('catering')->orderBy('created_at', 'desc')->get();
        return Inertia::render('catering-orders/index', [
            'cateringOrders' => $orders
        ]);
    }

    public function updateStatus(Request $request, CateringOrder $cateringOrder): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'string', 'in:awaiting_payment,pending,confirmed,preparing,delivered,cancelled']
        ]);

        $cateringOrder->update($validated);

        return back()->with('success', 'Order status updated.');
    }

    /**
     * Genera un Stripe Checkout Session con el monto indicado y envía el link al cliente por email.
     */
    public function sendPaymentLink(Request $request, CateringOrder $cateringOrder): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:1'],
        ]);

        $amount = (float) $validated['amount'];

        // Actualiza el total del pedido con el monto personalizado
        $cateringOrder->update(['total_price' => $amount]);

        Log::info('[Stripe Checkout] Admin payment link requested for catering order.', [
            'order_id' => $cateringOrder->id,
            'amount_cents' => (int) round($amount * 100),
            'previous_payment_status' => $cateringOrder->payment_status,
            'previous_status' => $cateringOrder->status,
        ]);

        // Crea sesión de pago en Stripe
        Stripe::setApiKey(config('services.stripe.secret'));

        $frontendUrl = config('services.frontend_url');

        $cateringName = $cateringOrder->catering?->name ?? 'Paquete de Catering';

        $session = StripeSession::create([
            'payment_method_types' => ['card'],
            'line_items'           => [
                [
                    'price_data' => [
                        'currency'     => 'usd',
                        'unit_amount'  => (int) round($amount * 100),
                        'product_data' => [
                            'name'        => $cateringName . ' — Pedido #' . $cateringOrder->id,
                            'description' => 'Servicio de catering AutoFuel',
                        ],
                    ],
                    'quantity'   => 1,
                ],
            ],
            'mode'           => 'payment',
            'customer_email' => $cateringOrder->client_email,
            'metadata'       => [
                'order_id'    => $cateringOrder->id,
                'catering_id' => $cateringOrder->catering_id,
            ],
            'success_url' => url('/catering/success?session_id={CHECKOUT_SESSION_ID}&order_id=' . $cateringOrder->id),
            'cancel_url'  => url('/catering/cancel?order_id=' . $cateringOrder->id),
        ]);

        // Guarda el nuevo session ID y pone el pedido en "awaiting_payment"
        $cateringOrder->update([
            'stripe_session_id' => $session->id,
            'status'            => 'awaiting_payment',
            'payment_status'    => 'unpaid',
        ]);

        Log::info('[Stripe Checkout] Admin payment link session created.', [
            'order_id' => $cateringOrder->id,
            'stripe_session_id' => $session->id,
            'amount_cents' => (int) round($amount * 100),
        ]);

        // Envía el email al cliente
        Mail::to($cateringOrder->client_email)->send(
            new CateringPaymentLinkMail($cateringOrder, $session->url, $amount)
        );

        Log::info('[Stripe Checkout] Admin payment link email sent.', [
            'order_id' => $cateringOrder->id,
            'stripe_session_id' => $session->id,
        ]);

        return back()->with('success', 'Link de pago enviado a ' . $cateringOrder->client_email);
    }

    /**
     * Marca manualmente un pedido como pagado (para casos donde el webhook no disparó).
     */
    public function markAsPaid(CateringOrder $cateringOrder): RedirectResponse
    {
        $cateringOrder->update([
            'payment_status' => 'paid',
            'status'         => 'pending',
        ]);

        Log::info('[Stripe Checkout] Catering order manually marked as paid.', [
            'order_id' => $cateringOrder->id,
        ]);

        return back()->with('success', 'Pedido #' . $cateringOrder->id . ' marcado como pagado.');
    }

    public function destroy(CateringOrder $cateringOrder): RedirectResponse
    {
        $cateringOrder->delete();
        return back()->with('success', 'Pedido eliminado.');
    }
}
