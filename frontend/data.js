// ============================================================
// DATA PULSE — Dataset complet
// Source : estimations réalistes FMI / Banque Mondiale
// Années couvertes : 2015 → 2026
// Fichier : data.js  (SEUL fichier à modifier/remplacer)
// ============================================================

// ─────────────────────────────────────────────────────────────
// 1. PAYS — données de référence (année courante = 2026)
// ─────────────────────────────────────────────────────────────
const COUNTRIES_DATA = [
  { id:1,  name:'États-Unis',      flag:'🇺🇸', region:'Amérique', population:337.2, gdp:29.18, growth:2.7,  internet:92.5, energy:88.2, gdpPerCapita:86560 },
  { id:2,  name:'Chine',           flag:'🇨🇳', region:'Asie',     population:1408.0,gdp:19.53, growth:4.8,  internet:76.4, energy:168.0,gdpPerCapita:13870 },
  { id:3,  name:'Allemagne',       flag:'🇩🇪', region:'Europe',   population:84.3,  gdp:4.51,  growth:0.8,  internet:91.8, energy:11.4, gdpPerCapita:53510 },
  { id:4,  name:'Japon',           flag:'🇯🇵', region:'Asie',     population:123.8, gdp:4.39,  growth:1.2,  internet:94.5, energy:17.9, gdpPerCapita:35460 },
  { id:5,  name:'Inde',            flag:'🇮🇳', region:'Asie',     population:1445.0,gdp:4.27,  growth:6.8,  internet:58.0, energy:44.2, gdpPerCapita:2960  },
  { id:6,  name:'France',          flag:'🇫🇷', region:'Europe',   population:68.6,  gdp:3.18,  growth:1.1,  internet:86.9, energy:9.0,  gdpPerCapita:46350 },
  { id:7,  name:'Royaume-Uni',     flag:'🇬🇧', region:'Europe',   population:68.1,  gdp:3.24,  growth:1.3,  internet:97.2, energy:6.9,  gdpPerCapita:47580 },
  { id:8,  name:'Italie',          flag:'🇮🇹', region:'Europe',   population:58.7,  gdp:2.28,  growth:0.9,  internet:86.4, energy:5.7,  gdpPerCapita:38840 },
  { id:9,  name:'Canada',          flag:'🇨🇦', region:'Amérique', population:40.9,  gdp:2.24,  growth:1.8,  internet:94.8, energy:13.6, gdpPerCapita:54770 },
  { id:10, name:'Corée du Sud',    flag:'🇰🇷', region:'Asie',     population:51.5,  gdp:1.82,  growth:2.4,  internet:97.6, energy:11.6, gdpPerCapita:35340 },
  { id:11, name:'Russie',          flag:'🇷🇺', region:'Europe',   population:144.3, gdp:1.94,  growth:2.1,  internet:89.5, energy:30.5, gdpPerCapita:13440 },
  { id:12, name:'Australie',       flag:'🇦🇺', region:'Océanie',  population:27.1,  gdp:1.82,  growth:2.2,  internet:96.8, energy:5.7,  gdpPerCapita:67150 },
  { id:13, name:'Espagne',         flag:'🇪🇸', region:'Europe',   population:47.8,  gdp:1.72,  growth:2.8,  internet:91.0, energy:4.7,  gdpPerCapita:35980 },
  { id:14, name:'Mexique',         flag:'🇲🇽', region:'Amérique', population:130.0, gdp:1.38,  growth:2.5,  internet:79.0, energy:8.8,  gdpPerCapita:10620 },
  { id:15, name:'Indonésie',       flag:'🇮🇩', region:'Asie',     population:280.8, gdp:1.46,  growth:5.3,  internet:79.5, energy:10.1, gdpPerCapita:5200  },
  { id:16, name:'Pays-Bas',        flag:'🇳🇱', region:'Europe',   population:18.1,  gdp:1.17,  growth:1.5,  internet:97.5, energy:2.9,  gdpPerCapita:64640 },
  { id:17, name:'Arabie Saoudite', flag:'🇸🇦', region:'Asie',     population:37.1,  gdp:1.14,  growth:2.9,  internet:97.9, energy:9.5,  gdpPerCapita:30730 },
  { id:18, name:'Turquie',         flag:'🇹🇷', region:'Asie',     population:86.1,  gdp:1.21,  growth:3.8,  internet:86.3, energy:6.3,  gdpPerCapita:14060 },
  { id:19, name:'Suisse',          flag:'🇨🇭', region:'Europe',   population:8.9,   gdp:0.93,  growth:1.6,  internet:97.9, energy:1.2,  gdpPerCapita:104490},
  { id:20, name:'Argentine',       flag:'🇦🇷', region:'Amérique', population:46.8,  gdp:0.71,  growth:4.5,  internet:89.5, energy:3.7,  gdpPerCapita:15170 },
  { id:21, name:'Pologne',         flag:'🇵🇱', region:'Europe',   population:37.4,  gdp:0.92,  growth:3.2,  internet:92.0, energy:3.4,  gdpPerCapita:24600 },
  { id:22, name:'Suède',           flag:'🇸🇪', region:'Europe',   population:10.6,  gdp:0.62,  growth:1.5,  internet:97.7, energy:2.1,  gdpPerCapita:58490 },
  { id:23, name:'Belgique',        flag:'🇧🇪', region:'Europe',   population:11.7,  gdp:0.67,  growth:1.6,  internet:94.5, energy:1.9,  gdpPerCapita:57260 },
  { id:24, name:'Brésil',          flag:'🇧🇷', region:'Amérique', population:217.0, gdp:2.31,  growth:2.9,  internet:86.2, energy:14.8, gdpPerCapita:10650 },
  { id:25, name:'Maroc',           flag:'🇲🇦', region:'Afrique',  population:38.5,  gdp:0.17,  growth:3.8,  internet:90.5, energy:1.1,  gdpPerCapita:4420  },
  { id:26, name:'Égypte',          flag:'🇪🇬', region:'Afrique',  population:107.0, gdp:0.44,  growth:4.2,  internet:74.8, energy:3.6,  gdpPerCapita:4110  },
  { id:27, name:'Nigeria',         flag:'🇳🇬', region:'Afrique',  population:229.0, gdp:0.52,  growth:3.5,  internet:58.2, energy:4.0,  gdpPerCapita:2270  },
  { id:28, name:'Afrique du Sud',  flag:'🇿🇦', region:'Afrique',  population:61.2,  gdp:0.40,  growth:1.4,  internet:74.8, energy:3.9,  gdpPerCapita:6530  },
  { id:29, name:'Vietnam',         flag:'🇻🇳', region:'Asie',     population:99.0,  gdp:0.50,  growth:6.5,  internet:81.8, energy:3.8,  gdpPerCapita:5050  },
  { id:30, name:'Pakistan',        flag:'🇵🇰', region:'Asie',     population:234.0, gdp:0.37,  growth:3.2,  internet:49.0, energy:3.7,  gdpPerCapita:1580  },
  { id:31, name:'Bangladesh',      flag:'🇧🇩', region:'Asie',     population:172.5, gdp:0.51,  growth:6.3,  internet:44.2, energy:1.9,  gdpPerCapita:2960  },
  { id:32, name:'Kenya',           flag:'🇰🇪', region:'Afrique',  population:56.7,  gdp:0.13,  growth:5.8,  internet:32.5, energy:0.9,  gdpPerCapita:2290  },
  { id:33, name:'Colombie',        flag:'🇨🇴', region:'Amérique', population:52.4,  gdp:0.37,  growth:2.8,  internet:79.0, energy:1.9,  gdpPerCapita:7060  },
  { id:34, name:'Chili',           flag:'🇨🇱', region:'Amérique', population:19.8,  gdp:0.35,  growth:2.7,  internet:92.1, energy:1.9,  gdpPerCapita:17680 },
  { id:35, name:'Norvège',         flag:'🇳🇴', region:'Europe',   population:5.6,   gdp:0.59,  growth:2.3,  internet:98.5, energy:2.3,  gdpPerCapita:105360},
  { id:36, name:'Danemark',        flag:'🇩🇰', region:'Europe',   population:6.0,   gdp:0.43,  growth:2.0,  internet:98.6, energy:0.9,  gdpPerCapita:71670 },
  { id:37, name:'Finlande',        flag:'🇫🇮', region:'Europe',   population:5.6,   gdp:0.32,  growth:1.2,  internet:96.0, energy:1.3,  gdpPerCapita:57140 },
  { id:38, name:'Singapour',       flag:'🇸🇬', region:'Asie',     population:6.0,   gdp:0.56,  growth:2.8,  internet:97.3, energy:1.1,  gdpPerCapita:93330 },
  { id:39, name:'Israël',          flag:'🇮🇱', region:'Asie',     population:9.9,   gdp:0.57,  growth:3.5,  internet:93.2, energy:1.1,  gdpPerCapita:57570 },
  { id:40, name:'Émirats arabes',  flag:'🇦🇪', region:'Asie',     population:10.1,  gdp:0.56,  growth:4.8,  internet:98.8, energy:2.9,  gdpPerCapita:55450 },
  { id:41, name:'Portugal',        flag:'🇵🇹', region:'Europe',   population:10.4,  gdp:0.31,  growth:2.5,  internet:87.8, energy:1.2,  gdpPerCapita:29810 },
  { id:42, name:'Éthiopie',        flag:'🇪🇹', region:'Afrique',  population:130.0, gdp:0.19,  growth:7.8,  internet:27.4, energy:1.2,  gdpPerCapita:1460  },
];

