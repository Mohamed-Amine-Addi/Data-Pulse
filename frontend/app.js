Chart.defaults.color                            = '#64748b';
Chart.defaults.font.family                      = "'Inter', sans-serif";
Chart.defaults.plugins.tooltip.backgroundColor  = '#0f172a';
Chart.defaults.plugins.tooltip.titleColor       = '#f8fafc';
Chart.defaults.plugins.tooltip.bodyColor        = '#cbd5e1';
Chart.defaults.plugins.tooltip.padding          = 10;
Chart.defaults.plugins.tooltip.cornerRadius     = 8;
Chart.defaults.scale.grid.color                 = 'rgba(0,0,0,0.06)';
Chart.defaults.scale.ticks.color                = '#94a3b8';

const PALETTE = ['#3b82f6','#22c55e','#f59e0b','#8b5cf6','#ef4444','#14b8a6','#f97316','#ec4899'];
const PA = (c, a) => c + Math.round(a * 255).toString(16).padStart(2, '0');
const charts = {};

// Annee active globale 
let ACTIVE_YEAR = 2026;

/* KPI DATA complete par annee */
const KPI_BY_YEAR = {
  2020: {
    population: '7.79 Mrd', popTrend: '+0.9% vs 2019',  popDir: 'up',
    gdp:        '84.9 T$',  gdpTrend: '-3.1% (COVID)',   gdpDir: 'down',
    energy:     '536 EJ',   energyTrend: '-5.1% crise',  energyDir: 'down',
    internet:   '59.5%',    inetTrend: '+3.1% vs 2019',  inetDir: 'up',
    subtitle:   'Données réelles 2020 · Impact COVID-19',
    badge:      null,
  },
  2021: {
    population: '7.87 Mrd', popTrend: '+1.0% reprise',  popDir: 'up',
    gdp:        '96.1 T$',  gdpTrend: '+13.2% rebond',  gdpDir: 'up',
    energy:     '558 EJ',   energyTrend: '+4.1% rebond', energyDir: 'up',
    internet:   '62.8%',    inetTrend: '+3.3% vs 2020',  inetDir: 'up',
    subtitle:   'Données réelles 2021 · Rebond post-COVID',
    badge:      null,
  },
  2022: {
    population: '7.97 Mrd', popTrend: '+1.3% vs 2021',  popDir: 'up',
    gdp:        '100.6 T$', gdpTrend: '+4.7% vs 2021',  gdpDir: 'up',
    energy:     '568 EJ',   energyTrend: '+1.8% vs 2021',energyDir: 'up',
    internet:   '64.1%',    inetTrend: '+1.3% vs 2021',  inetDir: 'up',
    subtitle:   'Données réelles 2022',
    badge:      null,
  },
  2023: {
    population: '8.04 Mrd', popTrend: '+0.9% vs 2022',  popDir: 'up',
    gdp:        '104.5 T$', gdpTrend: '+3.9% vs 2022',  gdpDir: 'up',
    energy:     '574 EJ',   energyTrend: '+1.1% vs 2022',energyDir: 'up',
    internet:   '65.7%',    inetTrend: '+1.6% vs 2022',  inetDir: 'up',
    subtitle:   'Données réelles 2023',
    badge:      null,
  },
  2024: {
    population: '8.10 Mrd', popTrend: '+0.7% vs 2023',  popDir: 'up',
    gdp:        '108.9 T$', gdpTrend: '+4.2% vs 2023',  gdpDir: 'up',
    energy:     '580 EJ',   energyTrend: '-1.1% fossiles',energyDir: 'down',
    internet:   '67.4%',    inetTrend: '+1.7% vs 2023',  inetDir: 'up',
    subtitle:   'Données réelles 2024 · Banque Mondiale',
    badge:      null,
  },
  2025: {
    population: '8.19 Mrd', popTrend: '+1.1% vs 2024',  popDir: 'up',
    gdp:        '113.4 T$', gdpTrend: '+4.1% vs 2024',  gdpDir: 'up',
    energy:     '584 EJ',   energyTrend: '+0.7% transition',energyDir: 'up',
    internet:   '69.2%',    inetTrend: '+1.8% vs 2024',  inetDir: 'up',
    subtitle:   'Estimations 2025 · FMI World Economic Outlook',
    badge:      'ESTIMATION FMI',
  },
  2026: {
    population: '8.25 Mrd', popTrend: '+0.7% vs 2025',  popDir: 'up',
    gdp:        '118.2 T$', gdpTrend: '+4.2% vs 2025',  gdpDir: 'up',
    energy:     '589 EJ',   energyTrend: '+0.9% renouvelables',energyDir: 'up',
    internet:   '71.0%',    inetTrend: '+1.8% vs 2025',  inetDir: 'up',
    subtitle:   'Projections 2026 · Consensus FMI / Banque Mondiale',
    badge:      'PROJECTION 2026',
  },
};

function getCountriesForYear(year) {
  const yearIdx = GDP_HISTORY.years.indexOf(year);
  if (yearIdx === -1) return COUNTRIES_DATA; // fallback

  return COUNTRIES_DATA.map(c => {
    const gdpSeries = GDP_HISTORY.data[c.name];
    const growthSeries = GROWTH_HISTORY.data[c.name];

    const gdp    = gdpSeries    ? (gdpSeries[yearIdx]    ?? c.gdp)    : c.gdp;
    const growth = growthSeries ? (growthSeries[GROWTH_HISTORY.years.indexOf(year)] ?? c.growth) : c.growth;

    return { ...c, gdp, growth };
  });
}

function updateKPICards(year) {
  const d = KPI_BY_YEAR[year] || KPI_BY_YEAR[2026];

  // Valeurs
  document.getElementById('kpiPopulation').textContent = d.population;
  document.getElementById('kpiGDP').textContent        = d.gdp;
  document.getElementById('kpiEnergy').textContent     = d.energy;
  document.getElementById('kpiInternet').textContent   = d.internet;

  // Trends — on cible le .kpi-trend de chaque card
  const trends = document.querySelectorAll('.kpi-trend');
  const trendData = [
    { text: d.popTrend, dir: d.popDir },
    { text: d.gdpTrend, dir: d.gdpDir },
    { text: d.energyTrend, dir: d.energyDir },
    { text: d.inetTrend, dir: d.inetDir },
  ];
  trends.forEach((el, i) => {
    if (!trendData[i]) return;
    const icon = trendData[i].dir === 'up' ? 'ti-trending-up' : 'ti-trending-down';
    const cls  = trendData[i].dir === 'up' ? 'trend-up' : 'trend-down';
    el.className = `kpi-trend ${cls}`;
    el.innerHTML = `<i class="ti ${icon}"></i> ${trendData[i].text}`;
  });

  // Subtitle du dashboard
  const sub = document.querySelector('#view-dashboard .view-subtitle');
  if (sub) sub.textContent = d.subtitle;

  // Badge projection
  let badge = document.getElementById('yearBadge');
  if (d.badge) {
    if (!badge) {
      badge = document.createElement('span');
      badge.id = 'yearBadge';
      badge.style.cssText = `
        display:inline-flex;align-items:center;gap:5px;
        background:#fef3c7;color:#b45309;font-size:10px;font-weight:700;
        padding:3px 10px;border-radius:20px;font-family:'DM Mono',monospace;
        letter-spacing:.06em;border:1px solid #fde68a;margin-left:10px;
      `;
      document.querySelector('#view-dashboard .view-title').appendChild(badge);
    }
    badge.textContent = '● ' + d.badge;
    badge.style.display = 'inline-flex';
  } else if (badge) {
    badge.style.display = 'none';
  }
}

function updateGDPChart(year) {
  if (!charts.gdp) return;
  const yearStr = String(year);
  const projectionStart = GDP_HISTORY.years.indexOf(2025);

  charts.gdp.data.datasets = Object.keys(GDP_HISTORY.data).map((name, i) => {
    const data = GDP_HISTORY.data[name];
    return {
      label:           name,
      data:            data,
      borderColor:     PALETTE[i],
      backgroundColor: 'transparent',
      borderWidth:     2,
      pointRadius:     3,
      pointHoverRadius:5,
      tension:         0.4,
      segment: {
        borderDash:  ctx => ctx.p0DataIndex >= projectionStart - 1 ? [5, 4] : undefined,
        borderColor: ctx => ctx.p0DataIndex >= projectionStart - 1
          ? PALETTE[i] + 'aa' : PALETTE[i],
      },
    };
  });

  // Subtitle du chart
  const sub = document.querySelector('#view-dashboard .chart-subtitle');
  if (sub) {
    if (year >= 2025) {
      sub.innerHTML = `En trillions USD · 2015–${year} &nbsp;<span style="background:#fef3c7;color:#b45309;font-size:10px;padding:2px 8px;border-radius:4px;font-family:'DM Mono',monospace">--- Projection</span>`;
    } else {
      sub.textContent = `En trillions USD · 2015–${year}`;
    }
  }

  charts.gdp.update('active');
}

function updateGrowthChart(year) {
  if (!charts.growth) return;
  const yearCountries = getCountriesForYear(year);
  const regions = ['Europe','Asie','Amérique','Afrique','Océanie'];
  const regionGrowth = regions.map(r => {
    const cs = yearCountries.filter(c => c.region === r);
    return cs.length ? +(cs.reduce((s,c) => s + c.growth, 0) / cs.length).toFixed(2) : 0;
  });

  charts.growth.data.datasets[0].data = regionGrowth;
  charts.growth.data.datasets[0].backgroundColor = regionGrowth.map(v =>
    v >= 0 ? PA('#22c55e', 0.7) : PA('#ef4444', 0.7));
  charts.growth.data.datasets[0].borderColor = regionGrowth.map(v =>
    v >= 0 ? '#22c55e' : '#ef4444');
  charts.growth.update('active');
}

