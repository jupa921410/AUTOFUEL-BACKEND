<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * Siembra los productos del menú digital de producción (con sus rutas de imagen).
 * Las imágenes ya existen en el storage de producción.
 * Fuente: u623102705_admin (2).sql — dump 2026-05-19
 */
class ProductsSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            [
                'id' => 1, 'category_id' => 1,
                'name'        => 'Coffee with Milk (16 oz)',
                'description' => 'The authentic flavor of the 305. A strong, sweet espresso — perfect for starting the morning with energy.',
                'price'  => 4.95,
                'image'  => 'products/NgYv4RzkajMDo01w7Ok1yrJGP4nFDM0l5LCUfbSA.png',
                'created_at' => '2026-03-14 12:12:29', 'updated_at' => '2026-04-01 19:10:48',
            ],
            [
                'id' => 2, 'category_id' => 1,
                'name'        => 'Iced Café con Leche (16 oz)',
                'description' => 'The classic Cuban café con leche, served over ice to cool you down.',
                'price'  => 4.95,
                'image'  => 'products/7Vv1ohXFWeGEyMDzPY402YAG4MfNIS6hmzVnjDOO.jpg',
                'created_at' => '2026-03-14 12:12:29', 'updated_at' => '2026-04-11 02:56:26',
            ],
            [
                'id' => 3, 'category_id' => 1,
                'name'        => 'Cortadito (4 oz)',
                'description' => 'A shot of espresso cut with the perfect amount of steamed milk.',
                'price'  => 2.95,
                'image'  => 'products/ZqKTa37xG3Dvarvagaqoh1evoboasSaOYOG80Lc8.jpg',
                'created_at' => '2026-03-14 12:12:29', 'updated_at' => '2026-04-01 19:21:08',
            ],
            [
                'id' => 4, 'category_id' => 1,
                'name'        => '305 Colada (4 oz)',
                'description' => 'A Cuban espresso shot topped with sweet foam (espumita) — perfect for sharing.',
                'price'  => 1.95,
                'image'  => 'products/SWEXep7SLt6kP0ZuIgpXWzi70E4S2dn30uO3xAUA.jpg',
                'created_at' => '2026-03-14 12:12:29', 'updated_at' => '2026-04-01 19:21:21',
            ],
            [
                'id' => 5, 'category_id' => 2,
                'name'        => 'Egg and Cheese Sandwich',
                'description' => 'Eggs and cheese (Provolone, American, or Swiss) on toasted Cuban bread.',
                'price'  => 7.95,
                'image'  => 'products/uU2vVCMZgUI90IaJWFpzGnxHSxaLvxFgLH2ooGeV.jpg',
                'created_at' => '2026-03-14 12:12:29', 'updated_at' => '2026-04-01 19:21:49',
            ],
            [
                'id' => 6, 'category_id' => 2,
                'name'        => 'Meat, Egg and Cheese Sandwich',
                'description' => 'Sandwich with egg, cheese, and your choice of protein (Bacon, Ham, Sausage, or Turkey).',
                'price'  => 8.95,
                'image'  => 'products/HcYDTT0ORM73BUvu7BZKbHvhdpGzWQq3fWmaQKIh.jpg',
                'created_at' => '2026-03-14 12:12:29', 'updated_at' => '2026-04-01 19:22:09',
            ],
            [
                'id' => 7, 'category_id' => 2,
                'name'        => '305 Omelette Platter',
                'description' => 'Omelet served with your choice of cheese (Provolone, American, or Swiss), salted onion, tomatoes and the meat you choose: bacon, sausage, ham or turkey.',
                'price'  => 10.95,
                'image'  => 'products/6Rle9dFCdxXmETOQUgKStB59Y0a7gOOk6R30YS7A.jpg',
                'created_at' => '2026-03-14 12:12:29', 'updated_at' => '2026-04-01 19:17:11',
            ],
            [
                'id' => 8, 'category_id' => 2,
                'name'        => 'Cuban Toast (Tostada)',
                'description' => 'Classic Cuban bread, toasted with butter. (Option to add cheese +$1.00).',
                'price'  => 2.95,
                'image'  => 'products/s1ZSEr4x0VHHnfjluaTlJcIcJXk2oIxSTZNRfFzF.jpg',
                'created_at' => '2026-03-14 12:12:29', 'updated_at' => '2026-04-01 18:59:47',
            ],
            [
                'id' => 9, 'category_id' => 3,
                'name'        => 'Classic Cuban Sandwich (8")',
                'description' => 'Ham, roasted pork, Swiss cheese, pickles, and mustard — pressed to perfection.',
                'price'  => 11.95,
                'image'  => 'products/VR7kZ6K0sgl9yV59hk5TcOxbYP5Y1pNYjL15ODtD.jpg',
                'created_at' => '2026-03-14 12:12:29', 'updated_at' => '2026-04-01 19:23:23',
            ],
            [
                'id' => 10, 'category_id' => 3,
                'name'        => 'Midnight Sandwich / Media Noche (6")',
                'description' => 'Ham, roasted pork, Swiss cheese, pickles, and mustard on sweet bread.',
                'price'  => 10.95,
                'image'  => 'products/GYEEOUQs568rc8JTphx6neWhM4EeJsnHXwWBubeR.jpg',
                'created_at' => '2026-03-14 12:12:29', 'updated_at' => '2026-04-01 19:23:48',
            ],
            [
                'id' => 11, 'category_id' => 3,
                'name'        => 'Roasted Pork Sandwich / Pan con Lechón (8")',
                'description' => 'Juicy roasted pork and sautéed onions on toasted Cuban bread.',
                'price'  => 11.95,
                'image'  => 'products/RytsJmiPHtoDFuDHc5RPZOX6jAp150REqJg4sFQM.jpg',
                'created_at' => '2026-03-14 12:12:29', 'updated_at' => '2026-04-01 19:24:13',
            ],
            [
                'id' => 12, 'category_id' => 3,
                'name'        => 'Steak Sandwich / Pan con Bistec (8")',
                'description' => 'Palomilla steak, sautéed onions, Swiss cheese, lettuce, tomato, mayonnaise, and shoestring fries.',
                'price'  => 12.95,
                'image'  => 'products/qsM32j2AJU1GOJiecN2Q0oI0upOpP3D6chT4vzOf.jpg',
                'created_at' => '2026-03-14 12:12:29', 'updated_at' => '2026-04-01 19:24:47',
            ],
            [
                'id' => 13, 'category_id' => 3,
                'name'        => 'Croquette Sandwich (8")',
                'description' => 'Ham, swiss cheese, pickles, croquettes and mustard.',
                'price'  => 11.95,
                'image'  => 'products/UhhAGowZGV2h7hc8EJ9hsQVr31ZucFZwSI5bXItq.jpg',
                'created_at' => '2026-03-14 12:12:29', 'updated_at' => '2026-04-01 19:25:16',
            ],
            [
                'id' => 14, 'category_id' => 3,
                'name'        => 'Ham & Cheese Sandwich (8")',
                'description' => 'Ham, Swiss cheese, lettuce, tomato, mayonnaise, and mustard.',
                'price'  => 11.95,
                'image'  => 'products/Z3dHvpv253DDtfj1mJx7CuV6EZajVZhRSWC4e55h.jpg',
                'created_at' => '2026-03-14 12:12:29', 'updated_at' => '2026-04-01 19:25:46',
            ],
            [
                'id' => 15, 'category_id' => 3,
                'name'        => 'Turkey & Cheese Sandwich (8")',
                'description' => 'Turkey, Swiss cheese, lettuce, tomato, mayonnaise, and mustard.',
                'price'  => 11.95,
                'image'  => 'products/eGf04vBqMcCEabKpFj02YGhwaGNq7WX6AQwGNUX2.jpg',
                'created_at' => '2026-03-14 12:12:29', 'updated_at' => '2026-04-01 19:28:38',
            ],
            [
                'id' => 16, 'category_id' => 3,
                'name'        => 'Elena Ruth Sandwich',
                'description' => 'Selected turkey ham, mild cream cheese, and premium guava jam on Medianoche bread.',
                'price'  => 11.95,
                'image'  => 'products/UzOUewOGokmQYYQYXI9JzExLwa5iqLnDiSAemVBd.jpg',
                'created_at' => '2026-03-14 12:12:30', 'updated_at' => '2026-04-01 19:26:11',
            ],
            [
                'id' => 17, 'category_id' => 4,
                'name'        => 'Empanadas',
                'description' => 'Filled with (Beef), (Chicken), (Spinach). Fried to golden perfection.',
                'price'  => 3.95,
                'image'  => 'products/eeR9rg5w9BwQt0FPnaAp5CfdPcWkZ0dzC5gFWaxx.jpg',
                'created_at' => '2026-03-14 12:12:30', 'updated_at' => '2026-05-11 21:03:15',
            ],
            [
                'id' => 18, 'category_id' => 4,
                'name'        => 'Ham Croquette',
                'description' => 'A fried, golden-brown ham croquette.',
                'price'  => 0.75,
                'image'  => 'products/WLov7RxP7Ocq63ugdR4P6qeuNRkS5SP6baMaDDud.jpg',
                'created_at' => '2026-03-14 12:12:30', 'updated_at' => '2026-04-21 19:00:54',
            ],
            [
                'id' => 20, 'category_id' => 4,
                'name'        => 'Guava Pastry (Pastelito)',
                'description' => 'Freshly baked puff pastry filled with guava paste.',
                'price'  => 3.00,
                'image'  => 'products/lTkL6NahWKN5qHj2VLCDRcW1qSVIfEG3NJ5Jedjo.jpg',
                'created_at' => '2026-03-14 12:12:30', 'updated_at' => '2026-04-01 19:03:36',
            ],
            [
                'id' => 21, 'category_id' => 11,
                'name'        => 'Assorted Chips',
                'description' => 'A variety of traditional potato chips and snacks.',
                'price'  => 1.50,
                'image'  => 'products/uBlK1bBViQQjGYayxm9OOQAs4AIhodycdZofqS2K.jpg',
                'created_at' => '2026-03-14 12:12:30', 'updated_at' => '2026-04-25 02:17:33',
            ],
            [
                'id' => 22, 'category_id' => 11,
                'name'        => 'Specialty Flan',
                'description' => 'Caramel flan dessert — smooth and creamy.',
                'price'  => 3.95,
                'image'  => 'products/Pl3CjplQSbRC8rEZj8fieuJWvL2RmZeeBw3iUT71.jpg',
                'created_at' => '2026-03-14 12:12:30', 'updated_at' => '2026-04-25 02:19:11',
            ],
            [
                'id' => 23, 'category_id' => 11,
                'name'        => 'Tres Leches Cake',
                'description' => 'Sponge cake soaked in three types of milk, topped with meringue.',
                'price'  => 3.95,
                'image'  => 'products/6IGzVZyrYRA6dP5bacd6TiLXzbwAEKs6A4Nslal8.png',
                'created_at' => '2026-03-14 12:12:30', 'updated_at' => '2026-04-25 02:17:57',
            ],
            [
                'id' => 25, 'category_id' => 6,
                'name'        => 'Milkshakes (16 oz)',
                'description' => 'Mango, Guava, Mamey, or Malted Milk.',
                'price'  => 5.95,
                'image'  => 'products/Rupg45qhfjcqXXGN1CQlOivtkEAjew49S8Y8EYVC.png',
                'created_at' => '2026-03-14 12:12:30', 'updated_at' => '2026-04-01 19:08:06',
            ],
            [
                'id' => 26, 'category_id' => 6,
                'name'        => 'Fresh Squeezed Orange Juice (16 oz)',
                'description' => 'Natural orange juice — 100% fresh.',
                'price'  => 6.50,
                'image'  => 'products/ynxPVG7nmxOmB35cy360FULVaI6gUO7UvreRXnEr.jpg',
                'created_at' => '2026-03-14 12:12:30', 'updated_at' => '2026-04-01 19:08:53',
            ],
            [
                'id' => 27, 'category_id' => 6,
                'name'        => 'Fruit Juices (16 oz)',
                'description' => 'Refreshing Natural Juice: Mango, Guava, or Pineapple.',
                'price'  => 5.95,
                'image'  => 'products/rFmICNrrzeFeB1OlUwCDJgmIsFjwrWmlzjLupFnB.jpg',
                'created_at' => '2026-03-14 12:12:30', 'updated_at' => '2026-04-01 19:08:39',
            ],
            [
                'id' => 28, 'category_id' => 11,
                'name'        => 'Sodas',
                'description' => 'Coca-Cola, Fanta, Sprite.',
                'price'  => 2.00,
                'image'  => 'products/9uuEJe4kZaFyOVYgFvG3B9syuMg7ySQkINMjaNkT.png',
                'created_at' => '2026-03-14 12:12:30', 'updated_at' => '2026-04-25 02:17:20',
            ],
            [
                'id' => 29, 'category_id' => 11,
                'name'        => 'Latin Sodas',
                'description' => 'Jupiña, Malta, Materva.',
                'price'  => 1.50,
                'image'  => 'products/nDr5kwrmPleIbVGF0YtnCNhgu53iTtP92nnQTFKk.png',
                'created_at' => '2026-03-14 12:12:30', 'updated_at' => '2026-04-25 02:18:08',
            ],
            [
                'id' => 30, 'category_id' => 11,
                'name'        => 'Bottled Water',
                'description' => 'Bottled mineral water.',
                'price'  => 1.40,
                'image'  => 'products/HVEI8rCjqx0nQe70eRKajTpyuoQ5etLHlBgFw5fE.jpg',
                'created_at' => '2026-03-14 12:12:30', 'updated_at' => '2026-04-25 02:16:10',
            ],
            [
                'id' => 31, 'category_id' => 3,
                'name'        => 'BLT',
                'description' => 'Lettuce, Tomato, Bacon and Mayo.',
                'price'  => 9.95,
                'image'  => 'products/tx0CCzRsl3m4K7xHyP1jYpOqviG9mNnaa0eIxmtx.jpg',
                'created_at' => '2026-03-14 22:20:24', 'updated_at' => '2026-04-01 19:19:59',
            ],
            [
                'id' => 32, 'category_id' => 3,
                'name'        => 'Club Sandwich',
                'description' => 'Ham, Bacon, Turkey Ham, Cheese, Lettuce, Tomato and Mayo.',
                'price'  => 11.95,
                'image'  => 'products/rbtPFZkU9j1N3mMeoRi735JnFd26196wSfvTIniA.jpg',
                'created_at' => '2026-03-18 19:10:50', 'updated_at' => '2026-04-16 14:36:05',
            ],
            [
                'id' => 33, 'category_id' => 2,
                'name'        => 'Pork Breakfast Sandwich',
                'description' => 'Pork, Eggs, American Cheese and Salted Onion with a lime touch.',
                'price'  => 8.95,
                'image'  => 'products/COI9wCvhfTQLP3cOBgafcUH1C604qUsHOhCO3Mhl.jpg',
                'created_at' => '2026-03-18 19:28:49', 'updated_at' => '2026-04-01 19:22:58',
            ],
            [
                'id' => 35, 'category_id' => 10,
                'name'        => 'Chicken Salad',
                'description' => 'Fresh mix of vegetables with a Cuban dressing and grilled chicken breast.',
                'price'  => 12.95,
                'image'  => 'products/tApo1rxKoizegVMvVd7Jqz3YeA2kYCetmiEvxedJ.jpg',
                'created_at' => '2026-03-25 00:12:44', 'updated_at' => '2026-04-11 02:55:13',
            ],
            [
                'id' => 36, 'category_id' => 10,
                'name'        => 'Palomilla Steak Salad',
                'description' => 'Fresh mix of vegetables with a Cuban dressing and palomilla.',
                'price'  => 12.95,
                'image'  => 'products/zX6SD1RINvbfLGsUaDs7QIxPT8pHfWmgoq5fYg52.jpg',
                'created_at' => '2026-03-25 00:42:26', 'updated_at' => '2026-04-11 02:55:32',
            ],
            [
                'id' => 37, 'category_id' => 10,
                'name'        => 'Pork Salad',
                'description' => 'Fresh mix of vegetables with a Cuban dressing with pulled pork.',
                'price'  => 12.95,
                'image'  => 'products/pmRy0LRBhrKQL4LoiLjMYjC0eu5WxGiQlDlqJwYI.jpg',
                'created_at' => '2026-03-25 00:43:47', 'updated_at' => '2026-04-11 02:55:03',
            ],
            [
                'id' => 38, 'category_id' => 10,
                'name'        => 'Miami Garden Salad',
                'description' => 'Crisp greens and fresh chopped vegetables. Pure plant-powered freshness with a Cuban dressing.',
                'price'  => 6.95,
                'image'  => 'products/mNaNunsatqwwuTo3GKiqvPlAsLG7Z6CQ02cYc1dK.jpg',
                'created_at' => '2026-03-25 00:46:18', 'updated_at' => '2026-04-11 03:05:22',
            ],
            [
                'id' => 40, 'category_id' => 8,
                'name'        => 'Bowls',
                'description' => 'Miami-Style Rice & Beans Platter. Steamy white rice paired with richly seasoned black beans, colorful sautéed vegetables, and perfectly caramelized sweet plantains. Upgrade your Bowl with a Protein for $6.00: Palomilla Steak, Chicken, Pulled Pork.',
                'price'  => 7.95,
                'image'  => 'products/YnwjHFrsNxIgcqrkjHTyHhzQO1JTOAN5qkvewwar.jpg',
                'created_at' => '2026-04-01 21:05:12', 'updated_at' => '2026-04-11 02:52:59',
            ],
        ];

        foreach ($products as $product) {
            DB::table('products')->updateOrInsert(['id' => $product['id']], $product);
        }

        $this->command->info('✓ Productos sembrados: ' . count($products));
    }
}
