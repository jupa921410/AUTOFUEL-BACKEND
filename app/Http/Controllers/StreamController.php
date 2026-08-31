<?php

namespace App\Http\Controllers;

use App\Models\TvStream;
use Inertia\Inertia;
use Inertia\Response;

class StreamController extends Controller
{
    public function show(TvStream $streamen): Response
    {
        if (!$streamen->active) {
            abort(404);
        }

        $streamen->load('group');

        return Inertia::render('streamen/show', [
            'stream' => $streamen,
        ]);
    }
}
