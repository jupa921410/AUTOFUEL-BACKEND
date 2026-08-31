<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin ─────────────────────────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'admin@autofuel.com'],
            [
                'name'              => 'Admin AutoFuel',
                'email'             => 'admin@autofuel.com',
                'password'          => Hash::make('123123123'),
                'role'              => 'admin',
                'email_verified_at' => now(),
            ]
        );

        // ── Delivery ──────────────────────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'delivery@autofuel.com'],
            [
                'name'              => 'Delivery AutoFuel',
                'email'             => 'delivery@autofuel.com',
                'password'          => Hash::make('123123123'),
                'role'              => 'delivery',
                'email_verified_at' => now(),
            ]
        );
    }
}
