<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Transaction extends Model
{
    protected $fillable = [
        'accounting_category_id',
        'type',
        'amount',
        'description',
        'date',
        'notes',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'date'   => 'date',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(AccountingCategory::class, 'accounting_category_id');
    }
}
