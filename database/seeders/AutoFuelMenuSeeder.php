<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class AutoFuelMenuSeeder extends Seeder
{
    public function run(): void
    {
        $smoothiePrices = ['16 oz' => 7.99, '20 oz' => 9.99];
        $refreshPrices = ['16 oz' => 4.99, '20 oz' => 5.99, '32 oz' => 6.99];
        $bowlPrices = ['Regular' => 10.99, 'Large' => 13.99];
        $coffeePrices = ['16 oz' => 6.99, '20 oz' => 7.99];

        $groups = [
            'Signature Smoothies' => [
                ['Chocolate Berry Bliss', 'Banana, strawberries, blueberries and dark or white chocolate.', 'berry-smoothie.jpg'],
                ['Green Goodness', 'Banana, kale, mango, pineapple and spinach.', 'green-smoothie.jpg'],
                ['Strawberry Banana', 'Strawberries and banana.', 'berry-smoothie.jpg'],
                ['Purple Fusion', 'Banana, coconut, grape, kale and strawberries.', 'berry-smoothie.jpg'],
                ['Mango Momentum', 'Mango and pineapple.', 'citrus-drink.jpg'],
                ['Island Drive', 'Mango, orange, pineapple and strawberries.', 'citrus-drink.jpg'],
            ],
            'Performance Smoothies' => [
                ['Powerhouse PB', 'Banana, dark chocolate and peanut butter.', 'protein-coffee.jpg'],
                ['Green Ignition', 'Apples, ginger, kale, pineapple and spinach.', 'green-smoothie.jpg'],
                ['Citrus Cleanse', 'Grapefruit, lemon, orange and pineapple.', 'citrus-drink.jpg'],
                ['Tropical Rush', 'Pineapple, mango and coconut.', 'citrus-drink.jpg'],
                ['Kiwi Berry Breeze', 'Kiwi and strawberries.', 'berry-smoothie.jpg'],
            ],
        ];

        foreach ($groups as $category => $items) {
            foreach ($items as [$name, $description, $image]) {
                $this->addSizes($category, $name, $description, $image, $smoothiePrices);
            }
        }

        foreach ([
            ['Strawberry Lemonade', 'Strawberry lemonade.', 'berry-smoothie.jpg'],
            ['Mango Lemonade', 'Mango lemonade.', 'citrus-drink.jpg'],
            ['Pineapple Lemonade', 'Pineapple lemonade.', 'citrus-drink.jpg'],
            ['Hibiscus Strawberry Lemonade', 'Hibiscus and strawberry lemonade.', 'berry-smoothie.jpg'],
            ['Dragon Fruit Lemonade', 'Dragon fruit lemonade.', 'berry-smoothie.jpg'],
            ['Blue Raspberry Lemonade', 'Blue raspberry lemonade.', 'berry-smoothie.jpg'],
            ['Watermelon Lemonade', 'Watermelon lemonade.', 'berry-smoothie.jpg'],
            ['Arnold Palmer', 'Fresh tea and lemonade.', 'iced-tea.jpg'],
            ['Sweet Tea', 'Freshly brewed sweet tea.', 'iced-tea.jpg'],
            ['Unsweet Tea', 'Freshly brewed unsweetened tea.', 'iced-tea.jpg'],
        ] as [$name, $description, $image]) {
            $this->addSizes('Refreshers & Lemonades', $name, $description, $image, $refreshPrices);
        }

        foreach ([
            ['Classic Açaí', 'Açaí, banana, blueberries, strawberries and granola.'],
            ['PB Power', 'Açaí, banana, peanut butter, granola and honey.'],
            ['Berry Crunch', 'Açaí, strawberries, blueberries, granola and almonds.'],
            ['Tropical Escape', 'Açaí, mango, pineapple, coconut and granola.'],
            ['Protein Bowl', 'Açaí, banana, protein granola, peanut butter and chia seeds.'],
        ] as [$name, $description]) {
            $this->addSizes('Açaí Bowls', $name, $description, 'acai-bowl.jpg', $bowlPrices);
        }

        foreach ([
            ['Turbo Tea', 'Energy performance tea.', 'citrus-drink.jpg'],
            ['Purple Power Tea', 'Plant-powered performance tea.', 'berry-smoothie.jpg'],
            ['Island Lift', 'Tropical hydration performance tea.', 'citrus-drink.jpg'],
            ['Berry Recovery', 'Berry recovery performance tea.', 'berry-smoothie.jpg'],
            ['Peach Paradise', 'Peach hydration performance tea.', 'iced-tea.jpg'],
            ['Mango Rush', 'Mango energy and hydration performance tea.', 'citrus-drink.jpg'],
        ] as [$name, $description, $image]) {
            $this->addSizes('Performance Teas', $name, $description, $image, $refreshPrices);
        }

        foreach ([
            ['Protein Cold Brew', 'Cold brew coffee with protein.', 'protein-coffee.jpg'],
            ['Vanilla Protein Latte', 'Vanilla latte with protein.', 'protein-coffee.jpg'],
            ['Mocha Protein', 'Mocha coffee with protein.', 'protein-coffee.jpg'],
            ['RYZE Mushroom Latte', 'Creamy mushroom latte.', 'protein-coffee.jpg'],
            ['Café Bustelo', 'Bold Café Bustelo coffee.', 'protein-coffee.jpg'],
            ['Green Tea', 'Fresh green tea.', 'green-smoothie.jpg'],
            ['Black Tea', 'Fresh black tea.', 'iced-tea.jpg'],
        ] as [$name, $description, $image]) {
            $this->addSizes('Protein Coffee & More', $name, $description, $image, $coffeePrices);
        }

        foreach ([
            ['Protein Oatmeal', 'Protein oatmeal.', 4.50, 'oatmeal.jpg'],
            ['Avocado Toast', 'Toast topped with avocado.', 5.50, 'avocado-toast.jpg'],
            ['Omelet Bites (2 pcs)', 'Two protein-rich omelet bites.', 5.00, 'eggs.jpg'],
            ['Protein Bars', 'Protein snack bar.', 3.75, 'oatmeal.jpg'],
            ['Protein Cookies', 'Protein cookie.', 3.50, 'cookies.jpg'],
            ['Protein Chips', 'Crunchy protein chips.', 2.75, 'cookies.jpg'],
            ['Granola Bars', 'Granola snack bar.', 2.50, 'oatmeal.jpg'],
            ['Boiled Eggs (2 pcs)', 'Two boiled eggs.', 2.50, 'eggs.jpg'],
            ['Fresh Fruit Cup', 'Cup of fresh seasonal fruit.', 4.25, 'fruit-cup.jpg'],
        ] as [$name, $description, $price, $image]) {
            $this->upsert('Fuel Bites', $name, $description, $price, $image);
        }

        foreach ([
            ['The Green Glow', 'Celery, cucumber, parsley, kale, spinach and lemon.'],
            ['The Beetlicious', 'Beet, pineapple and ginger.'],
            ['Tropical Refresher', 'Watermelon, pineapple and ginger.'],
        ] as [$name, $description]) {
            $this->upsert('Fuel Lab Favorites', $name.' (12 oz)', $description, 6.99, 'wellness-shots.jpg');
        }

        foreach (['Ginger', 'Turmeric', 'Immunity', 'Recovery', 'Detox', 'Energy'] as $name) {
            $this->upsert('Fuel Injections', $name.' (2 oz)', $name.' wellness shot.', 3.99, 'wellness-shots.jpg');
        }
    }

    private function addSizes(string $category, string $name, string $description, string $image, array $prices): void
    {
        foreach ($prices as $size => $price) {
            $this->upsert($category, $name.' ('.$size.')', $description, $price, $image);
        }
    }

    private function upsert(string $categoryName, string $name, string $description, float $price, string $image): void
    {
        $category = Category::updateOrCreate(
            ['name' => $categoryName],
            ['description' => 'AutoFuel Café menu category.']
        );

        Product::updateOrCreate(
            ['name' => $name],
            [
                'category_id' => $category->id,
                'description' => $description,
                'price' => $price,
                'image' => 'images/autofuel-menu/'.$image,
            ]
        );
    }
}
