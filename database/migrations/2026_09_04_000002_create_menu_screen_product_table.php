<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Optional per-screen product picks within a category. If a screen has no rows
        // here for a given category, the API falls back to showing every product in that
        // category (existing behavior) — this table only kicks in once an admin narrows
        // a category down to specific items.
        Schema::create('menu_screen_product', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_screen_id')->constrained()->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->unique(['menu_screen_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('menu_screen_product');
    }
};
