<?php

namespace App\Http\Controllers;

use App\Models\ToastOrder;
use App\Models\ToastProduct;
use App\Services\ToastApiService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ToastAdminController extends Controller
{
    public function __construct(private readonly ToastApiService $toast) {}

    /**
     * GET /admin/toast/products
     * Muestra los products sincronizados desde Toast con sus ingredientes.
     */
    public function productsIndex(): Response
    {
        $products = ToastProduct::with('ingredients.inventoryItem')
            ->orderBy('name')
            ->get()
            ->map(function ($p) {
                return [
                    'id'              => $p->id,
                    'toast_guid'      => $p->toast_guid,
                    'name'            => $p->name,
                    'description'     => $p->description,
                    'image_url'       => $p->image_url,
                    'category_name'   => $p->category_name ?? 'Uncategorized',
                    'plu'             => $p->plu,
                    'price'           => (float) $p->price,
                    'active'          => $p->active,
                    'modifier_groups' => $p->modifier_groups ?? [],
                    'ingredients'     => $p->ingredients->map(fn($i) => [
                        'id'                => $i->id,
                        'inventory_item_id' => $i->inventory_item_id,
                        'inventory_item'    => $i->inventoryItem?->name,
                        'unit'              => $i->inventoryItem?->unit,
                        'quantity'          => $i->quantity,
                        'current_stock'     => $i->inventoryItem?->current_stock,
                    ]),
                ];
            });

        return Inertia::render('admin/toast-products', [
            'products' => $products,
        ]);
    }

    /**
     * POST /admin/toast/products/sync
     * Sincroniza desde las órdenes del webhook (la API de menú no está disponible
     * con credenciales TOAST_MACHINE_CLIENT).
     */
    public function productsSync(): \Illuminate\Http\RedirectResponse
    {
        // 1. Intentar primero desde la API de Toast
        $items = $this->toast->getMenuItems();

        // 2. Si el API no está disponible, extraer desde órdenes del webhook
        if (empty($items)) {
            $webhookProducts = $this->toast->syncFromWebhookOrders();

            if (empty($webhookProducts)) {
                return back()->with('error', 'There are no webhook orders yet. Wait for Toast to send orders before synchronizing products.');
            }

            $created = 0;
            $updated = 0;

            foreach ($webhookProducts as $product) {
                $name = $product['name'];
                $guid = 'webhook-' . \Illuminate\Support\Str::slug($name);

                $exists = ToastProduct::where('toast_guid', $guid)->exists();

                ToastProduct::updateOrCreate(
                    ['toast_guid' => $guid],
                    [
                        'name'            => $name,
                        'price'           => $product['price'] ?? 0,
                        'unit_of_measure' => 'NONE',
                        'active'          => true,
                        'category_name'   => 'Uncategorized',
                        'modifier_groups' => [],
                        'raw_payload'     => ['source' => 'webhook_orders', 'name' => $name],
                    ]
                );

                $exists ? $updated++ : $created++;
            }

            $total = $created + $updated;
            return back()->with('success', "Synchronized from webhook orders: {$created} new, {$updated} updated ({$total} total).");
        }

        // 3. Si el API sí respondió, procesar los items normalizados
        $created = 0;
        $updated = 0;

        foreach ($items as $item) {
            $guid = $item['guid'] ?? null;
            if (!$guid) continue;

            $exists = ToastProduct::where('toast_guid', $guid)->exists();

            ToastProduct::updateOrCreate(
                ['toast_guid' => $guid],
                [
                    'toast_item_group_guid' => $item['itemGroupGuid'] ?? null,
                    'category_name'   => $item['category_name'] ?? null,
                    'name'            => $item['name'] ?? 'Sin nombre',
                    'description'     => $item['description'] ?? null,
                    'image_url'       => $item['image_url'] ?? null,
                    'plu'             => $item['plu'] ?? null,
                    'price'           => $item['price'] ?? 0,
                    'unit_of_measure' => $item['unitOfMeasure'] ?? 'NONE',
                    'active'          => ($item['visibility'] ?? 'VISIBLE') !== 'HIDDEN' && !($item['discontinued'] ?? false),
                    'modifier_groups' => $item['modifier_groups'] ?? [],
                    'raw_payload'     => $item['raw_payload'] ?? $item,
                ]
            );

            $exists ? $updated++ : $created++;
        }

        $total = $created + $updated;
        return back()->with('success', "Toast API synchronization: {$created} new, {$updated} updated ({$total} total).");
    }


    /**
     * GET /admin/toast/webhook-orders
     * Muestra las órdenes recibidas por el webhook de Toast.
     */
    public function productsAddExtra(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'percentage' => ['required', 'numeric', 'gt:0', 'decimal:0,2', 'max:100'],
        ], [
            'percentage.required' => 'Ingresa el porcentaje que deseas agregar.',
            'percentage.numeric' => 'El porcentaje debe ser un numero valido.',
            'percentage.gt' => 'El porcentaje debe ser mayor que cero.',
            'percentage.decimal' => 'El porcentaje puede tener un maximo de 2 decimales.',
            'percentage.max' => 'El porcentaje no puede ser mayor que 100.',
        ]);

        $percentage = (float) $validated['percentage'];
        $multiplier = number_format(1 + ($percentage / 100), 6, '.', '');
        $updated = ToastProduct::query()->update([
            'price' => DB::raw("ROUND(price * {$multiplier}, 2)"),
        ]);

        return back()->with(
            'success',
            sprintf('Se agrego %.2f%% al precio de %d products.', $percentage, $updated)
        );
    }

    public function webhookOrdersIndex(Request $request): Response
    {
        $query = ToastOrder::query()->latest();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('status', 'like', "%{$search}%");
            });
        }

        if ($status = $request->get('status')) {
            $query->where('status', $status);
        }

        $orders = $query->paginate(50)->through(fn($o) => [
            'id'                  => $o->id,
            'toast_guid'          => $o->toast_guid,
            'order_number'        => $o->order_number,
            'customer_name'       => $o->customer_name,
            'source'              => $o->source,
            'approval_status'     => $o->approval_status,
            'status'              => $o->status,
            'total_amount'        => (float) $o->total_amount,
            'opened_date'         => $o->opened_date?->toISOString(),
            'inventory_deducted'  => $o->inventory_deducted,
            'items'               => $o->items ?? [],
            'created_at'          => $o->created_at->toISOString(),
        ]);

        return Inertia::render('admin/toast-webhook-orders', [
            'orders'  => $orders,
            'filters' => $request->only(['search', 'status']),
        ]);
    }
}
