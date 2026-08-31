<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('toast_name')
                  ->nullable()
                  ->unique()
                  ->after('name')
                  ->comment('displayName exacto que Toast envía en el webhook para hacer match con esta receta');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('toast_name');
        });
    }
};
