/* ============================================================
   MODULE : DATA STUDIO (Éditeur de graphiques custom)
   frontend/modules/data-studio.js
   Créer des graphiques personnalisés avec ses propres params
   ============================================================ */

const DataStudio = (() => {

  let studioChart = null;
  let savedCharts = [];

  const CHART_TYPES = [
    { id:'bar',        label:'Barres',     icon:'ti-chart-bar'         },
    { id:'line',       label:'Ligne',      icon:'ti-chart-line'        },
    { id:'doughnut',   label:'Donut',      icon:'ti-circle-dot'        },
    { id:'radar',      label:'Radar',      icon:'ti-radar'             },
    { id:'bar-horiz',  label:'Barres H',   icon:'ti-layout-rows'       },
    { id:'scatter',    label:'Nuage pts',  icon:'ti-dots'              },
  ];

  const METRICS = {
    gdp:'PIB (T$)', growth:'Croissance (%)', internet:'Internet (%)',
    population:'Population (M)', gdpPerCapita:'PIB/hab. ($)', energy:'Énergie (EJ)',
  };

  function render() {
    renderTypeSelector();
    renderControls();
    bindEvents();
    buildChart(); // default chart
  }

  function renderTypeSelector() {
    const sel = document.getElementById('studioTypeRow');
    if (!sel) return;
    sel.innerHTML = CHART_TYPES.map(t => `
      <button class="studio-type-btn ${t.id==='bar'?'active':''}" data-type="${t.id}">
        <i class="ti ${t.icon}"></i>
        <span>${t.label}</span>
      </button>`).join('');
    sel.querySelectorAll('.studio-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        sel.querySelectorAll('.studio-type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        buildChart();
      });
    });
  }

  function renderControls() {
    const ctrl = document.getElementById('studioControls');
    if (!ctrl) return;
    ctrl.innerHTML = `
      <div class="filter-group">
        <label>Indicateur X</label>
        <select class="filter-select" id="studioMetricX">
          ${Object.entries(METRICS).map(([k,v])=>`<option value="${k}" ${k==='gdp'?'selected':''}>${v}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label>Indicateur Y (si scatter)</label>
        <select class="filter-select" id="studioMetricY">
          ${Object.entries(METRICS).map(([k,v])=>`<option value="${k}" ${k==='internet'?'selected':''}>${v}</option>`).join('')}
        </select>
      </div>
      <div class="filter-group">
        <label>Région</label>
        <select class="filter-select" id="studioRegion">
          <option value="">Toutes</option>
          <option value="Europe">Europe</option>
          <option value="Asie">Asie</option>
          <option value="Amérique">Amérique</option>
          <option value="Afrique">Afrique</option>
          <option value="Océanie">Océanie</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Nb pays max</label>
        <select class="filter-select" id="studioLimit">
          <option value="5">5</option>
          <option value="10" selected>10</option>
          <option value="15">15</option>
          <option value="20">20</option>
          <option value="42">Tous</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Palette</label>
        <select class="filter-select" id="studioPalette">
          <option value="blue">Bleu</option>
          <option value="rainbow">Arc-en-ciel</option>
          <option value="green">Vert</option>
          <option value="warm">Chaud</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Trier par</label>
        <select class="filter-select" id="studioSort">
          <option value="desc">Décroissant</option>
          <option value="asc">Croissant</option>
          <option value="alpha">Alphabétique</option>
        </select>
      </div>`;
  }

  function getPalette(name, count) {
    const palettes = {
      blue:    ['#3b82f6','#60a5fa','#93c5fd','#1d4ed8','#2563eb','#1e40af','#bfdbfe','#dbeafe'],
      rainbow: ['#3b82f6','#22c55e','#f59e0b','#8b5cf6','#ef4444','#14b8a6','#f97316','#ec4899'],
      green:   ['#16a34a','#22c55e','#4ade80','#166534','#15803d','#86efac','#dcfce7','#bbf7d0'],
      warm:    ['#ef4444','#f97316','#f59e0b','#eab308','#dc2626','#ea580c','#fde047','#fbbf24'],
    };
    const p = palettes[name] || palettes.rainbow;
    return Array.from({ length: count }, (_, i) => p[i % p.length]);
  }

  function buildChart() {
    const typeBtn  = document.querySelector('.studio-type-btn.active');
    const chartType= typeBtn?.dataset.type || 'bar';
    const metricX  = document.getElementById('studioMetricX')?.value  || 'gdp';
    const metricY  = document.getElementById('studioMetricY')?.value  || 'internet';
    const region   = document.getElementById('studioRegion')?.value   || '';
    const limit    = parseInt(document.getElementById('studioLimit')?.value  || 10);
    const palette  = document.getElementById('studioPalette')?.value  || 'rainbow';
    const sortMode = document.getElementById('studioSort')?.value     || 'desc';

    let data = [...COUNTRIES_DATA];
    if (region) data = data.filter(c => c.region === region);
    if (sortMode === 'desc')  data.sort((a,b) => (b[metricX]??0) - (a[metricX]??0));
    if (sortMode === 'asc')   data.sort((a,b) => (a[metricX]??0) - (b[metricX]??0));
    if (sortMode === 'alpha') data.sort((a,b) => a.name.localeCompare(b.name));
    data = data.slice(0, limit);

    const colors = getPalette(palette, data.length);
    const labels = data.map(c => c.flag + ' ' + c.name);
    const vals   = data.map(c => c[metricX] ?? 0);
    const valsY  = data.map(c => c[metricY] ?? 0);

    const ctx = document.getElementById('studioCanvas');
    if (!ctx) return;
    if (studioChart) studioChart.destroy();

    const isHoriz   = chartType === 'bar-horiz';
    const isScatter = chartType === 'scatter';
    const isRadar   = chartType === 'radar';

    let config;
    const baseOpts = {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: isRadar || data.length <= 6, labels: { color:'#475569', font:{size:11}, boxWidth:10 } },
        tooltip: { callbacks: { label: ctx => isScatter
          ? ` ${data[ctx.dataIndex]?.name}: X=${ctx.raw.x}, Y=${ctx.raw.y}`
          : ` ${ctx.label}: ${ctx.raw}`
        }}
      },
    };
    const scaleOpts = {
      x: { grid:{color:'rgba(0,0,0,0.05)'}, ticks:{color:'#94a3b8',font:{family:'DM Mono',size:11}} },
      y: { grid:{color:'rgba(0,0,0,0.05)'}, ticks:{color:'#94a3b8',font:{family:'DM Mono',size:11}} },
    };

    if (isScatter) {
      config = {
        type: 'scatter',
        data: { datasets: [{ label:'Pays', data: data.map(c=>({ x: c[metricX]??0, y: c[metricY]??0 })),
          backgroundColor: colors.map(c=>c+'cc'), pointRadius: 7, pointHoverRadius: 10 }] },
        options: { ...baseOpts, scales: scaleOpts }
      };
    } else if (isRadar) {
      config = {
        type: 'radar',
        data: { labels: data.slice(0,6).map(c=>c.flag+' '+c.name),
          datasets: [{ label: METRICS[metricX], data: vals.slice(0,6),
            borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', borderWidth:2, pointRadius:4 }]
        },
        options: { ...baseOpts, scales: { r:{grid:{color:'rgba(0,0,0,0.07)'},pointLabels:{color:'#64748b',font:{size:10}},ticks:{display:false}} } }
      };
    } else {
      config = {
        type: isHoriz ? 'bar' : chartType,
        data: {
          labels,
          datasets: [{
            label: METRICS[metricX],
            data: vals,
            backgroundColor: ['pie','doughnut'].includes(chartType) ? colors : colors.map(c=>c+'cc'),
            borderColor:     ['pie','doughnut'].includes(chartType) ? 'white' : colors,
            borderWidth: ['pie','doughnut'].includes(chartType) ? 2 : 1,
            borderRadius: ['bar','bar-horiz'].includes(chartType) ? 6 : 0,
            fill: chartType === 'line' ? { target:'origin', above:'rgba(59,130,246,0.06)' } : false,
            tension: 0.35,
          }]
        },
        options: {
          ...baseOpts,
          indexAxis: isHoriz ? 'y' : 'x',
          cutout: chartType === 'doughnut' ? '55%' : undefined,
          scales: ['pie','doughnut','radar'].includes(chartType) ? {} : scaleOpts,
        }
      };
    }

    studioChart = new Chart(ctx.getContext('2d'), config);
    updateStudioStats(data, metricX);
  }

  function updateStudioStats(data, metric) {
    const vals   = data.map(c => c[metric] ?? 0);
    const avg    = vals.reduce((s,v)=>s+v,0) / vals.length;
    const max    = Math.max(...vals);
    const min    = Math.min(...vals);
    const stdDev = Math.sqrt(vals.reduce((s,v)=>s+(v-avg)**2,0)/vals.length);

    const stats = document.getElementById('studioStats');
    if (!stats) return;
    stats.innerHTML = `
      <div class="studio-stat"><div class="studio-stat-label">Moyenne</div><div class="studio-stat-val">${avg.toFixed(2)}</div></div>
      <div class="studio-stat"><div class="studio-stat-label">Maximum</div><div class="studio-stat-val" style="color:var(--green-600)">${max.toFixed(2)}</div></div>
      <div class="studio-stat"><div class="studio-stat-label">Minimum</div><div class="studio-stat-val" style="color:var(--red-500)">${min.toFixed(2)}</div></div>
      <div class="studio-stat"><div class="studio-stat-label">Écart-type</div><div class="studio-stat-val">${stdDev.toFixed(2)}</div></div>
      <div class="studio-stat"><div class="studio-stat-label">Nb pays</div><div class="studio-stat-val">${data.length}</div></div>`;
  }

  function saveChart() {
    const typeBtn = document.querySelector('.studio-type-btn.active');
    const name    = prompt('Nom du graphique ?', `Graphique ${savedCharts.length+1}`);
    if (!name) return;
    savedCharts.push({ name, type: typeBtn?.dataset.type, metric: document.getElementById('studioMetricX')?.value, ts: Date.now() });
    renderSavedCharts();
    if (typeof showToast === 'function') showToast('Graphique sauvegardé', name, 'success');
  }

  function renderSavedCharts() {
    const list = document.getElementById('studioSavedList');
    if (!list) return;
    if (savedCharts.length === 0) { list.innerHTML = '<div style="font-size:12px;color:var(--text-muted);padding:8px">Aucun graphique sauvegardé</div>'; return; }
    list.innerHTML = savedCharts.map((c,i)=>`
      <div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border-subtle);font-size:12px">
        <i class="ti ti-chart-bar" style="color:var(--blue-500)"></i>
        <span style="flex:1">${c.name}</span>
        <button class="rb-tool-btn rb-tool-btn--danger" onclick="DataStudio.deleteSaved(${i})"><i class="ti ti-trash"></i></button>
      </div>`).join('');
  }

  function deleteSaved(idx) { savedCharts.splice(idx,1); renderSavedCharts(); }

  function bindEvents() {
    document.getElementById('studioBuildBtn')?.addEventListener('click', buildChart);
    document.getElementById('studioSaveBtn')?.addEventListener('click', saveChart);
    ['studioMetricX','studioMetricY','studioRegion','studioLimit','studioPalette','studioSort'].forEach(id => {
      document.getElementById(id)?.addEventListener('change', buildChart);
    });
  }

  return { render, buildChart, saveChart, deleteSaved };
})();