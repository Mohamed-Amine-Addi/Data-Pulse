<?php
namespace App\Services;

use App\Models\Country;
use App\Models\Statistic;

class ChartService
{
    private const PALETTE = [
        '#3b82f6','#22c55e','#f59e0b','#8b5cf6',
        '#ef4444','#14b8a6','#f97316','#ec4899',
    ];

    /**
     * Graphique ligne PIB — 2019 à 2026
     * Les segments 2025-2026 sont marqués is_projection=true
     */
    public function gdpLineChart(int $top = 8): array
    {
        $topCountries = Country::orderByDesc('gdp')->limit($top)->pluck('id');
        $years        = range(2019, 2026);

        $stats = Statistic::whereIn('country_id', $topCountries)
            ->whereBetween('year', [2019, 2026])
            ->with('country:id,name,flag')
            ->orderBy('country_id')->orderBy('year')
            ->get();

        $grouped  = $stats->groupBy('country_id');
        $datasets = $grouped->values()->map(function ($rows, $i) use ($years) {
            $byYear  = $rows->keyBy('year');
            $country = $rows->first()->country;
            return [
                'label'       => $country->name,
                'flag'        => $country->flag,
                'borderColor' => self::PALETTE[$i % count(self::PALETTE)],
                'data'        => collect($years)->map(fn($y) => $byYear[$y]?->gdp),
                'projections' => collect($years)->map(fn($y) => (bool)($byYear[$y]?->is_projection ?? false)),
            ];
        });

        return [
            'labels'   => $years,
            'datasets' => $datasets,
            'note'     => 'Segments 2025-2026 = projections FMI/consensus',
        ];
    }

    /**
     * PIB en camembert pour une année donnée
     */
    public function gdpPieChart(int $year = 2026, int $top = 6): array
    {
        $topStats = Statistic::where('year', $year)
            ->with('country:id,name,flag')
            ->orderByDesc('gdp')
            ->limit($top)
            ->get();

        $otherGdp = Statistic::where('year', $year)
            ->orderByDesc('gdp')
            ->skip($top)
            ->sum('gdp');

        return [
            'year'          => $year,
            'is_projection' => $year >= 2025,
            'labels'   => [...$topStats->map(fn($s) => $s->country->name)->toArray(), 'Autres'],
            'data'     => [...$topStats->pluck('gdp')->map(fn($v) => round($v,2))->toArray(), round($otherGdp,2)],
            'flags'    => [...$topStats->map(fn($s) => $s->country->flag)->toArray(), ''],
            'colors'   => array_slice(self::PALETTE, 0, $top + 1),
        ];
    }

    /**
     * Croissance par région pour une année
     */
    public function regionalGrowthChart(int $year = 2026): array
    {
        $regions = Statistic::where('year', $year)
            ->join('countries', 'statistics.country_id', '=', 'countries.id')
            ->selectRaw('countries.region, ROUND(AVG(statistics.growth_rate),2) as avg_growth')
            ->groupBy('countries.region')
            ->orderByDesc('avg_growth')
            ->get();

        return [
            'year'          => $year,
            'is_projection' => $year >= 2025,
            'labels' => $regions->pluck('region')->toArray(),
            'data'   => $regions->pluck('avg_growth')->toArray(),
        ];
    }

    /**
     * Mix énergétique fossile vs renouvelable — 2024, 2025, 2026
     */
    public function energyMixChart(array $countryIds = []): array
    {
        $query = Statistic::whereBetween('year', [2024, 2026])
            ->with('country:id,name,flag')
            ->whereNotNull('energy_fossil_pct')
            ->orderBy('country_id')->orderBy('year');

        if ($countryIds) $query->whereIn('country_id', $countryIds);

        $stats   = $query->get();
        $grouped = $stats->groupBy('country_id');

        return $grouped->values()->map(function ($rows) {
            $c = $rows->first()->country;
            return [
                'country' => $c->name,
                'flag'    => $c->flag,
                'data'    => $rows->sortBy('year')->map(fn($r) => [
                    'year'         => $r->year,
                    'fossil'       => $r->energy_fossil_pct,
                    'renewable'    => $r->energy_renewable_pct,
                    'is_projection'=> $r->is_projection,
                ])->values(),
            ];
        })->toArray();
    }

    /**
     * Heatmap de croissance — 8 pays × 2019-2026
     */
    public function growthHeatmap(): array
    {
        $topIds = Country::orderByDesc('gdp')->limit(8)->pluck('id');
        $stats  = Statistic::whereIn('country_id', $topIds)
            ->whereBetween('year', [2019, 2026])
            ->with('country:id,name,flag')
            ->orderBy('country_id')->orderBy('year')
            ->get();

        return $stats->groupBy('country_id')->values()->map(function ($rows) {
            $c = $rows->first()->country;
            return [
                'country' => $c->name,
                'flag'    => $c->flag,
                'values'  => $rows->sortBy('year')->map(fn($r) => [
                    'year'          => $r->year,
                    'growth'        => $r->growth_rate,
                    'is_projection' => $r->is_projection,
                ])->values(),
            ];
        })->toArray();
    }
}