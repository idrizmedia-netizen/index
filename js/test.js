import { initializeApp, getApps, getApp } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js';
import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc,
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

const gate = document.getElementById('gate');
const appEl = document.getElementById('app');
const topBar = document.getElementById('topBar');
const testTitleBar = document.getElementById('testTitleBar');
const timerBadge = document.getElementById('timerBadge');
const introCard = document.getElementById('introCard');
const questionsCard = document.getElementById('questionsCard');
const resultCard = document.getElementById('resultCard');
const msgCard = document.getElementById('msgCard');

const params = new URLSearchParams(window.location.search);
const contestId = params.get('contest');

let currentUser = null;
let testData = null;
let attemptRef = null;
let answers = [];
let questionOrder = [];
let timerInterval = null;
let submitted = false;

function showMsg(title, desc) {
    gate.style.display = 'none';
    appEl.style.display = 'block';
    msgCard.style.display = 'block';
    document.getElementById('msgTitle').textContent = title;
    document.getElementById('msgDesc').textContent = desc;
}

function esc(str) {
    const d = document.createElement('div');
    d.textContent = str == null ? '' : String(str);
    return d.innerHTML;
}

async function init() {
    await authReady;

    if (!contestId) {
        showMsg('Xatolik', 'Tanlov ko\u2018rsatilmagan. Iltimos, ro\u2018yxatdan o\u2018tish sahifasidan qayta o\u2018ting.');
        return;
    }

    currentUser = window.ZiyomapUsage && ZiyomapUsage.getUser();
    const liveUser = authInst.currentUser;
    if (liveUser && (!currentUser || currentUser.uid !== liveUser.uid)) {
        currentUser = { uid: liveUser.uid, displayName: liveUser.displayName, email: liveUser.email };
    }

    if (!currentUser || !currentUser.uid) {
        showMsg('Kirish kerak', 'Testni boshlash uchun avval saytga kiring.');
        return;
    }

    // Ro'yxatdan o'tganligini tekshirish
    let regData = null;
    try {
        const regSnap = await getDoc(doc(db, 'registrations', `${contestId}_${currentUser.uid}`));
        if (!regSnap.exists()) {
            showMsg('Ro\u2018yxatdan o\u2018tmagansiz', 'Testni boshlash uchun avval shu tanlovga ro\u2018yxatdan o\u2018ting.');
            return;
        }
        regData = regSnap.data();
    } catch (err) {
        console.error(err);
        showMsg('Xatolik', 'Ma\u2019lumotlarni tekshirishda xatolik yuz berdi.');
        return;
    }

    // Test sanasi cheklovini tekshirish (agar admin sana belgilagan bo'lsa)
    let contestData = null;
    try {
        const contestSnap = await getDoc(doc(db, 'contests', contestId));
        if (contestSnap.exists()) contestData = contestSnap.data();
    } catch (err) {
        console.error('Tanlov ma\u2019lumotini yuklashda xatolik:', err);
    }

    if (contestData) {
        // Ustuvorlik: ishtirokchiga avtomatik biriktirilgan shaxsiy vaqt > tanlovning umumiy test oynasi.
        // Agar ikkalasi ham belgilanmagan bo'lsa — hech qanday cheklov qo'yilmaydi (bepul kirish).
        const effectiveStart = regData.assignedTestStart || contestData.testWindowStart || null;
        const effectiveEnd = regData.assignedTestEnd || contestData.testWindowEnd || null;

        if (effectiveStart || effectiveEnd) {
            const now = new Date();
            const start = effectiveStart ? new Date(effectiveStart) : null;
            const end = effectiveEnd ? new Date(effectiveEnd) : null;
            const retakeUntil = regData.retakeUntil ? new Date(regData.retakeUntil) : null;
            const withinRetake = retakeUntil && now <= retakeUntil;

            // Agar attempt allaqachon topshirilgan bo'lsa, sana tekshiruvi keraksiz (natija ko'rsatiladi)
            let alreadySubmitted = false;
            try {
                const attemptCheck = await getDoc(doc(db, 'test-attempts', `${contestId}_${currentUser.uid}`));
                alreadySubmitted = attemptCheck.exists() && attemptCheck.data().status === 'submitted';
            } catch (err) { /* e'tiborsiz qoldiriladi, quyida qayta tekshiriladi */ }

            if (!alreadySubmitted) {
                if (start && now < start && !withinRetake) {
                    showMsg('Test hali boshlanmagan', `Sizning test vaqtingiz: ${start.toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}. Shu vaqtda qayta kiring.`);
                    return;
                }
                if (end && now > end && !withinRetake) {
                    showMsg('Test vaqti tugagan', 'Sizga belgilangan test vaqti o\u2018tib ketgan. Agar test topshira olmagan bo\u2018lsangiz, admin bilan bog\u2018lanib qayta topshirish uchun ruxsat so\u2018rang.');
                    return;
                }
            }
        }
    }

    // Testning o'zini yuklash
    let testSnap;
    try {
        testSnap = await getDoc(doc(db, 'tests', contestId));
    } catch (err) {
        console.error(err);
        showMsg('Xatolik', 'Testni yuklashda xatolik yuz berdi.');
        return;
    }
    if (!testSnap.exists() || !testSnap.data().published) {
        showMsg('Test hali tayyor emas', 'Bu tanlov uchun test hali e\u2018lon qilinmagan. Keyinroq qayta tekshiring.');
        return;
    }
    testData = testSnap.data();

    attemptRef = doc(db, 'test-attempts', `${contestId}_${currentUser.uid}`);
    let attemptSnap;
    try {
        attemptSnap = await getDoc(attemptRef);
    } catch (err) {
        console.error(err);
        showMsg('Xatolik', 'Ma\u2019lumotlarni yuklashda xatolik yuz berdi.');
        return;
    }

    gate.style.display = 'none';
    appEl.style.display = 'block';

    if (attemptSnap.exists() && attemptSnap.data().status === 'submitted') {
        const a = attemptSnap.data();
        resultCard.style.display = 'block';
        document.getElementById('resultScoreText').textContent = `${a.score}/${a.totalQuestions}`;
        return;
    }

    if (attemptSnap.exists() && attemptSnap.data().status === 'in-progress') {
        const ad = attemptSnap.data();
        questionOrder = ad.questionOrder && ad.questionOrder.length ? ad.questionOrder : testData.questions.map((_, i) => i);
        answers = ad.answers || new Array(questionOrder.length).fill(null);
        startTest(ad.startedAt.toMillis());
        return;
    }

    // Hali boshlanmagan — kirish oynasi
    const totalToShow = testData.questionsPerAttempt && testData.questionsPerAttempt < testData.questions.length
        ? testData.questionsPerAttempt
        : testData.questions.length;
    introCard.style.display = 'block';
    document.getElementById('introTitle').textContent = testData.title;
    document.getElementById('introDesc').textContent =
        `${totalToShow} ta savol \u2014 ${testData.timeLimitMinutes} daqiqa vaqt beriladi. Test boshlangandan so\u2018ng sahifadan chiqib ketmang \u2014 tizim buni kuzatib boradi.`;
    document.getElementById('startBtn').addEventListener('click', startNewAttempt);
}

