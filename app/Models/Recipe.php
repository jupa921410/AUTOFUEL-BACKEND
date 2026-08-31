<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Recipe extends Model
{
    protected $fillable = [
        'name',
        'toast_name',
        'description',
        'price',
        'active',
    ];

    protected $casts = [
        'price'  => 'decimal:2',
        'active' => 'boolean',
    ];

    // ── Relaciones ────────────────────────────────────────────────────────────

    public function ingredients(): HasMany
    {
        return $this->hasMany(RecipeIngredient::class);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /**
     * Busca una receta por su toast_name exacto.
     * Si no hay coincidencia exacta, intenta por nombre (case-insensitive) como fallback.
     * Usado desde el webhook para hacer el match con los items de la orden.
     */
    public static function findByToastName(string $displayName): ?self
    {
        // 1. Coincidencia exacta por toast_name
        $recipe = static::where('toast_name', $displayName)
            ->with('ingredients.inventoryItem')
            ->first();

        if ($recipe) {
            return $recipe;
        }

        // 2. Fallback: nombre de la receta igual al displayName (case-insensitive)
        return static::whereRaw('LOWER(name) = ?', [strtolower(trim($displayName))])
            ->with('ingredients.inventoryItem')
            ->first();
    }
}
