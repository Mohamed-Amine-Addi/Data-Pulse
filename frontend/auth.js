const UserStore = (() => {
  const KEY = 'dp_users_db';

  // Comptes demo par defaut
  const DEFAULT_USERS = [
    {
      id:        1,
      firstName: 'Admin',
      lastName:  'Pulse',
      email:     'admin@datapulse.io',
      password:  'demo1234',
      role:      'admin',
      country:   'Maroc',
      language:  'fr',
      createdAt: '2024-01-15T09:00:00.000Z',
    },
    {
      id:        2,
      firstName: 'Mohamed',
      lastName:  'Alami',
      email:     'mohamed@datapulse.io',
      password:  'test1234',
      role:      'analyst',
      country:   'Maroc',
      language:  'fr',
      createdAt: '2024-03-10T10:30:00.000Z',
    },
    {
      id:        3,
      firstName: 'Sara',
      lastName:  'Benali',
      email:     'sara@datapulse.io',
      password:  'sara1234',
      role:      'researcher',
      country:   'Algérie',
      language:  'fr',
      createdAt: '2024-06-20T14:00:00.000Z',
    },
  ];

  // Charger tous les utilisateurs
  function getAll() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    saveAll(DEFAULT_USERS);
    return JSON.parse(JSON.stringify(DEFAULT_USERS));
  }

  // Sauvegarder toute la liste 
  function saveAll(users) {
    localStorage.setItem(KEY, JSON.stringify(users));
  }

  // Trouver par email + password 
  function findByCredentials(email, password) {
    return getAll().find(u =>
      u.email.toLowerCase() === email.toLowerCase() &&
      u.password === password
    );
  }

  // Trouver par email seul 
  function findByEmail(email) {
    return getAll().find(u =>
      u.email.toLowerCase() === email.toLowerCase()
    );
  }

  // Trouver par ID 
  function findById(id) {
    return getAll().find(u => u.id === id);
  }

  // Ajouter un nouvel utilisateur 
  function add(user) {
    const users = getAll();
    const maxId = users.reduce((m, u) => Math.max(m, u.id || 0), 0);
    const newUser = { ...user, id: maxId + 1 };
    users.push(newUser);
    saveAll(users);
    return newUser;
  }

  //  Mettre a jour un utilisateur par ID 
  function update(id, data) {
    const users = getAll();
    const idx   = users.findIndex(u => u.id === id);
    if (idx === -1) return null;
    if (!data.password) delete data.password;
    users[idx] = { ...users[idx], ...data };
    saveAll(users);
    return users[idx];
  }

  // Changer le mot de passe 
  function changePassword(id, currentPwd, newPwd) {
    const user = findById(id);
    if (!user) return { ok: false, msg: 'Utilisateur introuvable.' };
    if (user.password !== currentPwd)
      return { ok: false, msg: 'Mot de passe actuel incorrect.' };
    update(id, { password: newPwd });
    return { ok: true };
  }

  return { getAll, saveAll, findByCredentials, findByEmail, findById, add, update, changePassword };
})();


