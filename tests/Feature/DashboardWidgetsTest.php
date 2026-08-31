<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardWidgetsTest extends TestCase
{
    use RefreshDatabase;

    public function test_dashboard_provides_system_widget_data(): void
    {
        $this->actingAs(User::factory()->create())->get('/dashboard')->assertOk()
            ->assertInertia(fn ($page) => $page->component('dashboard')
                ->has('stats.products')->has('stats.featuredProducts')->has('stats.activePromotions')
                ->has('stats.activeMenuScreens')->has('stats.activeStreams')->has('stats.lowStockItems')
                ->has('promotions')->has('lowStockItems'));
    }
}
