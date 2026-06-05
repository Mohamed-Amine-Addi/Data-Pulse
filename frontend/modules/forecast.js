/* ============================================================
   MODULE : PRÉVISIONS & FORECASTING
   frontend/modules/forecast.js
   Algorithme de régression linéaire + tendance exponentielle
   ============================================================ */

const ForecastModule = (() => {

  // ── Régression linéaire simple ─────────────────────────────
  function linearRegression(years, values) {
    const n  = years.length;
    const sx = years.reduce((a,b) => a+b, 0);
    const sy = values.reduce((a,b) => a+b, 0);
    const sxy= years.reduce((s,x,i) => s + x*values[i], 0);
    const sxx= years.reduce((s,x) => s + x*x, 0);
    const slope = (n*sxy - sx*sy) / (n*sxx - sx*sx);
    const intercept = (sy - slope*sx) / n;
    const r2 = computeR2(years, values, slope, intercept);
    return { slope, intercept, r2 };
  }

  function computeR2(years, values, slope, intercept) {
    const mean   = values.reduce((a,b)=>a+b,0) / values.length;
    const ssTot  = values.reduce((s,v) => s+(v-mean)**2, 0);
    const ssRes  = years.reduce((s,x,i) => s+(values[i]-(slope*x+intercept))**2, 0);
    return ssTot > 0 ? +(1 - ssRes/ssTot).toFixed(4) : 0;
  }

  // ── Croissance annuelle composée (CAGR) ────────────────────
  function cagr(start, end, years) {
    if (start <= 0) return 0;
    return +((Math.pow(end/start, 1/years) - 1) * 100).toFixed(2);
  }

  // ── Projection vers une année cible ───────────────────────
  function project(years, values, targetYear) {
    const { slope, intercept, r2 } = linearRegression(years, values);
    const projected = slope * targetYear + intercept;
    const lastVal   = values[values.length - 1];
    const lastYear  = years[years.length - 1];
    const cagrVal   = cagr(lastVal, projected, targetYear - lastYear);
    return {
      value:     +projected.toFixed(4),
      r2,
      cagr:      cagrVal,
      confidence: r2 > 0.95 ? 'Élevée' : r2 > 0.80 ? 'Modérée' : 'Faible',
      confidence_color: r2 > 0.95 ? '#22c55e' : r2 > 0.80 ? '#f59e0b' : '#ef4444',
    };
  }

  // ── Générer série forecast 2027-2030 ──────────────────────
  function generateForecast(countryName, metric) {
    const gdpYears  = GDP_HISTORY.years;
    const gdpValues = GDP_HISTORY.data[countryName];
    if (!gdpValues) return null;

    const { slope, intercept, r2 } = linearRegression(gdpYears, gdpValues);
    const futureYears = [2027, 2028, 2029, 2030];

    return {
      country:   countryName,
      metric,
      historical: { years: gdpYears, values: gdpValues },
      forecast: futureYears.map(yr => ({
        year:  yr,
        value: +Math.max(0, slope*yr + intercept).toFixed(3),
        isProj: true,
      })),
      r2,
      cagr: cagr(gdpValues[gdpValues.length-3], gdpValues[gdpValues.length-1], 2),
      confidence: r2 > 0.95 ? 'Élevée' : r2 > 0.80 ? 'Modérée' : 'Faible',
    };
  }

  // ── Rendu de la vue Forecast ──────────────────────────────
  function render() {
    const container = document.getElementById('forecastContent');
    if (!container) return;

    const sel      = document.getElementById('forecastCountry')?.value || 'États-Unis';
    const forecast = generateForecast(sel, 'gdp');
    if (!forecast) return;

    // Chart
    const allYears  = [...forecast.historical.years, ...forecast.forecast.map(f=>f.year)];
    const allValues = [...forecast.historical.values, ...forecast.forecast.map(f=>f.value)];
    const splitIdx  = forecast.historical.years.length - 1;

    renderForecastChart(allYears, allValues, splitIdx, sel);
    renderForecastStats(forecast);
    renderAllCountriesTable();
  }

  function renderForecastChart(years, values, splitIdx, country) {
    const ctx = document.getElementById('forecastChart');
    if (!ctx) return;
    if (window._forecastChart) window._forecastChart.destroy();

    const PAL = '#3b82f6';
    window._forecastChart = new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Historique',
            data: values.map((v,i) => i <= splitIdx ? v : null),
            borderColor: PAL, backgroundColor: 'rgba(59,130,246,0.08)',
            borderWidth: 2.5, fill: true, tension: 0.35,
            pointRadius: 4, pointBackgroundColor: PAL,
          },
          {
            label: 'Prévision (régression)',
            data: values.map((v,i) => i >= splitIdx ? v : null),
            borderColor: PAL, backgroundColor: 'rgba(59,130,246,0.04)',
            borderWidth: 2.5, borderDash: [6,4], fill: true, tension: 0.35,
            pointRadius: 5, pointBackgroundColor: 'white', pointBorderColor: PAL, pointBorderWidth: 2,
          },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { labels: { color:'#475569', font:{size:12}, boxWidth:10 } },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${ctx.raw?.toFixed(2) ?? ''} T$`,
              afterLabel: ctx => ctx.dataIndex > splitIdx ? '  ⓘ Projection — régression linéaire' : '',
            }
          }
        },
        scales: {
          x: { grid:{color:'rgba(0,0,0,0.05)'}, ticks:{color:'#94a3b8', font:{family:'DM Mono',size:11}} },
          y: { grid:{color:'rgba(0,0,0,0.05)'}, ticks:{color:'#94a3b8', font:{family:'DM Mono',size:11}, callback: v => v+'T$'} }
        }
      }
    });
  }

  function renderForecastStats(f) {
    const box = document.getElementById('forecastStats');
    if (!box) return;
    const last = f.forecast[f.forecast.length - 1];
    box.innerHTML = `
      <div class="fc-stat-card">
        <div class="fc-stat-label">PIB prévu 2030</div>
        <div class="fc-stat-value" style="color:var(--blue-600)">${last.value} T$</div>
      </div>
      <div class="fc-stat-card">
        <div class="fc-stat-label">CAGR 2024-2030</div>
        <div class="fc-stat-value" style="color:${f.cagr>=0?'var(--green-600)':'var(--red-500)'}">
          ${f.cagr>0?'+':''}${f.cagr}%/an
        </div>
      </div>
      <div class="fc-stat-card">
        <div class="fc-stat-label">Fiabilité (R²)</div>
        <div class="fc-stat-value" style="color:${f.r2>0.95?'var(--green-600)':f.r2>0.8?'var(--amber-600)':'var(--red-500)'}">
          ${(f.r2*100).toFixed(1)}%
        </div>
      </div>
      <div class="fc-stat-card">
        <div class="fc-stat-label">Confiance</div>
        <div class="fc-stat-value" style="color:${f.r2>0.95?'var(--green-600)':f.r2>0.8?'var(--amber-600)':'var(--red-500)'}">
          ${f.confidence}
        </div>
      </div>
      <div class="fc-stat-card">
        <div class="fc-stat-label">Rang mondial (est.)</div>
        <div class="fc-stat-value">#${[...COUNTRIES_DATA].sort((a,b)=>b.gdp-a.gdp).findIndex(c=>c.name===f.country)+1}</div>
      </div>
      <div class="fc-stat-card">
        <div class="fc-stat-label">Projection 2027</div>
        <div class="fc-stat-value">${f.forecast[0].value} T$</div>
      </div>`;
  }

  function renderAllCountriesTable() {
    const tbody = document.getElementById('forecastTableBody');
    if (!tbody) return;
    const rows = COUNTRIES_DATA
      .filter(c => GDP_HISTORY.data[c.name])
      .map(c => {
        const gdpYrs = GDP_HISTORY.years;
        const gdpVals= GDP_HISTORY.data[c.name];
        const proj   = project(gdpYrs, gdpVals, 2030);
        return { country: c, proj };
      })
      .sort((a,b) => b.proj.value - a.proj.value);

    tbody.innerHTML = rows.map((r, i) => `
      <tr>
        <td class="mono-val">${i+1}</td>
        <td><div class="country-cell">
          <span class="country-flag-sm">${r.country.flag}</span>${r.country.name}
        </div></td>
        <td class="mono-val">${r.country.gdp.toFixed(2)} T$</td>
        <td class="mono-val" style="color:var(--blue-600);font-weight:700">${r.proj.value.toFixed(2)} T$</td>
        <td class="mono-val" style="color:${r.proj.cagr>=0?'var(--green-600)':'var(--red-500)'};font-weight:600">
          ${r.proj.cagr>0?'+':''}${r.proj.cagr}%
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:6px">
            <div style="flex:1;height:5px;background:#f1f5f9;border-radius:3px;overflow:hidden">
              <div style="height:100%;width:${Math.min(r.proj.r2*100,100).toFixed(0)}%;
                background:${r.proj.r2>0.95?'#22c55e':r.proj.r2>0.8?'#f59e0b':'#ef4444'};
                border-radius:3px"></div>
            </div>
            <span style="font-family:DM Mono;font-size:10.5px;color:${r.proj.r2>0.95?'var(--green-600)':r.proj.r2>0.8?'var(--amber-600)':'var(--red-500)'};font-weight:600">
              ${r.proj.confidence}
            </span>
          </div>
        </td>
      </tr>`).join('');
  }

  return { render, generateForecast, project };
})();