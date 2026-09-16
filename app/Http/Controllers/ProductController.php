<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\ProductSize;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('products/index', [
            'products' => Product::with('category', 'sizes')->latest()->get(),
            'categories' => Category::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'category_id'      => ['required', 'exists:categories,id'],
            'name'             => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'price'            => ['nullable', 'numeric', 'min:0'],
            'image'            => ['nullable', 'image', 'max:5120'],
            'featured'         => ['required', 'boolean'],
            'sizes'            => ['nullable', 'array'],
            'sizes.*.label'    => ['required_with:sizes', 'string', 'max:50'],
            'sizes.*.price'    => ['required_with:sizes', 'numeric', 'min:0'],
        ]);

        $validated['featured'] = $request->boolean('featured');

        // If there are sizes, use the first size price as the main product price (fallback)
        if (empty($validated['price']) && !empty($validated['sizes'])) {
            $validated['price'] = $validated['sizes'][0]['price'];
        }

        if ($request->hasFile('image')) {
            $validated['image'] = $request->file('image')->store('products', 'public');
        }

        $sizes = $validated['sizes'] ?? [];
        unset($validated['sizes']);

        $product = Product::create($validated);

        foreach ($sizes as $index => $size) {
            $product->sizes()->create([
                'label'      => $size['label'],
                'price'      => $size['price'],
                'sort_order' => $index,
            ]);
        }

        return back()->with('success', 'Product created successfully.');
    }

    public function update(Request $request, Product $product): RedirectResponse
    {
        $validated = $request->validate([
            'category_id'      => ['required', 'exists:categories,id'],
            'name'             => ['required', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
            'price'            => ['nullable', 'numeric', 'min:0'],
            'image'            => ['nullable', 'image', 'max:5120'],
            'featured'         => ['required', 'boolean'],
            'sizes'            => ['nullable', 'array'],
            'sizes.*.label'    => ['required_with:sizes', 'string', 'max:50'],
            'sizes.*.price'    => ['required_with:sizes', 'numeric', 'min:0'],
        ]);

        $validated['featured'] = $request->boolean('featured');

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $validated['image'] = $request->file('image')->store('products', 'public');
        } else {
            unset($validated['image']);
        }

        $sizes = $validated['sizes'] ?? null;
        unset($validated['sizes']);

        // If there are sizes, sync main price with first size price
        if (!empty($sizes) && empty($validated['price'])) {
            $validated['price'] = $sizes[0]['price'];
        }

        $product->update($validated);

        // Sync sizes: delete all old ones and re-insert
        if ($sizes !== null) {
            $product->sizes()->delete();
            foreach ($sizes as $index => $size) {
                $product->sizes()->create([
                    'label'      => $size['label'],
                    'price'      => $size['price'],
                    'sort_order' => $index,
                ]);
            }
        }

        return back()->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product): RedirectResponse
    {
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete(); // sizes cascade delete automatically

        return back()->with('success', 'Product deleted successfully.');
    }
}
