import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    setDoc,
    runTransaction,
    serverTimestamp,
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
const authReady = new Promise((resolve) => {
    const unsub = onAuthStateChanged(authInst, () => {
        unsub();
        resolve();
    });
});

const contestInfo = document.getElementById('contest-info');
const contestSelectBox = document.getElementById('contest-select-box');
const contestSelectList = document.getElementById('contest-select-list');
const needLoginBox = document.getElementById('need-login-box');
const closedBox = document.getElementById('closed-box');
const alreadyBox = document.getElementById('already-box');
const alreadyId = document.getElementById('already-id');
const regForm = document.getElementById('reg-form');
const submitBtn = document.getElementById('submit-btn');
const statusMsg = document.getElementById('status-msg');

let currentUser = null;

function setStatus(text, type) {
    if (!text) {
        statusMsg.className = '';
        statusMsg.textContent = '';
        return;
    }
    statusMsg.textContent = text;
    statusMsg.className = 'show ' + (type || 'info');
}

function hideAll() {
    contestInfo.style.display = 'none';
    contestSelectBox.style.display = 'none';
    needLoginBox.style.display = 'none';
    closedBox.style.display = 'none';
    alreadyBox.style.display = 'none';
    regForm.style.display = 'none';
    setStatus('');
}

function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str == null ? '' : String(str);
    return d.innerHTML;
}

async function getOpenContests() {
    const q = query(collection(db, 'contests'), where('status', '==', 'open'));
    const snap = await getDocs(q);
    const list = [];
    snap.forEach((d) => list.push({ id: d.id, ...d.data() }));
    list.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
    return list;
}

async function nextRegistrationId() {
    const year = new Date().getFullYear();
    const counterRef = doc(db, 'counters', 'registrations');
    const n = await runTransaction(db, async (tx) => {
        const snap = await tx.get(counterRef);
        const current = snap.exists() ? snap.data().count || 0 : 0;
        const next = current + 1;
        tx.set(counterRef, { count: next }, { merge: true });
        return next;
    });
    return `ZM-${year}-${String(n).padStart(4, '0')}`;
}

/* ── Tanlovlar ro'yxatidan birini tanlash ── */
function showContestChoice(contests) {
    contestSelectBox.style.display = 'block';
    contestSelectList.innerHTML = contests
        .map(
            (c) => `<div class="contest-pick" data-pick="${c.id}">
                <div>
                    <div class="cp-t">${escapeHtml(c.title)}</div>
                    <div class="cp-d">${escapeHtml(c.description || '')}</div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </div>`
        )
        .join('');

    contestSelectList.querySelectorAll('[data-pick]').forEach((el) => {
        el.addEventListener('click', () => {
            const contest = contests.find((c) => c.id === el.dataset.pick);
            contestSelectBox.style.display = 'none';
            openContest(contest, contests.length > 1);
        });
    });
}

