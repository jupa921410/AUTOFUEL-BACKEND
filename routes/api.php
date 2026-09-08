<?php

use App\Http\Controllers\Api\CategoryApiController;
use App\Http\Controllers\Api\ProductApiController;
use App\Http\Controllers\Api\PromotionApiController;
use App\Http\Controllers\Api\CateringApiController;
use App\Http\Controllers\Api\CateringOrderApiController;
use App\Http\Controllers\Api\CateringCheckoutController;
use App\Http\Controllers\Api\ToastWebhookController;
use App\Http\Controllers\Api\ToastProductController;
use App\Http\Controllers\Api\ToastProductApiController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ReviewApiController;
use App\Http\Controllers\Api\SettingApiController;
use App\Http\Controllers\Api\PostApiController;
use App\Http\Controllers\Api\AuthApiController;
use App\Http\Controllers\Api\HorarioApiController;
use App\Http\Controllers\Api\InventoryApiController;
use App\Http\Controllers\Api\MenuScreenApiController;
use App\Http\Controllers\Api\StreamApiController;

/*
|--------------------------------------------------------------------------
| AutoFuel Public API
|--------------------------------------------------------------------------
|
| GET  /api/v1/categories
| GET  /api/v1/products                   ?category_id= &category= &search=
| GET  /api/v1/products/{id}
| GET  /api/v1/promotions/{group}         ?active=true  (por slug de grupo)
| GET  /api/v1/streams                    — TV streams activos (YouTube)
| GET  /api/v1/streams/{slug}             — TV stream por slug
| GET  /api/v1/caterings
| POST /api/v1/catering-orders            — legacy (sin pago)
| POST /api/v1/catering-checkout          — crea orden + sesión Stripe
|
| ── Autenticación (Sanctum tokens) ──────────────────────────────
| POST /api/v1/auth/login                 — obtener token
| POST /api/v1/auth/logout                — revocar token (auth:sanctum)
| GET  /api/v1/auth/me                    — info del usuario (auth:sanctum)
|
| POST /api/stripe/webhook                — webhook de Stripe (sin auth)
| POST /api/toast/webhook                 — webhook de Toast POS (sin auth)
|
*/

Route::prefix('v1')->group(function () {
    Route::get('categories', [CategoryApiController::class, 'index']);

    Route::get('products', [ProductApiController::class, 'index']);
    Route::get('products/featured', [ProductApiController::class, 'featured']);
    Route::get('products/{product}', [ProductApiController::class, 'show']);

    Route::get('menu-screens', [MenuScreenApiController::class, 'index']);
    Route::get('menu-screens/{slug}', [MenuScreenApiController::class, 'show']);

    // ── Toast Public Catalog ──
    Route::get('toast/products', [ToastProductApiController::class, 'index']);
    Route::get('toast/products/{idOrGuid}', [ToastProductApiController::class, 'show']);
    Route::get('toast/categories', [ToastProductApiController::class, 'categories']);

    Route::get('promotions/groups', [PromotionApiController::class, 'groups']);
    Route::get('promotions/{group}', [PromotionApiController::class, 'byGroup']);

    Route::get('streams', [StreamApiController::class, 'index']);
    Route::get('streams/{slug}', [StreamApiController::class, 'show']);

    Route::get('caterings', [CateringApiController::class, 'index']);

    // Legacy — crea pedido sin pago (mantener para compatibilidad)
    Route::post('catering-orders', [CateringOrderApiController::class, 'store']);

    // Stripe Checkout — crea pedido + sesión de pago
    Route::post('catering-checkout', [CateringCheckoutController::class, 'checkout']);

    // Front-end dynamic info
    Route::get('reviews', [ReviewApiController::class, 'index']);
    Route::get('posts', [PostApiController::class, 'index']);
    Route::get('posts/{slug}', [PostApiController::class, 'show']);
    Route::get('horarios', [HorarioApiController::class, 'index']);
    Route::get('settings', [SettingApiController::class, 'index']);

    // ── Autenticación (Sanctum) ─────────────────────────────────────
    // Público: obtener token
    Route::post('auth/login', [AuthApiController::class, 'login']);
    // Protegido: revocar token / info del usuario
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('auth/logout', [AuthApiController::class, 'logout']);
        Route::get('auth/me',     [AuthApiController::class, 'me']);
    });

    // ── Inventario (auth:sanctum requerido) ───────────────────────────
    Route::prefix('inventory')->middleware('auth:sanctum')->group(function () {
        // Artículos
        Route::get('items',          [InventoryApiController::class, 'itemsIndex']);
        Route::get('items/{item}',   [InventoryApiController::class, 'itemShow']);
        // Movimientos
        Route::post('movements',     [InventoryApiController::class, 'movementStore']);
        // Compras
        Route::get('purchases',              [InventoryApiController::class, 'purchasesIndex']);
        Route::post('purchases',             [InventoryApiController::class, 'purchaseStore']);
        Route::post('purchases/{purchase}/receive', [InventoryApiController::class, 'purchaseReceive']);
    });

    // ── Toast Webhook — recibe órdenes en tiempo real desde Toast POS ────
    // Toast está configurado en: POST https://admin.autofuel.com/api/toast/webhook
    // Esta ruta /v1/ es alias — la principal está fuera del prefijo v1 (línea ~135)
    Route::post('toast/webhook', [ToastWebhookController::class, 'handle']);

    // ── Toast Products — sincronización de menú e ingredientes (auth requerido) ────
    Route::prefix('toast-products')->middleware('auth:sanctum')->group(function () {
        // Listar productos sincronizados con sus ingredientes
        Route::get('/',            [ToastProductController::class, 'index']);
        // Sincronizar catálogo desde Toast API
        Route::post('/sync',       [ToastProductController::class, 'sync']);
        // Asignar ingredientes a un producto
        Route::put('/{toastProduct}/ingredients', [ToastProductController::class, 'updateIngredients']);
    });

    // Artículos de inventario disponibles para asignar como ingredientes
    Route::get('inventory-items-list', [ToastProductController::class, 'inventoryItems'])
         ->middleware('auth:sanctum');
});

// Stripe Webhook — excluido del prefijo v1 y sin verificación CSRF
Route::post('stripe/webhook', [CateringCheckoutController::class, 'webhook']);

// Toast Webhook — URL real que Toast usa: POST /api/toast/webhook (sin v1)
// Toast Portal registrado con: https://admin.autofuel.com/api/toast/webhook
Route::post('toast/webhook', [ToastWebhookController::class, 'handle']);


