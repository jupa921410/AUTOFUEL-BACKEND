<?php

namespace App\Console\Commands;

use App\Services\ToastApiService;
use Illuminate\Console\Command;

class SyncToastRecipes extends Command
{
    protected $signature   = 'toast:sync-recipes';
    protected $description = 'Sincroniza los items del menú de Toast como recetas en la base de datos.';

    public function handle(ToastApiService $toast): int
    {
        $this->info('Obteniendo menú desde Toast API...');

        $result = $toast->syncRecipesFromMenu();

        if ($result['total'] === 0) {
            $this->error('No se obtuvieron items del menú. Verifica las credenciales en .env.');
            return self::FAILURE;
        }

        $this->table(
            ['Creadas', 'Actualizadas', 'Total'],
            [[$result['created'], $result['updated'], $result['total']]]
        );

        $this->info('✓ Sync completo. Ahora asigna ingredientes a cada receta en Inventario → Recetas.');

        return self::SUCCESS;
    }
}
