<?php

namespace Database\Seeders;

use App\Models\Horario;
use Illuminate\Database\Seeder;

class HorarioSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $horarios = [
            'Monday' => ['init' => '06:30', 'end' => '15:00', 'closed' => false],
            'Tuesday' => ['init' => '06:30', 'end' => '15:00', 'closed' => false],
            'Wednesday' => ['init' => '06:30', 'end' => '15:00', 'closed' => false],
            'Thursday' => ['init' => '06:30', 'end' => '15:00', 'closed' => false],
            'Friday' => ['init' => '06:30', 'end' => '15:00', 'closed' => false],
            'Saturday' => ['init' => '09:00', 'end' => '15:00', 'closed' => false],
            'Sunday' => ['init' => null, 'end' => null, 'closed' => true],
        ];

        foreach ($horarios as $day => $hours) {
            Horario::updateOrCreate(
                ['day' => $day],
                $hours
            );
        }
    }
}
