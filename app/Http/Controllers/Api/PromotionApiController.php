<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use App\Models\PromotionGroup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PromotionApiController extends Controller
{
    /**
     * GET /api/v1/promotions/{group}
     * Returns all promotions belonging to the given group slug.
     * Optional ?active=true filters only current active promotions.
     */
    public function byGroup(Request $request, string $group): JsonResponse
    {
        $promotionGroup = PromotionGroup::where('slug', $group)->firstOrFail();

        $query = $promotionGroup->promotions()->latest();

        if ($request->boolean('active', false)) {
            $query->where('active', true)
                  ->where('start_date', '<=', now())
                  ->where('end_date', '>=', now());
        }

        $promotions = $query->get()->map(fn ($p) => $this->formatPromotion($p));

        return response()->json([
            'group' => [
                'id'          => $promotionGroup->id,
                'name'        => $promotionGroup->name,
                'slug'        => $promotionGroup->slug,
                'description' => $promotionGroup->description,
                'active'      => $promotionGroup->active,
            ],
            'data' => $promotions,
        ]);
    }

    private function imageUrl(?string $image): ?string
    {
        if (!$image) return null;
        if (str_starts_with($image, 'images/')) {
            return asset($image);
        }
        return asset('storage/' . $image);
    }

    private function formatPromotion(Promotion $promotion): array
    {
        return [
            'id'                  => $promotion->id,
            'title'               => $promotion->title,
            'description'         => $promotion->description,
            'discount_percentage' => (float) $promotion->discount_percentage,
            'start_date'          => $promotion->start_date,
            'end_date'            => $promotion->end_date,
            'active'              => $promotion->active,
            'media_type'          => $promotion->media_type ?? 'image',
            'image'               => $this->imageUrl($promotion->image),
        ];
    }
}
