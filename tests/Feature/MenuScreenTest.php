<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\MenuScreen;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MenuScreenTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_a_menu_screen_with_ordered_categories(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $first = Category::create(['name' => 'Smoothies']);
        $second = Category::create(['name' => 'Bowls']);

        $response = $this->actingAs($user)->post('/menu-screens', [
            'name' => 'Main TV', 'slug' => '', 'description' => 'Front counter',
            'position' => 1, 'active' => true, 'category_ids' => [$second->id, $first->id],
        ]);

        $response->assertRedirect();
        $screen = MenuScreen::where('slug', 'main-tv')->firstOrFail();
        $this->assertSame([$second->id, $first->id], $screen->categories()->pluck('categories.id')->all());
    }

    public function test_public_api_returns_a_screen_with_categories_and_products(): void
    {
        $category = Category::create(['name' => 'Smoothies']);
        Product::create(['category_id' => $category->id, 'name' => 'Berry Smoothie', 'price' => 7.99, 'image' => 'images/test.jpg']);
        $screen = MenuScreen::create(['name' => 'Screen 1', 'slug' => 'screen-1', 'position' => 1, 'active' => true]);
        $screen->categories()->attach($category->id, ['position' => 0]);

        $this->getJson('/api/v1/menu-screens/screen-1')
            ->assertOk()
            ->assertJsonPath('data.slug', 'screen-1')
            ->assertJsonPath('data.categories.0.name', 'Smoothies')
            ->assertJsonPath('data.categories.0.products.0.name', 'Berry Smoothie');
    }

    public function test_admin_can_narrow_a_category_down_to_specific_products(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $category = Category::create(['name' => 'Smoothies']);
        $keep = Product::create(['category_id' => $category->id, 'name' => 'Berry Smoothie', 'price' => 7.99, 'image' => 'images/test.jpg']);
        $drop = Product::create(['category_id' => $category->id, 'name' => 'Green Smoothie', 'price' => 7.99, 'image' => 'images/test.jpg']);

        $response = $this->actingAs($user)->post('/menu-screens', [
            'name' => 'Main TV', 'slug' => '', 'description' => null,
            'position' => 1, 'active' => true,
            'category_ids' => [$category->id],
            'product_ids' => [$keep->id],
        ]);

        $response->assertRedirect();
        $screen = MenuScreen::where('slug', 'main-tv')->firstOrFail();
        $this->assertSame([$keep->id], $screen->products()->pluck('products.id')->all());

        // The public API should only surface the picked product, not the dropped one.
        $this->getJson('/api/v1/menu-screens/main-tv')
            ->assertOk()
            ->assertJsonCount(1, 'data.categories.0.products')
            ->assertJsonPath('data.categories.0.products.0.name', 'Berry Smoothie');

        $this->assertDatabaseMissing('menu_screen_product', ['menu_screen_id' => $screen->id, 'product_id' => $drop->id]);
    }

    public function test_menu_screen_falls_back_to_every_product_when_none_are_picked(): void
    {
        $category = Category::create(['name' => 'Smoothies']);
        Product::create(['category_id' => $category->id, 'name' => 'Berry Smoothie', 'price' => 7.99, 'image' => 'images/test.jpg']);
        Product::create(['category_id' => $category->id, 'name' => 'Green Smoothie', 'price' => 7.99, 'image' => 'images/test.jpg']);
        $screen = MenuScreen::create(['name' => 'Screen 2', 'slug' => 'screen-2', 'position' => 1, 'active' => true]);
        $screen->categories()->attach($category->id, ['position' => 0]);

        $this->getJson('/api/v1/menu-screens/screen-2')
            ->assertOk()
            ->assertJsonCount(2, 'data.categories.0.products');
    }

    public function test_admin_can_set_a_category_to_the_photo_slider_layout(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $category = Category::create(['name' => 'Smoothies']);

        $response = $this->actingAs($user)->post('/menu-screens', [
            'name' => 'Main TV', 'slug' => '', 'description' => null, 'active' => true,
            'category_ids' => [$category->id],
            'category_layouts' => [$category->id => 'slider'],
        ]);

        $response->assertRedirect();
        $screen = MenuScreen::where('slug', 'main-tv')->firstOrFail();
        $this->assertSame('slider', $screen->categories()->first()->pivot->layout);

        $this->getJson('/api/v1/menu-screens/main-tv')
            ->assertOk()
            ->assertJsonPath('data.categories.0.layout', 'slider');
    }

    public function test_category_layout_defaults_to_list(): void
    {
        $category = Category::create(['name' => 'Smoothies']);
        $screen = MenuScreen::create(['name' => 'Screen 3', 'slug' => 'screen-3', 'position' => 1, 'active' => true]);
        $screen->categories()->attach($category->id, ['position' => 0]);

        $this->getJson('/api/v1/menu-screens/screen-3')
            ->assertOk()
            ->assertJsonPath('data.categories.0.layout', 'list');
    }

    public function test_admin_created_screen_ignores_client_supplied_position(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $category = Category::create(['name' => 'Smoothies']);
        MenuScreen::create(['name' => 'Existing', 'slug' => 'existing', 'position' => 5, 'active' => true]);

        $response = $this->actingAs($user)->post('/menu-screens', [
            'name' => 'New Screen', 'slug' => '', 'description' => null, 'active' => true,
            'position' => 999, // should be ignored — position is auto-assigned now
            'category_ids' => [$category->id],
        ]);

        $response->assertRedirect();
        $screen = MenuScreen::where('slug', 'new-screen')->firstOrFail();
        $this->assertSame(6, $screen->position);
    }
}
