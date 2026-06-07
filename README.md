<div align="center">

# 📊 DATA PULSE

### Plateforme d'Analyse Macroéconomique Mondiale

[![PHP](https://img.shields.io/badge/PHP-8.2-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://sqlite.org)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Chart.js](https://img.shields.io/badge/Chart.js-4.4-FF6384?style=for-the-badge&logo=chartdotjs&logoColor=white)](https://chartjs.org)
[![D3.js](https://img.shields.io/badge/D3.js-7.8-F9A03C?style=for-the-badge&logo=d3dotjs&logoColor=white)](https://d3js.org)
[![License](https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge)](LICENSE)

<br/>

> **DATA PULSE** est une application web full-stack d'analyse macroéconomique mondiale couvrant **42 pays** avec des données réelles et des projections FMI **2015–2026**. Elle combine un backend API REST Laravel et un frontend JavaScript vanilla avec des visualisations interactives avancées.

<br/>

![Dashboard Preview](https://img.shields.io/badge/12_Dashboards-Interactifs-3b82f6?style=flat-square)
![Countries](https://img.shields.io/badge/42_Pays-Couverts-22c55e?style=flat-square)
![Years](https://img.shields.io/badge/2015--2026-Données_+_Projections-f59e0b?style=flat-square)
![Languages](https://img.shields.io/badge/FR_|_EN_|_AR-Multilingue-8b5cf6?style=flat-square)

</div>

---

## 📋 Table des matières

- [Aperçu du projet](#-aperçu-du-projet)
- [Architecture](#-architecture)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Structure du projet](#-structure-du-projet)
- [Installation](#-installation)
- [API Reference](#-api-reference)
- [Base de données](#-base-de-données)
- [Authentification](#-authentification)
- [Screenshots](#-screenshots)
- [Équipe](#-équipe)

---

## 🌍 Aperçu du projet

DATA PULSE est une plateforme analytique complète permettant d'explorer, comparer et visualiser les indicateurs économiques mondiaux. Elle offre :

- 📈 **Évolution du PIB** de 2015 à 2026 pour les 8 plus grandes économies
- 🗺️ **Carte mondiale interactive** avec coloration par métrique (D3.js + TopoJSON)
- ⚖️ **Comparateur multi-pays** sélection directe sur la carte
- 🔮 **Prévisions 2030** par régression linéaire et calcul CAGR
- 🧠 **Insights automatiques** avec corrélations de Pearson
- 📥 **Import CSV/JSON** avec analyse automatique
- 🌐 **Interface trilingue** Français / English / العربية avec support RTL

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│   HTML5 · CSS3 · JavaScript Vanilla                             │
│   Chart.js 4.4 · D3.js 7.8 · TopoJSON 3.0                       │
│                                                                 │
│   auth.js → UserStore (localStorage) → Session Manager          │
│   app.js  → 12 Dashboards · Graphiques · Cartes                 │
│   i18n.js → Traductions FR / EN / AR (RTL)                      │
│   data.js → 42 pays · 2015-2026 · Projections FMI               │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTP / REST API
                     │ Authorization: Bearer {token}
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                 │
│   Laravel 11 · PHP 8.2 · Laravel Sanctum                        │
│                                                                 |
│   ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐     |
│   │   Auth      │  │  Countries   │  │   Statistics       │     │
│   │ Controller  │  │  Controller  │  │   Controller       │     │
│   └─────────────┘  └──────────────┘  └────────────────────┘     │
│   ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐     │
│   │  Dashboard  │  │  Comparison  │  │    Dataset         │     │
│   │ Controller  │  │  Controller  │  │    Controller      │     │
│   └─────────────┘  └──────────────┘  └────────────────────┘     │
│   ┌─────────────┐  ┌──────────────┐                             │
│   │   Search    │  │    User      │                             │
│   │ Controller  │  │  Controller  │                             │
│   └─────────────┘  └──────────────┘                             │
└────────────────────┬────────────────────────────────────────────┘
                     │ Eloquent ORM
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BASE DE DONNÉES                             │
│                         SQLite                                   │
│                                                                  │
│   users · countries · statistics · datasets                     │
│   personal_access_tokens · cache · jobs                         │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Fonctionnalités

### 12 Dashboards interactifs

| # | Dashboard | Description |
|---|-----------|-------------|
| 1 | 📊 **Vue d'ensemble** | KPIs mondiaux + 5 graphiques Chart.js, filtre par année 2020–2026 |
| 2 | 🗺️ **Carte mondiale** | D3.js + TopoJSON, 42 pays, Maroc complet (fusion Sahara Occidental) |
| 3 | 📈 **Visualisations** | Radar, Heatmap, Tendances population, Distribution |
| 4 | ⚖️ **Comparateur** | Sélection sur carte, 2–3 pays, graphiques bar + radar |
| 5 | 🔍 **Explorateur** | Tableau filtrable, pagination, export CSV |
| 6 | 📥 **Import données** | Drag & drop CSV/JSON, analyse automatique, corrélation Pearson |
| 7 | 🧠 **Insights auto** | 6 cartes insights, 4 corrélations, 4 podiums |
| 8 | 🔮 **Prévisions 2030** | Régression linéaire, CAGR, projections par pays |
| 9 | 🏆 **Classements** | Podium, évolution rang, Top 6 par année |
| 10 | 🔔 **Watchlist** | Alertes de seuil, fil d'activité, surveillance personnalisée |
| 11 | 🎨 **Data Studio** | Graphiques personnalisés sauvegardés en localStorage |
| 12 | 📄 **Rapports** | Générateur drag & drop, export HTML/PDF |

---

## 🛠️ Technologies

### Backend
| Technologie | Version | Usage |
|-------------|---------|-------|
| PHP | 8.2 | Langage backend |
| Laravel | 11 | Framework API REST |
| Laravel Sanctum | 4.x | Authentification tokens |
| SQLite | 3 | Base de données (dev) |
| PHPUnit | 11 | Tests unitaires & fonctionnels |
| Composer | 2.x | Gestionnaire dépendances PHP |

### Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| JavaScript | ES6+ | Logique frontend (vanilla) |
| Chart.js | 4.4.1 | Graphiques interactifs |
| D3.js | 7.8.5 | Cartes SVG vectorielles |
| TopoJSON | 3.0.2 | Données géographiques |
| Bootstrap | 5.3.2 | Grille et composants |
| Tabler Icons | 3.11.0 | Icônes UI |
| Syne / Inter / DM Mono | — | Typographies Google Fonts |

---

## 📁 Structure du projet

```
DATA PULSE/
│
├── 📁 backend/                          # API Laravel
│   ├── 📁 app/
│   │   ├── 📁 Http/Controllers/
│   │   │   ├── CountryController.php    # CRUD pays + filtres
│   │   │   ├── StatisticsController.php # Données économiques
│   │   │   ├── DashboardController.php  # KPIs globaux
│   │   │   ├── ComparisonController.php # Comparaison multi-pays
│   │   │   ├── DatasetController.php    # Import CSV/JSON
│   │   │   ├── SearchController.php     # Recherche globale
│   │   │   └── UserController.php       # Gestion utilisateurs
│   │   ├── 📁 Models/
│   │   │   ├── Country.php
│   │   │   ├── Statistic.php
│   │   │   ├── Dataset.php
│   │   │   └── User.php
│   │   └── 📁 Services/
│   │       ├── DataAnalysisService.php  # Pearson, régression
│   │       └── InsightGeneratorService.php
│   ├── 📁 auth/
│   │   ├── 📁 Controllers/
│   │   │   ├── AuthController.php
│   │   │   ├── EmailVerificationController.php
│   │   │   └── PasswordResetController.php
│   │   ├── 📁 Middleware/
│   │   │   ├── AdminOnly.php
│   │   │   ├── AuthenticateApi.php
│   │   │   ├── CheckEmailVerified.php
│   │   │   └── RateLimitAuth.php
│   │   └── 📁 Requests/
│   │       ├── LoginRequest.php
│   │       ├── RegisterRequest.php
│   │       ├── UpdateProfileRequest.php
│   │       └── ChangePasswordRequest.php
│   ├── 📁 database/
│   │   ├── 📁 migrations/               # 7 migrations
│   │   └── 📁 seeders/
│   │       ├── DatabaseSeeder.php
│   │       └── CountrySeeders.php       # 42 pays + stats 2019-2026
│   ├── 📁 routes/
│   │   └── api.php                      # Toutes les routes API
│   ├── .env
│   └── composer.json
│
└── 📁 frontend/                         # Interface utilisateur
    ├── 📁 modules/
    │   ├── forecast.js                  # Prévisions 2030
    │   ├── watchlist.js                 # Alertes personnalisées
    │   ├── rankings.js                  # Classements mondiaux
    │   ├── data-studio.js               # Graphiques custom
    │   └── report-builder.js            # Générateur rapports
    ├── index.html                       # Dashboard principal (12 vues)
    ├── login.html                       # Connexion / Inscription
    ├── profile.html                     # Gestion profil
    ├── reset-password.html              # Reset mot de passe
    ├── app.js                           # Logique dashboard (~1900 lignes)
    ├── auth.js                          # Auth + UserStore (~840 lignes)
    ├── data.js                          # Dataset 42 pays 2015-2026
    ├── i18n.js                          # Traductions FR/EN/AR
    ├── style.css                        # Styles dashboard
    └── auth.css                         # Styles authentification
```

---

## 🚀 Installation

### Prérequis

```bash
PHP >= 8.2
Composer >= 2.0
Node.js >= 18 (pour npx serve)
```

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/data-pulse.git
cd data-pulse
```

### 2. Installer le backend Laravel

```bash
cd backend

# Installer les dépendances PHP
composer install

# Copier le fichier d'environnement
cp .env.example .env

# Générer la clé d'application
php artisan key:generate
```

### 3. Configurer l'environnement

Ouvrir `.env` et configurer :

```env
APP_NAME="DATA PULSE"
APP_ENV=local
APP_URL=http://localhost:8000

DB_CONNECTION=sqlite
DB_DATABASE=/chemin/absolu/vers/backend/database/database.sqlite

SANCTUM_STATEFUL_DOMAINS=localhost:3000
SESSION_DOMAIN=localhost
```

### 4. Initialiser la base de données

```bash
# Créer le fichier SQLite
touch database/database.sqlite

# Exécuter les migrations
php artisan migrate

# Peupler avec les 42 pays + données 2019-2026
php artisan db:seed --class=CountrySeeder

# Ou tout à la fois
php artisan migrate --seed
```

### 5. Démarrer le backend

```bash
php artisan serve
# ✅ API disponible sur http://localhost:8000
```

### 6. Démarrer le frontend

```bash
# Dans un nouveau terminal
cd frontend
npx serve .
# ✅ App disponible sur http://localhost:3000
```

### 7. Accéder à l'application

Ouvrir **http://localhost:3000** dans votre navigateur.

#### Comptes de démonstration

| Email | Mot de passe | Rôle |
|-------|-------------|------|
| `admin@datapulse.io` | `demo1234` | Administrateur |
| `mohamed@datapulse.io` | `test1234` | Analyste |
| `sara@datapulse.io` | `sara1234` | Chercheur |

---

## 📡 API Reference

### Base URL
```
http://localhost:8000/api/v1
```

### 🔓 Routes publiques

#### Authentification

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/auth/register` | Créer un compte |
| `POST` | `/auth/login` | Connexion + token Sanctum |
| `POST` | `/password/forgot` | Envoyer email reset |
| `POST` | `/password/reset` | Nouveau mot de passe |
| `POST` | `/email/verify` | Valider OTP 6 chiffres |

#### Pays & Statistiques

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/countries` | Liste 42 pays avec filtres |
| `GET` | `/countries/{id}` | Détail + historique 2019-2026 |
| `GET` | `/countries/regions` | Stats agrégées par région |
| `GET` | `/countries/top` | Top N par métrique |
| `GET` | `/stats` | KPIs globaux par année |
| `GET` | `/stats/history` | Historique d'un pays |
| `GET` | `/stats/regions` | Agrégation régionale |
| `GET` | `/stats/timeline` | Série temporelle multi-pays |
| `GET` | `/stats/heatmap` | Données heatmap croissance |
| `GET` | `/compare` | Comparaison jusqu'à 3 pays |
| `GET` | `/search` | Recherche globale pays |

### 🔒 Routes protégées `Authorization: Bearer {token}`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/auth/me` | Profil connecté |
| `POST` | `/auth/logout` | Déconnexion |
| `GET` | `/dashboard` | KPIs personnalisés |
| `PUT` | `/users/profile` | Modifier son profil |
| `PUT` | `/users/password` | Changer mot de passe |
| `GET` | `/datasets` | Liste imports CSV/JSON |
| `POST` | `/datasets` | Uploader un fichier |
| `DELETE` | `/datasets/{id}` | Supprimer un import |

### 🔐 Routes admin `role: admin`

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/admin/users` | Liste tous les utilisateurs |
| `PUT` | `/admin/users/{id}` | Modifier un utilisateur |
| `DELETE` | `/admin/users/{id}` | Supprimer un utilisateur |

### Exemples de requêtes

```bash
# Login
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@datapulse.io","password":"demo1234"}'

# Liste pays Europe filtrés par PIB décroissant
curl "http://localhost:8000/api/v1/countries?region=Europe&sort=gdp&dir=desc&year=2026"

# Comparaison Maroc, France, Espagne
curl "http://localhost:8000/api/v1/compare?countries=25,6,13&year=2026"

# Historique PIB États-Unis 2019-2026
curl "http://localhost:8000/api/v1/stats/history?country_id=1&from=2019&to=2026"

# Profil connecté (avec token)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8000/api/v1/auth/me
```

### Paramètres de filtre — `GET /api/v1/countries`

| Paramètre | Type | Défaut | Exemple |
|-----------|------|--------|---------|
| `year` | integer | 2026 | `?year=2024` |
| `region` | string | — | `?region=Europe` |
| `min_gdp` | float | — | `?min_gdp=1.0` |
| `search` | string | — | `?search=maroc` |
| `sort` | string | `gdp` | `?sort=growth` |
| `dir` | asc/desc | `desc` | `?dir=asc` |
| `per_page` | integer | 20 | `?per_page=10` |

---

## 🗄️ Base de données

### Schéma — 7 tables

```sql
┌─────────────────────────────────────────────────────────┐
│  users                                                   │
│  id · name · email · password · role · country          │
│  language · email_verified_at · last_login_at           │
└───────────────────────┬─────────────────────────────────┘
                        │ user_id (FK)
                        ▼
┌─────────────────┐   ┌──────────────────────────────────┐
│    datasets     │   │          countries               │
│  id · user_id   │   │  id · name · flag · region       │
│  name · path    │   │  iso_code · gdp · population     │
│  type · status  │   └──────────────┬───────────────────┘
└─────────────────┘                  │ country_id (FK)
                                     ▼
                         ┌──────────────────────────────┐
                         │         statistics           │
                         │  id · country_id · year      │
                         │  gdp · population            │
                         │  growth_rate · internet_usage│
                         │  energy_consumption          │
                         │  gdp_per_capita              │
                         │  energy_fossil_pct           │
                         │  energy_renewable_pct        │
                         │  is_projection · source      │
                         └──────────────────────────────┘

┌──────────────────────────┐  ┌──────────┐  ┌──────────┐
│  personal_access_tokens  │  │  cache   │  │  jobs    │
│  (Laravel Sanctum)       │  │          │  │  (Queue) │
└──────────────────────────┘  └──────────┘  └──────────┘
```

### Commandes utiles

```bash
# Voir toutes les migrations
php artisan migrate:status

# Réinitialiser complètement la base
php artisan migrate:fresh --seed

# Seeder uniquement les pays
php artisan db:seed --class=CountrySeeder

# Ouvrir la console Tinker
php artisan tinker

# Dans Tinker — vérifier les données
>>> App\Models\Country::count()        # → 42
>>> App\Models\Statistic::count()      # → 336 (42 × 8 années)
>>> App\Models\User::pluck('email')    # → liste des emails
```

---

## 🔐 Authentification

DATA PULSE utilise **Laravel Sanctum** pour l'authentification par tokens API.

### Flux d'authentification

```
1. POST /api/v1/auth/register → Compte créé + OTP envoyé
2. POST /api/v1/email/verify  → Email confirmé
3. POST /api/v1/auth/login    → Token Sanctum retourné
4. GET  /api/v1/auth/me       → Header: Authorization: Bearer {token}
5. POST /api/v1/auth/logout   → Token révoqué
```

### Durée des tokens

| Type | Durée |
|------|-------|
| Session normale | 8 heures |
| "Se souvenir de moi" | 30 jours |

### Middlewares de sécurité

| Middleware | Protection |
|-----------|-----------|
| `AuthenticateApi` | Vérifie le token Sanctum |
| `CheckEmailVerified` | Email confirmé requis |
| `AdminOnly` | Rôle admin requis |
| `RateLimitAuth` | Max 10 req/min sur les routes auth |

---

## 🧪 Tests

```bash
# Lancer tous les tests
php artisan test

# Tests avec détail
php artisan test --verbose

# Un seul fichier de test
php artisan test tests/Feature/AuthControllerTest.php

# Coverage (nécessite Xdebug)
php artisan test --coverage
```

### Suites de tests

```
tests/
├── Feature/
│   ├── AuthControllerTest.php      # Register, Login, Logout
│   ├── CountryControllerTest.php   # Liste, filtres, détail
│   └── StatisticsControllerTest.php# Historique, KPIs
└── Unit/
    ├── DataAnalysisServiceTest.php # Pearson, régression linéaire
    └── InsightGeneratorTest.php    # Génération insights
```

---

## 🌐 Internationalisation

L'interface supporte 3 langues avec changement dynamique sans rechargement :

| Langue | Code | Direction |
|--------|------|-----------|
| Français | `fr` | LTR |
| English | `en` | LTR |
| العربية | `ar` | RTL |

La langue est persistée dans `localStorage` et synchronisée avec la session utilisateur.

---

## 📜 Commandes artisan utiles

```bash
# Démarrer le serveur de développement
php artisan serve

# Vider tous les caches
php artisan optimize:clear

# Lister toutes les routes API
php artisan route:list --path=api

# Générer un nouveau controller
php artisan make:controller NomController

# Générer un nouveau modèle avec migration
php artisan make:model NomModel -m

# Générer une migration
php artisan make:migration create_nom_table

# Exécuter les migrations
php artisan migrate

# Rollback de la dernière migration
php artisan migrate:rollback

# Réinitialiser + reseed
php artisan migrate:fresh --seed

# Console interactive
php artisan tinker
```

---

## 🤝 Contribution

1. Forker le projet
2. Créer une branche feature : `git checkout -b feature/nouvelle-fonctionnalite`
3. Committer les changements : `git commit -m 'feat: ajouter nouvelle fonctionnalité'`
4. Pousser la branche : `git push origin feature/nouvelle-fonctionnalite`
5. Ouvrir une Pull Request

### Convention de commits

```
feat:     nouvelle fonctionnalité
fix:      correction de bug
docs:     documentation
style:    formatage, pas de changement logique
refactor: refactorisation du code
test:     ajout ou modification de tests
chore:    maintenance, dépendances
```

---


**DATA PULSE** — Développé avec ❤️ · Laravel 11 · PHP 8.2

[![Made with Laravel](https://img.shields.io/badge/Made_with-Laravel-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com)
[![Powered by D3.js](https://img.shields.io/badge/Powered_by-D3.js-F9A03C?style=for-the-badge&logo=d3dotjs)](https://d3js.org)

</div>
