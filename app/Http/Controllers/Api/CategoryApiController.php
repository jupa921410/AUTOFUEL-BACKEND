<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\JsonResponse;

class CategoryApiController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::orderBy('name')
            ->withCount('products')
            ->get()
            ->map(fn ($cat) => [
                'id'             => $cat->id,
                'name'           => $cat->name,
                'description'    => $cat->description,
                'products_count' => $cat->products_count,
            ]);

        return response()->json(['data' => $categories]);
    }
}