// ─────────────────────────────────────────────────────────────
// 2. HISTORIQUE PIB — 2015 → 2026  (trillions USD)
//    2025 = estimations FMI Avril 2025
//    2026 = projections FMI / consensus analystes
// ─────────────────────────────────────────────────────────────
const GDP_HISTORY = {
  years: [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
  data: {
    'États-Unis': [18.08, 18.71, 19.54, 20.58, 21.43, 20.89, 23.32, 25.46, 26.95, 27.36, 28.26, 29.18],
    'Chine':      [11.06, 11.23, 12.31, 13.89, 14.34, 14.72, 17.73, 17.96, 17.52, 17.79, 18.53, 19.53],
    'Japon':      [ 4.39,  4.92,  4.86,  4.95,  5.08,  5.04,  4.94,  4.23,  4.21,  4.21,  4.28,  4.39],
    'Allemagne':  [ 3.36,  3.47,  3.69,  3.97,  3.89,  3.88,  4.26,  4.08,  4.45,  4.43,  4.46,  4.51],
    'Inde':       [ 2.10,  2.29,  2.65,  2.72,  2.87,  2.67,  3.18,  3.39,  3.55,  3.73,  3.97,  4.27],
    'France':     [ 2.43,  2.47,  2.59,  2.78,  2.72,  2.63,  2.96,  2.78,  3.01,  3.05,  3.10,  3.18],
    'Brésil':     [ 1.80,  1.80,  2.06,  1.88,  1.88,  1.45,  1.65,  1.92,  2.13,  2.13,  2.21,  2.31],
    'Canada':     [ 1.55,  1.53,  1.65,  1.71,  1.74,  1.64,  1.99,  2.14,  2.09,  2.14,  2.19,  2.24],
  }
};

// ─────────────────────────────────────────────────────────────
// 3. TENDANCE POPULATION — 1990 → 2026  (milliards)
// ─────────────────────────────────────────────────────────────
const POPULATION_TREND = {
  years:  [1990, 1995, 2000, 2005, 2010, 2015, 2020, 2022, 2024, 2025, 2026],
  world:  [5.33, 5.72, 6.14, 6.54, 6.95, 7.38, 7.79, 7.97, 8.10, 8.19, 8.25],
  asia:   [3.17, 3.43, 3.71, 3.97, 4.21, 4.46, 4.64, 4.73, 4.80, 4.85, 4.89],
  africa: [0.63, 0.72, 0.82, 0.96, 1.13, 1.32, 1.54, 1.62, 1.70, 1.75, 1.80],
  europe: [0.72, 0.73, 0.73, 0.73, 0.74, 0.74, 0.75, 0.75, 0.75, 0.75, 0.75],
};

// ─────────────────────────────────────────────────────────────
// 4. HEATMAP CROISSANCE — 2019 → 2026  (% PIB annuel)
//    2025 prévisions FMI · 2026 projections consensus
// ─────────────────────────────────────────────────────────────
const GROWTH_HISTORY = {
  countries: ['États-Unis', 'Chine', 'Inde', 'Allemagne', 'France', 'Japon', 'Brésil', 'Maroc'],
  years: [2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026],
  data: {
    'États-Unis': [ 2.3, -2.8,  5.9,  2.1,  2.5,  2.5,  2.7,  2.7],
    'Chine':      [ 6.0,  2.3,  8.4,  3.0,  5.2,  5.0,  4.6,  4.8],
    'Inde':       [ 6.5, -6.6,  8.9,  7.0,  6.3,  6.5,  6.5,  6.8],
    'Allemagne':  [ 1.1, -4.6,  2.6,  1.8, -0.3,  0.2,  0.5,  0.8],
    'France':     [ 1.8, -7.9,  6.4,  2.6,  0.9,  1.1,  0.8,  1.1],
    'Japon':      [-0.4, -4.3,  2.1,  1.0,  1.9,  0.9,  1.1,  1.2],
    'Brésil':     [ 1.2, -3.3,  5.3,  2.9,  3.1,  3.0,  2.2,  2.9],
    'Maroc':      [ 2.9, -7.2,  7.9,  1.3,  3.4,  3.2,  3.6,  3.8],
  }
};

// ─────────────────────────────────────────────────────────────
// 5. DONNÉES PAR ANNÉE — snapshot complet pour chaque année
//    Utilisé par le filtre "Année" du dashboard
// ─────────────────────────────────────────────────────────────
const YEARLY_SNAPSHOTS = {
  2020: {
    worldGdp: 84.9,  worldPop: 7.79, avgGrowth: -3.1, avgInternet: 59.5,
    kpiGDP: '84.9 T$', topGdpCountry: 'États-Unis', topGdpVal: 20.89,
  },
  2021: {
    worldGdp: 96.1,  worldPop: 7.87, avgGrowth: 5.8,  avgInternet: 62.8,
    kpiGDP: '96.1 T$', topGdpCountry: 'États-Unis', topGdpVal: 23.32,
  },
  2022: {
    worldGdp: 100.6, worldPop: 7.97, avgGrowth: 3.4,  avgInternet: 64.1,
    kpiGDP: '100.6 T$', topGdpCountry: 'États-Unis', topGdpVal: 25.46,
  },
  2023: {
    worldGdp: 104.5, worldPop: 8.04, avgGrowth: 3.1,  avgInternet: 65.7,
    kpiGDP: '104.5 T$', topGdpCountry: 'États-Unis', topGdpVal: 26.95,
  },
  2024: {
    worldGdp: 108.9, worldPop: 8.10, avgGrowth: 3.2,  avgInternet: 67.4,
    kpiGDP: '108.9 T$', topGdpCountry: 'États-Unis', topGdpVal: 27.36,
  },
  2025: {
    worldGdp: 113.4, worldPop: 8.19, avgGrowth: 3.3,  avgInternet: 69.2,
    kpiGDP: '113.4 T$', topGdpCountry: 'États-Unis', topGdpVal: 28.26,
  },
  2026: {
    worldGdp: 118.2, worldPop: 8.25, avgGrowth: 3.5,  avgInternet: 71.0,
    kpiGDP: '118.2 T$', topGdpCountry: 'États-Unis', topGdpVal: 29.18,
  },
};

// ─────────────────────────────────────────────────────────────
// 6. DONNÉES INTERNET PAR RÉGION — 2020 → 2026  (%)
// ─────────────────────────────────────────────────────────────
const INTERNET_BY_REGION = {
  years:    [2020, 2021, 2022, 2023, 2024, 2025, 2026],
  Europe:   [87.9, 89.3, 90.8, 91.7, 92.5, 93.2, 93.8],
  Asie:     [54.2, 57.8, 61.1, 64.0, 66.5, 68.8, 71.0],
  Amérique: [72.5, 74.8, 76.9, 78.5, 80.1, 81.6, 83.0],
  Afrique:  [33.1, 36.0, 39.2, 42.5, 45.8, 48.8, 51.6],
  Océanie:  [88.4, 90.0, 91.3, 92.5, 93.4, 94.0, 94.6],
};

// ─────────────────────────────────────────────────────────────
// 7. CODES ISO CARTE MONDE
// ─────────────────────────────────────────────────────────────
const COUNTRY_MAP_CODES = {
  '840':'États-Unis', '156':'Chine',      '276':'Allemagne',
  '392':'Japon',      '356':'Inde',       '250':'France',
  '826':'Royaume-Uni','380':'Italie',     '124':'Canada',
  '410':'Corée du Sud','643':'Russie',    '036':'Australie',
  '724':'Espagne',    '484':'Mexique',    '360':'Indonésie',
  '528':'Pays-Bas',   '682':'Arabie Saoudite','792':'Turquie',
  '756':'Suisse',     '032':'Argentine',  '616':'Pologne',
  '752':'Suède',      '056':'Belgique',   '076':'Brésil',
  '504':'Maroc',      '732':'Maroc',      '818':'Égypte',     '566':'Nigeria',
  '710':'Afrique du Sud','704':'Vietnam', '586':'Pakistan',
  '050':'Bangladesh', '404':'Kenya',      '170':'Colombie',
  '152':'Chili',      '578':'Norvège',    '208':'Danemark',
  '246':'Finlande',   '702':'Singapour',  '376':'Israël',
  '784':'Émirats arabes','620':'Portugal','231':'Éthiopie',
};

// ─────────────────────────────────────────────────────────────
// 8. RADAR DATA — normalisé 0-100  (mise à jour 2026)
// ─────────────────────────────────────────────────────────────
const RADAR_DATA = {
  labels: ['PIB', 'Population', 'Internet', 'Croissance', 'Énergie', 'PIB/hab.'],
  datasets: [
    { label:'États-Unis', data:[100, 41, 93, 45, 100, 83] },
    { label:'Chine',      data:[ 67,100, 76,  80,  99, 13] },
    { label:'Inde',       data:[ 15, 99, 58,  92,  50,  3] },
    { label:'Allemagne',  data:[ 15, 10, 92,  25,  13, 51] },
    { label:'Japon',      data:[ 15, 15, 95,  28,  20, 34] },
    { label:'France',     data:[ 11,  8, 87,  30,  10, 44] },
  ]
};

// ─────────────────────────────────────────────────────────────
// 9. ÉNERGIE PAR SOURCE — 2024 / 2025 / 2026  (% du mix)
//    Pour les 6 plus grands pays
// ─────────────────────────────────────────────────────────────
const ENERGY_MIX = {
  countries: ['États-Unis','Chine','Allemagne','France','Inde','Japon'],
  sources: ['Fossile','Nucléaire','Renouvelable','Autre'],
  byYear: {
    2024: {
      'États-Unis': [79, 8, 12, 1],
      'Chine':      [83, 5, 11, 1],
      'Allemagne':  [53, 6, 39, 2],
      'France':     [30,70, 27, 3],
      'Inde':       [74, 3, 21, 2],
      'Japon':      [72,10, 16, 2],
    },
    2025: {
      'États-Unis': [76, 9, 14, 1],
      'Chine':      [80, 6, 13, 1],
      'Allemagne':  [48, 5, 45, 2],
      'France':     [28,70, 29, 3],
      'Inde':       [70, 4, 24, 2],
      'Japon':      [70,11, 17, 2],
    },
    2026: {
      'États-Unis': [73, 9, 17, 1],
      'Chine':      [77, 7, 15, 1],
      'Allemagne':  [43, 4, 51, 2],
      'France':     [26,70, 31, 3],
      'Inde':       [67, 4, 27, 2],
      'Japon':      [68,12, 18, 2],
    },
  }
};