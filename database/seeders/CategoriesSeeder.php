<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Siembra las categorías de productos del menú digital.
 * Fuente: u623102705_admin (2).sql — dump 2026-05-19
 */
class CategoriesSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['id' => 1,  'name' => 'Coffee & Hot Drinks',        'description' => null, 'created_at' => '2026-03-14 12:12:29', 'updated_at' => '2026-03-14 12:12:29'],
            ['id' => 2,  'name' => 'Breakfast & Toasts',         'description' => null, 'created_at' => '2026-03-14 12:12:29', 'updated_at' => '2026-03-14 12:12:29'],
            ['id' => 3,  'name' => 'Specialty Cuban Sandwiches', 'description' => null, 'created_at' => '2026-03-14 12:12:29', 'updated_at' => '2026-03-14 12:12:29'],
            ['id' => 4,  'name' => 'Empanadas & Pastries',       'description' => null, 'created_at' => '2026-03-14 12:12:29', 'updated_at' => '2026-05-01 17:37:34'],
            ['id' => 5,  'name' => 'Desserts',                   'description' => null, 'created_at' => '2026-03-14 12:12:29', 'updated_at' => '2026-03-14 12:12:29'],
            ['id' => 6,  'name' => 'Milkshakes & Juices',        'description' => null, 'created_at' => '2026-03-14 12:12:29', 'updated_at' => '2026-03-14 12:12:29'],
            ['id' => 7,  'name' => 'Sodas & Water',              'description' => null, 'created_at' => '2026-03-14 12:12:29', 'updated_at' => '2026-03-14 12:12:29'],
            ['id' => 8,  'name' => 'Bowls',                      'description' => null, 'created_at' => '2026-03-23 20:24:42', 'updated_at' => '2026-04-03 00:36:41'],
            ['id' => 10, 'name' => 'Salads',                     'description' => null, 'created_at' => '2026-04-03 00:36:44', 'updated_at' => '2026-04-03 00:36:44'],
            ['id' => 11, 'name' => 'Snacks',                     'description' => null, 'created_at' => '2026-04-25 02:15:24', 'updated_at' => '2026-04-25 02:15:42'],
        ];

        foreach ($categories as $cat) {
            DB::table('categories')->updateOrInsert(['id' => $cat['id']], $cat);
        }

        $this->command->info('✓ Categorías sembradas: ' . count($categories));
    }
}
