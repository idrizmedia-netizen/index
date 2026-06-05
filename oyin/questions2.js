/**
 * Ziyomap Games — QO'SHIMCHA SAVOLLAR (2-fayl)
 * Yangi savollar qo'shish uchun shu faylni tahrirlang.
 * questions-loader.js avtomatik birlashtiradi.
 */

const QUIZ_QUESTIONS_2 = {
  fizika: [
    { q: "Yorug'likning to'lqin uzunligi va chastota bog'lanishi?",
      a: 1, o: ["λ = f/c","λ = c/f","λ = c·f","λ = f²/c"],
      e: "λ = c/f — to'lqin tezligi = chastota × uzunlik.", d: "medium" },
    { q: "Ideal gaz molekulalarining o'zaro ta'siri?",
      a: 2, o: ["Kuchli","O'rtacha","Yo'q","Faqat tortishish"],
      e: "Ideal gazda molekulalar o'rtasida o'zaro ta'sir yo'q deb olinadi.", d: "hard" },
    { q: "Magnit maydon chiziqlari qayerdan chiqadi?",
      a: 0, o: ["Shimol qutbidan","Janub qutbidan","Markazdan","Atrofdan"],
      e: "Magnit maydon chiziqlari shimol qutbidan chiqib janubga kiradi.", d: "easy" },
  ],
  matematika: [
    { q: "2³ × 2² = ?",
      a: 1, o: ["2⁵","2⁶","4⁵","2⁹"],
      e: "2³ × 2² = 2⁵ = 32.", d: "easy" },
    { q: "√144 = ?",
      a: 2, o: ["11","13","12","14"],
      e: "12 × 12 = 144.", d: "easy" },
    { q: "Lim (x→0) sin(x)/x = ?",
      a: 0, o: ["1","0","∞","π"],
      e: "Bu klassik limit = 1.", d: "hard" },
  ],
  informatika: [
    { q: "IPv4 manzil necha bit?",
      a: 2, o: ["16","64","32","128"],
      e: "IPv4 — 32 bit (4 oktet).", d: "medium" },
    { q: "Stack ma'lumotlar tuzilmasi printsipi?",
      a: 0, o: ["LIFO","FIFO","LILO","Random"],
      e: "Stack — Last In, First Out.", d: "medium" },
  ],
  biologiya: [
    { q: "Fotosintezda qaysi gaz chiqadi?",
      a: 1, o: ["CO₂","O₂","N₂","H₂"],
      e: "Fotosintez mahsuloti — kislorod (O₂).", d: "easy" },
    { q: "Inson qonidagi gemoglobin vazifasi?",
      a: 0, o: ["Kislorod tashish","Ovqat hazm qilish","Immunitet","Qon ivish"],
      e: "Gemoglobin kislorodni o'pkadan organizmga yetkazadi.", d: "easy" },
  ],
  kimyo: [
    { q: "Suvning qaynash harorati (1 atm)?",
      a: 2, o: ["0°C","50°C","100°C","200°C"],
      e: "Suv 100°C da qaynaydi (standart bosimda).", d: "easy" },
    { q: "Eng yengil element?",
      a: 0, o: ["Vodorod","Geliy","Litiy","Uglerod"],
      e: "Vodorod (H) — eng yengil element.", d: "easy" },
  ],
  tarix: [
    { q: "Buyuk Ipak yo'li qaysi qit'alar o'rtasida?",
      a: 1, o: ["Afrika-Amerika","Osiyo-Yevropa","Osiyo-Afrika","Amerika-Yevropa"],
      e: "Ipak yo'li Osiyo va Yevropani bog'lagan.", d: "easy" },
    { q: "O'zbekiston mustaqilligi e'lon qilingan yil?",
      a: 0, o: ["1991","1989","1993","1985"],
      e: "1991 yil 31 avgust — mustaqillik.", d: "easy" },
  ],
  ingliz: [
    { q: "'Quickly' qaysi so'z turiga kiradi?",
      a: 2, o: ["Noun","Verb","Adverb","Adjective"],
      e: "Quickly — ravish (adverb).", d: "easy" },
    { q: "Past participle of 'write'?",
      a: 1, o: ["wrote","written","writing","writed"],
      e: "write — wrote — written.", d: "medium" },
  ],
  geografiya: [
    { q: "O'zbekiston qaysi qit'ada?",
      a: 0, o: ["Osiyo","Yevropa","Afrika","Amerika"],
      e: "O'zbekiston Osiyo qit'asida.", d: "easy" },
    { q: "Eng katta cho'l (issiq)?",
      a: 2, o: ["Gobi","Kalahari","Sahara","Karakum"],
      e: "Sahara — dunyodagi eng katta issiq cho'l.", d: "easy" },
  ],
};

