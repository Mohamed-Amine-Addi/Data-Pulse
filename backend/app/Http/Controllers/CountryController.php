
<?php
namespace App\Http\Controllers;
use App\Models\Country;
use App\Models\Statistic;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CountryController extends Controller
{
    /**
     * GET /api/v1/countries
     *  Liste paginée avec filtres + données de l'année choisie
     */
    public function index(Request $request): JsonResponse
    {
        $year  = (int) $request->query('year', 2026);
        $query = Country::query();

        if ($r = $request->query('region'))  $query->where('region', $r);
        if ($g = $request->query('min_gdp')) $query->where('gdp', '>=', $g);
        if ($s = $request->query('search'))  $query->where('name', 'like', "%{$s}%");

        $sortField = match($request->query('sort', 'gdp')) {
            'population' => 'population',
            'growth'     => 'growth',
            'internet'   => 'internet_usage',
            default      => 'gdp',
        };

        $countries = $query
            ->orderBy($sortField, $request->query('dir', 'desc'))
            ->paginate($request->query('per_page', 20));

        // Si année != courante, enrichir avec stats de cette annee
        if ($year !== 2026 && $countries->isNotEmpty()) {
            $ids        = $countries->pluck('id');
            $statsForYear = Statistic::whereIn('country_id', $ids)
                ->where('year', $year)
                ->get()
                ->keyBy('country_id');

            $countries->getCollection()->transform(function ($country) use ($statsForYear, $year) {
                if ($stat = $statsForYear[$country->id] ?? null) {
                    $country->gdp            = $stat->gdp;
                    $country->population     = $stat->population;
                    $country->growth         = $stat->growth_rate;
                    $country->internet_usage = $stat->internet_usage;
                    $country->is_projection  = $stat->is_projection;
                    $country->year_displayed = $year;
                }
                return $country;
            });
        }

        return response()->json($countries);
    }

    /**
     * GET /api/v1/countries/{id}?year=2026
     */
    public function show(Country $country, Request $request): JsonResponse
    {
        $year = (int) $request->query('year', 2026);

        // Historique complet 2019-2026
        $history = Statistic::where('country_id', $country->id)
            ->betweenYears(2019, 2026)
            ->orderBy('year')
            ->get([
                'year', 'gdp', 'population', 'growth_rate',
                'internet_usage', 'energy_consumption',
                'gdp_per_capita', 'energy_fossil_pct',
                'energy_renewable_pct', 'is_projection', 'source',
            ]);

        // Donnees pour l'année demandée
        $currentStat = $history->firstWhere('year', $year);

        return response()->json([
            'country'      => $country,
            'insight'      => $country->insight,
            'history'      => $history,
            'current_year' => $year,
            'current_stat' => $currentStat,
            'is_projection'=> $currentStat?->is_projection ?? false,
            'source'       => $currentStat?->source ?? 'Données courantes',
        ]);
    }

    /**
     * GET /api/v1/countries/regions?year=2026
     */
    public function regions(Request $request): JsonResponse
    {
        $year = (int) $request->query('year', 2026);

        // Agregation depuis statistics pour l'année demandée
        $regions = Statistic::where('year', $year)
            ->join('countries', 'statistics.country_id', '=', 'countries.id')
            ->selectRaw('
                countries.region,
                COUNT(*) as count,
                ROUND(SUM(statistics.gdp), 3) as total_gdp,
                ROUND(AVG(statistics.growth_rate), 2) as avg_growth,
                ROUND(AVG(statistics.internet_usage), 1) as avg_internet,
                MAX(statistics.is_projection) as has_projections
            ')
            ->groupBy('countries.region')
            ->get();

        return response()->json([
            'year'    => $year,
            'regions' => $regions,
        ]);
    }

    /**
     * GET /api/v1/countries/top?metric=gdp&year=2026&limit=5
     */
    public function top(Request $request): JsonResponse
    {
        $year   = (int) $request->query('year', 2026);
        $limit  = (int) $request->query('limit', 5);
        $metric = $request->query('metric', 'gdp');

        $field = match($metric) {
            'population' => 'population',
            'internet'   => 'internet_usage',
            'growth'     => 'growth_rate',
            default      => 'gdp',
        };

        $stats = Statistic::where('year', $year)
            ->with('country:id,name,flag,region,iso_code')
            ->orderByDesc($field)
            ->limit($limit)
            ->get()
            ->map(fn($s) => [
                'name'          => $s->country->name,
                'flag'          => $s->country->flag,
                'region'        => $s->country->region,
                'iso_code'      => $s->country->iso_code,
                'value'         => $s->$field,
                'gdp'           => $s->gdp,
                'growth'        => $s->growth_rate,
                'internet'      => $s->internet_usage,
                'population'    => $s->population,
                'is_projection' => $s->is_projection,
            ]);

        return response()->json([
            'year'          => $year,
            'metric'        => $metric,
            'is_projection' => $year >= 2025,
            'data'          => $stats,
        ]);
    }
}