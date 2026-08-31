<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('toast_products', function (Blueprint $table) {
            $table->id();

            // Identificadores de Toast
            $table->string('toast_guid')->unique()->comment('GUID del MenuItem en Toast');
            $table->string('toast_item_group_guid')->nullable()->comment('GUID del ItemGroup padre');

            // Datos del producto
            $table->string('name')->comment('displayName en Toast');
            $table->text('description')->nullable();
            $table->string('plu')->nullable()->comment('PLU / código externo del item');
            $table->decimal('price', 10, 2)->default(0)->comment('Precio base del item');
            $table->string('unit_of_measure', 30)->default('NONE');

            // Estado
            $table->boolean('active')->default(true);

            // Metadatos del menú de Toast (para referencia)
            $table->json('raw_payload')->nullable()->comment('Payload completo del item en Toast');

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('toast_products');
    }
};
