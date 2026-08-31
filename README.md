# AutoFuel Backend

Sistema administrativo y API para la cafetería AutoFuel.

## Tecnología

- Laravel 12, PHP 8.2+
- React 19, TypeScript e Inertia
- Tailwind CSS y Vite
- MySQL, autenticación con Fortify/Sanctum
- Integraciones con Toast y Stripe

## Desarrollo local

1. Copia `.env.example` como `.env` y configura la base de datos y los servicios externos.
2. Ejecuta `composer install` y `npm install`.
3. Ejecuta `php artisan key:generate` y `php artisan migrate --seed`.
4. Inicia el entorno con `composer run dev`.

La interfaz usa fondos negros, texto blanco y rojo para acciones y elementos destacados.
