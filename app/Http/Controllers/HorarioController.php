<?php

namespace App\Http\Controllers;

use App\Models\Horario;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HorarioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('horario/index', [
            'horarios' => Horario::orderByRaw("FIELD(day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')")->get(),
        ]);
    }

    /**
     * Store a newly created resource in storage (Optional, but included just in case).
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'day' => ['required', 'string', 'max:50'],
            'init' => ['nullable', 'date_format:H:i'],
            'end' => ['nullable', 'date_format:H:i'],
            'closed' => ['required', 'boolean'],
        ]);

        if ($request->boolean('closed')) {
            $validated['init'] = null;
            $validated['end'] = null;
        }

        Horario::create($validated);

        return back()->with('success', 'Schedule created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Horario $horario): RedirectResponse
    {
        $validated = $request->validate([
            'init' => ['nullable', 'date_format:H:i'],
            'end' => ['nullable', 'date_format:H:i'],
            'closed' => ['required', 'boolean'],
        ]);

        if ($request->boolean('closed')) {
            $validated['init'] = null;
            $validated['end'] = null;
        }

        $horario->update($validated);

        return back()->with('success', 'Schedule updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Horario $horario): RedirectResponse
    {
        $horario->delete();

        return back()->with('success', 'Schedule deleted successfully.');
    }
}
