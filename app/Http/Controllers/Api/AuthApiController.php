<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthApiController extends Controller
{
    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/v1/auth/login
    // Body: { email, password, device_name? }
    // Returns: { token, user }
    // ─────────────────────────────────────────────────────────────────────────
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email'       => ['required', 'email'],
            'password'    => ['required', 'string'],
            'device_name' => ['nullable', 'string', 'max:255'],
        ]);

        if (! Auth::attempt(['email' => $validated['email'], 'password' => $validated['password']])) {
            throw ValidationException::withMessages([
                'email' => ['Las credenciales no son correctas.'],
            ]);
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Revoca tokens viejos del mismo dispositivo (opcional — evita acumulación)
        $deviceName = $validated['device_name'] ?? ($request->userAgent() ?? 'mobile');
        $user->tokens()->where('name', $deviceName)->delete();

        $token = $user->createToken($deviceName)->plainTextToken;

        return response()->json([
            'token' => $token,
            'user'  => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /api/v1/auth/logout  (requiere auth:sanctum)
    // Revoca el token actual
    // ─────────────────────────────────────────────────────────────────────────
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Signed out successfully.']);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/v1/auth/me  (requiere auth:sanctum)
    // Devuelve la info del usuario autenticado
    // ─────────────────────────────────────────────────────────────────────────
    public function me(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        return response()->json([
            'user' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role,
            ],
        ]);
    }
}
