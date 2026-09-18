/**
 * Ziyomap Games — savollar fayllarini birlashtiradi.
 * questions.js + questions2.js (+ kelajakda questions3.js ...)
 */
(function () {
    function mergeBySubject(base, extra) {
        const out = {};
        const keys = new Set([...Object.keys(base || {}), ...Object.keys(extra || {})]);
        keys.forEach((k) => {
            out[k] = [...(base?.[k] || []), ...(extra?.[k] || [])];
        });
        return out;
    }

    if (typeof QUIZ_QUESTIONS !== 'undefined') {
        window.QUIZ_QUESTIONS = mergeBySubject(
            QUIZ_QUESTIONS,
            typeof QUIZ_QUESTIONS_2 !== 'undefined' ? QUIZ_QUESTIONS_2 : {}
        );
    }
    if (typeof FLASHCARD_CARDS !== 'undefined') {
        window.FLASHCARD_CARDS = mergeBySubject(
            FLASHCARD_CARDS,
            typeof FLASHCARD_CARDS_2 !== 'undefined' ? FLASHCARD_CARDS_2 : {}
        );
    }
    if (typeof TEZKOR_QUESTIONS !== 'undefined') {
        window.TEZKOR_QUESTIONS = mergeBySubject(
            TEZKOR_QUESTIONS,
            typeof TEZKOR_QUESTIONS_2 !== 'undefined' ? TEZKOR_QUESTIONS_2 : {}
        );
    }
    if (typeof PUZZLE_WORDS !== 'undefined') {
        window.PUZZLE_WORDS = mergeBySubject(
            PUZZLE_WORDS,
            typeof PUZZLE_WORDS_2 !== 'undefined' ? PUZZLE_WORDS_2 : {}
        );
    }
    if (typeof MEMORY_PAIRS !== 'undefined') {
        window.MEMORY_PAIRS = mergeBySubject(
            MEMORY_PAIRS,
            typeof MEMORY_PAIRS_2 !== 'undefined' ? MEMORY_PAIRS_2 : {}
        );
    }
    if (typeof MATCH_PAIRS !== 'undefined') {
        window.MATCH_PAIRS = mergeBySubject(
            MATCH_PAIRS,
            typeof MATCH_PAIRS_2 !== 'undefined' ? MATCH_PAIRS_2 : {}
        );
    }
    if (typeof TRUE_FALSE_2 !== 'undefined') {
        window.TRUE_FALSE = mergeBySubject(
            typeof TRUE_FALSE !== 'undefined' ? TRUE_FALSE : {},
            TRUE_FALSE_2
        );
    } else if (typeof TRUE_FALSE !== 'undefined') {
        window.TRUE_FALSE = TRUE_FALSE;
    }
    if (typeof ORDER_QUESTIONS_2 !== 'undefined') {
        window.ORDER_QUESTIONS = mergeBySubject(
            typeof ORDER_QUESTIONS !== 'undefined' ? ORDER_QUESTIONS : {},
            ORDER_QUESTIONS_2
        );
    } else if (typeof ORDER_QUESTIONS !== 'undefined') {
        window.ORDER_QUESTIONS = ORDER_QUESTIONS;
    }

    window.ZiyomapQuestions = {
        mergeBySubject,
        fanIds() {
            return Object.keys(window.QUIZ_QUESTIONS || {});
        },
        countQuiz(fan) {
            return (window.QUIZ_QUESTIONS?.[fan] || []).length;
        },
    };

    /* ── Admin panel orqali yuklangan qo'shimcha savollarni Firestore'dan olib qo'shamiz ──
       Diqqat: bu ASINXRON — sahifa ochilgan zahoti ko'rinadigan "N ta savol" hisoblagichi
       biroz keyinroq yangilanishi mumkin, lekin o'yin BOSHLANGANDA (foydalanuvchi tugma
       bosgandan keyin) savollar to'plamiga albatta ulangan bo'ladi. ──*/
    const GAME_TYPE_TO_VAR = {
        quiz: 'QUIZ_QUESTIONS',
        flashcard: 'FLASHCARD_CARDS',
        tezkor: 'TEZKOR_QUESTIONS',
        puzzle: 'PUZZLE_WORDS',
        memory: 'MEMORY_PAIRS',
    };

    window.ZiyomapOyinReady = (async function loadAdminOyinSavollar() {
        try {
            const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js');
            const { getFirestore, collection, getDocs } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js');
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
            const snap = await getDocs(collection(db, 'oyin-savollar'));
            snap.forEach((d) => {
                const data = d.data();
                const varName = GAME_TYPE_TO_VAR[data.gameType];
                if (!varName || !data.subject || !Array.isArray(data.items)) return;
                if (!window[varName]) window[varName] = {};
                window[varName][data.subject] = [...(window[varName][data.subject] || []), ...data.items];
            });
            window.dispatchEvent(new CustomEvent('ziyomap:oyin-savollar-updated'));
        } catch (err) {
            console.error("Admin qo'shgan o'yin savollarini yuklashda xatolik:", err);
        }
    })();
})();
