<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class Statistic extends Model
{
    protected $fillable = [
        'country_id',
        'year',
        'population',
        'gdp',
        'growth_rate',
        'internet_usage',
        'energy_consumption',
        'is_projection',       // ← nouveau
        'source',              // ← nouveau
        'gdp_per_capita',      // ← nouveau
        'energy_fossil_pct',   // ← nouveau
        'energy_renewable_pct',// ← nouveau
    ];

    protected $casts = [
        'year'                 => 'integer',
        'population'           => 'float',
        'gdp'                  => 'float',
        'growth_rate'          => 'float',
        'internet_usage'       => 'float',
        'energy_consumption'   => 'float',
        'is_projection'        => 'boolean',
        'gdp_per_capita'       => 'float',
        'energy_fossil_pct'    => 'float',
        'energy_renewable_pct' => 'float',
    ];

    // ── Relations ──────────────────────────────────────────
    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class);
    }

    // ── Scopes ─────────────────────────────────────────────
    /** Uniquement les données réelles (pas projections) */
    public function scopeActual(Builder $q): Builder
    {
        return $q->where('is_projection', false);
    }

    /** Uniquement les projections (2025-2026) */
    public function scopeProjections(Builder $q): Builder
    {
        return $q->where('is_projection', true);
    }

    /** Filtrer par année */
    public function scopeForYear(Builder $q, int $year): Builder
    {
        return $q->where('year', $year);
    }

    /** Plage d'années */
    public function scopeBetweenYears(Builder $q, int $from, int $to): Builder
    {
        return $q->whereBetween('year', [$from, $to]);
    }
}

