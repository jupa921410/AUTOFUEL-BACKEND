<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('toast_product_ingredients', function (Blueprint $table) {
            $table->id();

            $table->foreignId('toast_product_id')
                  ->constrained('toast_products')
                  ->cascadeOnDelete();

            $table->foreignId('inventory_item_id')
                  ->constrained('inventory_items')
                  ->cascadeOnDelete();

            // Cuánto se consume de este ingrediente por cada unidad vendida
            $table->decimal('quantity', 10, 3)
                  ->comment('Cantidad consumida por unidad vendida (en la unidad del inventory_item)');

            $table->timestamps();

            // Un mismo ingrediente no puede repetirse para el mismo producto
            $table->unique(['toast_product_id', 'inventory_item_id'], 'tpi_product_item_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('toast_product_ingredients');
    }
};