const Auth = {

  save(user, remember = false) {
    const avatar = (
      (user.firstName?.[0] || '') +
      (user.lastName?.[0]  || '')
    ).toUpperCase() || 'U';

    const session = {
      id:        user.id,
      firstName: user.firstName,
      lastName:  user.lastName,
      fullName:  (user.firstName + ' ' + user.lastName).trim(),
      email:     user.email,
      role:      user.role,
      avatar:    avatar,
      country:   user.country   || '',
      language:  user.language  || 'fr',
      createdAt: user.createdAt || new Date().toISOString(),
      loginAt:   new Date().toISOString(),
      remember:  remember,
      expiresAt: remember
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() +  8 * 60 * 60 * 1000).toISOString(),
    };

    const store = remember ? localStorage : sessionStorage;
    store.setItem('dp_user',  JSON.stringify(session));
    store.setItem('dp_token', 'tok_' + Math.random().toString(36).slice(2));
    return session;
  },

  // Lire la session 
  get() {
    try {
      const raw = sessionStorage.getItem('dp_user')
               || localStorage.getItem('dp_user');
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (new Date(s.expiresAt) < new Date()) {
        this.clear();
        return null;
      }
      return s;
    } catch { return null; }
  },

  // Mettre a jour la session (sans deconnecter) 
  updateSession(data) {
    const session = this.get();
    if (!session) return;
    const updated = { ...session, ...data };
    // Recalculer avatar si prénom/nom changé
    if (data.firstName || data.lastName) {
      const fn = data.firstName || session.firstName;
      const ln = data.lastName  || session.lastName;
      updated.avatar   = ((fn[0] || '') + (ln[0] || '')).toUpperCase();
      updated.fullName = (fn + ' ' + ln).trim();
    }
    const store = session.remember ? localStorage : sessionStorage;
    store.setItem('dp_user', JSON.stringify(updated));
    return updated;
  },

  clear() {
    sessionStorage.removeItem('dp_user');
    sessionStorage.removeItem('dp_token');
    localStorage.removeItem('dp_user');
    localStorage.removeItem('dp_token');
  },

  isLoggedIn() { return this.get() !== null; },

  guard() {
    if (!this.isLoggedIn()) {
      const already = sessionStorage.getItem('dp_redirecting');
      if (!already) {
        sessionStorage.setItem('dp_redirecting', '1');
        window.location.replace('login.html');
      }
    }
  },

  logout() {
    this.clear();
    sessionStorage.removeItem('dp_redirecting');
    showAuthToast('À bientôt !', 'info');
    setTimeout(() => { window.location.replace('login.html'); }, 800);
  },
};

function injectSessionUser() {
  const session = Auth.get();
  if (!session) return;

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

  function fmtDate(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleDateString('fr-FR', { year:'numeric', month:'long' });
    } catch { return '—'; }
  }

  function fmtRelative(iso) {
    if (!iso) return '—';
    try {
      const diff = Date.now() - new Date(iso);
      if (diff < 60000)    return 'À l\'instant';
      if (diff < 3600000)  return 'Il y a ' + Math.floor(diff / 60000) + ' min';
      if (diff < 86400000) return 'Aujourd\'hui';
      return new Date(iso).toLocaleDateString('fr-FR', { day:'numeric', month:'short' });
    } catch { return '—'; }
  }

  const avatar    = session.avatar    || 'U';
  const fullName  = session.fullName  || (session.firstName + ' ' + session.lastName).trim();
  const email     = session.email     || '—';
  const roleLabel = roleLabels[session.role] || 'Utilisateur';

  // Topbar avatar
  const elAvatar = document.getElementById('userAvatar');
  if (elAvatar) elAvatar.textContent = avatar;

  // Sidebar footer
  const elSbAvatar = document.getElementById('sidebarAvatar');
  const elSbName   = document.getElementById('sidebarUserName');
  const elSbRole   = document.getElementById('sidebarUserRole');
  if (elSbAvatar) elSbAvatar.textContent = avatar;
  if (elSbName)   elSbName.textContent   = fullName;
  if (elSbRole)   elSbRole.textContent   = roleLabel;

  // Panel Parametres
  const elSName  = document.getElementById('settingsUserName');
  const elSEmail = document.getElementById('settingsUserEmail');
  const elSRole  = document.getElementById('settingsUserRole');
  if (elSName)  elSName.textContent  = fullName;
  if (elSEmail) elSEmail.textContent = email;
  if (elSRole)  elSRole.textContent  = roleLabel;

  // Modal Profil
  const elPA = document.getElementById('profileModalAvatar');
  const elPN = document.getElementById('profileModalName');
  const elPE = document.getElementById('profileModalEmail');
  const elPB = document.getElementById('profileModalBadge');
  const elPD = document.getElementById('profileModalDate');
  const elPL = document.getElementById('profileModalLogin');
  if (elPA) elPA.textContent = avatar;
  if (elPN) elPN.textContent = fullName;
  if (elPE) elPE.textContent = email;
  if (elPB) elPB.innerHTML   = `<i class="ti ti-shield-check"></i> ${roleLabel}`;
  if (elPD) elPD.textContent = fmtDate(session.createdAt);
  if (elPL) elPL.textContent = fmtRelative(session.loginAt);

  // Bouton deconnexion
  const elLogout = document.getElementById('btnLogout');
  if (elLogout) {
    elLogout.onclick = () => {
      if (typeof closePanels === 'function') closePanels();
      Auth.logout();
    };
  }
}

