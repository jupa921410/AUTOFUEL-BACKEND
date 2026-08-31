<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('toast_orders', function (Blueprint $table) {
            $table->boolean('inventory_deducted')
                  ->default(false)
                  ->after('raw_payload')
                  ->comment('Indica si ya se descontó el inventario para esta orden (evita doble descuento)');
        });
    }

    public function down(): void
    {
        Schema::table('toast_orders', function (Blueprint $table) {
            $table->dropColumn('inventory_deducted');
        });
    }
};
