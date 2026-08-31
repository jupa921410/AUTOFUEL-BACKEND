<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\MenuScreen;
use Illuminate\Database\Seeder;

class MenuScreenSeeder extends Seeder
{
    public function run(): void
    {
        $screens = [
            ['name' => 'Menu Screen 1', 'slug' => 'screen-1', 'position' => 1, 'description' => 'Smoothies', 'categories' => ['Signature Smoothies', 'Performance Smoothies']],
            ['name' => 'Menu Screen 2', 'slug' => 'screen-2', 'position' => 2, 'description' => 'Refreshers, teas, and coffee', 'categories' => ['Refreshers & Lemonades', 'Performance Teas', 'Protein Coffee & More']],
            ['name' => 'Menu Screen 3', 'slug' => 'screen-3', 'position' => 3, 'description' => 'Bowls, bites, and wellness', 'categories' => ['Açaí Bowls', 'Fuel Bites', 'Fuel Lab Favorites', 'Fuel Injections']],
        ];

        foreach ($screens as $data) {
            $screen = MenuScreen::updateOrCreate(
                ['slug' => $data['slug']],
                ['name' => $data['name'], 'description' => $data['description'], 'position' => $data['position'], 'active' => true]
            );
            $ids = Category::whereIn('name', $data['categories'])->pluck('id', 'name');
            $sync = [];
            foreach ($data['categories'] as $position => $name) {
                if (isset($ids[$name])) $sync[$ids[$name]] = ['position' => $position];
            }
            $screen->categories()->sync($sync);
        }
    }
}
