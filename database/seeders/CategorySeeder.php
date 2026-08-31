<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Coffee & Hot Drinks',
            'Breakfast & Toasts',
            'Specialty Cuban Sandwiches',
            'Empanadas & Snacks',
            'Desserts',
            'Milkshakes & Juices',
            'Sodas & Water',
        ];

        foreach ($categories as $name) {
            Category::firstOrCreate(['name' => $name]);
        }
    }
}
