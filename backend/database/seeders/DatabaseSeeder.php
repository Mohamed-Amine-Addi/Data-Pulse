<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(CountrySeeder::class);

        $users = [
            [
                'name'              => 'Admin Pulse',
                'email'             => 'admin@datapulse.io',
                'password'          => Hash::make('demo1234'),
                'role'              => 'admin',
                'email_verified_at' => now(),
            ],
            [
                'name'              => 'Mohamed Alami',
                'email'             => 'mohamed@datapulse.io',
                'password'          => Hash::make('test1234'),
                'role'              => 'analyst',
                'email_verified_at' => now(),
            ],
            [
                'name'              => 'Sara Benali',
                'email'             => 'sara@datapulse.io',
                'password'          => Hash::make('sara1234'),
                'role'              => 'researcher',
                'email_verified_at' => now(),
            ],
        ];

        foreach ($users as $userData) {
            User::firstOrCreate(
                ['email' => $userData['email']],
                $userData
            );
        }

        $this->command->info('✓ ' . User::count() . ' utilisateurs créés');
    }
}