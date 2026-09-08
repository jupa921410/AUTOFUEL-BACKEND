<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // When enabled, the TV board renders one extra column with the logo, store
        // name, a live clock, and (best-effort) current weather — in place of the
        // header bar that used to sit above the grid.
        Schema::table('menu_screens', function (Blueprint $table) {
            $table->boolean('show_info_widget')->default(false)->after('active');
        });
    }

    public function down(): void
    {
        Schema::table('menu_screens', function (Blueprint $table) {
            $table->dropColumn('show_info_widget');
        });
    }
};
