<?php

namespace Tests\Feature;

use App\Models\ToastProduct;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ToastProductAdminTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_authenticated_user_can_add_an_extra_percentage_to_all_toast_products(): void
    {
        $user = User::factory()->create();
        $first = $this->createProduct('toast-1', 'Producto 1', 10.25);
        $second = $this->createProduct('toast-2', 'Producto 2', 4.00);

        $response = $this->actingAs($user)->post(route('admin.toast.products.add-extra'), [
            'percentage' => 10,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success', 'Se agrego 10.00% al precio de 2 productos.');
        $this->assertSame('11.28', $first->fresh()->price);
        $this->assertSame('4.40', $second->fresh()->price);
    }

    public function test_the_extra_percentage_must_be_greater_than_zero(): void
    {
        $user = User::factory()->create();
        $product = $this->createProduct('toast-1', 'Producto 1', 10.00);

        $response = $this->actingAs($user)->post(route('admin.toast.products.add-extra'), [
            'percentage' => 0,
        ]);

        $response->assertSessionHasErrors('percentage');
        $this->assertSame('10.00', $product->fresh()->price);
    }

    public function test_the_extra_percentage_cannot_exceed_one_hundred(): void
    {
        $user = User::factory()->create();
        $product = $this->createProduct('toast-1', 'Producto 1', 10.00);

        $response = $this->actingAs($user)->post(route('admin.toast.products.add-extra'), [
            'percentage' => 100.01,
        ]);

        $response->assertSessionHasErrors('percentage');
        $this->assertSame('10.00', $product->fresh()->price);
    }

    private function createProduct(string $guid, string $name, float $price): ToastProduct
    {
        return ToastProduct::create([
            'toast_guid' => $guid,
            'name' => $name,
            'price' => $price,
            'unit_of_measure' => 'NONE',
            'active' => true,
        ]);
    }
}
