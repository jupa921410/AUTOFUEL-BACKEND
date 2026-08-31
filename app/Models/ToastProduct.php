<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ToastProduct extends Model
{
    protected $table = 'toast_products';

    protected $fillable = [
        'toast_guid',
        'toast_item_group_guid',
        'category_name',
        'name',
        'description',
        'image_url',
        'plu',
        'price',
        'unit_of_measure',
        'active',
        'modifier_groups',
        'raw_payload',
    ];

    protected $casts = [
        'price'           => 'decimal:2',
        'active'          => 'boolean',
        'modifier_groups' => 'array',
        'raw_payload'     => 'array',
    ];

    // ── Relaciones ────────────────────────────────────────────────────────────

    public function ingredients(): HasMany
    {
        return $this->hasMany(ToastProductIngredient::class);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Busca un ToastProduct por su displayName (case-insensitive).
     * Usado desde el webhook para hacer el match con las órdenes.
     */
    public static function findByName(string $displayName): ?self
    {
        return static::whereRaw('LOWER(name) = ?', [strtolower(trim($displayName))])
            ->with('ingredients.inventoryItem')
            ->first();
    }
}
