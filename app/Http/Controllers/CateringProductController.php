<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\CateringProduct;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;

class CateringProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('catering-products/index', [
            'cateringProducts' => CateringProduct::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'image' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('catering-products', 'public');
        }

        CateringProduct::create($validated);

        return back()->with('success', 'Product de catering creado.');
    }

    public function update(Request $request, CateringProduct $cateringProduct): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'image' => ['nullable', 'image', 'max:2048'],
        ]);

        if ($request->hasFile('image')) {
            if ($cateringProduct->image) {
                Storage::disk('public')->delete($cateringProduct->image);
            }
            $validated['image'] = $request->file('image')->store('catering-products', 'public');
        } else {
            unset($validated['image']);
        }

        $cateringProduct->update($validated);

        return back()->with('success', 'Product de catering actualizado.');
    }

    public function destroy(CateringProduct $cateringProduct): RedirectResponse
    {
        if ($cateringProduct->image) {
            Storage::disk('public')->delete($cateringProduct->image);
        }
        
        $cateringProduct->delete();

        return back()->with('success', 'Product de catering eliminado.');
    }
}
