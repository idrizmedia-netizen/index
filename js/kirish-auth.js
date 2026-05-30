import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import {
    getAuth,
    signInWithCredential,
    GoogleAuthProvider,
    onAuthStateChanged,
    signOut,
    RecaptchaVerifier,
    signInWithPhoneNumber,
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';

/**
 * Telegram Login Widget uchun @BotFather dan olingan ma'lumotlar.
 * MUHIM: Widget faqat username bilan ishlaydi (raqamli ID yetarli emas).
 * id — eslatma / kelajak uchun; username — majburiy (masalan: ZiyomapBot, @ siz).
 */
const TELEGRAM_BOTS = [
    { id:8733813153 '', username: @ziyomapbot '' }, // 1-bot: ID va username ni yozing
    { id: '', username: '' }, // 2-bot: ikkkinchi bot (ixtiyoriy)
];

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
const phoneInput = document.getElementById('phone-input');
const sendCodeBtn = document.getElementById('send-code-btn');
const verifyCodeBtn = document.getElementById('verify-code-btn');
const smsCodeInput = document.getElementById('sms-code-input');
const phoneStep2 = document.getElementById('phone-step-2');

let confirmationResult = null;
let recaptchaVerifier = null;

const params = new URLSearchParams(window.location.search);

function redirectAfterLogin() {
    const ret = params.get('return');
    const safe =
        window.ZiyomapAuthGuard && ZiyomapAuthGuard.safeReturnUrl
            ? ZiyomapAuthGuard.safeReturnUrl(ret)
            : ret;
    window.location.href = safe || 'index.html';
}

if (params.get('logout') === '1') {
    signOut(auth)
        .then(() => {
            if (window.ZiyomapUsage) ZiyomapUsage.clearSession();
            else localStorage.removeItem('user');
            window.location.replace('index.html');
        })
        .catch(() => {
            if (window.ZiyomapUsage) ZiyomapUsage.clearSession();
            window.location.replace('index.html');
        });
}

function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
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

function saveFirebaseUser(user, provider, usageLabel) {
    saveUser(
        {
            uid: user.uid,
            email: user.email || null,
            phoneNumber: user.phoneNumber || null,
            displayName: user.displayName || user.phoneNumber || 'Foydalanuvchi',
            photoURL: user.photoURL || null,
        },
        provider,
        usageLabel
    );
}

async function handleGoogleCallback() {
    const hash = window.location.hash;
    if (!hash.includes('id_token')) return;
    const tokenParams = new URLSearchParams(hash.replace('#', '?'));
    const idToken = tokenParams.get('id_token');
    if (!idToken) return;
    try {
        setStatus('Tekshirilmoqda...');
        const credential = GoogleAuthProvider.credential(idToken);
        const result = await signInWithCredential(auth, credential);
        saveFirebaseUser(result.user, 'google', 'Google orqali kirish');
        window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        setStatus('Muvaffaqiyatli! Yo‘naltirilmoqdasiz...');
        setTimeout(redirectAfterLogin, 1000);
    } catch (error) {
        console.error('Kirish xatosi:', error);
        setStatus('Google kirishda xatolik. Qayta urinib ko‘ring.');
    }
}

handleGoogleCallback();

if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (auth.currentUser) return;
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
    });
}

function normalizePhone(raw) {
    let p = raw.replace(/\s/g, '').replace(/-/g, '');
    if (p.startsWith('998')) p = '+' + p;
    if (p.startsWith('8') && p.length === 10) p = '+998' + p.slice(1);
    if (/^\d{9}$/.test(p)) p = '+998' + p;
    if (!p.startsWith('+')) p = '+998' + p.replace(/^\+/, '');
    return p;
}

function setupRecaptcha() {
    if (recaptchaVerifier) return recaptchaVerifier;
    const container = document.getElementById('recaptcha-container');
    if (!container) throw new Error('reCAPTCHA konteyner topilmadi');
    recaptchaVerifier = new RecaptchaVerifier(auth, container, {
        size: 'normal',
        callback: () => {},
        'expired-callback': () => setStatus('reCAPTCHA muddati tugadi. Yangilang.'),
    });
    return recaptchaVerifier;
}

if (sendCodeBtn) {
    sendCodeBtn.addEventListener('click', async () => {
        const phone = normalizePhone(phoneInput?.value || '');
        if (!/^\+998\d{9}$/.test(phone)) {
            setStatus("Telefon: +998 XX XXX XX XX formatida yozing.");
            return;
        }
        try {
            setStatus('SMS yuborilmoqda...');
            sendCodeBtn.disabled = true;
            const verifier = setupRecaptcha();
            await verifier.render();
            confirmationResult = await signInWithPhoneNumber(auth, phone, verifier);
            if (phoneStep2) phoneStep2.style.display = 'block';
            setStatus(`${phone} raqamiga kod yuborildi.`);
        } catch (err) {
            console.error(err);
            setStatus('SMS yuborilmadi. Firebase’da Telefon kirish yoqilganini tekshiring.');
            sendCodeBtn.disabled = false;
            if (recaptchaVerifier) {
                try {
                    recaptchaVerifier.clear();
                } catch {
                    /* ignore */
                }
                recaptchaVerifier = null;
            }
        }
    });
}

