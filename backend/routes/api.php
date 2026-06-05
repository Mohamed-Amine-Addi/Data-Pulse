<?php
use App\Http\Controllers\CountryController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\ComparisonController;
use App\Http\Controllers\UploadController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| DATA PULSE — API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->middleware('throttle:120,1')->group(function () {

    // Countries
    Route::get('countries',           [CountryController::class, 'index']);
    Route::get('countries/regions',   [CountryController::class, 'regions']);
    Route::get('countries/top',       [CountryController::class, 'top']);
    Route::get('countries/{country}', [CountryController::class, 'show']);

    // Statistics
    Route::get('stats',              [StatisticsController::class, 'global']);
    Route::get('stats/history',      [StatisticsController::class, 'history']);
    Route::get('stats/regions',      [StatisticsController::class, 'byRegion']);

    // Comparison
    Route::get('compare',            [ComparisonController::class, 'compare']);

    // File Upload
    Route::post('upload',            [UploadController::class, 'store']);
    Route::get('upload/{dataset}/charts', [UploadController::class, 'charts']);
});