function updatePieChart(year) {
  if (!charts.pie) return;
  const yearCountries = getCountriesForYear(year);
  const top5    = [...yearCountries].sort((a,b) => b.gdp - a.gdp).slice(0, 5);
  const total   = yearCountries.reduce((s,c) => s + c.gdp, 0);
  const otherGdp = total - top5.reduce((s,c) => s + c.gdp, 0);

  charts.pie.data.labels   = [...top5.map(c => c.name), 'Autres'];
  charts.pie.data.datasets[0].data = [...top5.map(c => +c.gdp.toFixed(2)), +otherGdp.toFixed(2)];
  charts.pie.options.plugins.tooltip.callbacks.label = ctx =>
    ` ${ctx.label}: ${ctx.raw}T$ (${((ctx.raw / total)*100).toFixed(1)}%)`;
  charts.pie.update('active');

  // Mettre à jour la légende
  const pieLeg = document.getElementById('pieLegend');
  if (pieLeg) {
    pieLeg.innerHTML = [...top5.map(c => c.name), 'Autres'].map((n, i) => {
      const color = i < 5 ? PALETTE[i] : '#e2e8f0';
      return `<span class="legend-item"><span class="legend-dot" style="background:${color}"></span>${n}</span>`;
    }).join('');
  }
}

function updateTop5Chart(year) {
  if (!charts.top5) return;
  const yearCountries = getCountriesForYear(year);
  const top5 = [...yearCountries].sort((a,b) => b.gdp - a.gdp).slice(0, 5);

  charts.top5.data.labels = top5.map(c => c.name);
  charts.top5.data.datasets[0].data = top5.map(c => c.gdp);
  charts.top5.update('active');
}

function applyYear(year) {
  ACTIVE_YEAR = year;
  updateKPICards(year);
  updateGDPChart(year);
  updateGrowthChart(year);
  updatePieChart(year);
  updateTop5Chart(year);
}

const views = {
  'dashboard': 'Dashboard',
  'worldmap':  'Carte mondiale',
  'charts':    'Visualisations',
  'compare':   'Comparateur',
  'explorer':  'Explorateur',
  'import':    'Import données',
  'insights':  'Insights auto',
  'forecast':  'Prévisions 2027-2030',
  'rankings':  'Classements mondiaux',
  'watchlist': 'Watchlist',
  'studio':    'Data Studio',
  'report':    'Générateur de rapports',
};

function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const view = document.getElementById('view-' + viewId);
  if (view) view.classList.add('active');
  const navItem = document.querySelector(`.nav-item[data-view="${viewId}"]`);
  if (navItem) navItem.classList.add('active');
  document.getElementById('currentViewLabel').textContent = views[viewId] || viewId;

  if (viewId === 'worldmap'  && !window._mapInit)      { initWorldMap();       window._mapInit      = true; }
  if (viewId === 'charts'    && !window._chartsInit)   { initAdvancedCharts(); window._chartsInit   = true; }
  if (viewId === 'explorer'  && !window._explorerInit) { initExplorer();       window._explorerInit = true; }
  if (viewId === 'compare'   && !window._compareInit)  { initCompare();        window._compareInit  = true; }
  if (viewId === 'insights'  && !window._insightsInit) { initInsights();       window._insightsInit = true; }
  if (viewId === 'forecast'  && !window._forecastInit) { initForecast();       window._forecastInit = true; }
  if (viewId === 'rankings'  && !window._rankingsInit) { RankingsModule.render(); window._rankingsInit = true; }
  if (viewId === 'watchlist' && !window._watchlistInit){ WatchlistModule.render(); window._watchlistInit = true; }
  if (viewId === 'studio'    && !window._studioInit)   { DataStudio.render();   window._studioInit = true; }
  if (viewId === 'report'    && !window._reportInit)   { ReportBuilder.render(); window._reportInit = true; }
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', e => {
    e.preventDefault();
    showView(item.dataset.view);
    if (window.innerWidth < 900) document.getElementById('sidebar').classList.remove('open');
  });
});

document.getElementById('sidebarToggle').addEventListener('click', () => {
  document.getElementById('sidebar').classList.toggle('open');
});

