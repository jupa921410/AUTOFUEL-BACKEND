<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class InventoryPurchase extends Model
{
    protected $fillable = [
        'user_id',
        'supplier',
        'status',
        'total',
        'ordered_at',
        'received_at',
        'notes',
    ];

    protected $casts = [
        'total'       => 'float',
        'ordered_at'  => 'date',
        'received_at' => 'date',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(InventoryPurchaseItem::class);
    }

    public function recalculateTotal(): void
    {
        $this->update(['total' => $this->items()->sum('subtotal')]);
    }

    public function getStatusLabelAttribute(): string
    {
        return match ($this->status) {
            'draft'     => 'Borrador',
            'ordered'   => 'Ordenado',
            'received'  => 'Recibido',
            'cancelled' => 'Cancelado',
            default     => ucfirst($this->status),
        };
    }
}
