<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $this->call([
            // 1 - Admin and delivery users
            UsersSeeder::class,

            // Menu board: smoothies, refreshers, bowls, teas, coffee and snacks
            AutoFuelMenuSeeder::class,
            ProvidedMenuSeeder::class,
            MenuScreenSeeder::class,

            // Published content for the cafe blog
            BlogPostSeeder::class,

            // 2 - Web catalog categories and products
            CategoriesSeeder::class,
            ProductsSeeder::class,
            FeaturedProductSeeder::class,
            PromotionAndStreamingSeeder::class,

            // 3 - Inventory categories and items
            InventoryCategoriesSeeder::class,
            InventoryItemsSeeder::class,

            // 4 - Production recipes mapped to Toast
            ProductionRecipesSeeder::class,

            // 5 - Public cafe reviews
            ReviewSeeder::class,

            // 6 - Business hours
            HorarioSeeder::class,
        ]);
    }
}
