<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeaturedProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_featured_endpoint_only_returns_featured_products(): void
    {
        $category = Category::create(['name' => 'Smoothies']);

        Product::create([
            'category_id' => $category->id,
            'name' => 'Featured Smoothie',
            'price' => 7.99,
            'featured' => true,
        ]);

        Product::create([
            'category_id' => $category->id,
            'name' => 'Regular Smoothie',
            'price' => 6.99,
            'featured' => false,
        ]);

        $this->getJson('/api/v1/products/featured')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Featured Smoothie')
            ->assertJsonPath('data.0.featured', true);

        $this->getJson('/api/v1/products?featured=true')
            ->assertOk()
            ->assertJsonCount(1, 'data');
    }
}
