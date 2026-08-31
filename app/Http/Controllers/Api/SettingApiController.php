<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class SettingApiController extends Controller
{
    /**
     * Get all public settings (e.g., promo banner).
     */
    public function index(): JsonResponse
    {
        // Only return specific public settings for the frontend app.
        $keys = ['promo_banner_active', 'promo_banner_text'];
        
        $settings = Setting::whereIn('key', $keys)->get();
        
        // Format as key => value array
        $formatted = [];
        foreach ($settings as $setting) {
            $value = $setting->value;
            if ($setting->type === 'boolean') {
                $value = filter_var($setting->value, FILTER_VALIDATE_BOOLEAN);
            }
            $formatted[$setting->key] = $value;
        }

        // Make sure missing keys default to sensible values
        if (!isset($formatted['promo_banner_active'])) {
             $formatted['promo_banner_active'] = false;
        }

        return response()->json(['data' => $formatted]);
    }
}
