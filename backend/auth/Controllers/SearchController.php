<?php

namespace App\Http\Controllers;

use App\Models\Country;
use Illuminate\Http\Request;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $query = $request->query('q', '');

        if (strlen($query) < 2) {
            return response()->json([
                'success' => true,
                'data'    => [],
            ]);
        }

        $results = Country::where('name', 'LIKE', "%{$query}%")
                          ->orWhere('region', 'LIKE', "%{$query}%")
                          ->orWhere('iso_code', 'LIKE', "%{$query}%")
                          ->with(['statistics' => fn($q) => $q->where('year', 2026)])
                          ->take(10)
                          ->get()
                          ->map(fn($c) => [
                              'id'      => $c->id,
                              'name'    => $c->name,
                              'flag'    => $c->flag,
                              'region'  => $c->region,
                              'gdp'     => $c->statistics->first()?->gdp,
                              'growth'  => $c->statistics->first()?->growth_rate,
                          ]);

        return response()->json([
            'success' => true,
            'query'   => $query,
            'count'   => $results->count(),
            'data'    => $results,
        ]);
    }
}