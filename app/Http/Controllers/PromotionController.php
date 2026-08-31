<?php

namespace App\Http\Controllers;

use App\Models\Promotion;
use App\Models\PromotionGroup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class PromotionController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('promotions/index', [
            'promotions'      => Promotion::with('group')->latest()->get(),
            'promotionGroups' => PromotionGroup::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'promotion_group_id' => ['nullable', 'exists:promotion_groups,id'],
            'title'              => ['nullable', 'string', 'max:255'],
            'description'        => ['nullable', 'string'],
            'discount_percentage'=> ['required', 'numeric', 'min:0', 'max:100'],
            'start_date'         => ['required', 'date'],
            'end_date'           => ['required', 'date', 'after_or_equal:start_date'],
            'active'             => ['boolean'],
            'media'              => ['nullable', 'file', 'mimetypes:image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm', 'max:51200'],
            'youtube_url'        => ['nullable', 'string'],
        ]);

        if ($request->hasFile('media')) {
            $file = $request->file('media');
            $mimeType = $file->getMimeType();
            $mediaType = str_starts_with($mimeType, 'video/') ? 'video' : 'image';
            $validated['image'] = $file->store('promotions', 'public');
            $validated['media_type'] = $mediaType;
        }

        // If youtube_url present, extract video id and prefer that over uploaded media
        if (!empty($validated['youtube_url'])) {
            $validated['youtube_id'] = $this->extractYoutubeId($validated['youtube_url']);
            if ($validated['youtube_id']) {
                $validated['media_type'] = 'youtube';
                // optionally clear image fields when using youtube
                $validated['image'] = $validated['image'] ?? null;
            }
        }

        unset($validated['media']);
        Promotion::create($validated);

        return back()->with('success', 'Promotion creada exitosamente.');
    }

    public function update(Request $request, Promotion $promotion): RedirectResponse
    {
        $validated = $request->validate([
            'promotion_group_id' => ['nullable', 'exists:promotion_groups,id'],
            'title'              => ['nullable', 'string', 'max:255'],
            'description'        => ['nullable', 'string'],
            'discount_percentage'=> ['required', 'numeric', 'min:0', 'max:100'],
            'start_date'         => ['required', 'date'],
            'end_date'           => ['required', 'date', 'after_or_equal:start_date'],
            'active'             => ['boolean'],
            'media'              => ['nullable', 'file', 'mimetypes:image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm', 'max:51200'],
            'youtube_url'        => ['nullable', 'string'],
        ]);

        if ($request->hasFile('media')) {
            if ($promotion->image) {
                Storage::disk('public')->delete($promotion->image);
            }
            $file = $request->file('media');
            $mimeType = $file->getMimeType();
            $mediaType = str_starts_with($mimeType, 'video/') ? 'video' : 'image';
            $validated['image'] = $file->store('promotions', 'public');
            $validated['media_type'] = $mediaType;
        }

        if (!empty($validated['youtube_url'])) {
            $validated['youtube_id'] = $this->extractYoutubeId($validated['youtube_url']);
            if ($validated['youtube_id']) {
                $validated['media_type'] = 'youtube';
                // remove stored image when switching to youtube (optional)
                if ($promotion->image) {
                    Storage::disk('public')->delete($promotion->image);
                    $validated['image'] = null;
                }
            }
        }

        unset($validated['media']);
        $promotion->update($validated);

        return back()->with('success', 'Promotion actualizada exitosamente.');
    }

    public function destroy(Promotion $promotion): RedirectResponse
    {
        if ($promotion->image) {
            Storage::disk('public')->delete($promotion->image);
        }

        $promotion->delete();

        return back()->with('success', 'Promotion eliminada exitosamente.');
    }

    private function extractYoutubeId(?string $url): ?string
    {
        if (!$url) return null;
        // Common YouTube URL formats
        $patterns = [
            '/youtu\.be\/(?<id>[A-Za-z0-9_-]{11})/',
            '/v= (?<id>[A-Za-z0-9_-]{11})/x',
            '/watch\?v=(?<id>[A-Za-z0-9_-]{11})/',
            '/embed\/(?<id>[A-Za-z0-9_-]{11})/',
            '/youtube\.com\/shorts\/(?<id>[A-Za-z0-9_-]{11})/',
        ];
        foreach ($patterns as $p) {
            if (preg_match($p, $url, $m) && !empty($m['id'])) {
                return $m['id'];
            }
        }
        // If the input already looks like an id
        if (preg_match('/^[A-Za-z0-9_-]{11}$/', $url)) {
            return $url;
        }
        return null;
    }
}
