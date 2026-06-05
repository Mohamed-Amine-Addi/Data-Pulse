/* ============================================================
   MODULE : CLASSEMENTS DYNAMIQUES
   frontend/modules/rankings.js
   Podiums, évolution de rang, médailles
   ============================================================ */

const RankingsModule = (() => {

  let currentMetric = 'gdp';
  let currentYear   = 2026;
  let sortDir       = 'desc';

  const METRICS = {
    gdp:        { label:'PIB',          unit:'T$',  fmt: v => v.toFixed(2),          icon:'ti-coin',        color:'#3b82f6' },
    growth:     { label:'Croissance',   unit:'%',   fmt: v => (v>0?'+':'')+v.toFixed(1), icon:'ti-trending-up', color:'#22c55e' },
    internet:   { label:'Internet',     unit:'%',   fmt: v => v.toFixed(1),          icon:'ti-wifi',        color:'#8b5cf6' },
    population: { label:'Population',   unit:'M',   fmt: v => v.toLocaleString(),    icon:'ti-users',       color:'#f59e0b' },
    gdpPerCapita:{ label:'PIB/hab.',    unit:'$',   fmt: v => '$'+v.toLocaleString(),icon:'ti-building-bank',color:'#14b8a6' },
    energy:     { label:'Énergie',      unit:'EJ',  fmt: v => v.toFixed(1),          icon:'ti-bolt',        color:'#ef4444' },
  };

  function getCountriesForYear(year) {
    const yi = GDP_HISTORY.years.indexOf(year);
    return COUNTRIES_DATA.map(c => {
      const gdp    = yi >= 0 && GDP_HISTORY.data[c.name] ? GDP_HISTORY.data[c.name][yi] : c.gdp;
      const gi     = GROWTH_HISTORY.years.indexOf(year);
      const growth = gi >= 0 && GROWTH_HISTORY.data[c.name] ? GROWTH_HISTORY.data[c.name][gi] : c.growth;
      return { ...c, gdp, growth };
    });
  }

  function getRanked(year, metric, dir='desc') {
    const countries = getCountriesForYear(year);
    return [...countries].sort((a,b) => {
      const va = a[metric] ?? 0, vb = b[metric] ?? 0;
      return dir === 'desc' ? vb - va : va - vb;
    });
  }

  function getRankChange(country, metric) {
    const prevYear  = Math.max(2020, currentYear - 1);
    const rankNow   = getRanked(currentYear, metric).findIndex(c => c.name === country.name) + 1;
    const rankPrev  = getRanked(prevYear,    metric).findIndex(c => c.name === country.name) + 1;
    return rankPrev - rankNow; // positive = improved
  }

  function render() {
    renderMetricTabs();
    renderPodium();
    renderFullTable();
    renderEvolutionSection();
    bindEvents();
  }

  function renderMetricTabs() {
    const tabs = document.getElementById('rankMetricTabs');
    if (!tabs) return;
    tabs.innerHTML = Object.entries(METRICS).map(([key, m]) => `
      <button class="chart-tab ${key===currentMetric?'active':''}" data-metric="${key}" style="${key===currentMetric?'':''}">
        <i class="ti ${m.icon}" style="margin-right:4px"></i>${m.label}
      </button>`).join('');
    tabs.querySelectorAll('.chart-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        currentMetric = tab.dataset.metric;
        render();
      });
    });
  }

  function renderPodium() {
    const podium  = document.getElementById('rankPodium');
    if (!podium) return;
    const ranked  = getRanked(currentYear, currentMetric);
    const m       = METRICS[currentMetric];
    const top3    = ranked.slice(0, 3);
    const order   = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd

    const heights = ['180px','220px','150px'];
    const medals  = ['🥈','🥇','🥉'];
    const numLabels = ['2','1','3'];

    podium.innerHTML = `
      <div class="rank-podium-wrap">
        ${order.map((c, i) => {
          if (!c) return '';
          const change = getRankChange(c, currentMetric);
          return `
          <div class="rank-podium-slot rank-podium-slot--${numLabels[i]}">
            <div class="rank-podium-flag">${c.flag}</div>
            <div class="rank-podium-name">${c.name}</div>
            <div class="rank-podium-val" style="color:${m.color}">${m.fmt(c[currentMetric])} ${m.unit}</div>
            ${change !== 0 ? `<div class="rank-change ${change>0?'rank-change--up':'rank-change--down'}">
              <i class="ti ${change>0?'ti-arrow-up':'ti-arrow-down'}"></i>${Math.abs(change)} place${Math.abs(change)>1?'s':''}
            </div>` : '<div class="rank-change rank-change--same"><i class="ti ti-minus"></i> Stable</div>'}
            <div class="rank-podium-block" style="height:${heights[i]};background:${m.color}22;border:2px solid ${m.color}44">
              <div class="rank-podium-num">${medals[i]}</div>
            </div>
          </div>`;
        }).join('')}
      </div>`;
  }

  function renderFullTable() {
    const tbody = document.getElementById('rankTableBody');
    if (!tbody) return;
    const ranked = getRanked(currentYear, currentMetric);
    const m      = METRICS[currentMetric];

    tbody.innerHTML = ranked.map((c, i) => {
      const rank   = i + 1;
      const change = getRankChange(c, currentMetric);
      const isProj = currentYear >= 2025;

      return `
        <tr class="${rank<=3?'rank-top3':''}">
          <td>
            <div style="display:flex;align-items:center;gap:6px">
              <span class="rank-medal ${rank===1?'rank-medal--gold':rank===2?'rank-medal--silver':rank===3?'rank-medal--bronze':''}">
                ${rank<=3 ? ['🥇','🥈','🥉'][rank-1] : rank}
              </span>
              ${change!==0?`<span class="rank-mini-change ${change>0?'rank-change--up':'rank-change--down'}">
                <i class="ti ${change>0?'ti-arrow-up':'ti-arrow-down'}"></i>${Math.abs(change)}
              </span>`:'<span style="width:28px;text-align:center;font-size:10px;color:var(--text-muted)">—</span>'}
            </div>
          </td>
          <td><div class="country-cell"><span class="country-flag-sm">${c.flag}</span>${c.name}</div></td>
          <td><span class="region-badge region-${c.region.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}">${c.region}</span></td>
          <td class="mono-val" style="font-weight:700;color:${m.color}">${m.fmt(c[currentMetric])} ${m.unit}</td>
          <td>
            <div style="display:flex;align-items:center;gap:6px;min-width:120px">
              <div style="flex:1;height:5px;background:var(--bg-elevated);border-radius:3px;overflow:hidden;border:1px solid var(--border-subtle)">
                <div style="height:100%;width:${((c[currentMetric]??0)/(ranked[0][currentMetric]??1)*100).toFixed(0)}%;background:${m.color};border-radius:3px"></div>
              </div>
              <span style="font-size:10px;color:var(--text-muted);font-family:DM Mono;width:36px">
                ${((c[currentMetric]??0)/(ranked[0][currentMetric]??1)*100).toFixed(0)}%
              </span>
            </div>
          </td>
          ${isProj ? '<td><span style="background:#fef3c7;color:#b45309;font-size:9.5px;padding:2px 7px;border-radius:10px;font-family:DM Mono">Proj.</span></td>' : '<td></td>'}
        </tr>`;
    }).join('');
  }

  function renderEvolutionSection() {
    const container = document.getElementById('rankEvolution');
    if (!container) return;
    const m       = METRICS[currentMetric];
    const ranked  = getRanked(currentYear, currentMetric).slice(0, 6);

    // Radar multi-pays
    if (!GDP_HISTORY.data[ranked[0]?.name] && currentMetric !== 'growth') return;

    const yearsEvo = [2020, 2021, 2022, 2023, 2024, 2025, 2026];
    container.innerHTML = `<canvas id="rankEvoChart" style="max-height:260px"></canvas>`;

    setTimeout(() => {
      const ctx = document.getElementById('rankEvoChart');
      if (!ctx) return;
      if (window._rankEvoChart) window._rankEvoChart.destroy();
      const PALETTE = ['#3b82f6','#22c55e','#f59e0b','#8b5cf6','#ef4444','#14b8a6'];

      window._rankEvoChart = new Chart(ctx.getContext('2d'), {
        type: 'line',
        data: {
          labels: yearsEvo,
          datasets: ranked.map((c,i) => {
            const vals = yearsEvo.map(yr => {
              if (currentMetric === 'gdp') {
                const yi = GDP_HISTORY.years.indexOf(yr);
                return GDP_HISTORY.data[c.name]?.[yi] ?? c.gdp;
              }
              if (currentMetric === 'growth') {
                const gi = GROWTH_HISTORY.years.indexOf(yr);
                return GROWTH_HISTORY.data[c.name]?.[gi] ?? c.growth;
              }
              return c[currentMetric];
            });
            return {
              label: c.flag + ' ' + c.name, data: vals,
              borderColor: PALETTE[i], backgroundColor: 'transparent',
              borderWidth: 2, pointRadius: 3, tension: 0.35,
              segment: { borderDash: ctx => ctx.p0DataIndex >= 4 ? [5,4] : undefined },
            };
          })
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color:'#475569', font:{size:11}, boxWidth:10 } } },
          scales: {
            x: { grid:{color:'rgba(0,0,0,0.05)'}, ticks:{color:'#94a3b8', font:{family:'DM Mono',size:11}} },
            y: { grid:{color:'rgba(0,0,0,0.05)'}, ticks:{color:'#94a3b8', font:{family:'DM Mono',size:11}, callback: v => v+' '+m.unit} }
          }
        }
      });
    }, 50);
  }

  function bindEvents() {
    document.getElementById('rankYearSel')?.addEventListener('change', e => {
      currentYear = parseInt(e.target.value);
      render();
    });
    document.getElementById('rankSortDir')?.addEventListener('click', () => {
      sortDir = sortDir === 'desc' ? 'asc' : 'desc';
      document.getElementById('rankSortDir').innerHTML =
        `<i class="ti ti-sort-${sortDir==='desc'?'descending':'ascending'}"></i>`;
      render();
    });
  }

  return { render };
})();