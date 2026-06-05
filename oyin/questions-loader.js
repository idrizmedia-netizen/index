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
})();
