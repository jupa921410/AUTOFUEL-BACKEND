<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryMovement extends Model
{
    protected $fillable = [
        'inventory_item_id',
        'user_id',
        'type',
        'quantity',
        'stock_before',
        'stock_after',
        'reason',
        'inventory_purchase_item_id',
    ];

    protected $casts = [
        'quantity'     => 'float',
        'stock_before' => 'float',
        'stock_after'  => 'float',
    ];

    public function item(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function purchaseItem(): BelongsTo
    {
        return $this->belongsTo(InventoryPurchaseItem::class, 'inventory_purchase_item_id');
    }

    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            'in'         => 'Entrada',
            'out'        => 'Salida',
            'adjustment' => 'Ajuste',
            default      => ucfirst($this->type),
        };
    }
}
