<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class MenuScreen extends Model
{
    protected $fillable = ['name', 'slug', 'description', 'position', 'active'];

    protected $casts = [
        'active' => 'boolean',
        'position' => 'integer',
    ];

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class)
            ->withPivot('position')
            ->withTimestamps()
            ->orderByPivot('position');
    }
}
