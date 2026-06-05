<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApi
{
    /**
     * Verifie que le token Sanctum est valide
     * Utilise sur toutes les routes protegees /api/v1/*
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user()) {
            return response()->json([
                'message' => 'Non authentifié. Veuillez vous connecter.',
                'action'  => 'redirect_login',
            ], 401);
        }

        if (!$request->user()->is_active) {
            return response()->json([
                'message' => 'Votre compte a été suspendu.',
            ], 403);
        }

        return $next($request);
    }
}