function initDashboard() {
  const gdpCountries = Object.keys(GDP_HISTORY.data);
  const projStart    = GDP_HISTORY.years.indexOf(2025);

  // GDP Line Chart
  charts.gdp = new Chart(document.getElementById('gdpChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: GDP_HISTORY.years,
      datasets: gdpCountries.map((c, i) => ({
        label: c, data: GDP_HISTORY.data[c],
        borderColor: PALETTE[i], backgroundColor: 'transparent',
        borderWidth: 2, pointRadius: 3, pointHoverRadius: 5, tension: 0.4,
        segment: {
          borderDash:  ctx => ctx.p0DataIndex >= projStart - 1 ? [5, 4] : undefined,
          borderColor: ctx => ctx.p0DataIndex >= projStart - 1 ? PALETTE[i] + 'aa' : PALETTE[i],
        },
      }))
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { mode: 'index', intersect: false }
      },
      scales: {
        x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#94a3b8', font: { family: 'DM Mono', size: 11 } } },
        y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#94a3b8', font: { family: 'DM Mono', size: 11 }, callback: v => v + 'T$' } }
      }
    }
  });

  // Légende GDP
  const leg = document.getElementById('gdpLegend');
  gdpCountries.forEach((c, i) => {
    const el = document.createElement('span');
    el.className = 'legend-item';
    el.innerHTML = `<span class="legend-dot" style="background:${PALETTE[i]}"></span>${c}`;
    leg.appendChild(el);
  });

  // Pie chart
  const top5     = [...COUNTRIES_DATA].sort((a,b) => b.gdp - a.gdp).slice(0, 5);
  const total    = COUNTRIES_DATA.reduce((s,c) => s + c.gdp, 0);
  const otherGdp = total - top5.reduce((s,c) => s + c.gdp, 0);

  charts.pie = new Chart(document.getElementById('pieChart').getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: [...top5.map(c => c.name), 'Autres'],
      datasets: [{
        data: [...top5.map(c => +c.gdp.toFixed(2)), +otherGdp.toFixed(2)],
        backgroundColor: [...PALETTE.slice(0, 5), '#e2e8f0'],
        borderWidth: 0, hoverOffset: 7,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '62%',
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.raw}T$ (${((ctx.raw/total)*100).toFixed(1)}%)` } }
      }
    }
  });

  // Légende pie
  const pieLeg = document.getElementById('pieLegend');
  [...top5.map(c => c.name), 'Autres'].forEach((c, i) => {
    const color = i < 5 ? PALETTE[i] : '#e2e8f0';
    const el = document.createElement('span');
    el.className = 'legend-item';
    el.innerHTML = `<span class="legend-dot" style="background:${color}"></span>${c}`;
    pieLeg.appendChild(el);
  });

  // Growth bar chart (régions)
  const regions     = ['Europe','Asie','Amérique','Afrique','Océanie'];
  const regionGrowth = regions.map(r => {
    const cs = COUNTRIES_DATA.filter(c => c.region === r);
    return +(cs.reduce((s,c) => s + c.growth, 0) / cs.length).toFixed(2);
  });

  charts.growth = new Chart(document.getElementById('growthChart').getContext('2d'), {
    type: 'bar',
    data: {
      labels: regions,
      datasets: [{
        label: 'Croissance (%)', data: regionGrowth,
        backgroundColor: regionGrowth.map(v => v >= 0 ? PA('#22c55e',0.7) : PA('#ef4444',0.7)),
        borderColor:     regionGrowth.map(v => v >= 0 ? '#22c55e' : '#ef4444'),
        borderWidth: 1, borderRadius: 6,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#94a3b8' } },
        y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#94a3b8', font: { family: 'DM Mono', size: 11 }, callback: v => v + '%' } }
      }
    }
  });

  // Scatter Internet vs PIB/hab
  charts.scatter = new Chart(document.getElementById('scatterChart').getContext('2d'), {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Pays',
        data: COUNTRIES_DATA.map(c => ({ x: c.gdpPerCapita, y: c.internet, country: c.name })),
        backgroundColor: 'rgba(59,130,246,0.5)',
        pointRadius: 5, pointHoverRadius: 8,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => `${ctx.raw.country}: $${ctx.raw.x.toLocaleString()}/hab · ${ctx.raw.y}% internet` } }
      },
      scales: {
        x: { type: 'logarithmic', grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#94a3b8', font: { family: 'DM Mono', size: 10 }, callback: v => '$' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) } },
        y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#94a3b8', font: { family: 'DM Mono', size: 11 }, callback: v => v + '%' }, min: 0, max: 100 }
      }
    }
  });

  // Top 5 bar horizontal
  const top5sorted = [...COUNTRIES_DATA].sort((a,b) => b.gdp - a.gdp).slice(0, 5);
  charts.top5 = new Chart(document.getElementById('top5Chart').getContext('2d'), {
    type: 'bar',
    indexAxis: 'y',
    data: {
      labels: top5sorted.map(c => c.name),
      datasets: [{
        data: top5sorted.map(c => c.gdp),
        backgroundColor: PALETTE.slice(0,5).map(c => PA(c, 0.8)),
        borderColor: PALETTE.slice(0,5), borderWidth: 1, borderRadius: 5,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { color: '#94a3b8', font: { family: 'DM Mono', size: 11 }, callback: v => v + 'T$' } },
        y: { grid: { display: false }, ticks: { color: '#475569', font: { size: 12 } } }
      }
    }
  });

  // Appliquer l'année initiale (2026)
  applyYear(2026);
}

function mergeWesternSahara(features, world) {
  const MOROCCO_ID        = 504;
  const WESTERN_SAHARA_ID = 732;

  try {
    // ── Vraie fusion topologique via topojson.merge ──────────
    // Filtre les géometries des 2 pays dans l'objet topojson
    const toMerge = world.objects.countries.geometries.filter(
      g => +g.id === MOROCCO_ID || +g.id === WESTERN_SAHARA_ID
    );

    if (toMerge.length < 2) return features;

    // topojson.merge supprime la frontière commune → une seule géométrie
    const mergedGeometry = topojson.merge(world, toMerge);

    // Feature unifié avec l'identité du Maroc
    const mergedFeature = {
      type:       'Feature',
      id:         String(MOROCCO_ID),
      properties: { name: 'Maroc' },
      geometry:   mergedGeometry,
    };

    return [
      ...features.filter(f => +f.id !== MOROCCO_ID && +f.id !== WESTERN_SAHARA_ID),
      mergedFeature,
    ];
  } catch(e) {
    // Fallback : retourner les features originaux si topojson.merge échoue
    console.warn('mergeWesternSahara fallback:', e);
    return features;
  }
}

function initWorldMap() {
  renderMap(document.getElementById('mapMetric').value || 'gdp');
  document.getElementById('mapMetric').addEventListener('change', e => {
    document.getElementById('worldMap').innerHTML = '';
    renderMap(e.target.value);
  });
}

function getMetricLabel(m) {
  return { gdp:'PIB (T$)', population:'Population (M)', internet:'Internet (%)', growth:'Croissance (%)' }[m] || m;
}

function renderMap(metric) {
  const container = document.getElementById('worldMap');
  const w = container.offsetWidth || 700;
  const h = Math.round(w * 0.5);

  const dataMap = {};
  COUNTRIES_DATA.forEach(c => { dataMap[c.name] = c[metric]; });
  const allVals  = Object.values(dataMap).filter(v => v != null);
  const minV = Math.min(...allVals), maxV = Math.max(...allVals);
  const colorScale = d3.scaleSequential(d3.interpolateBlues).domain([minV, maxV]);

  const svg = d3.select('#worldMap').append('svg').attr('viewBox', `0 0 ${w} ${h}`).attr('width','100%');
  const projection = d3.geoNaturalEarth1().scale(w/6.3).translate([w/2, h/2]);
  const path = d3.geoPath(projection);
  const tooltip = document.getElementById('tooltip');

  d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(world => {
    const features = topojson.feature(world, world.objects.countries).features;

    const mergedFeatures = mergeWesternSahara(features, world);

    svg.selectAll('path').data(mergedFeatures).join('path')
      .attr('d', path)
      .attr('fill', d => {
        const name = COUNTRY_MAP_CODES[d.id] || COUNTRY_MAP_CODES[String(d.id).padStart(3,'0')];
        const val  = dataMap[name];
        return val != null ? colorScale(val) : '#c8ddf0';
      })
      .attr('stroke','rgba(255,255,255,0.8)').attr('stroke-width',0.5)
      .style('cursor','pointer')
      .on('mousemove', (event, d) => {
        const name = COUNTRY_MAP_CODES[d.id] || COUNTRY_MAP_CODES[String(d.id).padStart(3,'0')];
        const val  = dataMap[name];
        if (name) {
          tooltip.style.display = 'block';
          tooltip.style.left = (event.clientX + 12) + 'px';
          tooltip.style.top  = (event.clientY - 10) + 'px';
          tooltip.innerHTML  = `<strong>${name}</strong><br>${getMetricLabel(metric)}: ${val != null ? val.toLocaleString() : 'N/A'}`;
        }
      })
      .on('mouseleave', () => { tooltip.style.display = 'none'; })
      .on('click', (event, d) => {
        const name    = COUNTRY_MAP_CODES[d.id] || COUNTRY_MAP_CODES[String(d.id).padStart(3,'0')];
        const country = COUNTRIES_DATA.find(c => c.name === name);
        if (country) {
          svg.selectAll('path').classed('selected', false);
          d3.select(event.currentTarget).classed('selected', true);
          showCountryPanel(country);
        }
      });
    document.getElementById('mapLegendGrad').style.background =
      `linear-gradient(90deg, ${colorScale(minV)}, ${colorScale(maxV)})`;
  }).catch(() => {
    container.innerHTML = `<div style="padding:40px;text-align:center;color:#94a3b8;font-size:13px;"><i class="ti ti-world-off" style="font-size:32px;display:block;margin-bottom:8px"></i>Carte non disponible hors ligne</div>`;
  });
}

function showCountryPanel(country) {
  document.getElementById('countryFlagDisplay').textContent = country.flag;
  document.getElementById('countryName').textContent        = country.name;
  document.getElementById('countryRegion').textContent      = country.region;
  document.getElementById('cPop').textContent     = country.population.toLocaleString() + ' M';
  document.getElementById('cGdp').textContent     = country.gdp.toFixed(2) + ' T$';
  document.getElementById('cGrowth').textContent  = (country.growth > 0 ? '+' : '') + country.growth + '%';
  document.getElementById('cInternet').textContent = country.internet + '%';
  document.getElementById('cEnergy').textContent   = country.energy.toFixed(1) + ' EJ';

  // Insight
  const parts = [];
  if (country.growth > 5)       parts.push(`Forte croissance +${country.growth}%.`);
  else if (country.growth < 0)  parts.push(`Récession (${country.growth}%).`);
  else                          parts.push(`Croissance modérée +${country.growth}%.`);
  if (country.internet > 95)    parts.push(' Quasi-totalité connectée.');
  else if (country.internet < 40) parts.push(' Fort potentiel numérique.');
  if (country.gdpPerCapita > 50000) parts.push(' Économie très avancée.');
  else if (country.gdpPerCapita < 3000) parts.push(' Économie en développement.');

  document.getElementById('countryInsightText').textContent = parts.join('');
  document.getElementById('countryInsight').style.display = 'flex';
  document.getElementById('addToCompare').style.display   = 'block';
  document.getElementById('addToCompare').onclick = () => { addToCompareSlot(country.name); showView('compare'); };
}

function initAdvancedCharts() {
  document.querySelectorAll('.chart-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.chart-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.chart-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('panel-' + tab.dataset.chart).classList.add('active');
    });
  });

  // Radar
  charts.radar = new Chart(document.getElementById('radarChart').getContext('2d'), {
    type: 'radar',
    data: {
      labels: RADAR_DATA.labels,
      datasets: RADAR_DATA.datasets.map((d, i) => ({
        label: d.label, data: d.data,
        borderColor: PALETTE[i], backgroundColor: PA(PALETTE[i], 0.08),
        borderWidth: 2, pointRadius: 3, pointBackgroundColor: PALETTE[i],
      }))
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: '#475569', font: { size: 12 }, boxWidth: 10, boxHeight: 10 } } },
      scales: { r: {
        grid: { color: 'rgba(0,0,0,0.07)' }, angleLines: { color: 'rgba(0,0,0,0.07)' },
        pointLabels: { color: '#64748b', font: { size: 12 } },
        ticks: { display: false }, min: 0, max: 100,
      }}
    }
  });

  // Heatmap
  buildHeatmap();

  // Area chart population
  charts.area = new Chart(document.getElementById('areaChart').getContext('2d'), {
    type: 'line',
    data: {
      labels: POPULATION_TREND.years,
      datasets: [
        { label:'Monde',   data:POPULATION_TREND.world,  borderColor:'#3b82f6', backgroundColor:'rgba(59,130,246,0.08)',  fill:true, tension:0.4, borderWidth:2.5 },
        { label:'Asie',    data:POPULATION_TREND.asia,   borderColor:'#f59e0b', backgroundColor:'rgba(245,158,11,0.07)',  fill:true, tension:0.4, borderWidth:2 },
        { label:'Afrique', data:POPULATION_TREND.africa, borderColor:'#22c55e', backgroundColor:'rgba(34,197,94,0.07)',   fill:true, tension:0.4, borderWidth:2 },
        { label:'Europe',  data:POPULATION_TREND.europe, borderColor:'#8b5cf6', backgroundColor:'rgba(139,92,246,0.07)',  fill:true, tension:0.4, borderWidth:2 },
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color:'#475569', font:{size:12}, boxWidth:10 } }, tooltip: { mode:'index', intersect:false } },
      scales: {
        x: { grid:{color:'rgba(0,0,0,0.05)'}, ticks:{color:'#94a3b8', font:{size:11}} },
        y: { grid:{color:'rgba(0,0,0,0.05)'}, ticks:{color:'#94a3b8', font:{family:'DM Mono',size:11}, callback: v => v+' Mrd'} }
      }
    }
  });

  // Population top 15
  const top15 = [...COUNTRIES_DATA].sort((a,b) => b.population - a.population).slice(0,15);
  charts.pop  = new Chart(document.getElementById('popChart').getContext('2d'), {
    type: 'bar', indexAxis: 'y',
    data: {
      labels: top15.map(c => c.flag + ' ' + c.name),
      datasets: [{ data: top15.map(c => c.population),
        backgroundColor: top15.map((_,i) => PA(PALETTE[i % PALETTE.length], 0.75)),
        borderColor:     top15.map((_,i) => PALETTE[i % PALETTE.length]),
        borderWidth:1, borderRadius:4 }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend:{display:false} },
      scales: {
        x: { grid:{color:'rgba(0,0,0,0.05)'}, ticks:{color:'#94a3b8',font:{family:'DM Mono',size:11},callback:v=>v+' M'} },
        y: { grid:{display:false}, ticks:{color:'#475569',font:{size:11}} }
      }
    }
  });
}

function buildHeatmap() {
  const { countries, years, data } = GROWTH_HISTORY;
  const allVals = countries.flatMap(c => data[c]);
  const minV = Math.min(...allVals), maxV = Math.max(...allVals);

  function heatColor(v) {
    if (v < 0) {
      const t = Math.min(Math.abs(v)/Math.abs(minV), 1);
      return `rgb(${Math.round(210+t*30)},${Math.round(60-t*40)},${Math.round(60-t*30)})`;
    }
    const t = Math.min(v/maxV, 1);
    return `rgb(${Math.round(40-t*20)},${Math.round(130+t*110)},${Math.round(90+t*20)})`;
  }

  let html = '<table class="heatmap-table"><thead><tr><th></th>';
  years.forEach(y => {
    const isProj = y >= 2025;
    html += `<th style="${isProj?'color:#b45309;font-style:italic':''}">${y}${isProj?' *':''}</th>`;
  });
  html += '</tr></thead><tbody>';
  countries.forEach(c => {
    html += `<tr><td class="row-label">${c}</td>`;
    data[c].forEach((v, yi) => {
      const isProj = years[yi] >= 2025;
      html += `<td style="background:${heatColor(v)};opacity:${isProj?0.75:1}" title="${c} ${years[yi]}: ${v>0?'+':''}${v}%">${v>0?'+':''}${v}%</td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  html += '<div style="font-size:10px;color:#94a3b8;margin-top:8px;font-family:DM Mono">* Projections FMI/consensus 2025-2026</div>';
  document.getElementById('heatmapContainer').innerHTML = html;
}


// État du comparateur
let cmpSelected  = [];           // max 3 pays
let cmpMapSvg    = null;
let cmpWorldData = null;
const CMP_COLORS = ['#3b82f6','#22c55e','#f59e0b'];

function initCompare() {
  // Charger la carte du comparateur
  renderCompareMap();

  // Bouton Comparer
  const runBtn = document.getElementById('runCompareMap');
  if (runBtn) runBtn.addEventListener('click', runComparisonMap);

  // Bouton Effacer
  const clearBtn = document.getElementById('clearCompare');
  if (clearBtn) clearBtn.addEventListener('click', () => {
    cmpSelected = [];
    refreshCmpSlots();
    refreshCmpMapColors();
    hideCmpResults();
  });

  // Changement de métrique → recolorer la carte
  const metricSel = document.getElementById('compareMetric');
  if (metricSel) metricSel.addEventListener('change', () => {
    if (cmpWorldData) colorCompareMap();
  });
}

/* Rendu de la carte comparateur */
function renderCompareMap() {
  const container = document.getElementById('compareMap');
  if (!container) return;
  const w = Math.max(container.offsetWidth || 700, 400);
  const h = Math.round(w * 0.48);

  const metric = document.getElementById('compareMetric')?.value || 'gdp';
  const dataMap = {};
  COUNTRIES_DATA.forEach(c => { dataMap[c.name] = c[metric]; });
  const allVals = Object.values(dataMap).filter(v => v != null);
  const minV = Math.min(...allVals), maxV = Math.max(...allVals);
  const baseColor = d3.scaleSequential(d3.interpolateBlues).domain([minV, maxV]);

  const svg = d3.select('#compareMap')
    .append('svg')
    .attr('viewBox', `0 0 ${w} ${h}`)
    .attr('width', '100%');

  const proj = d3.geoNaturalEarth1().scale(w / 6.3).translate([w/2, h/2]);
  const path = d3.geoPath(proj);
  const tip  = document.getElementById('tooltip');

  cmpMapSvg = svg;

  d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(world => {
    cmpWorldData = world;
    const features = topojson.feature(world, world.objects.countries).features;
    const mergedFeatures = mergeWesternSahara(features, world);

    svg.selectAll('path')
      .data(mergedFeatures)
      .join('path')
      .attr('d', path)
      .attr('data-id', d => d.id)
      .attr('fill', d => {
        const name = COUNTRY_MAP_CODES[d.id] || COUNTRY_MAP_CODES[String(d.id).padStart(3,'0')];
        const val  = dataMap[name];
        return val != null ? baseColor(val) : '#c8ddf0';
      })
      .attr('stroke', 'rgba(255,255,255,0.85)')
      .attr('stroke-width', 0.5)
      .style('cursor', 'pointer')
      .on('mousemove', (event, d) => {
        const name = COUNTRY_MAP_CODES[d.id] || COUNTRY_MAP_CODES[String(d.id).padStart(3,'0')];
        if (!name) return;
        const country = COUNTRIES_DATA.find(c => c.name === name);
        const alreadySel = cmpSelected.find(s => s.name === name);
        tip.style.display = 'block';
        tip.style.left    = (event.clientX + 14) + 'px';
        tip.style.top     = (event.clientY - 12) + 'px';
        tip.innerHTML = `<strong>${country?.flag || ''} ${name}</strong><br>
          PIB: ${country?.gdp?.toFixed(2) || '—'} T$ &nbsp;·&nbsp;
          Croissance: ${country?.growth > 0 ? '+' : ''}${country?.growth || '—'}%
          ${alreadySel ? '<br><span style="color:#60a5fa">✓ Sélectionné</span>' : ''}`;
      })
      .on('mouseleave', () => { tip.style.display = 'none'; })
      .on('click', (event, d) => {
        const name = COUNTRY_MAP_CODES[d.id] || COUNTRY_MAP_CODES[String(d.id).padStart(3,'0')];
        if (!name) return;
        const country = COUNTRIES_DATA.find(c => c.name === name);
        if (!country) return;
        toggleCmpCountry(country);
      });

    // Gradient légende
    document.getElementById('cmpMapLegendGrad').style.background =
      `linear-gradient(90deg, ${baseColor(minV)}, ${baseColor(maxV)})`;

    // Colorier les pays déjà sélectionnés si on revient sur la vue
    refreshCmpMapColors();

  }).catch(() => {
    container.innerHTML = `<div style="padding:40px;text-align:center;color:#94a3b8;font-size:13px">
      <i class="ti ti-world-off" style="font-size:32px;display:block;margin-bottom:8px"></i>
      Carte non disponible hors ligne</div>`;
  });
}

function toggleCmpCountry(country) {
  const idx = cmpSelected.findIndex(c => c.name === country.name);

  if (idx !== -1) {
    // Déjà sélectionné → retirer
    cmpSelected.splice(idx, 1);
  } else {
    // Nouveau → ajouter si < 3
    if (cmpSelected.length >= 3) {
      // Remplacer le premier
      cmpSelected.shift();
    }
    cmpSelected.push(country);
  }

  refreshCmpSlots();
  refreshCmpMapColors();

  // Mise à jour sous-titre carte
  const sub = document.getElementById('cmpMapSubtitle');
  if (sub) {
    if (cmpSelected.length === 0) sub.textContent = "Cliquez sur un pays pour l'ajouter";
    else if (cmpSelected.length === 1) sub.textContent = `${cmpSelected[0].flag} ${cmpSelected[0].name} sélectionné — ajoutez un 2e pays`;
    else sub.textContent = cmpSelected.map(c => c.flag + ' ' + c.name).join('  vs  ');
  }

  // Lancer la comparaison auto si ≥ 2 pays
  if (cmpSelected.length >= 2) runComparisonMap();
  else hideCmpResults();
}

/* Recolorer les pays sur la carte selon leur slot */
function refreshCmpMapColors() {
  if (!cmpMapSvg) return;

  // Remettre toutes les couleurs de base d'abord
  const metric  = document.getElementById('compareMetric')?.value || 'gdp';
  const dataMap = {};
  COUNTRIES_DATA.forEach(c => { dataMap[c.name] = c[metric]; });
  const allVals  = Object.values(dataMap).filter(v => v != null);
  const minV = Math.min(...allVals), maxV = Math.max(...allVals);
  const baseColor = d3.scaleSequential(d3.interpolateBlues).domain([minV, maxV]);

  cmpMapSvg.selectAll('path')
    .attr('fill', function(d) {
      const name = COUNTRY_MAP_CODES[d.id] || COUNTRY_MAP_CODES[String(d.id).padStart(3,'0')];
      const selIdx = cmpSelected.findIndex(c => c.name === name);
      if (selIdx !== -1) return CMP_COLORS[selIdx];
      const val = dataMap[name];
      return val != null ? baseColor(val) : '#c8ddf0';
    })
    .attr('stroke', function(d) {
      const name = COUNTRY_MAP_CODES[d.id] || COUNTRY_MAP_CODES[String(d.id).padStart(3,'0')];
      const selIdx = cmpSelected.findIndex(c => c.name === name);
      return selIdx !== -1 ? 'white' : 'rgba(255,255,255,0.85)';
    })
    .attr('stroke-width', function(d) {
      const name = COUNTRY_MAP_CODES[d.id] || COUNTRY_MAP_CODES[String(d.id).padStart(3,'0')];
      const selIdx = cmpSelected.findIndex(c => c.name === name);
      return selIdx !== -1 ? 2 : 0.5;
    });
}

function colorCompareMap() { refreshCmpMapColors(); }

/* Mettre à jour les slots visuels en haut */
function refreshCmpSlots() {
  for (let i = 0; i < 3; i++) {
    const slot = document.getElementById(`cmpSlot${i}`);
    if (!slot) continue;
    const country = cmpSelected[i];
    if (country) {
      slot.className = `cmp-slot filled filled-${i}`;
      slot.innerHTML = `
        <span class="cmp-slot-num">${i+1}</span>
        <span class="cmp-slot-flag">${country.flag}</span>
        <span class="cmp-slot-name">${country.name}</span>
        <button class="cmp-slot-remove" onclick="removeCompareSlot(${i})"><i class="ti ti-x"></i></button>`;
    } else {
      slot.className = 'cmp-slot empty';
      slot.innerHTML = `
        <span class="cmp-slot-num">${i+1}</span>
        <span class="cmp-slot-label">${i === 2 ? 'Optionnel' : 'Cliquez sur la carte'}</span>
        <button class="cmp-slot-remove" style="display:none" onclick="removeCompareSlot(${i})"><i class="ti ti-x"></i></button>`;
    }
  }
}

function removeCompareSlot(idx) {
  cmpSelected.splice(idx, 1);
  refreshCmpSlots();
  refreshCmpMapColors();
  if (cmpSelected.length >= 2) runComparisonMap();
  else hideCmpResults();
}

/* Ajouter depuis la carte mondiale (bouton "Ajouter au comparateur") */
function addToCompareSlot(name) {
  const country = COUNTRIES_DATA.find(c => c.name === name);
  if (!country) return;
  if (!cmpSelected.find(c => c.name === name)) {
    if (cmpSelected.length >= 3) cmpSelected.shift();
    cmpSelected.push(country);
    refreshCmpSlots();
    // La carte comparateur sera rendue au prochain showView
  }
}

/* Cacher les résultats */
function hideCmpResults() {
  document.getElementById('cmpPlaceholder').style.display = 'flex';
  document.getElementById('cmpCards').style.display       = 'none';
  document.getElementById('cmpCharts').style.display      = 'none';
}

/* Lancer la comparaison */
function runComparisonMap() {
  const countries = cmpSelected;
  if (countries.length < 2) { hideCmpResults(); return; }

  document.getElementById('cmpPlaceholder').style.display = 'none';
  document.getElementById('cmpCards').style.display       = 'flex';
  document.getElementById('cmpCharts').style.display      = 'block';

  // Cards pays
  const cardsEl = document.getElementById('cmpCards');
  cardsEl.innerHTML = countries.map((c, i) => `
    <div class="cmp-country-card c${i}">
      <div class="cmp-card-header">
        <span class="cmp-card-flag">${c.flag}</span>
        <div>
          <div class="cmp-card-name">${c.name}</div>
          <div class="cmp-card-region">${c.region}</div>
        </div>
        <div style="margin-left:auto;width:12px;height:12px;border-radius:50%;background:${CMP_COLORS[i]};flex-shrink:0"></div>
      </div>
      <div class="cmp-metrics-row">
        <div class="cmp-metric-box"><div class="label">PIB</div><div class="value">${c.gdp.toFixed(1)}T$</div></div>
        <div class="cmp-metric-box"><div class="label">Population</div><div class="value">${c.population >= 100 ? Math.round(c.population)+'M' : c.population.toFixed(1)+'M'}</div></div>
        <div class="cmp-metric-box"><div class="label">Croissance</div><div class="value" style="color:${c.growth>=0?'#16a34a':'#ef4444'}">${c.growth>0?'+':''}${c.growth}%</div></div>
        <div class="cmp-metric-box"><div class="label">Internet</div><div class="value">${c.internet}%</div></div>
        <div class="cmp-metric-box"><div class="label">PIB/hab.</div><div class="value">$${(c.gdpPerCapita/1000).toFixed(0)}k</div></div>
        <div class="cmp-metric-box"><div class="label">Énergie</div><div class="value">${c.energy.toFixed(0)}EJ</div></div>
      </div>
    </div>`).join('');

  // Bar chart
  if (charts.compareBar) charts.compareBar.destroy();
  charts.compareBar = new Chart(document.getElementById('compareBarChart').getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['PIB (T$)', 'Pop. /10', 'Internet %', 'Croissance×10'],
      datasets: countries.map((c, i) => ({
        label: c.flag + ' ' + c.name,
        data:  [c.gdp, c.population/10, c.internet, Math.max(0, c.growth * 10)],
        backgroundColor: PA(CMP_COLORS[i], 0.72),
        borderColor:     CMP_COLORS[i],
        borderWidth: 1, borderRadius: 6,
      }))
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color:'#475569', font:{size:12}, boxWidth:10 } } },
      scales: {
        x: { grid:{display:false}, ticks:{color:'#64748b'} },
        y: { grid:{color:'rgba(0,0,0,0.05)'}, ticks:{color:'#94a3b8',font:{family:'DM Mono',size:11}} }
      }
    }
  });

  // Radar chart
  if (charts.compareRadar) charts.compareRadar.destroy();
  const maxPop = Math.max(...COUNTRIES_DATA.map(c=>c.population));
  const maxGdp = Math.max(...COUNTRIES_DATA.map(c=>c.gdp));
  charts.compareRadar = new Chart(document.getElementById('compareRadarChart').getContext('2d'), {
    type: 'radar',
    data: {
      labels: ['PIB','Population','Internet','Croissance','PIB/hab.','Énergie'],
      datasets: countries.map((c, i) => ({
        label: c.flag + ' ' + c.name,
        data: [
          +(c.gdp/maxGdp*100).toFixed(1),
          +(c.population/maxPop*100).toFixed(1),
          c.internet,
          Math.max(0, c.growth * 10),
          +(Math.min(c.gdpPerCapita/100000,1)*100).toFixed(1),
          +(Math.min(c.energy/170,1)*100).toFixed(1),
        ],
        borderColor: CMP_COLORS[i], backgroundColor: PA(CMP_COLORS[i], 0.12),
        borderWidth: 2, pointRadius: 4, pointBackgroundColor: CMP_COLORS[i],
      }))
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color:'#475569', font:{size:12}, boxWidth:10 } } },
      scales: { r: {
        grid:{ color:'rgba(0,0,0,0.07)' },
        angleLines:{ color:'rgba(0,0,0,0.07)' },
        pointLabels:{ color:'#64748b', font:{size:11} },
        ticks:{ display:false }, min:0, max:100,
      }}
    }
  });
}