function showAuthToast(msg, type = 'info') {
  // Chercher dans la page courante (auth pages ont #authToast)
  let toast = document.getElementById('authToast');
  // Si pas de toast dedie (index.html), utiliser showToast de app.js
  if (!toast) {
    if (typeof showToast === 'function') {
      showToast(msg, msg, type);
      return;
    }
    // Creer un toast minimal
    toast = document.createElement('div');
    toast.id = 'authToast';
    toast.className = 'auth-toast';
    document.body.appendChild(toast);
  }
  const icons = { success:'ti-circle-check', error:'ti-alert-circle', info:'ti-info-circle' };
  toast.innerHTML = `
    <i class="ti ${icons[type] || 'ti-info-circle'}" style="font-size:18px;flex-shrink:0"></i>
    <span>${msg}</span>`;
  toast.className = `auth-toast show ${type}`;
  setTimeout(() => { toast.className = 'auth-toast'; }, 3500);
}

function showLoading(text = 'Chargement...') {
  let ov = document.getElementById('authLoadingOverlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'authLoadingOverlay';
    ov.className = 'auth-loading-overlay';
    ov.innerHTML = `
      <div class="auth-loading-spinner"></div>
      <div class="auth-loading-text">${text}</div>`;
    document.body.appendChild(ov);
  } else {
    ov.querySelector('.auth-loading-text').textContent = text;
  }
  ov.style.display = 'flex';
}

function hideLoading() {
  const ov = document.getElementById('authLoadingOverlay');
  if (ov) ov.style.display = 'none';
}

function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg ? '⚠ ' + msg : '';
}

