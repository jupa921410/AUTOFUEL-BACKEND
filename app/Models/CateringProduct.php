<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class CateringProduct extends Model
{
    protected $fillable = [
        'name',
        'description',
        'price',
        'image',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    public function caterings(): BelongsToMany
    {
        return $this->belongsToMany(Catering::class);
    }
}
