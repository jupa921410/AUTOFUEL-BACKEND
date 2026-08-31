<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RecipeIngredient extends Model
{
    protected $table = 'recipe_ingredients';

    protected $fillable = [
        'recipe_id',
        'inventory_item_id',
        'quantity',
    ];

    protected $casts = [
        'quantity' => 'float',
    ];

    // ── Relaciones ────────────────────────────────────────────────────────────

    public function recipe(): BelongsTo
    {
        return $this->belongsTo(Recipe::class);
    }

    public function inventoryItem(): BelongsTo
    {
        return $this->belongsTo(InventoryItem::class);
    }
}
