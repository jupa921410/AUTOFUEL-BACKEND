<?php

namespace App\Http\Controllers;

use App\Models\PromotionGroup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PromotionGroupController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('promotion-groups/index', [
            'groups' => PromotionGroup::withCount('promotions')->latest()->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'slug'        => ['nullable', 'string', 'max:255', 'unique:promotion_groups,slug'],
            'description' => ['nullable', 'string'],
            'active'      => ['boolean'],
        ]);

        // Auto-generate slug from name if not provided
        $validated['slug'] = $validated['slug']
            ? Str::slug($validated['slug'])
            : Str::slug($validated['name']);

        PromotionGroup::create($validated);

        return back()->with('success', 'Grupo creado exitosamente.');
    }

    public function update(Request $request, PromotionGroup $promotionGroup): RedirectResponse
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:255'],
            'slug'        => ['nullable', 'string', 'max:255', 'unique:promotion_groups,slug,' . $promotionGroup->id],
            'description' => ['nullable', 'string'],
            'active'      => ['boolean'],
        ]);

        $validated['slug'] = $validated['slug']
            ? Str::slug($validated['slug'])
            : Str::slug($validated['name']);

        $promotionGroup->update($validated);

        return back()->with('success', 'Grupo actualizado exitosamente.');
    }

    public function destroy(PromotionGroup $promotionGroup): RedirectResponse
    {
        $promotionGroup->delete();

        return back()->with('success', 'Grupo eliminado exitosamente.');
    }
}
