<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Catering;
use Illuminate\Http\Request;

class CateringApiController extends Controller
{
    public function index()
    {
        $caterings = Catering::with('cateringProducts')->get();
        return response()->json($caterings);
    }
}
