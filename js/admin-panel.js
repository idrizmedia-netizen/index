import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import {
    getFirestore,
    collection,
    query,
    where,
    orderBy,
    limit,
    getDocs,
    getDoc,
    getCountFromServer,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
    writeBatch,
    increment,
} from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: 'AIzaSyA2LiNy7o7l6kn1FTvOcXqBs14M3PVsjbI',
    authDomain: 'ziyomap.firebaseapp.com',
    projectId: 'ziyomap',
    storageBucket: 'ziyomap.firebasestorage.app',
    messagingSenderId: '982123868162',
    appId: '1:982123868162:web:6845723988c030fcd1f71b',
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const authInst = getAuth(app);

// Avvalgi sahifada (kirish.html) saqlangan Firebase sessiyasi to'liq
// yuklanguncha kutamiz — aks holda Firestore so'rovlari "kirmagan" deb hisoblanadi.
const authReady = new Promise((resolve) => {
    const unsub = onAuthStateChanged(authInst, () => {
        unsub();
        resolve();
    });
});

const gate = document.getElementById('gate');
const wrap = document.getElementById('wrap');
const statusMsg = document.getElementById('status-msg');

function setStatus(text, type) {
    if (!text) {
        statusMsg.className = '';
        statusMsg.textContent = '';
        return;
    }
    statusMsg.textContent = text;
    statusMsg.className = 'show ' + (type || 'info');
    setTimeout(() => setStatus(''), 4000);
}

function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str == null ? '' : String(str);
    return d.innerHTML;
}

function formatDateTime(isoStr) {
    if (!isoStr) return '\u2014';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return isoStr;
    return d.toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/* ── KIRISHNI TEKSHIRISH ── */
async function boot(isAdmin) {
    if (!isAdmin) {
        gate.innerHTML =
            '<i class="fas fa-lock"></i><p>Bu sahifaga kirish huquqingiz yo\u2018q.<br>Faqat admin sifatida belgilangan Google hisob bilan kiring.</p>';
        return;
    }
    await authReady;
    gate.style.display = 'none';
    wrap.classList.add('show');

    if (!authInst.currentUser) {
        setStatus('Sessiyangiz eskirgan. Iltimos, chiqib, Google orqali qayta kiring — aks holda ma\u2018lumotlar yuklanmaydi.', 'error');
    }

    if (window.ZiyomapIsOwner) {
        document.getElementById('admins-tab-btn').style.display = '';
    }
    initTabs();
    loadStats();
    loadContests();
    loadNotifications();
    loadUsers();
    loadSiteContent();
    loadTests();
    loadMeetLinks();
    if (window.ZiyomapIsOwner) loadAdmins();
}

document.addEventListener('ziyomap-admin-checked', (e) => boot(e.detail));
// agar voqea allaqachon otib ketgan bo'lsa (juda tez yuklangan holat)
setTimeout(() => {
    if (window.ZiyomapIsAdmin !== undefined && wrap.classList.contains('show') === false && gate.querySelector('.fa-spin')) {
        boot(!!window.ZiyomapIsAdmin);
    }
}, 2500);

/* ── TABLAR ── */
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
            document.querySelectorAll('.panel').forEach((p) => p.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById('panel-' + btn.dataset.tab).classList.add('active');
        });
    });
}

/* ── STATISTIKA ── */
async function loadStats() {
    try {
        const [regSnap, contC, openC, admC, usersC] = await Promise.all([
            getDocs(collection(db, 'registrations')),
            getCountFromServer(collection(db, 'contests')),
            getCountFromServer(query(collection(db, 'contests'), where('status', '==', 'open'))),
            getCountFromServer(collection(db, 'admins')),
            getCountFromServer(collection(db, 'users')),
        ]);
        document.getElementById('st-reg').textContent = regSnap.size;
        document.getElementById('st-contests').textContent = contC.data().count;
        document.getElementById('st-open').textContent = openC.data().count;
        document.getElementById('st-admins').textContent = admC.data().count + 1; // +1 = owner
        document.getElementById('st-users').textContent = usersC.data().count;
    } catch (err) {
        console.error(err);
    }

    const usageEl = document.getElementById('usageStatsList');
    try {
        const snap = await getDocs(collection(db, 'usage-stats'));
        if (snap.empty) {
            usageEl.innerHTML = '<div class="empty">Hali statistika yig\u2018ilmagan.</div>';
            return;
        }
        const rows = [];
        snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
        rows.sort((a, b) => (b.count || 0) - (a.count || 0));
        usageEl.innerHTML = rows
            .slice(0, 15)
            .map(
                (r) => `<div class="admin-row"><span>${escapeHtml(r.label || r.id)}</span><b>${r.count || 0}</b></div>`
            )
            .join('');
    } catch (err) {
        console.error(err);
        usageEl.innerHTML = '<div class="empty">Yuklashda xatolik.</div>';
    }
}

/* ── TANLOV BO'YICHA STATISTIKA ── */
function renderBarChart(items, maxItems = 8) {
    // items: [{label, value}], eng katta qiymatga nisbatan foiz bo'yicha chiziladi
    if (!items.length) return '<div class="empty">Ma\u2019lumot yo\u2018q.</div>';
    const sorted = [...items].sort((a, b) => b.value - a.value).slice(0, maxItems);
    const max = Math.max(...sorted.map((i) => i.value), 1);
    return sorted
        .map(
            (i) => `<div style="margin-bottom:10px">
                <div style="display:flex;justify-content:space-between;font-size:0.82rem;margin-bottom:3px">
                    <span>${escapeHtml(i.label)}</span><b>${i.value}</b>
                </div>
                <div style="background:var(--primary-light);border-radius:6px;height:10px;overflow:hidden">
                    <div style="width:${Math.round((i.value / max) * 100)}%;background:var(--primary);height:100%;border-radius:6px"></div>
                </div>
            </div>`
        )
        .join('');
}

document.getElementById('stats-contest-select')?.addEventListener('change', async (e) => {
    const contestId = e.target.value;
    const box = document.getElementById('contestStatsBox');
    if (!contestId) {
        box.innerHTML = '';
        return;
    }
    box.innerHTML = '<div class="empty">Hisoblanmoqda...</div>';
    try {
        const snap = await getDocs(query(collection(db, 'registrations'), where('contestId', '==', contestId)));
        const list = [];
        snap.forEach((d) => list.push(d.data()));

        const total = list.length;
        const testedCount = list.filter((r) => r.score !== null && r.score !== undefined).length;
        const interviewedCount = list.filter((r) => r.interviewScore !== null && r.interviewScore !== undefined).length;
        const scores = list.map((r) => r.score).filter((s) => s !== null && s !== undefined);
        const interviewScores = list.map((r) => r.interviewScore).filter((s) => s !== null && s !== undefined);
        const avg = (arr) => (arr.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : '\u2014');

        const viloyatCounts = {};
        const maktabCounts = {};
        list.forEach((r) => {
            if (r.viloyat) viloyatCounts[r.viloyat] = (viloyatCounts[r.viloyat] || 0) + 1;
            if (r.maktab) maktabCounts[r.maktab] = (maktabCounts[r.maktab] || 0) + 1;
        });
        const viloyatItems = Object.entries(viloyatCounts).map(([label, value]) => ({ label, value }));
        const maktabItems = Object.entries(maktabCounts).map(([label, value]) => ({ label, value }));

        box.innerHTML = `
            <div class="stats-grid" style="margin-bottom:10px">
                <div class="stat-card"><div class="v">${total}</div><div class="k">Ro'yxatdan o'tganlar</div></div>
                <div class="stat-card"><div class="v">${testedCount}</div><div class="k">Test topshirganlar</div></div>
                <div class="stat-card"><div class="v">${interviewedCount}</div><div class="k">Suhbatdan o'tganlar</div></div>
                <div class="stat-card"><div class="v">${avg(scores)}</div><div class="k">O'rtacha test bali</div></div>
                <div class="stat-card"><div class="v">${avg(interviewScores)}</div><div class="k">O'rtacha suhbat bali</div></div>
            </div>
            <h4 style="margin:16px 0 8px">Viloyatlar bo'yicha taqsimot</h4>
            ${renderBarChart(viloyatItems)}
            <h4 style="margin:16px 0 8px">Eng ko'p ishtirokchi bergan maktablar (top 8)</h4>
            ${renderBarChart(maktabItems)}
        `;
    } catch (err) {
        console.error(err);
        box.innerHTML = '<div class="empty">Yuklashda xatolik.</div>';
    }
});

// ── Hudud cheklovi (Viloyat/Tuman) tanlash ──
function setupContestHududSelects() {
    const viloyatSelect = document.getElementById('c-restrict-viloyat');
    const tumanSelect = document.getElementById('c-restrict-tuman');
    if (!viloyatSelect || !tumanSelect || !window.UZ_HUDUDLAR) return;
    Object.keys(window.UZ_HUDUDLAR).forEach((viloyat) => {
        const opt = document.createElement('option');
        opt.value = viloyat;
        opt.textContent = viloyat;
        viloyatSelect.appendChild(opt);
    });
    viloyatSelect.addEventListener('change', () => {
        const tumanlar = window.UZ_HUDUDLAR[viloyatSelect.value] || [];
        tumanSelect.innerHTML = '<option value="">— cheklovsiz (barcha tumanlar) —</option>';
        tumanlar.forEach((tuman) => {
            const opt = document.createElement('option');
            opt.value = tuman;
            opt.textContent = tuman;
            tumanSelect.appendChild(opt);
        });
    });
}
setupContestHududSelects();

// ── To'lov turi (bepul/pullik) maydonlarini ko'rsatish/yashirish ──
document.getElementById('c-payment-type')?.addEventListener('change', (e) => {
    const isPaid = e.target.value === 'paid';
    document.getElementById('c-payment-amount').disabled = !isPaid;
    document.getElementById('c-payment-details-row').style.display = isPaid ? '' : 'none';
});

/* ── TANLOVLAR ── */
let contestsCache = {};

