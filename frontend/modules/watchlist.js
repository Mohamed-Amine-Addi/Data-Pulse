/* ============================================================
   MODULE : WATCHLIST (Suivi personnalisé)
   frontend/modules/watchlist.js
   Surveiller des pays avec alertes de seuil
   ============================================================ */

const WatchlistModule = (() => {

  // Persistance en mémoire (en prod → localStorage ou API)
  let watchlist = [
    { id:1, country:'Maroc',      metric:'growth',   threshold:4.0,   condition:'above', active:true  },
    { id:2, country:'Chine',      metric:'gdp',      threshold:20.0,  condition:'above', active:true  },
    { id:3, country:'Allemagne',  metric:'growth',   threshold:0.0,   condition:'below', active:true  },
    { id:4, country:'Inde',       metric:'internet', threshold:60.0,  condition:'above', active:false },
    { id:5, country:'Éthiopie',   metric:'growth',   threshold:7.0,   condition:'above', active:true  },
  ];
  let nextId = 6;

  const METRIC_LABELS = { gdp:'PIB (T$)', growth:'Croissance (%)', internet:'Internet (%)', population:'Population (M)', energy:'Énergie (EJ)' };
  const METRIC_KEYS   = { gdp:'gdp', growth:'growth', internet:'internet', population:'population', energy:'energy' };

  // Vérifier les alertes
  function checkAlerts() {
    return watchlist.filter(w => {
      if (!w.active) return false;
      const country = COUNTRIES_DATA.find(c => c.name === w.country);
      if (!country) return false;
      const val = country[METRIC_KEYS[w.metric]];
      return w.condition === 'above' ? val >= w.threshold : val <= w.threshold;
    });
  }

  function render() {
    renderAlertBanner();
    renderWatchCards();
    renderAddForm();
    renderActivityFeed();
  }

  function renderAlertBanner() {
    const triggered = checkAlerts();
    const banner    = document.getElementById('wlAlertBanner');
    if (!banner) return;
    if (triggered.length > 0) {
      banner.style.display = 'flex';
      banner.innerHTML = `
        <i class="ti ti-alert-circle" style="font-size:18px;color:#f59e0b;flex-shrink:0"></i>
        <div style="flex:1">
          <strong style="font-size:13px">${triggered.length} alerte${triggered.length>1?'s':''} déclenchée${triggered.length>1?'s':''}</strong>
          <div style="font-size:12px;color:var(--text-secondary);margin-top:2px">
            ${triggered.map(w => `${w.country} — ${METRIC_LABELS[w.metric]} ${w.condition==='above'?'≥':'≤'} ${w.threshold}`).join(' &nbsp;·&nbsp; ')}
          </div>
        </div>
        <button onclick="document.getElementById('wlAlertBanner').style.display='none'"
          style="background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:18px">
          <i class="ti ti-x"></i>
        </button>`;
    } else {
      banner.style.display = 'none';
    }
  }

  function renderWatchCards() {
    const grid = document.getElementById('wlGrid');
    if (!grid) return;

    if (watchlist.length === 0) {
      grid.innerHTML = `<div class="wl-empty"><i class="ti ti-bookmark"></i><p>Aucun pays suivi — ajoutez-en ci-dessous</p></div>`;
      return;
    }

    grid.innerHTML = watchlist.map(w => {
      const country   = COUNTRIES_DATA.find(c => c.name === w.country);
      if (!country) return '';
      const val       = country[METRIC_KEYS[w.metric]];
      const triggered = w.active && (w.condition === 'above' ? val >= w.threshold : val <= w.threshold);
      const pct       = Math.min(Math.abs(val) / Math.abs(w.threshold) * 100, 100).toFixed(0);
      const diff      = (val - w.threshold).toFixed(2);

      return `
        <div class="wl-card ${triggered ? 'wl-card--alert' : ''} ${!w.active ? 'wl-card--inactive' : ''}">
          <div class="wl-card-header">
            <div style="display:flex;align-items:center;gap:8px">
              <span style="font-size:22px">${country.flag}</span>
              <div>
                <div class="wl-card-name">${country.name}</div>
                <div class="wl-card-region">${country.region}</div>
              </div>
            </div>
            <div style="display:flex;align-items:center;gap:6px">
              ${triggered ? '<span class="wl-badge wl-badge--alert"><i class="ti ti-bell-ringing"></i> Alerte</span>' : ''}
              <label class="dp-switch" style="transform:scale(0.85)">
                <input type="checkbox" ${w.active?'checked':''} onchange="WatchlistModule.toggleAlert(${w.id})">
                <span class="dp-switch-slider"></span>
              </label>
              <button class="rb-tool-btn rb-tool-btn--danger" onclick="WatchlistModule.removeAlert(${w.id})">
                <i class="ti ti-trash"></i>
              </button>
            </div>
          </div>

          <div class="wl-metrics-row">
            <div class="wl-metric">
              <div class="wl-metric-label">Valeur actuelle</div>
              <div class="wl-metric-value" style="color:${triggered?'#f59e0b':'var(--blue-600)'}">
                ${typeof val === 'number' ? val.toFixed(2) : val}
                <span style="font-size:11px;font-weight:400">${w.metric==='gdp'?' T$':w.metric==='growth'||w.metric==='internet'?'%':''}</span>
              </div>
            </div>
            <div class="wl-metric">
              <div class="wl-metric-label">Seuil ${w.condition==='above'?'≥':'≤'}</div>
              <div class="wl-metric-value" style="color:var(--text-secondary)">${w.threshold}</div>
            </div>
            <div class="wl-metric">
              <div class="wl-metric-label">Écart</div>
              <div class="wl-metric-value" style="color:${parseFloat(diff)>=0?'var(--green-600)':'var(--red-500)'}">
                ${parseFloat(diff)>=0?'+':''}${diff}
              </div>
            </div>
          </div>

          <div style="margin-top:10px">
            <div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--text-muted);margin-bottom:4px;font-family:DM Mono">
              <span>${METRIC_LABELS[w.metric]}</span>
              <span>${pct}% du seuil</span>
            </div>
            <div style="height:5px;background:var(--bg-elevated);border-radius:3px;overflow:hidden;border:1px solid var(--border-subtle)">
              <div style="height:100%;width:${pct}%;background:${triggered?'#f59e0b':pct>80?'#22c55e':'#3b82f6'};border-radius:3px;transition:width .6s ease"></div>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  function renderAddForm() {
    const form = document.getElementById('wlAddForm');
    if (!form) return;
    form.innerHTML = `
      <div class="wl-form-row">
        <div class="filter-group">
          <label>Pays</label>
          <select class="filter-select" id="wlCountrySel" style="min-width:180px">
            ${COUNTRIES_DATA.map(c=>`<option value="${c.name}">${c.flag} ${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="filter-group">
          <label>Indicateur</label>
          <select class="filter-select" id="wlMetricSel">
            ${Object.entries(METRIC_LABELS).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}
          </select>
        </div>
        <div class="filter-group">
          <label>Condition</label>
          <select class="filter-select" id="wlCondSel">
            <option value="above">≥ Supérieur à</option>
            <option value="below">≤ Inférieur à</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Seuil</label>
          <input type="number" class="filter-input" id="wlThreshold" step="0.1" value="5.0" style="width:100px">
        </div>
        <button class="btn-filter-apply" onclick="WatchlistModule.addAlert()" style="align-self:flex-end">
          <i class="ti ti-plus"></i> Ajouter
        </button>
      </div>`;
  }

  function renderActivityFeed() {
    const feed = document.getElementById('wlFeed');
    if (!feed) return;
    const triggered = checkAlerts();
    const items = [
      ...triggered.map(w => ({ type:'alert', icon:'ti-bell-ringing', color:'#f59e0b', text:`Alerte: ${w.country} — ${METRIC_LABELS[w.metric]} ${w.condition==='above'?'≥':'≤'} ${w.threshold}`, time:'Maintenant' })),
      { type:'info', icon:'ti-chart-bar', color:'#3b82f6', text:`${watchlist.filter(w=>w.active).length} alertes actives sur ${watchlist.length} suivis`, time:'Mis à jour' },
      { type:'update', icon:'ti-refresh', color:'#22c55e', text:'Données synchronisées avec le dataset 2026', time:'Il y a 1h' },
    ];
    feed.innerHTML = items.map(i=>`
      <div class="dp-notif-item">
        <div class="dp-notif-icon" style="background:${i.color}20;color:${i.color}"><i class="ti ${i.icon}"></i></div>
        <div class="dp-notif-content">
          <div class="dp-notif-text">${i.text}</div>
          <div class="dp-notif-time">${i.time}</div>
        </div>
      </div>`).join('');
  }

  function addAlert() {
    const country   = document.getElementById('wlCountrySel')?.value;
    const metric    = document.getElementById('wlMetricSel')?.value;
    const condition = document.getElementById('wlCondSel')?.value;
    const threshold = parseFloat(document.getElementById('wlThreshold')?.value);
    if (!country || !metric || isNaN(threshold)) return;
    watchlist.push({ id: nextId++, country, metric, threshold, condition, active: true });
    render();
    if (typeof showToast === 'function') showToast('Alerte ajoutée', `Suivi activé pour ${country}`, 'success');
  }

  function removeAlert(id) {
    watchlist = watchlist.filter(w => w.id !== id);
    render();
  }

  function toggleAlert(id) {
    const w = watchlist.find(w => w.id === id);
    if (w) { w.active = !w.active; render(); }
  }

  return { render, addAlert, removeAlert, toggleAlert };
})();