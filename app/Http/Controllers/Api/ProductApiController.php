<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('category')->orderBy('name');

        // Filter by category id
        if ($request->has('category_id')) {
            $query->where('category_id', $request->query('category_id'));
        }

        // Filter by category name
        if ($request->has('category')) {
            $query->whereHas('category', function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->query('category') . '%');
            });
        }

        // Search by name
        if ($request->has('search')) {
            $query->where('name', 'like', '%' . $request->query('search') . '%');
        }

        if ($request->boolean('featured')) {
            $query->where('featured', true);
        }

        $products = $query->get()->map(fn($p) => $this->formatProduct($p));

        return response()->json(['data' => $products]);
    }

    public function featured(): JsonResponse
    {
        $products = Product::with('category')
            ->where('featured', true)
            ->orderBy('name')
            ->get()
            ->map(fn ($product) => $this->formatProduct($product));

        return response()->json(['data' => $products]);
    }

    public function show(Product $product): JsonResponse
    {
        $product->load('category');

        return response()->json(['data' => $this->formatProduct($product)]);
    }

    private function imageUrl(?string $image): ?string
    {
        if (!$image) return null;
        // Seeded products: stored directly in public/images/
        if (str_starts_with($image, 'images/')) {
            return asset($image);
        }
        // Admin-uploaded: stored on the public storage disk
        return asset('storage/' . $image);
    }

    private function formatProduct(Product $product): array
    {
        $image = $this->imageUrl($product->image);

        return [
            'id'            => $product->id,
            'name'          => $product->name,
            'description'   => $product->description,
            'price'         => (float) $product->price,
            'image'         => $image,
            'photo'         => $image,
            'category_id'   => $product->category_id,
            'category'      => $product->category?->name,
            'category_name' => $product->category?->name,
            'featured'      => $product->featured,
        ];
    }
}
