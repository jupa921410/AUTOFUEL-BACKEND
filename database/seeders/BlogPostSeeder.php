<?php

namespace Database\Seeders;

use App\Models\Post;
use Illuminate\Database\Seeder;

class BlogPostSeeder extends Seeder
{
    public function run(): void
    {
        $posts = [
            [
                'title' => 'How to Build a Better Post-Workout Smoothie',
                'slug' => 'how-to-build-a-better-post-workout-smoothie',
                'excerpt' => 'A practical guide to combining protein, carbohydrates, fruit, and hydration after training.',
                'image' => 'images/autofuel-menu/berry-smoothie.jpg',
                'content' => "A good post-workout smoothie should help you refuel without feeling heavy. Start with a quality protein source to support muscle recovery, then add fruit for carbohydrates that replenish energy used during training.\n\nBanana, berries, mango, and pineapple are excellent choices because they add natural flavor while providing useful nutrients. A small amount of peanut butter can make the smoothie more satisfying, while spinach or kale adds greens without overpowering the taste.\n\nHydration matters too. Choose water, coconut water, or your preferred milk depending on your goals. At AutoFuel Café, our team can help you select a smoothie and boost that fits your training day.",
                'published_at' => now()->subDays(2),
            ],
            [
                'title' => 'Açaí Bowls: Energy You Can Eat with a Spoon',
                'slug' => 'acai-bowls-energy-you-can-eat-with-a-spoon',
                'excerpt' => 'Discover what makes an açaí bowl satisfying and how to choose toppings that match your goals.',
                'image' => 'images/autofuel-menu/acai-bowl.jpg',
                'content' => "An açaí bowl combines a cold, fruit-forward base with toppings that add texture and staying power. The result is refreshing enough for a warm Florida day and substantial enough for breakfast or a post-training meal.\n\nFruit and granola provide carbohydrates for energy. Chia seeds, almonds, peanut butter, and protein granola can add healthy fats or protein. The best combination depends on whether you want a light snack or a more complete meal.\n\nOur Classic Açaí keeps things bright and simple, while PB Power and Protein Bowl are designed for guests who want something more filling. Every bowl is prepared fresh and can be enjoyed before work, after the gym, or whenever you need a flavorful reset.",
                'published_at' => now()->subDays(5),
            ],
            [
                'title' => 'Coffee Before Training: Finding Your Sweet Spot',
                'slug' => 'coffee-before-training-finding-your-sweet-spot',
                'excerpt' => 'Timing, portion size, and smart pairings can help make coffee part of your training routine.',
                'image' => 'images/autofuel-menu/protein-coffee.jpg',
                'content' => "Coffee is a familiar part of many morning routines, and it can also fit naturally into a training day. The key is learning how your body responds and choosing a serving that feels comfortable.\n\nMany people enjoy coffee 30 to 60 minutes before exercise. Pairing it with a small snack—such as oatmeal, fruit, or avocado toast—can provide additional energy, especially before a longer session. If you train later in the day, consider how caffeine may affect your sleep.\n\nAutoFuel Café offers cold brew, protein lattes, Café Bustelo, and tea options so you can choose the flavor and intensity that work for you. Consistency, hydration, and quality sleep still matter most; coffee is simply one useful part of the routine.",
                'published_at' => now()->subDays(8),
            ],
            [
                'title' => 'Five Easy Ways to Add More Greens to Your Day',
                'slug' => 'five-easy-ways-to-add-more-greens-to-your-day',
                'excerpt' => 'Simple, flavorful ideas for adding spinach, kale, and other greens to a busy routine.',
                'image' => 'images/autofuel-menu/green-smoothie.jpg',
                'content' => "Eating more greens does not need to mean another plain salad. Small, repeatable choices are often easier to maintain than a complete diet overhaul.\n\n1. Blend spinach into a fruit smoothie. Banana, mango, or pineapple balances its mild flavor.\n2. Add kale to a citrus-based drink with apple and ginger.\n3. Choose avocado toast and pair it with fresh fruit.\n4. Keep washed greens ready for quick meals at home.\n5. Make one green choice part of the same daily routine.\n\nOur Green Goodness, Green Ignition, and Green Glow were created to make that choice convenient and enjoyable. Start with the combination that sounds best to you and build from there.",
                'published_at' => now()->subDays(12),
            ],
            [
                'title' => 'Hydration Is More Than Just Drinking Water',
                'slug' => 'hydration-is-more-than-just-drinking-water',
                'excerpt' => 'Learn why fluids, electrolytes, climate, and activity level all shape your hydration needs.',
                'image' => 'images/autofuel-menu/citrus-drink.jpg',
                'content' => "Hydration supports everyday focus as well as physical performance. In a warm climate, fluid needs can rise quickly—especially during long workouts or outdoor activity.\n\nWater is the foundation, but sweat also carries electrolytes. A balanced meal, fruit, or an electrolyte boost can complement your fluid intake. Your needs change with workout intensity, duration, temperature, and how much you naturally sweat.\n\nA simple approach is to begin the day hydrated, drink regularly instead of waiting until you feel very thirsty, and pay attention to how you feel during training. AutoFuel refreshers, teas, smoothies, and hydration boosts offer flavorful options alongside plain water.",
                'published_at' => now()->subDays(16),
            ],
            [
                'title' => 'Fueling Community: Why AutoFuel Café Feels Different',
                'slug' => 'fueling-community-why-autofuel-cafe-feels-different',
                'excerpt' => 'AutoFuel brings fresh café favorites, performance-minded choices, and the fitness community together.',
                'image' => 'images/autofuel-menu/fruit-cup.jpg',
                'content' => "AutoFuel Café was built around a simple idea: food and drinks can support goals while still tasting great. Located alongside the fitness community, the café is a place to refuel, catch up, and celebrate progress.\n\nOur menu includes smoothies, performance teas, protein coffee, açaí bowls, fresh snacks, and wellness shots. Some guests visit after a workout, others stop by before work, and many simply come for their favorite flavor. Every visit is part of the same welcoming community.\n\nWe believe consistency is easier when healthy choices are convenient and enjoyable. That is why we focus on real ingredients, fresh preparation, and service that knows your name. Fuel your goals—and enjoy every sip.",
                'published_at' => now()->subDays(20),
            ],
        ];

        foreach ($posts as $post) {
            Post::updateOrCreate(
                ['slug' => $post['slug']],
                [...$post, 'is_published' => true]
            );
        }
    }
}