let explorerData = [...COUNTRIES_DATA];
let currentPage  = 1;
const PAGE_SIZE  = 10;

function initExplorer() {
  renderTable();
  document.getElementById('applyFilters').addEventListener('click', applyExplorerFilters);
  document.getElementById('resetFilters').addEventListener('click', () => {
    document.getElementById('filterRegion').value  = '';
    document.getElementById('filterSort').value    = 'gdp_desc';
    document.getElementById('filterMinGdp').value  = '';
    explorerData = [...COUNTRIES_DATA]; currentPage = 1; renderTable();
  });
  document.getElementById('globalSearch').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    explorerData = COUNTRIES_DATA.filter(c => c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q));
    currentPage  = 1;
    if (document.getElementById('view-explorer').classList.contains('active')) renderTable();
  });
  document.getElementById('exportCSV').addEventListener('click', exportCSV);
  document.querySelectorAll('.data-table th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      explorerData.sort((a,b) => typeof a[col]==='string' ? a[col].localeCompare(b[col]) : b[col]-a[col]);
      currentPage = 1; renderTable();
    });
  });
}

function applyExplorerFilters() {
  const region = document.getElementById('filterRegion').value;
  const sort   = document.getElementById('filterSort').value;
  const minGdp = parseFloat(document.getElementById('filterMinGdp').value) || 0;
  let data = [...COUNTRIES_DATA];
  if (region) data = data.filter(c => c.region === region);
  if (minGdp) data = data.filter(c => c.gdp >= minGdp);
  const [field,dir] = sort.split('_');
  const fm = {gdp:'gdp',pop:'population',growth:'growth',internet:'internet'};
  data.sort((a,b) => dir==='asc' ? a[fm[field]]-b[fm[field]] : b[fm[field]]-a[fm[field]]);
  explorerData = data; currentPage = 1; renderTable();
}