const MEMORY_PAIRS_2 = {
  fizika: [
    { term: "Nyuton", definition: "F = ma muallifi" },
    { term: "Einstein", definition: "E = mc² muallifi" },
  ],
  matematika: [
    { term: "Pifagor", definition: "a²+b²=c²" },
    { term: "Faktorial", definition: "n! = 1×2×...×n" },
  ],
};

const PUZZLE_WORDS_2 = {
  fizika: [
    { word: "FOTON", hint: "Yorug'lik zarrachasi" },
    { word: "IMPULS", hint: "p = mv" },
  ],
  informatika: [
    { word: "ALGORITM", hint: "Muammoni yechish tartibi" },
    { word: "DEBUG", hint: "Xatolarni topish" },
  ],
};

const TEZKOR_QUESTIONS_2 = {
  fizika: [
    { q: "Yorug'lik tezligi (km/s)?", a: "300000" },
    { q: "g (m/s²)?", a: "9.8" },
  ],
  matematika: [
    { q: "π (2 xonali)?", a: "3.14" },
    { q: "7×8?", a: "56" },
  ],
  informatika: [
    { q: "1 KB = ? bayt", a: "1024" },
    { q: "CPU nima?", a: "processor" },
  ],
};

const FLASHCARD_CARDS_2 = {
  biologiya: [
    { q: "Mitoxondriya vazifasi?", a: "Hujara energiyasi markazi (ATP ishlab chiqaradi)" },
    { q: "Xloroplast vazifasi?", a: "Fotosintez organoidi — yashil rang" },
  ],
  kimyo: [
    { q: "NaCl nima?", a: "Osh tuzi — natriy xlorid" },
    { q: "pH = 7 nimani bildiradi?", a: "Neytral eritma" },
  ],
  tarix: [
    { q: "1991-yil 31-avgust", a: "O'zbekiston mustaqilligi e'lon qilindi" },
    { q: "Temur kim?", a: "XIV asr buyuk sarkarda va davlat arbobi" },
  ],
};

