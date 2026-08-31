<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ToastProductIngredient extends Model
{
    protected $table = 'toast_product_ingredients';

    protected $fillable = [
        'toast_product_id',
        'inventory_item_id',
        'quantity',
    ];

    protected $casts = [
        'quantity' => 'float',
    ];

    // ── Relaciones ────────────────────────────────────────────────────────────

    public function toastProduct(): BelongsTo
    {
        return $this->belongsTo(ToastProduct::class);
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }
}
