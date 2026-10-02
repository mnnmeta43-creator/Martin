(() => {
  'use strict';
  const root = document.createElement('div');
  root.id = 'voltexAuthRoot';
  root.innerHTML = `
    <section class="auth-card" aria-label="Hyrje në VOLTEX">
      <img class="auth-logo" src="icons/voltex-192.png" alt="VOLTEX">
      <h1 class="auth-title">VOLTEX</h1>
      <p class="auth-sub">Krijo llogari ose hyr për të vazhduar.</p>
      <div id="authConfigWarning" class="auth-config" hidden></div>
      <div class="auth-tabs">
        <button class="auth-tab active" id="authLoginTab" type="button">Hyr</button>
        <button class="auth-tab" id="authSignupTab" type="button">Regjistrohu</button>
      </div>
      <form id="authForm" novalidate>
        <div class="auth-field"><label for="authEmail">Email</label><input id="authEmail" type="email" autocomplete="email" inputmode="email" required placeholder="emri@email.com"></div>
        <div class="auth-field"><label for="authPassword">Fjalëkalimi</label><input id="authPassword" type="password" autocomplete="current-password" minlength="6" required placeholder="Të paktën 6 karaktere"></div>
        <div class="auth-field" id="authConfirmWrap" hidden><label for="authConfirm">Përsërit fjalëkalimin</label><input id="authConfirm" type="password" autocomplete="new-password" minlength="6" placeholder="Përsërite fjalëkalimin"></div>
        <button class="auth-btn" id="authSubmit" type="submit">Hyr në VOLTEX</button>
      </form>
      <div class="auth-actions"><button class="auth-link" id="authReset" type="button">Harrova fjalëkalimin</button></div>
      <div class="auth-msg" id="authMsg" aria-live="polite"></div>
      <p class="auth-note">Llogaria funksionon në Android, iPhone dhe kompjuter.</p>
    </section>`;
  document.body.prepend(root);
  document.body.classList.add('auth-locked');

  const $ = (s) => root.querySelector(s);
  const email = $('#authEmail'), password = $('#authPassword'), confirm = $('#authConfirm');
  const form = $('#authForm'), submit = $('#authSubmit'), msg = $('#authMsg');
  const loginTab = $('#authLoginTab'), signupTab = $('#authSignupTab');
  const confirmWrap = $('#authConfirmWrap'), resetBtn = $('#authReset');
  const configWarning = $('#authConfigWarning');
  let mode = 'login';

  function setMessage(text, type='') { msg.textContent = text || ''; msg.className = `auth-msg ${type}`; }
  function setMode(next) {
    mode = next;
    const signup = mode === 'signup';
    loginTab.classList.toggle('active', !signup); signupTab.classList.toggle('active', signup);
    confirmWrap.hidden = !signup; confirm.required = signup;
    password.autocomplete = signup ? 'new-password' : 'current-password';
    submit.textContent = signup ? 'Krijo llogarinë' : 'Hyr në VOLTEX';
    resetBtn.hidden = signup;
    setMessage('');
  }
  loginTab.addEventListener('click', () => setMode('login'));
  signupTab.addEventListener('click', () => setMode('signup'));

  const url = window.VOLTEX_SUPABASE_URL;
  const key = window.VOLTEX_SUPABASE_ANON_KEY;
  const configured = url && key && !url.includes('PASTE_') && !key.includes('PASTE_');
  if (!configured || !window.supabase) {
    configWarning.hidden = false;
    configWarning.textContent = 'Regjistrimi është gati, por administratori duhet të vendosë Supabase Project URL dhe anon public key te supabase-config.js.';
    form.querySelectorAll('input,button').forEach(el => el.disabled = true);
    resetBtn.disabled = true;
    return;
  }

  const client = window.supabase.createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });

  function showApp(user) {
    root.hidden = true;
    document.body.classList.remove('auth-locked');
    let account = document.getElementById('voltexAuthAccount');
    if (!account) {
      account = document.createElement('div');
      account.id = 'voltexAuthAccount'; account.className = 'auth-account';
      account.innerHTML = '<span class="auth-email"></span><button class="auth-logout" type="button">Dil</button>';
      document.body.appendChild(account);
      account.querySelector('button').addEventListener('click', async () => { await client.auth.signOut(); });
    }
    account.querySelector('.auth-email').textContent = user.email || 'Përdorues';
    account.hidden = false;
  }
  function showLogin() {
    root.hidden = false;
    document.body.classList.add('auth-locked');
    const account = document.getElementById('voltexAuthAccount'); if (account) account.hidden = true;
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const userEmail = email.value.trim(); const pwd = password.value;
    if (!userEmail || !pwd) return setMessage('Plotëso emailin dhe fjalëkalimin.', 'bad');
    if (pwd.length < 6) return setMessage('Fjalëkalimi duhet të ketë të paktën 6 karaktere.', 'bad');
    if (mode === 'signup' && pwd !== confirm.value) return setMessage('Fjalëkalimet nuk përputhen.', 'bad');
    submit.disabled = true; setMessage('Duke u përpunuar…');
    try {
      if (mode === 'signup') {
        const { data, error } = await client.auth.signUp({
          email: userEmail,
          password: pwd,
          options: { emailRedirectTo: location.origin + location.pathname }
        });
        if (error) throw error;
        if (data.session) { showApp(data.user); setMessage(''); }
        else setMessage('Llogaria u krijua. Kontrollo emailin për konfirmim.', 'ok');
      } else {
        const { data, error } = await client.auth.signInWithPassword({ email: userEmail, password: pwd });
        if (error) throw error;
        showApp(data.user);
      }
    } catch (error) { setMessage(translateError(error.message), 'bad'); }
    finally { submit.disabled = false; }
  });

  resetBtn.addEventListener('click', async () => {
    const userEmail = email.value.trim();
    if (!userEmail) return setMessage('Shkruaj emailin dhe pastaj shtyp rikthimin.', 'bad');
    resetBtn.disabled = true;
    const { error } = await client.auth.resetPasswordForEmail(userEmail, { redirectTo: location.origin + location.pathname });
    resetBtn.disabled = false;
    setMessage(error ? translateError(error.message) : 'Linku për ndryshimin e fjalëkalimit u dërgua në email.', error ? 'bad' : 'ok');
  });

  function translateError(text='') {
    const t = text.toLowerCase();
    if (t.includes('invalid login credentials')) return 'Emaili ose fjalëkalimi është i pasaktë.';
    if (t.includes('email not confirmed')) return 'Konfirmo emailin para se të hysh.';
    if (t.includes('user already registered')) return 'Ky email është regjistruar më parë.';
    if (t.includes('password')) return 'Kontrollo fjalëkalimin dhe provo përsëri.';
    if (t.includes('rate limit')) return 'Shumë tentativa. Provo përsëri pak më vonë.';
    return text || 'Ndodhi një gabim. Provo përsëri.';
  }

  client.auth.onAuthStateChange((_event, session) => session?.user ? showApp(session.user) : showLogin());
  client.auth.getSession().then(({ data }) => data.session?.user ? showApp(data.session.user) : showLogin());
})();
