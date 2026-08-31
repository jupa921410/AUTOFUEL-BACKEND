<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class ToastOrder extends Model
{
    protected $table = 'toast_orders';

    protected $fillable = [
        'toast_guid',
        'order_number',
        'customer_name',
        'source',
        'approval_status',
        'status',
        'total_amount',
        'opened_date',
        'items',
        'raw_payload',
        'inventory_deducted',
    ];

    protected $casts = [
        'items'               => 'array',
        'raw_payload'         => 'array',
        'opened_date'         => 'datetime',
        'total_amount'        => 'decimal:2',
        'inventory_deducted'  => 'boolean',
    ];
}
