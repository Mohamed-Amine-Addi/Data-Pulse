<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index()
    {
        $users = User::select(
                        'id','name','email','role',
                        'email_verified_at','created_at','last_login_at'
                     )
                     ->orderBy('created_at', 'desc')
                     ->get();

        return response()->json([
            'success' => true,
            'data'    => $users,
            'count'   => $users->count(),
        ]);
    }

    public function show($id)
    {
        $user = User::select(
                        'id','name','email','role',
                        'country','language','created_at'
                    )
                    ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data'    => $user,
        ]);
    }

    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name'     => 'sometimes|string|max:255',
            'email'    => 'sometimes|email|unique:users,email,' . $id,
            'role'     => 'sometimes|in:admin,analyst,researcher,student,journalist,manager,user',
            'country'  => 'sometimes|string|max:100',
            'language' => 'sometimes|in:fr,en,ar',
        ]);

        $user->update($request->only([
            'name','email','role','country','language'
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur mis à jour',
            'data'    => $user,
        ]);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Utilisateur supprimé',
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name'     => 'sometimes|string|max:255',
            'country'  => 'sometimes|string|max:100',
            'language' => 'sometimes|in:fr,en,ar',
        ]);

        $user->update($request->only(['name','country','language']));

        return response()->json([
            'success' => true,
            'message' => 'Profil mis à jour',
            'data'    => $user,
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password'     => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Mot de passe actuel incorrect',
            ], 422);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Mot de passe mis à jour',
        ]);
    }
}