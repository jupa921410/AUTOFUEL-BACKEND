<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class FeaturedProductSeeder extends Seeder
{
    public function run(): void
    {
        Product::whereIn('name', [
            'Chocolate Berry Bliss (16 oz)',
            'Green Goodness (16 oz)',
            'Classic Açaí (Regular)',
            'Protein Cold Brew (16 oz)',
            'Avocado Toast',
        ])->update(['featured' => true]);
    }
}
