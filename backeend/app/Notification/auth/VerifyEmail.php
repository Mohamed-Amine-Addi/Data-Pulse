<?php
namespace App\Notifications\Auth;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\MailMessage;

class VerifyEmailNotification extends Notification
{
    use Queueable;

    public function __construct(private string $otp) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('DATA PULSE — Vérification de votre adresse email')
            ->greeting('Bienvenue ' . $notifiable->first_name . ' !')
            ->line('Merci de vous être inscrit sur DATA PULSE.')
            ->line('Votre code de vérification est :')
            ->line('## ' . $this->otp)
            ->line('Ce code expire dans **10 minutes**.')
            ->line('Si vous n\'avez pas créé de compte, ignorez cet email.')
            ->salutation('L\'équipe DATA PULSE');
    }
}