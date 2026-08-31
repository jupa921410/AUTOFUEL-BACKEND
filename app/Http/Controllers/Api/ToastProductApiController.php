<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ToastProduct;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ToastProductApiController extends Controller
{
    /**
     * GET /api/v1/toast/products
     * List all active Toast products.
     * Supports search and category filtering.
     */
    public function index(Request $request): JsonResponse
    {
        $query = ToastProduct::where('active', true)->orderBy('name');

        // Filter by category name
        if ($request->has('category')) {
            $query->where('category_name', 'like', '%' . $request->query('category') . '%');
        }

        // Filter by category_name (alternative query parameter)
        if ($request->has('category_name')) {
            $query->where('category_name', 'like', '%' . $request->query('category_name') . '%');
        }

        // Search by name or PLU
        if ($request->has('search')) {
            $search = $request->query('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', '%' . $search . '%')
                  ->orWhere('plu', 'like', '%' . $search . '%');
            });
        }

        $products = $query->get()->map(fn($p) => $this->formatProduct($p));

        return response()->json(['data' => $products]);
    }

    /**
     * GET /api/v1/toast/products/{idOrGuid}
     * Retrieve a single Toast product by database ID or Toast GUID.
     */
    public function show($idOrGuid): JsonResponse
    {
        $product = ToastProduct::where('active', true)
            ->where(function ($q) use ($idOrGuid) {
                $q->where('id', $idOrGuid)
                  ->orWhere('toast_guid', $idOrGuid);
            })
            ->firstOrFail();

        return response()->json(['data' => $this->formatProduct($product)]);
    }

    /**
     * GET /api/v1/toast/categories
     * Retrieve all unique category names for active Toast products, with product counts.
     */
    public function categories(): JsonResponse
    {
        $categories = ToastProduct::where('active', true)
            ->whereNotNull('category_name')
            ->where('category_name', '!=', '')
            ->select('category_name', \DB::raw('count(*) as products_count'))
            ->groupBy('category_name')
            ->orderBy('category_name')
            ->get()
            ->map(fn($item) => [
                'name'           => $item->category_name,
                'products_count' => (int) $item->products_count,
            ]);

        return response()->json(['data' => $categories]);
    }

    /**
     * Format the Toast Product for the public API response.
     */
    private function formatProduct(ToastProduct $product): array
    {
        return [
            'id'              => $product->id,
            'toast_guid'      => $product->toast_guid,
            'name'            => $product->name,
            'description'     => $product->description,
            'price'           => (float) $product->price,
            'image'           => $product->image_url,
            'image_url'       => $product->image_url,
            'photo'           => $product->image_url,
            'category'        => $product->category_name ?? 'Uncategorized',
            'category_name'   => $product->category_name ?? 'Uncategorized',
            'plu'             => $product->plu,
            'unit_of_measure' => $product->unit_of_measure,
            'modifier_groups' => $product->modifier_groups ?? [],
        ];
    }
}
