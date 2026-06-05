<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework. You can also check out [Laravel Learn](https://laravel.com/learn), where you will be guided through building a modern Laravel application.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains thousands of video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com)**
- **[Tighten Co.](https://tighten.co)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Redberry](https://redberry.international/laravel-development)**
- **[Active Logic](https://activelogic.com)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

# DATA PULSE — Backend Laravel

## Stack
- PHP 8.2 · Laravel 11 · MySQL 8

## Installation

```bash
composer install
cp .env.example .env
php artisan key:generate

# Configure .env: DB_DATABASE=datapulse DB_USERNAME=root DB_PASSWORD=...

php artisan migrate
php artisan db:seed --class=CountrySeeder
php artisan serve
```

## API Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | /api/v1/countries | Liste paginée avec filtres |
| GET | /api/v1/countries/{id} | Détail + historique |
| GET | /api/v1/countries/regions | Stats par région |
| GET | /api/v1/countries/top | Top N par métrique |
| GET | /api/v1/stats | KPIs globaux |
| GET | /api/v1/stats/history?country_id=1 | Historique pays |
| GET | /api/v1/stats/regions | Agrégation régionale |
| GET | /api/v1/compare?ids=1,2,3 | Comparaison multi-pays |
| POST | /api/v1/upload | Import CSV/JSON |
| GET | /api/v1/upload/{id}/charts | Graphiques dataset |

## Paramètres de filtre (GET /api/v1/countries)

| Param | Type | Exemple |
|-------|------|---------|
| region | string | `?region=Europe` |
| min_gdp | float | `?min_gdp=1.0` |
| search | string | `?search=mar` |
| sort | string | `?sort=growth` |
| dir | asc/desc | `?dir=asc` |
| per_page | int | `?per_page=10` |
MD

# Now create the InsightGeneratorService
cat > /home/claude/datapulse/backend/app/Services/InsightGeneratorService.php << 'PHP'
<?php
namespace App\Services;

use App\Models\Country;

class InsightGeneratorService
{
    public function generate(): array
    {
        $countries   = Country::all();
        $topGrowth   = $countries->sortByDesc('growth')->first();
        $topGdp      = $countries->sortByDesc('gdp')->first();
        $topInternet = $countries->sortByDesc('internet_usage')->first();
        $topPop      = $countries->sortByDesc('population')->first();
        $avgGrowth   = round($countries->avg('growth'), 2);
        $avgInternet = round($countries->avg('internet_usage'), 1);
        $lowInternet = $countries->where('internet_usage', '<', 50)->count();
        $highInternet= $countries->where('internet_usage', '>', 90)->count();

        $insights = [
            ['type'=>'growth',   'icon'=>'ti-trending-up',  'color'=>'green',
             'title'=>'Croissance record',
             'text'=>"{$topGrowth->flag} {$topGrowth->name} affiche la plus forte croissance avec +{$topGrowth->growth}% en 2024.",
             'value'=>"+{$topGrowth->growth}%"],

            ['type'=>'economy',  'icon'=>'ti-coin',         'color'=>'blue',
             'title'=>'Première économie',
             'text'=>"{$topGdp->flag} {$topGdp->name} reste la première économie mondiale avec ".round($topGdp->gdp,1)." T\$.",
             'value'=>round($topGdp->gdp,1).' T$'],

            ['type'=>'internet', 'icon'=>'ti-wifi',         'color'=>'purple',
             'title'=>'Connectivité maximale',
             'text'=>"{$topInternet->flag} {$topInternet->name} atteint {$topInternet->internet_usage}% de connexion.",
             'value'=>"{$topInternet->internet_usage}%"],

            ['type'=>'population','icon'=>'ti-users',       'color'=>'amber',
             'title'=>'Population',
             'text'=>"{$topPop->flag} {$topPop->name} : ".number_format($topPop->population,0,',',' ')." millions d'habitants.",
             'value'=>number_format($topPop->population,0,',',' ').' M'],

            ['type'=>'average',  'icon'=>'ti-chart-bar',    'color'=>'teal',
             'title'=>'Croissance mondiale moyenne',
             'text'=>"Moyenne mondiale 2024 : +{$avgGrowth}% avec de fortes disparités régionales.",
             'value'=>"+{$avgGrowth}%"],

            ['type'=>'digital',  'icon'=>'ti-globe',        'color'=>'blue',
             'title'=>'Fracture numérique',
             'text'=>"{$lowInternet} pays sous 50% d'internet, {$highInternet} pays dépassent 90%. Moyenne : {$avgInternet}%.",
             'value'=>"{$avgInternet}% moy."],
        ];

        return $insights;
    }

    public function correlations(): array
    {
        $analysis  = new DataAnalysisService;
        $countries = Country::all();

        $pairs = [
            ['PIB/hab.', 'internet_usage'],
            ['PIB/hab.', 'growth'],
            ['population','gdp'],
            ['internet_usage','growth'],
        ];

        return array_map(function($pair) use ($countries, $analysis) {
            [$a, $b] = $pair;
            $xa = $a === 'PIB/hab.' ? $countries->pluck('gdp_per_capita')->toArray()
                                    : $countries->pluck($a)->toArray();
            $xb = $countries->pluck($b)->toArray();
            $r  = $analysis->pearson($xa, $xb);
            return [
                'pair'  => $pair,
                'r'     => $r,
                'label' => abs($r) > 0.7 ? 'Forte' : (abs($r) > 0.4 ? 'Modérée' : 'Faible'),
            ];
        }, $pairs);
    }
}
