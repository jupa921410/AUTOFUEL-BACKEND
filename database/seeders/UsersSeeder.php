<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Siembra los usuarios de producción (admin + delivery).
 * Fuente: u623102705_admin (2).sql — dump 2026-05-19
 */
class UsersSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            [
                'id'                => 1,
                'name'              => 'Admin AutoFuel',
                'email'             => 'admin@autofuel.com',
                'role'              => 'admin',
                'email_verified_at' => '2026-05-11 23:29:41',
                // Hash original de producción
                'password'          => '$2y$12$723zndmNnHWFFak.NgD59.MZ4GpjyXorI9sYogJ6MRBc9CrNEe12a',
                'created_at'        => '2026-05-11 23:29:41',
                'updated_at'        => '2026-05-11 23:29:41',
            ],
            [
                'id'                => 2,
                'name'              => 'Delivery AutoFuel',
                'email'             => 'delivery@autofuel.com',
                'role'              => 'delivery',
                'email_verified_at' => '2026-05-11 23:29:41',
                'password'          => '$2y$12$ukljDdZhkmqtQ8.IgUN9Qe57ET5nwFQUOBTgL2Ts3w2SeNAxs85li',
                'created_at'        => '2026-05-11 23:29:41',
                'updated_at'        => '2026-05-11 23:29:41',
            ],
        ];

        foreach ($users as $user) {
            DB::table('users')->updateOrInsert(
                ['email' => $user['email']],
                $user
            );
        }

        $this->command->info('✓ Users sembrados: ' . count($users));
    }
}
