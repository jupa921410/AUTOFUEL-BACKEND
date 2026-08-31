<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Siembra los artículos de inventario de producción.
 * Fuente: u623102705_admin (2).sql — dump 2026-05-19
 */
class InventoryItemsSeeder extends Seeder
{
    public function run(): void
    {
        // Omitimos id=3 ('fdgfd') que era un registro de prueba
        $items = [
            ['id' =>  4, 'inventory_category_id' => null, 'name' => 'Pan Cubano 8"',          'unit' => 'unidad', 'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' =>  5, 'inventory_category_id' => null, 'name' => 'Pan de Medianoche',       'unit' => 'unidad', 'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' =>  6, 'inventory_category_id' => null, 'name' => 'Lechón Asado',            'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' =>  7, 'inventory_category_id' => null, 'name' => 'Jamón',                   'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' =>  8, 'inventory_category_id' => null, 'name' => 'Queso Suizo',             'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' =>  9, 'inventory_category_id' => null, 'name' => 'Pepinillos',              'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 10, 'inventory_category_id' => null, 'name' => 'Mostaza Amarilla',        'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 11, 'inventory_category_id' => null, 'name' => 'Mantequilla',             'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 12, 'inventory_category_id' => null, 'name' => 'Palomilla de Res',        'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 13, 'inventory_category_id' => null, 'name' => 'Cebolla Blanca',          'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 14, 'inventory_category_id' => null, 'name' => 'Papitas (Potato Sticks)', 'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 15, 'inventory_category_id' => null, 'name' => 'Tomate',                  'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 16, 'inventory_category_id' => null, 'name' => 'Lechuga Iceberg',         'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 17, 'inventory_category_id' => null, 'name' => 'Mayonesa',                'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 18, 'inventory_category_id' => null, 'name' => 'Jamon de Pavo',           'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 19, 'inventory_category_id' => null, 'name' => 'Pechuga de Pavo',         'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 20, 'inventory_category_id' => null, 'name' => 'Queso Crema',             'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 21, 'inventory_category_id' => null, 'name' => 'Mermelada de Guayaba',    'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 22, 'inventory_category_id' => null, 'name' => 'Cook Bacon',              'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 23, 'inventory_category_id' => null, 'name' => 'Ham Croquette',           'unit' => 'unidad', 'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 24, 'inventory_category_id' => null, 'name' => 'Egg',                     'unit' => 'unidad', 'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 25, 'inventory_category_id' => null, 'name' => 'Cheese',                  'unit' => 'g',      'current_stock' => 21, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 26, 'inventory_category_id' => null, 'name' => 'Pork',                    'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 27, 'inventory_category_id' => null, 'name' => 'Green pepers',            'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 28, 'inventory_category_id' => null, 'name' => 'Chopped tomato',          'unit' => 'g',      'current_stock' =>  5, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 29, 'inventory_category_id' => null, 'name' => 'Protein',                 'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 30, 'inventory_category_id' => null, 'name' => 'Coffee',                  'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 31, 'inventory_category_id' => null, 'name' => 'Sugar',                   'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 32, 'inventory_category_id' => null, 'name' => 'Steam milk',              'unit' => 'oz',     'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 33, 'inventory_category_id' => null, 'name' => 'Cold milk',               'unit' => 'oz',     'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 34, 'inventory_category_id' => null, 'name' => 'Ice',                     'unit' => 'oz',     'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 35, 'inventory_category_id' => null, 'name' => 'Frijoles',                'unit' => 'kg',     'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 36, 'inventory_category_id' => null, 'name' => 'Water',                   'unit' => 'oz',     'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 37, 'inventory_category_id' => null, 'name' => 'Onion',                   'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 38, 'inventory_category_id' => null, 'name' => 'Garlic cloves',           'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 39, 'inventory_category_id' => null, 'name' => 'Oil',                     'unit' => 'oz',     'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 40, 'inventory_category_id' => null, 'name' => 'Comino en polvo',         'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 41, 'inventory_category_id' => null, 'name' => 'Granulated Garlic',       'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 42, 'inventory_category_id' => null, 'name' => 'Oregano seco',            'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 43, 'inventory_category_id' => null, 'name' => 'Sazon completo Badia',    'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 44, 'inventory_category_id' => null, 'name' => 'Sal',                     'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 45, 'inventory_category_id' => null, 'name' => 'Hojas de Laurel',         'unit' => 'unidad', 'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 46, 'inventory_category_id' => null, 'name' => 'Vino seco',               'unit' => 'oz',     'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 47, 'inventory_category_id' => null, 'name' => 'Rice',                    'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 48, 'inventory_category_id' => null, 'name' => 'Black beans',             'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 49, 'inventory_category_id' => null, 'name' => 'Maduros',                 'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 50, 'inventory_category_id' => null, 'name' => 'Cucumber',                'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 51, 'inventory_category_id' => null, 'name' => 'Sweet plantains',         'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
            ['id' => 52, 'inventory_category_id' => null, 'name' => 'Parmesan cheese',         'unit' => 'g',      'current_stock' => 11, 'min_stock' => 10, 'cost_per_unit' => null, 'active' => 1],
        ];

        $now = now()->toDateTimeString();
        foreach ($items as &$item) {
            $item['notes']      = null;
            $item['created_at'] = '2026-05-12 22:49:36';
            $item['updated_at'] = '2026-05-12 22:55:35';
        }

        foreach ($items as $item) {
            DB::table('inventory_items')->updateOrInsert(['id' => $item['id']], $item);
        }

        $this->command->info('✓ Artículos de inventario sembrados: ' . count($items));
    }
}