function renderTable() {
  const body  = document.getElementById('explorerTableBody');
  const total = explorerData.length;
  const page  = explorerData.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE);

  body.innerHTML = page.map(c => `
    <tr>
      <td><div class="country-cell"><span class="country-flag-sm">${c.flag}</span>${c.name}</div></td>
      <td><span class="region-badge region-${c.region.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}">${c.region}</span></td>
      <td class="mono-val">${c.population.toLocaleString()} M</td>
      <td class="mono-val">${c.gdp.toFixed(2)} T$</td>
      <td class="growth-val ${c.growth>=0?'growth-positive':'growth-negative'}">${c.growth>0?'+':''}${c.growth}%</td>
      <td class="mono-val">${c.internet}%</td>
      <td class="mono-val">${c.energy.toFixed(1)} EJ</td>
      <td><button class="btn-row-detail" onclick="showView('worldmap')"><i class="ti ti-map-pin"></i> Voir</button></td>
    </tr>`).join('');

  document.getElementById('tableCount').textContent = `${total} pays affichés`;

  const totalPages = Math.ceil(total/PAGE_SIZE);
  const pag = document.getElementById('pagination');
  pag.innerHTML = '';
  for (let i=1; i<=totalPages; i++) {
    const btn = document.createElement('button');
    btn.className = 'page-btn' + (i===currentPage?' active':'');
    btn.textContent = i;
    btn.onclick = () => { currentPage=i; renderTable(); };
    pag.appendChild(btn);
  }
}

function exportCSV() {
  const rows = explorerData.map(c => [c.name,c.region,c.population,c.gdp,c.growth,c.internet,c.energy]);
  const csv  = [['Pays','Région','Population (M)','PIB (T$)','Croissance (%)','Internet (%)','Énergie (EJ)'],...rows].map(r=>r.join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
  a.download = `datapulse_${ACTIVE_YEAR}.csv`; a.click();
}

function initImport() {
  const zone  = document.getElementById('uploadZone');
  const input = document.getElementById('fileInput');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragging'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragging'));
  zone.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('dragging'); const f=e.dataTransfer.files[0]; if(f) handleFile(f); });
  input.addEventListener('change', e => { if(e.target.files[0]) handleFile(e.target.files[0]); });
  document.getElementById('btnAnalyze').addEventListener('click', analyzeImportedData);
}

let importedData = null;

function handleFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  if (!['csv','json'].includes(ext)) { alert('Format non supporté.'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    let data;
    if (ext==='csv') data = parseCSV(e.target.result);
    else try { data=JSON.parse(e.target.result); if(!Array.isArray(data)) data=[data]; } catch { alert('JSON invalide'); return; }
    importedData = data;
    showImportPreview(file, data);
  };
  reader.readAsText(file);
}

function parseCSV(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h=>h.trim());
  return lines.slice(1).map(line => {
    const vals = line.split(',');
    const obj  = {};
    headers.forEach((h,i) => { obj[h] = isNaN(vals[i]) ? vals[i]?.trim() : parseFloat(vals[i]); });
    return obj;
  });
}

function showImportPreview(file, data) {
  document.getElementById('importPreview').style.display = 'block';
  const ext = file.name.split('.').pop().toLowerCase();
  document.getElementById('importFileInfo').innerHTML =
    `<i class="ti ti-${ext==='csv'?'file-type-csv':'file-code'}" style="font-size:28px;color:#3b82f6"></i>
     <div><strong>${file.name}</strong><br><span style="color:#94a3b8;font-size:11px;font-family:DM Mono">${data.length} lignes · ${(file.size/1024).toFixed(1)} KB</span></div>`;
  const cols = Object.keys(data[0]||{});
  const colsEl = document.getElementById('importColumns');
  colsEl.innerHTML = '<div style="font-size:11px;color:#94a3b8;margin-bottom:6px;font-family:DM Mono;text-transform:uppercase;letter-spacing:.08em">Colonnes détectées</div>';
  cols.forEach(col => {
    const isNum = typeof data[0][col]==='number';
    const tag = document.createElement('span');
    tag.className = `import-column-tag ${isNum?'numeric':'text'}`;
    tag.innerHTML = `<i class="ti ti-${isNum?'numbers':'text-size'}" style="font-size:11px"></i>${col}`;
    colsEl.appendChild(tag);
  });
}

