<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // How this category renders on this specific screen: a compact text list
        // (default, existing behavior) or a full-column rotating photo slider of its
        // products.
        Schema::table('category_menu_screen', function (Blueprint $table) {
            $table->string('layout')->default('list')->after('position');
        });
    }

    public function down(): void
    {
        Schema::table('category_menu_screen', function (Blueprint $table) {
            $table->dropColumn('layout');
        });
    }
};
