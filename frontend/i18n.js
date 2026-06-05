/* ============================================================
   DATA PULSE — i18n.js
   Traduction FR → EN / AR
   Méthode : remplacement des noeuds texte après chargement DOM
   frontend/i18n.js
   ============================================================ */

const I18N = (() => {

  /* ── Langue courante ─────────────────────────────────────── */
  let lang = localStorage.getItem('dp_lang') || 'fr';

  /* ══════════════════════════════════════════════════════════
     DICTIONNAIRE FR → EN / AR
     Clé = texte français exact dans le HTML
  ══════════════════════════════════════════════════════════ */
  const DICT = {
    /* Sidebar */
    'Analyse':{ en:'Analysis', ar:'التحليل' },
    'Dashboard':{ en:'Dashboard', ar:'لوحة التحكم' },
    'Carte mondiale':{ en:'World Map', ar:'الخريطة العالمية' },
    'Visualisations':{ en:'Visualizations', ar:'التمثيلات البيانية' },
    'Outils':{ en:'Tools', ar:'الأدوات' },
    'Comparateur':{ en:'Comparator', ar:'المقارنة' },
    'Explorateur':{ en:'Explorer', ar:'المستكشف' },
    'Import données':{ en:'Import Data', ar:'استيراد البيانات' },
    'Insights & IA':{ en:'Insights & AI', ar:'الرؤى والذكاء' },
    'Insights auto':{ en:'Auto Insights', ar:'رؤى تلقائية' },
    'Prévisions 2030':{ en:'Forecast 2030', ar:'توقعات 2030' },
    'Classements':{ en:'Rankings', ar:'التصنيفات' },
    'Outils Pro':{ en:'Pro Tools', ar:'الأدوات المتقدمة' },
    'Watchlist':{ en:'Watchlist', ar:'قائمة المراقبة' },
    'Data Studio':{ en:'Data Studio', ar:'استوديو البيانات' },
    'Rapports':{ en:'Reports', ar:'التقارير' },
    '42 pays · 2026':{ en:'42 countries · 2026', ar:'42 دولة · 2026' },
    /* Topbar */
    'Exporter':{ en:'Export', ar:'تصدير' },
    /* Dashboard */
    'Vue d\'ensemble globale':{ en:'Global Overview', ar:'نظرة عامة عالمية' },
    'Statistiques mondiales en temps réel':{ en:'Real-time world statistics', ar:'إحصاءات العالم الفعلية' },
    'Population mondiale':{ en:'World Population', ar:'سكان العالم' },
    'PIB mondial':{ en:'World GDP', ar:'الناتج المحلي الإجمالي' },
    'Énergie consommée':{ en:'Energy Consumed', ar:'الطاقة المستهلكة' },
    'Accès Internet':{ en:'Internet Access', ar:'الوصول للإنترنت' },
    'Évolution du PIB — Top 8 économies':{ en:'GDP Evolution — Top 8 economies', ar:'تطور الناتج - أفضل 8 اقتصاديات' },
    'En trillions USD · 2015–2026':{ en:'In trillions USD · 2015–2026', ar:'بتريليونات دولار 2015-2026' },
    'Répartition PIB mondial':{ en:'World GDP Distribution', ar:'توزيع الناتج العالمي' },
    'Parts relatives 2026':{ en:'Relative shares 2026', ar:'الحصص النسبية 2026' },
    'Croissance économique':{ en:'Economic Growth', ar:'النمو الاقتصادي' },
    '% annuel par région 2026':{ en:'Annual % by region 2026', ar:'النسبة السنوية 2026' },
    'Internet vs PIB/hab.':{ en:'Internet vs GDP/cap.', ar:'الإنترنت مقابل دخل الفرد' },
    'Corrélation par pays':{ en:'Correlation by country', ar:'الارتباط حسب الدولة' },
    'Top 5 — PIB 2026':{ en:'Top 5 — GDP 2026', ar:'أفضل 5 — الناتج 2026' },
    'En trillions USD':{ en:'In trillions USD', ar:'بتريليونات دولار' },
    /* World Map */
    'Carte mondiale interactive':{ en:'Interactive World Map', ar:'الخريطة العالمية التفاعلية' },
    'Cliquez sur un pays pour afficher ses données':{ en:'Click a country to show its data', ar:'انقر على دولة لعرض بياناتها' },
    'Sélectionnez un pays':{ en:'Select a country', ar:'اختر دولة' },
    'Cliquez sur la carte':{ en:'Click on the map', ar:'انقر على الخريطة' },
    'Faible':{ en:'Low', ar:'منخفض' },
    'Élevé':{ en:'High', ar:'مرتفع' },
    'Ajouter au comparateur':{ en:'Add to comparator', ar:'إضافة للمقارنة' },
    'Population':{ en:'Population', ar:'السكان' },
    'PIB':{ en:'GDP', ar:'الناتج المحلي' },
    'Croissance':{ en:'Growth', ar:'النمو' },
    'Internet':{ en:'Internet', ar:'الإنترنت' },
    'Énergie':{ en:'Energy', ar:'الطاقة' },
    'Usage Internet':{ en:'Internet Usage', ar:'استخدام الإنترنت' },
    /* Charts */
    'Visualisations avancées':{ en:'Advanced Visualizations', ar:'تمثيلات بيانية متقدمة' },
    'Graphiques interactifs et animés':{ en:'Interactive and animated charts', ar:'رسوم بيانية تفاعلية' },
    'Radar':{ en:'Radar', ar:'راداري' },
    'Heatmap':{ en:'Heatmap', ar:'خريطة حرارية' },
    'Tendances':{ en:'Trends', ar:'الاتجاهات' },
    'Profil multi-dimensionnel — Top 6 pays':{ en:'Multi-dimensional profile — Top 6', ar:'ملف متعدد الأبعاد - أفضل 6' },
    'Normalisation 0–100 sur 6 indicateurs':{ en:'Normalization 0–100 on 6 indicators', ar:'تطبيع 0-100 على 6 مؤشرات' },
    'Heatmap — Croissance économique':{ en:'Heatmap — Economic Growth', ar:'خريطة حرارية - النمو الاقتصادي' },
    'Pays × Années · % de croissance du PIB':{ en:'Countries × Years · GDP growth %', ar:'الدول × السنوات · نمو الناتج' },
    'Tendances population mondiale':{ en:'World Population Trends', ar:'اتجاهات سكان العالم' },
    'Milliards d\'habitants · 1990–2026':{ en:'Billions of people · 1990–2026', ar:'مليارات الأشخاص 1990-2026' },
    'Distribution population — Top 15 pays':{ en:'Population Distribution — Top 15', ar:'توزيع السكان - أفضل 15 دولة' },
    'Millions d\'habitants · 2026':{ en:'Millions of people · 2026', ar:'ملايين الأشخاص 2026' },
    /* Compare */
    'Comparateur de pays':{ en:'Country Comparator', ar:'مقارنة الدول' },
    'Cliquez sur la carte pour sélectionner jusqu\'à 3 pays à comparer':{ en:'Click the map to select up to 3 countries', ar:'انقر على الخريطة لاختيار حتى 3 دول' },
    'Effacer':{ en:'Clear', ar:'مسح' },
    'Optionnel':{ en:'Optional', ar:'اختياري' },
    'Comparer':{ en:'Compare', ar:'مقارنة' },
    'Sélection sur la carte':{ en:'Map selection', ar:'الاختيار من الخريطة' },
    'Cliquez sur un pays pour l\'ajouter':{ en:'Click a country to add it', ar:'انقر على دولة لإضافتها' },
    'Sélectionnez au moins 2 pays':{ en:'Select at least 2 countries', ar:'اختر دولتين على الأقل' },
    'en cliquant sur la carte':{ en:'by clicking the map', ar:'من الخريطة' },
    'Indicateurs clés comparés':{ en:'Key indicators compared', ar:'المؤشرات الرئيسية' },
    'Profil radar':{ en:'Radar profile', ar:'الرسم الشعاعي' },
    /* Explorer */
    'Explorateur de données':{ en:'Data Explorer', ar:'مستكشف البيانات' },
    'Filtrez, triez et recherchez dans les données':{ en:'Filter, sort and search data', ar:'فلترة وترتيب وبحث' },
    'Export CSV':{ en:'Export CSV', ar:'تصدير CSV' },
    'Région':{ en:'Region', ar:'المنطقة' },
    'Toutes les régions':{ en:'All regions', ar:'كل المناطق' },
    'Trier par':{ en:'Sort by', ar:'ترتيب حسب' },
    'PIB minimum (T$)':{ en:'Min GDP (T$)', ar:'أدنى ناتج' },
    'Appliquer':{ en:'Apply', ar:'تطبيق' },
    'Pays':{ en:'Country', ar:'الدولة' },
    'PIB (T$)':{ en:'GDP (T$)', ar:'الناتج' },
    'Voir':{ en:'See', ar:'عرض' },
    /* Import */
    'Import de données':{ en:'Data Import', ar:'استيراد البيانات' },
    'Importez CSV ou JSON — analyse automatique':{ en:'Import CSV or JSON — auto analysis', ar:'استيراد CSV أو JSON' },
    'Glissez votre fichier ici':{ en:'Drag your file here', ar:'اسحب ملفك هنا' },
    'Formats acceptés : CSV, JSON · Max 10 MB':{ en:'Accepted: CSV, JSON · Max 10 MB', ar:'CSV، JSON · 10 ميجابايت' },
    'Parcourir':{ en:'Browse', ar:'استعراض' },
    'Générer les graphiques':{ en:'Generate charts', ar:'إنشاء الرسوم البيانية' },
    'Données exemple':{ en:'Sample data', ar:'بيانات نموذجية' },
    'PIB historique':{ en:'Historical GDP', ar:'الناتج التاريخي' },
    'Démographie':{ en:'Demographics', ar:'الديموغرافيا' },
    'Énergie mondiale':{ en:'World Energy', ar:'الطاقة العالمية' },
    /* Insights */
    'Insights automatiques':{ en:'Automatic Insights', ar:'الرؤى التلقائية' },
    'Analyses et patterns détectés dans les données':{ en:'Detected patterns and analysis', ar:'الأنماط والتحليلات المكتشفة' },
    'Actualiser':{ en:'Refresh', ar:'تحديث' },
    'Corrélations détectées':{ en:'Detected correlations', ar:'الارتباطات المكتشفة' },
    'Classements & Records':{ en:'Rankings & Records', ar:'التصنيفات والأرقام القياسية' },
    /* Forecast */
    'Prévisions & Forecasting':{ en:'Forecasts & Predictions', ar:'التوقعات والتنبؤات' },
    'Régression linéaire · Projections 2027-2030 · CAGR':{ en:'Linear regression · 2027-2030 · CAGR', ar:'الانحدار الخطي · 2027-2030' },
    'Évolution PIB + Projections 2027-2030':{ en:'GDP + Projections 2027-2030', ar:'الناتج + توقعات 2027-2030' },
    'Lignes pleines = historique · Pointillés = projection algorithmique':{ en:'Solid = historical · Dashed = projection', ar:'صلب = تاريخي · منقط = توقع' },
    'Classement PIB projeté 2030 — Tous pays':{ en:'Projected GDP ranking 2030 — All countries', ar:'تصنيف الناتج 2030 - كل الدول' },
    /* Rankings */
    'Classements mondiaux':{ en:'World Rankings', ar:'التصنيفات العالمية' },
    'Podium, évolution de rang, tendances':{ en:'Podium, rank evolution, trends', ar:'المنصة والتطور والاتجاهات' },
    'Évolution Top 6 — 2020-2026':{ en:'Top 6 evolution 2020-2026', ar:'تطور أفضل 6 - 2020-2026' },
    'Lignes pointillées = projections':{ en:'Dashed lines = projections', ar:'الخطوط المنقطة = توقعات' },
    /* Watchlist */
    'Watchlist — Suivi personnalisé':{ en:'Watchlist — Custom tracking', ar:'قائمة المراقبة المخصصة' },
    'Surveillez des pays et recevez des alertes de seuil':{ en:'Monitor countries and get alerts', ar:'راقب الدول وتلقَّ التنبيهات' },
    'Ajouter une alerte':{ en:'Add alert', ar:'إضافة تنبيه' },
    'Activité récente':{ en:'Recent activity', ar:'النشاط الأخير' },
    /* Studio */
    'Créez vos propres visualisations personnalisées':{ en:'Create your own custom visualizations', ar:'أنشئ تمثيلاتك البيانية المخصصة' },
    'Type de graphique':{ en:'Chart type', ar:'نوع الرسم البياني' },
    'Paramètres':{ en:'Settings', ar:'الإعدادات' },
    'Sauvegardés':{ en:'Saved', ar:'محفوظ' },
    'Aperçu du graphique':{ en:'Chart preview', ar:'معاينة الرسم البياني' },
    'Générer':{ en:'Generate', ar:'إنشاء' },
    'Sauvegarder':{ en:'Save', ar:'حفظ' },
    /* Reports */
    'Générateur de rapports':{ en:'Report Generator', ar:'مولد التقارير' },
    'Glissez des blocs pour construire votre rapport personnalisé':{ en:'Drag blocks to build your report', ar:'اسحب الكتل لبناء تقريرك' },
    'Modèle':{ en:'Template', ar:'نموذج' },
    'Blocs disponibles':{ en:'Available blocks', ar:'الكتل المتاحة' },
    'Rapport en cours':{ en:'Current report', ar:'التقرير الجاري' },
    'Glissez les blocs pour réorganiser':{ en:'Drag to reorder', ar:'اسحب لإعادة الترتيب' },
    'Exporter HTML':{ en:'Export HTML', ar:'تصدير HTML' },
    /* Settings Panel */
    'Apparence':{ en:'Appearance', ar:'المظهر' },
    'Thème':{ en:'Theme', ar:'السمة' },
    'Clair':{ en:'Light', ar:'فاتح' },
    'Sombre':{ en:'Dark', ar:'داكن' },
    'Langue':{ en:'Language', ar:'اللغة' },
    'Sidebar':{ en:'Sidebar', ar:'الشريط الجانبي' },
    'Données':{ en:'Data', ar:'البيانات' },
    'Année par défaut':{ en:'Default year', ar:'السنة الافتراضية' },
    'Actualisation auto':{ en:'Auto refresh', ar:'تحديث تلقائي' },
    'Animations graphiques':{ en:'Chart animations', ar:'الرسوم المتحركة' },
    'Compte connecté':{ en:'Connected account', ar:'الحساب المتصل' },
    'Nom':{ en:'Name', ar:'الاسم' },
    'Email':{ en:'Email', ar:'البريد الإلكتروني' },
    'Rôle':{ en:'Role', ar:'الدور' },
    'Se déconnecter':{ en:'Sign out', ar:'تسجيل الخروج' },
    /* Notifications */
    'Notifications':{ en:'Notifications', ar:'الإشعارات' },
    'Tout lire':{ en:'Mark all read', ar:'تعليم الكل مقروء' },
    'Toutes':{ en:'All', ar:'الكل' },
    'Alertes':{ en:'Alerts', ar:'التنبيهات' },
    'Infos':{ en:'Info', ar:'معلومات' },
    'Mises à jour':{ en:'Updates', ar:'التحديثات' },
    /* Profile Modal */
    'Mon profil':{ en:'My profile', ar:'ملفي الشخصي' },
    'Membre depuis':{ en:'Member since', ar:'عضو منذ' },
    'Dernière connexion':{ en:'Last login', ar:'آخر تسجيل دخول' },
    'Datasets importés':{ en:'Imported datasets', ar:'البيانات المستوردة' },
    'Exports réalisés':{ en:'Exports done', ar:'التصديرات المنجزة' },
    'Fermer':{ en:'Close', ar:'إغلاق' },
    'Modifier le profil':{ en:'Edit profile', ar:'تعديل الملف' },
    /* Export Modal */
    'Exporter les données':{ en:'Export data', ar:'تصدير البيانات' },
    'Choisissez le format et la portée des données à exporter.':{ en:'Choose the format and scope to export.', ar:'اختر التنسيق ونطاق البيانات.' },
    'Données à inclure':{ en:'Data to include', ar:'البيانات المراد تضمينها' },
    'Tous les pays (42)':{ en:'All countries (42)', ar:'كل الدول (42)' },
    'Statistiques historiques':{ en:'Historical statistics', ar:'الإحصاءات التاريخية' },
    'Projections 2025-2026':{ en:'Projections 2025-2026', ar:'توقعات 2025-2026' },
    'Insights & Corrélations':{ en:'Insights & Correlations', ar:'الرؤى والارتباطات' },
    'Année':{ en:'Year', ar:'السنة' },
    'Toutes les années':{ en:'All years', ar:'كل السنوات' },
    '2025-2026 seulement':{ en:'2025-2026 only', ar:'2025-2026 فقط' },
    'Annuler':{ en:'Cancel', ar:'إلغاء' },
    'Télécharger':{ en:'Download', ar:'تحميل' },
  };

  /* ── Traduire un texte ───────────────────────────────────── */
  function t(text) {
    if (lang === 'fr') return text;
    const trimmed = text.trim();
    const entry = DICT[trimmed];
    if (!entry) return text;
    return entry[lang] || text;
  }

  /* ── Appliquer RTL + styles ──────────────────────────────── */
  function applyDir() {
    const isAr = lang === 'ar';
    document.documentElement.lang = lang;
    document.documentElement.dir  = isAr ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', isAr);

    if (isAr) {
      injectRtlStyles();
    }
  }

  /* ── Parcourir les noeuds texte et traduire ──────────────── */
  function walkAndTranslate(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent;
      const trimmed = text.trim();
      if (trimmed.length < 2) return;
      const translated = t(trimmed);
      if (translated !== trimmed) {
        // Garder les espaces autour
        const before = text.match(/^\s*/)[0];
        const after  = text.match(/\s*$/)[0];
        node.textContent = before + translated + after;
      }
    } else if (
      node.nodeType === Node.ELEMENT_NODE &&
      !['SCRIPT','STYLE','CANVAS','INPUT','TEXTAREA'].includes(node.tagName) &&
      !node.closest('canvas')
    ) {
      // Traduire placeholder des inputs
      if (node.tagName === 'INPUT' && node.placeholder) {
        node.placeholder = t(node.placeholder);
      }
      node.childNodes.forEach(walkAndTranslate);
    }
  }

  /* ── Appliquer toutes les traductions ────────────────────── */
  function applyAll() {
    applyDir();
    if (lang === 'fr') return;
    walkAndTranslate(document.body);
  }

  /* ── Injecter CSS RTL ────────────────────────────────────── */
  function injectRtlStyles() {
    if (document.getElementById('dp-rtl-style')) return;
    const s = document.createElement('style');
    s.id = 'dp-rtl-style';
    s.textContent = `
      body.rtl { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; }
      body.rtl .sidebar { left: auto; right: 0; border-right: 1px solid var(--border-default); border-left: none; }
      body.rtl .main-content { margin-left: 0 !important; margin-right: var(--sidebar-width); }
      body.rtl .nav-item { flex-direction: row-reverse; }
      body.rtl .nav-item::before { left: auto; right: 0; border-radius: 3px 0 0 3px; }
      body.rtl .topbar { direction: rtl; }
      body.rtl .topbar-left { flex-direction: row-reverse; }
      body.rtl .topbar-right { flex-direction: row-reverse; }
      body.rtl .view-header { direction: rtl; flex-direction: row-reverse; }
      body.rtl .view-actions { flex-direction: row-reverse; }
      body.rtl .kpi-card { flex-direction: row-reverse; }
      body.rtl .kpi-body { text-align: right; }
      body.rtl .chart-card-header { flex-direction: row-reverse; direction: rtl; }
      body.rtl .dp-panel { left: -420px; right: auto; }
      body.rtl .dp-panel.open { left: 0; right: auto; }
      body.rtl .dp-panel-header { flex-direction: row-reverse; }
      body.rtl .dp-settings-row { flex-direction: row-reverse; direction: rtl; }
      body.rtl .dp-settings-label { text-align: right; direction: rtl; }
      body.rtl .data-table { direction: rtl; }
      body.rtl .data-table th, body.rtl .data-table td { text-align: right; }
      body.rtl .country-cell { flex-direction: row-reverse; }
      body.rtl .explorer-filters { direction: rtl; }
      body.rtl .filter-group label { text-align: right; }
      body.rtl .table-footer { flex-direction: row-reverse; }
      body.rtl .country-panel { direction: rtl; }
      body.rtl .country-panel-header { flex-direction: row-reverse; }
      body.rtl .country-stat-item { flex-direction: row-reverse; }
      body.rtl .cmp-slots-bar { direction: rtl; flex-direction: row-reverse; }
      body.rtl .dp-modal-header { flex-direction: row-reverse; }
      body.rtl .dp-modal-body { direction: rtl; }
      body.rtl .dp-modal-footer { flex-direction: row-reverse; }
      body.rtl .sidebar-footer { direction: rtl; }
      body.rtl .search-bar { flex-direction: row-reverse; }
    `;
    document.head.appendChild(s);
  }

  /* ── Changer la langue ───────────────────────────────────── */
  function setLang(newLang) {
    if (!['fr','en','ar'].includes(newLang)) return;
    localStorage.setItem('dp_lang', newLang);
    if (typeof Auth !== 'undefined') {
      const session = Auth.get();
      if (session) Auth.updateSession({ language: newLang });
    }
    window.location.reload();
  }

  /* ── Initialisation ──────────────────────────────────────── */
  function init() {
    lang = localStorage.getItem('dp_lang') || 'fr';

    // Sync le select
    const sel = document.getElementById('langSelect');
    if (sel) {
      sel.value = lang;
      // Retirer les anciens listeners en clonant
      const newSel = sel.cloneNode(true);
      sel.parentNode.replaceChild(newSel, sel);
      newSel.value = lang;
      newSel.addEventListener('change', e => setLang(e.target.value));
    }

    // Appliquer traductions
    applyAll();
  }

  return { init, setLang, t, applyAll, lang: () => lang };
})();

/* ── Auto-init dès que le DOM est prêt ──────────────────────── */
document.addEventListener('DOMContentLoaded', () => I18N.init());

window.I18N = I18N;