function buildQuestionOrder() {
    const total = testData.questions.length;
    const indices = Array.from({ length: total }, (_, i) => i);
    // Fisher-Yates aralashtirish — har bir ishtirokchiga boshqacha tartib/savollar tushishi uchun
    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    const n = testData.questionsPerAttempt && testData.questionsPerAttempt > 0 ? Math.min(testData.questionsPerAttempt, total) : total;
    return indices.slice(0, n);
}

async function startNewAttempt() {
    const btn = document.getElementById('startBtn');
    btn.disabled = true;
    try {
        questionOrder = buildQuestionOrder();
        answers = new Array(questionOrder.length).fill(null);
        await setDoc(attemptRef, {
            uid: currentUser.uid,
            contestId,
            questionOrder,
            answers,
            status: 'in-progress',
            tabSwitchCount: 0,
            startedAt: serverTimestamp(),
        });
        const snap = await getDoc(attemptRef);
        startTest(snap.data().startedAt.toMillis());
    } catch (err) {
        console.error(err);
        btn.disabled = false;
        alert('Xatolik yuz berdi. Qayta urinib ko\u2018ring.');
    }
}

function startTest(startedAtMillis) {
    introCard.style.display = 'none';
    topBar.style.display = 'flex';
    questionsCard.style.display = 'block';
    testTitleBar.textContent = testData.title;

    renderQuestions();
    startTimer(startedAtMillis);
    setupAntiCheat();
}

