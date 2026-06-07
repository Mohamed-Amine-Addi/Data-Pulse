<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CountryController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DatasetController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\SearchController;
use App\Http\Controllers\ComparisonController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Auth\PasswordResetController;


Route::prefix('v1')->middleware('throttle:120,1')->group(function () {

    Route::prefix('auth')->group(function () {

        Route::post('register', [AuthController::class, 'register']);

        Route::post('login',    [AuthController::class, 'login']);

        Route::post('refresh',  [AuthController::class, 'refresh']);
    });

    Route::prefix('password')->group(function () {

        Route::post('forgot', [PasswordResetController::class, 'sendResetLink']);

        Route::post('reset',  [PasswordResetController::class, 'reset']);
    });

    Route::prefix('email')->group(function () {

        Route::post('verify', [EmailVerificationController::class, 'verify']);

        Route::post('resend', [EmailVerificationController::class, 'resend']);
    });

    Route::prefix('countries')->group(function () {

        Route::get('/',             [CountryController::class, 'index']);

        Route::get('regions',       [CountryController::class, 'regions']);

        Route::get('top',           [CountryController::class, 'top']);

        Route::get('{country}',     [CountryController::class, 'show']);
    });

    Route::prefix('stats')->group(function () {

        Route::get('/',             [StatisticsController::class, 'global']);

        Route::get('history',       [StatisticsController::class, 'history']);

        Route::get('regions',       [StatisticsController::class, 'byRegion']);

        Route::get('timeline',      [StatisticsController::class, 'timeline']);

        Route::get('heatmap',       [StatisticsController::class, 'heatmap']);
    });

    Route::get('search',            [SearchController::class, 'search']);

    Route::get('compare',           [ComparisonController::class, 'compare']);

    Route::middleware('auth:sanctum')->group(function () {

        Route::get('dashboard',          [DashboardController::class, 'index']);

        Route::get('dashboard/stats',    [DashboardController::class, 'userStats']);

        Route::get('dashboard/regions',  [DashboardController::class, 'byRegion']);

        Route::put('users/profile',      [UserController::class, 'updateProfile']);

        Route::put('users/password',     [UserController::class, 'changePassword']);

        Route::get('datasets',           [DatasetController::class, 'index']);

        Route::post('datasets',          [DatasetController::class, 'store']);

        Route::get('datasets/{id}',      [DatasetController::class, 'show']);

        Route::delete('datasets/{id}',   [DatasetController::class, 'destroy']);

        Route::middleware('admin')->prefix('admin')->group(function () {

            Route::get('users',          [UserController::class, 'index']);

            Route::get('users/{id}',     [UserController::class, 'show']);

            Route::put('users/{id}',     [UserController::class, 'update']);

            Route::delete('users/{id}',  [UserController::class, 'destroy']);
        });

    }); 

}); 