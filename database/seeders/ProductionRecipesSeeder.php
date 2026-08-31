<?php

namespace Database\Seeders;

use App\Models\InventoryItem;
use App\Models\Recipe;
use App\Models\RecipeIngredient;
use Illuminate\Database\Seeder;

/**
 * Siembra las recetas de producción con sus ingredientes y el toast_name
 * mapeado al displayName exacto que Toast usa en el webhook.
 *
 * Fuente: u623102705_admin (2).sql — dump de producción 2026-05-19
 */
class ProductionRecipesSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Artículos de inventario de producción ──────────────────────────
        // Usamos firstOrCreate por nombre para no duplicar ni romper IDs existentes.
        $items = $this->seedInventoryItems();

        // ── 2. Recetas con su toast_name mapeado ──────────────────────────────
        $recipes = $this->seedRecipes();

        // ── 3. Ingredientes por receta ────────────────────────────────────────
        $this->seedIngredients($recipes, $items);

        $this->command->info('✓ Recetas de producción sembradas: ' . count($recipes));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ARTÍCULOS DE INVENTARIO
    // ─────────────────────────────────────────────────────────────────────────

    private function seedInventoryItems(): array
    {
        $data = [
            'pan_cubano'      => ['name' => 'Pan Cubano 8"',           'unit' => 'unidad'],
            'pan_medianoche'  => ['name' => 'Pan de Medianoche',        'unit' => 'unidad'],
            'lechon'          => ['name' => 'Lechón Asado',             'unit' => 'g'],
            'jamon'           => ['name' => 'Jamón',                    'unit' => 'g'],
            'queso_suizo'     => ['name' => 'Queso Suizo',              'unit' => 'g'],
            'pepinillos'      => ['name' => 'Pepinillos',               'unit' => 'g'],
            'mostaza'         => ['name' => 'Mostaza Amarilla',         'unit' => 'g'],
            'mantequilla'     => ['name' => 'Mantequilla',              'unit' => 'g'],
            'palomilla'       => ['name' => 'Palomilla de Res',         'unit' => 'g'],
            'cebolla'         => ['name' => 'Cebolla Blanca',           'unit' => 'g'],
            'papitas'         => ['name' => 'Papitas (Potato Sticks)',  'unit' => 'g'],
            'tomate'          => ['name' => 'Tomate',                   'unit' => 'g'],
            'lechuga'         => ['name' => 'Lechuga Iceberg',          'unit' => 'g'],
            'mayonesa'        => ['name' => 'Mayonesa',                 'unit' => 'g'],
            'jamon_pavo'      => ['name' => 'Jamon de Pavo',            'unit' => 'g'],
            'pechuga_pavo'    => ['name' => 'Pechuga de Pavo',          'unit' => 'g'],
            'queso_crema'     => ['name' => 'Queso Crema',              'unit' => 'g'],
            'guayaba_merme'   => ['name' => 'Mermelada de Guayaba',     'unit' => 'g'],
            'bacon'           => ['name' => 'Cook Bacon',               'unit' => 'g'],
            'croqueta_jamon'  => ['name' => 'Ham Croquette',            'unit' => 'unidad'],
            'huevo'           => ['name' => 'Egg',                      'unit' => 'unidad'],
            'queso'           => ['name' => 'Cheese',                   'unit' => 'g'],
            'pork'            => ['name' => 'Pork',                     'unit' => 'g'],
            'pimiento_verde'  => ['name' => 'Green pepers',             'unit' => 'g'],
            'tomate_picado'   => ['name' => 'Chopped tomato',           'unit' => 'g'],
            'protein'         => ['name' => 'Protein',                  'unit' => 'g'],
            'coffee'          => ['name' => 'Coffee',                   'unit' => 'g'],
            'sugar'           => ['name' => 'Sugar',                    'unit' => 'g'],
            'steam_milk'      => ['name' => 'Steam milk',               'unit' => 'oz'],
            'cold_milk'       => ['name' => 'Cold milk',                'unit' => 'oz'],
            'ice'             => ['name' => 'Ice',                      'unit' => 'oz'],
            'rice'            => ['name' => 'Rice',                     'unit' => 'g'],
            'black_beans'     => ['name' => 'Black beans',              'unit' => 'g'],
            'maduros'         => ['name' => 'Maduros',                  'unit' => 'g'],
            'cucumber'        => ['name' => 'Cucumber',                 'unit' => 'g'],
            'sweet_plantains' => ['name' => 'Sweet plantains',          'unit' => 'g'],
            'parmesan'        => ['name' => 'Parmesan cheese',          'unit' => 'g'],
        ];

        $map = [];
        foreach ($data as $key => $attrs) {
            $map[$key] = InventoryItem::firstOrCreate(
                ['name' => $attrs['name']],
                ['unit' => $attrs['unit'], 'current_stock' => 0, 'min_stock' => 0, 'active' => true]
            );
        }
        return $map;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RECETAS CON TOAST_NAME
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Mapeo: nombre interno → toast_name exacto del webhook de Toast.
     * Los toast_name se obtuvieron de GET /config/v2/menuItems (130 items).
     */
    private function seedRecipes(): array
    {
        $definitions = [
            // Cafés & Bebidas calientes
            'cafe_leche'    => ['name' => 'Cafe Con Leche (16 Oz)',       'toast_name' => 'Cafe Con Leche (16 Oz)',                'price' => 4.95],
            'iced_cafe'     => ['name' => 'Iced Cafe Con Leche (16 Oz)',  'toast_name' => 'Iced Cafe Con Leche (16 Oz)',           'price' => 4.95],
            'cortadito'     => ['name' => 'Cortadito (4 Oz)',             'toast_name' => 'Cortadito (4 Oz)',                      'price' => 2.95],
            'colada'        => ['name' => '305 Colada (4 Oz)',            'toast_name' => '305 Colada (4 Oz)',                     'price' => 1.95],

            // Desayunos
            'egg_cheese'    => ['name' => 'Egg And Cheese Sandwich',      'toast_name' => 'Egg And Cheese Sandwich',               'price' => 7.95],
            'meat_egg'      => ['name' => 'Meat, Egg And Cheese Sandwich','toast_name' => 'Meat, Egg And Cheese Sandwich',         'price' => 8.95],
            'omelette'      => ['name' => '305 Omelette Platter',         'toast_name' => '305 Omelette Platter',                  'price' => 10.95],
            'tostada'       => ['name' => 'Cuban Toast (Tostada)',         'toast_name' => 'Cuban Toast (Tostada)',                 'price' => 2.95],
            'pork_break'    => ['name' => 'Pork Breakfast Sandwich',      'toast_name' => 'Pork Breakfast Sandwich',               'price' => 8.95],

            // Sándwiches
            'cubano'        => ['name' => 'Classic Cuban Sandwich (8")',  'toast_name' => 'Classic Cuban Sandwich (8")',           'price' => 11.95],
            'medianoche'    => ['name' => 'Midnight Sandwich / Media Noche (6")', 'toast_name' => 'Midnight Sandwich / Media Noche (6")', 'price' => 10.95],
            'lechon_sand'   => ['name' => 'Roasted Pork Sandwich / Pan Con Lechon (8")', 'toast_name' => 'Roasted Pork Sandwich / Pan Con Lechon (8")', 'price' => 11.95],
            'bistec'        => ['name' => 'Steak Sandwich / Pan Con Bistec (8")', 'toast_name' => 'Steak Sandwich / Pan Con Bistec (8")', 'price' => 12.95],
            'croquette_sand'=> ['name' => 'Croquette Sandwich (8")',      'toast_name' => 'Croquette Sandwich (8")',               'price' => 11.95],
            'ham_cheese'    => ['name' => 'Ham & Cheese (8")',            'toast_name' => 'Ham & Cheese (8")',                     'price' => 11.95],
            'turkey_cheese' => ['name' => 'Turkey & Cheese (8")',         'toast_name' => 'Turkey & Cheese (8")',                  'price' => 11.95],
            'elena_ruth'    => ['name' => 'Elena Ruth Sandwich',          'toast_name' => 'Elena Ruth Sandwich',                  'price' => 11.95],
            'blt'           => ['name' => 'BLT',                          'toast_name' => 'BLT',                                  'price' => 9.95],
            'club'          => ['name' => 'Club Sandwich',                'toast_name' => 'Club Sandwich',                        'price' => 11.95],

            // Ensaladas & Bowls
            'garden_salad'  => ['name' => 'Cuban Style Salad',            'toast_name' => 'Cuban Style Salad',                    'price' => 6.95],
            'rice_bowl'     => ['name' => 'Rice Bowl',                    'toast_name' => 'Rice Bowl',                            'price' => 7.95],
        ];

        $map = [];
        foreach ($definitions as $key => $attrs) {
            $map[$key] = Recipe::updateOrCreate(
                ['toast_name' => $attrs['toast_name']],
                [
                    'name'   => $attrs['name'],
                    'price'  => $attrs['price'],
                    'active' => true,
                ]
            );
        }
        return $map;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // INGREDIENTES POR RECETA
    // ─────────────────────────────────────────────────────────────────────────

    private function seedIngredients(array $recipes, array $items): void
    {
        $map = [
            // Cafe Con Leche 16oz
            'cafe_leche' => [
                ['item' => 'coffee',     'qty' => 4],
                ['item' => 'steam_milk', 'qty' => 11],
                ['item' => 'sugar',      'qty' => 8],
            ],
            // Iced Cafe Con Leche
            'iced_cafe' => [
                ['item' => 'coffee',    'qty' => 4],
                ['item' => 'sugar',     'qty' => 8],
                ['item' => 'cold_milk', 'qty' => 8],
                ['item' => 'ice',       'qty' => 3],
            ],
            // Cortadito 4oz
            'cortadito' => [
                ['item' => 'coffee',     'qty' => 2],
                ['item' => 'steam_milk', 'qty' => 2],
                ['item' => 'sugar',      'qty' => 8],
            ],
            // 305 Colada 4oz
            'colada' => [
                ['item' => 'coffee', 'qty' => 46],
                ['item' => 'sugar',  'qty' => 8],
            ],
            // Egg And Cheese Sandwich
            'egg_cheese' => [
                ['item' => 'pan_cubano', 'qty' => 1],
                ['item' => 'huevo',      'qty' => 2],
                ['item' => 'queso',      'qty' => 40],
            ],
            // Meat, Egg And Cheese Sandwich
            'meat_egg' => [
                ['item' => 'pan_cubano', 'qty' => 1],
                ['item' => 'huevo',      'qty' => 2],
                ['item' => 'queso',      'qty' => 40],
                ['item' => 'jamon',      'qty' => 40],
            ],
            // 305 Omelette Platter
            'omelette' => [
                ['item' => 'pan_cubano',    'qty' => 1],
                ['item' => 'queso',         'qty' => 50],
                ['item' => 'mantequilla',   'qty' => 15],
                ['item' => 'huevo',         'qty' => 3],
                ['item' => 'pimiento_verde','qty' => 30],
                ['item' => 'cebolla',       'qty' => 30],
                ['item' => 'tomate_picado', 'qty' => 30],
                ['item' => 'protein',       'qty' => 30],
            ],
            // Cuban Toast (Tostada) - sin ingredientes registrados en producción
            'tostada' => [],
            // Pork Breakfast Sandwich
            'pork_break' => [
                ['item' => 'pan_cubano', 'qty' => 1],
                ['item' => 'huevo',      'qty' => 2],
                ['item' => 'queso',      'qty' => 40],
                ['item' => 'pork',       'qty' => 60],
                ['item' => 'cebolla',    'qty' => 40],
            ],
            // Classic Cuban Sandwich (8")
            'cubano' => [
                ['item' => 'pan_cubano',  'qty' => 1],
                ['item' => 'lechon',      'qty' => 70],
                ['item' => 'jamon',       'qty' => 50],
                ['item' => 'queso_suizo', 'qty' => 35],
                ['item' => 'pepinillos',  'qty' => 12],
                ['item' => 'mostaza',     'qty' => 10],
                ['item' => 'mantequilla', 'qty' => 8],
            ],
            // Midnight Sandwich / Media Noche (6")
            'medianoche' => [
                ['item' => 'pan_medianoche', 'qty' => 1],
                ['item' => 'lechon',         'qty' => 70],
                ['item' => 'jamon',          'qty' => 50],
                ['item' => 'queso_suizo',    'qty' => 35],
                ['item' => 'pepinillos',     'qty' => 12],
                ['item' => 'mostaza',        'qty' => 10],
                ['item' => 'mantequilla',    'qty' => 8],
            ],
            // Roasted Pork Sandwich / Pan Con Lechon (8")
            'lechon_sand' => [
                ['item' => 'pan_cubano', 'qty' => 1],
                ['item' => 'lechon',     'qty' => 180],
                ['item' => 'cebolla',    'qty' => 40],
            ],
            // Steak Sandwich / Pan Con Bistec (8")
            'bistec' => [
                ['item' => 'pan_cubano',  'qty' => 1],
                ['item' => 'palomilla',   'qty' => 120],
                ['item' => 'cebolla',     'qty' => 40],
                ['item' => 'papitas',     'qty' => 20],
                ['item' => 'tomate',      'qty' => 30],
                ['item' => 'lechuga',     'qty' => 15],
                ['item' => 'mantequilla', 'qty' => 10],
                ['item' => 'mayonesa',    'qty' => 15],
            ],
            // Croquette Sandwich (8")
            'croquette_sand' => [
                ['item' => 'pan_cubano',     'qty' => 1],
                ['item' => 'croqueta_jamon', 'qty' => 3],
                ['item' => 'jamon',          'qty' => 50],
                ['item' => 'queso_suizo',    'qty' => 35],
                ['item' => 'pepinillos',     'qty' => 12],
                ['item' => 'mostaza',        'qty' => 10],
                ['item' => 'mantequilla',    'qty' => 8],
            ],
            // Ham & Cheese (8")
            'ham_cheese' => [
                ['item' => 'pan_cubano',  'qty' => 1],
                ['item' => 'jamon',       'qty' => 90],
                ['item' => 'queso_suizo', 'qty' => 40],
                ['item' => 'tomate',      'qty' => 40],
                ['item' => 'lechuga',     'qty' => 20],
                ['item' => 'mayonesa',    'qty' => 15],
                ['item' => 'mantequilla', 'qty' => 10],
                ['item' => 'mostaza',     'qty' => 15],
            ],
            // Turkey & Cheese (8")
            'turkey_cheese' => [
                ['item' => 'pan_cubano',  'qty' => 1],
                ['item' => 'jamon_pavo',  'qty' => 100],
                ['item' => 'queso_suizo', 'qty' => 40],
                ['item' => 'mayonesa',    'qty' => 15],
                ['item' => 'mostaza',     'qty' => 10],
                ['item' => 'lechuga',     'qty' => 20],
                ['item' => 'tomate',      'qty' => 40],
                ['item' => 'mantequilla', 'qty' => 10],
            ],
            // Elena Ruth Sandwich
            'elena_ruth' => [
                ['item' => 'pan_medianoche', 'qty' => 1],
                ['item' => 'pechuga_pavo',   'qty' => 100],
                ['item' => 'queso_crema',    'qty' => 40],
                ['item' => 'guayaba_merme',  'qty' => 30],
                ['item' => 'mantequilla',    'qty' => 8],
            ],
            // BLT
            'blt' => [
                ['item' => 'pan_cubano', 'qty' => 1],
                ['item' => 'lechuga',    'qty' => 20],
                ['item' => 'tomate',     'qty' => 40],
                ['item' => 'mayonesa',   'qty' => 15],
                ['item' => 'bacon',      'qty' => 70],
            ],
            // Club Sandwich
            'club' => [
                ['item' => 'pan_cubano',  'qty' => 1],
                ['item' => 'pechuga_pavo','qty' => 90],
                ['item' => 'jamon',       'qty' => 70],
                ['item' => 'queso_suizo', 'qty' => 50],
                ['item' => 'bacon',       'qty' => 35],
                ['item' => 'tomate',      'qty' => 50],
                ['item' => 'lechuga',     'qty' => 20],
                ['item' => 'mayonesa',    'qty' => 15],
                ['item' => 'mantequilla', 'qty' => 5],
            ],
            // Cuban Style Salad (Miami Garden Salad)
            'garden_salad' => [
                ['item' => 'protein',       'qty' => 170],
                ['item' => 'lechuga',       'qty' => 180],
                ['item' => 'tomate',        'qty' => 80],
                ['item' => 'cucumber',      'qty' => 50],
                ['item' => 'cebolla',       'qty' => 25],
                ['item' => 'papitas',       'qty' => 40],
                ['item' => 'sweet_plantains','qty' => 75],
                ['item' => 'parmesan',      'qty' => 30],
            ],
            // Rice Bowl
            'rice_bowl' => [
                ['item' => 'rice',        'qty' => 200],
                ['item' => 'black_beans', 'qty' => 120],
                ['item' => 'protein',     'qty' => 170],
                ['item' => 'maduros',     'qty' => 75],
                ['item' => 'lechuga',     'qty' => 40],
                ['item' => 'tomate',      'qty' => 40],
                ['item' => 'cebolla',     'qty' => 15],
                ['item' => 'cucumber',    'qty' => 20],
            ],
        ];

        foreach ($map as $recipeKey => $ingredients) {
            $recipe = $recipes[$recipeKey] ?? null;
            if (!$recipe || empty($ingredients)) continue;

            // Limpiar ingredientes existentes para re-sembrar limpio
            $recipe->ingredients()->delete();

            foreach ($ingredients as $ing) {
                $item = $items[$ing['item']] ?? null;
                if (!$item) continue;

                RecipeIngredient::create([
                    'recipe_id'         => $recipe->id,
                    'inventory_item_id' => $item->id,
                    'quantity'          => $ing['qty'],
                ]);
            }
        }
    }
}
