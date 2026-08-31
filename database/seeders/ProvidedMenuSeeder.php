<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class ProvidedMenuSeeder extends Seeder
{
    public function run(): void
    {
        $menu = [
            'Smoothies & Blends' => [
                ['Make Your Own Smoothie', 'Customize your perfect blend! Choose your base fruits, add protein, and personalize with seeds or supplements.', 7.00, 'berry-smoothie.jpg'],
                ['Kiwi Berry Breeze', 'Light and refreshing smoothie featuring kiwi and strawberries with a tropical twist.', 7.00, 'berry-smoothie.jpg'],
                ['Chocolate Berry Bliss', 'Rich, creamy blend of bananas, strawberries, and chocolate — sweet indulgence.', 7.00, 'berry-smoothie.jpg'],
                ['Grape Kale Fusion', 'Banana, coconut, grape, kale, and strawberries — antioxidant-rich tropical flavor.', 7.00, 'green-smoothie.jpg'],
                ['Green Goodness', 'Banana, kale, mango, pineapple, and spinach — nutrient-packed daily greens boost.', 7.00, 'green-smoothie.jpg'],
                ['Power Punch', 'Banana, dark chocolate, and peanut butter — creamy, protein-rich boost.', 7.00, 'protein-coffee.jpg'],
                ['Tropical Blast', 'Mango, orange, pineapple, and strawberries — naturally sweet and hydrating.', 7.00, 'citrus-drink.jpg'],
                ['Tropical Energizer', 'Coconut, strawberries, and white chocolate — smooth energizing pick-me-up.', 7.00, 'berry-smoothie.jpg'],
                ['Nutra Ninja', 'Banana, ginger, kale, pineapple, and spinach — immune-boosting, metabolism-supporting green smoothie.', 7.00, 'green-smoothie.jpg'],
                ['Autumn Glow', 'Cozy, protein-packed smoothie with warm fall flavors — 24g protein.', 10.00, 'protein-coffee.jpg'],
                ['Cocoa Pumpkin Bliss', 'Chocolate meets pumpkin spice — creamy, protein-packed seasonal treat.', 10.00, 'protein-coffee.jpg'],
                ['Maple Harvest', 'Rich maple flavor balanced with wholesome protein goodness — 20g protein.', 10.00, 'protein-coffee.jpg'],
            ],
            'Fresh Juices & Fruit' => [
                ['Fresh Juice', 'Handcrafted from fresh, whole fruits — antioxidant-packed refreshment.', 5.00, 'citrus-drink.jpg'],
                ['Type Of Fruit', 'Refreshing mix of carrots, celery, grapes, kiwi, mango, peppers, pineapple, and strawberries.', 1.00, 'fruit-cup.jpg'],
            ],
            'Hot Drinks' => [
                ['Decaf Coffee', 'Your daily boost, brewed strong and smooth, delivering rich coffee flavor without the caffeine.', 3.50, 'protein-coffee.jpg'],
                ['Ryze Mushroom Coffee', 'A supercharged coffee blend infused with adaptogenic mushrooms to boost focus, energy, and immunity—delivering natural vitality without the crash.', 5.50, 'protein-coffee.jpg'],
                ['Assorted Tea', 'A curated selection of premium teas and beverages, offering a variety of flavors to suit every taste.', 3.50, 'iced-tea.jpg'],
                ['Black Tea', 'A classic, full-bodied tea with a rich aroma and bold flavor. Perfect hot or iced.', 3.50, 'iced-tea.jpg'],
                ['Green Tea', 'Refreshing and naturally rich in antioxidants, Green Tea supports wellness while offering a light, smooth flavor.', 3.50, 'green-smoothie.jpg'],
            ],
            'Drinks' => [
                ['Aqua Pana', 'Premium Italian mineral water with a naturally smooth taste and balanced minerals.', 3.00, 'fruit-cup.jpg'],
                ['Bai', 'Refreshing flavored antioxidant water with light, natural sweetness.', 3.50, 'berry-smoothie.jpg'],
                ['VitaCoco', 'A refreshing coconut water drink packed with natural electrolytes to keep you hydrated and energized.', 3.00, 'citrus-drink.jpg'],
                ['Celsius', 'Boost your metabolism and power every workout with clean, long-lasting energy.', 4.00, 'citrus-drink.jpg'],
                ['Martinelli’s Apple Juice', 'Crisp, fresh-pressed apple juice with a naturally sweet finish.', 3.50, 'citrus-drink.jpg'],
                ['Pure Leaf Sweet Tea', 'A simple, refreshing classic with smooth tea flavor and just the right touch of sweetness.', 3.50, 'iced-tea.jpg'],
                ['Pure Leaf Unsweetened Tea', 'A simple, refreshing classic with clean tea flavor and no added sweetness.', 3.50, 'iced-tea.jpg'],
                ['Electrolyte Drink Mix', 'Rehydrate and refresh with this electrolyte-packed drink mix.', 1.50, 'wellness-shots.jpg'],
            ],
            'Breakfast & Bakery' => [
                ['Avocado Toast', 'Fresh mashed avocado served on toasted whole grain bread.', 9.00, 'avocado-toast.jpg'],
                ['Plain Bagel', 'Classic plain bagel, toasted and ready to enjoy.', 3.50, 'avocado-toast.jpg'],
                ['Cinnamon Raisin Bagel', 'Sweet cinnamon raisin bagel, toasted to perfection.', 3.50, 'avocado-toast.jpg'],
                ['Everything Bagel', 'Savory everything bagel with sesame, poppy seeds, and garlic.', 3.50, 'avocado-toast.jpg'],
                ['Oatmeal', 'Choose from Apple Cinnamon, Brown Sugar, or Original.', 3.00, 'oatmeal.jpg'],
                ['Boiled Egg', 'Simple and nutritious boiled egg, perfect for a quick breakfast or a healthy snack.', 1.50, 'eggs.jpg'],
                ['Omelet Bites', 'Omelet Bites with turkey sausage and fresh spinach.', 5.00, 'eggs.jpg'],
                ['Grilled Cheese', 'Golden, crispy toast layered with melted cheese.', 11.00, 'avocado-toast.jpg'],
                ['Protein Waffles', 'Fluffy, golden waffles packed with 25g of protein.', 9.00, 'oatmeal.jpg'],
            ],
            'Soups & Salads' => [
                ['Salad', 'Fresh greens, crisp veggies, and flavorful toppings.', 6.00, 'fruit-cup.jpg'],
                ['Tomato Soup', 'Rich and smooth tomato soup, full of flavor.', 5.00, 'oatmeal.jpg'],
            ],
            'Snacks & Protein' => [
                ['Granola Bar', 'Crunchy, wholesome snack made with oats and natural ingredients.', 1.50, 'oatmeal.jpg'],
                ['Protein Bar', 'High-protein snack to fuel your day or post-workout.', 2.00, 'oatmeal.jpg'],
                ['Protein Cookie', 'Soft, protein-packed cookie — sweet and satisfying.', 3.00, 'cookies.jpg'],
                ['Protein Chips', 'Savory, high-protein chips — energizing snack.', 3.50, 'cookies.jpg'],
                ['Veggie Straws', 'Light, crunchy veggie straws — guilt-free snack.', 2.50, 'cookies.jpg'],
            ],
        ];

        foreach ($menu as $categoryName => $products) {
            $category = Category::updateOrCreate(
                ['name' => $categoryName],
                ['description' => 'AutoFuel Cafe menu category.'],
            );

            foreach ($products as [$name, $description, $price, $image]) {
                Product::updateOrCreate(
                    ['name' => $name],
                    [
                        'category_id' => $category->id,
                        'description' => $description,
                        'price' => $price,
                        'image' => 'images/autofuel-menu/'.$image,
                    ],
                );
            }
        }
    }
}
