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
        Schema::table('toast_products', function (Blueprint $table) {
            $table->string('category_name', 255)->nullable()->after('toast_item_group_guid');
            $table->json('modifier_groups')->nullable()->after('active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('toast_products', function (Blueprint $table) {
            $table->dropColumn(['category_name', 'modifier_groups']);
        });
    }
};
