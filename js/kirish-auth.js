import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import {
    getAuth,
    signInWithCredential,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut,
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';

const firebaseConfig = {
    apiKey: 'AIzaSyA2LiNy7o7l6kn1FTvOcXqBs14M3PVsjbI',
    authDomain: 'ziyomap.firebaseapp.com',
    projectId: 'ziyomap',
    storageBucket: 'ziyomap.firebasestorage.app',
    messagingSenderId: '982123868162',
    appId: '1:982123868162:web:6845723988c030fcd1f71b',
    measurementId: 'G-Y3EQ1ZJW3B',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginBtn = document.getElementById('login-btn');
const statusEl = document.getElementById('auth-status');
const logoutBtn = document.getElementById('logout-btn');
const loggedPanel = document.getElementById('logged-panel');
const authMethods = document.getElementById('auth-methods');
const localLoginForm = document.getElementById('local-login-form');
const setupForm = document.getElementById('setup-credentials-form');
const setupBox = document.getElementById('setup-box');
const setupDone = document.getElementById('setup-done');
const savedLoginLabel = document.getElementById('saved-login-label');
const welcomeName = document.getElementById('welcome-name');
const welcomeEmail = document.getElementById('welcome-email');
const continueBtn = document.getElementById('continue-btn');
const forgotCredsBtn = document.getElementById('forgot-creds-btn');
const resetCredsBtn = document.getElementById('reset-creds-btn');
const cancelResetBtn = document.getElementById('cancel-reset-btn');

const params = new URLSearchParams(window.location.search);
const Creds = window.ZiyomapCredentials;

function redirectAfterLogin() {
    const ret = params.get('return');
    const safe =
        window.ZiyomapAuthGuard && ZiyomapAuthGuard.safeReturnUrl
            ? ZiyomapAuthGuard.safeReturnUrl(ret)
            : ret;
    window.location.href = safe || 'index.html';
}

function setStatus(text, type) {
    if (!statusEl) return;
    if (!text) {
        statusEl.className = '';
        statusEl.textContent = '';
        return;
    }
    statusEl.textContent = text;
    statusEl.className = 'show ' + (type || 'info');
}

function saveUser(data, provider, usageLabel) {
    const payload = { ...data, provider: provider || data.provider || 'google' };
    if (window.ZiyomapUsage) {
        ZiyomapUsage.setUser(payload);
        ZiyomapUsage.logUsage('kirish', usageLabel || 'Tizimga kirish');
    } else {
        localStorage.setItem('user', JSON.stringify(payload));
    }
}

function saveFirebaseUser(user, usageLabel) {
    saveUser(
        {
            uid: user.uid,
            email: user.email || null,
            displayName: user.displayName || user.email || 'Foydalanuvchi',
            photoURL: user.photoURL || null,
        },
        'google',
        usageLabel || 'Google orqali kirish'
    );
}

function updateCredentialUI(user) {
    if (!user?.uid || !Creds) return;
    if (cancelResetBtn) cancelResetBtn.style.display = 'none';
    const existing = Creds.findByUid(user.uid);
    if (existing) {
        if (setupBox) setupBox.style.display = 'none';
        if (setupDone) setupDone.style.display = 'block';
        if (savedLoginLabel) savedLoginLabel.textContent = existing.login;
    } else {
        if (setupBox) setupBox.style.display = 'block';
        if (setupDone) setupDone.style.display = 'none';
    }
}

function showLoggedInUI(user) {
    if (authMethods) authMethods.style.display = 'none';
    if (loggedPanel) loggedPanel.style.display = 'block';
    if (welcomeName) welcomeName.textContent = 'Xush kelibsiz, ' + (user?.displayName || 'foydalanuvchi') + '!';
    if (welcomeEmail) {
        welcomeEmail.textContent =
            user?.provider === 'local'
                ? 'Login: ' + (user.localLogin || '—')
                : user?.email || 'Google hisobi';
    }
    updateCredentialUI(user);
    setStatus('', '');
}

function showLoginForms() {
    if (authMethods) authMethods.style.display = 'block';
    if (loggedPanel) loggedPanel.style.display = 'none';
}

if (params.get('logout') === '1') {
    signOut(auth).finally(() => {
        if (window.ZiyomapUsage) ZiyomapUsage.clearSession();
        else localStorage.removeItem('user');
        window.location.replace('index.html');
    });
}

async function handleGoogleCallback() {
    const hash = window.location.hash;
    if (!hash.includes('id_token')) return;
    const tokenParams = new URLSearchParams(hash.replace('#', '?'));
    const idToken = tokenParams.get('id_token');
    if (!idToken) return;
    try {
        setStatus('Google tekshirilmoqda...', 'info');
        const credential = GoogleAuthProvider.credential(idToken);
        const result = await signInWithCredential(auth, credential);
        saveFirebaseUser(result.user, 'Google orqali kirish');
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        showLoggedInUI(ZiyomapUsage?.getUser());
        setStatus('Google orqali kirdingiz! Login va parol o‘rnatib, keyingi safar tezroq kiring.', 'success');
    } catch (error) {
        console.error(error);
        setStatus('Google kirishda xatolik. Qayta urinib ko‘ring.', 'error');
    }
}

handleGoogleCallback();

function startGoogleLogin() {
    const clientId = '982123868162-si71h3c38q2hlvm397mo2ti17kgfj3gh.apps.googleusercontent.com';
    const redirectUri = window.location.origin + '/kirish.html';
    const googleOAuthUrl =
        `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${clientId}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=id_token` +
        `&scope=openid%20profile%20email` +
        `&nonce=random_nonce_string` +
        `&prompt=select_account`;
    window.location.href = googleOAuthUrl;
}

if (loginBtn) {
    loginBtn.addEventListener('click', startGoogleLogin);
}

/* Login yoki parolni unutgan foydalanuvchi — Google orqali qayta
   tasdiqlanadi, so'ng logged-panel ichidagi "Tiklash" tugmasi orqali
   yangi login/parol o'rnatiladi. */
if (forgotCredsBtn) {
    forgotCredsBtn.addEventListener('click', () => {
        setStatus('Google orqali tasdiqlang, so‘ng yangi login va parol o‘rnatasiz.', 'info');
        startGoogleLogin();
    });
}

/* Login/parol allaqachon o'rnatilgan bo'lsa ham, foydalanuvchi
   ularni shu yerdan tiklab (o'zgartirib) yubora oladi. */
if (resetCredsBtn) {
    resetCredsBtn.addEventListener('click', () => {
        if (setupDone) setupDone.style.display = 'none';
        if (setupBox) setupBox.style.display = 'block';
        if (cancelResetBtn) cancelResetBtn.style.display = 'block';
        setStatus('Yangi login va parol kiriting.', 'info');
    });
}

if (cancelResetBtn) {
    cancelResetBtn.addEventListener('click', () => {
        if (setupBox) setupBox.style.display = 'none';
        if (setupDone) setupDone.style.display = 'block';
        cancelResetBtn.style.display = 'none';
        setStatus('', '');
    });
}

if (localLoginForm) {
    localLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const login = document.getElementById('local-login')?.value;
        const password = document.getElementById('local-password')?.value;
        if (!Creds) return;
        setStatus('Tekshirilmoqda...', 'info');
        const result = await Creds.loginWithCredentials(login, password);
        if (!result.ok) {
            setStatus(result.error, 'error');
            return;
        }
        saveUser(result.user, 'local', 'Login va parol bilan kirish');
        setStatus('Muvaffaqiyatli kirdingiz!', 'success');
        setTimeout(redirectAfterLogin, 700);
    });
}

