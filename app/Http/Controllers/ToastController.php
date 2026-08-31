<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ToastController extends Controller
{
    protected string $baseUrl;
    protected string $clientId;
    protected string $clientSecret;

    public function __construct()
    {
        $this->baseUrl = config('services.toast.base_url');
        $this->clientId = config('services.toast.client_id');
        $this->clientSecret = config('services.toast.client_secret');
    }

    /**
     * Get Toast API Access Token
     */
    private function getAccessToken(): ?array
    {
        // Bypass cache for debugging
        $response = Http::post("{$this->baseUrl}/authentication/v1/authentication/login", [
            'clientId' => $this->clientId,
            'clientSecret' => $this->clientSecret,
            'userAccessType' => 'TOAST_MACHINE_CLIENT',
        ]);

        if ($response->successful()) {
                $data = $response->json();
                $token = $data['token']['accessToken'] ?? null;
                $restaurantGuid = null;

                // Attempt to extract restaurantGuid from JWT if present
                if ($token && str_contains($token, '.')) {
                    $parts = explode('.', $token);
                    if (isset($parts[1])) {
                        $payload = json_decode(base64_decode($parts[1]), true);
                        $restaurantGuid = $payload['restaurantGuid'] ?? $payload['res'] ?? null;
                    }
                }

                return [
                    'token' => $token,
                    'restaurants' => $data['restaurants'] ?? [],
                    'extractedGuid' => $restaurantGuid,
                ];
            }

            return null;
    }

    /**
     * List Toast Orders
     */
    public function ordersIndex(Request $request): Response
    {
        $authData = $this->getAccessToken();
        $token = $authData['token'] ?? null;
        $orders = [];
        $error = null;
        $selectedDate = $request->query('date', date('Y-m-d'));

        if (!$token) {
            $error = "No se pudo autenticar con Toast API. Revisa las credenciales.";
        } else {
            $guid = config('services.toast.restaurant_guid');
            
            if (!$guid) {
                $error = "Se requiere el TOAST_RESTAURANT_GUID en el archivo .env para continuar.";
            } else {
                $headers = [
                    'Accept' => 'application/json',
                    'Toast-Restaurant-External-ID' => $guid,
                ];

                // Dates: Desde el inicio del día seleccionado hasta el inicio del día siguiente
                $startDate = $selectedDate . 'T00:00:00.000' . date('O');
                $endDate = date('Y-m-d', strtotime($selectedDate . ' +1 day')) . 'T00:00:00.000' . date('O');

                Log::info("Fetching Toast orders for date: {$selectedDate} and GUID: {$guid}");
                
                $ordersResponse = Http::withToken($token)
                    ->withHeaders($headers)
                    ->get("{$this->baseUrl}/orders/v2/ordersBulk", [
                        'startDate' => $startDate,
                        'endDate'   => $endDate,
                        'page'      => 1,
                        'pageSize'  => 100
                    ]);

                if ($ordersResponse->successful()) {
                    $rawOrders = $ordersResponse->json();
                    
                    // Transformar la estructura compleja de Toast en una lista plana y fácil de leer
                    $orders = collect($rawOrders)->map(function($order) {
                        $total = 0;
                        $customerName = 'Customer';
                        
                        // Sumar totales de todos los "checks"
                        if (isset($order['checks']) && is_array($order['checks'])) {
                            foreach ($order['checks'] as $check) {
                                $total += $check['totalAmount'] ?? $check['amount'] ?? 0;
                                
                                // Intentar obtener nombre del cliente del primer cheque
                                if ($customerName === 'Customer' && isset($check['customer'])) {
                                    $customerName = ($check['customer']['firstName'] ?? '') . ' ' . ($check['customer']['lastName'] ?? '');
                                    $customerName = trim($customerName) ?: 'Customer';
                                }

                                // Fallback: ver si es un pedido de plataforma (tabName)
                                if (($customerName === 'Customer' || empty($customerName)) && isset($check['tabName'])) {
                                    $customerName = $check['tabName'];
                                }
                            }
                        }

                        // Extraer lista de products
                        $items = [];
                        if (isset($order['checks'][0]['selections']) && is_array($order['checks'][0]['selections'])) {
                            foreach ($order['checks'][0]['selections'] as $sel) {
                                $items[] = [
                                    'name' => $sel['displayName'] ?? 'Product',
                                    'quantity' => $sel['quantity'] ?? 1,
                                    'price' => $sel['receiptLinePrice'] ?? 0,
                                ];
                            }
                        }

                        return [
                            'guid' => $order['guid'],
                            'orderNumber' => $order['displayNumber'] ?? 'S/N',
                            'openedDate' => $order['openedDate'] ?? null,
                            'status' => $order['approvalStatus'] ?? 'OPEN',
                            'source' => $order['source'] ?? 'Local',
                            'totalAmount' => $total,
                            'customerName' => $customerName,
                            'itemsCount' => count($items),
                            'items' => $items
                        ];
                    })->toArray();

                    Log::info("Orders processed and returned: " . count($orders));
                } else {
                    $error = "Error retrieving orders (status {$ordersResponse->status()}): " . $ordersResponse->body();
                    Log::error("Toast ordersBulk Error: " . $ordersResponse->body());
                }
            }
        }

        return Inertia::render('inventory/toast-orders', [
            'orders' => $orders,
            'error'  => $error,
            'selectedDate' => $selectedDate
        ]);
    }
}
