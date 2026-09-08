<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TvStream;
use Illuminate\Http\JsonResponse;

class StreamApiController extends Controller
{
    /**
     * GET /api/v1/streams
     * Returns the active TV streams available to be shown on screens.
     */
    public function index(): JsonResponse
    {
        $streams = TvStream::with('group')
            ->where('active', true)
            ->orderBy('name')
            ->get()
            ->map(fn (TvStream $stream) => $this->formatStream($stream));

        return response()->json([
            'data' => $streams,
        ]);
    }

    /**
     * GET /api/v1/streams/{slug}
     * Returns a single active TV stream by slug, with its promotion group.
     */
    public function show(string $slug): JsonResponse
    {
        $stream = TvStream::with('group')
            ->where('slug', $slug)
            ->where('active', true)
            ->firstOrFail();

        return response()->json([
            'data' => $this->formatStream($stream),
        ]);
    }

    private function formatStream(TvStream $stream): array
    {
        return [
            'id' => $stream->id,
            'name' => $stream->name,
            'slug' => $stream->slug,
            'youtube_url' => $stream->youtube_url,
            'active' => $stream->active,
            'ad_interval_seconds' => (int) $stream->ad_interval_seconds,
            'ad_count' => (int) $stream->ad_count,
            'pause_on_ads' => (bool) $stream->pause_on_ads,
            'group' => $stream->group ? [
                'id' => $stream->group->id,
                'name' => $stream->group->name,
                'slug' => $stream->group->slug,
            ] : null,
        ];
    }
}
