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
    getCountFromServer,
    doc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
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
    if (window.ZiyomapIsOwner) {
        document.getElementById('admins-tab-btn').style.display = '';
    }
    initTabs();
    loadStats();
    loadContests();
    loadNotifications();
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
        const [regSnap, contC, openC, admC] = await Promise.all([
            getDocs(collection(db, 'registrations')),
            getCountFromServer(collection(db, 'contests')),
            getCountFromServer(query(collection(db, 'contests'), where('status', '==', 'open'))),
            getCountFromServer(collection(db, 'admins')),
        ]);
        document.getElementById('st-reg').textContent = regSnap.size;
        document.getElementById('st-contests').textContent = contC.data().count;
        document.getElementById('st-open').textContent = openC.data().count;
        document.getElementById('st-admins').textContent = admC.data().count + 1; // +1 = owner
    } catch (err) {
        console.error(err);
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
            listHtml += `<div class="contest-item">
                <div>
                    <div class="t">${escapeHtml(c.title)} <span class="badge ${isOpen ? 'open' : 'closed'}">${isOpen ? 'FAOL' : 'YOPIQ'}</span></div>
                    <div class="d">${escapeHtml(c.description || '')}</div>
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
    if (!title) {
        setStatus('Tanlov nomini kiriting.', 'error');
        return;
    }
    const btn = document.getElementById('c-create-btn');
    btn.disabled = true;
    try {
        const ref = doc(collection(db, 'contests'));
        await setDoc(ref, {
            title,
            description: desc,
            status: 'open',
            createdAt: serverTimestamp(),
        });
        document.getElementById('c-title').value = '';
        document.getElementById('c-desc').value = '';
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
document.getElementById('reg-contest-select').addEventListener('change', async (e) => {
    const contestId = e.target.value;
    const tableEl = document.getElementById('registrantsTable');
    if (!contestId) {
        tableEl.innerHTML = '<div class="empty">Yuqorida tanlov tanlang</div>';
        return;
    }
    tableEl.innerHTML = '<div class="empty">Yuklanmoqda...</div>';
    try {
        const snap = await getDocs(
            query(collection(db, 'registrations'), where('contestId', '==', contestId), orderBy('createdAt', 'asc'))
        );
        if (snap.empty) {
            tableEl.innerHTML = '<div class="empty">Bu tanlovga hali hech kim ro\u2018yxatdan o\u2018tmagan.</div>';
            return;
        }
        let rows = '';
        snap.forEach((d) => {
            const r = d.data();
            rows += `<tr>
                <td><b>${escapeHtml(r.customId)}</b></td>
                <td>${escapeHtml(r.fullName)}</td>
                <td>${escapeHtml(r.maktab)}</td>
                <td>${escapeHtml(r.yosh)}</td>
                <td>${escapeHtml(r.telefon)}</td>
                <td><input type="number" step="0.1" data-score="${d.id}" value="${r.score ?? ''}" placeholder="—"></td>
                <td><button class="btn btn-primary" data-save="${d.id}"><i class="fas fa-save"></i></button></td>
            </tr>`;
        });
        tableEl.innerHTML = `<table>
            <thead><tr><th>ID</th><th>F.I.Sh</th><th>Maktab</th><th>Yosh</th><th>Telefon</th><th>Ball</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
        </table>`;

        tableEl.querySelectorAll('[data-save]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.save;
                const input = tableEl.querySelector(`[data-score="${id}"]`);
                const val = input.value === '' ? null : parseFloat(input.value);
                btn.disabled = true;
                try {
                    await updateDoc(doc(db, 'registrations', id), { score: val });
                    setStatus('Ball saqlandi.', 'success');
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

/* ── BILDIRISHNOMA ── */
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

/* ── ADMINLAR (faqat owner) ── */
document.getElementById('a-add-btn')?.addEventListener('click', async () => {
    const email = document.getElementById('a-email').value.trim().toLowerCase();
    if (!email || !email.includes('@')) {
        setStatus('To\u2018g\u2018ri email kiriting.', 'error');
        return;
    }
    const currentUser = window.ZiyomapUsage && ZiyomapUsage.getUser();
    try {
        await setDoc(doc(db, 'admins', email), {
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
    }
});

async function loadAdmins() {
    const listEl = document.getElementById('adminsList');
    try {
        const snap = await getDocs(collection(db, 'admins'));
        let html = `<div class="admin-row"><span><i class="fas fa-crown" style="color:#d97706"></i> ${escapeHtml(window.ZiyomapAdminGuard?.ownerEmail || '')} (asosiy admin)</span></div>`;
        snap.forEach((d) => {
            html += `<div class="admin-row"><span>${escapeHtml(d.id)}</span>
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
