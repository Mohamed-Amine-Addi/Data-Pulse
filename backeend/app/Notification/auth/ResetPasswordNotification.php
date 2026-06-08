<?php
namespace App\Notifications\Auth;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(private string $token) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = config('app.frontend_url', 'http://localhost:3000')
             . '/reset-password.html?token=' . $this->token
             . '&email=' . urlencode($notifiable->email);

        return (new MailMessage)
            ->subject('DATA PULSE — Réinitialisation de votre mot de passe')
            ->greeting('Bonjour ' . $notifiable->first_name . ',')
            ->line('Vous recevez cet email car nous avons reçu une demande de réinitialisation de mot de passe.')
            ->action('Réinitialiser mon mot de passe', $url)
            ->line('Ce lien expire dans **30 minutes**.')
            ->line('Si vous n\'avez pas demandé cette réinitialisation, ignorez cet email.')
            ->salutation('L\'équipe DATA PULSE');
    }
}