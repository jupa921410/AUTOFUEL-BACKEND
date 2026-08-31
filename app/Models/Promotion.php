<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Promotion extends Model
{
    protected $fillable = [
        'promotion_group_id',
        'title',
        'description',
        'discount_percentage',
        'start_date',
        'end_date',
        'active',
        'image',
        'media_type',
        'youtube_id',
    ];

    protected $casts = [
        'discount_percentage' => 'decimal:2',
        'start_date' => 'date',
        'end_date' => 'date',
        'active' => 'boolean',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(PromotionGroup::class, 'promotion_group_id');
    }
}