function setInputState(inputId, state) {
  const el = document.getElementById(inputId);
  if (!el) return;
  el.classList.remove('error', 'success');
  if (state) el.classList.add(state);
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function checkPasswordStrength(pwd) {
  const wrap  = document.getElementById('pwdStrengthWrap');
  const label = document.getElementById('pwdStrengthLabel');
  if (!wrap) return 0;
  wrap.style.display = pwd.length > 0 ? 'flex' : 'none';

  let score = 0;
  if (pwd.length >= 8)           score++;
  if (/[A-Z]/.test(pwd))         score++;
  if (/[0-9]/.test(pwd))         score++;
  if (/[^A-Za-z0-9]/.test(pwd))  score++;

  const levels = ['Faible', 'Passable', 'Bon', 'Solide'];
  const colors = ['#dc2626', '#d97706', '#3b82f6', '#16a34a'];
  const cls    = ['active-weak','active-fair','active-good','active-strong'];

  ['bar1','bar2','bar3','bar4'].forEach((id, i) => {
    const bar = document.getElementById(id);
    if (!bar) return;
    bar.className = 'auth-pwd-bar';
    if (i < score) bar.classList.add(cls[score - 1]);
  });

  if (label) {
    label.textContent = levels[score - 1] || '';
    label.style.color = colors[score - 1] || '#94a3b8';
  }
  return score;
}

function setBtnLoading(btn, loading) {
  if (!btn) return;
  const textEl   = btn.querySelector('.auth-btn-text');
  const loaderEl = btn.querySelector('.auth-btn-loader');
  const iconEl   = btn.querySelector('.auth-btn-icon');
  if (loading) {
    if (textEl)   textEl.style.display   = 'none';
    if (loaderEl) loaderEl.style.display = 'inline-flex';
    if (iconEl)   iconEl.style.display   = 'none';
    btn.disabled = true;
  } else {
    if (textEl)   textEl.style.display   = '';
    if (loaderEl) loaderEl.style.display = 'none';
    if (iconEl)   iconEl.style.display   = '';
    btn.disabled = false;
  }
}

document.addEventListener('DOMContentLoaded', () => {

  const fullPath    = window.location.pathname;
  const fullHref    = window.location.href;
  const pageName    = fullPath.split('/').pop() || '';

  // Pages d'authentification
  const AUTH_PAGES  = ['login.html', 'reset-password.html', 'verify-email.html'];

  const isAuthPage  = AUTH_PAGES.some(p => pageName === p || fullHref.includes('/' + p));

  const isDashboard = pageName === 'index.html'
                   || pageName === ''
                   || pageName === 'index'
                   || (!isAuthPage && pageName === '');

  // Si on vient deja d'une redirection, ne pas rediriger a nouveau
  const REDIRECT_KEY = 'dp_redirecting';
  const isRedirecting = sessionStorage.getItem(REDIRECT_KEY);

  if (isRedirecting) {
    sessionStorage.removeItem(REDIRECT_KEY);
    // Injecter si on est sur le dashboard
    if (isDashboard && Auth.isLoggedIn()) injectSessionUser();
  } else {
    // Si page auth + deja connecte -> dashboard 
    if (isAuthPage && Auth.isLoggedIn()) {
      sessionStorage.setItem(REDIRECT_KEY, '1');
      window.location.href = 'index.html';
      return;
    }

    // Si dashboard + non connecte -> login 
    if (isDashboard && !Auth.isLoggedIn()) {
      sessionStorage.setItem(REDIRECT_KEY, '1');
      window.location.replace('login.html');
      return;
    }

    // Si dashboard connecte -> injecter les infos 
    if (isDashboard && Auth.isLoggedIn()) {
      injectSessionUser();
    }
  }

  // Tabs Login / Register
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
      tab.classList.add('active');
      const key    = tab.dataset.tab;
      const target = document.getElementById(
        'form' + key.charAt(0).toUpperCase() + key.slice(1)
      );
      if (target) target.classList.add('active');
    });
  });

  // Toggle password visibility
  ['togglePwd', 'toggleRegPwd', 'toggleNewPwd'].forEach(id => {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      if (!input) return;
      const isText = input.type === 'text';
      input.type   = isText ? 'password' : 'text';
      btn.querySelector('i').className = `ti ${isText ? 'ti-eye' : 'ti-eye-off'}`;
    });
  });

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email    = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value;
      const remember = document.getElementById('rememberMe')?.checked ?? false;

      let valid = true;

      if (!email) {
        setError('err-email', 'L\'email est requis');
        setInputState('loginEmail', 'error'); valid = false;
      } else if (!validateEmail(email)) {
        setError('err-email', 'Format d\'email invalide');
        setInputState('loginEmail', 'error'); valid = false;
      } else {
        setError('err-email', '');
        setInputState('loginEmail', 'success');
      }

      if (!password) {
        setError('err-password', 'Le mot de passe est requis');
        setInputState('loginPassword', 'error'); valid = false;
      } else {
        setError('err-password', '');
        setInputState('loginPassword', 'success');
      }

      if (!valid) return;

      const btn = document.getElementById('loginBtn');
      setBtnLoading(btn, true);
      await new Promise(r => setTimeout(r, 1000));

      const user = UserStore.findByCredentials(email, password);

      if (!user) {
        setBtnLoading(btn, false);
        setError('err-email',    '');
        setError('err-password', 'Email ou mot de passe incorrect');
        setInputState('loginEmail',    'error');
        setInputState('loginPassword', 'error');
        showAuthToast('Identifiants incorrects', 'error');
        return;
      }

      Auth.save(user, remember);
      showLoading('Connexion réussie, redirection...');
      showAuthToast(`Bienvenue ${user.firstName} !`, 'success');
      setTimeout(() => { sessionStorage.removeItem('dp_redirecting'); window.location.replace('index.html'); }, 1400);
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const firstName = document.getElementById('regFirstName')?.value.trim() || '';
      const lastName  = document.getElementById('regLastName')?.value.trim()  || '';
      const email     = document.getElementById('regEmail')?.value.trim()     || '';
      const password  = document.getElementById('regPassword')?.value         || '';
      const confirm   = document.getElementById('regConfirm')?.value          || '';
      const terms     = document.getElementById('regTerms')?.checked          ?? false;

      let valid = true;

      if (!firstName) { setError('err-firstname', 'Prénom requis'); valid = false; }
      else              { setError('err-firstname', ''); }

      if (!lastName)  { setError('err-lastname', 'Nom requis'); valid = false; }
      else              { setError('err-lastname', ''); }

      if (!validateEmail(email)) {
        setError('err-reg-email', 'Email invalide');
        setInputState('regEmail', 'error'); valid = false;
      } else {
        const exists = UserStore.findByEmail(email);
        if (exists) {
          setError('err-reg-email', 'Cet email est déjà utilisé');
          setInputState('regEmail', 'error'); valid = false;
        } else {
          setError('err-reg-email', '');
          setInputState('regEmail', 'success');
        }
      }

      if (password.length < 8) {
        setError('err-reg-password', 'Minimum 8 caractères');
        setInputState('regPassword', 'error'); valid = false;
      } else {
        setError('err-reg-password', '');
        setInputState('regPassword', 'success');
      }

      if (password !== confirm) {
        setError('err-reg-confirm', 'Les mots de passe ne correspondent pas');
        setInputState('regConfirm', 'error'); valid = false;
      } else if (confirm) {
        setError('err-reg-confirm', '');
        setInputState('regConfirm', 'success');
      }

      if (!terms) {
        showAuthToast('Veuillez accepter les conditions', 'error');
        valid = false;
      }

      if (!valid) return;

      const btn = document.getElementById('registerBtn');
      setBtnLoading(btn, true);
      await new Promise(r => setTimeout(r, 1200));

      const newUser = UserStore.add({
        firstName,
        lastName,
        email,
        password,
        role:      document.getElementById('regRole')?.value || 'user',
        country:   '',
        language:  'fr',
        createdAt: new Date().toISOString(),
      });

      Auth.save(newUser, false);

      showLoading('Compte créé, redirection...');
      showAuthToast(`Bienvenue ${firstName} !`, 'success');
      setTimeout(() => { sessionStorage.removeItem('dp_redirecting'); window.location.replace('index.html'); }, 1500);
    });
  }

  const resetForm = document.getElementById('resetForm');
  if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('resetEmail')?.value.trim() || '';

      if (!validateEmail(email)) {
        setError('err-reset-email', 'Email invalide');
        setInputState('resetEmail', 'error');
        return;
      }
      setError('err-reset-email', '');

      const btn = resetForm.querySelector('.auth-btn-submit');
      setBtnLoading(btn, true);
      await new Promise(r => setTimeout(r, 1500));

      document.getElementById('step1')?.classList.remove('active');
      document.getElementById('step2')?.classList.add('active');
      const sentEl = document.getElementById('sentEmail');
      if (sentEl) sentEl.textContent = email;
      showAuthToast('Email de réinitialisation envoyé', 'success');
    });
  }

  const newPwdForm = document.getElementById('newPwdForm');
  if (newPwdForm) {
    newPwdForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const pwd     = document.getElementById('newPwd')?.value       || '';
      const confirm = document.getElementById('confirmNewPwd')?.value || '';

      if (pwd.length < 8) {
        setError('err-new-confirm', 'Minimum 8 caractères'); return;
      }
      if (pwd !== confirm) {
        setError('err-new-confirm', 'Les mots de passe ne correspondent pas'); return;
      }
      setError('err-new-confirm', '');

      const btn = newPwdForm.querySelector('.auth-btn-submit');
      setBtnLoading(btn, true);
      await new Promise(r => setTimeout(r, 1200));

      
      const urlParams = new URLSearchParams(window.location.search);
      const emailParam = urlParams.get('email') || Auth.get()?.email;
      if (emailParam) {
        const user = UserStore.findByEmail(emailParam);
        if (user) UserStore.update(user.id, { password: pwd });
      }

      showAuthToast('Mot de passe mis à jour !', 'success');
      setTimeout(() => { window.location.href = 'login.html'; }, 1500);
    });
  }

}); 

