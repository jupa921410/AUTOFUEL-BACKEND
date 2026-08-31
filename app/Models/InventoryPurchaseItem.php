<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryPurchaseItem extends Model
{
    protected $fillable = [
        'inventory_purchase_id',
        'inventory_item_id',
        'quantity',
        'unit_price',
    ];

    protected $casts = [
        'quantity'   => 'float',
        'unit_price' => 'float',
        'subtotal'   => 'float',
    ];

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(InventoryPurchase::class, 'inventory_purchase_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class, 'inventory_item_id');
    }
}
