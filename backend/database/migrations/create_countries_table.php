<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('countries', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100)->unique();
            $table->string('flag', 10)->nullable();
            $table->string('region', 50);
            $table->string('iso_code', 3)->nullable()->unique();
            $table->decimal('population', 10, 2)->comment('Millions');
            $table->decimal('gdp', 10, 4)->comment('Trillions USD');
            $table->integer('gdp_per_capita')->nullable();
            $table->decimal('growth', 6, 2)->default(0);
            $table->decimal('internet_usage', 5, 2)->default(0);
            $table->decimal('energy_consumption', 8, 2)->default(0);
            $table->timestamps();
            $table->index('region');
            $table->index('gdp');
        });
    }
    public function down(): void { Schema::dropIfExists('countries'); }
};