function saveProfileChanges() {
  const session = Auth.get();
  if (!session) return false;

  const firstName = document.getElementById('pfFirstName')?.value.trim();
  const lastName  = document.getElementById('pfLastName')?.value.trim();
  const pfEmail   = document.getElementById('pfEmail')?.value.trim();
  const role      = document.getElementById('pfRole')?.value;
  const country   = document.getElementById('pfCountry')?.value.trim();

  if (!firstName || !lastName) {
    showAuthToast('Prénom et nom sont obligatoires', 'error');
    return false;
  }
  if (pfEmail && !validateEmail(pfEmail)) {
    showAuthToast('Email invalide', 'error');
    return false;
  }

  const updateData = {
    firstName: firstName || session.firstName,
    lastName:  lastName  || session.lastName,
    role:      role      || session.role,
    country:   country   || session.country,
  };

  UserStore.update(session.id, updateData);

  Auth.updateSession(updateData);

  const heroAvatar = document.getElementById('heroAvatar');
  const heroName   = document.getElementById('heroName');
  const heroRole   = document.getElementById('heroRole');
  const roleLabels = {
    admin:'Administrateur', analyst:'Analyste', researcher:'Chercheur',
    student:'Étudiant', journalist:'Journaliste', manager:'Manager',
    user:'Utilisateur', other:'Utilisateur',
  };

  const newAvatar = ((updateData.firstName[0] || '') + (updateData.lastName[0] || '')).toUpperCase();
  if (heroAvatar) heroAvatar.textContent = newAvatar;
  if (heroName)   heroName.textContent   = updateData.firstName + ' ' + updateData.lastName;
  if (heroRole)   heroRole.textContent   = roleLabels[updateData.role] || updateData.role;

  showAuthToast('Profil mis à jour avec succès ✓', 'success');
  return true;
}