function analyzeImportedData() {
  if (!importedData) return;
  const data = importedData;
  const cols = Object.keys(data[0]||{});
  const numCols = cols.filter(c => typeof data[0][c]==='number');

  const insightsEl = document.getElementById('importInsights');
  insightsEl.innerHTML = '';
  document.getElementById('importResults').style.display = 'block';

  const ins = [];
  ins.push({label:'Dataset', text:`${data.length} enregistrements · ${numCols.length} colonnes numériques`});
  numCols.forEach(col => {
    const vals = data.map(r=>r[col]).filter(v=>v!=null&&!isNaN(v));
    if (!vals.length) return;
    const avg=vals.reduce((s,v)=>s+v,0)/vals.length;
    ins.push({label:col, text:`Moy: ${avg.toFixed(2)} · Min: ${Math.min(...vals)} · Max: ${Math.max(...vals)}`});
  });
  if (numCols.length>=2) {
    const r=pearsonCorrelation(data.map(r=>r[numCols[0]]),data.map(r=>r[numCols[1]]));
    ins.push({label:`Corrélation ${numCols[0]} ↔ ${numCols[1]}`,text:`r = ${r.toFixed(3)} — ${Math.abs(r)>0.7?'Forte':Math.abs(r)>0.4?'Modérée':'Faible'} corrélation`});
  }
  ins.forEach(i => {
    const el=document.createElement('div'); el.className='insight-tag';
    el.innerHTML=`<strong>${i.label}</strong>${i.text}`; insightsEl.appendChild(el);
  });

  // Chart
  const chartsEl = document.getElementById('importCharts');
  chartsEl.innerHTML = '';
  if (numCols.length>=1) {
    const col=numCols[0], labelCol=cols.find(c=>typeof data[0][c]==='string')||cols[0];
    const div=document.createElement('div');
    div.className='chart-card chart-card--large';
    div.innerHTML=`<div class="chart-card-header"><h3 class="chart-title">${col}</h3></div><div style="position:relative;height:280px"><canvas id="importChart1"></canvas></div>`;
    chartsEl.appendChild(div);
    setTimeout(() => {
      if (charts.import1) charts.import1.destroy();
      charts.import1=new Chart(document.getElementById('importChart1').getContext('2d'),{
        type:'bar',
        data:{labels:data.slice(0,12).map(r=>r[labelCol]||''),datasets:[{label:col,data:data.slice(0,12).map(r=>r[col]),backgroundColor:'rgba(59,130,246,0.65)',borderColor:'#3b82f6',borderWidth:1,borderRadius:5}]},
        options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#94a3b8'}},y:{ticks:{color:'#94a3b8',font:{family:'DM Mono',size:11}}}}}
      });
    },50);
  }
}

function loadSampleData(type) {
  let data, name;
  if (type==='gdp') { data=COUNTRIES_DATA.map(c=>({pays:c.name,region:c.region,pib_2026:c.gdp,croissance:c.growth})); name='pib_2026.json'; }
  else if (type==='population') { data=COUNTRIES_DATA.map(c=>({pays:c.name,region:c.region,population_m:c.population,internet_pct:c.internet})); name='demographie_2026.json'; }
  else { data=COUNTRIES_DATA.map(c=>({pays:c.name,energie_ej:c.energy,pib:c.gdp,population:c.population})); name='energie_2026.json'; }
  importedData=data;
  showImportPreview({name,size:JSON.stringify(data).length},data);
}

function initInsights() {
  renderInsights();
  document.getElementById('refreshInsights').addEventListener('click', renderInsights);
}

function renderInsights() {
  const grid      = document.getElementById('insightsGrid');
  const topGrowth = [...COUNTRIES_DATA].sort((a,b)=>b.growth-a.growth)[0];
  const topGdp    = [...COUNTRIES_DATA].sort((a,b)=>b.gdp-a.gdp)[0];
  const topInet   = [...COUNTRIES_DATA].sort((a,b)=>b.internet-a.internet)[0];
  const topPop    = [...COUNTRIES_DATA].sort((a,b)=>b.population-a.population)[0];
  const avgGrowth = (COUNTRIES_DATA.reduce((s,c)=>s+c.growth,0)/COUNTRIES_DATA.length).toFixed(2);
  const avgInet   = (COUNTRIES_DATA.reduce((s,c)=>s+c.internet,0)/COUNTRIES_DATA.length).toFixed(1);

  const insights = [
    {icon:'ti-trending-up',color:'green',  title:'Croissance record',       text:`${topGrowth.flag} ${topGrowth.name} affiche la plus forte croissance avec +${topGrowth.growth}% en ${ACTIVE_YEAR}.`,value:`+${topGrowth.growth}%`},
    {icon:'ti-coin',       color:'blue',   title:'Première économie',        text:`${topGdp.flag} ${topGdp.name} reste la première économie mondiale avec ${topGdp.gdp.toFixed(1)} T$.`,value:`${topGdp.gdp.toFixed(1)} T$`},
    {icon:'ti-wifi',       color:'purple', title:'Connectivité maximale',    text:`${topInet.flag} ${topInet.name} atteint ${topInet.internet}% de connexion internet en ${ACTIVE_YEAR}.`,value:`${topInet.internet}%`},
    {icon:'ti-users',      color:'amber',  title:'Population la plus grande',text:`${topPop.flag} ${topPop.name} : ${topPop.population.toLocaleString()} millions d'habitants.`,value:`${topPop.population.toLocaleString()} M`},
    {icon:'ti-chart-bar',  color:'teal',   title:'Croissance mondiale moy.', text:`Moyenne ${ACTIVE_YEAR} : +${avgGrowth}% avec de fortes disparités régionales.`,value:`+${avgGrowth}%`},
    {icon:'ti-globe',      color:'blue',   title:'Fracture numérique',       text:`${COUNTRIES_DATA.filter(c=>c.internet<50).length} pays sous 50% d'internet, ${COUNTRIES_DATA.filter(c=>c.internet>90).length} dépassent 90%.`,value:`${avgInet}% moy.`},
  ];

  const colorMap = {green:'--green-600',blue:'--blue-600',amber:'--amber-600',purple:'--purple-600',teal:'--teal-600'};
  grid.innerHTML = insights.map(ins => `
    <div class="insight-card">
      <div class="insight-icon insight-icon--${ins.color}"><i class="ti ${ins.icon}"></i></div>
      <div>
        <div class="insight-title">${ins.title}</div>
        <div class="insight-text">${ins.text}</div>
        <div class="insight-value" style="color:var(${colorMap[ins.color]})">${ins.value}</div>
      </div>
    </div>`).join('');

  // Corrélations
  const corrGrid = document.getElementById('correlationsGrid');
  const corrPairs = [
    {a:'PIB',b:'Internet',  va:COUNTRIES_DATA.map(c=>c.gdpPerCapita), vb:COUNTRIES_DATA.map(c=>c.internet)},
    {a:'PIB/hab.',b:'Croissance',va:COUNTRIES_DATA.map(c=>c.gdpPerCapita),vb:COUNTRIES_DATA.map(c=>c.growth)},
    {a:'Population',b:'PIB total',va:COUNTRIES_DATA.map(c=>c.population),vb:COUNTRIES_DATA.map(c=>c.gdp)},
    {a:'Internet',b:'Croissance',va:COUNTRIES_DATA.map(c=>c.internet),vb:COUNTRIES_DATA.map(c=>c.growth)},
  ];
  corrGrid.innerHTML = corrPairs.map(p => {
    const r=pearsonCorrelation(p.va,p.vb), pct=Math.abs(r)*100, neg=r<0;
    return `<div class="correlation-card">
      <div class="correlation-header">
        <span class="correlation-title">${p.a} ↔ ${p.b}</span>
        <span class="correlation-score${neg?' negative':''}">r = ${r.toFixed(3)}</span>
      </div>
      <div class="correlation-bar"><div class="correlation-bar-fill${neg?' negative':''}" style="width:${pct}%"></div></div>
      <div style="font-size:11px;color:#94a3b8;margin-top:6px;font-family:DM Mono">${Math.abs(r)>0.7?'Forte':Math.abs(r)>0.4?'Modérée':'Faible'} corrélation ${neg?'négative':'positive'}</div>
    </div>`;
  }).join('');

  // Rankings
  const rankingsEl = document.getElementById('rankingsRow');
  const cats = [
    {title:`PIB ${ACTIVE_YEAR}`,icon:'ti-coin',   data:[...COUNTRIES_DATA].sort((a,b)=>b.gdp-a.gdp).slice(0,5),        val:c=>c.gdp.toFixed(1)+'T$'},
    {title:'Croissance',        icon:'ti-trending-up',data:[...COUNTRIES_DATA].sort((a,b)=>b.growth-a.growth).slice(0,5),val:c=>(c.growth>0?'+':'')+c.growth+'%'},
    {title:'Internet',          icon:'ti-wifi',   data:[...COUNTRIES_DATA].sort((a,b)=>b.internet-a.internet).slice(0,5),val:c=>c.internet+'%'},
    {title:'Population',        icon:'ti-users',  data:[...COUNTRIES_DATA].sort((a,b)=>b.population-a.population).slice(0,5),val:c=>c.population.toLocaleString()+'M'},
  ];
  rankingsEl.innerHTML = cats.map(cat => `
    <div class="ranking-card">
      <div class="ranking-card-title"><i class="ti ${cat.icon}"></i>${cat.title}</div>
      <ul class="ranking-list">
        ${cat.data.map((c,i)=>`<li class="ranking-item">
          <span class="ranking-num ${i===0?'gold':i===1?'silver':i===2?'bronze':''}">${i+1}</span>
          <span class="ranking-name">${c.flag} ${c.name}</span>
          <span class="ranking-val">${cat.val(c)}</span>
        </li>`).join('')}
      </ul>
    </div>`).join('');
}

/* UTILITAIRE — Pearson */
function pearsonCorrelation(x, y) {
  const n=x.length, mx=x.reduce((s,v)=>s+v,0)/n, my=y.reduce((s,v)=>s+v,0)/n;
  const num=x.reduce((s,v,i)=>s+(v-mx)*(y[i]-my),0);
  const den=Math.sqrt(x.reduce((s,v)=>s+(v-mx)**2,0)*y.reduce((s,v)=>s+(v-my)**2,0));
  return den ? num/den : 0;
}

