<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\MenuScreen;
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
            'screens' => MenuScreen::with('categories:id,name')->orderBy('position')->orderBy('name')->get(),
            'categories' => Category::orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validateData($request);
        $data['slug'] = Str::slug($data['slug'] ?: $data['name']);
        $categoryIds = $data['category_ids'];
        unset($data['category_ids']);

        $screen = MenuScreen::create($data);
        $this->syncCategories($screen, $categoryIds);

        return back()->with('success', 'Menu screen created successfully.');
    }

    public function update(Request $request, MenuScreen $menuScreen): RedirectResponse
    {
        $data = $this->validateData($request, $menuScreen);
        $data['slug'] = Str::slug($data['slug'] ?: $data['name']);
        $categoryIds = $data['category_ids'];
        unset($data['category_ids']);

        $menuScreen->update($data);
        $this->syncCategories($menuScreen, $categoryIds);

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
            'position' => ['required', 'integer', 'min:0'],
            'active' => ['required', 'boolean'],
            'category_ids' => ['required', 'array', 'min:1'],
            'category_ids.*' => ['integer', 'distinct', 'exists:categories,id'],
        ]);
    }

    private function syncCategories(MenuScreen $screen, array $categoryIds): void
    {
        $sync = [];
        foreach (array_values($categoryIds) as $position => $categoryId) {
            $sync[$categoryId] = ['position' => $position];
        }
        $screen->categories()->sync($sync);
    }
}
