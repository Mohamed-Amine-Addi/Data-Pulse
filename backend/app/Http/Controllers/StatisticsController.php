<?php
namespace App\Http\Controllers;

use App\Models\Country;
use App\Models\Statistic;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class StatisticsController extends Controller
{
    /**
     * GET /api/v1/stats
     * KPIs globaux, accepte ?year=2025 ou ?year=2026
     */
    public function global(Request $request): JsonResponse
    {
        $year = (int) $request->query('year', 2026);

        // Donnees du snapshot annuel depuis statistics si disponible
        $statsForYear = Statistic::where('year', $year)
            ->with('country:id,name,flag,region')
            ->get();

        if ($statsForYear->isNotEmpty()) {
            $worldGdp    = round($statsForYear->sum('gdp'), 2);
            $worldPop    = round($statsForYear->sum('population'), 1);
            $avgGrowth   = round($statsForYear->avg('growth_rate'), 2);
            $avgInternet = round($statsForYear->avg('internet_usage'), 1);
            $isProjection = $year >= 2025;
        } else {
            // Fallback sur table countries
            $worldGdp    = round(Country::sum('gdp'), 2);
            $worldPop    = round(Country::sum('population'), 1);
            $avgGrowth   = round(Country::avg('growth'), 2);
            $avgInternet = round(Country::avg('internet_usage'), 1);
            $isProjection = false;
        }

        // Top 5 PIB pour l'année demandée
        $top5Gdp = Statistic::where('year', $year)
            ->with('country:id,name,flag')
            ->orderByDesc('gdp')
            ->limit(5)
            ->get()
            ->map(fn($s) => [
                'name'  => $s->country->name,
                'flag'  => $s->country->flag,
                'gdp'   => $s->gdp,
                'year'  => $year,
            ]);

        // Top 5 croissance
        $top5Growth = Statistic::where('year', $year)
            ->with('country:id,name,flag')
            ->orderByDesc('growth_rate')
            ->limit(5)
            ->get()
            ->map(fn($s) => [
                'name'   => $s->country->name,
                'flag'   => $s->country->flag,
                'growth' => $s->growth_rate,
                'year'   => $year,
            ]);

        return response()->json([
            'year'          => $year,
            'is_projection' => $isProjection,
            'world_gdp'     => $worldGdp,
            'world_pop'     => $worldPop,
            'avg_growth'    => $avgGrowth,
            'avg_internet'  => $avgInternet,
            'top_gdp'       => $top5Gdp,
            'top_growth'    => $top5Growth,
            'note'          => $isProjection
                ? ($year === 2025 ? 'Données FMI WEO Avril 2025' : 'Projections consensus 2026')
                : 'Données réelles',
        ]);
    }

    /**
     * GET /api/v1/stats/history?country_id=1&from=2019&to=2026
     * Historique complet d'un pays avec flag is_projection
     */
    public function history(Request $request): JsonResponse
    {
        $request->validate([
            'country_id' => 'required|exists:countries,id',
            'from'       => 'integer|min:2015|max:2026',
            'to'         => 'integer|min:2015|max:2026',
        ]);

        $from = (int) $request->query('from', 2019);
        $to   = (int) $request->query('to',   2026);

        $stats = Statistic::where('country_id', $request->country_id)
            ->betweenYears($from, $to)
            ->orderBy('year')
            ->get([
                'year', 'gdp', 'population', 'growth_rate',
                'internet_usage', 'energy_consumption',
                'gdp_per_capita', 'energy_fossil_pct',
                'energy_renewable_pct', 'is_projection', 'source',
            ]);

        return response()->json([
            'country_id'   => $request->country_id,
            'from'         => $from,
            'to'           => $to,
            'data'         => $stats,
            'has_projections' => $stats->where('is_projection', true)->isNotEmpty(),
        ]);
    }

    /**
     * GET /api/v1/stats/regions?year=2026
     * Agregation par region pour une année donnée
     */
    public function byRegion(Request $request): JsonResponse
    {
        $year = (int) $request->query('year', 2026);

        $regions = Statistic::where('year', $year)
            ->join('countries', 'statistics.country_id', '=', 'countries.id')
            ->selectRaw('
                countries.region,
                COUNT(*) as country_count,
                ROUND(SUM(statistics.population), 1) as total_population,
                ROUND(SUM(statistics.gdp), 3) as total_gdp,
                ROUND(AVG(statistics.growth_rate), 2) as avg_growth,
                ROUND(AVG(statistics.internet_usage), 1) as avg_internet,
                ROUND(AVG(statistics.energy_fossil_pct), 1) as avg_fossil_pct,
                ROUND(AVG(statistics.energy_renewable_pct), 1) as avg_renewable_pct,
                MIN(statistics.is_projection) as is_projection
            ')
            ->groupBy('countries.region')
            ->get();

        return response()->json([
            'year'    => $year,
            'regions' => $regions,
        ]);
    }

    /**
     * GET /api/v1/stats/timeline?metric=gdp&countries=1,2,3
     * Serie temporelle multi-pays 2019-2026
     */
    public function timeline(Request $request): JsonResponse
    {
        $request->validate([
            'metric'    => 'in:gdp,population,growth_rate,internet_usage,energy_consumption',
            'countries' => 'required|string',
        ]);

        $metric  = $request->query('metric', 'gdp');
        $ids     = array_slice(explode(',', $request->countries), 0, 8);
        $years   = range(2019, 2026);

        $data = Statistic::whereIn('country_id', $ids)
            ->whereBetween('year', [2019, 2026])
            ->with('country:id,name,flag')
            ->orderBy('country_id')
            ->orderBy('year')
            ->get();

        // Grouper par pays
        $grouped = $data->groupBy('country_id');
        $datasets = $grouped->map(function ($stats, $countryId) use ($years, $metric) {
            $country = $stats->first()->country;
            $byYear  = $stats->keyBy('year');
            return [
                'country_id' => $countryId,
                'name'       => $country->name,
                'flag'       => $country->flag,
                'data'       => collect($years)->map(fn($y) => $byYear[$y]?->$metric),
                'projections'=> collect($years)->map(fn($y) => $byYear[$y]?->is_projection ?? false),
            ];
        })->values();

        return response()->json([
            'years'    => $years,
            'metric'   => $metric,
            'datasets' => $datasets,
        ]);
    }

    /**
     * GET /api/v1/stats/heatmap?metric=growth_rate
     * Donnees heatmap pour les 8 principaux pays × 2019-2026
     */
    public function heatmap(Request $request): JsonResponse
    {
        $metric = $request->query('metric', 'growth_rate');
        $topIds = Country::orderByDesc('gdp')->limit(8)->pluck('id');

        $stats = Statistic::whereIn('country_id', $topIds)
            ->whereBetween('year', [2019, 2026])
            ->with('country:id,name,flag')
            ->orderBy('country_id')->orderBy('year')
            ->get();

        $grouped = $stats->groupBy('country_id');
        $result  = $grouped->map(function ($rows) use ($metric) {
            $c = $rows->first()->country;
            return [
                'country'     => $c->name,
                'flag'        => $c->flag,
                'values'      => $rows->sortBy('year')->map(fn($r) => [
                    'year'          => $r->year,
                    'value'         => $r->$metric,
                    'is_projection' => $r->is_projection,
                ])->values(),
            ];
        })->values();

        return response()->json([
            'metric'  => $metric,
            'years'   => range(2019, 2026),
            'data'    => $result,
        ]);
    }
}