async function loadContests() {
    const listEl = document.getElementById('contestsList');
    const selectEl = document.getElementById('reg-contest-select');
    try {
        const snap = await getDocs(query(collection(db, 'contests'), orderBy('createdAt', 'desc')));
        if (snap.empty) {
            listEl.innerHTML = '<div class="empty">Hali tanlov yaratilmagan.</div>';
            return;
        }
        let listHtml = '';
        let selectHtml = '<option value="">— tanlov tanlang —</option>';
        contestsCache = {};
        snap.forEach((d) => {
            const c = d.data();
            contestsCache[d.id] = c;
            const isOpen = c.status === 'open';
            const restrictions = [];
            if (c.minAge || c.maxAge) restrictions.push(`Yosh: ${c.minAge || '0'}–${c.maxAge || '∞'}`);
            if (c.grades && c.grades.length) restrictions.push(`Sinf: ${c.grades.join(', ')}`);
            if (c.restrictViloyat) restrictions.push(`Hudud: ${c.restrictTuman || c.restrictViloyat}`);
            const dates = [];
            if (c.regStartDate || c.regEndDate) dates.push(`Ro'yxat: ${c.regStartDate || '\u2014'} \u2013 ${c.regEndDate || '\u2014'}`);
            if (c.testDateStart || c.testDateEnd) dates.push(`Test: ${c.testDateStart || '\u2014'} \u2013 ${c.testDateEnd || '\u2014'} (${c.testDailyStart || '?'}\u2013${c.testDailyEnd || '?'})`);
            if (c.interviewDateStart || c.interviewDateEnd) dates.push(`Suhbat: ${c.interviewDateStart || '\u2014'} \u2013 ${c.interviewDateEnd || '\u2014'} (${c.interviewDailyStart || '?'}\u2013${c.interviewDailyEnd || '?'})`);
            const paymentBadge = c.isPaid
                ? `<span class="badge" style="background:#fef3c7;color:#92400e;margin-left:6px"><i class="fas fa-money-bill-wave"></i> PULLIK: ${escapeHtml(c.paymentAmount || '?')} so\u2018m</span>`
                : `<span class="badge" style="background:#e0f2fe;color:#075985;margin-left:6px">BEPUL</span>`;
            listHtml += `<div class="contest-item">
                <div>
                    <div class="t">${escapeHtml(c.title)} <span class="badge ${isOpen ? 'open' : 'closed'}">${isOpen ? 'FAOL' : 'YOPIQ'}</span>${paymentBadge}</div>
                    <div class="d">${escapeHtml(c.description || '')}</div>
                    ${restrictions.length ? `<div class="d" style="color:var(--orange);margin-top:2px"><i class="fas fa-filter"></i> ${escapeHtml(restrictions.join(' · '))}</div>` : ''}
                    ${dates.length ? `<div class="d" style="color:var(--primary);margin-top:2px"><i class="fas fa-calendar-days"></i> ${escapeHtml(dates.join(' · '))}</div>` : ''}
                </div>
                <div style="display:flex;gap:8px">
                    <button class="btn ${isOpen ? 'btn-red' : 'btn-green'}" data-toggle="${d.id}" data-next="${isOpen ? 'closed' : 'open'}">
                        <i class="fas ${isOpen ? 'fa-lock' : 'fa-unlock'}"></i> ${isOpen ? 'Yopish' : 'Ochish'}
                    </button>
                    <button class="btn btn-primary" data-edit-contest="${d.id}" title="Tahrirlash"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-red" data-delete-contest="${d.id}" title="O'chirish"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
            selectHtml += `<option value="${d.id}">${escapeHtml(c.title)}</option>`;
        });
        listEl.innerHTML = listHtml;
        selectEl.innerHTML = selectHtml;
        const tSelect = document.getElementById('t-contest-select');
        const trSelect = document.getElementById('tr-contest-select');
        const meetSelect = document.getElementById('meet-contest-select');
        const statsSelect = document.getElementById('stats-contest-select');
        const ticketSelect = document.getElementById('ticket-contest-select');
        if (tSelect) tSelect.innerHTML = selectHtml;
        if (trSelect) trSelect.innerHTML = selectHtml;
        if (meetSelect) meetSelect.innerHTML = selectHtml;
        if (statsSelect) statsSelect.innerHTML = selectHtml;
        if (ticketSelect) ticketSelect.innerHTML = selectHtml;

        listEl.querySelectorAll('[data-toggle]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                btn.disabled = true;
                try {
                    await updateDoc(doc(db, 'contests', btn.dataset.toggle), { status: btn.dataset.next });
                    loadContests();
                    loadStats();
                } catch (err) {
                    console.error(err);
                    setStatus('Xatolik yuz berdi.', 'error');
                    btn.disabled = false;
                }
            });
        });

        listEl.querySelectorAll('[data-edit-contest]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const c = contestsCache[btn.dataset.editContest];
                if (!c) return;
                document.getElementById('c-edit-id').value = btn.dataset.editContest;
                document.getElementById('c-title').value = c.title || '';
                document.getElementById('c-desc').value = c.description || '';
                document.getElementById('c-min-age').value = c.minAge ?? '';
                document.getElementById('c-max-age').value = c.maxAge ?? '';
                document.getElementById('c-grades').value = (c.grades && c.grades.length) ? c.grades.join(',') : '';
                document.getElementById('c-restrict-viloyat').value = c.restrictViloyat || '';
                document.getElementById('c-restrict-viloyat').dispatchEvent(new Event('change'));
                document.getElementById('c-restrict-tuman').value = c.restrictTuman || '';
                document.getElementById('c-payment-type').value = c.isPaid ? 'paid' : 'free';
                document.getElementById('c-payment-type').dispatchEvent(new Event('change'));
                document.getElementById('c-payment-amount').value = c.paymentAmount || '';
                document.getElementById('c-payment-account').value = c.paymentAccount || '';
                document.getElementById('c-payment-receiver').value = c.paymentReceiver || '';
                document.getElementById('c-reg-start').value = c.regStartDate || '';
                document.getElementById('c-reg-end').value = c.regEndDate || '';
                document.getElementById('c-test-date-start').value = c.testDateStart || '';
                document.getElementById('c-test-date-end').value = c.testDateEnd || '';
                document.getElementById('c-test-daily-start').value = c.testDailyStart || '08:00';
                document.getElementById('c-test-daily-end').value = c.testDailyEnd || '18:00';
                document.getElementById('c-test-break-start').value = c.testBreakStart || '';
                document.getElementById('c-test-break-end').value = c.testBreakEnd || '';
                document.getElementById('c-test-slot-minutes').value = c.testSlotMinutes || 30;
                document.getElementById('c-test-slot-capacity').value = c.testSlotCapacity || 15;
                document.getElementById('c-interview-date-start').value = c.interviewDateStart || '';
                document.getElementById('c-interview-date-end').value = c.interviewDateEnd || '';
                document.getElementById('c-interview-daily-start').value = c.interviewDailyStart || '09:00';
                document.getElementById('c-interview-daily-end').value = c.interviewDailyEnd || '17:00';
                document.getElementById('c-interview-break-start').value = c.interviewBreakStart || '';
                document.getElementById('c-interview-break-end').value = c.interviewBreakEnd || '';
                document.getElementById('c-interview-slot-minutes').value = c.interviewSlotMinutes || 15;
                document.getElementById('c-interview-slot-capacity').value = c.interviewSlotCapacity || 1;
                document.getElementById('c-create-btn').innerHTML = '<i class="fas fa-check"></i> O\u2018zgarishlarni saqlash';
                document.getElementById('c-cancel-edit-btn').style.display = '';
                document.getElementById('c-title').scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });

        listEl.querySelectorAll('[data-delete-contest]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                if (!confirm('Bu tanlovni butunlay o\u2018chirmoqchimisiz? Ro\u2018yxatdan o\u2018tganlar ma\u2019lumoti saqlanib qoladi, lekin tanlov ro\u2018yxatdan yo\u2018qoladi.')) return;
                btn.disabled = true;
                try {
                    await deleteDoc(doc(db, 'contests', btn.dataset.deleteContest));
                    loadContests();
                    loadStats();
                } catch (err) {
                    console.error(err);
                    setStatus('Xatolik yuz berdi.', 'error');
                    btn.disabled = false;
                }
            });
        });
    } catch (err) {
        console.error(err);
        listEl.innerHTML = '<div class="empty">Yuklashda xatolik.</div>';
    }
}

function resetContestForm() {
    document.getElementById('c-edit-id').value = '';
    document.getElementById('c-title').value = '';
    document.getElementById('c-desc').value = '';
    document.getElementById('c-min-age').value = '';
    document.getElementById('c-max-age').value = '';
    document.getElementById('c-grades').value = '';
    document.getElementById('c-restrict-viloyat').value = '';
    document.getElementById('c-restrict-viloyat').dispatchEvent(new Event('change'));
    document.getElementById('c-restrict-tuman').value = '';
    document.getElementById('c-payment-type').value = 'free';
    document.getElementById('c-payment-type').dispatchEvent(new Event('change'));
    document.getElementById('c-payment-amount').value = '';
    document.getElementById('c-payment-account').value = '';
    document.getElementById('c-payment-receiver').value = '';
    document.getElementById('c-reg-start').value = '';
    document.getElementById('c-reg-end').value = '';
    document.getElementById('c-test-date-start').value = '';
    document.getElementById('c-test-date-end').value = '';
    document.getElementById('c-test-daily-start').value = '08:00';
    document.getElementById('c-test-daily-end').value = '18:00';
    document.getElementById('c-test-break-start').value = '';
    document.getElementById('c-test-break-end').value = '';
    document.getElementById('c-test-slot-minutes').value = '30';
    document.getElementById('c-test-slot-capacity').value = '15';
    document.getElementById('c-interview-date-start').value = '';
    document.getElementById('c-interview-date-end').value = '';
    document.getElementById('c-interview-daily-start').value = '09:00';
    document.getElementById('c-interview-daily-end').value = '17:00';
    document.getElementById('c-interview-break-start').value = '12:00';
    document.getElementById('c-interview-break-end').value = '13:00';
    document.getElementById('c-interview-slot-minutes').value = '15';
    document.getElementById('c-interview-slot-capacity').value = '1';
    document.getElementById('c-create-btn').innerHTML = '<i class="fas fa-check"></i> Yaratish va e\u2018lon qilish';
    document.getElementById('c-cancel-edit-btn').style.display = 'none';
}

document.getElementById('c-cancel-edit-btn')?.addEventListener('click', resetContestForm);

document.getElementById('c-create-btn').addEventListener('click', async () => {
    const editId = document.getElementById('c-edit-id').value;
    const title = document.getElementById('c-title').value.trim();
    const desc = document.getElementById('c-desc').value.trim();
    const minAgeRaw = document.getElementById('c-min-age').value.trim();
    const maxAgeRaw = document.getElementById('c-max-age').value.trim();
    const gradesRaw = document.getElementById('c-grades').value.trim();
    const regStartDate = document.getElementById('c-reg-start').value || null;
    const regEndDate = document.getElementById('c-reg-end').value || null;
    const testDateStart = document.getElementById('c-test-date-start').value || null;
    const testDateEnd = document.getElementById('c-test-date-end').value || null;
    const testDailyStart = document.getElementById('c-test-daily-start').value || '08:00';
    const testDailyEnd = document.getElementById('c-test-daily-end').value || '18:00';
    const testBreakStart = document.getElementById('c-test-break-start').value || null;
    const testBreakEnd = document.getElementById('c-test-break-end').value || null;
    const testSlotMinutes = parseInt(document.getElementById('c-test-slot-minutes').value, 10) || 30;
    const testSlotCapacity = parseInt(document.getElementById('c-test-slot-capacity').value, 10) || 15;
    const interviewDateStart = document.getElementById('c-interview-date-start').value || null;
    const interviewDateEnd = document.getElementById('c-interview-date-end').value || null;
    const interviewDailyStart = document.getElementById('c-interview-daily-start').value || '09:00';
    const interviewDailyEnd = document.getElementById('c-interview-daily-end').value || '17:00';
    const interviewBreakStart = document.getElementById('c-interview-break-start').value || null;
    const interviewBreakEnd = document.getElementById('c-interview-break-end').value || null;
    const interviewSlotMinutes = parseInt(document.getElementById('c-interview-slot-minutes').value, 10) || 15;
    const interviewSlotCapacity = parseInt(document.getElementById('c-interview-slot-capacity').value, 10) || 1;
    const restrictViloyat = document.getElementById('c-restrict-viloyat').value || null;
    const restrictTuman = document.getElementById('c-restrict-tuman').value || null;
    const isPaid = document.getElementById('c-payment-type').value === 'paid';
    const paymentAmount = isPaid ? parseFloat(document.getElementById('c-payment-amount').value) || null : null;
    const paymentAccount = isPaid ? document.getElementById('c-payment-account').value.trim() || null : null;
    const paymentReceiver = isPaid ? document.getElementById('c-payment-receiver').value.trim() || null : null;
    if (!title) {
        setStatus('Tanlov nomini kiriting.', 'error');
        return;
    }

    // "5-9" yoki "5,6,7,8,9" ko'rinishini raqamlar ro'yxatiga aylantirish
    let grades = [];
    if (gradesRaw) {
        if (gradesRaw.includes('-')) {
            const [a, b] = gradesRaw.split('-').map((n) => parseInt(n.trim(), 10));
            if (!isNaN(a) && !isNaN(b)) {
                for (let i = Math.min(a, b); i <= Math.max(a, b); i++) grades.push(i);
            }
        } else {
            grades = gradesRaw
                .split(',')
                .map((n) => parseInt(n.trim(), 10))
                .filter((n) => !isNaN(n));
        }
    }

    const btn = document.getElementById('c-create-btn');
    btn.disabled = true;
    try {
        const payload = {
            title,
            description: desc,
            minAge: minAgeRaw ? parseInt(minAgeRaw, 10) : null,
            maxAge: maxAgeRaw ? parseInt(maxAgeRaw, 10) : null,
            grades,
            regStartDate,
            regEndDate,
            testDateStart,
            testDateEnd,
            testDailyStart,
            testDailyEnd,
            testBreakStart,
            testBreakEnd,
            testSlotMinutes,
            testSlotCapacity,
            interviewDateStart,
            interviewDateEnd,
            interviewDailyStart,
            interviewDailyEnd,
            interviewBreakStart,
            interviewBreakEnd,
            interviewSlotMinutes,
            interviewSlotCapacity,
            restrictViloyat,
            restrictTuman,
            isPaid,
            paymentAmount,
            paymentAccount,
            paymentReceiver,
        };
        if (editId) {
            await updateDoc(doc(db, 'contests', editId), payload);
            setStatus('Tanlov ma\u2019lumotlari yangilandi!', 'success');
        } else {
            const ref = doc(collection(db, 'contests'));
            await setDoc(ref, {
                ...payload,
                status: 'open',
                createdAt: serverTimestamp(),
            });
            setStatus('Tanlov yaratildi va e\u2018lon qilindi!', 'success');
        }
        resetContestForm();
        loadContests();
        loadStats();
    } catch (err) {
        console.error(err);
        setStatus('Xatolik yuz berdi.', 'error');
    } finally {
        btn.disabled = false;
    }
});

/* ── ISHTIROKCHILAR ── */
let currentRegistrants = [];
let currentContestTitle = '';
let currentContestId = '';
let currentContestMeta = {};

document.getElementById('reg-contest-select').addEventListener('change', async (e) => {
    const contestId = e.target.value;
    const contestTitle = e.target.options[e.target.selectedIndex]?.textContent || '';
    const tableEl = document.getElementById('registrantsTable');
    const exportBtn = document.getElementById('export-excel-btn');
    const photoRosterBtn = document.getElementById('photo-roster-btn');
    const publishBtn = document.getElementById('publish-leaderboard-btn');
    const autoScheduleBtn = document.getElementById('auto-schedule-btn');
    const autoScheduleStatus = document.getElementById('auto-schedule-status');
    currentContestId = contestId;
    if (!contestId) {
        tableEl.innerHTML = '<div class="empty">Yuqorida tanlov tanlang</div>';
        if (exportBtn) exportBtn.style.display = 'none';
        if (photoRosterBtn) photoRosterBtn.style.display = 'none';
        if (publishBtn) publishBtn.style.display = 'none';
        if (autoScheduleBtn) autoScheduleBtn.style.display = 'none';
        if (autoScheduleStatus) autoScheduleStatus.textContent = '';
        return;
    }
    tableEl.innerHTML = '<div class="empty">Yuklanmoqda...</div>';
    if (exportBtn) exportBtn.style.display = 'none';
    if (photoRosterBtn) photoRosterBtn.style.display = 'none';
    if (publishBtn) publishBtn.style.display = 'none';
    if (autoScheduleBtn) autoScheduleBtn.style.display = 'none';
    if (autoScheduleStatus) autoScheduleStatus.textContent = '';
    try {
        const snap = await getDocs(
            query(collection(db, 'registrations'), where('contestId', '==', contestId))
        );
        if (snap.empty) {
            tableEl.innerHTML = '<div class="empty">Bu tanlovga hali hech kim ro\u2018yxatdan o\u2018tmagan.</div>';
            currentRegistrants = [];
            return;
        }

        const list = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
        list.sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));

        currentRegistrants = list;
        currentContestTitle = contestTitle;
        if (exportBtn) exportBtn.style.display = '';
        if (photoRosterBtn) photoRosterBtn.style.display = '';
        if (publishBtn) publishBtn.style.display = '';
        if (autoScheduleBtn) autoScheduleBtn.style.display = '';
        const searchInput = document.getElementById('registrants-search');
        if (searchInput) searchInput.value = '';

        currentContestMeta = {};
        try {
            const [contestSnap, testSnap] = await Promise.all([
                getDoc(doc(db, 'contests', contestId)),
                getDoc(doc(db, 'tests', contestId)),
            ]);
            if (contestSnap.exists()) {
                const c = contestSnap.data();
                currentContestMeta.interviewMaxScore = c.interviewMaxScore || null;
            }
            if (testSnap.exists()) {
                const t = testSnap.data();
                const mcCount = (t.questions || []).filter((q) => q.type !== 'open').length;
                const openCount = (t.questions || []).filter((q) => q.type === 'open').length;
                const servedMc = t.mcQuestionsPerAttempt ? Math.min(t.mcQuestionsPerAttempt, mcCount) : mcCount;
                const servedOpen = t.openQuestionsPerAttempt ? Math.min(t.openQuestionsPerAttempt, openCount) : openCount;
                currentContestMeta.testMax = mcCount ? +(servedMc * (t.pointsPerCorrect || 1)).toFixed(2) : null;
                currentContestMeta.openMax = openCount ? +(servedOpen * (t.openMaxPointsPerQuestion || 5)).toFixed(2) : null;
            }
        } catch (err) {
            console.error('Ball chegaralarini yuklashda xatolik:', err);
        }

        renderRegistrantsTable(list);
    } catch (err) {
        console.error(err);
        tableEl.innerHTML = '<div class="empty">Yuklashda xatolik.</div>';
    }
});

function renderRegistrantsTable(list) {
    const tableEl = document.getElementById('registrantsTable');
    if (!list.length) {
        tableEl.innerHTML = '<div class="empty">Mos ishtirokchi topilmadi.</div>';
        return;
    }
    const meta = currentContestMeta || {};
    const metaBits = [];
    if (meta.testMax) metaBits.push(`Test uchun maksimal: ${meta.testMax} ball`);
    if (meta.openMax) metaBits.push(`Ochiq savollar uchun maksimal: ${meta.openMax} ball`);
    if (meta.interviewMaxScore) metaBits.push(`Suhbat uchun maksimal: ${meta.interviewMaxScore} ball`);
    const metaLine = metaBits.length
        ? `<p style="color:var(--muted);font-size:0.78rem;margin:-4px 0 12px">${escapeHtml(metaBits.join(' \u00b7 '))}</p>`
        : '';

    const anyPayment = list.some((r) => r.paymentStatus !== null && r.paymentStatus !== undefined);
    const bulkPaymentBox = anyPayment
        ? `<div style="background:var(--primary-light);border-radius:12px;padding:14px;margin-bottom:14px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap">
                <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem"><input type="checkbox" id="payment-select-all" style="width:auto"> Hammasini tanlash</label>
                <button class="btn btn-green" id="bulk-mark-paid-btn" style="font-size:12px"><i class="fas fa-check-double"></i> Tanlanganlarni "To'landi" deb belgilash</button>
            </div>
            <details>
                <summary style="cursor:pointer;font-size:0.85rem;font-weight:700;color:var(--primary)">Bank ko'chirmasi bo'yicha avtomatik belgilash (ko'plab ishtirokchi uchun)</summary>
                <p style="color:var(--muted);font-size:0.78rem;margin:8px 0">Har bir ishtirokchining shaxsiy to'lov kodi kvitansiyasida ko'rsatilgan (masalan <code>TOLOV-${escapeHtml(list[0]?.customId || 'ID')}</code>). Bank ilovasidan barcha o'tkazmalar izohi/tarixi matnini nusxalab shu yerga joylashtiring — tizim kodlarni qidirib, mos kelganlarni avtomatik "to'landi" deb belgilaydi.</p>
                <textarea id="bank-statement-text" rows="5" placeholder="Bank ko'chirmasidan nusxalangan matn..." style="width:100%;padding:10px;border-radius:8px;border:1px solid var(--border);font-family:monospace;font-size:12px"></textarea>
                <button class="btn btn-primary" id="match-payments-btn" style="margin-top:8px;font-size:12px"><i class="fas fa-magnifying-glass"></i> Kodlarni qidirib belgilash</button>
                <p id="match-payments-status" style="font-size:0.78rem;margin-top:6px;color:var(--muted)"></p>
            </details>
        </div>`
        : '';

    let rows = '';
    list.forEach((r, i) => {
        const total = (r.score ?? 0) + (r.interviewScore ?? 0) + (r.openScore ?? 0);
        const retakeLabel = r.retakeUntil ? `Ruxsat: ${escapeHtml(formatDateTime(r.retakeUntil))}` : 'Yo\u2018q';
        const hasPayment = r.paymentStatus !== null && r.paymentStatus !== undefined;
        const isPaid = r.paymentStatus === 'paid';
        const paymentCode = hasPayment ? `TOLOV-${r.customId}` : '';
        rows += `<tr data-row="${r.id}">
            <td>${hasPayment ? `<input type="checkbox" class="payment-row-check" data-id="${r.id}" style="width:auto">` : ''}</td>
            <td>${i + 1}</td>
            <td>${r.photoUrl ? `<img src="${r.photoUrl}" alt="" style="width:32px;height:32px;object-fit:cover;border-radius:8px;vertical-align:middle;margin-right:6px">` : ''}${escapeHtml(r.fullName)}</td>
            <td><b>${escapeHtml(r.customId)}</b></td>
            <td>${escapeHtml(r.maktab)}${(r.viloyat || r.tuman) ? `<br><span style="color:var(--muted);font-size:0.75rem">${escapeHtml([r.tuman, r.viloyat].filter(Boolean).join(', '))}</span>` : ''}</td>
            <td>${escapeHtml(r.yosh)}</td>
            <td>${escapeHtml(r.telefon)}</td>
            <td><input type="number" step="0.1" data-score="${r.id}" value="${r.score ?? ''}" placeholder="—" title="${meta.testMax ? 'Maksimal: ' + meta.testMax : ''}" style="width:64px"></td>
            <td><input type="number" step="0.1" data-interview="${r.id}" value="${r.interviewScore ?? ''}" placeholder="—" title="${meta.interviewMaxScore ? 'Maksimal: ' + meta.interviewMaxScore : ''}" style="width:64px"></td>
            <td><input type="number" step="0.1" data-open="${r.id}" value="${r.openScore ?? ''}" placeholder="—" title="${meta.openMax ? 'Maksimal: ' + meta.openMax : ''}" style="width:64px"></td>
            <td><b data-total="${r.id}">${total || '\u2014'}</b></td>
            <td>${hasPayment ? `<button class="btn ${isPaid ? 'btn-green' : 'btn-red'}" data-toggle-payment="${r.id}" data-next="${isPaid ? 'kutilmoqda' : 'paid'}" style="font-size:11px;padding:6px 10px" title="Kod: ${paymentCode}">${isPaid ? '\u2705 To\u2018landi' : '\u23f3 Kutilmoqda'}</button><br><span style="font-size:10px;color:var(--muted)">${paymentCode}</span>` : '\u2014'}</td>
            <td style="white-space:nowrap">
                <button class="btn btn-primary" data-save="${r.id}" title="Saqlash"><i class="fas fa-save"></i></button>
                <button class="btn" data-view-open="${r.id}" title="Ochiq savollarga javoblarni ko'rish" style="background:var(--primary-light);color:var(--primary);box-shadow:none"><i class="fas fa-eye"></i></button>
                <button class="btn" data-retake="${r.id}" title="Testni qayta topshirishga ruxsat berish" style="background:var(--primary-light);color:var(--primary);box-shadow:none"><i class="fas fa-rotate"></i></button>
            </td>
        </tr>
        <tr data-retake-info="${r.id}"><td colspan="13" style="border-bottom:1px solid var(--border);font-size:0.75rem;color:var(--muted);padding-top:0">
            <i class="fas fa-rotate"></i> Qayta topshirish ruxsati: <span data-retake-label="${r.id}">${retakeLabel}</span>
        </td></tr>
        <tr data-open-answers-row="${r.id}" style="display:none"><td colspan="13" style="border-bottom:1px solid var(--border);font-size:0.82rem;padding:10px 6px">
            <div data-open-answers-content="${r.id}">Yuklanmoqda...</div>
        </td></tr>`;
    });
    tableEl.innerHTML = `${metaLine}${bulkPaymentBox}<table>
        <thead><tr><th></th><th>№</th><th>F.I.Sh</th><th>ID</th><th>Maktabi</th><th>Yoshi</th><th>Telefon raqami</th><th>Test</th><th>Suhbat</th><th>Ochiq</th><th>Jami</th><th>To'lov</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
    </table>`;

    document.getElementById('payment-select-all')?.addEventListener('change', (e) => {
        tableEl.querySelectorAll('.payment-row-check').forEach((cb) => (cb.checked = e.target.checked));
    });

    document.getElementById('bulk-mark-paid-btn')?.addEventListener('click', async () => {
        const ids = Array.from(tableEl.querySelectorAll('.payment-row-check:checked')).map((cb) => cb.dataset.id);
        if (!ids.length) {
            setStatus('Avval kamida bitta ishtirokchini tanlang.', 'error');
            return;
        }
        if (!confirm(`${ids.length} ta ishtirokchini "To'landi" deb belgilamoqchimisiz?`)) return;
        try {
            const chunks = [];
            for (let i = 0; i < ids.length; i += 400) chunks.push(ids.slice(i, i + 400));
            for (const chunk of chunks) {
                const batch = writeBatch(db);
                chunk.forEach((id) => batch.update(doc(db, 'registrations', id), { paymentStatus: 'paid' }));
                await batch.commit();
            }
            ids.forEach((id) => {
                const cached = currentRegistrants.find((x) => x.id === id);
                if (cached) cached.paymentStatus = 'paid';
            });
            setStatus(`${ids.length} ta ishtirokchi "To'landi" deb belgilandi.`, 'success');
            renderRegistrantsTable(currentRegistrants);
        } catch (err) {
            console.error(err);
            setStatus('Xatolik yuz berdi.', 'error');
        }
    });

    document.getElementById('match-payments-btn')?.addEventListener('click', async () => {
        const text = document.getElementById('bank-statement-text').value;
        const statusEl = document.getElementById('match-payments-status');
        if (!text.trim()) {
            statusEl.textContent = 'Avval bank ko\u2018chirmasi matnini joylashtiring.';
            statusEl.style.color = 'var(--red)';
            return;
        }
        const matchedIds = currentRegistrants
            .filter((r) => r.paymentStatus && r.paymentStatus !== 'paid')
            .filter((r) => text.toUpperCase().includes(`TOLOV-${r.customId}`.toUpperCase()));
        if (!matchedIds.length) {
            statusEl.textContent = 'Hech qanday mos kod topilmadi.';
            statusEl.style.color = 'var(--red)';
            return;
        }
        try {
            const chunks = [];
            for (let i = 0; i < matchedIds.length; i += 400) chunks.push(matchedIds.slice(i, i + 400));
            for (const chunk of chunks) {
                const batch = writeBatch(db);
                chunk.forEach((r) => batch.update(doc(db, 'registrations', r.id), { paymentStatus: 'paid' }));
                await batch.commit();
            }
            matchedIds.forEach((r) => (r.paymentStatus = 'paid'));
            statusEl.textContent = `${matchedIds.length} ta ishtirokchi kod bo\u2018yicha topilib, "to\u2018landi" deb belgilandi.`;
            statusEl.style.color = 'var(--green)';
            renderRegistrantsTable(currentRegistrants);
        } catch (err) {
            console.error(err);
            statusEl.textContent = 'Xatolik yuz berdi.';
            statusEl.style.color = 'var(--red)';
        }
    });

    tableEl.querySelectorAll('[data-save]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.save;
            const scoreInput = tableEl.querySelector(`[data-score="${id}"]`);
            const interviewInput = tableEl.querySelector(`[data-interview="${id}"]`);
            const openInput = tableEl.querySelector(`[data-open="${id}"]`);
            const score = scoreInput.value === '' ? null : parseFloat(scoreInput.value);
            const interviewScore = interviewInput.value === '' ? null : parseFloat(interviewInput.value);
            const openScore = openInput.value === '' ? null : parseFloat(openInput.value);
            btn.disabled = true;
            try {
                await updateDoc(doc(db, 'registrations', id), { score, interviewScore, openScore });
                // Jami ustunini sahifani qayta yuklamasdan darhol yangilaymiz
                const totalEl = tableEl.querySelector(`[data-total="${id}"]`);
                const newTotal = (score ?? 0) + (interviewScore ?? 0) + (openScore ?? 0);
                if (totalEl) totalEl.textContent = newTotal || '\u2014';
                const cached = currentRegistrants.find((x) => x.id === id);
                if (cached) {
                    cached.score = score;
                    cached.interviewScore = interviewScore;
                    cached.openScore = openScore;
                }
                setStatus('Ballar saqlandi.', 'success');
            } catch (err) {
                console.error(err);
                setStatus('Xatolik yuz berdi.', 'error');
            } finally {
                btn.disabled = false;
            }
        });
    });

    tableEl.querySelectorAll('[data-view-open]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.viewOpen;
            const row = tableEl.querySelector(`[data-open-answers-row="${id}"]`);
            const content = tableEl.querySelector(`[data-open-answers-content="${id}"]`);
            if (!row) return;
            const isHidden = row.style.display === 'none';
            row.style.display = isHidden ? '' : 'none';
            if (!isHidden || content.dataset.loaded) return;
            content.dataset.loaded = '1';
            try {
                const reg = currentRegistrants.find((x) => x.id === id);
                if (!reg) throw new Error('Ishtirokchi topilmadi');
                const [testSnap, attemptSnap] = await Promise.all([
                    getDoc(doc(db, 'tests', reg.contestId)),
                    getDoc(doc(db, 'test-attempts', id)),
                ]);
                if (!attemptSnap.exists() || !attemptSnap.data().questionOrder) {
                    content.innerHTML = '<span style="color:var(--muted)">Bu ishtirokchi testni hali topshirmagan.</span>';
                    return;
                }
                const attempt = attemptSnap.data();
                const testDoc = testSnap.exists() ? testSnap.data() : { questions: [] };
                const openPairs = [];
                (attempt.questionOrder || []).forEach((origIdx, qi) => {
                    const q = testDoc.questions?.[origIdx];
                    if (q && q.type === 'open') {
                        openPairs.push({ text: q.text, answer: attempt.answers?.[qi] || '' });
                    }
                });
                if (!openPairs.length) {
                    content.innerHTML = '<span style="color:var(--muted)">Bu testda ochiq savol yo\u2018q edi.</span>';
                    return;
                }
                content.innerHTML = openPairs
                    .map(
                        (p, idx) => `<div style="margin-bottom:8px"><b>${idx + 1}. ${escapeHtml(p.text)}</b><br><span style="color:var(--text)">${escapeHtml(p.answer) || '<i style="color:var(--muted)">(javob berilmagan)</i>'}</span></div>`
                    )
                    .join('');
            } catch (err) {
                console.error(err);
                content.innerHTML = '<span style="color:var(--red)">Yuklashda xatolik yuz berdi.</span>';
            }
        });
    });

    tableEl.querySelectorAll('[data-toggle-payment]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.togglePayment;
            const next = btn.dataset.next;
            btn.disabled = true;
            try {
                await updateDoc(doc(db, 'registrations', id), { paymentStatus: next });
                const cached = currentRegistrants.find((x) => x.id === id);
                if (cached) cached.paymentStatus = next;
                renderRegistrantsTable(currentRegistrants);
                setStatus(next === 'paid' ? 'To\u2018lov tasdiqlandi.' : 'To\u2018lov holati "kutilmoqda"ga qaytarildi.', 'success');
            } catch (err) {
                console.error(err);
                setStatus('Xatolik yuz berdi.', 'error');
                btn.disabled = false;
            }
        });
    });

    tableEl.querySelectorAll('[data-retake]').forEach((btn) => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.retake;
            const input = prompt('Ishtirokchi testni qaysi sanagacha qayta topshira olishi mumkin? (masalan: 2026-08-15 18:00). Bekor qilish uchun bo\u2018sh qoldirib OK bosing.');
            if (input === null) return;
            let retakeUntil = input.trim() || null;
            if (retakeUntil && !retakeUntil.includes('T')) {
                // "YYYY-MM-DD HH:mm" ko'rinishini test.js bilan bir xil formatga keltiramiz
                retakeUntil = retakeUntil.replace(' ', 'T');
                if (!/T\d{2}:\d{2}/.test(retakeUntil)) retakeUntil += 'T23:59';
            }
            btn.disabled = true;
            try {
                await updateDoc(doc(db, 'registrations', id), { retakeUntil });
                const labelEl = tableEl.querySelector(`[data-retake-label="${id}"]`);
                if (labelEl) labelEl.textContent = retakeUntil ? `Ruxsat: ${formatDateTime(retakeUntil)}` : 'Yo\u2018q';
                const cached = currentRegistrants.find((x) => x.id === id);
                if (cached) cached.retakeUntil = retakeUntil;
                setStatus(retakeUntil ? 'Qayta topshirish ruxsati berildi.' : 'Qayta topshirish ruxsati bekor qilindi.', 'success');
            } catch (err) {
                console.error(err);
                setStatus('Xatolik yuz berdi.', 'error');
            } finally {
                btn.disabled = false;
            }
        });
    });
}

document.getElementById('registrants-search')?.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    if (!currentRegistrants.length) return;
    if (!q) {
        renderRegistrantsTable(currentRegistrants);
        return;
    }
    const filtered = currentRegistrants.filter((r) =>
        [r.fullName, r.customId, r.maktab, r.viloyat, r.tuman, r.telefon].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    );
    renderRegistrantsTable(filtered);
});

function toLocalInputValue(d) {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Berilgan sana oralig'ida (dateStart..dateEnd), har kuni faqat (dailyStart..dailyEnd) soatlari ichida,
// tanaffusni (breakStart..breakEnd) chetlab o'tib, "slotMinutes" davomiyligidagi barcha mumkin bo'lgan
// vaqt slotlarini generatsiya qiladi. Masalan: 25.07–30.07, har kuni 08:00–18:00, tanaffus 12:00–13:00.
function generateDailySlots(dateStartStr, dateEndStr, dailyStartStr, dailyEndStr, breakStartStr, breakEndStr, slotMinutes) {
    const slots = [];
    if (!dateStartStr || !dateEndStr || !dailyStartStr || !dailyEndStr) return slots;
    const slotMs = Math.max(5, slotMinutes) * 60000;
    const dayCursor = new Date(`${dateStartStr}T00:00`);
    const lastDay = new Date(`${dateEndStr}T00:00`);
    const pad = (n) => String(n).padStart(2, '0');

    while (dayCursor <= lastDay) {
        const dayStr = `${dayCursor.getFullYear()}-${pad(dayCursor.getMonth() + 1)}-${pad(dayCursor.getDate())}`;
        let slotStart = new Date(`${dayStr}T${dailyStartStr}`);
        const dayEnd = new Date(`${dayStr}T${dailyEndStr}`);
        const breakStart = breakStartStr ? new Date(`${dayStr}T${breakStartStr}`) : null;
        const breakEnd = breakEndStr ? new Date(`${dayStr}T${breakEndStr}`) : null;

        while (slotStart.getTime() + slotMs <= dayEnd.getTime()) {
            const slotEnd = new Date(slotStart.getTime() + slotMs);
            const overlapsBreak = breakStart && breakEnd && slotStart < breakEnd && slotEnd > breakStart;
            if (!overlapsBreak) {
                slots.push({ start: new Date(slotStart), end: new Date(slotEnd) });
            }
            slotStart = slotEnd;
        }
        dayCursor.setDate(dayCursor.getDate() + 1);
    }
    return slots;
}

// Slotlar ro'yxatidan ishtirokchilarga navbat bilan (bitta slotda "capacity" tagacha kishi) taqsimlaydi.
// Agar ishtirokchilar sig'imidan ko'p bo'lsa, oxirgi slotga zichlashtiriladi va ogohlantirish qaytariladi.
function assignFromSlots(slots, capacity, count) {
    const assignments = [];
    if (!slots.length || !count) return { assignments, overflowed: false, totalSlots: slots.length };
    let slotIdx = 0;
    let usedInSlot = 0;
    let overflowed = false;
    for (let i = 0; i < count; i++) {
        if (slotIdx >= slots.length) {
            overflowed = true;
            slotIdx = slots.length - 1;
        }
        const slot = slots[slotIdx];
        assignments.push({ start: toLocalInputValue(slot.start), end: toLocalInputValue(slot.end) });
        usedInSlot++;
        if (usedInSlot >= Math.max(1, capacity)) {
            usedInSlot = 0;
            slotIdx++;
        }
    }
    return { assignments, overflowed, totalSlots: slots.length };
}

function buildScheduleAssignments(dateStart, dateEnd, dailyStart, dailyEnd, breakStart, breakEnd, slotMinutes, capacity, count) {
    const slots = generateDailySlots(dateStart, dateEnd, dailyStart, dailyEnd, breakStart, breakEnd, slotMinutes);
    return assignFromSlots(slots, capacity, count);
}

document.getElementById('auto-schedule-btn')?.addEventListener('click', async () => {
    if (!currentContestId || !currentRegistrants.length) return;
    const statusEl = document.getElementById('auto-schedule-status');
    const btn = document.getElementById('auto-schedule-btn');
    btn.disabled = true;
    statusEl.textContent = 'Hisoblanmoqda...';
    try {
        const contestSnap = await getDoc(doc(db, 'contests', currentContestId));
        if (!contestSnap.exists()) throw new Error('Tanlov topilmadi');
        const c = contestSnap.data();
        if (!c.testDateStart && !c.interviewDateStart) {
            statusEl.textContent = 'Avval "Tanlovlar" bo\u2018limida test va/yoki suhbat vaqti jadvalini kiriting.';
            statusEl.style.color = 'var(--red)';
            btn.disabled = false;
            return;
        }

        const n = currentRegistrants.length;
        const testResult = buildScheduleAssignments(c.testDateStart, c.testDateEnd, c.testDailyStart || '08:00', c.testDailyEnd || '18:00', c.testBreakStart, c.testBreakEnd, c.testSlotMinutes || 30, c.testSlotCapacity || 15, n);
        const interviewResult = buildScheduleAssignments(c.interviewDateStart, c.interviewDateEnd, c.interviewDailyStart || '09:00', c.interviewDailyEnd || '17:00', c.interviewBreakStart, c.interviewBreakEnd, c.interviewSlotMinutes || 15, c.interviewSlotCapacity || 1, n);

        // Suhbat biletlari (agar yuklangan va yoqilgan bo'lsa) — navbat bilan (round-robin) taqsimlanadi
        let ticketNumbers = [];
        try {
            const ticketsSnap = await getDoc(doc(db, 'interview-tickets', currentContestId));
            if (ticketsSnap.exists() && ticketsSnap.data().tickets?.length) {
                ticketNumbers = ticketsSnap.data().tickets.filter((t) => t.enabled !== false).map((t) => t.number);
            }
        } catch (err) {
            console.error('Biletlarni yuklashda xatolik:', err);
        }

        // Ishtirokchilarni ro'yxatdan o'tgan tartibda (eng birinchi bo'lib o'tganlar birinchi slotlarga) taqsimlaymiz
        const chunks = [];
        for (let i = 0; i < n; i += 400) chunks.push(currentRegistrants.slice(i, i + 400));

        let written = 0;
        for (const chunk of chunks) {
            const batch = writeBatch(db);
            chunk.forEach((r, localIdx) => {
                const globalIdx = written + localIdx;
                const payload = {};
                if (testResult.assignments[globalIdx]) {
                    payload.assignedTestStart = testResult.assignments[globalIdx].start;
                    payload.assignedTestEnd = testResult.assignments[globalIdx].end;
                }
                if (interviewResult.assignments[globalIdx]) {
                    payload.assignedInterviewStart = interviewResult.assignments[globalIdx].start;
                    payload.assignedInterviewEnd = interviewResult.assignments[globalIdx].end;
                }
                if (ticketNumbers.length) {
                    payload.assignedTicketNumber = ticketNumbers[globalIdx % ticketNumbers.length];
                }
                if (Object.keys(payload).length) batch.update(doc(db, 'registrations', r.id), payload);
                Object.assign(r, payload); // mahalliy keshni ham yangilaymiz
            });
            await batch.commit();
            written += chunk.length;
        }

        let msg = `${n} ta ishtirokchiga vaqt biriktirildi.`;
        if (testResult.assignments.length) msg += ` Test uchun ${testResult.totalSlots} ta mavjud slotdan foydalanildi.`;
        if (interviewResult.assignments.length) msg += ` Suhbat uchun ${interviewResult.totalSlots} ta mavjud slotdan foydalanildi.`;
        if (ticketNumbers.length) msg += ` Suhbat biletlari ham ${ticketNumbers.length} tadan navbat bilan biriktirildi.`;
        if (testResult.overflowed || interviewResult.overflowed) {
            msg += ' Diqqat: ishtirokchilar soni belgilangan kun/soatlar doirasidagi barcha slotlardan ko\u2018p \u2014 ba\u2018zi ishtirokchilar oxirgi slotga zichlashtirildi. Kunlar oralig\u2018ini kengaytiring yoki slot sig\u2018imini oshiring.';
            statusEl.style.color = 'var(--orange)';
        } else {
            statusEl.style.color = 'var(--green)';
        }
        statusEl.textContent = msg;
    } catch (err) {
        console.error(err);
        statusEl.textContent = 'Xatolik yuz berdi.';
        statusEl.style.color = 'var(--red)';
    } finally {
        btn.disabled = false;
    }
});

document.getElementById('publish-leaderboard-btn')?.addEventListener('click', async () => {
    if (!currentRegistrants.length || !currentContestId) return;

    const withTotal = currentRegistrants
        .map((r) => ({ ...r, total: (r.score ?? null) === null && (r.interviewScore ?? null) === null && (r.openScore ?? null) === null ? null : (r.score ?? 0) + (r.interviewScore ?? 0) + (r.openScore ?? 0) }))
        .filter((r) => r.total !== null);
    if (!withTotal.length) {
        setStatus('Hech kimga ball qo\u2018yilmagan. Avval test yoki suhbat ballini kiriting.', 'error');
        return;
    }
    if (!confirm(`"${currentContestTitle}" uchun g\u2018oliblar reytingi e\u2018lon qilinsinmi? Bu barcha foydalanuvchilarga ochiq bo\u2018ladi.`)) return;

    const btn = document.getElementById('publish-leaderboard-btn');
    btn.disabled = true;
    try {
        const sorted = [...withTotal].sort((a, b) => b.total - a.total);
        const entries = sorted.map((r, i) => ({
            rank: i + 1,
            fullName: r.fullName,
            maktab: r.maktab,
            customId: r.customId,
            score: r.total,
            testScore: r.score ?? null,
            interviewScore: r.interviewScore ?? null,
        }));

        await setDoc(doc(db, 'leaderboards', currentContestId), {
            contestTitle: currentContestTitle,
            publishedAt: serverTimestamp(),
            entries,
        });

        const batch = writeBatch(db);
        sorted.forEach((r, i) => {
            batch.update(doc(db, 'registrations', r.id), { rank: i + 1 });
        });
        await batch.commit();

        setStatus('G\u2018oliblar reytingi e\u2018lon qilindi!', 'success');
    } catch (err) {
        console.error(err);
        setStatus('Xatolik yuz berdi.', 'error');
    } finally {
        btn.disabled = false;
    }
});

document.getElementById('photo-roster-btn')?.addEventListener('click', () => {
    // Eslatma: bepul Excel kutubxonasi (SheetJS community) rasmlarni katakka joylashtirishni
    // qo'llab-quvvatlamaydi, shuning uchun rasmlar bilan chop etish uchun alohida sahifa ochamiz.
    const rowsHtml = currentRegistrants
        .map(
            (r) => `<div style="display:flex;align-items:center;gap:14px;padding:10px;border-bottom:1px solid #e2e8f0;break-inside:avoid">
                ${r.photoUrl ? `<img src="${r.photoUrl}" style="width:64px;height:64px;object-fit:cover;border-radius:10px;border:1px solid #cbd5e1">` : '<div style="width:64px;height:64px;border-radius:10px;background:#f1f5f9;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:11px">rasm yo\u2018q</div>'}
                <div>
                    <div style="font-weight:800;font-size:15px">${escapeHtml(r.fullName)}</div>
                    <div style="font-size:12.5px;color:#64748b">ID: <b>${escapeHtml(r.customId)}</b> \u00b7 ${escapeHtml(r.maktab || '')}</div>
                </div>
            </div>`
        )
        .join('');
    const html = `<!DOCTYPE html><html lang="uz"><head><meta charset="UTF-8"><title>${escapeHtml(currentContestTitle)} — rasmli ro'yxat</title>
        <style>body{font-family:Arial,Helvetica,sans-serif;margin:24px;color:#1e293b} h1{font-size:20px;margin-bottom:16px}</style>
        </head><body>
        <h1>${escapeHtml(currentContestTitle)} — Ishtirokchilar ro'yxati (${currentRegistrants.length} kishi)</h1>
        ${rowsHtml}
        <script>window.onload = () => setTimeout(() => window.print(), 300);</script>
        </body></html>`;
    const w = window.open('', '_blank');
    if (!w) {
        setStatus('Yangi oyna ochilmadi — brauzeringizda popup blokerini o\u2018chiring.', 'error');
        return;
    }
    w.document.write(html);
    w.document.close();
});

document.getElementById('export-excel-btn')?.addEventListener('click', () => {
    if (!currentRegistrants.length || !window.XLSX) return;
    const rows = currentRegistrants.map((r, i) => ({
        '№': i + 1,
        'F.I.Sh': r.fullName,
        ID: r.customId,
        Viloyat: r.viloyat || '',
        'Tuman/shahar': r.tuman || '',
        Maktabi: r.maktab,
        Yoshi: r.yosh,
        'Telefon raqami': r.telefon,
        Test: r.score ?? '',
        Suhbat: r.interviewScore ?? '',
        'Ochiq savollar': r.openScore ?? '',
        Jami: (r.score ?? 0) + (r.interviewScore ?? 0) + (r.openScore ?? 0),
        'To\'lov holati': r.paymentStatus === 'paid' ? 'To\'landi' : r.paymentStatus ? 'Kutilmoqda' : '',
    }));
    const ws = window.XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 5 }, { wch: 28 }, { wch: 14 }, { wch: 22 }, { wch: 22 }, { wch: 28 }, { wch: 8 }, { wch: 16 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 12 }];
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb, ws, 'Ishtirokchilar');
    const safeTitle = (currentContestTitle || 'tanlov').replace(/[^\p{L}\p{N}]+/gu, '_').slice(0, 40);
    window.XLSX.writeFile(wb, `${safeTitle}_ishtirokchilar.xlsx`);
});

/* ── BILDIRISHNOMA ── */
/* ── BILDIRISHNOMA ── */
document.getElementById('n-template-select')?.addEventListener('change', (e) => {
    const textarea = document.getElementById('n-text');
    const title = currentContestTitle || '[tanlov nomi]';
    if (e.target.value === 'winners') {
        textarea.value = `🏆 "${title}" tanlovi natijalari e'lon qilindi! G'oliblarni "G'oliblar" bo'limida ko'rishingiz mumkin. Barcha ishtirokchilarga rahmat!`;
    } else if (e.target.value === 'new-contest') {
        textarea.value = `📢 Yangi tanlov boshlandi: "${title}"! Ro'yxatdan o'tish uchun "Tanlov" bo'limiga o'ting.`;
    }
});

document.getElementById('n-send-btn').addEventListener('click', async () => {
    const text = document.getElementById('n-text').value.trim();
    if (!text) {
        setStatus('Xabar matnini kiriting.', 'error');
        return;
    }
    const btn = document.getElementById('n-send-btn');
    btn.disabled = true;
    try {
        const ref = doc(collection(db, 'notifications'));
        await setDoc(ref, { text, createdAt: serverTimestamp() });
        document.getElementById('n-text').value = '';
        setStatus('Bildirishnoma yuborildi!', 'success');
        loadNotifications();
        if (window.ZiyomapFirestoreNotify) ZiyomapFirestoreNotify.sync();
    } catch (err) {
        console.error(err);
        setStatus('Xatolik yuz berdi.', 'error');
    } finally {
        btn.disabled = false;
    }
});

async function loadNotifications() {
    const listEl = document.getElementById('notifyList');
    try {
        const snap = await getDocs(query(collection(db, 'notifications'), orderBy('createdAt', 'desc'), limit(20)));
        if (snap.empty) {
            listEl.innerHTML = '<div class="empty">Hali xabar yuborilmagan.</div>';
            return;
        }
        let html = '';
        snap.forEach((d) => {
            html += `<div class="admin-row"><span>${escapeHtml(d.data().text)}</span>
                <button class="btn btn-red" data-del-notif="${d.id}"><i class="fas fa-trash"></i></button></div>`;
        });
        listEl.innerHTML = html;
        listEl.querySelectorAll('[data-del-notif]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                if (!confirm('O\u2018chirilsinmi?')) return;
                await deleteDoc(doc(db, 'notifications', btn.dataset.delNotif));
                loadNotifications();
            });
        });
    } catch (err) {
        console.error(err);
        listEl.innerHTML = '<div class="empty">Yuklashda xatolik.</div>';
    }
}

/* ── FOYDALANUVCHILAR ── */
async function loadUsers() {
    const tableEl = document.getElementById('usersTable');
    try {
        const snap = await getDocs(query(collection(db, 'users'), orderBy('lastSeen', 'desc'), limit(200)));
        if (snap.empty) {
            tableEl.innerHTML = '<div class="empty">Hali hech kim qayd etilmagan.</div>';
            return;
        }
        let rows = '';
        snap.forEach((d) => {
            const u = d.data();
            const blocked = !!u.blocked;
            rows += `<tr>
                <td>${escapeHtml(u.displayName || '—')}</td>
                <td>${escapeHtml(u.email || '—')}</td>
                <td>${blocked ? '<span class="badge closed">BLOKLANGAN</span>' : '<span class="badge open">FAOL</span>'}</td>
                <td><button class="btn ${blocked ? 'btn-green' : 'btn-red'}" data-block="${d.id}" data-next="${blocked ? 'false' : 'true'}">
                    <i class="fas ${blocked ? 'fa-unlock' : 'fa-ban'}"></i> ${blocked ? 'Blokdan chiqarish' : 'Bloklash'}
                </button></td>
            </tr>`;
        });
        tableEl.innerHTML = `<table>
            <thead><tr><th>Ism</th><th>Email</th><th>Holati</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
        </table>`;

        tableEl.querySelectorAll('[data-block]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                btn.disabled = true;
                try {
                    await updateDoc(doc(db, 'users', btn.dataset.block), { blocked: btn.dataset.next === 'true' });
                    loadUsers();
                } catch (err) {
                    console.error(err);
                    setStatus('Xatolik yuz berdi.', 'error');
                    btn.disabled = false;
                }
            });
        });
    } catch (err) {
        console.error(err);
        tableEl.innerHTML = '<div class="empty">Yuklashda xatolik.</div>';
    }
}

/* ── SAYT KONTENTI ── */
async function loadSiteContent() {
    try {
        const snap = await getDoc(doc(db, 'site-content', 'homepage'));
        if (snap.exists()) {
            const data = snap.data();
            document.getElementById('content-photo-url').value = data.heroPhotoUrl || '';
            document.getElementById('content-bio-text').value = data.heroBio || '';
        }
    } catch (err) {
        console.error(err);
    }
}

document.getElementById('content-save-btn')?.addEventListener('click', async () => {
    const heroPhotoUrl = document.getElementById('content-photo-url').value.trim();
    const heroBio = document.getElementById('content-bio-text').value.trim();
    const btn = document.getElementById('content-save-btn');
    btn.disabled = true;
    try {
        await setDoc(doc(db, 'site-content', 'homepage'), { heroPhotoUrl, heroBio }, { merge: true });
        setStatus('Saqlandi! Bosh sahifada bir necha soniyada yangilanadi.', 'success');
    } catch (err) {
        console.error(err);
        setStatus('Xatolik yuz berdi.', 'error');
    } finally {
        btn.disabled = false;
    }
});

/* ── TESTLAR ── */
function parseQuestions(raw) {
    const blocks = raw
        .split(/^---$/m)
        .map((b) => b.trim())
        .filter(Boolean);
    const questions = [];
    blocks.forEach((block, idx) => {
        const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
        if (lines.length < 2) return;
        const text = lines[0];
        let imageUrl = null;
        let difficulty = "o'rta";
        let isOpen = false;
        const options = [];
        let correctIndex = -1;
        lines.slice(1).forEach((line) => {
            const imgMatch = line.match(/^Rasm:\s*(\S+)/i);
            if (imgMatch) {
                imageUrl = imgMatch[1].trim();
                return;
            }
            const typeMatch = line.match(/^Turi:\s*(ochiq|yopiq)/i);
            if (typeMatch) {
                isOpen = typeMatch[1].toLowerCase() === 'ochiq';
                return;
            }
            const diffMatch = line.match(/^Daraja:\s*(oson|o'rta|o\u2018rta|orta|qiyin)/i);
            if (diffMatch) {
                let d = diffMatch[1].toLowerCase().replace('o\u2018rta', "o'rta").replace('orta', "o'rta");
                difficulty = d;
                return;
            }
            const optMatch = line.match(/^([A-D])\)\s*(.+)$/i);
            if (optMatch) {
                options.push(optMatch[2].trim());
                return;
            }
            const ansMatch = line.match(/^Javob:\s*([A-D])/i);
            if (ansMatch) {
                correctIndex = 'ABCD'.indexOf(ansMatch[1].toUpperCase());
            }
        });

        if (!text) return;
        if (isOpen) {
            const q = { id: 'q' + idx, text, type: 'open', difficulty };
            if (imageUrl) q.imageUrl = imageUrl;
            questions.push(q);
        } else if (options.length === 4 && correctIndex >= 0) {
            const q = { id: 'q' + idx, text, type: 'mc', options, correctIndex, difficulty };
            if (imageUrl) q.imageUrl = imageUrl;
            questions.push(q);
        }
    });
    return questions;
}

// Saqlangan savollar tuzilmasidan tahrirlash uchun matn qayta tiklanadi
function questionsToRaw(questions) {
    return questions
        .map((q) => {
            const lines = [q.text];
            if (q.imageUrl) lines.push(`Rasm: ${q.imageUrl}`);
            if (q.difficulty && q.difficulty !== "o'rta") lines.push(`Daraja: ${q.difficulty}`);
            if (q.type === 'open') {
                lines.push('Turi: ochiq');
            } else {
                q.options.forEach((opt, i) => lines.push(`${'ABCD'[i]}) ${opt}`));
                lines.push(`Javob: ${'ABCD'[q.correctIndex] || 'A'}`);
            }
            return lines.join('\n');
        })
        .join('\n---\n');
}

function updatePointsPreview() {
    const previewEl = document.getElementById('t-points-preview');
    if (!previewEl) return;
    const raw = document.getElementById('t-questions').value;
    const pointsPerCorrect = parseFloat(document.getElementById('t-points-per-correct').value) || 1;
    const openMax = parseFloat(document.getElementById('t-open-max-points').value) || 5;
    const mcPerAttemptRaw = document.getElementById('t-mc-per-attempt').value.trim();
    const openPerAttemptRaw = document.getElementById('t-open-per-attempt').value.trim();
    const questions = parseQuestions(raw);
    if (!questions.length) {
        previewEl.textContent = '';
        return;
    }
    const mcTotal = questions.filter((q) => q.type !== 'open').length;
    const openTotal = questions.filter((q) => q.type === 'open').length;
    const mcServed = mcPerAttemptRaw ? Math.min(parseInt(mcPerAttemptRaw, 10), mcTotal) : mcTotal;
    const openServed = openPerAttemptRaw ? Math.min(parseInt(openPerAttemptRaw, 10), openTotal) : openTotal;
    const bits = [];
    if (mcTotal) bits.push(`${mcServed} ta yopiq savol beriladi (bazada ${mcTotal} ta) \u00d7 ${pointsPerCorrect} ball = jami ${(mcServed * pointsPerCorrect).toFixed(1).replace(/\.0$/, '')} ball`);
    if (openTotal) bits.push(`${openServed} ta ochiq savol beriladi (bazada ${openTotal} ta) \u00d7 max ${openMax} ball = maksimal ${(openServed * openMax).toFixed(1).replace(/\.0$/, '')} ball`);
    previewEl.textContent = bits.join(' \u00b7 ');
}
document.getElementById('t-questions')?.addEventListener('input', updatePointsPreview);
document.getElementById('t-points-per-correct')?.addEventListener('input', updatePointsPreview);
document.getElementById('t-open-max-points')?.addEventListener('input', updatePointsPreview);
document.getElementById('t-mc-per-attempt')?.addEventListener('input', updatePointsPreview);
document.getElementById('t-open-per-attempt')?.addEventListener('input', updatePointsPreview);

function resetTestForm() {
    document.getElementById('t-edit-id').value = '';
    document.getElementById('t-title').value = '';
    document.getElementById('t-questions').value = '';
    document.getElementById('t-time-limit').value = '20';
    document.getElementById('t-mc-per-attempt').value = '';
    document.getElementById('t-open-per-attempt').value = '';
    document.getElementById('t-points-per-correct').value = '1';
    document.getElementById('t-open-max-points').value = '5';
    document.getElementById('t-points-preview').textContent = '';
    document.getElementById('t-create-btn').innerHTML = '<i class="fas fa-check"></i> Testni yaratish va e\u2018lon qilish';
    document.getElementById('t-cancel-edit-btn').style.display = 'none';
}

document.getElementById('t-cancel-edit-btn')?.addEventListener('click', resetTestForm);

/* ── SUHBAT BILETLARI ── */
function parseTickets(raw) {
    const blocks = raw
        .split(/^---$/m)
        .map((b) => b.trim())
        .filter(Boolean);
    return blocks
        .map((block, idx) => {
            const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
            if (!lines.length) return null;
            let number = idx + 1;
            let startIdx = 0;
            const headerMatch = lines[0].match(/^Bilet\s*(\d+)/i);
            if (headerMatch) {
                number = parseInt(headerMatch[1], 10);
                startIdx = 1;
            }
            const questions = lines
                .slice(startIdx)
                .map((l) => l.replace(/^\d+[.)]\s*/, '').trim())
                .filter(Boolean);
            return questions.length ? { number, questions, enabled: true } : null;
        })
        .filter(Boolean);
}

// Saqlangan biletlar tuzilmasidan tahrirlash uchun matn qayta tiklanadi
function ticketsToRaw(tickets) {
    return tickets
        .map((t) => [`Bilet ${t.number}`, ...t.questions].join('\n'))
        .join('\n---\n');
}

document.getElementById('ticket-save-btn')?.addEventListener('click', async () => {
    const contestId = document.getElementById('ticket-contest-select').value;
    const raw = document.getElementById('ticket-questions').value;
    const statusEl = document.getElementById('ticket-save-status');
    if (!contestId) {
        setStatus('Tanlovni tanlang.', 'error');
        return;
    }
    const tickets = parseTickets(raw);
    if (!tickets.length) {
        statusEl.textContent = 'Biletlar formatida xatolik bor. Namunani tekshiring.';
        statusEl.style.color = 'var(--red)';
        return;
    }
    const btn = document.getElementById('ticket-save-btn');
    btn.disabled = true;
    try {
        await setDoc(doc(db, 'interview-tickets', contestId), { tickets, updatedAt: serverTimestamp() });
        statusEl.textContent = `${tickets.length} ta bilet saqlandi.`;
        statusEl.style.color = 'var(--green)';
        document.getElementById('ticket-questions').value = '';
        loadTickets(contestId);
    } catch (err) {
        console.error(err);
        statusEl.textContent = 'Xatolik yuz berdi.';
        statusEl.style.color = 'var(--red)';
    } finally {
        btn.disabled = false;
    }
});

async function loadTickets(contestId) {
    const listEl = document.getElementById('ticketsList');
    if (!listEl) return;
    if (!contestId) {
        listEl.innerHTML = '<div class="empty">Tanlov tanlanmagan.</div>';
        return;
    }
    listEl.innerHTML = '<div class="empty">Yuklanmoqda...</div>';
    try {
        const snap = await getDoc(doc(db, 'interview-tickets', contestId));
        if (!snap.exists() || !snap.data().tickets?.length) {
            listEl.innerHTML = '<div class="empty">Bu tanlov uchun hali bilet yuklanmagan.</div>';
            return;
        }
        const tickets = snap.data().tickets;
        listEl.innerHTML = tickets
            .map((t) => {
                const enabled = t.enabled !== false;
                return `<div class="admin-row"><span><b>Bilet ${escapeHtml(t.number)}</b> — ${t.questions.length} ta savol
                    <span class="badge ${enabled ? 'open' : 'closed'}" style="margin-left:6px">${enabled ? 'YOQILGAN' : 'YOPIQ'}</span></span>
                    <span style="display:flex;gap:8px">
                        <button class="btn ${enabled ? 'btn-red' : 'btn-green'}" data-toggle-ticket="${t.number}" title="${enabled ? 'Yopish' : 'Yoqish'}"><i class="fas ${enabled ? 'fa-lock' : 'fa-unlock'}"></i></button>
                        <button class="btn btn-primary" data-edit-ticket="${t.number}" title="Tahrirlash"><i class="fas fa-pen"></i></button>
                        <button class="btn btn-red" data-del-ticket="${t.number}" title="O'chirish"><i class="fas fa-trash"></i></button>
                    </span></div>`;
            })
            .join('');

        listEl.querySelectorAll('[data-toggle-ticket]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const updated = tickets.map((t) =>
                    String(t.number) === btn.dataset.toggleTicket ? { ...t, enabled: t.enabled === false } : t
                );
                await setDoc(doc(db, 'interview-tickets', contestId), { tickets: updated, updatedAt: serverTimestamp() });
                loadTickets(contestId);
            });
        });
        listEl.querySelectorAll('[data-edit-ticket]').forEach((btn) => {
            btn.addEventListener('click', () => {
                // Tahrirlash uchun BARCHA biletlarni matn maydoniga yuklaymiz — kerakli o'zgarishni
                // kiritib, "Biletlarni saqlash" tugmasi bilan qayta saqlash butun to'plamni yangilaydi.
                document.getElementById('ticket-questions').value = ticketsToRaw(tickets);
                document.getElementById('ticket-questions').scrollIntoView({ behavior: 'smooth', block: 'center' });
                document.getElementById('ticket-save-status').textContent = 'Kerakli biletni tahrirlab, "Biletlarni saqlash" tugmasini bosing (butun to\u2018plam qayta saqlanadi).';
                document.getElementById('ticket-save-status').style.color = 'var(--primary)';
            });
        });
        listEl.querySelectorAll('[data-del-ticket]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                if (!confirm('Bu biletni o\u2018chirmoqchimisiz?')) return;
                const remaining = tickets.filter((t) => String(t.number) !== btn.dataset.delTicket);
                await setDoc(doc(db, 'interview-tickets', contestId), { tickets: remaining, updatedAt: serverTimestamp() });
                loadTickets(contestId);
            });
        });
    } catch (err) {
        console.error(err);
        listEl.innerHTML = '<div class="empty">Yuklashda xatolik.</div>';
    }
}

document.getElementById('ticket-contest-select')?.addEventListener('change', (e) => {
    document.getElementById('ticket-questions').value = '';
    document.getElementById('ticket-save-status').textContent = '';
    loadTickets(e.target.value);
});

/* ── TAYYOR FAYLDAN BILETLARNI YUKLASH (.txt / .docx) ── */
document.getElementById('ticket-questions-file')?.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    const statusEl = document.getElementById('ticket-questions-file-status');
    const textarea = document.getElementById('ticket-questions');
    if (!file) return;
    statusEl.textContent = 'O\u2018qilmoqda...';
    statusEl.style.color = 'var(--muted)';
    try {
        let text = '';
        if (file.name.toLowerCase().endsWith('.docx')) {
            if (!window.mammoth) throw new Error('Fayl o\u2018qish kutubxonasi yuklanmadi. Internetga ulanishni tekshiring.');
            const arrayBuffer = await file.arrayBuffer();
            const result = await window.mammoth.extractRawText({ arrayBuffer });
            text = result.value;
        } else {
            text = await file.text();
        }
        const existing = textarea.value.trim();
        textarea.value = existing ? `${existing}\n---\n${text.trim()}` : text.trim();
        const parsed = parseTickets(textarea.value);
        statusEl.textContent = `Fayldan o\u2018qildi. Hozircha jami ${parsed.length} ta to\u2018g\u2018ri formatdagi bilet aniqlandi \u2014 pastdagi matnni tekshirib chiqing.`;
        statusEl.style.color = parsed.length ? 'var(--green)' : 'var(--red)';
        document.getElementById('ticket-questions-file').value = '';
    } catch (err) {
        console.error(err);
        statusEl.textContent = 'Faylni o\u2018qishda xatolik: ' + err.message;
        statusEl.style.color = 'var(--red)';
    }
});
document.getElementById('t-questions-file')?.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    const statusEl = document.getElementById('t-questions-file-status');
    const textarea = document.getElementById('t-questions');
    if (!file) return;
    statusEl.textContent = 'O\u2018qilmoqda...';
    statusEl.style.color = 'var(--muted)';
    try {
        let text = '';
        if (file.name.toLowerCase().endsWith('.docx')) {
            if (!window.mammoth) throw new Error('Fayl o\u2018qish kutubxonasi yuklanmadi. Internetga ulanishni tekshiring.');
            const arrayBuffer = await file.arrayBuffer();
            const result = await window.mammoth.extractRawText({ arrayBuffer });
            text = result.value;
        } else {
            text = await file.text();
        }
        const existing = textarea.value.trim();
        textarea.value = existing ? `${existing}\n---\n${text.trim()}` : text.trim();
        const parsed = parseQuestions(textarea.value);
        updatePointsPreview();
        statusEl.textContent = `Fayldan o\u2018qildi. Hozircha jami ${parsed.length} ta to\u2018g\u2018ri formatdagi savol aniqlandi \u2014 pastdagi matnni tekshirib chiqing.`;
        statusEl.style.color = parsed.length ? 'var(--green)' : 'var(--red)';
        document.getElementById('t-questions-file').value = '';
    } catch (err) {
        console.error(err);
        statusEl.textContent = 'Faylni o\u2018qishda xatolik: ' + err.message;
        statusEl.style.color = 'var(--red)';
    }
});

document.getElementById('t-download-questions-btn')?.addEventListener('click', () => {
    const text = document.getElementById('t-questions').value;
    if (!text.trim()) {
        setStatus('Yuklab olish uchun avval savollar kiriting yoki mavjud testni tahrirlashni oching.', 'error');
        return;
    }
    const titleRaw = document.getElementById('t-title').value.trim() || 'savollar';
    const safeTitle = titleRaw.replace(/[^a-zA-Z0-9\u0400-\u04FF\u0080-\u024F\-_ ]/g, '').trim() || 'savollar';
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${safeTitle}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

/* ── SAVOL RASMINI FAYLDAN YUKLASH ── */
document.getElementById('t-image-upload')?.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    const statusEl = document.getElementById('t-image-upload-status');
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        statusEl.textContent = 'Faqat rasm fayllarini yuklash mumkin.';
        statusEl.style.color = 'var(--red)';
        return;
    }
    statusEl.textContent = 'Yuklanmoqda va siqilmoqda...';
    statusEl.style.color = 'var(--muted)';

    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
        img.onload = () => {
            // Firestore hujjat hajmi cheklangani uchun rasmni kichraytirib, siqib olamiz
            const maxWidth = 700;
            const scale = Math.min(1, maxWidth / img.width);
            const canvas = document.createElement('canvas');
            canvas.width = Math.round(img.width * scale);
            canvas.height = Math.round(img.height * scale);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.65);
            const sizeKb = Math.round((dataUrl.length * 0.75) / 1024);

            const textarea = document.getElementById('t-questions');
            const start = textarea.selectionStart ?? textarea.value.length;
            const end = textarea.selectionEnd ?? textarea.value.length;
            const line = `Rasm: ${dataUrl}\n`;
            textarea.value = textarea.value.slice(0, start) + line + textarea.value.slice(end);
            textarea.selectionStart = textarea.selectionEnd = start + line.length;

            statusEl.textContent = `Rasm qo\u2018shildi (\u2248${sizeKb} KB). Kursor qo\u2018yilgan joyga "Rasm:" qatori yozildi \u2014 uni savol matnidan keyin, variantlardan oldin joylashganiga ishonch hosil qiling.`;
            statusEl.style.color = 'var(--green)';
            if (sizeKb > 250) {
                statusEl.textContent += ' Diqqat: rasm biroz katta, juda ko\u2018p rasmli savol bir testda hujjat hajmi chegarasiga tegishi mumkin \u2014 iloji boricha kichikroq/aniqroq rasm tanlang.';
                statusEl.style.color = 'var(--orange)';
            }
            document.getElementById('t-image-upload').value = '';
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
});

document.getElementById('t-create-btn')?.addEventListener('click', async () => {
    const editId = document.getElementById('t-edit-id').value;
    const contestId = document.getElementById('t-contest-select').value;
    const title = document.getElementById('t-title').value.trim();
    const timeLimitMinutes = parseInt(document.getElementById('t-time-limit').value, 10) || 20;
    const mcPerAttemptRaw = document.getElementById('t-mc-per-attempt').value.trim();
    const openPerAttemptRaw = document.getElementById('t-open-per-attempt').value.trim();
    const pointsPerCorrect = parseFloat(document.getElementById('t-points-per-correct').value) || 1;
    const openMaxPointsPerQuestion = parseFloat(document.getElementById('t-open-max-points').value) || 5;
    const rawQuestions = document.getElementById('t-questions').value;

    if (!contestId) {
        setStatus('Tanlovni tanlang.', 'error');
        return;
    }
    if (!title) {
        setStatus('Test nomini kiriting.', 'error');
        return;
    }
    const questions = parseQuestions(rawQuestions);
    if (!questions.length) {
        setStatus('Savollar formatida xatolik bor. Namunani tekshiring.', 'error');
        return;
    }
    const mcQuestionsPerAttempt = mcPerAttemptRaw ? Math.max(1, parseInt(mcPerAttemptRaw, 10)) : null;
    const openQuestionsPerAttempt = openPerAttemptRaw ? Math.max(1, parseInt(openPerAttemptRaw, 10)) : null;

    const btn = document.getElementById('t-create-btn');
    btn.disabled = true;
    try {
        // Testlar tanlov ID'si bo'yicha saqlanadi (bir tanlov — bitta savollar bazasi),
        // lekin har bir ishtirokchiga shu bazadan tasodifiy tanlangan savollar beriladi.
        const testDocId = editId || contestId;
        await setDoc(doc(db, 'tests', testDocId), {
            contestId,
            title,
            timeLimitMinutes,
            mcQuestionsPerAttempt,
            openQuestionsPerAttempt,
            pointsPerCorrect,
            openMaxPointsPerQuestion,
            questions,
            published: true,
            createdAt: serverTimestamp(),
        }, { merge: true });
        setStatus(editId ? 'Test yangilandi!' : `Test yaratildi! ${questions.length} ta savol qo\u2018shildi.`, 'success');
        resetTestForm();
        loadTests();
    } catch (err) {
        console.error(err);
        setStatus('Xatolik yuz berdi.', 'error');
    } finally {
        btn.disabled = false;
    }
});

let testsCache = {};

async function loadTests() {
    const listEl = document.getElementById('testsList');
    try {
        const snap = await getDocs(collection(db, 'tests'));
        if (snap.empty) {
            listEl.innerHTML = '<div class="empty">Hali test yaratilmagan.</div>';
            testsCache = {};
            return;
        }
        testsCache = {};
        let html = '';
        snap.forEach((d) => {
            const t = d.data();
            testsCache[d.id] = t;
            const mcCount = (t.questions || []).filter((q) => q.type !== 'open').length;
            const openCount = (t.questions || []).filter((q) => q.type === 'open').length;
            const perAttemptBits = [];
            if (mcCount) perAttemptBits.push(t.mcQuestionsPerAttempt ? `${t.mcQuestionsPerAttempt} ta yopiq beriladi` : 'barcha yopiq beriladi');
            if (openCount) perAttemptBits.push(t.openQuestionsPerAttempt ? `${t.openQuestionsPerAttempt} ta ochiq beriladi` : 'barcha ochiq beriladi');
            const pointsInfo = [];
            if (mcCount) pointsInfo.push(`yopiq: ${t.pointsPerCorrect || 1} ball/savol`);
            if (openCount) pointsInfo.push(`ochiq: max ${t.openMaxPointsPerQuestion || 5} ball/savol`);
            html += `<div class="admin-row"><span><b>${escapeHtml(t.title)}</b> — ${t.questions?.length || 0} ta savol (${escapeHtml(perAttemptBits.join(', '))}), ${t.timeLimitMinutes} daqiqa${pointsInfo.length ? ', ' + escapeHtml(pointsInfo.join(', ')) : ''}</span>
                <span style="display:flex;gap:8px">
                    <button class="btn btn-primary" data-edit-test="${d.id}" title="Tahrirlash"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-red" data-del-test="${d.id}" title="O'chirish"><i class="fas fa-trash"></i></button>
                </span></div>`;
        });
        listEl.innerHTML = html;
        listEl.querySelectorAll('[data-edit-test]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const t = testsCache[btn.dataset.editTest];
                if (!t) return;
                document.getElementById('t-edit-id').value = btn.dataset.editTest;
                document.getElementById('t-contest-select').value = t.contestId || btn.dataset.editTest;
                document.getElementById('t-title').value = t.title || '';
                document.getElementById('t-time-limit').value = t.timeLimitMinutes || 20;
                document.getElementById('t-mc-per-attempt').value = t.mcQuestionsPerAttempt || '';
                document.getElementById('t-open-per-attempt').value = t.openQuestionsPerAttempt || '';
                document.getElementById('t-points-per-correct').value = t.pointsPerCorrect || 1;
                document.getElementById('t-open-max-points').value = t.openMaxPointsPerQuestion || 5;
                document.getElementById('t-questions').value = questionsToRaw(t.questions || []);
                document.getElementById('t-create-btn').innerHTML = '<i class="fas fa-check"></i> O\u2018zgarishlarni saqlash';
                document.getElementById('t-cancel-edit-btn').style.display = '';
                document.getElementById('t-title').scrollIntoView({ behavior: 'smooth', block: 'center' });
                updatePointsPreview();
            });
        });
        listEl.querySelectorAll('[data-del-test]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                if (!confirm('Bu testni o\u2018chirmoqchimisiz?')) return;
                await deleteDoc(doc(db, 'tests', btn.dataset.delTest));
                loadTests();
            });
        });
    } catch (err) {
        console.error(err);
        listEl.innerHTML = '<div class="empty">Yuklashda xatolik.</div>';
    }
}

let currentTestContestId = '';
let currentTestAttempts = [];

document.getElementById('tr-contest-select')?.addEventListener('change', async (e) => {
    const contestId = e.target.value;
    currentTestContestId = contestId;
    const tableEl = document.getElementById('testResultsTable');
    const syncBtn = document.getElementById('t-sync-scores-btn');
    if (!contestId) {
        tableEl.innerHTML = '<div class="empty">Yuqorida tanlov tanlang</div>';
        syncBtn.style.display = 'none';
        return;
    }
    tableEl.innerHTML = '<div class="empty">Yuklanmoqda...</div>';
    syncBtn.style.display = 'none';
    try {
        const snap = await getDocs(query(collection(db, 'test-attempts'), where('contestId', '==', contestId)));
        if (snap.empty) {
            tableEl.innerHTML = '<div class="empty">Hali hech kim test topshirmagan.</div>';
            currentTestAttempts = [];
            return;
        }
        const list = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
        list.sort((a, b) => (b.score || 0) - (a.score || 0));
        currentTestAttempts = list;
        syncBtn.style.display = '';

        let rows = '';
        list.forEach((a) => {
            const statusTxt = a.status === 'submitted' ? `${a.score}/${a.totalQuestions}` : 'Jarayonda...';
            rows += `<tr>
                <td>${escapeHtml(a.uid.slice(0, 8))}...</td>
                <td>${statusTxt}</td>
                <td>${a.tabSwitchCount || 0}</td>
                <td>${a.submittedAt ? new Date(a.submittedAt.toMillis()).toLocaleString('uz-UZ') : '\u2014'}</td>
            </tr>`;
        });
        tableEl.innerHTML = `<table>
            <thead><tr><th>Foydalanuvchi (UID)</th><th>Natija</th><th>Chetga chiqishlar</th><th>Topshirilgan vaqt</th></tr></thead>
            <tbody>${rows}</tbody>
        </table>`;
    } catch (err) {
        console.error(err);
        tableEl.innerHTML = '<div class="empty">Yuklashda xatolik.</div>';
    }
});

document.getElementById('t-sync-scores-btn')?.addEventListener('click', async () => {
    if (!currentTestAttempts.length || !currentTestContestId) return;
    if (!confirm('Test ballarini shu tanlovdagi ishtirokchilar ro\u2018yxatiga (Ball ustuniga) ko\u2018chirasizmi?')) return;

    const btn = document.getElementById('t-sync-scores-btn');
    btn.disabled = true;
    try {
        const batch = writeBatch(db);
        let count = 0;
        currentTestAttempts.forEach((a) => {
            if (a.status !== 'submitted') return;
            const regId = `${currentTestContestId}_${a.uid}`;
            batch.update(doc(db, 'registrations', regId), { score: a.score });
            count++;
        });
        await batch.commit();
        setStatus(`${count} ta ishtirokchining balli ko\u2018chirildi!`, 'success');
    } catch (err) {
        console.error(err);
        setStatus('Xatolik yuz berdi (ba\u2018zi ishtirokchilar ro\u2018yxatda topilmagan bo\u2018lishi mumkin).', 'error');
    } finally {
        btn.disabled = false;
    }
});

document.getElementById('meet-contest-select')?.addEventListener('change', async (e) => {
    const contestId = e.target.value;
    const input = document.getElementById('meet-link-input');
    const enabledInput = document.getElementById('meet-enabled-input');
    const questionsInput = document.getElementById('meet-questions-count');
    const maxScoreInput = document.getElementById('meet-max-score');
    input.value = '';
    enabledInput.checked = true;
    questionsInput.value = '';
    maxScoreInput.value = '';
    if (!contestId) return;
    try {
        const snap = await getDoc(doc(db, 'contests', contestId));
        if (snap.exists()) {
            const c = snap.data();
            input.value = c.meetLink || '';
            enabledInput.checked = c.meetLinkEnabled !== false;
            questionsInput.value = c.interviewQuestionsCount || '';
            maxScoreInput.value = c.interviewMaxScore || '';
        }
    } catch (err) {
        console.error(err);
    }
});

document.getElementById('meet-save-btn')?.addEventListener('click', async () => {
    const contestId = document.getElementById('meet-contest-select').value;
    const meetLink = document.getElementById('meet-link-input').value.trim();
    const meetLinkEnabled = document.getElementById('meet-enabled-input').checked;
    const interviewQuestionsCount = parseInt(document.getElementById('meet-questions-count').value, 10) || null;
    const interviewMaxScore = parseFloat(document.getElementById('meet-max-score').value) || null;
    if (!contestId) {
        setStatus('Tanlovni tanlang.', 'error');
        return;
    }
    const btn = document.getElementById('meet-save-btn');
    btn.disabled = true;
    try {
        await updateDoc(doc(db, 'contests', contestId), { meetLink: meetLink || null, meetLinkEnabled, interviewQuestionsCount, interviewMaxScore });
        setStatus('Suhbat havolasi saqlandi!', 'success');
        loadMeetLinks();
    } catch (err) {
        console.error(err);
        setStatus('Xatolik yuz berdi.', 'error');
    } finally {
        btn.disabled = false;
    }
});

async function loadMeetLinks() {
    const listEl = document.getElementById('meetLinksList');
    if (!listEl) return;
    listEl.innerHTML = '<div class="empty">Yuklanmoqda...</div>';
    try {
        const snap = await getDocs(collection(db, 'contests'));
        let html = '';
        snap.forEach((d) => {
            const c = d.data();
            if (!c.meetLink) return;
            const enabled = c.meetLinkEnabled !== false;
            const meta = [];
            if (c.interviewQuestionsCount) meta.push(`${c.interviewQuestionsCount} ta savol`);
            if (c.interviewMaxScore) meta.push(`umumiy ${c.interviewMaxScore} ball`);
            html += `<div class="admin-row">
                <span><b>${escapeHtml(c.title)}</b><br><a href="${escapeHtml(c.meetLink)}" target="_blank" rel="noopener" style="font-size:0.8rem">${escapeHtml(c.meetLink)}</a>
                    <span class="badge ${enabled ? 'open' : 'closed'}" style="margin-left:6px">${enabled ? 'OCHIQ' : 'YOPIQ'}</span>
                    ${meta.length ? `<div style="color:var(--muted);font-size:0.75rem;margin-top:2px">${escapeHtml(meta.join(' \u00b7 '))}</div>` : ''}</span>
                <span style="display:flex;gap:8px">
                    <button class="btn ${enabled ? 'btn-red' : 'btn-green'}" data-toggle-meet="${d.id}" data-next="${!enabled}" title="${enabled ? 'Yopish' : 'Ochish'}"><i class="fas ${enabled ? 'fa-lock' : 'fa-unlock'}"></i></button>
                    <button class="btn btn-primary" data-edit-meet="${d.id}" title="Tahrirlash"><i class="fas fa-pen"></i></button>
                    <button class="btn btn-red" data-delete-meet="${d.id}" title="O'chirish"><i class="fas fa-trash"></i></button>
                </span>
            </div>`;
        });
        listEl.innerHTML = html || '<div class="empty">Hali birorta suhbat havolasi qo\u2018shilmagan.</div>';

        listEl.querySelectorAll('[data-toggle-meet]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const next = btn.dataset.next === 'true';
                await updateDoc(doc(db, 'contests', btn.dataset.toggleMeet), { meetLinkEnabled: next });
                loadMeetLinks();
            });
        });
        listEl.querySelectorAll('[data-edit-meet]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const select = document.getElementById('meet-contest-select');
                select.value = btn.dataset.editMeet;
                select.dispatchEvent(new Event('change'));
                select.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });
        listEl.querySelectorAll('[data-delete-meet]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                if (!confirm('Bu suhbat havolasini o\u2018chirmoqchimisiz?')) return;
                await updateDoc(doc(db, 'contests', btn.dataset.deleteMeet), { meetLink: null, meetLinkEnabled: null });
                loadMeetLinks();
            });
        });
    } catch (err) {
        console.error(err);
        listEl.innerHTML = '<div class="empty">Yuklashda xatolik.</div>';
    }
}

/* ── ADMINLAR (faqat owner) ── */
document.getElementById('a-add-btn')?.addEventListener('click', async () => {
    const email = document.getElementById('a-email').value.trim().toLowerCase();
    if (!email || !email.includes('@')) {
        setStatus('To\u2018g\u2018ri email kiriting.', 'error');
        return;
    }
    const currentUser = window.ZiyomapUsage && ZiyomapUsage.getUser();
    const btn = document.getElementById('a-add-btn');
    btn.disabled = true;
    try {
        // Email orqali foydalanuvchining UID'ini topamiz (u avval saytga
        // kamida bir marta Google orqali kirgan bo'lishi kerak)
        const userSnap = await getDocs(query(collection(db, 'users'), where('email', '==', email)));
        if (userSnap.empty) {
            setStatus('Bu email bilan hech kim saytga kirmagan. Avval o\u2018sha odam saytga Google orqali kirsin, keyin qo\u2018shing.', 'error');
            btn.disabled = false;
            return;
        }
        const targetUid = userSnap.docs[0].id;

        await setDoc(doc(db, 'admins', targetUid), {
            email,
            addedAt: serverTimestamp(),
            addedBy: currentUser?.email || 'owner',
        });
        document.getElementById('a-email').value = '';
        setStatus('Admin qo\u2018shildi!', 'success');
        loadAdmins();
        loadStats();
    } catch (err) {
        console.error(err);
        setStatus('Xatolik yuz berdi.', 'error');
    } finally {
        btn.disabled = false;
    }
});

async function loadAdmins() {
    const listEl = document.getElementById('adminsList');
    try {
        const snap = await getDocs(collection(db, 'admins'));
        const currentUser = window.ZiyomapUsage && ZiyomapUsage.getUser();
        let html = `<div class="admin-row"><span><i class="fas fa-crown" style="color:#d97706"></i> ${escapeHtml(currentUser?.email || 'Siz')} (asosiy admin)</span></div>`;
        snap.forEach((d) => {
            const a = d.data();
            html += `<div class="admin-row"><span>${escapeHtml(a.email || d.id)}</span>
                <button class="btn btn-red" data-del-admin="${d.id}"><i class="fas fa-trash"></i></button></div>`;
        });
        listEl.innerHTML = html;
        listEl.querySelectorAll('[data-del-admin]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                if (!confirm('Bu admin olib tashlansinmi?')) return;
                await deleteDoc(doc(db, 'admins', btn.dataset.delAdmin));
                loadAdmins();
                loadStats();
            });
        });
    } catch (err) {
        console.error(err);
        listEl.innerHTML = '<div class="empty">Yuklashda xatolik.</div>';
    }
}
