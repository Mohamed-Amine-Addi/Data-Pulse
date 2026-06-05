<?php
namespace App\Services;

use Illuminate\Support\Collection;

class DataAnalysisService
{
    /* ─── CSV Parser ─────────────────────────────── */
    public function parseCSV(string $content): array
    {
        $lines   = array_filter(explode("\n", trim($content)));
        $headers = str_getcsv(array_shift($lines));
        $rows    = [];
        foreach ($lines as $line) {
            $vals = str_getcsv($line);
            if (count($vals) !== count($headers)) continue;
            $row = [];
            foreach ($headers as $i => $h) {
                $v = trim($vals[$i] ?? '');
                $row[$h] = is_numeric($v) ? (float)$v : $v;
            }
            $rows[] = $row;
        }
        return $rows;
    }

    /* ─── Auto Insights ─────────────────────────── */
    public function generateInsights(array $data, array $numericCols): array
    {
        $insights = [];
        $n = count($data);
        $insights[] = ['type' => 'info', 'title' => 'Dataset', 'text' => "{$n} enregistrements · ".count($numericCols)." colonnes numériques"];

        foreach ($numericCols as $col) {
            $vals = array_column($data, $col);
            $vals = array_filter($vals, 'is_numeric');
            if (!$vals) continue;
            $avg  = round(array_sum($vals) / count($vals), 2);
            $max  = max($vals);   $min = min($vals);
            $insights[] = [
                'type'  => 'stat',
                'title' => $col,
                'text'  => "Moy: {$avg} · Min: {$min} · Max: {$max}",
                'avg'   => $avg, 'max' => $max, 'min' => $min,
            ];
        }

        if (count($numericCols) >= 2) {
            $r = $this->pearson(array_column($data, $numericCols[0]), array_column($data, $numericCols[1]));
            $label = abs($r) > 0.7 ? 'Forte' : (abs($r) > 0.4 ? 'Modérée' : 'Faible');
            $insights[] = [
                'type'  => 'correlation',
                'title' => "Corrélation {$numericCols[0]} ↔ {$numericCols[1]}",
                'text'  => "{$label} corrélation (r = ".round($r, 3).")",
                'r'     => round($r, 3),
            ];
        }

        return $insights;
    }

    /* ─── Radar Data ─────────────────────────────── */
    public function buildRadarData(Collection $countries): array
    {
        $maxGdp = $countries->max('gdp') ?: 1;
        $maxPop = $countries->max('population') ?: 1;

        return $countries->map(fn($c) => [
            'label' => $c->name,
            'data'  => [
                round($c->gdp / $maxGdp * 100, 1),
                round($c->population / $maxPop * 100, 1),
                $c->internet_usage,
                max(0, round($c->growth * 10, 1)),
                round(min($c->gdp_per_capita / 100000, 1) * 100, 1),
            ],
        ])->values()->toArray();
    }

    /* ─── Compare Insights ──────────────────────── */
    public function compareInsights(Collection $countries): array
    {
        $topGdp    = $countries->sortByDesc('gdp')->first();
        $topGrowth = $countries->sortByDesc('growth')->first();
        $topPop    = $countries->sortByDesc('population')->first();

        return [
            "Économie dominante : {$topGdp->name} avec {$topGdp->gdp} T\$",
            "Croissance la plus forte : {$topGrowth->name} (+{$topGrowth->growth}%)",
            "Population la plus grande : {$topPop->name} ({$topPop->population} M)",
        ];
    }

    /* ─── Chart Data Builder ─────────────────────── */
    public function buildChartData(array $data, array $columns): array
    {
        $numCols  = array_filter($columns, fn($c) => is_numeric($data[0][$c] ?? null));
        $textCols = array_filter($columns, fn($c) => !is_numeric($data[0][$c] ?? null));
        $labelCol = reset($textCols) ?: $columns[0];
        $charts   = [];

        foreach (array_slice(array_values($numCols), 0, 3) as $col) {
            $charts[] = [
                'type'    => 'bar',
                'title'   => $col,
                'labels'  => array_slice(array_column($data, $labelCol), 0, 15),
                'data'    => array_slice(array_column($data, $col), 0, 15),
            ];
        }
        return $charts;
    }

    /* ─── Pearson Correlation ────────────────────── */
    public function pearson(array $x, array $y): float
    {
        $n = min(count($x), count($y));
        if ($n < 2) return 0;
        $x = array_slice($x, 0, $n);
        $y = array_slice($y, 0, $n);
        $mx = array_sum($x) / $n;
        $my = array_sum($y) / $n;
        $num = 0; $dx = 0; $dy = 0;
        for ($i = 0; $i < $n; $i++) {
            $num += ($x[$i] - $mx) * ($y[$i] - $my);
            $dx  += ($x[$i] - $mx) ** 2;
            $dy  += ($y[$i] - $my) ** 2;
        }
        $den = sqrt($dx * $dy);
        return $den ? round($num / $den, 4) : 0;
    }
}
