<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;

class ReviewApiController extends Controller
{
    /**
     * Get all active reviews sorted by 'sort_order'.
     */
    public function index(): JsonResponse
    {
        $reviews = Review::where('active', true)
            ->orderBy('sort_order', 'asc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json(['data' => $reviews]);
    }
}
