<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('datasets', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('original_name');
            $table->string('file_path');
            $table->enum('file_type', ['csv', 'json'])->default('csv');
            $table->integer('row_count')->default(0);
            $table->json('columns')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void { Schema::dropIfExists('datasets'); }
};