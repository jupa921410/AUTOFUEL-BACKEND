<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Database\Seeders\ProvidedMenuSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProvidedMenuSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_loads_the_provided_menu_categories_and_products(): void
    {
        $this->seed(ProvidedMenuSeeder::class);

        $expectedCategories = [
            'Smoothies & Blends', 'Fresh Juices & Fruit', 'Hot Drinks', 'Drinks',
            'Breakfast & Bakery', 'Soups & Salads', 'Snacks & Protein',
        ];

        $this->assertSame(7, Category::whereIn('name', $expectedCategories)->count());
        $this->assertSame(43, Product::whereHas('category', fn ($query) => $query->whereIn('name', $expectedCategories))->count());
        $this->assertDatabaseHas('products', ['name' => 'Make Your Own Smoothie', 'price' => 7.00]);
        $this->assertDatabaseHas('products', ['name' => 'Autumn Glow', 'price' => 10.00]);
        $this->assertDatabaseHas('products', ['name' => 'Tomato Soup', 'price' => 5.00]);
        $this->assertDatabaseHas('products', ['name' => 'Veggie Straws', 'price' => 2.50]);
    }
}
