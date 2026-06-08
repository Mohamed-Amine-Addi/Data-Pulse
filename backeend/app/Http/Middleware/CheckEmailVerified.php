<?php
namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckEmailVerified
{
    /**
     * Bloque l'acces si l'email n'est pas vérifie
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        if (!$user->email_verified_at) {
            return response()->json([
                'message' => 'Veuillez vérifier votre adresse email.',
                'action'  => 'verify_email',
                'email'   => $user->email,
            ], 403);
        }

        return $next($request);
    }
}

