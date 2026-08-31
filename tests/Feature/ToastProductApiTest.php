<?php

namespace Tests\Feature;

use App\Models\ToastProduct;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ToastProductApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test retrieving products listing.
     */
    public function test_can_list_active_toast_products(): void
    {
        // Create active and inactive products
        ToastProduct::create([
            'toast_guid' => 'guid-active-1',
            'name' => 'Burger Combo',
            'category_name' => 'Combos',
            'price' => 12.50,
            'image_url' => 'https://example.com/images/burger.jpg',
            'active' => true,
        ]);

        ToastProduct::create([
            'toast_guid' => 'guid-inactive-2',
            'name' => 'Secret Drink',
            'category_name' => 'Drinks',
            'price' => 2.50,
            'active' => false,
        ]);

        $response = $this->getJson('/api/v1/toast/products');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Burger Combo')
            ->assertJsonPath('data.0.category', 'Combos')
            ->assertJsonPath('data.0.image', 'https://example.com/images/burger.jpg')
            ->assertJsonPath('data.0.image_url', 'https://example.com/images/burger.jpg');
    }

    /**
     * Test filtering products by category name.
     */
    public function test_can_filter_toast_products_by_category(): void
    {
        ToastProduct::create([
            'toast_guid' => 'guid-1',
            'name' => 'Burger Combo',
            'category_name' => 'Combos',
            'price' => 12.50,
            'active' => true,
        ]);

        ToastProduct::create([
            'toast_guid' => 'guid-2',
            'name' => 'Coca Cola',
            'category_name' => 'Drinks',
            'price' => 2.50,
            'active' => true,
        ]);

        // Filter using 'category'
        $response = $this->getJson('/api/v1/toast/products?category=Drinks');
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Coca Cola');

        // Filter using 'category_name'
        $response = $this->getJson('/api/v1/toast/products?category_name=Combos');
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Burger Combo');
    }

    /**
     * Test searching products by name or PLU.
     */
    public function test_can_search_toast_products(): void
    {
        ToastProduct::create([
            'toast_guid' => 'guid-1',
            'name' => 'Cheeseburger',
            'plu' => '1001',
            'active' => true,
        ]);

        ToastProduct::create([
            'toast_guid' => 'guid-2',
            'name' => 'French Fries',
            'plu' => '2002',
            'active' => true,
        ]);

        // Search by name
        $response = $this->getJson('/api/v1/toast/products?search=cheese');
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'Cheeseburger');

        // Search by PLU
        $response = $this->getJson('/api/v1/toast/products?search=2002');
        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'French Fries');
    }

    /**
     * Test show endpoint by database ID.
     */
    public function test_can_retrieve_toast_product_by_id(): void
    {
        $product = ToastProduct::create([
            'toast_guid' => 'guid-pizza',
            'name' => 'Pepperoni Pizza',
            'price' => 14.99,
            'active' => true,
        ]);

        $response = $this->getJson("/api/v1/toast/products/{$product->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Pepperoni Pizza')
            ->assertJsonPath('data.toast_guid', 'guid-pizza');
    }

    /**
     * Test show endpoint by GUID.
     */
    public function test_can_retrieve_toast_product_by_guid(): void
    {
        $product = ToastProduct::create([
            'toast_guid' => 'guid-hotdog',
            'name' => 'Classic Hot Dog',
            'price' => 5.99,
            'active' => true,
        ]);

        $response = $this->getJson("/api/v1/toast/products/{$product->toast_guid}");

        $response->assertStatus(200)
            ->assertJsonPath('data.name', 'Classic Hot Dog')
            ->assertJsonPath('data.id', $product->id);
    }

    /**
     * Test retrieving categories with product counts.
     */
    public function test_can_list_categories_with_product_counts(): void
    {
        ToastProduct::create([
            'toast_guid' => 'guid-1',
            'name' => 'Burger',
            'category_name' => 'Burgers',
            'active' => true,
        ]);

        ToastProduct::create([
            'toast_guid' => 'guid-2',
            'name' => 'Double Burger',
            'category_name' => 'Burgers',
            'active' => true,
        ]);

        ToastProduct::create([
            'toast_guid' => 'guid-3',
            'name' => 'Milkshake',
            'category_name' => 'Shakes',
            'active' => true,
        ]);

        // Inactive product in a different category
        ToastProduct::create([
            'toast_guid' => 'guid-4',
            'name' => 'Secret Pizza',
            'category_name' => 'Pizzas',
            'active' => false,
        ]);

        $response = $this->getJson('/api/v1/toast/categories');

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data')
            ->assertExactJson([
                'data' => [
                    [
                        'name' => 'Burgers',
                        'products_count' => 2,
                    ],
                    [
                        'name' => 'Shakes',
                        'products_count' => 1,
                    ],
                ]
            ]);
    }
}
