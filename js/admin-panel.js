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

/* ── TANLOVLAR ── */
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
        snap.forEach((d) => {
            const c = d.data();
            const isOpen = c.status === 'open';
            const restrictions = [];
            if (c.minAge || c.maxAge) restrictions.push(`Yosh: ${c.minAge || '0'}–${c.maxAge || '∞'}`);
            if (c.grades && c.grades.length) restrictions.push(`Sinf: ${c.grades.join(', ')}`);
            listHtml += `<div class="contest-item">
                <div>
                    <div class="t">${escapeHtml(c.title)} <span class="badge ${isOpen ? 'open' : 'closed'}">${isOpen ? 'FAOL' : 'YOPIQ'}</span></div>
                    <div class="d">${escapeHtml(c.description || '')}</div>
                    ${restrictions.length ? `<div class="d" style="color:var(--orange);margin-top:2px"><i class="fas fa-filter"></i> ${escapeHtml(restrictions.join(' · '))}</div>` : ''}
                </div>
                <div style="display:flex;gap:8px">
                    <button class="btn ${isOpen ? 'btn-red' : 'btn-green'}" data-toggle="${d.id}" data-next="${isOpen ? 'closed' : 'open'}">
                        <i class="fas ${isOpen ? 'fa-lock' : 'fa-unlock'}"></i> ${isOpen ? 'Yopish' : 'Ochish'}
                    </button>
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
        if (tSelect) tSelect.innerHTML = selectHtml;
        if (trSelect) trSelect.innerHTML = selectHtml;
        if (meetSelect) meetSelect.innerHTML = selectHtml;

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

document.getElementById('c-create-btn').addEventListener('click', async () => {
    const title = document.getElementById('c-title').value.trim();
    const desc = document.getElementById('c-desc').value.trim();
    const minAgeRaw = document.getElementById('c-min-age').value.trim();
    const maxAgeRaw = document.getElementById('c-max-age').value.trim();
    const gradesRaw = document.getElementById('c-grades').value.trim();
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
        const ref = doc(collection(db, 'contests'));
        await setDoc(ref, {
            title,
            description: desc,
            status: 'open',
            minAge: minAgeRaw ? parseInt(minAgeRaw, 10) : null,
            maxAge: maxAgeRaw ? parseInt(maxAgeRaw, 10) : null,
            grades,
            createdAt: serverTimestamp(),
        });
        document.getElementById('c-title').value = '';
        document.getElementById('c-desc').value = '';
        document.getElementById('c-min-age').value = '';
        document.getElementById('c-max-age').value = '';
        document.getElementById('c-grades').value = '';
        setStatus('Tanlov yaratildi va e\u2018lon qilindi!', 'success');
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
    currentContestId = contestId;
    if (!contestId) {
        tableEl.innerHTML = '<div class="empty">Yuqorida tanlov tanlang</div>';
        if (exportBtn) exportBtn.style.display = 'none';
        if (publishBtn) publishBtn.style.display = 'none';
        return;
    }
    tableEl.innerHTML = '<div class="empty">Yuklanmoqda...</div>';
    if (exportBtn) exportBtn.style.display = 'none';
    if (publishBtn) publishBtn.style.display = 'none';
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

        let rows = '';
        list.forEach((r, i) => {
            const total = (r.score ?? 0) + (r.interviewScore ?? 0);
            rows += `<tr>
                <td>${i + 1}</td>
                <td>${escapeHtml(r.fullName)}</td>
                <td><b>${escapeHtml(r.customId)}</b></td>
                <td>${escapeHtml(r.maktab)}</td>
                <td>${escapeHtml(r.yosh)}</td>
                <td>${escapeHtml(r.telefon)}</td>
                <td><input type="number" step="0.1" data-score="${r.id}" value="${r.score ?? ''}" placeholder="—" style="width:64px"></td>
                <td><input type="number" step="0.1" data-interview="${r.id}" value="${r.interviewScore ?? ''}" placeholder="—" style="width:64px"></td>
                <td><b>${total || '\u2014'}</b></td>
                <td><button class="btn btn-primary" data-save="${r.id}"><i class="fas fa-save"></i></button></td>
            </tr>`;
        });
        tableEl.innerHTML = `<table>
            <thead><tr><th>№</th><th>F.I.Sh</th><th>ID</th><th>Maktabi</th><th>Yoshi</th><th>Telefon raqami</th><th>Test</th><th>Suhbat</th><th>Jami</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
        </table>`;

        tableEl.querySelectorAll('[data-save]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.save;
                const scoreInput = tableEl.querySelector(`[data-score="${id}"]`);
                const interviewInput = tableEl.querySelector(`[data-interview="${id}"]`);
                const score = scoreInput.value === '' ? null : parseFloat(scoreInput.value);
                const interviewScore = interviewInput.value === '' ? null : parseFloat(interviewInput.value);
                btn.disabled = true;
                try {
                    await updateDoc(doc(db, 'registrations', id), { score, interviewScore });
                    setStatus('Ballar saqlandi.', 'success');
                } catch (err) {
                    console.error(err);
                    setStatus('Xatolik yuz berdi.', 'error');
                } finally {
                    btn.disabled = false;
                }
            });
        });
    } catch (err) {
        console.error(err);
        tableEl.innerHTML = '<div class="empty">Yuklashda xatolik.</div>';
    }
});

document.getElementById('publish-leaderboard-btn')?.addEventListener('click', async () => {
    if (!currentRegistrants.length || !currentContestId) return;

    const withTotal = currentRegistrants
        .map((r) => ({ ...r, total: (r.score ?? null) === null && (r.interviewScore ?? null) === null ? null : (r.score ?? 0) + (r.interviewScore ?? 0) }))
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
        Maktabi: r.maktab,
        Yoshi: r.yosh,
        'Telefon raqami': r.telefon,
        Test: r.score ?? '',
        Suhbat: r.interviewScore ?? '',
        Jami: (r.score ?? 0) + (r.interviewScore ?? 0),
    }));
    const ws = window.XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 5 }, { wch: 28 }, { wch: 14 }, { wch: 28 }, { wch: 8 }, { wch: 16 }, { wch: 8 }, { wch: 8 }, { wch: 8 }];
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
        if (lines.length < 6) return; // savol + 4 variant + javob
        const text = lines[0];
        const options = [];
        let correctIndex = -1;
        lines.slice(1).forEach((line) => {
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
        if (text && options.length === 4 && correctIndex >= 0) {
            questions.push({ id: 'q' + idx, text, options, correctIndex });
        }
    });
    return questions;
}

document.getElementById('t-create-btn')?.addEventListener('click', async () => {
    const contestId = document.getElementById('t-contest-select').value;
    const title = document.getElementById('t-title').value.trim();
    const timeLimitMinutes = parseInt(document.getElementById('t-time-limit').value, 10) || 20;
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

    const btn = document.getElementById('t-create-btn');
    btn.disabled = true;
    try {
        await setDoc(doc(db, 'tests', contestId), {
            title,
            timeLimitMinutes,
            questions,
            published: true,
            createdAt: serverTimestamp(),
        });
        setStatus(`Test yaratildi! ${questions.length} ta savol qo\u2018shildi.`, 'success');
        document.getElementById('t-title').value = '';
        document.getElementById('t-questions').value = '';
        loadTests();
    } catch (err) {
        console.error(err);
        setStatus('Xatolik yuz berdi.', 'error');
    } finally {
        btn.disabled = false;
    }
});

async function loadTests() {
    const listEl = document.getElementById('testsList');
    try {
        const snap = await getDocs(collection(db, 'tests'));
        if (snap.empty) {
            listEl.innerHTML = '<div class="empty">Hali test yaratilmagan.</div>';
            return;
        }
        let html = '';
        snap.forEach((d) => {
            const t = d.data();
            html += `<div class="admin-row"><span><b>${escapeHtml(t.title)}</b> — ${t.questions?.length || 0} ta savol, ${t.timeLimitMinutes} daqiqa</span>
                <button class="btn btn-red" data-del-test="${d.id}"><i class="fas fa-trash"></i></button></div>`;
        });
        listEl.innerHTML = html;
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
    input.value = '';
    if (!contestId) return;
    try {
        const snap = await getDoc(doc(db, 'contests', contestId));
        if (snap.exists()) input.value = snap.data().meetLink || '';
    } catch (err) {
        console.error(err);
    }
});

document.getElementById('meet-save-btn')?.addEventListener('click', async () => {
    const contestId = document.getElementById('meet-contest-select').value;
    const meetLink = document.getElementById('meet-link-input').value.trim();
    if (!contestId) {
        setStatus('Tanlovni tanlang.', 'error');
        return;
    }
    const btn = document.getElementById('meet-save-btn');
    btn.disabled = true;
    try {
        await updateDoc(doc(db, 'contests', contestId), { meetLink: meetLink || null });
        setStatus('Suhbat havolasi saqlandi!', 'success');
    } catch (err) {
        console.error(err);
        setStatus('Xatolik yuz berdi.', 'error');
    } finally {
        btn.disabled = false;
    }
});

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
