<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Post;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PostApiController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Post::where('is_published', true)->orderBy('published_at', 'desc');

        if ($request->has('search')) {
            $query->where('title', 'like', '%' . $request->query('search') . '%');
        }

        $posts = $query->paginate(10)->through(fn($p) => $this->formatPost($p));

        return response()->json($posts);
    }

    public function show(string $slug): JsonResponse
    {
        $post = Post::where('slug', $slug)->where('is_published', true)->firstOrFail();

        return response()->json(['data' => $this->formatPost($post)]);
    }

    private function imageUrl(?string $image): ?string
    {
        if (!$image) return null;

        return str_starts_with($image, 'images/')
            ? asset($image)
            : asset('storage/' . $image);
    }

    private function formatPost(Post $post): array
    {
        return [
            'id'           => $post->id,
            'title'        => $post->title,
            'slug'         => $post->slug,
            'excerpt'      => $post->excerpt,
            'content'      => $post->content,
            'image'        => $this->imageUrl($post->image),
            'published_at' => $post->published_at ? $post->published_at->toIso8601String() : null,
        ];
    }
}
