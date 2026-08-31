<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MenuScreen;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class MenuScreenApiController extends Controller
{
    public function index(): JsonResponse
    {
        $screens = MenuScreen::where('active', true)
            ->withCount('categories')
            ->orderBy('position')
            ->orderBy('name')
            ->get(['id', 'name', 'slug', 'description', 'position']);

        return response()->json(['data' => $screens]);
    }

    public function show(string $slug): JsonResponse
    {
        $screen = MenuScreen::where('slug', $slug)
            ->where('active', true)
            ->with(['categories.products' => fn ($query) => $query->orderBy('name')])
            ->firstOrFail();

        return response()->json([
            'data' => [
                'id' => $screen->id,
                'name' => $screen->name,
                'slug' => $screen->slug,
                'description' => $screen->description,
                'position' => $screen->position,
                'categories' => $screen->categories->map(fn ($category) => [
                    'id' => $category->id,
                    'name' => $category->name,
                    'description' => $category->description,
                    'position' => (int) $category->pivot->position,
                    'products' => $category->products->map(fn (Product $product) => [
                        'id' => $product->id,
                        'name' => $product->name,
                        'description' => $product->description,
                        'price' => (float) $product->price,
                        'image' => $this->imageUrl($product->image),
                    ])->values(),
                ])->values(),
            ],
        ]);
    }

    private function imageUrl(?string $image): ?string
    {
        if (! $image) return null;
        return str_starts_with($image, 'images/') ? asset($image) : asset('storage/'.$image);
    }
}