/* ── Tanlangan tanlov uchun forma yoki "allaqachon ro'yxatdan o'tgan" holatini ko'rsatish ── */
async function openContest(contest, showBack) {
    contestInfo.style.display = 'block';
    contestInfo.innerHTML =
        (showBack ? '<a href="#" id="back-to-list" class="back-link"><i class="fas fa-arrow-left"></i> Boshqa tanlov tanlash</a><br>' : '') +
        `<b>${escapeHtml(contest.title || 'Tanlov')}</b>${escapeHtml(contest.description || '')}`;

    const backLink = document.getElementById('back-to-list');
    if (backLink) {
        backLink.addEventListener('click', (e) => {
            e.preventDefault();
            hideAll();
            getOpenContests().then((contests) => {
                if (contests.length > 1) showContestChoice(contests);
                else if (contests.length === 1) openContest(contests[0], false);
                else closedBox.style.display = 'block';
            });
        });
    }

    const regId = `${contest.id}_${currentUser.uid}`;
    let existing;
    try {
        existing = await getDoc(doc(db, 'registrations', regId));
    } catch (err) {
        console.error(err);
        setStatus('Ma\u2019lumotlarni yuklashda xatolik. Qayta urinib ko\u2018ring.', 'error');
        return;
    }

    if (existing.exists()) {
        alreadyBox.style.display = 'block';
        alreadyId.textContent = existing.data().customId || '\u2014';
        return;
    }

    regForm.style.display = 'block';
    regForm.onsubmit = async (e) => {
        e.preventDefault();

        if (!authInst.currentUser) {
            setStatus('Sessiyangiz eskirgan. Iltimos, chiqib, Google orqali qayta kiring.', 'error');
            return;
        }

        submitBtn.disabled = true;
        setStatus('Yuborilmoqda...', 'info');

        const familiya = document.getElementById('f-familiya').value.trim();
        const ism = document.getElementById('f-ism').value.trim();
        const sharif = document.getElementById('f-sharif').value.trim();
        const maktab = document.getElementById('f-maktab').value.trim();
        const yosh = parseInt(document.getElementById('f-yosh').value, 10);
        const telefon = document.getElementById('f-tel').value.trim();

        try {
            const customId = await nextRegistrationId();

            await setDoc(doc(db, 'registrations', regId), {
                contestId: contest.id,
                contestTitle: contest.title || '',
                uid: authInst.currentUser.uid,
                email: authInst.currentUser.email || currentUser.email || null,
                familiya,
                ism,
                sharif,
                fullName: `${familiya} ${ism} ${sharif}`.trim(),
                maktab,
                yosh,
                telefon,
                customId,
                score: null,
                rank: null,
                createdAt: serverTimestamp(),
            });

            await setDoc(doc(db, 'stats', 'public'), { totalRegistrations: increment(1) }, { merge: true });

            if (window.ZiyomapUsage) {
                ZiyomapUsage.logUsage('tanlov-royxat', 'Tanlovga ro\u2018yxatdan o\u2018tish: ' + (contest.title || ''));
            }

            regForm.style.display = 'none';
            alreadyBox.style.display = 'block';
            alreadyId.textContent = customId;
            setStatus('Muvaffaqiyatli ro\u2018yxatdan o\u2018tdingiz!', 'success');
        } catch (err) {
            console.error('Ro\u2018yxatdan o\u2018tish xatoligi:', err.code, err.message, err);
            const detail = err.code ? ` (${err.code})` : '';
            setStatus('Xatolik yuz berdi' + detail + '. Qayta urinib ko\u2018ring.', 'error');
            submitBtn.disabled = false;
        }
    };
}

async function init() {
    hideAll();
    await authReady;

    currentUser = window.ZiyomapUsage && ZiyomapUsage.getUser();
    const liveUser = authInst.currentUser;
    if (!currentUser || !liveUser || currentUser.uid !== liveUser.uid) {
        if (liveUser) {
            // localStorage eskirgan yoki mos kelmayapti — haqiqiy Firebase sessiyasidan olinadi
            currentUser = {
                uid: liveUser.uid,
                email: liveUser.email || currentUser?.email || null,
                displayName: liveUser.displayName || currentUser?.displayName || 'Foydalanuvchi',
                photoURL: liveUser.photoURL || currentUser?.photoURL || null,
            };
        }
    }
    if (!currentUser || !currentUser.uid) {
        needLoginBox.style.display = 'block';
        return;
    }

    let contests;
    try {
        contests = await getOpenContests();
    } catch (err) {
        console.error(err);
        setStatus('Ma\u2019lumotlarni yuklashda xatolik. Qayta urinib ko\u2018ring.', 'error');
        return;
    }

    if (!contests.length) {
        closedBox.style.display = 'block';
        return;
    }

    if (contests.length === 1) {
        openContest(contests[0], false);
    } else {
        showContestChoice(contests);
    }
}

// ZiyomapUsage darhol tayyor bo'lishi mumkin, lekin ehtiyot uchun biroz kutamiz
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 200));
} else {
    setTimeout(init, 200);
}
