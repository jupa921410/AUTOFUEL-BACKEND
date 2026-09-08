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
            ->with([
                'categories.products' => fn ($query) => $query->orderBy('name'),
                'products' => fn ($query) => $query->orderByPivot('position'),
            ])
            ->firstOrFail();

        // Products explicitly picked for this screen, grouped by their category. A
        // category with no picks here just falls back to every product it has.
        $pickedByCategory = $screen->products->groupBy('category_id');

        return response()->json([
            'data' => [
                'id' => $screen->id,
                'name' => $screen->name,
                'slug' => $screen->slug,
                'description' => $screen->description,
                'position' => $screen->position,
                'show_info_widget' => (bool) $screen->show_info_widget,
                'categories' => $screen->categories->map(function ($category) use ($pickedByCategory) {
                    $picked = $pickedByCategory->get($category->id);
                    $products = $picked && $picked->isNotEmpty() ? $picked : $category->products;

                    return [
                        'id' => $category->id,
                        'name' => $category->name,
                        'description' => $category->description,
                        'position' => (int) $category->pivot->position,
                        // 'list' (default) renders the usual text column; 'slider' renders
                        // a full-column rotating photo carousel of this category's products.
                        'layout' => $category->pivot->layout ?? 'list',
                        'products' => $products->map(fn (Product $product) => [
                            'id' => $product->id,
                            'name' => $product->name,
                            'description' => $product->description,
                            'price' => (float) $product->price,
                            'image' => $this->imageUrl($product->image),
                        ])->values(),
                    ];
                })->values(),
            ],
        ]);
    }

    private function imageUrl(?string $image): ?string
    {
        if (! $image) return null;
        return str_starts_with($image, 'images/') ? asset($image) : asset('storage/'.$image);
    }
}
