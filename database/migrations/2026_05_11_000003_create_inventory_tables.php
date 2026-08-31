<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── Categorías de inventario ──────────────────────────────────────────
        Schema::create('inventory_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('color', 20)->default('#6366f1'); // color para UI
            $table->timestamps();
        });

        // ── Artículos del inventario ──────────────────────────────────────────
        Schema::create('inventory_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('unit', 30)->default('unidad'); // kg, litro, caja, etc.
            $table->decimal('current_stock', 10, 3)->default(0);
            $table->decimal('min_stock', 10, 3)->default(0);    // alerta de stock bajo
            $table->decimal('cost_per_unit', 10, 2)->nullable(); // costo referencial
            $table->text('notes')->nullable();
            $table->boolean('active')->default(true);
            $table->timestamps();
        });

        // ── Movimientos de inventario (entradas/salidas/ajustes) ──────────────
        Schema::create('inventory_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['in', 'out', 'adjustment']); // entrada/salida/ajuste
            $table->decimal('quantity', 10, 3);
            $table->decimal('stock_before', 10, 3);
            $table->decimal('stock_after', 10, 3);
            $table->string('reason', 255)->nullable(); // motivo del movimiento
            $table->foreignId('inventory_purchase_item_id')->nullable(); // si viene de una compra
            $table->timestamps();
        });

        // ── Órdenes de compra ─────────────────────────────────────────────────
        Schema::create('inventory_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete(); // quien ordenó
            $table->string('supplier')->nullable();                  // proveedor
            $table->enum('status', ['draft', 'ordered', 'received', 'cancelled'])->default('draft');
            $table->decimal('total', 10, 2)->default(0);
            $table->date('ordered_at')->nullable();
            $table->date('received_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // ── Ítems de cada orden de compra ─────────────────────────────────────
        Schema::create('inventory_purchase_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_purchase_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inventory_item_id')->constrained()->cascadeOnDelete();
            $table->decimal('quantity', 10, 3);
            $table->decimal('unit_price', 10, 2)->default(0);
            $table->decimal('subtotal', 10, 2)->storedAs('quantity * unit_price');
            $table->timestamps();
        });

        // Ahora que purchase_items existe, agregamos la FK al movimiento
        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->foreign('inventory_purchase_item_id')
                  ->references('id')
                  ->on('inventory_purchase_items')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('inventory_movements', function (Blueprint $table) {
            $table->dropForeign(['inventory_purchase_item_id']);
        });
        Schema::dropIfExists('inventory_purchase_items');
        Schema::dropIfExists('inventory_purchases');
        Schema::dropIfExists('inventory_movements');
        Schema::dropIfExists('inventory_items');
        Schema::dropIfExists('inventory_categories');
    }
};
