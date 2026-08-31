<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryItem extends Model
{
    protected $fillable = [
        'inventory_category_id',
        'name',
        'unit',
        'current_stock',
        'min_stock',
        'cost_per_unit',
        'notes',
        'active',
    ];

    protected $casts = [
        'current_stock' => 'float',
        'min_stock'     => 'float',
        'cost_per_unit' => 'float',
        'active'        => 'boolean',
    ];

    // ── Relaciones ────────────────────────────────────────────────────────────

    public function category(): BelongsTo
    {
        return $this->belongsTo(InventoryCategory::class, 'inventory_category_id');
    }

    public function movements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class);
    }

    public function purchaseItems(): HasMany
    {
        return $this->hasMany(InventoryPurchaseItem::class);
    }

    public function productIngredients(): HasMany
    {
        return $this->hasMany(ProductIngredient::class);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** ¿El stock está por debajo del mínimo? */
    public function getLowStockAttribute(): bool
    {
        return $this->current_stock <= $this->min_stock;
    }

    /**
     * Registra un movimiento y actualiza el stock.
     * @param 'in'|'out'|'adjustment' $type
     */
    public function applyMovement(
        string $type,
        float $quantity,
        ?int $userId = null,
        ?string $reason = null,
        ?int $purchaseItemId = null,
    ): InventoryMovement {
        $before = $this->current_stock;

        $after = match ($type) {
            'in'         => $before + $quantity,
            'out'        => $before - $quantity,
            'adjustment' => $quantity, // valor absoluto
        };

        $this->update(['current_stock' => max(0, $after)]);

        return $this->movements()->create([
            'user_id'                     => $userId,
            'type'                        => $type,
            'quantity'                    => $quantity,
            'stock_before'                => $before,
            'stock_after'                 => max(0, $after),
            'reason'                      => $reason,
            'inventory_purchase_item_id'  => $purchaseItemId,
        ]);
    }
}
