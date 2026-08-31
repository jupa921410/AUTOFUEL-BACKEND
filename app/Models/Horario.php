<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Horario extends Model
{
    use HasFactory;
    protected $fillable = [
        'day',
        'init',
        'end',
        'closed'
    ];

    protected $casts = [
        'closed' => 'boolean'
    ];
}
