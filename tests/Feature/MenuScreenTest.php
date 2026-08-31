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
}
