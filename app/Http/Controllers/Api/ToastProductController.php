<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\ToastProduct;
use App\Models\ToastProductIngredient;
use App\Services\ToastApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ToastProductController extends Controller
{
    public function __construct(private readonly ToastApiService $toast) {}

    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/toast-products
     * Lista todos los products de Toast sincronizados, con sus ingredientes.
     */
    public function index(): JsonResponse
    {
        $products = ToastProduct::with('ingredients.inventoryItem')
            ->where('active', true)
            ->orderBy('name')
            ->get()
            ->map(fn($p) => [
                'id'              => $p->id,
                'toast_guid'      => $p->toast_guid,
                'name'            => $p->name,
                'description'     => $p->description,
                'image_url'       => $p->image_url,
                'category_name'   => $p->category_name,
                'plu'             => $p->plu,
                'price'           => $p->price,
                'modifier_groups' => $p->modifier_groups ?? [],
                'ingredients'     => $p->ingredients->map(fn($i) => [
                    'id'                => $i->id,
                    'inventory_item_id' => $i->inventory_item_id,
                    'inventory_item'    => $i->inventoryItem?->name,
                    'unit'              => $i->inventoryItem?->unit,
                    'quantity'          => $i->quantity,
                    'current_stock'     => $i->inventoryItem?->current_stock,
                ]),
            ]);

        return response()->json($products);
    }

    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /api/v1/toast-products/sync
     * Sincroniza el catálogo de products desde la API de Toast.
     * Hace upsert por toast_guid — no borra products que ya no existen.
     */
    public function sync(): JsonResponse
    {
        $items = $this->toast->getMenuItems();

        if (empty($items)) {
            return response()->json([
                'success' => false,
                'message' => 'Could not retrieve the Toast menu. Check the credentials.',
            ], 502);
        }

        $created  = 0;
        $updated  = 0;

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

        return response()->json([
            'success'  => true,
            'message'  => "Synchronization complete.",
            'created'  => $created,
            'updated'  => $updated,
            'total'    => $created + $updated,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────

    /**
     * PUT /api/v1/toast-products/{toastProduct}/ingredients
     * Asigna o reemplaza los ingredientes de un producto Toast.
     *
     * Body: { "ingredients": [ { "inventory_item_id": 1, "quantity": 0.5 }, ... ] }
     */
    public function updateIngredients(Request $request, ToastProduct $toastProduct): JsonResponse
    {
        $data = $request->validate([
            'ingredients'                  => ['required', 'array'],
            'ingredients.*.inventory_item_id' => ['required', 'integer', 'exists:inventory_items,id'],
            'ingredients.*.quantity'          => ['required', 'numeric', 'min:0.001'],
        ]);

        // Reemplazar ingredientes
        $toastProduct->ingredients()->delete();

        foreach ($data['ingredients'] as $ingredient) {
            ToastProductIngredient::create([
                'toast_product_id'  => $toastProduct->id,
                'inventory_item_id' => $ingredient['inventory_item_id'],
                'quantity'          => $ingredient['quantity'],
            ]);
        }

        return response()->json([
            'success'     => true,
            'message'     => "Ingredientes updated para '{$toastProduct->name}'.",
            'ingredients' => $toastProduct->fresh('ingredients.inventoryItem')->ingredients,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────

    /**
     * GET /api/v1/inventory-items
     * Lista los artículos de inventario disponibles (para el selector de ingredientes).
     */
    public function inventoryItems(): JsonResponse
    {
        $items = InventoryItem::where('active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'unit', 'current_stock']);

        return response()->json($items);
    }
}
