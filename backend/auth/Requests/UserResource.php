<?php
namespace App\Http\Resources\Auth;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'first_name'        => $this->first_name,
            'last_name'         => $this->last_name,
            'full_name'         => $this->full_name,
            'email'             => $this->email,
            'avatar'            => $this->avatar,
            'role'              => $this->role,
            'country'           => $this->country,
            'language'          => $this->language ?? 'fr',
            'is_active'         => $this->is_active,
            'is_admin'          => $this->is_admin,
            'email_verified'    => !is_null($this->email_verified_at),
            'email_verified_at' => $this->email_verified_at?->toISOString(),
            'last_login_at'     => $this->last_login_at?->toISOString(),
            'created_at'        => $this->created_at->toISOString(),

            // Stats utilisation (si chargé)
            'stats' => $this->when($this->relationLoaded('statistics'), [
                'datasets_imported' => $this->statistics?->count() ?? 0,
            ]),
        ];
    }
}