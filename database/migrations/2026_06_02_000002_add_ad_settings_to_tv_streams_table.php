<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tv_streams', function (Blueprint $table) {
            $table->integer('ad_interval_seconds')->default(300);
            $table->integer('ad_count')->default(1);
            $table->boolean('pause_on_ads')->default(true);
        });
    }

    public function down(): void
    {
        Schema::table('tv_streams', function (Blueprint $table) {
            $table->dropColumn(['ad_interval_seconds', 'ad_count', 'pause_on_ads']);
        });
    }
};
