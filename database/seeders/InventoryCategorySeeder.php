<?php

namespace Database\Seeders;

use App\Models\InventoryCategory;
use Illuminate\Database\Seeder;

class InventoryCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name' => 'Carnes y Aves',      'color' => '#ef4444'],
            ['name' => 'Mariscos',            'color' => '#0ea5e9'],
            ['name' => 'Lácteos y Huevos',   'color' => '#f59e0b'],
            ['name' => 'Vegetales y Verduras','color' => '#22c55e'],
            ['name' => 'Frutas',              'color' => '#f97316'],
            ['name' => 'Granos y Cereales',   'color' => '#a78bfa'],
            ['name' => 'Aceites y Grasas',    'color' => '#facc15'],
            ['name' => 'Especias y Condimentos','color' => '#f43f5e'],
            ['name' => 'Salsas y Aderezos',   'color' => '#84cc16'],
            ['name' => 'Bebidas',             'color' => '#38bdf8'],
            ['name' => 'Panadería y Repostería','color' => '#fb923c'],
            ['name' => 'Limpieza e Higiene',  'color' => '#6366f1'],
            ['name' => 'Empaques y Desechables','color' => '#64748b'],
            ['name' => 'Utensilios y Equipos','color' => '#0f766e'],
        ];

        foreach ($categories as $cat) {
            InventoryCategory::updateOrCreate(['name' => $cat['name']], ['color' => $cat['color']]);
        }
    }
}
