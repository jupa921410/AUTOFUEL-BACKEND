<?php

use App\Http\Controllers\AccountingCategoryController;
use App\Http\Controllers\AccountingDashboardController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\PromotionController;
use App\Http\Controllers\PromotionGroupController;
use App\Http\Controllers\TransactionController;
use App\Http\Controllers\CateringController;
use App\Http\Controllers\CateringProductController;
use App\Http\Controllers\CateringOrderController;
use App\Http\Controllers\CateringPaymentResultController;
use App\Http\Controllers\ReviewController;
use App\Http\Controllers\SiteSettingController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\HorarioController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\MenuScreenController;
use App\Http\Controllers\RecipeController;
use App\Http\Controllers\TicketScannerController;
use App\Http\Controllers\ToastController;
use App\Http\Controllers\ToastAdminController;
use App\Http\Controllers\StreamController;
use App\Http\Controllers\TvStreamController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(false),
])->name('home');

// Páginas públicas de resultado de pago de catering — sin auth
Route::get('catering/success', [CateringPaymentResultController::class, 'success'])->name('catering.payment.success');
Route::get('catering/cancel',  [CateringPaymentResultController::class, 'cancel'])->name('catering.payment.cancel');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('categories', CategoryController::class)->except(['create', 'edit', 'show']);
    Route::resource('products', ProductController::class)->except(['create', 'edit', 'show']);
    Route::resource('promotions', PromotionController::class)->except(['create', 'edit', 'show']);
    Route::resource('promotion-groups', PromotionGroupController::class)->except(['create', 'edit', 'show']);
    Route::resource('streamen', TvStreamController::class)->except(['create', 'edit', 'show']);
    Route::resource('menu-screens', MenuScreenController::class)->except(['create', 'edit', 'show']);

    // Accounting
    Route::get('accounting', [AccountingDashboardController::class, 'index'])->name('accounting');
    Route::post('accounting/scan-ticket', [TicketScannerController::class, 'scan'])->name('accounting.scan-ticket');
    Route::resource('transactions', TransactionController::class)->except(['create', 'edit', 'show']);
    Route::resource('accounting-categories', AccountingCategoryController::class)->except(['create', 'edit', 'show']);

    // Catering
    Route::resource('caterings', CateringController::class)->except(['create', 'edit', 'show']);
    Route::resource('catering-products', CateringProductController::class)->except(['create', 'edit', 'show']);
    
    Route::get('catering-orders', [CateringOrderController::class, 'index'])->name('catering-orders.index');
    Route::put('catering-orders/{cateringOrder}/status', [CateringOrderController::class, 'updateStatus'])->name('catering-orders.status');
    Route::post('catering-orders/{cateringOrder}/send-payment-link', [CateringOrderController::class, 'sendPaymentLink'])->name('catering-orders.send-payment-link');
    Route::post('catering-orders/{cateringOrder}/mark-as-paid', [CateringOrderController::class, 'markAsPaid'])->name('catering-orders.mark-as-paid');
    Route::delete('catering-orders/{cateringOrder}', [CateringOrderController::class, 'destroy'])->name('catering-orders.destroy');

    // Configuración Global del Sitio
    Route::resource('reviews', ReviewController::class)->except(['create', 'edit', 'show']);
    Route::resource('posts', PostController::class)->names('posts')->except(['create', 'edit', 'show']);
    Route::resource('horarios', HorarioController::class)->except(['create', 'show']);
    Route::get('site-settings', [SiteSettingController::class, 'index'])->name('site-settings.index');
    Route::put('site-settings', [SiteSettingController::class, 'update'])->name('site-settings.update');

    // ── Inventario ────────────────────────────────────────────────
    // Artículos
    Route::get('inventory/items',          [InventoryController::class, 'itemsIndex'])->name('inventory.items');
    Route::post('inventory/items',         [InventoryController::class, 'itemStore'])->name('inventory.items.store');
    Route::put('inventory/items/{item}',   [InventoryController::class, 'itemUpdate'])->name('inventory.items.update');
    Route::delete('inventory/items/{item}',[InventoryController::class, 'itemDestroy'])->name('inventory.items.destroy');
    // Movimientos manuales
    Route::post('inventory/movements',     [InventoryController::class, 'movementStore'])->name('inventory.movements.store');
    // Compras
    Route::get('inventory/purchases',                       [InventoryController::class, 'purchasesIndex'])->name('inventory.purchases');
    Route::post('inventory/purchases',                      [InventoryController::class, 'purchaseStore'])->name('inventory.purchases.store');
    Route::post('inventory/purchases/{purchase}/receive',   [InventoryController::class, 'purchaseReceive'])->name('inventory.purchases.receive');
    Route::post('inventory/purchases/{purchase}/cancel',    [InventoryController::class, 'purchaseCancel'])->name('inventory.purchases.cancel');
    Route::delete('inventory/purchases/{purchase}',         [InventoryController::class, 'purchaseDestroy'])->name('inventory.purchases.destroy');
    // ── Recetas (independientes de products) ─────────────────────────
    Route::get('inventory/recipes',              [RecipeController::class, 'index'])->name('inventory.recipes');
    Route::post('inventory/recipes/sync',        [RecipeController::class, 'sync'])->name('inventory.recipes.sync');
    Route::post('inventory/recipes',             [RecipeController::class, 'store'])->name('inventory.recipes.store');
    Route::put('inventory/recipes/{recipe}',     [RecipeController::class, 'update'])->name('inventory.recipes.update');
    Route::delete('inventory/recipes/{recipe}',  [RecipeController::class, 'destroy'])->name('inventory.recipes.destroy');
    // Categorías de inventario
    Route::post('inventory/categories',         [InventoryController::class, 'categoryStore'])->name('inventory.categories.store');
    Route::delete('inventory/categories/{category}', [InventoryController::class, 'categoryDestroy'])->name('inventory.categories.destroy');
    // PDF — Stock Bajo
    Route::get('inventory/low-stock-pdf', [InventoryController::class, 'lowStockPdf'])->name('inventory.low-stock-pdf');
    // Toast Integration (API pull)
    Route::get('inventory/toast-orders', [ToastController::class, 'ordersIndex'])->name('inventory.toast-orders');

    // ── Administración Toast ────────────────────────────────
    // Productos sincronizados desde Toast API
    Route::get('admin/toast/products',       [ToastAdminController::class, 'productsIndex'])->name('admin.toast.products');
    Route::post('admin/toast/products/sync', [ToastAdminController::class, 'productsSync'])->name('admin.toast.products.sync');
    Route::post('admin/toast/products/add-extra', [ToastAdminController::class, 'productsAddExtra'])->name('admin.toast.products.add-extra');
    // Órdenes recibidas por webhook
    Route::get('admin/toast/webhook-orders', [ToastAdminController::class, 'webhookOrdersIndex'])->name('admin.toast.webhook-orders');
});

Route::get('streamen/{streamen:slug}', [StreamController::class, 'show'])->name('streamen.show');

require __DIR__ . '/settings.php';
