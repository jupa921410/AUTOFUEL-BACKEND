<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CateringOrder extends Model
{
    protected $fillable = [
        'catering_id',
        'client_name',
        'client_email',
        'client_phone',
        'delivery_date',
        'status',
        'total_price',
        'notes',
        'stripe_session_id',
        'payment_status',
    ];

    /**
     * status values: awaiting_payment | pending | confirmed | preparing | delivered | cancelled
     * payment_status values: unpaid | paid
     */

    protected $casts = [
        'total_price'   => 'decimal:2',
        'delivery_date' => 'datetime',
    ];

    public function catering(): BelongsTo
    {
        return $this->belongsTo(Catering::class);
    }
}

