/* ============================================================
   MODULE : REPORT BUILDER (Générateur de rapports)
   frontend/modules/report-builder.js
   ============================================================ */

const ReportBuilder = (() => {

  let reportBlocks = [];
  let isDragging   = null;

  const BLOCK_TYPES = {
    kpi_summary:   { label:'KPI Résumé',        icon:'ti-layout-dashboard', desc:'4 indicateurs clés de l\'année' },
    top_countries: { label:'Top 10 pays',        icon:'ti-trophy',           desc:'Classement par métrique' },
    growth_chart:  { label:'Graphique croissance',icon:'ti-chart-bar',       desc:'Bar chart régions' },
    gdp_evolution: { label:'Évolution PIB',       icon:'ti-trending-up',     desc:'Courbe temporelle' },
    correlation:   { label:'Analyse corrélation', icon:'ti-link',            desc:'Tableau de corrélations' },
    region_table:  { label:'Stats par région',    icon:'ti-map',             desc:'Agrégation régionale' },
    text_block:    { label:'Bloc texte',          icon:'ti-text-size',        desc:'Titre et commentaire libre' },
    spacer:        { label:'Séparateur',          icon:'ti-minus',            desc:'Espace visuel' },
  };

  function render() {
    renderPalette();
    renderCanvas();
    bindEvents();
  }

  function renderPalette() {
    const palette = document.getElementById('rbPalette');
    if (!palette) return;
    palette.innerHTML = Object.entries(BLOCK_TYPES).map(([key, b]) => `
      <div class="rb-block-chip" draggable="true" data-type="${key}"
           ondragstart="ReportBuilder.onDragStart(event,'${key}')">
        <i class="ti ${b.icon}"></i>
        <div>
          <div style="font-size:12px;font-weight:600;color:var(--text-primary)">${b.label}</div>
          <div style="font-size:10.5px;color:var(--text-muted);font-family:DM Mono">${b.desc}</div>
        </div>
      </div>`).join('');
  }

  function renderCanvas() {
    const canvas = document.getElementById('rbCanvas');
    if (!canvas) return;

    if (reportBlocks.length === 0) {
      canvas.innerHTML = `
        <div class="rb-empty" id="rbDropZone"
             ondragover="event.preventDefault()"
             ondrop="ReportBuilder.onDrop(event)">
          <i class="ti ti-drag-drop"></i>
          <p>Faites glisser des blocs ici pour construire votre rapport</p>
        </div>`;
      return;
    }

    canvas.innerHTML = `
      <div id="rbDropZone"
           ondragover="event.preventDefault()"
           ondrop="ReportBuilder.onDrop(event)">
        ${reportBlocks.map((block, idx) => renderBlock(block, idx)).join('')}
        <div class="rb-add-zone" ondragover="event.preventDefault()" ondrop="ReportBuilder.onDrop(event)">
          <i class="ti ti-plus"></i> Ajouter un bloc
        </div>
      </div>`;
  }

  function renderBlock(block, idx) {
    const type = BLOCK_TYPES[block.type];
    let content = '';

    switch(block.type) {
      case 'kpi_summary':
        const d = KPI_BY_YEAR[ACTIVE_YEAR] || KPI_BY_YEAR[2026];
        content = `<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:10px">
          ${[
            {l:'Population', v: d.population, c:'#3b82f6'},
            {l:'PIB Mondial', v: d.gdp,        c:'#22c55e'},
            {l:'Énergie',     v: d.energy,      c:'#f59e0b'},
            {l:'Internet',    v: d.internet,    c:'#8b5cf6'},
          ].map(k=>`<div style="background:var(--bg-elevated);border-radius:8px;padding:10px;border-left:3px solid ${k.c}">
            <div style="font-size:10px;color:var(--text-muted);font-family:DM Mono;text-transform:uppercase;letter-spacing:.06em">${k.l}</div>
            <div style="font-size:20px;font-weight:700;color:var(--text-primary);font-family:Outfit,sans-serif">${k.v}</div>
          </div>`).join('')}
        </div>`;
        break;

      case 'top_countries':
        const metric = block.config?.metric || 'gdp';
        const top5   = [...COUNTRIES_DATA].sort((a,b)=>b[metric]-a[metric]).slice(0,5);
        content = `<div style="margin-top:10px">
          ${top5.map((c,i)=>`
            <div style="display:flex;align-items:center;gap:10px;padding:7px 0;border-bottom:1px solid var(--border-subtle)">
              <span style="font-family:DM Mono;font-size:11px;color:var(--text-muted);width:18px">${i+1}</span>
              <span style="font-size:18px">${c.flag}</span>
              <span style="flex:1;font-size:13px;font-weight:500">${c.name}</span>
              <span style="font-family:DM Mono;font-size:12px;font-weight:700;color:var(--blue-600)">
                ${metric==='gdp'?c.gdp.toFixed(2)+' T$':metric==='growth'?(c.growth>0?'+':'')+c.growth+'%':c[metric]}
              </span>
            </div>`).join('')}
        </div>`;
        break;

      case 'text_block':
        content = `<div style="margin-top:8px">
          <div style="font-size:15px;font-weight:700;color:var(--text-primary);margin-bottom:4px">
            ${block.config?.title || 'Titre de la section'}
          </div>
          <div style="font-size:13px;color:var(--text-secondary);line-height:1.6">
            ${block.config?.text || 'Ajoutez votre commentaire ou analyse ici...'}
          </div>
        </div>`;
        break;

      case 'spacer':
        content = '<div style="height:20px"></div>';
        break;

      case 'region_table':
        const regions = ['Europe','Asie','Amérique','Afrique','Océanie'];
        content = `<table style="width:100%;border-collapse:collapse;font-size:12px;margin-top:10px">
          <thead><tr style="background:var(--bg-elevated)">
            <th style="padding:8px;text-align:left;font-size:10px;color:var(--text-muted);text-transform:uppercase;font-family:DM Mono">Région</th>
            <th style="padding:8px;text-align:right;font-size:10px;color:var(--text-muted);text-transform:uppercase;font-family:DM Mono">PIB moy.</th>
            <th style="padding:8px;text-align:right;font-size:10px;color:var(--text-muted);text-transform:uppercase;font-family:DM Mono">Croissance</th>
            <th style="padding:8px;text-align:right;font-size:10px;color:var(--text-muted);text-transform:uppercase;font-family:DM Mono">Pays</th>
          </tr></thead>
          <tbody>
          ${regions.map(r=>{
            const cs=COUNTRIES_DATA.filter(c=>c.region===r);
            const avg=(cs.reduce((s,c)=>s+c.growth,0)/cs.length).toFixed(2);
            const avgGdp=(cs.reduce((s,c)=>s+c.gdp,0)/cs.length).toFixed(2);
            return `<tr style="border-bottom:1px solid var(--border-subtle)">
              <td style="padding:7px 8px;font-weight:500">${r}</td>
              <td style="padding:7px 8px;text-align:right;font-family:DM Mono">${avgGdp} T$</td>
              <td style="padding:7px 8px;text-align:right;font-family:DM Mono;color:${avg>=0?'var(--green-600)':'var(--red-500)'};font-weight:600">
                ${avg>0?'+':''}${avg}%
              </td>
              <td style="padding:7px 8px;text-align:right;font-family:DM Mono">${cs.length}</td>
            </tr>`;
          }).join('')}
          </tbody>
        </table>`;
        break;

      default:
        content = `<div style="padding:16px;background:var(--bg-elevated);border-radius:8px;margin-top:10px;text-align:center;color:var(--text-muted);font-size:13px">
          <i class="ti ${type?.icon||'ti-chart-bar'}" style="font-size:24px;display:block;margin-bottom:6px"></i>
          ${type?.label || block.type} — rendu complet disponible en export
        </div>`;
    }

    return `
      <div class="rb-canvas-block" data-idx="${idx}" draggable="true"
           ondragstart="ReportBuilder.onDragStart(event,null,${idx})"
           ondragover="ReportBuilder.onDragOverBlock(event,${idx})"
           ondrop="ReportBuilder.onDropOnBlock(event,${idx})">
        <div class="rb-block-toolbar">
          <span class="rb-block-label"><i class="ti ${type?.icon||'ti-box'}"></i> ${type?.label||block.type}</span>
          <div style="display:flex;gap:4px">
            ${block.type==='text_block'?`<button class="rb-tool-btn" onclick="ReportBuilder.editBlock(${idx})" title="Modifier"><i class="ti ti-edit"></i></button>`:''}
            <button class="rb-tool-btn" onclick="ReportBuilder.moveBlock(${idx},-1)" title="Monter"><i class="ti ti-arrow-up"></i></button>
            <button class="rb-tool-btn" onclick="ReportBuilder.moveBlock(${idx},1)" title="Descendre"><i class="ti ti-arrow-down"></i></button>
            <button class="rb-tool-btn rb-tool-btn--danger" onclick="ReportBuilder.removeBlock(${idx})" title="Supprimer"><i class="ti ti-trash"></i></button>
          </div>
        </div>
        ${content}
      </div>`;
  }

  function bindEvents() {
    document.getElementById('rbBtnExport')?.addEventListener('click', exportReport);
    document.getElementById('rbBtnClear')?.addEventListener('click', () => {
      if (confirm('Effacer tous les blocs ?')) { reportBlocks = []; renderCanvas(); }
    });
    document.getElementById('rbBtnTemplate')?.addEventListener('click', loadTemplate);
  }

  function onDragStart(event, type, idx=null) {
    if (type) event.dataTransfer.setData('blockType', type);
    if (idx !== null) event.dataTransfer.setData('blockIdx', idx);
  }

  function onDrop(event) {
    event.preventDefault();
    const type = event.dataTransfer.getData('blockType');
    const idx  = event.dataTransfer.getData('blockIdx');
    if (type) {
      reportBlocks.push({ type, config: {} });
    } else if (idx !== '') {
      // Already handled by onDropOnBlock
    }
    renderCanvas();
  }

  function onDragOverBlock(event, idx) { event.preventDefault(); }

  function onDropOnBlock(event, targetIdx) {
    event.preventDefault();
    event.stopPropagation();
    const srcIdx = parseInt(event.dataTransfer.getData('blockIdx'));
    const type   = event.dataTransfer.getData('blockType');
    if (type) {
      reportBlocks.splice(targetIdx, 0, { type, config: {} });
    } else if (!isNaN(srcIdx) && srcIdx !== targetIdx) {
      const moved = reportBlocks.splice(srcIdx, 1)[0];
      reportBlocks.splice(targetIdx, 0, moved);
    }
    renderCanvas();
  }

  function moveBlock(idx, dir) {
    const newIdx = idx + dir;
    if (newIdx < 0 || newIdx >= reportBlocks.length) return;
    [reportBlocks[idx], reportBlocks[newIdx]] = [reportBlocks[newIdx], reportBlocks[idx]];
    renderCanvas();
  }

  function removeBlock(idx) { reportBlocks.splice(idx, 1); renderCanvas(); }

  function editBlock(idx) {
    const block = reportBlocks[idx];
    if (!block) return;
    const title = prompt('Titre :', block.config.title || '');
    const text  = prompt('Texte :', block.config.text  || '');
    if (title !== null) block.config.title = title;
    if (text  !== null) block.config.text  = text;
    renderCanvas();
  }

  function loadTemplate() {
    reportBlocks = [
      { type: 'text_block',    config: { title: `Rapport DATA PULSE — ${ACTIVE_YEAR}`, text: `Analyse macroéconomique mondiale. Sources : FMI · Banque Mondiale · Données ${ACTIVE_YEAR}.` } },
      { type: 'kpi_summary',   config: {} },
      { type: 'spacer',        config: {} },
      { type: 'top_countries', config: { metric: 'gdp' } },
      { type: 'region_table',  config: {} },
      { type: 'growth_chart',  config: {} },
      { type: 'text_block',    config: { title: 'Conclusion', text: 'Les économies émergentes d\'Asie et d\'Afrique montrent la plus forte dynamique de croissance pour 2025-2026.' } },
    ];
    renderCanvas();
    if (typeof showToast === 'function') showToast('Modèle chargé', '7 blocs ajoutés au rapport', 'success');
  }

  function exportReport() {
    const d    = KPI_BY_YEAR[ACTIVE_YEAR] || KPI_BY_YEAR[2026];
    const html = `<!DOCTYPE html><html><head>
      <meta charset="UTF-8"><title>Rapport DATA PULSE ${ACTIVE_YEAR}</title>
      <style>
        *{box-sizing:border-box} body{font-family:Arial,sans-serif;padding:40px;max-width:900px;margin:0 auto;color:#0f172a}
        h1{font-size:26px;color:#2563eb;margin-bottom:4px} .sub{color:#94a3b8;font-size:13px;margin-bottom:28px}
        .kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:16px 0}
        .kpi{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px}
        .kpi .label{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em}
        .kpi .val{font-size:22px;font-weight:700;margin:4px 0}
        table{width:100%;border-collapse:collapse} th,td{padding:8px 10px;text-align:left;font-size:12px}
        th{background:#f1f5f9;color:#64748b;font-size:11px;text-transform:uppercase}
        td{border-bottom:1px solid #f1f5f9} .footer{margin-top:40px;padding-top:14px;border-top:1px solid #e2e8f0;font-size:11px;color:#94a3b8}
      </style></head><body>
      <h1>Rapport DATA PULSE — ${ACTIVE_YEAR}</h1>
      <div class="sub">${d.subtitle}</div>
      <div class="kpis">
        <div class="kpi"><div class="label">Population</div><div class="val">${d.population}</div></div>
        <div class="kpi"><div class="label">PIB Mondial</div><div class="val">${d.gdp}</div></div>
        <div class="kpi"><div class="label">Énergie</div><div class="val">${d.energy}</div></div>
        <div class="kpi"><div class="label">Internet</div><div class="val">${d.internet}</div></div>
      </div>
      <h2 style="font-size:16px;margin:20px 0 10px">Classement PIB ${ACTIVE_YEAR}</h2>
      <table><thead><tr><th>#</th><th>Pays</th><th>PIB (T$)</th><th>Croissance</th><th>Internet</th></tr></thead>
      <tbody>${[...COUNTRIES_DATA].sort((a,b)=>b.gdp-a.gdp).slice(0,10).map((c,i)=>`
        <tr><td>${i+1}</td><td>${c.flag} ${c.name}</td><td>${c.gdp.toFixed(2)}</td>
        <td style="color:${c.growth>=0?'#16a34a':'#ef4444'}">${c.growth>0?'+':''}${c.growth}%</td>
        <td>${c.internet}%</td></tr>`).join('')}
      </tbody></table>
      <div class="footer">Généré le ${new Date().toLocaleDateString('fr-FR')} · DATA PULSE · FMI / Banque Mondiale</div>
      </body></html>`;

    const blob = new Blob([html], { type:'text/html;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `rapport_datapulse_${ACTIVE_YEAR}.html`;
    a.click();
    if (typeof showToast === 'function') showToast('Rapport exporté', 'Ouvrez le fichier HTML puis imprimez-le en PDF', 'success');
  }

  return { render, onDragStart, onDrop, onDragOverBlock, onDropOnBlock, moveBlock, removeBlock, editBlock, loadTemplate };
})();