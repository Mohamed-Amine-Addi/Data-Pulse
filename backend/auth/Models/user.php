<?php
namespace App\Models;

// Remplacement de HasApiTokens 
// Si Laravel Sanctum n'est pas installe :
// composer require laravel/sanctum
// Puis : php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Notifications\Notifiable;

// HasApiTokens vient du package laravel/sanctum
// S'il manque encore : composer require laravel/sanctum
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table    = 'users';
    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'role',
        'country',
        'language',
        'is_active',
        'email_verified_at',
        'email_otp',
        'email_otp_sent_at',
        'email_verify_token',
        'last_login_at',
        'last_login_ip',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'email_otp',
        'email_verify_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'email_otp_sent_at' => 'datetime',
        'last_login_at'     => 'datetime',
        'is_active'         => 'boolean',
    ];

    /*  Accessors  */
    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    public function getAvatarAttribute(): string
    {
        return strtoupper(
            substr($this->first_name ?? 'U', 0, 1) .
            substr($this->last_name  ?? '', 0, 1)
        );
    }

    public function getIsAdminAttribute(): bool
    {
        return $this->role === 'admin';
    }

    /* Relations  */
    public function statistics()
    {
        return $this->hasMany(\App\Models\Statistic::class);
    }

    /* Scopes  */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeVerified($query)
    {
        return $query->whereNotNull('email_verified_at');
    }

    /* Email verification OTP  */
    public function sendEmailVerificationNotification(): void
    {
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $this->update([
            'email_otp'         => $otp,
            'email_otp_sent_at' => now(),
        ]);
        $this->notify(
            new \App\Notifications\Auth\VerifyEmailNotification($otp)
        );
    }
}