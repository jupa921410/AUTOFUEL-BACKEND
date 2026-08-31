<?php

namespace App\Http\Controllers;

use App\Models\AccountingCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TicketScannerController extends Controller
{
    public function scan(Request $request): JsonResponse
    {
        $request->validate([
            'image' => ['required', 'image', 'max:10240'], // max 10 MB
        ]);

        $apiKey = config('services.gemini.api_key');

        if (! $apiKey) {
            return response()->json(['error' => 'GEMINI_API_KEY no configurada.'], 500);
        }

        // Load expense categories to help Gemini assign them
        $categories = AccountingCategory::where('type', 'expense')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn ($c) => ['id' => $c->id, 'name' => $c->name])
            ->values()
            ->toArray();

        $categoriesJson = json_encode($categories, JSON_UNESCAPED_UNICODE);

        // Build the prompt
        $prompt = <<<PROMPT
Analyze this receipt/ticket image and extract all expense line items.

Return ONLY a valid JSON array with this exact structure, no markdown, no explanation:
[
  {
    "description": "Item name or description",
    "amount": 0.00,
    "date": "YYYY-MM-DD",
    "category_id": null,
    "category_name": null
  }
]

Rules:
- "amount" must be a positive number (float).
- "date" must be the date on the receipt in YYYY-MM-DD format. If not visible, use today: {$this->today()}.
- If the receipt has a single total, return ONE item with that total and a description like the store name.
- If there are multiple line items, return each one separately.
- For "category_id" and "category_name": try to match the item to one of the following expense categories. If no match, set both to null.
  Available categories: {$categoriesJson}
- Do NOT invent categories not in the list.
- Return ONLY the JSON array, nothing else.
PROMPT;

        // Convert image to base64
        $imageFile = $request->file('image');
        $imageBase64 = base64_encode(file_get_contents($imageFile->getRealPath()));
        $mimeType = $imageFile->getMimeType();

        // Call Gemini API
        // Note: verify => false only needed in local Windows dev (Guzzle ignores php.ini curl.cainfo)
        $sslVerify = app()->isProduction() ? true : false;
        $response = Http::timeout(30)->withOptions(['verify' => $sslVerify])->post(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={$apiKey}",
            [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'inline_data' => [
                                    'mime_type' => $mimeType,
                                    'data'      => $imageBase64,
                                ],
                            ],
                            [
                                'text' => $prompt,
                            ],
                        ],
                    ],
                ],
                'generationConfig' => [
                    'temperature'      => 0.1,
                    'responseMimeType' => 'application/json',
                ],
            ]
        );

        if ($response->failed()) {
            return response()->json([
                'error' => 'Error al conectar con Gemini: ' . $response->status(),
            ], 502);
        }

        // Parse Gemini response
        $body = $response->json();
        $text = $body['candidates'][0]['content']['parts'][0]['text'] ?? null;

        if (! $text) {
            return response()->json(['error' => 'Gemini returned no content.'], 502);
        }

        // Try to decode JSON
        $items = json_decode($text, true);

        if (json_last_error() !== JSON_ERROR_NONE || ! is_array($items)) {
            // Attempt to extract JSON array from text
            preg_match('/\[.*\]/s', $text, $matches);
            $items = $matches ? json_decode($matches[0], true) : null;
        }

        if (! $items || ! is_array($items)) {
            return response()->json(['error' => 'Could not extract information from the receipt.'], 422);
        }

        // Sanitize items
        $today = $this->today();
        $sanitized = array_map(function ($item) use ($today) {
            return [
                'description'   => (string) ($item['description'] ?? 'Gasto'),
                'amount'        => max(0.01, (float) ($item['amount'] ?? 0)),
                'date'          => $this->sanitizeDate($item['date'] ?? null, $today),
                'category_id'   => isset($item['category_id']) ? (int) $item['category_id'] : null,
                'category_name' => $item['category_name'] ?? null,
            ];
        }, array_values($items));

        return response()->json(['items' => $sanitized]);
    }

    private function today(): string
    {
        return now()->toDateString();
    }

    private function sanitizeDate(?string $date, string $fallback): string
    {
        if (! $date) {
            return $fallback;
        }
        try {
            return \Illuminate\Support\Carbon::parse($date)->toDateString();
        } catch (\Exception) {
            return $fallback;
        }
    }
}
