<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Catering extends Model
{
    protected $fillable = [
        'name',
        'description',
        'pax',
        'price',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'pax' => 'integer',
    ];

    public function cateringProducts(): BelongsToMany
    {
        return $this->belongsToMany(CateringProduct::class);
    }
}
