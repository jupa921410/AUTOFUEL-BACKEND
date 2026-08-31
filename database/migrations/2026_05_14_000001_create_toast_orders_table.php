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
        Schema::create('toast_orders', function (Blueprint $table) {
            $table->id();

            // Identificador único de Toast
            $table->string('toast_guid')->unique()->comment('GUID de la orden en Toast POS');

            // Número de orden legible
            $table->string('order_number')->nullable()->comment('displayNumber de Toast');

            // Cliente
            $table->string('customer_name')->default('Cliente');

            // Fuente de la orden (local, Online, etc.)
            $table->string('source')->default('Local');

            // Estado de aprobación en Toast
            $table->string('approval_status')->default('OPEN')
                ->comment('approvalStatus de Toast: OPEN, APPROVED, VOIDED, etc.');

            // Estado local (mapeo interno)
            $table->enum('status', [
                'pending',
                'confirmed',
                'preparing',
                'ready',
                'delivered',
                'cancelled',
            ])->default('pending');

            // Totales
            $table->decimal('total_amount', 10, 2)->default(0);

            // Fecha de apertura de la orden en Toast
            $table->dateTime('opened_date')->nullable();

            // Ítems de la orden: [{ name, quantity, price }]
            $table->json('items')->nullable();

            // Payload completo del webhook (para auditoría / reprocesamiento)
            $table->json('raw_payload')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('toast_orders');
    }
};
