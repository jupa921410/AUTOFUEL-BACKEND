<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SiteSettingController extends Controller
{
    /**
     * Display the site settings form.
     */
    public function index(): Response
    {
        // Fetch all specific settings we want to manage on this page
        $keys = ['promo_banner_active', 'promo_banner_text'];
        $settings = Setting::whereIn('key', $keys)->get();

        // Pass settings as a key-value hash map
        $settingsMap = [];
        foreach ($settings as $setting) {
            $value = $setting->value;
            if ($setting->type === 'boolean') {
                $value = filter_var($setting->value, FILTER_VALIDATE_BOOLEAN);
            }
            $settingsMap[$setting->key] = $value;
        }

        // Fallbacks if missing
        if (!isset($settingsMap['promo_banner_active'])) {
            $settingsMap['promo_banner_active'] = false;
        }

        return Inertia::render('site-settings/index', [
            'settings' => $settingsMap,
        ]);
    }

    /**
     * Update the site settings using a key-value payload.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'promo_banner_active' => ['boolean'],
            'promo_banner_text' => ['nullable', 'string'],
        ]);

        // Process validations dynamically
        foreach ($validated as $key => $value) {
            // Find the setting
            $setting = Setting::where('key', $key)->first();
            
            if ($setting) {
                // Formatting values back to strings for DB storage
                if (is_bool($value)) {
                    $setting->value = $value ? 'true' : 'false';
                } else {
                    $setting->value = $value;
                }
                $setting->save();
            } else {
                Setting::create([
                    'key' => $key,
                    'value' => is_bool($value) ? ($value ? 'true' : 'false') : $value,
                    'type' => is_bool($value) ? 'boolean' : 'string',
                ]);
            }
        }

        return back()->with('success', 'Settings updated successfully.');
    }
}
