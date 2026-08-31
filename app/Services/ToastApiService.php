<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Cliente reutilizable para la API de Toast.
 * Centraliza la autenticación y las llamadas HTTP.
 */
class ToastApiService
{
    private string $baseUrl;
    private string $clientId;
    private string $clientSecret;
    private string $restaurantGuid;

    public function __construct()
    {
        $this->baseUrl        = config('services.toast.base_url', 'https://ws-api.toasttab.com');
        $this->clientId       = config('services.toast.client_id');
        $this->clientSecret   = config('services.toast.client_secret');
        $this->restaurantGuid = config('services.toast.restaurant_guid');
    }

    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Obtiene el access token de Toast (con caché de 55 min).
     */
    public function getAccessToken(): ?string
    {
        return Cache::remember('toast_access_token', 55 * 60, function () {
            $response = Http::withoutVerifying()->post("{$this->baseUrl}/authentication/v1/authentication/login", [
                'clientId'       => $this->clientId,
                'clientSecret'   => $this->clientSecret,
                'userAccessType' => 'TOAST_MACHINE_CLIENT',
            ]);

            if ($response->successful()) {
                $token = $response->json('token.accessToken');
                Log::info('[ToastApiService] Token obtenido correctamente.');
                return $token;
            }

            Log::error('[ToastApiService] Error obteniendo token.', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            return null;
        });
    }

    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Construye los headers comunes para las peticiones a Toast.
     */
    private function headers(string $token): array
    {
        return [
            'Authorization'                => "Bearer {$token}",
            'Accept'                       => 'application/json',
            'Toast-Restaurant-External-ID' => $this->restaurantGuid,
        ];
    }

    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Obtiene todos los MenuItems desde /menus/v2/menus.
     * Incluye modifier groups resueltos con opciones y precios.
     *
     * @return array Lista de items con name, guid, price, modifier_groups
     */
    public function getMenuItems(): array
    {
        $token = $this->getAccessToken();

        if (!$token) {
            Log::error('[ToastApiService] Sin token — no se puede obtener el menú.');
            return [];
        }

        $response = Http::withoutVerifying()
            ->withHeaders($this->headers($token))
            ->get("{$this->baseUrl}/menus/v2/menus");

        if (!$response->successful()) {
            Log::error('[ToastApiService] Error obteniendo menus.', [
                'status' => $response->status(),
                'body'   => $response->body(),
            ]);
            return [];
        }

        $data = $response->json() ?? [];

        // ── Construir lookup maps por referenceId ─────────────────────────────
        $modGroupsByRef = [];
        foreach ($data['modifierGroupReferences'] ?? [] as $mg) {
            $refId = $mg['referenceId'] ?? null;
            if ($refId !== null) $modGroupsByRef[$refId] = $mg;
        }

        $modOptionsByRef = [];
        foreach ($data['modifierOptionReferences'] ?? [] as $mo) {
            $refId = $mo['referenceId'] ?? null;
            if ($refId !== null) $modOptionsByRef[$refId] = $mo;
        }

        $mappedItems = [];

        // ── Helper para resolver modifier groups de un item ──────────────────
        $resolveModifierGroups = function (array $mgRefIds) use ($modGroupsByRef, $modOptionsByRef): array {
            $groups = [];
            foreach ($mgRefIds as $mgRefId) {
                $mg = $modGroupsByRef[$mgRefId] ?? null;
                if (!$mg) continue;

                $options = [];
                foreach ($mg['modifierOptionReferences'] ?? [] as $moRefId) {
                    $mo = $modOptionsByRef[$moRefId] ?? null;
                    if (!$mo) continue;

                    $options[] = [
                        'guid'  => $mo['guid'] ?? null,
                        'name'  => $mo['name'] ?? 'Sin nombre',
                        'price' => (float) ($mo['price'] ?? 0),
                    ];
                }

                $groups[] = [
                    'guid'          => $mg['guid'] ?? null,
                    'name'          => $mg['name'] ?? 'Sin nombre',
                    'requiredMode'  => $mg['requiredMode'] ?? 'OPTIONAL',
                    'minSelections' => $mg['minSelections'] ?? 0,
                    'maxSelections' => $mg['maxSelections'] ?? null,
                    'options'       => $options,
                ];
            }
            return $groups;
        };

        // ── Helper recursivo para procesar grupos de menús ───────────────────
        $extractItems = function ($groups) use (&$mappedItems, &$extractItems, $resolveModifierGroups) {
            foreach ($groups as $group) {
                $groupGuid = $group['guid'] ?? null;
                $groupName = $group['name'] ?? null;
                foreach ($group['menuItems'] ?? [] as $item) {
                    $guid = $item['guid'] ?? null;
                    if (!$guid) continue;

                    $modifierGroups = $resolveModifierGroups($item['modifierGroupReferences'] ?? []);

                    $mappedItems[$guid] = [
                        'guid'            => $guid,
                        'itemGroupGuid'   => $groupGuid,
                        'category_name'   => $groupName,
                        'name'            => $item['name'] ?? 'Sin nombre',
                        'description'     => $item['description'] ?? null,
                        'image_url'       => $item['image'] ?? null,
                        'plu'             => $item['plu'] ?? null,
                        'price'           => (float) ($item['price'] ?? 0),
                        'unitOfMeasure'   => $item['unitOfMeasure'] ?? 'NONE',
                        'visibility'      => is_array($item['visibility'])
                            ? (in_array('POS', $item['visibility']) || in_array('TOAST_ONLINE_ORDERING', $item['visibility']) ? 'VISIBLE' : 'HIDDEN')
                            : ($item['visibility'] ?? 'VISIBLE'),
                        'discontinued'    => $item['discontinued'] ?? false,
                        'modifier_groups' => $modifierGroups,
                        'raw_payload'     => $item,
                    ];
                }
                if (!empty($group['menuGroups'])) {
                    $extractItems($group['menuGroups']);
                }
            }
        };

        // 1. Procesar menús estándar
        foreach ($data['menus'] ?? [] as $menu) {
            if (!empty($menu['menuGroups'])) {
                $extractItems($menu['menuGroups']);
            }
        }

        // 2. Procesar modificadores/agregos de la sección modifierOptionReferences
        foreach ($data['modifierOptionReferences'] ?? [] as $modRef) {
            $guid = $modRef['guid'] ?? null;
            if (!$guid) continue;

            if (!isset($mappedItems[$guid])) {
                $mappedItems[$guid] = [
                    'guid'            => $guid,
                    'itemGroupGuid'   => null,
                    'name'            => $modRef['name'] ?? 'Sin nombre',
                    'description'     => $modRef['description'] ?? null,
                    'image_url'       => $modRef['image'] ?? null,
                    'plu'             => $modRef['plu'] ?? null,
                    'price'           => (float) ($modRef['price'] ?? 0),
                    'unitOfMeasure'   => $modRef['unitOfMeasure'] ?? 'NONE',
                    'visibility'      => is_array($modRef['visibility'])
                        ? (in_array('POS', $modRef['visibility']) || in_array('TOAST_ONLINE_ORDERING', $modRef['visibility']) ? 'VISIBLE' : 'HIDDEN')
                        : ($modRef['visibility'] ?? 'VISIBLE'),
                    'discontinued'    => $modRef['discontinued'] ?? false,
                    'modifier_groups' => [],
                    'raw_payload'     => $modRef,
                ];
            }
        }

        Log::info('[ToastApiService] MenuItems obtenidos desde /menus/v2/menus: ' . count($mappedItems));
        return array_values($mappedItems);
    }

    /**
     * Sincroniza recetas desde el menú de Toast.
     * Crea/actualiza recetas con el nombre exacto de Toast como toast_name.
     * Retorna estadísticas: ['created' => N, 'updated' => N, 'total' => N]
     */
    public function syncRecipesFromMenu(): array
    {
        $items = $this->getMenuItems();

        if (empty($items)) {
            Log::warning('[ToastApiService] No se obtuvieron items del menú.');
            return ['created' => 0, 'updated' => 0, 'total' => 0];
        }

        $created = 0;
        $updated = 0;

        foreach ($items as $item) {
            $name = trim($item['name'] ?? '');
            if (!$name) continue;

            $priceRaw = $item['price'] ?? 0;
            $price    = is_int($priceRaw) && $priceRaw > 100 ? $priceRaw / 100 : (float) $priceRaw;

            $recipe = \App\Models\Recipe::where('toast_name', $name)->first();

            if ($recipe) {
                $recipe->update(['name' => $name, 'price' => $price]);
                $updated++;
            } else {
                \App\Models\Recipe::create([
                    'name'       => $name,
                    'toast_name' => $name,
                    'price'      => $price,
                    'active'     => true,
                ]);
                $created++;
            }
        }

        Log::info("[ToastApiService] Sync recetas: {$created} creadas, {$updated} actualizadas.");
        return ['created' => $created, 'updated' => $updated, 'total' => $created + $updated];
    }

    /**
     * Extrae productos únicos desde las órdenes ya recibidas por webhook.
     * Esta es la fuente de datos principal cuando el API de menú no está disponible.
     *
     * Retorna un array con el formato:
     * [ ['name' => '...', 'price' => 0.00, 'source' => 'webhook'], ... ]
     */
    public function syncFromWebhookOrders(): array
    {
        // Importar modelo aquí para no acoplar el servicio al principio
        $orders = \App\Models\ToastOrder::whereNotNull('items')
            ->get(['items', 'raw_payload']);

        $products = [];

        foreach ($orders as $order) {
            $items = $order->items ?? [];

            foreach ($items as $item) {
                $name = trim($item['name'] ?? '');
                if (!$name || $name === 'Producto') {
                    continue;
                }

                // Clave normalizada para deduplicar
                $key = strtolower($name);
                if (!isset($products[$key])) {
                    $products[$key] = [
                        'name'  => $name,
                        'price' => (float) ($item['price'] ?? 0),
                    ];
                }
            }
        }

        Log::info('[ToastApiService] Productos únicos extraídos de órdenes webhook: ' . count($products));
        return array_values($products);
    }

    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Obtiene órdenes en un rango de fechas.
     */
    public function getOrders(string $startDate, string $endDate, int $page = 1, int $pageSize = 100): array
    {
        $token = $this->getAccessToken();

        if (!$token) {
            return [];
        }

        $response = Http::withoutVerifying()
            ->withHeaders($this->headers($token))
            ->get("{$this->baseUrl}/orders/v2/ordersBulk", [
                'startDate' => $startDate,
                'endDate'   => $endDate,
                'page'      => $page,
                'pageSize'  => $pageSize,
            ]);

        if ($response->successful()) {
            return $response->json() ?? [];
        }

        Log::error('[ToastApiService] Error obteniendo órdenes.', [
            'status' => $response->status(),
            'body'   => $response->body(),
        ]);
        return [];
    }
}
