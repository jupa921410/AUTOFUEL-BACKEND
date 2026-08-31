<?php

namespace Database\Seeders;

use App\Models\Review;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $seededAuthors = [
            'Maria G.',
            'Carlos R.',
            'Ashley T.',
            'Luis M.',
            'Sofia P.',
            'Javier O.',
        ];

        Review::whereIn('author_name', $seededAuthors)->delete();

        Review::insert([
            [
                'author_name' => 'Maria G.',
                'author_initials' => 'MG',
                'avatar_color' => 'from-305-orange to-amber-600',
                'rating' => 5,
                'date' => 'March 2025',
                'text' => 'Best cafecito in Tampa Bay, period! The cortadito is sweet, bold, and perfectly smooth. It feels like a little piece of Miami in every visit.',
                'active' => true,
                'sort_order' => 1,
            ],
            [
                'author_name' => 'Carlos R.',
                'author_initials' => 'CR',
                'avatar_color' => 'from-305-green to-emerald-700',
                'rating' => 5,
                'date' => 'February 2025',
                'text' => 'The pastelitos are flaky, fresh, and full of flavor. AutoFuel brings real Cuban coffee shop energy with warm service and amazing food.',
                'active' => true,
                'sort_order' => 2,
            ],
            [
                'author_name' => 'Ashley T.',
                'author_initials' => 'AT',
                'avatar_color' => 'from-pink-500 to-rose-600',
                'rating' => 5,
                'date' => 'March 2025',
                'text' => 'I am obsessed with this cafe. The cafe con leche is rich and creamy, the pastries are delicious, and the staff makes you feel welcome right away.',
                'active' => true,
                'sort_order' => 3,
            ],
            [
                'author_name' => 'Luis M.',
                'author_initials' => 'LM',
                'avatar_color' => 'from-teal-500 to-cyan-600',
                'rating' => 5,
                'date' => 'January 2025',
                'text' => 'Finally, a spot that gets Cuban flavors right. The croquetas are crispy, the sandwiches are packed with flavor, and the coffee is always on point.',
                'active' => true,
                'sort_order' => 4,
            ],
            [
                'author_name' => 'Sofia P.',
                'author_initials' => 'SP',
                'avatar_color' => 'from-purple-500 to-violet-600',
                'rating' => 5,
                'date' => 'March 2025',
                'text' => 'Everything looks beautiful and tastes even better. The coffee, pastries, and 305 vibe make this one of my favorite cafes in the area.',
                'active' => true,
                'sort_order' => 5,
            ],
        ]);
    }
}
