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
const needLoginBox = document.getElementById('need-login-box');
const closedBox = document.getElementById('closed-box');
const alreadyBox = document.getElementById('already-box');
const alreadyId = document.getElementById('already-id');
const regForm = document.getElementById('reg-form');
const submitBtn = document.getElementById('submit-btn');
const statusMsg = document.getElementById('status-msg');

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
    needLoginBox.style.display = 'none';
    closedBox.style.display = 'none';
    alreadyBox.style.display = 'none';
    regForm.style.display = 'none';
}

async function getActiveContest() {
    const q = query(
        collection(db, 'contests'),
        where('status', '==', 'open'),
        orderBy('createdAt', 'desc'),
        limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
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

async function init() {
    hideAll();
    await authReady;

    const user = window.ZiyomapUsage && ZiyomapUsage.getUser();
    if (!user || !user.uid) {
        needLoginBox.style.display = 'block';
        return;
    }

    let contest;
    try {
        contest = await getActiveContest();
    } catch (err) {
        console.error(err);
        setStatus('Ma\u2019lumotlarni yuklashda xatolik. Qayta urinib ko\u2018ring.', 'error');
        return;
    }

    if (!contest) {
        closedBox.style.display = 'block';
        return;
    }

    contestInfo.style.display = 'block';
    contestInfo.innerHTML = `<b>${escapeHtml(contest.title || 'Tanlov')}</b>${escapeHtml(contest.description || '')}`;

    const regId = `${contest.id}_${user.uid}`;
    const existing = await getDoc(doc(db, 'registrations', regId));

    if (existing.exists()) {
        alreadyBox.style.display = 'block';
        alreadyId.textContent = existing.data().customId || '—';
        return;
    }

    regForm.style.display = 'block';

    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
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
                uid: user.uid,
                email: user.email || null,
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

            await setDoc(
                doc(db, 'stats', 'public'),
                { totalRegistrations: increment(1) },
                { merge: true }
            );

            if (window.ZiyomapUsage) {
                ZiyomapUsage.logUsage('tanlov-royxat', 'Tanlovga ro\u2018yxatdan o\u2018tish');
            }

            regForm.style.display = 'none';
            alreadyBox.style.display = 'block';
            alreadyId.textContent = customId;
            setStatus('Muvaffaqiyatli ro\u2018yxatdan o\u2018tdingiz!', 'success');
        } catch (err) {
            console.error(err);
            setStatus('Xatolik yuz berdi. Qayta urinib ko\u2018ring.', 'error');
            submitBtn.disabled = false;
        }
    });
}

function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
}

// ZiyomapUsage darhol tayyor bo'lishi mumkin, lekin ehtiyot uchun biroz kutamiz
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 200));
} else {
    setTimeout(init, 200);
}
