<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
class Country extends Model
{

    protected $fillable = [
        'name',
        'flag',
        'region',
        'iso_code',
        'population',
        'gdp',
        'gdp_per_capita',
        'growth',
        'internet_usage',
        'energy_consumption',
    ];
    protected $casts = [
        'population'         => 'float',
        'gdp'                => 'float',
        'gdp_per_capita'     => 'integer',
        'growth'             => 'float',
        'internet_usage'     => 'float',
        'energy_consumption' => 'float',

    ];

    public function statistics(): HasMany
    {
        return $this->hasMany(Statistic::class);
    }


    /**
     * Returns a quick single-line insight string for this country.
     */
    public function getInsightAttribute(): string
    {
        $parts = [];
        if ($this->growth > 5)       $parts[] = "Forte croissance +{$this->growth}%";
        elseif ($this->growth < 0)   $parts[] = "Récession ({$this->growth}%)";
        elseif ($this->growth > 3)   $parts[] = "Croissance soutenue +{$this->growth}%";
        else                          $parts[] = "Croissance modérée +{$this->growth}%";

        if ($this->internet_usage > 95)  $parts[] = "quasi-totalité connectée";
        elseif ($this->internet_usage < 40) $parts[] = "fort potentiel numérique";
        if ($this->gdp_per_capita > 50000) $parts[] = "économie très avancée";
        elseif ($this->gdp_per_capita < 3000) $parts[] = "économie en développement";


        return implode(' · ', $parts);

    }

} 

