<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use App\Models\ToastOrder;
use App\Services\ToastApiService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RecipeController extends Controller
{
    public function __construct(private readonly ToastApiService $toast) {}
    // ─────────────────────────────────────────────────────────────────────────

    public function index(): Response
    {
        $recipes = Recipe::with('ingredients.inventoryItem')
            ->orderBy('name')
            ->get()
            ->map(fn($r) => [
                'id'          => $r->id,
                'name'        => $r->name,
                'toast_name'  => $r->toast_name,
                'description' => $r->description,
                'price'       => (float) $r->price,
                'active'      => $r->active,
                'ingredients' => $r->ingredients->map(fn($i) => [
                    'id'                => $i->id,
                    'inventory_item_id' => $i->inventory_item_id,
                    'quantity'          => (float) $i->quantity,
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

        // Names únicos que Toast ya envió por webhook (para el dropdown de mapeo)
        $toastItemNames = ToastOrder::whereNotNull('items')
            ->get('items')
            ->flatMap(fn($o) => collect($o->items)->pluck('name'))
            ->filter(fn($n) => filled($n) && $n !== 'Product')
            ->unique()
            ->sort()
            ->values();

        return Inertia::render('inventory/recipes', [
            'recipes'        => $recipes,
            'inventoryItems' => $inventoryItems,
            'toastItemNames' => $toastItemNames,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────

    /**
     * POST /inventory/recipes/sync
     * Sincroniza recetas desde el menú de Toast (usa /config/v2/menuItems).
     */
    public function sync(): RedirectResponse
    {
        $result = $this->toast->syncRecipesFromMenu();

        if ($result['total'] === 0) {
            return back()->with('error', 'Could not retrieve the Toast menu. Check the credentials.');
        }

        return back()->with('success',
            "Sync completado: {$result['created']} nuevas recetas, {$result['updated']} actualizadas ({$result['total']} total)."
        );
    }

    // ─────────────────────────────────────────────────────────────────────────

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'toast_name'  => ['nullable', 'string', 'max:255', 'unique:recipes,toast_name'],
            'description' => ['nullable', 'string'],
            'price'       => ['nullable', 'numeric', 'min:0'],
            'active'      => ['boolean'],
        ]);

        $recipe = Recipe::create($validated);

        return back()->with('success', "Recipe '{$recipe->name}' creada.");
    }

    // ─────────────────────────────────────────────────────────────────────────

    public function update(Request $request, Recipe $recipe): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'toast_name'  => ['nullable', 'string', 'max:255', "unique:recipes,toast_name,{$recipe->id}"],
            'description' => ['nullable', 'string'],
            'price'       => ['nullable', 'numeric', 'min:0'],
            'active'      => ['boolean'],
            'ingredients' => ['array'],
            'ingredients.*.inventory_item_id' => ['required', 'exists:inventory_items,id'],
            'ingredients.*.quantity'          => ['required', 'numeric', 'min:0.001'],
        ]);

        $recipe->update([
            'name'        => $validated['name'],
            'toast_name'  => $validated['toast_name'] ?? null,
            'description' => $validated['description'] ?? null,
            'price'       => $validated['price'] ?? 0,
            'active'      => $validated['active'] ?? true,
        ]);

        // Reemplazar ingredientes
        $recipe->ingredients()->delete();
        foreach ($validated['ingredients'] ?? [] as $ing) {
            $recipe->ingredients()->create([
                'inventory_item_id' => $ing['inventory_item_id'],
                'quantity'          => $ing['quantity'],
            ]);
        }

        return back()->with('success', "Recipe '{$recipe->name}' actualizada.");
    }

    // ─────────────────────────────────────────────────────────────────────────

    public function destroy(Recipe $recipe): RedirectResponse
    {
        $name = $recipe->name;
        $recipe->ingredients()->delete();
        $recipe->delete();

        return back()->with('success', "Recipe '{$name}' eliminada.");
    }
}
