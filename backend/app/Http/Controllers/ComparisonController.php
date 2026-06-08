<?php

namespace App\Http\Controllers;

use App\Models\Country;
use App\Models\Statistic;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ComparisonController extends Controller
{
    public function compare(Request $request): JsonResponse
    {
        $request->validate([
            'countries' => 'required|string',
            'year'      => 'integer|min:2019|max:2026',
            'metric'    => 'in:gdp,population,growth_rate,internet_usage,energy_consumption',
        ]);

        $ids  = array_slice(explode(',', $request->countries), 0, 3);
        $year = (int) $request->query('year', 2026);

        $stats = Statistic::whereIn('country_id', $ids)
            ->where('year', $year)
            ->with('country:id,name,flag,region,iso_code')
            ->get();

        if ($stats->isEmpty()) {
            return response()->json([
                'success' => false,
                'message' => 'Aucune donnée trouvée pour ces pays et cette année.',
            ], 404);
        }

        $history = Statistic::whereIn('country_id', $ids)
            ->whereBetween('year', [2019, 2026])
            ->with('country:id,name,flag')
            ->orderBy('country_id')
            ->orderBy('year')
            ->get()
            ->groupBy('country_id');

        $comparison = $stats->map(function ($stat) use ($history) {
            $countryHistory = $history[$stat->country_id] ?? collect();
            return [
                'country'    => [
                    'id'       => $stat->country->id,
                    'name'     => $stat->country->name,
                    'flag'     => $stat->country->flag,
                    'region'   => $stat->country->region,
                    'iso_code' => $stat->country->iso_code,
                ],
                'indicators' => [
                    'gdp'              => $stat->gdp,
                    'population'       => $stat->population,
                    'growth_rate'      => $stat->growth_rate,
                    'internet_usage'   => $stat->internet_usage,
                    'energy_consumption' => $stat->energy_consumption,
                    'gdp_per_capita'   => $stat->gdp_per_capita,
                    'fossil_pct'       => $stat->energy_fossil_pct,
                    'renewable_pct'    => $stat->energy_renewable_pct,
                ],
                'is_projection' => $stat->is_projection,
                'source'        => $stat->source,
                'history'       => $countryHistory->map(fn($h) => [
                    'year'          => $h->year,
                    'gdp'           => $h->gdp,
                    'growth_rate'   => $h->growth_rate,
                    'internet'      => $h->internet_usage,
                    'is_projection' => $h->is_projection,
                ])->values(),
            ];
        });

        $maxGdp  = $comparison->max(fn($c) => $c['indicators']['gdp']);
        $maxPop  = $comparison->max(fn($c) => $c['indicators']['population']);
        $maxInterne = 100; // Déjà en %

        $radar = $comparison->map(fn($c) => [
            'name'   => $c['country']['name'],
            'flag'   => $c['country']['flag'],
            'scores' => [
                'gdp'        => $maxGdp  > 0 ? round($c['indicators']['gdp'] / $maxGdp * 100, 1) : 0,
                'population' => $maxPop  > 0 ? round($c['indicators']['population'] / $maxPop * 100, 1) : 0,
                'internet'   => $c['indicators']['internet_usage'],
                'growth'     => max(0, $c['indicators']['growth_rate'] * 10),
                'gdp_per_capita' => min(100, round($c['indicators']['gdp_per_capita'] / 1000, 1)),
            ],
        ]);

        return response()->json([
            'success'       => true,
            'year'          => $year,
            'countries'     => $comparison->values(),
            'radar_scores'  => $radar->values(),
            'is_projection' => $year >= 2025,
        ]);
    }
}