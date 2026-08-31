<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('catering_catering_product', function (Blueprint $table) {
            $table->id();
            $table->foreignId('catering_id')->constrained()->onDelete('cascade');
            $table->foreignId('catering_product_id')->constrained('catering_products')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catering_catering_product');
    }
};
