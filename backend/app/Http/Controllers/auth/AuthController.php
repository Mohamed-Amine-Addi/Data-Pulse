<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\Auth\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * POST /api/auth/login
     */
    public function login(LoginRequest $request): JsonResponse
    {
        // Rate limiting, max 5 tentatives / minute par IP
        $key = 'login.' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return response()->json([
                'message' => "Trop de tentatives. Réessayez dans {$seconds} secondes.",
                'retry_after' => $seconds,
            ], 429);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            RateLimiter::hit($key, 60);
            return response()->json([
                'message' => 'Email ou mot de passe incorrect.',
                'errors'  => ['credentials' => ['Identifiants invalides']],
            ], 401);
        }

        if (!$user->email_verified_at) {
            return response()->json([
                'message' => 'Veuillez vérifier votre adresse email avant de vous connecter.',
                'action'  => 'verify_email',
            ], 403);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Votre compte a été suspendu. Contactez l\'administrateur.',
            ], 403);
        }

        RateLimiter::clear($key);

        // Supprimer les anciens tokens si pas "remember"
        if (!$request->remember) {
            $user->tokens()->delete();
        }

        $expiration = $request->remember
            ? now()->addDays(30)
            : now()->addHours(8);

        $token = $user->createToken(
            'datapulse_token',
            ['*'],
            $expiration
        );

        // Mettre a jour last_login
        $user->update(['last_login_at' => now(), 'last_login_ip' => $request->ip()]);

        return response()->json([
            'message' => 'Connexion réussie.',
            'user'    => new UserResource($user),
            'token'   => $token->plainTextToken,
            'expires_at' => $expiration->toISOString(),
        ]);
    }

    /**
     * POST /api/auth/register
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $user = User::create([
            'first_name'    => $request->first_name,
            'last_name'     => $request->last_name,
            'email'         => strtolower($request->email),
            'password'      => Hash::make($request->password),
            'role'          => $request->role ?? 'user',
            'email_verify_token' => Str::random(64),
            'is_active'     => true,
        ]);

        // Envoyer email de verification
        $user->sendEmailVerificationNotification();

        $token = $user->createToken('datapulse_token', ['*'], now()->addHours(8));

        return response()->json([
            'message' => 'Compte créé avec succès. Vérifiez votre email.',
            'user'    => new UserResource($user),
            'token'   => $token->plainTextToken,
            'action'  => 'verify_email',
        ], 201);
    }

    /**
     * POST /api/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Déconnexion réussie.']);
    }

    /**
     * POST /api/auth/logout-all — deconnecter tous les appareils
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();
        return response()->json(['message' => 'Déconnecté de tous les appareils.']);
    }

    /**
     * GET /api/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()->load('statistics')),
        ]);
    }

    /**
     * POST /api/auth/refresh — renouveler le token
     */
    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();
        $token = $user->createToken('datapulse_token', ['*'], now()->addHours(8));
        return response()->json([
            'token'      => $token->plainTextToken,
            'expires_at' => now()->addHours(8)->toISOString(),
        ]);
    }
}