<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\MenuScreen;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class MenuScreenController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('menu-screens/index', [
            'screens' => MenuScreen::with([
                'categories:id,name',
                'products:id,name,category_id',
            ])->orderBy('position')->orderBy('name')->get(),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
            'products' => Product::orderBy('name')->get(['id', 'name', 'category_id']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $data['slug'] = Str::slug($data['slug'] ?: $data['name']);
        $categoryIds = $data['category_ids'];
        $productIds = $data['product_ids'] ?? [];
        $categoryLayouts = $data['category_layouts'] ?? [];
        unset($data['category_ids'], $data['product_ids'], $data['category_layouts']);

        // The admin no longer picks a screen order manually — new screens are simply
        // appended after the last one (category order within a screen is still fully
        // controllable, see syncCategories()).
        $data['position'] = (MenuScreen::max('position') ?? -1) + 1;

        $screen = MenuScreen::create($data);
        $this->syncCategories($screen, $categoryIds, $categoryLayouts);
        $this->syncProducts($screen, $productIds, $categoryIds);

        return back()->with('success', 'Menu screen created successfully.');
    }

    public function update(Request $request, MenuScreen $menuScreen): RedirectResponse
    {
        $data = $this->validateData($request, $menuScreen);
        $data['slug'] = Str::slug($data['slug'] ?: $data['name']);
        $categoryIds = $data['category_ids'];
        $productIds = $data['product_ids'] ?? [];
        $categoryLayouts = $data['category_layouts'] ?? [];
        unset($data['category_ids'], $data['product_ids'], $data['category_layouts']);

        // Screen order isn't editable from this form; keep whatever it already was.
        unset($data['position']);

        $menuScreen->update($data);
        $this->syncCategories($menuScreen, $categoryIds, $categoryLayouts);
        $this->syncProducts($menuScreen, $productIds, $categoryIds);

        return back()->with('success', 'Menu screen updated successfully.');
    }

    public function destroy(MenuScreen $menuScreen): RedirectResponse
    {
        $menuScreen->delete();

        return back()->with('success', 'Menu screen deleted successfully.');
    }

    private function validateData(Request $request, ?MenuScreen $screen = null): array
    {
        return $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('menu_screens')->ignore($screen)],
            'description' => ['nullable', 'string'],
            'active' => ['required', 'boolean'],
            // Adds a column with the logo, store name, a live clock, and current
            // weather — in place of the header bar that used to sit above the grid.
            'show_info_widget' => ['sometimes', 'boolean'],
            'category_ids' => ['required', 'array', 'min:1'],
            'category_ids.*' => ['integer', 'distinct', 'exists:categories,id'],
            // Optional: narrows a category down to specific products. Left empty (or
            // omitted) for a category, the screen keeps showing every product in it.
            'product_ids' => ['sometimes', 'array'],
            'product_ids.*' => ['integer', 'distinct', 'exists:products,id'],
            // Optional: how each selected category renders on this screen — a compact
            // list (default) or a full-column rotating photo slider of its products.
            'category_layouts' => ['sometimes', 'array'],
            'category_layouts.*' => ['in:list,slider'],
        ]);
    }

    private function syncCategories(MenuScreen $screen, array $categoryIds, array $categoryLayouts = []): void
    {
        $sync = [];
        foreach (array_values($categoryIds) as $position => $categoryId) {
            $sync[$categoryId] = [
                'position' => $position,
                'layout' => $categoryLayouts[$categoryId] ?? 'list',
            ];
        }
        $screen->categories()->sync($sync);
    }

    private function syncProducts(MenuScreen $screen, array $productIds, array $categoryIds): void
    {
        // Defensive: only keep product picks whose product still belongs to one of the
        // screen's selected categories (covers a category being deselected client-side
        // without its product picks being cleared, or stale ids from another edit).
        $validProductIds = Product::whereIn('id', $productIds)
            ->whereIn('category_id', $categoryIds)
            ->pluck('id')
            ->all();

        $sync = [];
        foreach (array_values($productIds) as $position => $productId) {
            if (in_array($productId, $validProductIds, true)) {
                $sync[$productId] = ['position' => $position];
            }
        }
        $screen->products()->sync($sync);
    }
}