const TRUE_FALSE_2 = {
  fizika: [
    { s: "Yorug'lik vakuumda ham tarqaladi", a: true, e: "Ha — vakuumda c ≈ 300,000 km/s tezlikda." },
    { s: "Ohm qonuniga ko'ra I = U × R", a: false, e: "I = U/R — tok kuchi kuchlanish va qarshilik nisbati." },
    { s: "Gravitatsiya tezlanishi Yerdada 9.8 m/s² ga yaqin", a: true, e: "g ≈ 9.8 m/s² — standart qiymat." },
    { s: "Issiqlik har doim issiq joydan sovuq joyga o'tadi", a: true, e: "Ikkinchi termodinamika qonuni." },
  ],
  matematika: [
    { s: "Har qanday juft son 2 ga bo'linadi", a: true, e: "Juft son — 2 ning karralisi." },
    { s: "π = 3.14 aniq qiymat", a: false, e: "π — cheksiz o'nlik kasr (≈ 3.14159...)." },
    { s: "Manfiy sonning kvadrati musbat", a: true, e: "(-a)² = a² ≥ 0." },
  ],
  informatika: [
    { s: "RAM — doimiy xotira", a: false, e: "RAM vaqtinchalik; doimiy — ROM/SSD." },
    { s: "1 bayt = 8 bit", a: true, e: "Standart birlik." },
    { s: "HTML — dasturlash tili", a: false, e: "HTML — belgilash (markup) tili." },
  ],
  biologiya: [
    { s: "Fotosintezda O₂ chiqadi", a: true, e: "Suv molekulasidan kislorod ajraladi." },
    { s: "Odamda 206 ta suyak bor (o'rtacha)", a: true, e: "Voyaga yetgan odamda ~206 ta suyak." },
  ],
  kimyo: [
    { s: "Suvning qaynash harorati 100°C (1 atm)", a: true, e: "Standart atmosfera bosimida." },
    { s: "NaCl — kislota", a: false, e: "NaCl — tuz (neytral tuz)." },
  ],
  tarix: [
    { s: "O'zbekiston 1991-yilda mustaqillik oldi", a: true, e: "31 avgust 1991 — mustaqillik." },
    { s: "Buyuk Ipak yo'li faqat Yevropada o'tgan", a: false, e: "Osiyo va Yevropani bog'lagan." },
  ],
  ingliz: [
    { s: "'Quickly' — ravish (adverb)", a: true, e: "Quick (sifat) + -ly = quickly." },
    { s: "Past simple of 'go' is 'goed'", a: false, e: "go — went — gone." },
  ],
  geografiya: [
    { s: "O'zbekiston Osiyo qit'asida", a: true, e: "Markaziy Osiyo — Osiyo qit'asi." },
    { s: "Sahara — eng katta cho'l", a: true, e: "Issiq cho'llar ichida eng katta." },
  ],
};

const ORDER_QUESTIONS_2 = {
  tarix: [
    { prompt: "Quyidagi voqealarni xronologik tartibda joylashtiring (eski → yangi):",
      items: ["Temuriylar davri", "O'zbekiston mustaqilligi", "Amir Temur saltanati", "Konstitutsiya qabul qilindi (1992)"],
      order: [0, 2, 1, 3] },
    { prompt: "Tarixiy davrlarni eskidan yangiga tartiblang:",
      items: ["Neolit davri", "O'rta asrlar", "Temuriylar", "Zamonaviy davr"],
      order: [0, 1, 2, 3] },
  ],
  fizika: [
    { prompt: "Fizik kattaliklarni o'lchov birliklari bilan moslang (kichik → katta):",
      items: ["Millimetr", "Metr", "Kilometr", "Santimetr"],
      order: [0, 3, 1, 2] },
  ],
  matematika: [
    { prompt: "Sonlarni o'sish tartibida joylashtiring:",
      items: ["-3", "0", "2", "5"],
      order: [0, 1, 2, 3] },
  ],
  informatika: [
    { prompt: "Xotira birliklarini kichikdan kattaga tartiblang:",
      items: ["Bit", "Kilobayt", "Bayt", "Megabayt"],
      order: [0, 2, 1, 3] },
  ],
  biologiya: [
    { prompt: "Organizm tuzilishini sodda → murakkab tartiblang:",
      items: ["Hujara", "Organ", "Organizm", "To'qima"],
      order: [0, 3, 1, 2] },
  ],
  kimyo: [
    { prompt: "Moddalar holatini (odatda 25°C) tartiblang — qattiq dan suyuq:",
      items: ["Temir", "Suv", "Xlork", "Rux"],
      order: [0, 3, 2, 1] },
  ],
  ingliz: [
    { prompt: "Ingliz alifbosini tartiblang:",
      items: ["C", "A", "B", "D"],
      order: [1, 2, 0, 3] },
  ],
  geografiya: [
    { prompt: "Geografik ob'ektlarni o'lcham bo'yicha (kichik → katta):",
      items: ["Mamlakat", "Qit'a", "Shahar", "Dunyo"],
      order: [2, 0, 1, 3] },
  ],
};
