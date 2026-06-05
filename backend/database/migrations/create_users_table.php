<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name', 80);
            $table->string('last_name', 80);
            $table->string('email', 255)->unique();
            $table->string('password');
            $table->enum('role', [
                'admin','analyst','researcher',
                'student','journalist','manager','user','other'
            ])->default('user');
            $table->string('country', 80)->nullable();
            $table->string('language', 5)->default('fr');
            $table->boolean('is_active')->default(true);

            // Email verification
            $table->timestamp('email_verified_at')->nullable();
            $table->string('email_otp', 6)->nullable();
            $table->timestamp('email_otp_sent_at')->nullable();
            $table->string('email_verify_token', 64)->nullable();

            // Session tracking
            $table->timestamp('last_login_at')->nullable();
            $table->string('last_login_ip', 45)->nullable();

            $table->rememberToken();
            $table->timestamps();
            $table->index('email');
            $table->index('role');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};