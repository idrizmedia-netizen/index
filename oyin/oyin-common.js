/** Ziyomap Games — umumiy sozlamalar va yordamchi funksiyalar */
const ZY_FANS = [
    { id: 'fizika', name: 'Fizika', icon: '⚛️', color: '#4f7cff' },
    { id: 'matematika', name: 'Matematika', icon: '📐', color: '#22c55e' },
    { id: 'informatika', name: 'Informatika', icon: '💻', color: '#a855f7' },
    { id: 'biologiya', name: 'Biologiya', icon: '🧬', color: '#ec4899' },
    { id: 'kimyo', name: 'Kimyo', icon: '🧪', color: '#f97316' },
    { id: 'tarix', name: 'Tarix', icon: '📜', color: '#eab308' },
    { id: 'ingliz', name: 'Ingliz tili', icon: '🇬🇧', color: '#14b8a6' },
    { id: 'geografiya', name: 'Geografiya', icon: '🌍', color: '#3b82f6' },
];

function zyApplyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme === 'dark' ? 'dark' : 'light');
    localStorage.setItem('zy_theme', theme === 'dark' ? 'dark' : 'light');
}

function zyInitTheme() {
    zyApplyTheme(localStorage.getItem('zy_theme') || 'light');
}

function zyToggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') || 'light';
    zyApplyTheme(cur === 'light' ? 'dark' : 'light');
}

function zySyncUserFromAuth() {
    const u = window.ZiyomapUsage?.getUser?.();
    if (!u) return;
    const name = u.displayName || u.name || (u.email ? u.email.split('@')[0] : '') || 'O\'yinchi';
    localStorage.setItem('zy_user', name);
}

function zyGetUser() {
    zySyncUserFromAuth();
    return localStorage.getItem('zy_user') || 'O\'yinchi';
}

function zyAddPoints(pts) {
    const total = parseInt(localStorage.getItem('zy_total') || '0', 10) + pts;
    localStorage.setItem('zy_total', String(total));
    return total;
}

function zySaveGameScore(gameId, score, extra) {
    const key = 'zy_lb_' + gameId;
    const list = JSON.parse(localStorage.getItem(key) || '[]');
    list.push({
        name: zyGetUser(),
        score,
        at: Date.now(),
        ...extra,
    });
    list.sort((a, b) => b.score - a.score);
    localStorage.setItem(key, JSON.stringify(list.slice(0, 20)));
}

function zyShuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function zyPickQuestions(fan, diff, count) {
    let qs = (window.QUIZ_QUESTIONS?.[fan] || []).slice();
    if (diff && diff !== 'all') qs = qs.filter((q) => q.d === diff);
    if (!qs.length) qs = (window.QUIZ_QUESTIONS?.[fan] || []).slice();
    return zyShuffle(qs).slice(0, count);
}

function zyRenderFanGrid(containerId, onSelect, selectedId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = ZY_FANS.map(
        (f) => {
            const cnt = window.ZiyomapQuestions?.countQuiz(f.id) || (window.QUIZ_QUESTIONS?.[f.id] || []).length;
            const sel = f.id === selectedId ? ' sel' : '';
            return `<div class="fan-card${sel}" data-fan="${f.id}" onclick="window.__zySelectFan&&__zySelectFan('${f.id}')">
        <div class="fan-icon">${f.icon}</div>
        <div class="fan-name">${f.name}</div>
        <div class="fan-cnt">${cnt} savol</div>
      </div>`;
        }
    ).join('');
    window.__zySelectFan = (id) => {
        el.querySelectorAll('.fan-card').forEach((c) => c.classList.toggle('sel', c.dataset.fan === id));
        onSelect(id);
    };
}

zyInitTheme();
