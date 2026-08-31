<?php

namespace Database\Seeders;

use App\Models\Catering;
use App\Models\CateringProduct;
use Illuminate\Database\Seeder;

class CateringSeeder extends Seeder
{
    public function run(): void
    {
        // ── Catering Products (ingredientes/items del menú de catering) ──────

        $products = [
            [
                'name'        => 'Classic Cuban Sandwiches (Tray)',
                'description' => 'Bandeja de pan cubano clásico: jamón, cerdo asado, queso suizo, pepinillos y mostaza. Ideal para grupos.',
                'price'       => 55.00,
                'image'       => 'caterings/catering_sandwiches.png',
            ],
            [
                'name'        => 'Assorted Empanadas & Croquetas',
                'description' => 'Surtido de empanadas (res, pollo, jamón y queso) y croquetas de jamón. Perfecto para picar.',
                'price'       => 35.00,
                'image'       => 'caterings/catering_breakfast.png',
            ],
            [
                'name'        => 'Breakfast Platter',
                'description' => 'Tostadas cubanas, pastelitos de guayaba y sándwiches de huevo y queso. El desayuno perfecto para el equipo.',
                'price'       => 40.00,
                'image'       => 'caterings/catering_breakfast.png',
            ],
            [
                'name'        => 'Coffee & Hot Drinks Station',
                'description' => 'Estación de café: Cortadito, Café con Leche y Colada cubana. Incluye azúcar, leche y vasitos.',
                'price'       => 30.00,
                'image'       => 'caterings/catering_coffee.png',
            ],
            [
                'name'        => 'Dessert Tray',
                'description' => 'Bandeja de postres: Flan de caramelo, Tres Leches, Pastelitos de Guayaba y Galletas caseras.',
                'price'       => 45.00,
                'image'       => 'caterings/catering_desserts.png',
            ],
            [
                'name'        => 'Beverage Package',
                'description' => 'Surtido de bebidas: jugos naturales (naranja, mango, guayaba), sodas latinas y agua embotellada.',
                'price'       => 25.00,
                'image'       => 'caterings/catering_coffee.png',
            ],
        ];

        $createdProducts = [];
        foreach ($products as $data) {
            $createdProducts[$data['name']] = CateringProduct::firstOrCreate(
                ['name' => $data['name']],
                [
                    'description' => $data['description'],
                    'price'       => $data['price'],
                    'image'       => $data['image'],
                ]
            );
        }

        // ── Catering Packages ─────────────────────────────────────────────────

        $caterings = [
            [
                'name'        => 'Desayuno Corporativo',
                'description' => 'Perfecto para reuniones matutinas de hasta 15 personas. Incluye desayuno completo, estación de café y bebidas.',
                'pax'         => 15,
                'price'       => 180.00,
                'products'    => [
                    'Breakfast Platter',
                    'Coffee & Hot Drinks Station',
                    'Beverage Package',
                ],
            ],
            [
                'name'        => 'Paquete Oficina (25 pax)',
                'description' => 'Ideal para almuerzos de trabajo. Sándwiches cubanos, snacks variados, postres y bebidas para 25 personas.',
                'pax'         => 25,
                'price'       => 350.00,
                'products'    => [
                    'Classic Cuban Sandwiches (Tray)',
                    'Assorted Empanadas & Croquetas',
                    'Dessert Tray',
                    'Beverage Package',
                ],
            ],
            [
                'name'        => 'Fiesta Completa (50 pax)',
                'description' => 'El paquete todo incluido para eventos grandes. Desayuno, snacks, café, postres y bebidas para hasta 50 personas.',
                'pax'         => 50,
                'price'       => 650.00,
                'products'    => [
                    'Breakfast Platter',
                    'Classic Cuban Sandwiches (Tray)',
                    'Assorted Empanadas & Croquetas',
                    'Coffee & Hot Drinks Station',
                    'Dessert Tray',
                    'Beverage Package',
                ],
            ],
            [
                'name'        => 'Coffee Break Express',
                'description' => 'Estación de café cubano con pastelitos y galleticas. Perfecto para pausas activas en reuniones de 10 personas.',
                'pax'         => 10,
                'price'       => 95.00,
                'products'    => [
                    'Coffee & Hot Drinks Station',
                    'Dessert Tray',
                ],
            ],
        ];

        foreach ($caterings as $data) {
            $catering = Catering::firstOrCreate(
                ['name' => $data['name']],
                [
                    'description' => $data['description'],
                    'pax'         => $data['pax'],
                    'price'       => $data['price'],
                ]
            );

            // Attach products (sync to avoid duplicates on re-run)
            $productIds = collect($data['products'])
                ->map(fn($name) => $createdProducts[$name]->id ?? null)
                ->filter()
                ->toArray();

            $catering->cateringProducts()->sync($productIds);
        }
    }
}
