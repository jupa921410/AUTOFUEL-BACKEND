<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class MenuScreen extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'position', 'active', 'show_info_widget'];

    protected $casts = [
        'active' => 'boolean',
        'position' => 'integer',
        'show_info_widget' => 'boolean',
    ];

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class)
            ->withPivot('position', 'layout')
            ->withTimestamps()
            ->orderByPivot('position');
    }

    /**
     * Optional per-screen product picks (see menu_screen_product migration). Empty for a
     * category means "show every product in that category" — this only restricts it once
     * an admin explicitly selects specific products.
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class)
            ->withPivot('position')
            ->withTimestamps()
            ->orderByPivot('position');
    }
}
