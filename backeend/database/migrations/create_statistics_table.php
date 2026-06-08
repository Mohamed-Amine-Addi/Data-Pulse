<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('statistics', function (Blueprint $table) {
            $table->id();
            $table->foreignId('country_id')->constrained()->onDelete('cascade');
            $table->smallInteger('year');
            $table->decimal('population', 10, 2)->nullable();
            $table->decimal('gdp', 10, 4)->nullable();
            $table->decimal('growth_rate', 6, 2)->nullable();
            $table->decimal('internet_usage', 5, 2)->nullable();
            $table->decimal('energy_consumption', 8, 2)->nullable(); 
            $table->boolean('is_projection')->default(false)
                  ->comment('true = estimation/projection FMI, false = donnée réelle');
            $table->string('source', 80)->nullable()
                  ->comment('FMI, Banque Mondiale, projection, etc.');
            $table->decimal('gdp_per_capita', 10, 2)->nullable();
            $table->decimal('energy_fossil_pct', 5, 2)->nullable()
                  ->comment('% fossile dans le mix énergétique');
            $table->decimal('energy_renewable_pct', 5, 2)->nullable()
                  ->comment('% renouvelable dans le mix énergétique');

            $table->timestamps();
            $table->unique(['country_id', 'year']);
            $table->index(['country_id', 'year']);
            $table->index('year');
            $table->index('is_projection');
        });
    }

    public function down(): void { Schema::dropIfExists('statistics'); }
};