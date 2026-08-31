<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\InventoryItem;
use App\Models\MenuScreen;
use App\Models\Post;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\TvStream;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $today = now()->toDateString();
        $activePromotions = Promotion::with('group')->where('active', true)
            ->whereDate('start_date', '<=', $today)->whereDate('end_date', '>=', $today);

        return Inertia::render('dashboard', [
            'stats' => [
                'products' => Product::count(),
                'featuredProducts' => Product::where('featured', true)->count(),
                'categories' => Category::count(),
                'activePromotions' => (clone $activePromotions)->count(),
                'activeMenuScreens' => MenuScreen::where('active', true)->count(),
                'activeStreams' => TvStream::where('active', true)->count(),
                'publishedPosts' => Post::where('is_published', true)->count(),
                'lowStockItems' => InventoryItem::where('active', true)->whereColumn('current_stock', '<=', 'min_stock')->count(),
            ],
            'promotions' => (clone $activePromotions)->latest('start_date')->limit(5)->get()->map(fn (Promotion $promotion) => [
                'id' => $promotion->id,
                'title' => $promotion->title,
                'discount' => (float) $promotion->discount_percentage,
                'group' => $promotion->group?->name,
                'endDate' => $promotion->end_date->format('M j, Y'),
            ]),
            'lowStockItems' => InventoryItem::where('active', true)->whereColumn('current_stock', '<=', 'min_stock')
                ->orderBy('current_stock')->limit(5)->get(['id', 'name', 'current_stock', 'min_stock', 'unit']),
        ]);
    }
}