/* INIT GLOBAL */
document.addEventListener('DOMContentLoaded', () => {
  // Init all modules
  initDashboard();
  initImport();

  // Year filter — set 2026 as default and listen for changes
  const sel = document.getElementById('yearFilter');
  if (sel) {
    sel.value = '2026';
    sel.addEventListener('change', e => applyYear(parseInt(e.target.value)));
  }
});

function injectSessionUser() {
  // Lire la session (sessionStorage ou localStorage)
  let session = null;
  try {
    const raw = sessionStorage.getItem('dp_user') || localStorage.getItem('dp_user');
    if (raw) session = JSON.parse(raw);
  } catch(e) { session = null; }

  // Fallback si pas de session
  const user = session || {
    firstName: 'Utilisateur',
    lastName:  '',
    email:     '',
    role:      'user',
    avatar:    'U',
    createdAt: null,
    loginAt:   null,
  };

  // Avatar initiales
  const avatar = user.avatar ||
    ((user.firstName?.[0] || '') + (user.lastName?.[0] || '')).toUpperCase() ||
    'U';

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Utilisateur';

  const roleLabels = {
    admin:      'Administrateur',
    analyst:    'Analyste',
    researcher: 'Chercheur',
    student:    'Étudiant',
    journalist: 'Journaliste',
    manager:    'Manager',
    user:       'Utilisateur',
    other:      'Utilisateur',
  };
  const roleLabel = roleLabels[user.role] || user.role || 'Utilisateur';

  // Formater la date de création
  function formatDate(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('fr-FR', { year:'numeric', month:'long' });
    } catch { return '—'; }
  }

  // Topbar avatar
  const avatarEl = document.getElementById('userAvatar');
  if (avatarEl) avatarEl.textContent = avatar;

  // Panel Parametres 
  const sName  = document.getElementById('settingsUserName');
  const sEmail = document.getElementById('settingsUserEmail');
  if (sName)  sName.textContent  = fullName;
  if (sEmail) sEmail.textContent = user.email || '—';

  // Modal Profil 
  const pAvatar = document.getElementById('profileModalAvatar');
  const pName   = document.getElementById('profileModalName');
  const pEmail  = document.getElementById('profileModalEmail');
  const pDate   = document.getElementById('profileModalDate');
  const pBadge  = document.querySelector('.dp-profile-badge');

  if (pAvatar) pAvatar.textContent = avatar;
  if (pName)   pName.textContent   = fullName;
  if (pEmail)  pEmail.textContent  = user.email || '—';
  if (pDate)   pDate.textContent   = formatDate(user.loginAt || user.createdAt);
  if (pBadge) {
    pBadge.innerHTML = `<i class="ti ti-shield-check"></i> ${roleLabel}`;
  }

  // Sidebar footer
  const sfBadge = document.querySelector('.data-source-badge span');
  // On garde les stats pays, on ne touche pas

  // Logout dans parametres 
  const logoutBtn = document.querySelector('.dp-btn-danger');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      if (window.Auth) window.Auth.logout();
      else {
        sessionStorage.clear(); localStorage.clear();
        window.location.href = 'login.html';
      }
    };
  }
}


// Données notifications 
const NOTIFICATIONS = [
  { id:1,  type:'alert',  icon:'ti-trending-up',  title:'Croissance record détectée',     text:'L\'Éthiopie atteint +7.8% de croissance en 2026, classement mondial modifié.',  time:'Il y a 5 min',   unread:true  },
  { id:2,  type:'info',   icon:'ti-database',     title:'Données 2026 disponibles',        text:'Les projections FMI 2026 ont été intégrées pour 42 pays.',                        time:'Il y a 1 heure', unread:true  },
  { id:3,  type:'update', icon:'ti-refresh',      title:'Mise à jour des graphiques',      text:'Le graphique PIB a été recalculé avec les nouvelles données Banque Mondiale.',   time:'Il y a 3 h',    unread:true  },
  { id:4,  type:'warn',   icon:'ti-alert-triangle',title:'PIB Allemagne en baisse',       text:'L\'Allemagne enregistre une croissance négative pour la 2e année consécutive.',  time:'Hier 18:30',    unread:false },
  { id:5,  type:'info',   icon:'ti-world',        title:'Carte mondiale actualisée',       text:'42 pays maintenant couverts avec données complètes 2019-2026.',                 time:'Hier 14:00',    unread:false },
  { id:6,  type:'alert',  icon:'ti-bolt',         title:'Pic énergétique Chine',          text:'La consommation énergétique de la Chine dépasse 168 EJ en projection 2026.',    time:'Il y a 2 jours', unread:false },
  { id:7,  type:'update', icon:'ti-upload',       title:'Import CSV disponible',           text:'Le module d\'import CSV supporte maintenant les fichiers jusqu\'à 10 MB.',       time:'Il y a 3 jours', unread:false },
  { id:8,  type:'info',   icon:'ti-chart-bar',    title:'Comparateur amélioré',            text:'Le comparateur carte permet maintenant la sélection directe sur la carte.',      time:'Il y a 5 jours', unread:false },
];

let notifFilter   = 'all';
let exportFmt     = 'csv';
let exportScope   = 'current';

// Helpers
function closePanels() {
  document.getElementById('notifPanel')?.classList.remove('open');
  document.getElementById('settingsPanel')?.classList.remove('open');
  document.getElementById('notifOverlay')?.classList.remove('open');
}

function closeExport()  {
  document.getElementById('exportModal')?.classList.remove('open');
  document.getElementById('exportBackdrop')?.classList.remove('open');
}

function closeProfile() {
  document.getElementById('profileModal')?.classList.remove('open');
  document.getElementById('profileBackdrop')?.classList.remove('open');
}

// Badge notification
function updateNotifBadge() {
  const unread = NOTIFICATIONS.filter(n => n.unread).length;
  const dot    = document.getElementById('notifDot');
  if (!dot) return;
  dot.style.display = unread > 0 ? 'block' : 'none';
}

// Render notifications 
function renderNotifications(filter) {
  const list = document.getElementById('notifList');
  if (!list) return;

  const filtered = filter === 'all'
    ? NOTIFICATIONS
    : NOTIFICATIONS.filter(n => n.type === filter);

  if (filtered.length === 0) {
    list.innerHTML = `<div class="dp-notif-empty"><i class="ti ti-bell-off"></i>Aucune notification</div>`;
    return;
  }

  list.innerHTML = filtered.map(n => `
    <div class="dp-notif-item ${n.unread ? 'unread' : ''}" onclick="markRead(${n.id})">
      <div class="dp-notif-icon ${n.type}"><i class="ti ${n.icon}"></i></div>
      <div class="dp-notif-content">
        <div class="dp-notif-title">${n.title}</div>
        <div class="dp-notif-text">${n.text}</div>
        <div class="dp-notif-time"><i class="ti ti-clock" style="font-size:10px"></i> ${n.time}</div>
      </div>
      ${n.unread ? '<div style="width:7px;height:7px;background:var(--blue-500);border-radius:50%;flex-shrink:0;margin-top:4px"></div>' : ''}
    </div>`).join('');
}

function markRead(id) {
  const n = NOTIFICATIONS.find(n => n.id === id);
  if (n) { n.unread = false; }
  renderNotifications(notifFilter);
  updateNotifBadge();
}

//Init topbar buttons 
function initTopbarButtons() {
  injectSessionUser();


  // NOTIFICATIONS
  const btnNotif = document.getElementById('btnNotif');
  if (btnNotif) {
    updateNotifBadge();
    btnNotif.addEventListener('click', e => {
      e.stopPropagation();
      const panel   = document.getElementById('notifPanel');
      const overlay = document.getElementById('notifOverlay');
      const isOpen  = panel.classList.contains('open');

      closePanels();
      if (!isOpen) {
        panel.classList.add('open');
        overlay.classList.add('open');
        renderNotifications(notifFilter);
      }
    });

    // Tabs filtres
    document.querySelectorAll('.dp-notif-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.dp-notif-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        notifFilter = tab.dataset.filter;
        renderNotifications(notifFilter);
      });
    });

    // Marquer tout lu
    document.getElementById('markAllRead')?.addEventListener('click', () => {
      NOTIFICATIONS.forEach(n => n.unread = false);
      renderNotifications(notifFilter);
      updateNotifBadge();
    });
  }

  // PARAMETRES
  const btnSettings = document.getElementById('btnSettings');
  if (btnSettings) {
    btnSettings.addEventListener('click', e => {
      e.stopPropagation();
      const panel   = document.getElementById('settingsPanel');
      const overlay = document.getElementById('notifOverlay');
      const isOpen  = panel.classList.contains('open');
      closePanels();
      if (!isOpen) {
        panel.classList.add('open');
        overlay.classList.add('open');
      }
    });

    // Theme clair / sombre
    document.querySelectorAll('#themeToggle .dp-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#themeToggle .dp-toggle').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (btn.dataset.val === 'dark') {
          document.body.classList.add('dark-theme');
        } else {
          document.body.classList.remove('dark-theme');
        }
      });
    });

    // Annee par défaut
    document.getElementById('defaultYearSetting')?.addEventListener('change', e => {
      const sel = document.getElementById('yearFilter');
      if (sel) {
        sel.value = e.target.value;
        applyYear(parseInt(e.target.value));
      }
    });

    // Animations
    document.getElementById('chartAnim')?.addEventListener('change', e => {
      Chart.defaults.animation = e.target.checked ? { duration: 400 } : false;
    });

    // Sidebar toggle
    document.getElementById('sidebarToggleSetting')?.addEventListener('change', e => {
      const sidebar = document.getElementById('sidebar');
      if (e.target.checked) {
        sidebar.style.transform = '';
        document.getElementById('mainContent').style.marginLeft = '';
      } else {
        sidebar.style.transform = 'translateX(-100%)';
        document.getElementById('mainContent').style.marginLeft = '0';
      }
    });
  }

  // EXPORT
  const btnExport = document.getElementById('btnExport');
  if (btnExport) {
    btnExport.addEventListener('click', e => {
      e.stopPropagation();
      closePanels();
      const modal   = document.getElementById('exportModal');
      const backdrop= document.getElementById('exportBackdrop');
      modal.classList.add('open');
      backdrop.classList.add('open');
      const expYearLabel = document.getElementById('expYearLabel');
      if (expYearLabel) expYearLabel.textContent = ACTIVE_YEAR;
    });

    // Action export
    document.getElementById('doExport')?.addEventListener('click', doExport);
  }

  // PROFIL (avatar)
  const userAvatar = document.getElementById('userAvatar');
  if (userAvatar) {
    userAvatar.addEventListener('click', e => {
      e.stopPropagation();
      closePanels();
      const modal   = document.getElementById('profileModal');
      const backdrop= document.getElementById('profileBackdrop');
      modal.classList.add('open');
      backdrop.classList.add('open');
    });
  }

  // Fermer en cliquant dehors
  document.addEventListener('click', e => {
    if (!e.target.closest('.dp-panel') && !e.target.closest('#btnNotif') && !e.target.closest('#btnSettings')) {
      closePanels();
    }
  });
}

