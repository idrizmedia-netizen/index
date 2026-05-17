// index/js/savollar.js
const ZiyomapBaza = {
  
  // ========================================================
  // 1. QUIZ MUSOBAQA SAVOLLARI (Fanlar va Darajalar bo'yicha)
  // ========================================================
  quiz: {
    fizika: {
      oson: [
        {
          question: "Tezlik qaysi harf bilan belgilanadi?",
          options: ["v", "m", "F", "t"],
          answer: "v"
        }
      ],
      orta: [],
      qiyin: []
    },
    matematika: { oson: [], orta: [], qiyin: [] },
    informatika: { oson: [], orta: [], qiyin: [] },
    biologiya: { oson: [], orta: [], qiyin: [] },
    kimyo: { oson: [], orta: [], qiyin: [] },
    tarix: { oson: [], orta: [], qiyin: [] },
    ingliztili: { oson: [], orta: [], qiyin: [] },
    geografiya: { oson: [], orta: [], qiyin: [] }
  },

  // ========================================================
  // 2. FLASHCARD SAVOLLARI (Savol va orqasidagi Javob)
  // ========================================================
  flashcard: {
    fizika: [
      { question: "Nyutonning 2-qonuni formulasi?", answer: "F = m * a" },
      { question: "Zichlik birligi nima?", answer: "kg/m³" }
    ],
    matematika: [
      { question: "Kvadratning yuzi formulasi?", answer: "S = a²" }
    ],
    informatika: [],
    biologiya: [],
    kimyo: [],
    tarix: [],
    ingliztili: [],
    geografiya: []
  },

  // ========================================================
  // 3. TEZKOR JAVOB SAVOLLARI (Tezkor yoziladigan aniq javoblar)
  // ========================================================
  tezkor: {
    matematika: [
      { question: "5 * 5 nechaga teng?", answer: "25" },
      { question: "121 ning ildizi nechaga teng?", answer: "11" }
    ],
    fizika: [
      { question: "Kuchni o'lchaydigan asbob?", answer: "Dinamometr" }
    ],
    informatika: [],
    biologiya: [],
    kimyo: [],
    tarix: [],
    ingliztili: [],
    geografiya: []
  }

};
