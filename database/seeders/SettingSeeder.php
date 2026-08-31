<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Setting::updateOrCreate(
            ['key' => 'promo_banner_active'],
            [
                'value' => 'true',
                'type' => 'boolean',
                'description' => 'Determina si el banner promocional superior de la web está activo o no.',
            ]
        );

        Setting::updateOrCreate(
            ['key' => 'promo_banner_text'],
            [
                'value' => 'Grand Opening April 15 🔥 — Free Cafecito Shots All Day ☕',
                'type' => 'string',
                'description' => 'El texto que aparece en el banner promocional (marquesina) superior en la web.',
            ]
        );
    }
}
