<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->string('name')->comment('Nombre interno de la receta');
            $table->string('toast_name')->nullable()->unique()
                  ->comment('displayName exacto que Toast envía en el webhook — clave de mapeo');
            $table->text('description')->nullable();
            $table->decimal('price', 10, 2)->default(0)->comment('Precio de referencia (opcional)');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recipes');
    }
};
