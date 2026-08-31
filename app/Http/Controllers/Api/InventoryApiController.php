<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use App\Models\InventoryPurchase;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * Inventory API — usada por la app móvil (auth:sanctum requerido en rutas).
 *
 * GET  /api/v1/inventory/items            — lista artículos
 * GET  /api/v1/inventory/items/{id}       — detalle + movimientos recientes
 * POST /api/v1/inventory/movements        — registrar movimiento manual
 * GET  /api/v1/inventory/purchases        — lista órdenes de compra
 * POST /api/v1/inventory/purchases        — crear orden de compra
 * POST /api/v1/inventory/purchases/{id}/receive — recibir compra → aplica stock
 */
class InventoryApiController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // ITEMS
    // ─────────────────────────────────────────────────────────────────────────

    public function itemsIndex(Request $request): JsonResponse
    {
        $query = InventoryItem::with('category')->where('active', true)->orderBy('name');

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        if ($request->boolean('low_stock')) {
            $query->whereColumn('current_stock', '<=', 'min_stock');
        }

        $items = $query->get()->map(fn($i) => $this->formatItem($i));

        return response()->json(['data' => $items]);
    }

    public function itemShow(InventoryItem $item): JsonResponse
    {
        $item->load('category');
        $movements = $item->movements()
            ->with('user:id,name')
            ->latest()
            ->take(20)
            ->get()
            ->map(fn($m) => [
                'id'          => $m->id,
                'type'        => $m->type,
                'type_label'  => $m->type_label,
                'quantity'    => $m->quantity,
                'stock_before'=> $m->stock_before,
                'stock_after' => $m->stock_after,
                'reason'      => $m->reason,
                'user'        => $m->user?->name,
                'created_at'  => $m->created_at->toDateTimeString(),
            ]);

        return response()->json([
            'data'      => $this->formatItem($item),
            'movements' => $movements,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MOVIMIENTOS
    // ─────────────────────────────────────────────────────────────────────────

    public function movementStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'inventory_item_id' => ['required', 'exists:inventory_items,id'],
            'type'              => ['required', Rule::in(['in', 'out', 'adjustment'])],
            'quantity'          => ['required', 'numeric', 'min:0.001'],
            'reason'            => ['nullable', 'string', 'max:255'],
        ]);

        $item = InventoryItem::findOrFail($validated['inventory_item_id']);

        $movement = $item->applyMovement(
            $validated['type'],
            (float) $validated['quantity'],
            $request->user()->id,
            $validated['reason'] ?? null,
        );

        return response()->json([
            'message'  => 'Movimiento registrado.',
            'item'     => $this->formatItem($item->fresh()),
            'movement' => [
                'id'          => $movement->id,
                'type'        => $movement->type,
                'quantity'    => $movement->quantity,
                'stock_after' => $movement->stock_after,
            ],
        ], 201);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // COMPRAS
    // ─────────────────────────────────────────────────────────────────────────

    public function purchasesIndex(): JsonResponse
    {
        $purchases = InventoryPurchase::with(['user:id,name', 'items.item:id,name,unit'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($p) => $this->formatPurchase($p));

        return response()->json(['data' => $purchases]);
    }

    public function purchaseStore(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'supplier'   => ['nullable', 'string', 'max:255'],
            'ordered_at' => ['nullable', 'date'],
            'notes'      => ['nullable', 'string'],
            'items'      => ['required', 'array', 'min:1'],
            'items.*.inventory_item_id' => ['required', 'exists:inventory_items,id'],
            'items.*.quantity'          => ['required', 'numeric', 'min:0.001'],
            'items.*.unit_price'        => ['required', 'numeric', 'min:0'],
        ]);

        $purchase = InventoryPurchase::create([
            'user_id'    => $request->user()->id,
            'supplier'   => $validated['supplier'] ?? null,
            'ordered_at' => $validated['ordered_at'] ?? now()->toDateString(),
            'notes'      => $validated['notes'] ?? null,
            'status'     => 'ordered',
        ]);

        foreach ($validated['items'] as $line) {
            $purchase->items()->create([
                'inventory_item_id' => $line['inventory_item_id'],
                'quantity'          => $line['quantity'],
                'unit_price'        => $line['unit_price'],
            ]);
        }

        $purchase->recalculateTotal();
        $purchase->load('items.item');

        return response()->json([
            'message'  => 'Purchase creada.',
            'purchase' => $this->formatPurchase($purchase),
        ], 201);
    }

    public function purchaseReceive(Request $request, InventoryPurchase $purchase): JsonResponse
    {
        if ($purchase->status === 'received') {
            return response()->json(['message' => 'Esta compra ya fue recibida.'], 422);
        }

        $purchase->load('items.item');

        foreach ($purchase->items as $line) {
            $line->item->applyMovement(
                'in',
                $line->quantity,
                $request->user()->id,
                "Purchase receipt #{$purchase->id}",
                $line->id,
            );
        }

        $purchase->update([
            'status'      => 'received',
            'received_at' => now()->toDateString(),
        ]);

        return response()->json([
            'message'  => 'Purchase recibida. Stock actualizado.',
            'purchase' => $this->formatPurchase($purchase->fresh('items.item')),
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────

    private function formatItem(InventoryItem $item): array
    {
        return [
            'id'            => $item->id,
            'name'          => $item->name,
            'unit'          => $item->unit,
            'current_stock' => $item->current_stock,
            'min_stock'     => $item->min_stock,
            'low_stock'     => $item->low_stock,
            'cost_per_unit' => $item->cost_per_unit,
            'notes'         => $item->notes,
            'category'      => $item->category ? [
                'id'    => $item->category->id,
                'name'  => $item->category->name,
                'color' => $item->category->color,
            ] : null,
        ];
    }

    private function formatPurchase(InventoryPurchase $purchase): array
    {
        return [
            'id'          => $purchase->id,
            'supplier'    => $purchase->supplier,
            'status'      => $purchase->status,
            'status_label'=> $purchase->status_label,
            'total'       => $purchase->total,
            'ordered_at'  => $purchase->ordered_at?->toDateString(),
            'received_at' => $purchase->received_at?->toDateString(),
            'notes'       => $purchase->notes,
            'created_by'  => $purchase->user?->name,
            'items'       => $purchase->items->map(fn($line) => [
                'id'         => $line->id,
                'item_id'    => $line->inventory_item_id,
                'item_name'  => $line->item?->name,
                'unit'       => $line->item?->unit,
                'quantity'   => $line->quantity,
                'unit_price' => $line->unit_price,
                'subtotal'   => $line->subtotal,
            ]),
            'created_at' => $purchase->created_at->toDateTimeString(),
        ];
    }
}
