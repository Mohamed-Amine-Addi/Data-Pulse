<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dataset extends Model
{
    protected $fillable = ['name', 'file_path', 'original_name', 'file_type', 'row_count', 'columns'];
    protected $casts    = ['columns' => 'array', 'row_count' => 'integer', 'uploaded_at' => 'datetime'];
}