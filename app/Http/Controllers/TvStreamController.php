<?php

namespace App\Http\Controllers;

use App\Models\PromotionGroup;
use App\Models\TvStream;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class TvStreamController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('streamen/index', [
            'streams' => TvStream::with('group')->latest()->get(),
            'promotionGroups' => PromotionGroup::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:tv_streams,slug'],
            'youtube_url' => ['required', 'string', 'max:2048'],
            'promotion_group_id' => ['nullable', 'exists:promotion_groups,id'],
            'active' => ['boolean'],
            'ad_interval_seconds' => ['nullable', 'integer', 'min:10', 'max:86400'],
            'ad_count' => ['nullable', 'integer', 'min:1', 'max:50'],
            'pause_on_ads' => ['boolean'],
        ]);

        $validated['slug'] = $validated['slug']
            ? Str::slug($validated['slug'])
            : Str::slug($validated['name']);

        TvStream::create($validated);

        return back()->with('success', 'Stream creado exitosamente.');
    }

    public function update(Request $request, TvStream $streamen): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:tv_streams,slug,' . $streamen->id],
            'youtube_url' => ['required', 'string', 'max:2048'],
            'promotion_group_id' => ['nullable', 'exists:promotion_groups,id'],
            'active' => ['boolean'],
            'ad_interval_seconds' => ['nullable', 'integer', 'min:10', 'max:86400'],
            'ad_count' => ['nullable', 'integer', 'min:1', 'max:50'],
            'pause_on_ads' => ['boolean'],
        ]);

        $validated['slug'] = $validated['slug']
            ? Str::slug($validated['slug'])
            : Str::slug($validated['name']);

        $streamen->update($validated);

        return back()->with('success', 'Stream actualizado exitosamente.');
    }

    public function destroy(TvStream $streamen): RedirectResponse
    {
        $streamen->delete();

        return back()->with('success', 'Stream eliminado exitosamente.');
    }
}
