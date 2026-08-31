<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    protected $fillable = [
        'author_name',
        'author_initials',
        'avatar_color',
        'rating',
        'text',
        'date',
        'active',
        'sort_order',
    ];

    protected $casts = [
        'active' => 'boolean',
        'rating' => 'integer',
        'sort_order' => 'integer',
    ];
}