function changePasswordFromProfile() {
  const session = Auth.get();
  if (!session) return;

  const current = document.getElementById('pfCurrentPwd')?.value || '';
  const newPwd  = document.getElementById('pfNewPwd')?.value     || '';
  const confirm = document.getElementById('pfConfirmPwd')?.value || '';

  if (!current) { showAuthToast('Saisissez votre mot de passe actuel', 'error'); return; }
  if (newPwd.length < 8) { showAuthToast('Minimum 8 caractères', 'error'); return; }
  if (newPwd !== confirm) { showAuthToast('Les mots de passe ne correspondent pas', 'error'); return; }

  const result = UserStore.changePassword(session.id, current, newPwd);
  if (!result.ok) {
    showAuthToast(result.msg, 'error');
    return;
  }

  // Vider les champs
  document.getElementById('pfCurrentPwd').value = '';
  document.getElementById('pfNewPwd').value      = '';
  document.getElementById('pfConfirmPwd').value  = '';

  showAuthToast('Mot de passe mis à jour ✓', 'success');
}

function socialLogin(provider) {
  showLoading(`Connexion via ${provider}...`);
  setTimeout(() => {
    hideLoading();
    showAuthToast(`Connexion ${provider} non disponible en démo`, 'info');
  }, 1200);
}

function resendEmail() {
  showAuthToast('Email renvoyé avec succès', 'success');
}

window.Auth                  = Auth;
window.UserStore             = UserStore;
window.showAuthToast         = showAuthToast;
window.injectSessionUser     = injectSessionUser;
window.saveProfileChanges    = saveProfileChanges;
window.changePasswordFromProfile = changePasswordFromProfile;