//Helpers export format
function selectExportFmt(el, fmt) {
  document.querySelectorAll('.dp-export-card').forEach(c => c.classList.remove('active'));
  el.classList.add('active');
  exportFmt = fmt;
}

function selectScope(el, scope) {
  document.querySelectorAll('.dp-scope-btn').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  exportScope = scope;
}

/* Logique export  */
function doExport() {
  const inclCountries   = document.getElementById('expCountries')?.checked;
  const inclStats       = document.getElementById('expStats')?.checked;
  const inclProjections = document.getElementById('expProjections')?.checked;
  const inclInsights    = document.getElementById('expInsights')?.checked;

  if (exportFmt === 'pdf') {
    exportPDF();
    closeExport();
    return;
  }

  // Choisir donnees selon scope
  let dataToExport = [];
  const years = exportScope === 'all'
    ? [2020,2021,2022,2023,2024,2025,2026]
    : exportScope === 'projections'
      ? [2025,2026]
      : [ACTIVE_YEAR];

  if (inclCountries) {
    COUNTRIES_DATA.forEach(c => {
      years.forEach(yr => {
        const gdpIdx    = GDP_HISTORY.years.indexOf(yr);
        const growthIdx = GROWTH_HISTORY.years.indexOf(yr);
        const gdp    = GDP_HISTORY.data[c.name]?.[gdpIdx]    ?? c.gdp;
        const growth = GROWTH_HISTORY.data[c.name]?.[growthIdx] ?? c.growth;
        const isProj = yr >= 2025;
        dataToExport.push({
          pays: c.name, drapeau: c.flag, region: c.region,
          annee: yr,
          pib_trillions: gdp?.toFixed(3) ?? c.gdp,
          population_m: c.population,
          croissance_pct: growth?.toFixed(2) ?? c.growth,
          internet_pct: c.internet,
          energie_ej: c.energy,
          pib_par_habitant: c.gdpPerCapita,
          projection: isProj ? 'Oui' : 'Non',
          source: isProj ? (yr===2025?'FMI WEO 2025':'Projection 2026') : 'Banque Mondiale',
        });
      });
    });
  }

  if (inclInsights) {
    const topGrowth = [...COUNTRIES_DATA].sort((a,b)=>b.growth-a.growth)[0];
    const avgG = (COUNTRIES_DATA.reduce((s,c)=>s+c.growth,0)/COUNTRIES_DATA.length).toFixed(2);
    dataToExport.push({}, {
      pays:'=== INSIGHTS ===', drapeau:'', region:'', annee:'',
      pib_trillions:`Top croissance: ${topGrowth.name} +${topGrowth.growth}%`,
      population_m:`Croissance mondiale moy: ${avgG}%`,
    });
  }

  if (exportFmt === 'json') {
    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    triggerDownload(blob, `datapulse_export_${ACTIVE_YEAR}.json`);
  } else {
    // CSV
    if (dataToExport.length === 0) return;
    const headers = Object.keys(dataToExport[0]);
    const rows    = dataToExport.map(r => headers.map(h => `"${r[h] ?? ''}"` ).join(','));
    const csv     = [headers.join(','), ...rows].join('\n');
    const blob    = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    triggerDownload(blob, `datapulse_export_${ACTIVE_YEAR}.csv`);
  }

  closeExport();
  showToast('Export réussi', `Fichier ${exportFmt.toUpperCase()} téléchargé avec ${dataToExport.length} entrées.`, 'success');
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function exportPDF() {
  const d = KPI_BY_YEAR[ACTIVE_YEAR] || KPI_BY_YEAR[2026];
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>DATA PULSE — Rapport ${ACTIVE_YEAR}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; }
    h1   { font-size: 24px; color: #2563eb; margin-bottom: 4px; }
    .sub { font-size: 13px; color: #94a3b8; margin-bottom: 28px; }
    .kpis{ display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 28px; }
    .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; }
    .kpi-l{ font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing:.06em; }
    .kpi-v{ font-size: 22px; font-weight: 700; color: #0f172a; margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th    { background: #f1f5f9; padding: 8px 10px; text-align: left; font-size: 11px; color: #64748b; }
    td    { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; }
    tr:nth-child(even) td { background: #fafbfc; }
    .badge{ display:inline-block;background:#fef3c7;color:#b45309;font-size:10px;padding:2px 8px;border-radius:10px;margin-left:8px; }
    .footer{ margin-top:32px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px; }
  </style></head><body>
  <h1>DATA PULSE — Rapport analytique ${ACTIVE_YEAR}</h1>
  <div class="sub">${d.subtitle}</div>
  <div class="kpis">
    <div class="kpi"><div class="kpi-l">Population</div><div class="kpi-v">${d.population}</div><div style="font-size:11px;color:#16a34a">${d.popTrend}</div></div>
    <div class="kpi"><div class="kpi-l">PIB Mondial</div><div class="kpi-v">${d.gdp}</div><div style="font-size:11px;color:#16a34a">${d.gdpTrend}</div></div>
    <div class="kpi"><div class="kpi-l">Énergie</div><div class="kpi-v">${d.energy}</div></div>
    <div class="kpi"><div class="kpi-l">Internet</div><div class="kpi-v">${d.internet}</div></div>
  </div>
  <h2 style="font-size:16px;margin-bottom:12px">Top 10 pays par PIB — ${ACTIVE_YEAR}</h2>
  <table>
    <thead><tr><th>#</th><th>Pays</th><th>Région</th><th>PIB (T$)</th><th>Croissance</th><th>Internet</th><th>Statut</th></tr></thead>
    <tbody>
      ${[...COUNTRIES_DATA].sort((a,b)=>b.gdp-a.gdp).slice(0,10).map((c,i)=>`
        <tr>
          <td>${i+1}</td>
          <td>${c.flag} ${c.name}</td>
          <td>${c.region}</td>
          <td>${c.gdp.toFixed(2)}</td>
          <td style="color:${c.growth>=0?'#16a34a':'#ef4444'}">${c.growth>0?'+':''}${c.growth}%</td>
          <td>${c.internet}%</td>
          <td>${ACTIVE_YEAR>=2025?'<span class="badge">Projection</span>':'Réel'}</td>
        </tr>`).join('')}
    </tbody>
  </table>
  <div class="footer">Généré par DATA PULSE · ${new Date().toLocaleDateString('fr-FR', {year:'numeric',month:'long',day:'numeric'})} · Source: FMI / Banque Mondiale</div>
  </body></html>`;

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  triggerDownload(blob, `datapulse_rapport_${ACTIVE_YEAR}.html`);
  showToast('Rapport généré', 'Ouvrez le fichier HTML dans votre navigateur puis imprimez-le en PDF.', 'info');
}

// Toast notification 
function showToast(title, msg, type='info') {
  const existing = document.getElementById('dp-toast');
  if (existing) existing.remove();

  const colors = { success:'#22c55e', info:'#3b82f6', warn:'#f59e0b', error:'#ef4444' };
  const icons  = { success:'ti-check', info:'ti-info-circle', warn:'ti-alert-triangle', error:'ti-x' };

  const toast = document.createElement('div');
  toast.id = 'dp-toast';
  toast.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9000;
    background:white; border:1px solid ${colors[type]}40;
    border-left:4px solid ${colors[type]};
    border-radius:12px; padding:14px 18px;
    box-shadow:0 8px 32px rgba(0,0,0,0.12);
    display:flex; align-items:flex-start; gap:12px;
    max-width:360px; min-width:280px;
    animation:toastIn .25s cubic-bezier(0.4,0,0.2,1);
    font-family:'Inter',sans-serif;
  `;
  toast.innerHTML = `
    <div style="color:${colors[type]};font-size:20px;flex-shrink:0;margin-top:1px"><i class="ti ${icons[type]}"></i></div>
    <div>
      <div style="font-size:13px;font-weight:700;color:#0f172a;margin-bottom:3px">${title}</div>
      <div style="font-size:12px;color:#475569;line-height:1.4">${msg}</div>
    </div>
    <button onclick="this.closest('#dp-toast').remove()"
      style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:16px;padding:0;margin-left:auto;flex-shrink:0;align-self:flex-start">
      <i class="ti ti-x"></i>
    </button>`;

  // Add animation keyframe if not exist
  if (!document.getElementById('toast-style')) {
    const s = document.createElement('style');
    s.id = 'toast-style';
    s.textContent = '@keyframes toastIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}';
    document.head.appendChild(s);
  }

  document.body.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 4500);
}

// Init au chargement 
document.addEventListener('DOMContentLoaded', () => {
  initTopbarButtons();
});

// INIT : NOUVELLES FONCTIONNALITES

function initForecast() {
  // Remplir le select pays
  const sel = document.getElementById('forecastCountry');
  if (sel) {
    Object.keys(GDP_HISTORY.data).forEach(name => {
      const c = COUNTRIES_DATA.find(c => c.name === name);
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = (c?.flag || '') + ' ' + name;
      if (name === 'États-Unis') opt.selected = true;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => ForecastModule.render());
  }
  ForecastModule.render();
}
