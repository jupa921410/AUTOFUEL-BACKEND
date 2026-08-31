<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->string('author_name');
            $table->string('author_initials', 5)->nullable(); // e.g. "MG"
            $table->string('avatar_color')->nullable();        // Tailwind gradient classes
            $table->unsignedTinyInteger('rating')->default(5); // 1-5
            $table->text('text');
            $table->string('date')->nullable();               // e.g. "March 2025"
            $table->boolean('active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reviews');
    }
};