if (setupForm) {
    setupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = ZiyomapUsage?.getUser();
        if (!user?.uid) {
            setStatus('Avval Google orqali kiring.', 'error');
            return;
        }
        const login = document.getElementById('new-login')?.value;
        const p1 = document.getElementById('new-password')?.value;
        const p2 = document.getElementById('new-password2')?.value;
        if (p1 !== p2) {
            setStatus('Parollar mos kelmadi.', 'error');
            return;
        }
        const result = await Creds.registerCredentials(user, login, p1);
        if (!result.ok) {
            setStatus(result.error, 'error');
            return;
        }
        updateCredentialUI(user);
        setStatus('Login va parol saqlandi! Keyingi safar shu ma’lumotlar bilan kiring.', 'success');
        setupForm.reset();
    });
}

if (continueBtn) {
    continueBtn.addEventListener('click', (e) => {
        if (ZiyomapUsage?.getUser()) {
            e.preventDefault();
            redirectAfterLogin();
        }
    });
}

if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!confirm('Chiqishni xohlaysizmi? Foydalanish tarixi o‘chadi.')) return;
        try {
            await signOut(auth);
        } catch {
            /* ignore */
        }
        if (window.ZiyomapUsage) ZiyomapUsage.clearSession();
        else localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
}

const storedUser = window.ZiyomapUsage?.getUser();
if (storedUser && !params.get('logout') && !window.location.hash.includes('id_token')) {
    showLoggedInUI(storedUser);
}

onAuthStateChanged(auth, (user) => {
    if (user && !params.get('logout')) {
        saveFirebaseUser(user, 'Google orqali kirish');
        showLoggedInUI(ZiyomapUsage?.getUser());
    } else if (!params.get('logout') && !window.ZiyomapUsage?.getUser()) {
        showLoginForms();
    }
});
