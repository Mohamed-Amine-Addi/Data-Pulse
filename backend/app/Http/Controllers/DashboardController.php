<?php

namespace App\Http\Controllers;

use App\Models\Country;
use App\Models\Statistic;
use App\Models\User;
use App\Models\Dataset;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $year = $request->query('year', 2026);

        $stats = Statistic::where('year', $year)->get();

        return response()->json([
            'success' => true,
            'year'    => $year,
            'kpis'    => [
                'world_gdp'        => round($stats->sum('gdp'), 2),
                'world_population' => round($stats->sum('population'), 2),
                'avg_growth'       => round($stats->avg('growth_rate'), 2),
                'avg_internet'     => round($stats->avg('internet_usage'), 2),
                'avg_energy'       => round($stats->sum('energy_consumption'), 2),
                'countries_count'  => Country::count(),
            ],
            'top5_gdp' => Statistic::with('country')
                ->where('year', $year)
                ->orderBy('gdp', 'desc')
                ->take(5)
                ->get()
                ->map(fn($s) => [
                    'country' => $s->country->name,
                    'flag'    => $s->country->flag,
                    'gdp'     => $s->gdp,
                ]),
        ]);
    }

    public function userStats(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'data'    => [
                'datasets_count'  => Dataset::where('user_id', $user->id)->count(),
                'countries_count' => Country::count(),
                'years_available' => Statistic::distinct('year')
                                              ->pluck('year')
                                              ->sort()
                                              ->values(),
            ],
        ]);
    }

    public function byRegion(Request $request)
    {
        $year = $request->query('year', 2026);

        $regions = Country::with(['statistics' => fn($q) => $q->where('year', $year)])
            ->get()
            ->groupBy('region')
            ->map(fn($countries, $region) => [
                'region'       => $region,
                'count'        => $countries->count(),
                'total_gdp'    => round($countries->sum(fn($c) => $c->statistics->first()?->gdp ?? 0), 2),
                'avg_growth'   => round($countries->avg(fn($c) => $c->statistics->first()?->growth_rate ?? 0), 2),
                'avg_internet' => round($countries->avg(fn($c) => $c->statistics->first()?->internet_usage ?? 0), 2),
            ]);

        return response()->json([
            'success' => true,
            'year'    => $year,
            'data'    => $regions->values(),
        ]);
    }
}