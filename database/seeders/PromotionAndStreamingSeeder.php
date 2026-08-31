<?php

namespace Database\Seeders;

use App\Models\Promotion;
use App\Models\PromotionGroup;
use App\Models\TvStream;
use Illuminate\Database\Seeder;

class PromotionAndStreamingSeeder extends Seeder
{
    public function run(): void
    {
        $featured = PromotionGroup::updateOrCreate(
            ['slug' => 'featured-offers'],
            [
                'name' => 'Featured Offers',
                'description' => 'Main promotions displayed on cafe screens.',
                'active' => true,
            ],
        );

        $morning = PromotionGroup::updateOrCreate(
            ['slug' => 'morning-energy'],
            [
                'name' => 'Morning Energy',
                'description' => 'Breakfast, coffee and early-morning specials.',
                'active' => true,
            ],
        );

        $promotions = [
            [
                'group' => $featured,
                'title' => 'Smoothie Happy Hour',
                'description' => 'Enjoy 20% off any signature smoothie from 2 PM to 5 PM.',
                'discount_percentage' => 20,
            ],
            [
                'group' => $featured,
                'title' => 'Protein Power Combo',
                'description' => 'Pair a protein smoothie with any Fuel Bite and save 15%.',
                'discount_percentage' => 15,
            ],
            [
                'group' => $morning,
                'title' => 'Morning Coffee Boost',
                'description' => 'Get 10% off protein coffee and breakfast items before 11 AM.',
                'discount_percentage' => 10,
            ],
            [
                'group' => $morning,
                'title' => 'Açaí Bowl Monday',
                'description' => 'Start the week with 15% off every regular açaí bowl.',
                'discount_percentage' => 15,
            ],
        ];

        foreach ($promotions as $data) {
            Promotion::updateOrCreate(
                ['title' => $data['title']],
                [
                    'promotion_group_id' => $data['group']->id,
                    'description' => $data['description'],
                    'discount_percentage' => $data['discount_percentage'],
                    'start_date' => now()->startOfMonth()->toDateString(),
                    'end_date' => now()->addYear()->endOfMonth()->toDateString(),
                    'active' => true,
                    'image' => null,
                    'media_type' => 'image',
                    'youtube_id' => null,
                ],
            );
        }

        TvStream::updateOrCreate(
            ['slug' => 'cafe-lounge'],
            [
                'name' => 'Cafe Lounge',
                'youtube_url' => 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
                'promotion_group_id' => $featured->id,
                'active' => true,
                'ad_interval_seconds' => 300,
                'ad_count' => 2,
                'pause_on_ads' => true,
            ],
        );

        TvStream::updateOrCreate(
            ['slug' => 'morning-cafe'],
            [
                'name' => 'Morning Cafe',
                'youtube_url' => 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
                'promotion_group_id' => $morning->id,
                'active' => true,
                'ad_interval_seconds' => 240,
                'ad_count' => 1,
                'pause_on_ads' => true,
            ],
        );
    }
}
