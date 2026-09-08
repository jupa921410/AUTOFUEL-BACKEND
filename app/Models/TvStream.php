<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TvStream extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'youtube_url',
        'promotion_group_id',
        'active',
        'ad_interval_seconds',
        'ad_count',
        'pause_on_ads',
    ];

    protected $casts = [
        'active' => 'boolean',
        'pause_on_ads' => 'boolean',
    ];

    public function group(): BelongsTo
    {
        return $this->belongsTo(PromotionGroup::class, 'promotion_group_id');
    }
}