if (verifyCodeBtn) {
    verifyCodeBtn.addEventListener('click', async () => {
        const code = smsCodeInput?.value?.trim();
        if (!code || !confirmationResult) {
            setStatus('Avval SMS kodini oling.');
            return;
        }
        try {
            setStatus('Kod tekshirilmoqda...');
            const result = await confirmationResult.confirm(code);
            saveFirebaseUser(result.user, 'phone', 'Telefon orqali kirish');
            setStatus('Muvaffaqiyatli! Yo‘naltirilmoqdasiz...');
            setTimeout(redirectAfterLogin, 800);
        } catch (err) {
            console.error(err);
            setStatus('Kod noto‘g‘ri yoki muddati tugagan.');
        }
    });
}

window.onTelegramAuth = function (tgUser) {
    if (!tgUser || !tgUser.id) return;
    const name = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ');
    saveUser(
        {
            uid: 'telegram_' + tgUser.id,
            telegramId: tgUser.id,
            displayName: name || tgUser.username || 'Telegram foydalanuvchi',
            photoURL: tgUser.photo_url || null,
            username: tgUser.username || null,
        },
        'telegram',
        'Telegram orqali kirish'
    );
    setStatus('Telegram orqali kirdingiz! Yo‘naltirilmoqdasiz...');
    setTimeout(redirectAfterLogin, 800);
};

function createTelegramWidget(container, username) {
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', username);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    container.appendChild(script);
}

function initTelegramWidgets() {
    const bots = TELEGRAM_BOTS.filter((b) => b.username && b.username.trim());
    const box1 = document.getElementById('telegram-login-1');
    const box2 = document.getElementById('telegram-login-2');
    const hint = document.getElementById('telegram-hint');

    if (bots.length === 0) {
        if (hint) {
            hint.textContent =
                'Telegram: js/kirish-auth.js ichida TELEGRAM_BOTS ga bot ID (ixtiyoriy) va username (@ siz) yozing.';
        }
        return;
    }

    if (hint) hint.style.display = 'none';
    if (box1 && bots[0]) {
        if (bots[0].id) box1.setAttribute('data-bot-id', bots[0].id);
        createTelegramWidget(box1, bots[0].username.trim());
    }
    if (box2 && bots[1]) {
        box2.style.display = 'flex';
        if (bots[1].id) box2.setAttribute('data-bot-id', bots[1].id);
        createTelegramWidget(box2, bots[1].username.trim());
    } else if (box2) {
        box2.style.display = 'none';
    }
}

initTelegramWidgets();

if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!confirm('Chiqishni xohlaysizmi? Foydalanish tarixi o‘chadi.')) return;
        try {
            await signOut(auth);
        } catch (err) {
            console.error(err);
        }
        if (window.ZiyomapUsage) ZiyomapUsage.clearSession();
        else localStorage.removeItem('user');
        window.location.href = 'index.html';
    });
}

function showLoggedInUI(displayName) {
    if (loginBtn) loginBtn.style.display = 'none';
    document.getElementById('auth-methods')?.style.setProperty('display', 'none');
    if (loggedPanel) loggedPanel.style.display = 'block';
    if (statusEl) statusEl.textContent = `Xush kelibsiz, ${displayName || 'foydalanuvchi'}!`;
}

const storedUser = window.ZiyomapUsage?.getUser();
if (storedUser && !params.get('logout')) {
    showLoggedInUI(storedUser.displayName);
}

onAuthStateChanged(auth, (user) => {
    if (user && !params.get('logout')) {
        const provider = user.providerData?.[0]?.providerId?.includes('phone')
            ? 'phone'
            : 'google';
        saveFirebaseUser(
            user,
            provider,
            provider === 'phone' ? 'Telefon orqali kirish' : 'Google orqali kirish'
        );
        showLoggedInUI(user.displayName || user.phoneNumber);
    } else if (!params.get('logout') && !window.ZiyomapUsage?.getUser()) {
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (loggedPanel) loggedPanel.style.display = 'none';
        if (statusEl && !window.location.hash.includes('id_token')) {
            statusEl.textContent = 'Davom etish uchun quyidagi usullardan birini tanlang.';
        }
    }
});
