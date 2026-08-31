<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ProductIngredientSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $ingredients = [
            'Pan Cubano 8"' => 'unidad',
            'Pan de Medianoche' => 'unidad',
            'Lechón Asado' => 'g',
            'Jamón' => 'g',
            'Queso Suizo' => 'g',
            'Pepinillos' => 'g',
            'Mostaza Amarilla' => 'g',
            'Mantequilla' => 'g',
            'Palomilla de Res' => 'g',
            'Cebolla Blanca' => 'g',
            'Papitas (Potato Sticks)' => 'g',
            'Tomate' => 'g',
            'Lechuga Iceberg' => 'g',
            'Mayonesa' => 'g',
            'Jamon de Pavo' => 'g',
            'Pechuga de Pavo' => 'g',
            'Queso Crema' => 'g',
            'Mermelada de Guayaba' => 'g',
            'Cook Bacon' => 'g',
            'Ham Croquette' => 'unidad',
            'Egg' => 'unidad',
            'Cheese' => 'g',
            'Pork' => 'g',
            'Green pepers' => 'g',
            'Chopped tomato' => 'g',
            'Protein' => 'g',
            'Coffee' => 'g',
            'Sugar' => 'g',
            'Steam milk' => 'oz',
            'Cold milk' => 'oz',
            'Ice' => 'oz',
            'Frijoles' => 'kg',
            'Water' => 'oz',
            'Onion' => 'g',
            'Garlic cloves' => 'g',
            'Oil' => 'oz',
            'Comino en polvo' => 'g',
            'Granulated Garlic' => 'g',
            'Oregano seco' => 'g',
            'Sazon completo Badia' => 'g',
            'Sal' => 'g',
            'Hojas de Laurel' => 'unidad',
            'Vino seco' => 'oz',
            'Rice' => 'g',
            'Black beans' => 'g',
            'Maduros' => 'g',
            'Cucumber' => 'g',
            'Sweet plantains' => 'g',
            'Parmesan cheese' => 'g',
        ];

        $inventoryItems = [];
        foreach ($ingredients as $name => $unit) {
            $inventoryItems[$name] = \App\Models\InventoryItem::firstOrCreate(
                ['name' => $name],
                [
                    'unit' => $unit,
                    'current_stock' => 0,
                    'min_stock' => 10,
                    'active' => true,
                ]
            );
        }

        $recipes = [
            // SÁNDWICHES
            'Classic Cuban Sandwich (8")' => [
                'Pan Cubano 8"' => 1,
                'Lechón Asado' => 70,
                'Jamón' => 50,
                'Queso Suizo' => 35,
                'Pepinillos' => 12,
                'Mostaza Amarilla' => 10,
                'Mantequilla' => 8,
            ],
            'Steak Sandwich / Pan con Bistec (8")' => [
                'Pan Cubano 8"' => 1,
                'Palomilla de Res' => 120,
                'Cebolla Blanca' => 40,
                'Papitas (Potato Sticks)' => 20,
                'Tomate' => 30,
                'Lechuga Iceberg' => 15,
                'Mantequilla' => 10,
                'Mayonesa' => 15,
            ],
            'Ham & Cheese Sandwich (8")' => [
                'Pan Cubano 8"' => 1,
                'Jamón' => 90,
                'Queso Suizo' => 40,
                'Tomate' => 40,
                'Lechuga Iceberg' => 20,
                'Mayonesa' => 15,
                'Mantequilla' => 10,
                'Mostaza Amarilla' => 15,
            ],
            'Turkey & Cheese Sandwich (8")' => [
                'Pan Cubano 8"' => 1,
                'Jamon de Pavo' => 100,
                'Queso Suizo' => 40,
                'Mayonesa' => 15,
                'Mostaza Amarilla' => 10, // Assuming Mostaza is Mostaza Amarilla
                'Lechuga Iceberg' => 20,
                'Tomate' => 40,
                'Mantequilla' => 10,
            ],
            'Elena Ruth Sandwich' => [
                'Pan de Medianoche' => 1,
                'Pechuga de Pavo' => 100,
                'Queso Crema' => 40,
                'Mermelada de Guayaba' => 30,
                'Mantequilla' => 8,
            ],
            'Midnight Sandwich / Media Noche (6")' => [ // Assuming Media noche sándwich is this
                'Pan de Medianoche' => 1,
                'Lechón Asado' => 70,
                'Jamón' => 50,
                'Queso Suizo' => 35,
                'Pepinillos' => 12,
                'Mostaza Amarilla' => 10,
                'Mantequilla' => 8,
            ],
            'BLT' => [
                'Pan Cubano 8"' => 1,
                'Lechuga Iceberg' => 20,
                'Tomate' => 40,
                'Mayonesa' => 15,
                'Cook Bacon' => 70,
            ],
            'Club Sandwich' => [
                'Pan Cubano 8"' => 1,
                'Pechuga de Pavo' => 90, // Assuming Pavo is Pechuga de Pavo
                'Jamón' => 70,
                'Queso Suizo' => 50,
                'Cook Bacon' => 35, // Assuming Bacon (cocinado) is Cook Bacon
                'Tomate' => 50,
                'Lechuga Iceberg' => 20, // Assuming Lechuga is Lechuga Iceberg
                'Mayonesa' => 15,
                'Mantequilla' => 5,
            ],
            // Roasted Pork Sandwich
            'Roasted Pork Sandwich / Pan con Lechón (8")' => [
                'Pan Cubano 8"' => 1,
                'Lechón Asado' => 180, // Assuming Lechon is Lechón Asado
                'Cebolla Blanca' => 40, // Assuming Salted onion is Cebolla Blanca or similar, using Cebolla Blanca
            ],
            'Croquette Sandwich (8")' => [
                'Pan Cubano 8"' => 1,
                'Ham Croquette' => 3,
                'Jamón' => 50,
                'Queso Suizo' => 35,
                'Pepinillos' => 12,
                'Mostaza Amarilla' => 10,
                'Mantequilla' => 8,
            ],
            // BREAKFAST
            'Egg and Cheese Sandwich' => [
                'Pan Cubano 8"' => 1,
                'Egg' => 2,
                'Cheese' => 40,
            ],
            'Meat, Egg and Cheese Sandwich' => [
                'Pan Cubano 8"' => 1,
                'Egg' => 2,
                'Cheese' => 40,
                'Jamón' => 40, // Assuming Ham is Jamón
            ],
            'Pork Breakfast Sandwich' => [
                'Pan Cubano 8"' => 1,
                'Egg' => 2,
                'Cheese' => 40,
                'Pork' => 60,
                'Cebolla Blanca' => 40, // Assuming Salted Onion is Cebolla Blanca
            ],
            '305 Omelette Platter' => [
                'Pan Cubano 8"' => 1,
                'Cheese' => 50,
                'Mantequilla' => 15, // Assuming Butter is Mantequilla
                'Egg' => 3,
                'Green pepers' => 30,
                'Cebolla Blanca' => 30, // Assuming Salted onion is Cebolla Blanca
                'Chopped tomato' => 30,
                'Protein' => 30,
            ],
            // COFFEE
            '305 Colada (4 oz)' => [
                'Coffee' => 46,
                'Sugar' => 8,
            ],
            'Cortadito (4 oz)' => [
                'Coffee' => 2, // Assuming 2oz = ~56g for simplicity or creating unit 'oz'
                'Steam milk' => 2,
                'Sugar' => 8,
            ],
            'Coffee with Milk (16 oz)' => [ // Assuming Cofee with milk is this
                'Coffee' => 4, // oz
                'Steam milk' => 11,
                'Sugar' => 8,
            ],
            'Iced Café con Leche (16 oz)' => [
                'Coffee' => 4, // oz
                'Sugar' => 8,
                'Cold milk' => 8,
                'Ice' => 3,
            ],
            // BOWLS / SALADS (Mapping best matches)
            'Bowls' => [ // Assuming Rice bowl maps to 'Bowls' product
                'Rice' => 200,
                'Black beans' => 120,
                'Protein' => 170,
                'Maduros' => 75,
                'Lechuga Iceberg' => 40, // Assuming Lechuga is Lechuga Iceberg
                'Tomate' => 40,
                'Cebolla Blanca' => 15, // Assuming Onion is Cebolla Blanca
                'Cucumber' => 20,
            ],
            'Miami Garden Salad' => [ // Assuming Salad maps to 'Miami Garden Salad'
                'Protein' => 170,
                'Lechuga Iceberg' => 180, // Lettuce
                'Tomate' => 80, // Toamte
                'Cucumber' => 50,
                'Cebolla Blanca' => 25, // Onion
                'Papitas (Potato Sticks)' => 40,
                'Sweet plantains' => 75,
                'Parmesan cheese' => 30,
            ],
        ];

        foreach ($recipes as $productName => $productIngredients) {
            $product = \App\Models\Product::where('name', $productName)->first();
            if ($product) {
                foreach ($productIngredients as $ingredientName => $quantity) {
                    if (isset($inventoryItems[$ingredientName])) {
                        \App\Models\ProductIngredient::updateOrCreate(
                            [
                                'product_id' => $product->id,
                                'inventory_item_id' => $inventoryItems[$ingredientName]->id,
                            ],
                            [
                                'quantity' => $quantity,
                            ]
                        );
                    }
                }
            }
        }
    }
}
