<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            // ── Coffee & Hot Drinks ──────────────────────────────────────────
            [
                'name'        => 'Café con Leche (16 oz)',
                'description' => 'El auténtico sabor del 305. Espresso fuerte y dulce, perfecto para empezar la mañana con energía.',
                'price'       => 4.95,
                'image'       => 'images/cafe_con_leche.png',
                'category'    => 'Coffee & Hot Drinks',
            ],
            [
                'name'        => 'Iced Café con Leche (16 oz)',
                'description' => 'El clásico café con leche cubano, servido sobre hielo para refrescarte.',
                'price'       => 4.95,
                'image'       => 'images/iced_cafe_con_leche.png',
                'category'    => 'Coffee & Hot Drinks',
            ],
            [
                'name'        => 'Cortadito (4 oz)',
                'description' => 'Un shot de espresso cortado con la cantidad perfecta de leche vaporizada.',
                'price'       => 2.95,
                'image'       => 'images/cortadito.png',
                'category'    => 'Coffee & Hot Drinks',
            ],
            [
                'name'        => '305 Colada (4 oz)',
                'description' => 'Trago de espresso cubano con espuma dulce (espumita), ideal para compartir.',
                'price'       => 1.95,
                'image'       => 'images/305_colada.png',
                'category'    => 'Coffee & Hot Drinks',
            ],

            // ── Breakfast & Toasts ──────────────────────────────────────────
            [
                'name'        => 'Egg and Cheese Sandwich',
                'description' => 'Huevos y queso (Provolone, American o Swiss) en pan cubano tostado.',
                'price'       => 7.95,
                'image'       => 'images/egg_cheese_sandwich.png',
                'category'    => 'Breakfast & Toasts',
            ],
            [
                'name'        => 'Meat, Egg and Cheese Sandwich',
                'description' => 'Sandwich con huevo, queso y tu elección de proteína (Bacon, Ham, Sausage o Turkey).',
                'price'       => 8.95,
                'image'       => 'images/meat_egg_cheese_sandwich.png',
                'category'    => 'Breakfast & Toasts',
            ],
            [
                'name'        => '305 Omelette Platter',
                'description' => 'Omelette servido con queso a elegir (Provolone, American, o Swiss).',
                'price'       => 10.95,
                'image'       => 'images/omelette_platter.png',
                'category'    => 'Breakfast & Toasts',
            ],
            [
                'name'        => 'Cuban Toast (Tostada)',
                'description' => 'Pan cubano clásico, tostado con mantequilla. (Opción de agregar queso +$1.00).',
                'price'       => 2.95,
                'image'       => 'images/cuban_toast.png',
                'category'    => 'Breakfast & Toasts',
            ],

            // ── Specialty Cuban Sandwiches ──────────────────────────────────
            [
                'name'        => 'Classic Cuban Sandwich (8")',
                'description' => 'Jamón, cerdo asado, queso suizo, pepinillos y mostaza prensado a la perfección.',
                'price'       => 11.95,
                'image'       => 'images/classic_cuban_sandwich.png',
                'category'    => 'Specialty Cuban Sandwiches',
            ],
            [
                'name'        => 'Midnight Sandwich / Media Noche (6")',
                'description' => 'Jamón, cerdo asado, queso suizo, pepinillos y mostaza en pan dulce.',
                'price'       => 10.95,
                'image'       => 'images/midnight_sandwich.png',
                'category'    => 'Specialty Cuban Sandwiches',
            ],
            [
                'name'        => 'Roasted Pork Sandwich / Pan con Lechón (8")',
                'description' => 'Jugoso cerdo asado y cebollas salteadas en pan cubano tostado.',
                'price'       => 11.95,
                'image'       => 'images/pan_lechon.png',
                'category'    => 'Specialty Cuban Sandwiches',
            ],
            [
                'name'        => 'Steak Sandwich / Pan con Bistec (8")',
                'description' => 'Bistec de palomilla, cebollas salteadas, queso suizo, lechuga, tomate, mayonesa y papitas.',
                'price'       => 12.95,
                'image'       => 'images/steak_sandwich.png',
                'category'    => 'Specialty Cuban Sandwiches',
            ],
            [
                'name'        => 'Croquette Sandwich (8")',
                'description' => 'Croquetas de jamón emparedadas con jamón en rebanadas, queso suizo, pepinillos y mostaza.',
                'price'       => 11.95,
                'image'       => 'images/croquette_sandwich.png',
                'category'    => 'Specialty Cuban Sandwiches',
            ],
            [
                'name'        => 'Ham & Cheese Sandwich (8")',
                'description' => 'Jamón, queso suizo, lechuga, tomate, mayonesa y mostaza.',
                'price'       => 11.95,
                'image'       => 'images/classic_cuban_sandwich.png',
                'category'    => 'Specialty Cuban Sandwiches',
            ],
            [
                'name'        => 'Turkey & Cheese Sandwich (8")',
                'description' => 'Pavo, queso suizo, lechuga, tomate, mayonesa y mostaza.',
                'price'       => 11.95,
                'image'       => 'images/pan_lechon.png',
                'category'    => 'Specialty Cuban Sandwiches',
            ],
            [
                'name'        => 'Elena Ruth Sandwich',
                'description' => 'Jamón de pavo seleccionado, queso crema suave y mermelada de guayaba premium en pan de Medianoche.',
                'price'       => 11.95,
                'image'       => 'images/midnight_sandwich.png',
                'category'    => 'Specialty Cuban Sandwiches',
            ],

            // ── Empanadas & Snacks ──────────────────────────────────────────
            [
                'name'        => 'Empanadas',
                'description' => 'Rellenas de Beef, Chicken, Ham & Cheese, Spinach, o Pork BBQ. Fritas a la perfección dorada.',
                'price'       => 3.95,
                'image'       => 'images/empanadas.png',
                'category'    => 'Empanadas & Snacks',
            ],
            [
                'name'        => 'Ham Croquette',
                'description' => 'Croqueta de jamón frita y dorada.',
                'price'       => 0.50,
                'image'       => 'images/tequenos.png',
                'category'    => 'Empanadas & Snacks',
            ],
            [
                'name'        => 'Chicken Croquette',
                'description' => 'Croqueta de pollo frita y dorada.',
                'price'       => 0.50,
                'image'       => 'images/tequenos.png',
                'category'    => 'Empanadas & Snacks',
            ],
            [
                'name'        => 'Guava Pastry (Pastelito)',
                'description' => 'Masa de hojaldre recién horneada, rellena de dulce de guayaba.',
                'price'       => 3.00,
                'image'       => 'images/pastelito.png',
                'category'    => 'Empanadas & Snacks',
            ],
            [
                'name'        => 'Assorted Chips',
                'description' => 'Variedad de papitas y snacks tradicionales.',
                'price'       => 1.50,
                'image'       => 'images/empanadas.png',
                'category'    => 'Empanadas & Snacks',
            ],

            // ── Desserts ────────────────────────────────────────────────────
            [
                'name'        => 'Specialty Flan',
                'description' => 'Postre de flan de caramelo, suave y cremoso.',
                'price'       => 3.95,
                'image'       => 'images/pastelito.png',
                'category'    => 'Desserts',
            ],
            [
                'name'        => 'Tres Leches Cake',
                'description' => 'Bizcocho bañado en tres tipos de leche, cubierto con merengue.',
                'price'       => 3.95,
                'image'       => 'images/pastelito.png',
                'category'    => 'Desserts',
            ],
            [
                'name'        => 'Chocolate Chip Cookies',
                'description' => 'Galletas con chispas de chocolate recién horneadas.',
                'price'       => 0.95,
                'image'       => 'images/pastelito.png',
                'category'    => 'Desserts',
            ],

            // ── Milkshakes & Juices ─────────────────────────────────────────
            [
                'name'        => 'Milkshakes (16 oz)',
                'description' => 'Mango, Guava, Mamey, o Malted Milk.',
                'price'       => 5.95,
                'image'       => 'images/iced_cafe_con_leche.png',
                'category'    => 'Milkshakes & Juices',
            ],
            [
                'name'        => 'Fresh Squeezed Orange Juice (16 oz)',
                'description' => 'Jugo de naranja natural, cien por ciento fresco.',
                'price'       => 6.50,
                'image'       => 'images/iced_cafe_con_leche.png',
                'category'    => 'Milkshakes & Juices',
            ],
            [
                'name'        => 'Fruit Juices (16 oz)',
                'description' => 'Refrescante jugo natural: Mango, Guava, o Pineapple.',
                'price'       => 5.95,
                'image'       => 'images/iced_cafe_con_leche.png',
                'category'    => 'Milkshakes & Juices',
            ],

            // ── Sodas & Water ───────────────────────────────────────────────
            [
                'name'        => 'Canned Sodas',
                'description' => 'Coca-Cola, Fanta, Sprite.',
                'price'       => 2.00,
                'image'       => 'images/iced_cafe_con_leche.png',
                'category'    => 'Sodas & Water',
            ],
            [
                'name'        => 'Latin Sodas',
                'description' => 'Jupiña, Coco Rico, Cola Champagne.',
                'price'       => 1.50,
                'image'       => 'images/iced_cafe_con_leche.png',
                'category'    => 'Sodas & Water',
            ],
            [
                'name'        => 'Bottled Water',
                'description' => 'Agua mineral embotellada.',
                'price'       => 1.00,
                'image'       => 'images/iced_cafe_con_leche.png',
                'category'    => 'Sodas & Water',
            ],
        ];

        foreach ($products as $data) {
            $category = Category::where('name', $data['category'])->first();
            if (!$category) continue;

            Product::firstOrCreate(
                ['name' => $data['name']],
                [
                    'category_id' => $category->id,
                    'description' => $data['description'],
                    'price'       => $data['price'],
                    'image'       => $data['image'],
                ]
            );
        }
    }
}
