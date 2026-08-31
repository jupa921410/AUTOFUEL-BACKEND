<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recipe_ingredients', function (Blueprint $table) {
            $table->id();

            $table->foreignId('recipe_id')
                  ->constrained('recipes')
                  ->cascadeOnDelete();

            $table->foreignId('inventory_item_id')
                  ->constrained('inventory_items')
                  ->cascadeOnDelete();

            $table->decimal('quantity', 10, 3)
                  ->comment('Cantidad consumida por unidad vendida (en la unidad del inventory_item)');

            $table->timestamps();

            $table->unique(['recipe_id', 'inventory_item_id'], 'ri_recipe_item_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recipe_ingredients');
    }
};
