<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Horario;
use Illuminate\Http\JsonResponse;

class HorarioApiController extends Controller
{
    /**
     * Get all business hours.
     */
    public function index(): JsonResponse
    {
        $horarios = Horario::orderByRaw("FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')")->get();
        
        return response()->json(['data' => $horarios]);
    }
}
