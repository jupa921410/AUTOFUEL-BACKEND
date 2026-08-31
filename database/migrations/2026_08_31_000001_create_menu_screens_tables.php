<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('menu_screens', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        Schema::create('category_menu_screen', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_screen_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->unique(['menu_screen_id', 'category_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('category_menu_screen');
        Schema::dropIfExists('menu_screens');
    }
};
