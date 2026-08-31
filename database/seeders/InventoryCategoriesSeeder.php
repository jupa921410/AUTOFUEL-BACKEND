<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Siembra las categorías de inventario de producción.
 * Fuente: u623102705_admin (2).sql — dump 2026-05-19
 */
class InventoryCategoriesSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['id' =>  1, 'name' => 'Carnes y Aves',           'color' => '#ef4444', 'created_at' => '2026-05-12 00:23:02', 'updated_at' => '2026-05-12 00:23:02'],
            ['id' =>  2, 'name' => 'Mariscos',                'color' => '#0ea5e9', 'created_at' => '2026-05-12 00:23:02', 'updated_at' => '2026-05-12 00:23:02'],
            ['id' =>  3, 'name' => 'Lácteos y Huevos',        'color' => '#f59e0b', 'created_at' => '2026-05-12 00:23:02', 'updated_at' => '2026-05-12 00:23:02'],
            ['id' =>  4, 'name' => 'Vegetales y Verduras',    'color' => '#22c55e', 'created_at' => '2026-05-12 00:23:02', 'updated_at' => '2026-05-12 00:23:02'],
            ['id' =>  5, 'name' => 'Frutas',                  'color' => '#f97316', 'created_at' => '2026-05-12 00:23:02', 'updated_at' => '2026-05-12 00:23:02'],
            ['id' =>  6, 'name' => 'Granos y Cereales',       'color' => '#a78bfa', 'created_at' => '2026-05-12 00:23:02', 'updated_at' => '2026-05-12 00:23:02'],
            ['id' =>  7, 'name' => 'Aceites y Grasas',        'color' => '#facc15', 'created_at' => '2026-05-12 00:23:03', 'updated_at' => '2026-05-12 00:23:03'],
            ['id' =>  8, 'name' => 'Especias y Condimentos',  'color' => '#f43f5e', 'created_at' => '2026-05-12 00:23:03', 'updated_at' => '2026-05-12 00:23:03'],
            ['id' =>  9, 'name' => 'Salsas y Aderezos',       'color' => '#84cc16', 'created_at' => '2026-05-12 00:23:03', 'updated_at' => '2026-05-12 00:23:03'],
            ['id' => 10, 'name' => 'Bebidas',                 'color' => '#38bdf8', 'created_at' => '2026-05-12 00:23:03', 'updated_at' => '2026-05-12 00:23:03'],
            ['id' => 11, 'name' => 'Panadería y Repostería',  'color' => '#fb923c', 'created_at' => '2026-05-12 00:23:03', 'updated_at' => '2026-05-12 00:23:03'],
            ['id' => 12, 'name' => 'Limpieza e Higiene',      'color' => '#6366f1', 'created_at' => '2026-05-12 00:23:03', 'updated_at' => '2026-05-12 00:23:03'],
            ['id' => 13, 'name' => 'Empaques y Desechables',  'color' => '#64748b', 'created_at' => '2026-05-12 00:23:03', 'updated_at' => '2026-05-12 00:23:03'],
            ['id' => 14, 'name' => 'Utensilios y Equipos',    'color' => '#0f766e', 'created_at' => '2026-05-12 00:23:03', 'updated_at' => '2026-05-12 00:23:03'],
        ];

        foreach ($categories as $cat) {
            DB::table('inventory_categories')->updateOrInsert(['id' => $cat['id']], $cat);
        }

        $this->command->info('✓ Categorías de inventario sembradas: ' . count($categories));
    }
}
