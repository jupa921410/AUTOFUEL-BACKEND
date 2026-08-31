<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReviewController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('reviews/index', [
            'reviews' => Review::orderBy('sort_order', 'asc')
                ->orderBy('created_at', 'desc')
                ->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'author_name' => ['required', 'string', 'max:255'],
            'author_initials' => ['required', 'string', 'max:5'],
            'avatar_color' => ['required', 'string', 'max:255'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'text' => ['required', 'string'],
            'date' => ['nullable', 'string', 'max:255'],
            'active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ]);

        Review::create($validated);

        return back()->with('success', 'Review creada exitosamente.');
    }

    public function update(Request $request, Review $review): RedirectResponse
    {
        $validated = $request->validate([
            'author_name' => ['required', 'string', 'max:255'],
            'author_initials' => ['required', 'string', 'max:5'],
            'avatar_color' => ['required', 'string', 'max:255'],
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
            'text' => ['required', 'string'],
            'date' => ['nullable', 'string', 'max:255'],
            'active' => ['boolean'],
            'sort_order' => ['integer', 'min:0'],
        ]);

        $review->update($validated);

        return back()->with('success', 'Review actualizada exitosamente.');
    }

    public function destroy(Review $review): RedirectResponse
    {
        $review->delete();

        return back()->with('success', 'Review eliminada exitosamente.');
    }
}
