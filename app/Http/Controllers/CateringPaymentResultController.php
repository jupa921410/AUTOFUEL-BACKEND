<?php

namespace App\Http\Controllers;

use App\Models\CateringOrder;
use Illuminate\Http\Request;

class CateringPaymentResultController extends Controller
{
    /**
     * Página de éxito tras completar el pago de catering.
     */
    public function success(Request $request)
    {
        $orderId = $request->query('order_id');
        $order = $orderId ? CateringOrder::with('catering')->find($orderId) : null;

        return view('catering.payment-success', compact('order'));
    }

    /**
     * Página de cancelación del pago de catering.
     */
    public function cancel(Request $request)
    {
        $orderId = $request->query('order_id');
        $order = $orderId ? CateringOrder::with('catering')->find($orderId) : null;

        return view('catering.payment-cancel', compact('order'));
    }
}
