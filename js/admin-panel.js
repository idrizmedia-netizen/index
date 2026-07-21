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
            const dates = [];
            if (c.regStartDate || c.regEndDate) dates.push(`Ro'yxat: ${c.regStartDate || '\u2014'} \u2013 ${c.regEndDate || '\u2014'}`);
            if (c.testWindowStart || c.testWindowEnd) dates.push(`Test: ${formatDateTime(c.testWindowStart)} \u2013 ${formatDateTime(c.testWindowEnd)}`);
            if (c.interviewWindowStart || c.interviewWindowEnd) dates.push(`Suhbat: ${formatDateTime(c.interviewWindowStart)} \u2013 ${formatDateTime(c.interviewWindowEnd)}`);
            listHtml += `<div class="contest-item">
                <div>
                    <div class="t">${escapeHtml(c.title)} <span class="badge ${isOpen ? 'open' : 'closed'}">${isOpen ? 'FAOL' : 'YOPIQ'}</span></div>
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
        if (tSelect) tSelect.innerHTML = selectHtml;
        if (trSelect) trSelect.innerHTML = selectHtml;
        if (meetSelect) meetSelect.innerHTML = selectHtml;
        if (statsSelect) statsSelect.innerHTML = selectHtml;

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
                document.getElementById('c-reg-start').value = c.regStartDate || '';
                document.getElementById('c-reg-end').value = c.regEndDate || '';
                document.getElementById('c-test-window-start').value = c.testWindowStart || '';
                document.getElementById('c-test-window-end').value = c.testWindowEnd || '';
                document.getElementById('c-test-slot-minutes').value = c.testSlotMinutes || 30;
                document.getElementById('c-test-slot-capacity').value = c.testSlotCapacity || 15;
                document.getElementById('c-interview-window-start').value = c.interviewWindowStart || '';
                document.getElementById('c-interview-window-end').value = c.interviewWindowEnd || '';
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
    document.getElementById('c-reg-start').value = '';
    document.getElementById('c-reg-end').value = '';
    document.getElementById('c-test-window-start').value = '';
    document.getElementById('c-test-window-end').value = '';
    document.getElementById('c-test-slot-minutes').value = '30';
    document.getElementById('c-test-slot-capacity').value = '15';
    document.getElementById('c-interview-window-start').value = '';
    document.getElementById('c-interview-window-end').value = '';
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
    const testWindowStart = document.getElementById('c-test-window-start').value || null;
    const testWindowEnd = document.getElementById('c-test-window-end').value || null;
    const testSlotMinutes = parseInt(document.getElementById('c-test-slot-minutes').value, 10) || 30;
    const testSlotCapacity = parseInt(document.getElementById('c-test-slot-capacity').value, 10) || 15;
    const interviewWindowStart = document.getElementById('c-interview-window-start').value || null;
    const interviewWindowEnd = document.getElementById('c-interview-window-end').value || null;
    const interviewSlotMinutes = parseInt(document.getElementById('c-interview-slot-minutes').value, 10) || 15;
    const interviewSlotCapacity = parseInt(document.getElementById('c-interview-slot-capacity').value, 10) || 1;
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
            testWindowStart,
            testWindowEnd,
            testSlotMinutes,
            testSlotCapacity,
            interviewWindowStart,
            interviewWindowEnd,
            interviewSlotMinutes,
            interviewSlotCapacity,
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

document.getElementById('reg-contest-select').addEventListener('change', async (e) => {
    const contestId = e.target.value;
    const contestTitle = e.target.options[e.target.selectedIndex]?.textContent || '';
    const tableEl = document.getElementById('registrantsTable');
    const exportBtn = document.getElementById('export-excel-btn');
    const publishBtn = document.getElementById('publish-leaderboard-btn');
    const autoScheduleBtn = document.getElementById('auto-schedule-btn');
    const autoScheduleStatus = document.getElementById('auto-schedule-status');
    currentContestId = contestId;
    if (!contestId) {
        tableEl.innerHTML = '<div class="empty">Yuqorida tanlov tanlang</div>';
        if (exportBtn) exportBtn.style.display = 'none';
        if (publishBtn) publishBtn.style.display = 'none';
        if (autoScheduleBtn) autoScheduleBtn.style.display = 'none';
        if (autoScheduleStatus) autoScheduleStatus.textContent = '';
        return;
    }
    tableEl.innerHTML = '<div class="empty">Yuklanmoqda...</div>';
    if (exportBtn) exportBtn.style.display = 'none';
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
        if (publishBtn) publishBtn.style.display = '';
        if (autoScheduleBtn) autoScheduleBtn.style.display = '';
        const searchInput = document.getElementById('registrants-search');
        if (searchInput) searchInput.value = '';

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
    let rows = '';
    list.forEach((r, i) => {
        const total = (r.score ?? 0) + (r.interviewScore ?? 0) + (r.openScore ?? 0);
        const retakeLabel = r.retakeUntil ? `Ruxsat: ${escapeHtml(formatDateTime(r.retakeUntil))}` : 'Yo\u2018q';
        rows += `<tr data-row="${r.id}">
            <td>${i + 1}</td>
            <td>${escapeHtml(r.fullName)}</td>
            <td><b>${escapeHtml(r.customId)}</b></td>
            <td>${escapeHtml(r.maktab)}${(r.viloyat || r.tuman) ? `<br><span style="color:var(--muted);font-size:0.75rem">${escapeHtml([r.tuman, r.viloyat].filter(Boolean).join(', '))}</span>` : ''}</td>
            <td>${escapeHtml(r.yosh)}</td>
            <td>${escapeHtml(r.telefon)}</td>
            <td><input type="number" step="0.1" data-score="${r.id}" value="${r.score ?? ''}" placeholder="—" style="width:64px"></td>
            <td><input type="number" step="0.1" data-interview="${r.id}" value="${r.interviewScore ?? ''}" placeholder="—" style="width:64px"></td>
            <td><input type="number" step="0.1" data-open="${r.id}" value="${r.openScore ?? ''}" placeholder="—" style="width:64px"></td>
            <td><b data-total="${r.id}">${total || '\u2014'}</b></td>
            <td style="white-space:nowrap">
                <button class="btn btn-primary" data-save="${r.id}" title="Saqlash"><i class="fas fa-save"></i></button>
                <button class="btn" data-view-open="${r.id}" title="Ochiq savollarga javoblarni ko'rish" style="background:var(--primary-light);color:var(--primary);box-shadow:none"><i class="fas fa-eye"></i></button>
                <button class="btn" data-retake="${r.id}" title="Testni qayta topshirishga ruxsat berish" style="background:var(--primary-light);color:var(--primary);box-shadow:none"><i class="fas fa-rotate"></i></button>
            </td>
        </tr>
        <tr data-retake-info="${r.id}"><td colspan="11" style="border-bottom:1px solid var(--border);font-size:0.75rem;color:var(--muted);padding-top:0">
            <i class="fas fa-rotate"></i> Qayta topshirish ruxsati: <span data-retake-label="${r.id}">${retakeLabel}</span>
        </td></tr>
        <tr data-open-answers-row="${r.id}" style="display:none"><td colspan="11" style="border-bottom:1px solid var(--border);font-size:0.82rem;padding:10px 6px">
            <div data-open-answers-content="${r.id}">Yuklanmoqda...</div>
        </td></tr>`;
    });
    tableEl.innerHTML = `<table>
        <thead><tr><th>№</th><th>F.I.Sh</th><th>ID</th><th>Maktabi</th><th>Yoshi</th><th>Telefon raqami</th><th>Test</th><th>Suhbat</th><th>Ochiq</th><th>Jami</th><th></th></tr></thead>
        <tbody>${rows}</tbody>
    </table>`;

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

// windowStart/windowEnd - "YYYY-MM-DDTHH:mm" ko'rinishidagi qatorlar (datetime-local formati)
// Har bir ishtirokchiga navbat bilan slot beriladi; bitta slotda "capacity" tagacha kishi bo'lishi mumkin.
// Agar ishtirokchilar soni oynani to'ldirib yuborsa, slotlar oyna tugagandan keyin ham davom etadi (bu holda ogohlantirish beriladi).
function buildScheduleAssignments(windowStartStr, windowEndStr, slotMinutes, capacity, count) {
    const assignments = [];
    if (!windowStartStr || !count) return { assignments, overflowed: false };
    const windowStart = new Date(windowStartStr);
    const windowEnd = windowEndStr ? new Date(windowEndStr) : null;
    const slotMs = Math.max(5, slotMinutes) * 60000;
    let slotStart = new Date(windowStart);
    let overflowed = false;
    let idx = 0;
    while (idx < count) {
        const slotEnd = new Date(slotStart.getTime() + slotMs);
        if (windowEnd && slotStart >= windowEnd) overflowed = true;
        for (let c = 0; c < Math.max(1, capacity) && idx < count; c++, idx++) {
            assignments.push({ start: toLocalInputValue(slotStart), end: toLocalInputValue(slotEnd) });
        }
        slotStart = slotEnd;
    }
    return { assignments, overflowed };
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
        if (!c.testWindowStart && !c.interviewWindowStart) {
            statusEl.textContent = 'Avval "Tanlovlar" bo\u2018limida test va/yoki suhbat vaqti oynasini kiriting.';
            statusEl.style.color = 'var(--red)';
            btn.disabled = false;
            return;
        }

        const n = currentRegistrants.length;
        const testResult = buildScheduleAssignments(c.testWindowStart, c.testWindowEnd, c.testSlotMinutes || 30, c.testSlotCapacity || 15, n);
        const interviewResult = buildScheduleAssignments(c.interviewWindowStart, c.interviewWindowEnd, c.interviewSlotMinutes || 15, c.interviewSlotCapacity || 1, n);

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
                if (Object.keys(payload).length) batch.update(doc(db, 'registrations', r.id), payload);
                Object.assign(r, payload); // mahalliy keshni ham yangilaymiz
            });
            await batch.commit();
            written += chunk.length;
        }

        let msg = `${n} ta ishtirokchiga vaqt biriktirildi.`;
        if (testResult.assignments.length) msg += ` Test uchun ${Math.ceil(n / (c.testSlotCapacity || 15))} ta slot ishlatildi.`;
        if (interviewResult.assignments.length) msg += ` Suhbat uchun ${Math.ceil(n / (c.interviewSlotCapacity || 1))} ta slot ishlatildi.`;
        if (testResult.overflowed || interviewResult.overflowed) {
            msg += ' Diqqat: ishtirokchilar soni ko\u2018pligi sababli ba\u2018zi slotlar belgilangan oyna tugash vaqtidan keyin ham davom etdi \u2014 oynani kengaytirishni yoki slot sig\u2018imini oshirishni ko\u2018rib chiqing.';
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
    }));
    const ws = window.XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 5 }, { wch: 28 }, { wch: 14 }, { wch: 22 }, { wch: 22 }, { wch: 28 }, { wch: 8 }, { wch: 16 }, { wch: 8 }, { wch: 8 }, { wch: 8 }, { wch: 8 }];
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

function resetTestForm() {
    document.getElementById('t-edit-id').value = '';
    document.getElementById('t-title').value = '';
    document.getElementById('t-questions').value = '';
    document.getElementById('t-time-limit').value = '20';
    document.getElementById('t-questions-per-attempt').value = '';
    document.getElementById('t-create-btn').innerHTML = '<i class="fas fa-check"></i> Testni yaratish va e\u2018lon qilish';
    document.getElementById('t-cancel-edit-btn').style.display = 'none';
}

document.getElementById('t-cancel-edit-btn')?.addEventListener('click', resetTestForm);

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
    const perAttemptRaw = document.getElementById('t-questions-per-attempt').value.trim();
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
    const questionsPerAttempt = perAttemptRaw ? Math.max(1, parseInt(perAttemptRaw, 10)) : null;

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
            questionsPerAttempt,
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
            const perAttempt = t.questionsPerAttempt ? `${t.questionsPerAttempt} ta beriladi` : 'hammasi beriladi';
            html += `<div class="admin-row"><span><b>${escapeHtml(t.title)}</b> — ${t.questions?.length || 0} ta savol (${escapeHtml(perAttempt)}), ${t.timeLimitMinutes} daqiqa</span>
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
                document.getElementById('t-questions-per-attempt').value = t.questionsPerAttempt || '';
                document.getElementById('t-questions').value = questionsToRaw(t.questions || []);
                document.getElementById('t-create-btn').innerHTML = '<i class="fas fa-check"></i> O\u2018zgarishlarni saqlash';
                document.getElementById('t-cancel-edit-btn').style.display = '';
                document.getElementById('t-title').scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    input.value = '';
    enabledInput.checked = true;
    if (!contestId) return;
    try {
        const snap = await getDoc(doc(db, 'contests', contestId));
        if (snap.exists()) {
            input.value = snap.data().meetLink || '';
            enabledInput.checked = snap.data().meetLinkEnabled !== false;
        }
    } catch (err) {
        console.error(err);
    }
});

document.getElementById('meet-save-btn')?.addEventListener('click', async () => {
    const contestId = document.getElementById('meet-contest-select').value;
    const meetLink = document.getElementById('meet-link-input').value.trim();
    const meetLinkEnabled = document.getElementById('meet-enabled-input').checked;
    if (!contestId) {
        setStatus('Tanlovni tanlang.', 'error');
        return;
    }
    const btn = document.getElementById('meet-save-btn');
    btn.disabled = true;
    try {
        await updateDoc(doc(db, 'contests', contestId), { meetLink: meetLink || null, meetLinkEnabled });
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
            html += `<div class="admin-row">
                <span><b>${escapeHtml(c.title)}</b><br><a href="${escapeHtml(c.meetLink)}" target="_blank" rel="noopener" style="font-size:0.8rem">${escapeHtml(c.meetLink)}</a>
                    <span class="badge ${enabled ? 'open' : 'closed'}" style="margin-left:6px">${enabled ? 'OCHIQ' : 'YOPIQ'}</span></span>
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