function renderQuestions() {
    let html = '';
    questionOrder.forEach((origIdx, qi) => {
        const q = testData.questions[origIdx];
        html += `<div class="card q-block">
            <div class="q-num">${qi + 1}-savol / ${questionOrder.length}</div>
            <div class="q-text">${esc(q.text)}</div>
            ${q.imageUrl ? `<img src="${esc(q.imageUrl)}" alt="Savol rasmi" style="max-width:100%;border-radius:12px;margin:10px 0">` : ''}
            <div class="opts" data-qi="${qi}">
                ${q.options
                    .map(
                        (opt, oi) => `<label class="opt ${answers[qi] === oi ? 'selected' : ''}" data-oi="${oi}">
                        <input type="radio" name="q${qi}" value="${oi}" ${answers[qi] === oi ? 'checked' : ''}>
                        <span>${esc(opt)}</span>
                    </label>`
                    )
                    .join('')}
            </div>
        </div>`;
    });
    html += `<div class="card center-card">
        <button class="btn" id="submitBtn"><i class="fas fa-flag-checkered"></i> Testni yakunlash</button>
    </div>`;
    questionsCard.innerHTML = html;

    questionsCard.querySelectorAll('.opts').forEach((optsEl) => {
        const qi = parseInt(optsEl.dataset.qi, 10);
        optsEl.querySelectorAll('.opt').forEach((optEl) => {
            optEl.addEventListener('click', () => {
                const oi = parseInt(optEl.dataset.oi, 10);
                answers[qi] = oi;
                optsEl.querySelectorAll('.opt').forEach((o) => o.classList.remove('selected'));
                optEl.classList.add('selected');
                optEl.querySelector('input').checked = true;
                saveProgress();
            });
        });
    });

    document.getElementById('submitBtn').addEventListener('click', () => {
        const answered = answers.filter((a) => a !== null).length;
        const total = questionOrder.length;
        const msg =
            answered < total
                ? `Siz ${total} tadan faqat ${answered} ta savolga javob berdingiz. Baribir yakunlaysizmi?`
                : 'Testni yakunlamoqchimisiz? Bu amalni orqaga qaytarib bo\u2018lmaydi.';
        if (confirm(msg)) submitTest();
    });
}

let saveTimeout = null;
function saveProgress() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        updateDoc(attemptRef, { answers }).catch((err) => console.error('Saqlashda xatolik:', err));
    }, 500);
}

function startTimer(startedAtMillis) {
    const totalSeconds = testData.timeLimitMinutes * 60;
    function tick() {
        const elapsed = Math.floor((Date.now() - startedAtMillis) / 1000);
        const remaining = totalSeconds - elapsed;
        if (remaining <= 0) {
            timerBadge.textContent = '00:00';
            clearInterval(timerInterval);
            submitTest();
            return;
        }
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        timerBadge.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
        timerBadge.classList.toggle('warn', remaining <= 60);
    }
    tick();
    timerInterval = setInterval(tick, 1000);
}

function setupAntiCheat() {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
}

function handleVisibilityChange() {
    if (submitted) return;
    if (document.hidden) {
        updateDoc(attemptRef, { tabSwitchCount: increment(1) }).catch(() => {});
        const banner = document.createElement('div');
        banner.className = 'warn-banner';
        banner.innerHTML =
            '<i class="fas fa-triangle-exclamation"></i> Diqqat: sahifadan chiqib ketishingiz qayd etildi. Bir necha marta takrorlansa, test avtomatik yakunlanadi.';
        questionsCard.prepend(banner);
    }
}

function handleBeforeUnload(e) {
    if (submitted) return;
    e.preventDefault();
    e.returnValue = '';
}

async function submitTest() {
    if (submitted) return;
    submitted = true;
    clearInterval(timerInterval);
    window.removeEventListener('beforeunload', handleBeforeUnload);
    document.removeEventListener('visibilitychange', handleVisibilityChange);

    let score = 0;
    questionOrder.forEach((origIdx, qi) => {
        const q = testData.questions[origIdx];
        if (answers[qi] === q.correctIndex) score++;
    });

    try {
        await updateDoc(attemptRef, {
            answers,
            score,
            totalQuestions: questionOrder.length,
            status: 'submitted',
            submittedAt: serverTimestamp(),
        });
    } catch (err) {
        console.error('Natijani saqlashda xatolik:', err);
    }

    if (window.ZiyomapUsage) {
        ZiyomapUsage.logUsage('test-topshirish', 'Test topshirildi: ' + (testData.title || ''));
    }

    topBar.style.display = 'none';
    questionsCard.style.display = 'none';
    resultCard.style.display = 'block';
    document.getElementById('resultScoreText').textContent = `${score}/${questionOrder.length}`;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 150));
} else {
    setTimeout(init, 150);
}
