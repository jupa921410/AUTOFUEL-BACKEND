<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('promotions', function (Blueprint $table) {
            $table->foreignId('promotion_group_id')
                  ->nullable()
                  ->after('id')
                  ->constrained('promotion_groups')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('promotions', function (Blueprint $table) {
            $table->dropForeign(['promotion_group_id']);
            $table->dropColumn('promotion_group_id');
        });
    }
};
