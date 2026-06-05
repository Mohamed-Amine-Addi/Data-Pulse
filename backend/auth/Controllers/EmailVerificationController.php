<?php
namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    /**
     * POST /api/auth/verify-email
     * Véerifier avec OTP 6 chiffres
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'otp'   => 'required|string|size:6',
            'email' => 'required|email',
        ]);

        $user = User::where('email', strtolower($request->email))->first();

        if (!$user) {
            return response()->json(['message' => 'Utilisateur introuvable.'], 404);
        }

        if ($user->email_verified_at) {
            return response()->json(['message' => 'Email déjà vérifié.']);
        }

        // Verifier l'OTP 
        if ($request->otp !== $user->email_otp) {
            return response()->json(['message' => 'Code incorrect.'], 422);
        }

        // Verifier expiration (10 minutes)
        if (now()->diffInMinutes($user->email_otp_sent_at) > 10) {
            return response()->json(['message' => 'Code expiré. Renvoyez un nouveau code.'], 422);
        }

        $user->update([
            'email_verified_at' => now(),
            'email_otp'         => null,
            'email_otp_sent_at' => null,
        ]);

        return response()->json(['message' => 'Email vérifié avec succès.']);
    }

    /**
     * POST /api/auth/resend-otp
     */
    public function resend(Request $request): JsonResponse
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', strtolower($request->email))->first();

        if (!$user || $user->email_verified_at) {
            return response()->json(['message' => 'Action non disponible.']);
        }

        // Anti-spam : max 1 renvoi par minute
        if ($user->email_otp_sent_at && now()->diffInSeconds($user->email_otp_sent_at) < 60) {
            $wait = 60 - now()->diffInSeconds($user->email_otp_sent_at);
            return response()->json([
                'message' => "Attendez {$wait}s avant de renvoyer.",
                'retry_after' => $wait,
            ], 429);
        }

        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $user->update([
            'email_otp'         => $otp,
            'email_otp_sent_at' => now(),
        ]);

        $user->sendEmailVerificationNotification();

        return response()->json(['message' => 'Code renvoyé.']);
    }
}