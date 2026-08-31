<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CateringOrder;
use App\Models\Catering;
use Illuminate\Http\Request;

class CateringOrderApiController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'catering_id' => ['required', 'exists:caterings,id'],
            'client_name' => ['required', 'string', 'max:255'],
            'client_email' => ['nullable', 'email', 'max:255'],
            'client_phone' => ['nullable', 'string', 'max:50'],
            'delivery_date' => ['required', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $catering = Catering::findOrFail($validated['catering_id']);
        
        $order = CateringOrder::create([
            'catering_id' => $catering->id,
            'client_name' => $validated['client_name'],
            'client_email' => $validated['client_email'],
            'client_phone' => $validated['client_phone'],
            'delivery_date' => $validated['delivery_date'],
            'notes' => $validated['notes'] ?? null,
            'status'         => 'pending',
            'payment_status' => 'unpaid',
            'total_price'    => $catering->price,
        ]);

        return response()->json([
            'message' => 'Catering order created successfully.',
            'order' => $order
        ], 201);
    }
}
