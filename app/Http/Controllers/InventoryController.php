<?php

namespace App\Http\Controllers;

use App\Models\InventoryCategory;
use App\Models\InventoryItem;
use App\Models\InventoryMovement;
use App\Models\InventoryPurchase;
use App\Models\Product;
use App\Models\ProductIngredient;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // ITEMS
    // ─────────────────────────────────────────────────────────────────────────

    public function itemsIndex(Request $request): Response
    {
        $query = InventoryItem::with('category')->orderBy('name');

        if ($request->filled('category')) {
            $query->where('inventory_category_id', $request->category);
        }
        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }
        if ($request->filled('low_stock')) {
            $query->whereColumn('current_stock', '<=', 'min_stock');
        }

        // Items con stock bajo (para el modal de compra) — ordenados por déficit
        $lowStockItems = InventoryItem::with('category')
            ->where('active', true)
            ->whereColumn('current_stock', '<=', 'min_stock')
            ->orderByRaw('(min_stock - current_stock) DESC')
            ->get(['id', 'name', 'unit', 'current_stock', 'min_stock', 'cost_per_unit']);

        return Inertia::render('inventory/items', [
            'items'         => $query->get(),
            'categories'    => InventoryCategory::orderBy('name')->get(),
            'filters'       => $request->only(['category', 'search', 'low_stock']),
            'lowStockItems' => $lowStockItems,   // pre-cargados para el modal de compra
            'allItems'      => InventoryItem::where('active', true)->orderBy('name')->get(['id', 'name', 'unit', 'cost_per_unit']),
        ]);
    }


    public function itemStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'                  => ['required', 'string', 'max:255'],
            'inventory_category_id' => ['nullable', 'exists:inventory_categories,id'],
            'unit'                  => ['required', 'string', 'max:30'],
            'current_stock'         => ['required', 'numeric', 'min:0'],
            'min_stock'             => ['required', 'numeric', 'min:0'],
            'cost_per_unit'         => ['nullable', 'numeric', 'min:0'],
            'notes'                 => ['nullable', 'string'],
        ]);

        $item = InventoryItem::create($validated);

        // Si hay stock inicial, registrar movimiento de entrada
        if ($validated['current_stock'] > 0) {
            $item->movements()->create([
                'user_id'      => $request->user()->id,
                'type'         => 'in',
                'quantity'     => $validated['current_stock'],
                'stock_before' => 0,
                'stock_after'  => $validated['current_stock'],
                'reason'       => 'Initial stock when item was created',
            ]);
        }

        return back()->with('success', "Item '{$item->name}' creado.");
    }

    public function itemUpdate(Request $request, InventoryItem $item): RedirectResponse
    {
        $validated = $request->validate([
            'name'                  => ['required', 'string', 'max:255'],
            'inventory_category_id' => ['nullable', 'exists:inventory_categories,id'],
            'unit'                  => ['required', 'string', 'max:30'],
            'min_stock'             => ['required', 'numeric', 'min:0'],
            'cost_per_unit'         => ['nullable', 'numeric', 'min:0'],
            'notes'                 => ['nullable', 'string'],
            'active'                => ['boolean'],
        ]);

        $item->update($validated);

        return back()->with('success', "Item '{$item->name}' actualizado.");
    }

    public function itemDestroy(InventoryItem $item): RedirectResponse
    {
        $name = $item->name;
        $item->delete();
        return back()->with('success', "Item '{$name}' eliminado.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MOVIMIENTOS manuales
    // ─────────────────────────────────────────────────────────────────────────

    public function movementStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'inventory_item_id' => ['required', 'exists:inventory_items,id'],
            'type'              => ['required', Rule::in(['in', 'out', 'adjustment'])],
            'quantity'          => ['required', 'numeric', 'min:0.001'],
            'reason'            => ['nullable', 'string', 'max:255'],
        ]);

        $item = InventoryItem::findOrFail($validated['inventory_item_id']);
        $item->applyMovement(
            $validated['type'],
            (float) $validated['quantity'],
            $request->user()->id,
            $validated['reason'] ?? null,
        );

        return back()->with('success', 'Movimiento registrado correctamente.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // COMPRAS (Purchase Orders)
    // ─────────────────────────────────────────────────────────────────────────

    public function purchasesIndex(): Response
    {
        $purchases = InventoryPurchase::with(['user', 'items.item'])
            ->orderByDesc('created_at')
            ->get();

        return Inertia::render('inventory/purchases', [
            'purchases' => $purchases,
            'items'     => InventoryItem::where('active', true)->orderBy('name')->get(['id', 'name', 'unit', 'cost_per_unit']),
        ]);
    }

    public function purchaseStore(Request $request): RedirectResponse
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
            'ordered_at' => $validated['ordered_at'] ?? null,
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

        return back()->with('success', "Purchase #{$purchase->id} creada.");
    }

    public function purchaseReceive(Request $request, InventoryPurchase $purchase): RedirectResponse
    {
        if ($purchase->status === 'received') {
            return back()->with('error', 'Esta compra ya fue recibida.');
        }

        foreach ($purchase->items as $line) {
            $line->item->applyMovement(
                'in',
                $line->quantity,
                $request->user()->id,
                "Purchase receipt #{$purchase->id} — {$purchase->supplier}",
                $line->id,
            );
        }

        $purchase->update([
            'status'      => 'received',
            'received_at' => now()->toDateString(),
        ]);

        return back()->with('success', "Purchase #{$purchase->id} recibida. Stock actualizado.");
    }

    public function purchaseCancel(InventoryPurchase $purchase): RedirectResponse
    {
        if (in_array($purchase->status, ['received', 'cancelled'])) {
            return back()->with('error', 'No se puede cancelar esta compra.');
        }

        $purchase->update(['status' => 'cancelled']);

        return back()->with('success', "Purchase #{$purchase->id} cancelada.");
    }

    public function purchaseDestroy(InventoryPurchase $purchase): RedirectResponse
    {
        if ($purchase->status === 'received') {
            return back()->with('error', 'No se puede eliminar una compra ya recibida.');
        }

        $purchase->delete();

        return back()->with('success', 'Purchase eliminada.');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PDF — Orden de Purchase Stock Bajo
    // ─────────────────────────────────────────────────────────────────────────

    public function lowStockPdf(Request $request): HttpResponse
    {
        $items = InventoryItem::with('category')
            ->where('active', true)
            ->whereColumn('current_stock', '<=', 'min_stock')
            ->orderByRaw('(min_stock - current_stock) DESC')
            ->get();

        $user = $request->user()?->name ?? 'Sistema';

        $pdf = Pdf::loadView('inventory.low_stock_pdf', compact('items', 'user'))
            ->setPaper('letter', 'landscape');

        $filename = 'orden-compra-stock-bajo-' . now()->format('Y-m-d') . '.pdf';

        return $pdf->download($filename);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RECETAS (Product Ingredients — CRUD completo)
    // ─────────────────────────────────────────────────────────────────────────

    public function recipesIndex(): Response
    {
        $products = Product::with(['category', 'ingredients.inventoryItem'])
            ->orderBy('name')
            ->get()
            ->map(fn($p) => [
                'id'          => $p->id,
                'name'        => $p->name,
                'toast_name'  => $p->toast_name,
                'description' => $p->description,
                'price'       => $p->price,
                'category'    => $p->category,
                'ingredients' => $p->ingredients->map(fn($i) => [
                    'id'                => $i->id,
                    'inventory_item_id' => $i->inventory_item_id,
                    'quantity'          => $i->quantity,
                    'inventory_item'    => [
                        'id'            => $i->inventoryItem->id,
                        'name'          => $i->inventoryItem->name,
                        'unit'          => $i->inventoryItem->unit,
                        'cost_per_unit' => $i->inventoryItem->cost_per_unit,
                    ],
                ]),
            ]);

        $inventoryItems = InventoryItem::where('active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'unit', 'cost_per_unit']);

        // Names únicos de items que Toast ha enviado por webhook
        // (para el dropdown de mapeo de toast_name)
        $toastItemNames = \App\Models\ToastOrder::whereNotNull('items')
            ->get('items')
            ->flatMap(fn($o) => collect($o->items)->pluck('name'))
            ->filter(fn($n) => $n && $n !== 'Product')
            ->unique()
            ->sort()
            ->values();

        return Inertia::render('inventory/recipes', [
            'products'       => $products,
            'inventoryItems' => $inventoryItems,
            'toastItemNames' => $toastItemNames,
        ]);
    }

    /** Crea una nueva receta (producto) */
    public function recipeStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'toast_name'  => ['nullable', 'string', 'max:255', 'unique:products,toast_name'],
            'description' => ['nullable', 'string'],
            'price'       => ['nullable', 'numeric', 'min:0'],
        ]);

        $product = Product::create($validated);

        return back()->with('success', "Recipe '{$product->name}' creada.");
    }

    /** Actualiza nombre, toast_name e ingredientes de una receta */
    public function recipeUpdate(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => ['sometimes', 'required', 'string', 'max:255'],
            'toast_name'  => ['nullable', 'string', 'max:255', "unique:products,toast_name,{$product->id}"],
            'description' => ['nullable', 'string'],
            'price'       => ['nullable', 'numeric', 'min:0'],
            'ingredients' => ['array'],
            'ingredients.*.inventory_item_id' => ['required', 'exists:inventory_items,id'],
            'ingredients.*.quantity'          => ['required', 'numeric', 'min:0.001'],
        ]);

        // Update datos del producto
        $product->update([
            'name'        => $validated['name']        ?? $product->name,
            'toast_name'  => array_key_exists('toast_name', $validated) ? $validated['toast_name'] : $product->toast_name,
            'description' => $validated['description'] ?? $product->description,
            'price'       => $validated['price']       ?? $product->price,
        ]);

        // Reemplazar ingredientes si se enviaron
        if (array_key_exists('ingredients', $validated)) {
            $product->ingredients()->delete();
            foreach ($validated['ingredients'] as $ing) {
                $product->ingredients()->create([
                    'inventory_item_id' => $ing['inventory_item_id'],
                    'quantity'          => $ing['quantity'],
                ]);
            }
        }

        return back()->with('success', "Recipe '{$product->name}' actualizada.");
    }

    /** Elimina una receta y sus ingredientes */
    public function recipeDestroy(Product $product): RedirectResponse
    {
        $name = $product->name;
        $product->ingredients()->delete();
        $product->delete();

        return back()->with('success', "Recipe '{$name}' eliminada.");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CATEGORÍAS
    // ─────────────────────────────────────────────────────────────────────────

    public function categoryStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'  => ['required', 'string', 'max:100', 'unique:inventory_categories,name'],
            'color' => ['nullable', 'string', 'max:20'],
        ]);

        InventoryCategory::create($validated);

        return back()->with('success', "Category '{$validated['name']}' creada.");
    }

    public function categoryDestroy(InventoryCategory $category): RedirectResponse
    {
        $category->delete();
        return back()->with('success', 'Category deleted.');
    }
}
