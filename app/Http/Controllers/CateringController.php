<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Catering;
use App\Models\CateringProduct;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CateringController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('caterings/index', [
            'caterings' => Catering::with('cateringProducts')->orderBy('name')->get(),
            'availableProducts' => CateringProduct::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'pax' => ['required', 'integer', 'min:1'],
            'price' => ['required', 'numeric', 'min:0'],
            'products' => ['nullable', 'array'],
            'products.*' => ['exists:catering_products,id'],
        ]);

        $catering = Catering::create([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'pax' => $validated['pax'],
            'price' => $validated['price'],
        ]);

        if (isset($validated['products'])) {
            $catering->cateringProducts()->sync($validated['products']);
        }

        return back()->with('success', 'Catering package created.');
    }

    public function update(Request $request, Catering $catering): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'pax' => ['required', 'integer', 'min:1'],
            'price' => ['required', 'numeric', 'min:0'],
            'products' => ['nullable', 'array'],
            'products.*' => ['exists:catering_products,id'],
        ]);

        $catering->update([
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'pax' => $validated['pax'],
            'price' => $validated['price'],
        ]);

        if (isset($validated['products'])) {
            $catering->cateringProducts()->sync($validated['products']);
        } else {
            $catering->cateringProducts()->detach();
        }

        return back()->with('success', 'Catering package updated.');
    }

    public function destroy(Catering $catering): RedirectResponse
    {
        $catering->delete();

        return back()->with('success', 'Catering package deleted.');
    }
}
