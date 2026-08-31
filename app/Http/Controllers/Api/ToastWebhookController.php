<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ToastOrder;
use App\Models\Recipe;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ToastWebhookController extends Controller
{
    /**
     * Recibe el webhook de Toast y almacena/actualiza la orden en la BD.
     *
     * Estructura real del evento order_updated:
     * {
     *   "guid": "...",           ← GUID del EVENTO
     *   "eventType": "order_updated",
     *   "details": {
     *     "order": { ... }       ← datos reales de la orden
     *   }
     * }
     *
     * URL registrada en Toast: POST /api/toast/webhook
     */
    public function handle(Request $request): JsonResponse
    {
        // Valida que el request viene realmente de Toast
        $this->verifySignature($request);

        $payload = $request->all();

        Log::info('[ToastWebhook] Payload recibido', ['payload' => $payload]);

        // Toast puede enviar un array de eventos o un objeto único
        $events = isset($payload[0]) ? $payload : [$payload];

        foreach ($events as $event) {
            try {
                $this->processEvent($event);
            } catch (\Throwable $e) {
                Log::error('[ToastWebhook] Error procesando evento', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                    'event_guid' => $event['guid'] ?? null,
                ]);
            }
        }

        // Toast espera siempre un 200 OK
        return response()->json(['received' => true], 200);
    }

    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Procesa un evento individual de Toast.
     */
    private function processEvent(array $event): void
    {
        // ── Extraer la orden desde details.order ─────────────────────────────
        $order = $event['details']['order'] ?? null;

        if (!$order) {
            Log::warning('[ToastWebhook] Evento sin details.order, ignorado.', [
                'event_guid' => $event['guid'] ?? null,
            ]);
            return;
        }

        $guid = $order['guid'] ?? null;

        if (!$guid) {
            Log::warning('[ToastWebhook] Orden sin GUID, ignorada.');
            return;
        }

        // ── Totales, cliente e items desde checks ────────────────────────────
        $total        = 0;
        $customerName = 'Customer';
        $items        = [];
        $checks       = $order['checks'] ?? [];

        foreach ($checks as $check) {
            $total += $check['totalAmount'] ?? $check['amount'] ?? 0;

            if ($customerName === 'Customer' && isset($check['customer'])) {
                $fullName = trim(
                    ($check['customer']['firstName'] ?? '') . ' ' .
                    ($check['customer']['lastName']  ?? '')
                );
                $customerName = $fullName ?: 'Customer';
            }

            if (($customerName === 'Customer' || empty($customerName)) && isset($check['tabName'])) {
                $customerName = $check['tabName'];
            }
        }

        // Recopilar todas las selections y sus modifiers de todos los checks
        $allSelections = [];
        foreach ($checks as $check) {
            foreach ($check['selections'] ?? [] as $sel) {
                $allSelections[] = $sel;
                $items[] = [
                    'name'     => $sel['displayName']     ?? 'Product',
                    'quantity' => $sel['quantity']         ?? 1,
                    'price'    => $sel['receiptLinePrice'] ?? $sel['price'] ?? 0,
                ];

                // Procesar modificadores/agregos
                foreach ($sel['modifiers'] ?? [] as $mod) {
                    $allSelections[] = $mod;
                    $items[] = [
                        'name'     => '  + ' . ($mod['displayName'] ?? 'Agrego'),
                        'quantity' => $mod['quantity']         ?? 1,
                        'price'    => $mod['receiptLinePrice'] ?? $mod['price'] ?? 0,
                    ];
                }
            }
        }

        // ── Status ───────────────────────────────────────────────────────────
        $approvalStatus = $order['approvalStatus'] ?? 'OPEN';
        $status = match (strtoupper($approvalStatus)) {
            'APPROVED' => 'confirmed',
            'VOIDED'   => 'cancelled',
            'CLOSED'   => 'delivered',
            default    => 'pending',
        };

        // ── Upsert en la BD ──────────────────────────────────────────────────
        $toastOrder = ToastOrder::updateOrCreate(
            ['toast_guid' => $guid],
            [
                'order_number'    => $order['displayNumber'] ?? null,
                'customer_name'   => $customerName,
                'source'          => $order['source']        ?? 'Local',
                'approval_status' => $approvalStatus,
                'status'          => $status,
                'total_amount'    => $total,
                'opened_date'     => isset($order['openedDate'])
                    ? date('Y-m-d H:i:s', strtotime($order['openedDate']))
                    : null,
                'items'           => $items,
                'raw_payload'     => $order,
            ]
        );

        Log::info(
            "[ToastWebhook] Orden #{$order['displayNumber']} ({$guid}) guardada. " .
            "Status: {$status}, Total: \${$total}"
        );

        // ── Descuento de inventario ──────────────────────────────────────────
        // Solo descontamos si la orden está confirmada o entregada
        // y si todavía no se ha descontado (evita doble descuento en re-envíos)
        if (in_array($status, ['confirmed', 'delivered']) && !$toastOrder->inventory_deducted) {
            $this->deductInventory($toastOrder, $allSelections);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Descuenta los ingredientes del inventario según los items de la orden.
     * Busca el producto local por nombre (insensible a mayúsculas),
     * luego aplica un movimiento 'out' por cada ingrediente configurado.
     */
    private function deductInventory(ToastOrder $toastOrder, array $selections): void
    {
        $anyDeducted = false;

        foreach ($selections as $sel) {
            $displayName = $sel['displayName'] ?? null;
            $quantity    = (float) ($sel['quantity'] ?? 1);

            if (!$displayName) {
                continue;
            }

            // Buscar la receta por toast_name (mapeo exacto) o por nombre (fallback)
            $recipe = Recipe::findByToastName($displayName);

            if (!$recipe) {
                Log::warning("[ToastWebhook] No recipe for '{$displayName}' — assign it under Inventory → Recipes.");
                continue;
            }

            if ($recipe->ingredients->isEmpty()) {
                Log::info("[ToastWebhook] Recipe '{$recipe->name}' sin ingredientes — sin descuento.");
                continue;
            }

            foreach ($recipe->ingredients as $ingredient) {
                $inventoryItem = $ingredient->inventoryItem;
                if (!$inventoryItem) continue;

                $consumed = $ingredient->quantity * $quantity;

                $inventoryItem->applyMovement(
                    'out',
                    $consumed,
                    null,
                    "Webhook Toast — Orden #{$toastOrder->order_number}: {$quantity}x {$displayName}",
                );

                Log::info("[ToastWebhook] -{$consumed} {$inventoryItem->unit} de '{$inventoryItem->name}' por receta '{$recipe->name}'.");
            }

            $anyDeducted = true;
        }


        if ($anyDeducted) {
            // Marcar la orden para no descontar de nuevo en futuros re-envíos
            $toastOrder->update(['inventory_deducted' => true]);
            Log::info("[ToastWebhook] Inventory deducted para orden #{$toastOrder->order_number}.");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Verifica que el request viene realmente de Toast comparando el secret.
     * Toast envía el secret directamente en el header 'Toast-Webhook-Secret'.
     */
    private function verifySignature(Request $request): void
    {
        $secret    = config('services.toast.webhook_secret');
        $signature = $request->header('Toast-Webhook-Secret');

        // Si no hay secret configurado, omitir validación (modo desarrollo)
        if (!$secret) {
            Log::warning('[ToastWebhook] TOAST_WEBHOOK_SECRET is not configured — validation skipped.');
            return;
        }

        if (!$signature || !hash_equals($secret, $signature)) {
            Log::error('[ToastWebhook] Invalid signature rejected.', [
                'ip' => $request->ip(),
            ]);
            abort(401, 'Invalid webhook signature');
        }
    }
}
