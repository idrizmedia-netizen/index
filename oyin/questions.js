/**
 * ============================================================
 *  ZIYOMAP GAMES — SAVOLLAR FAYLI
 *  Faqat shu faylni tahrirlang, o'yin kodlariga tegmang!
 * ============================================================
 *
 *  TUZILISH:
 *  - QUIZ_QUESTIONS   → quiz.html uchun (4 variantli test)
 *  - FLASHCARD_CARDS  → flashcard.html uchun (savol-javob kartalari)
 *  - TEZKOR_QUESTIONS → tezkor.html uchun (tez javob)
 *  - PUZZLE_WORDS     → puzzle.html uchun (so'z topish)
 *  - MEMORY_PAIRS     → memory.html uchun (juft topish)
 *
 *  HAR BIR FAN UCHUN ALOHIDA BO'LIM BOR:
 *  fizika | matematika | informatika | biologiya | kimyo | tarix | ingliz | geografiya
 *
 *  SAVOL QO'SHISH/O'ZGARTIRISH:
 *  1. Kerakli o'yin va fan bo'limini toping
 *  2. Yangi savol ob'ekti qo'shing (namunadagi formatda)
 *  3. Faylni saqlang — o'yin avtomatik yangilanadi
 * ============================================================
 */

// ============================================================
//  1. QUIZ SAVOLLARI  (quiz.html ishlatadi)
//  Format: { q, a, o:[A,B,C,D], e, d }
//    q = savol matni
//    a = to'g'ri javob indeksi (0,1,2,3)
//    o = 4 ta variant [A, B, C, D]
//    e = tushuntirish (javobdan keyin ko'rsatiladi)
//    d = qiyinlik: "easy" | "medium" | "hard"
// ============================================================
const QUIZ_QUESTIONS = {

  fizika: [
    { q: "Yorug'lik vakuumda qanday tezlikda tarqaladi?",
      a: 1, o: ["100,000 km/s","300,000 km/s","150,000 km/s","500,000 km/s"],
      e: "Yorug'lik tezligi c ≈ 3×10⁸ m/s = 300,000 km/s.", d: "easy" },

    { q: "Nyutonning ikkinchi qonuni formulasi?",
      a: 0, o: ["F = ma","E = mc²","P = mv","W = Fd"],
      e: "F = ma — kuch massa va tezlanish ko'paytmasiga teng.", d: "easy" },

    { q: "Ohm qonuniga ko'ra tok kuchi I = ?",
      a: 2, o: ["U × R","R / U","U / R","U + R"],
      e: "I = U/R — Ohm qonuni.", d: "easy" },

    { q: "Gravitatsiya tezlanishi Yorda qancha?",
      a: 0, o: ["9.8 m/s²","6.7 m/s²","12 m/s²","3.7 m/s²"],
      e: "g ≈ 9.8 m/s² Yer yuzasida.", d: "easy" },

    { q: "1 kVt necha Vt?",
      a: 3, o: ["10 Vt","100 Vt","10,000 Vt","1000 Vt"],
      e: "1 kVt = 1000 Vt.", d: "easy" },

    { q: "Elektr quvvati P = ?",
      a: 2, o: ["P = I/U","P = R·I","P = U·I","P = U²/I"],
      e: "P = U·I — quvvat formulasi.", d: "medium" },

    { q: "1 atm bosim necha Pa?",
      a: 1, o: ["10,000 Pa","101,325 Pa","100,000 Pa","98,000 Pa"],
      e: "1 atm = 101,325 Pa.", d: "medium" },

    { q: "Arximed kuchi formulasi?",
      a: 0, o: ["F = ρgV","F = mg","F = ma","F = kx"],
      e: "Arximed kuchi F = ρ·g·V.", d: "medium" },

    { q: "Plank doimiysi belgisi?",
      a: 0, o: ["h","k","R","G"],
      e: "Plank doimiysi h = 6.626×10⁻³⁴ J·s.", d: "hard" },

    { q: "Doppler effekti nima?",
      a: 1, o: ["Optik illyuziya","To'lqin chastotasining o'zgarishi","Magnit maydon","Yorug'lik sinishi"],
      e: "Doppler effekti — manba harakatida to'lqin chastotasining o'zgarishi.", d: "hard" },

    { q: "Atom yadrosini kim kashf etdi?",
      a: 2, o: ["Bor","Tomson","Rezerford","Kyuri"],
      e: "Ernest Rezerford 1911 yilda atom yadrosini kashf etdi.", d: "medium" },

    { q: "Magnit induksiyasining SI birligi?",
      a: 2, o: ["Veber","Genri","Tesla","Farad"],
      e: "Magnit induksiyasi B ning birligi Tesla (T).", d: "medium" },

    { q: "Issiqlik miqdori formulasi?",
      a: 1, o: ["Q = mc","Q = mcΔT","Q = mΔT","Q = cΔT"],
      e: "Q = m·c·ΔT — massa × solishtirma issiqlik × temperatura o'zgarishi.", d: "medium" },

    { q: "Yorug'lik sinishi qonuni (Snell)?",
      a: 0, o: ["n₁sinθ₁ = n₂sinθ₂","n₁cosθ₁ = n₂cosθ₂","n₁/n₂ = sinθ","n = c/v faqat"],
      e: "Snell qonuni: n₁·sin(θ₁) = n₂·sin(θ₂).", d: "hard" },

    { q: "Radioaktiv yarim yemirilish davri nima?",
      a: 2, o: ["To'liq yemirilish vaqti","Yadroning yoshi","Moddaning yarmi yemiriladigan vaqt","Proton soni"],
      e: "Yarim yemirilish davri — radioaktiv moddaning yarmi yemiriladigan vaqt.", d: "hard" },
  ],

  matematika: [
    { q: "π (pi) ning taxminiy qiymati?",
      a: 0, o: ["3.14159","3.12345","3.16000","3.10000"],
      e: "π ≈ 3.14159265...", d: "easy" },

    { q: "log₂(8) = ?",
      a: 2, o: ["2","4","3","1"],
      e: "2³ = 8, shuning uchun log₂(8) = 3.", d: "easy" },

    { q: "sin(90°) = ?",
      a: 3, o: ["0","√2/2","√3/2","1"],
      e: "sin(90°) = 1.", d: "easy" },

    { q: "cos(0°) = ?",
      a: 2, o: ["0","1/2","1","√3/2"],
      e: "cos(0°) = 1.", d: "easy" },

    { q: "5! (besh faktorial) = ?",
      a: 1, o: ["100","120","60","24"],
      e: "5! = 1×2×3×4×5 = 120.", d: "easy" },

    { q: "Kvadrat tenglama D > 0 nima bildiradi?",
      a: 1, o: ["Ildizlar yo'q","Ikki haqiqiy ildiz","Bitta ildiz","Kompleks ildizlar"],
      e: "D > 0 → ikki xil haqiqiy ildiz mavjud.", d: "medium" },

    { q: "Arifmetik progressiya n-hadi formulasi?",
      a: 0, o: ["a₁+(n−1)d","a₁×dⁿ","a₁+nd","a₁−nd"],
      e: "aₙ = a₁ + (n−1)·d.", d: "medium" },

    { q: "(a+b)² = ?",
      a: 0, o: ["a²+2ab+b²","a²+b²","a²−2ab+b²","2(a+b)"],
      e: "(a+b)² = a² + 2ab + b².", d: "easy" },

    { q: "∫x dx = ?",
      a: 2, o: ["x","x²","x²/2+C","2x+C"],
      e: "∫x dx = x²/2 + C.", d: "hard" },

    { q: "Vektorlar skalyar ko'paytmasi a·b = ?",
      a: 1, o: ["|a|×|b|","|a||b|cos(θ)","a+b","|a||b|sin(θ)"],
      e: "a·b = |a||b|·cos(θ).", d: "medium" },

    { q: "Uchburchak ichki burchaklar yig'indisi?",
      a: 2, o: ["90°","270°","180°","360°"],
      e: "Uchburchak burchaklari yig'indisi 180°.", d: "easy" },

    { q: "Geometric progressiya cheksiz yig'indisi (|q|<1)?",
      a: 2, o: ["a₁/(1+q)","a₁·q","a₁/(1−q)","a₁/(q−1)"],
      e: "S∞ = a₁/(1−q) faqat |q|<1 da.", d: "hard" },

    { q: "e (Eyler soni) taxminiy qiymati?",
      a: 1, o: ["2.51828","2.71828","2.81828","3.14159"],
      e: "e ≈ 2.71828... — tabiiy logarifm asosi.", d: "medium" },

    { q: "Kombinatsiya C(n,k) formulasi?",
      a: 0, o: ["n!/(k!(n−k)!)","n!/k!","n!/(n−k)!","k!/(n−k)!"],
      e: "C(n,k) = n! / (k! × (n−k)!)", d: "hard" },

    { q: "Doira yuzasi formulasi?",
      a: 1, o: ["2πr","πr²","πd","2πr²"],
      e: "S = π·r² — doira yuzasi.", d: "easy" },
  ],

  informatika: [
    { q: "Ikkilikda 1010₂ = ? (o'nlik)",
      a: 2, o: ["8","12","10","14"],
      e: "1×8+0×4+1×2+0×1 = 10.", d: "easy" },

    { q: "HTML qisqartmasi?",
      a: 0, o: ["HyperText Markup Language","High Text Making Lang","Hyper Typing Module","HyperText Making Links"],
      e: "HTML = HyperText Markup Language.", d: "easy" },

    { q: "HTTP 404 nima?",
      a: 1, o: ["Server xatosi","Sahifa topilmadi","Muvaffaqiyatli","Yo'naltirish"],
      e: "404 Not Found — sahifa topilmadi.", d: "easy" },

    { q: "RAM qisqartmasi?",
      a: 0, o: ["Random Access Memory","Read All Memory","Rapid Access Module","Run And Monitor"],
      e: "RAM = Random Access Memory — operativ xotira.", d: "easy" },

    { q: "Qaysi saralash O(n log n) kafolatli?",
      a: 3, o: ["Bubble sort","Selection sort","Insertion sort","Merge sort"],
      e: "Merge sort har doim O(n log n) da ishlaydi.", d: "medium" },

    { q: "TCP/IP modelida necha qatlam?",
      a: 1, o: ["3","4","5","7"],
      e: "TCP/IP = 4 qatlam: tarmoq, internet, transport, ilova.", d: "medium" },

    { q: "OOP da encapsulation nima?",
      a: 2, o: ["Meros olish","Polimorfizm","Ma'lumot yashirish","Abstraktsiya"],
      e: "Encapsulation — ma'lumot va metodlarni yashirish prinsipi.", d: "hard" },

    { q: "SQL DISTINCT nima qiladi?",
      a: 0, o: ["Takrorlanmas qiymat qaytaradi","Saralaydi","Bo'sh o'chiradi","Birlashtiradi"],
      e: "DISTINCT — takrorlanuvchi qatorlarni olib tashlaydi.", d: "medium" },

    { q: "git stash nima qiladi?",
      a: 1, o: ["O'chiradi","Vaqtincha saqlaydi","Branch yaratadi","Push qiladi"],
      e: "git stash — commit qilinmagan o'zgarishlarni vaqtincha saqlaydi.", d: "hard" },

    { q: "Python listining asosiy xususiyati?",
      a: 2, o: ["Immutable","Faqat int","Mutable (o'zgaruvchan)","Faqat str"],
      e: "Python list mutable — yaratilgandan so'ng o'zgartirilishi mumkin.", d: "easy" },

    { q: "DNS nima?",
      a: 2, o: ["Tarmoq kabeli","Operatsion tizim","Domen nomini IP ga aylantirish","Antivirus"],
      e: "DNS = Domain Name System.", d: "medium" },

    { q: "Big O notatsiyasida O(1) nima?",
      a: 1, o: ["Juda sekin","Doimiy vaqt","Chiziqli","Logaritmik"],
      e: "O(1) = constant time — kirish hajmidan qat'iy nazar bir xil vaqt.", d: "hard" },

    { q: "CSS Flexbox da justify-content nima?",
      a: 0, o: ["Gorizontal tekislash","Vertikal tekislash","Shrift o'lchami","Chegara"],
      e: "justify-content — elementlarni asosiy o'q bo'ylab tekislaydi.", d: "medium" },

    { q: "REST API da DELETE method nima qiladi?",
      a: 0, o: ["Ma'lumot o'chiradi","Ma'lumot oladi","Yangilaydi","Qo'shadi"],
      e: "HTTP DELETE — resursni o'chirish uchun ishlatiladi.", d: "medium" },

    { q: "Boolean qiymatlar?",
      a: 1, o: ["0 va 1 faqat","True va False","Yes va No","On va Off"],
      e: "Boolean = True (1) va False (0).", d: "easy" },
  ],

  biologiya: [
    { q: "ATP ishlab chiqaradigan organell?",
      a: 2, o: ["Yadro","Ribosoma","Mitoxondriya","Plastida"],
      e: "Mitoxondriya — hujayra nafas olish organi, ATP sintezi.", d: "easy" },

    { q: "DNK ning to'liq nomi?",
      a: 0, o: ["Dezoksiribonuklein kislota","Dinukleotid kislota","Diploid nukleotid","Difuziyali nukleotid"],
      e: "DNK = Dezoksiribonuklein kislota.", d: "easy" },

    { q: "Fotosintez qaysi organellda?",
      a: 1, o: ["Mitoxondriya","Xloroplast","Yadro","Vakuol"],
      e: "Xloroplast — fotosintez joyi.", d: "easy" },

    { q: "Inson genomi taxminan nechta gen?",
      a: 2, o: ["1,000","100,000","20,000–25,000","500,000"],
      e: "~20,000–25,000 gen.", d: "hard" },

    { q: "Immunitet asosiy hujayralari?",
      a: 0, o: ["Leykositlar","Eritrositlar","Trombositlar","Neyrositlar"],
      e: "Leykositlar — oq qon hujayralari, immunitet asosi.", d: "medium" },

    { q: "Hujayra bo'linishining ikki asosiy turi?",
      a: 1, o: ["Mitoz va fuziya","Mitoz va meyoz","Meyoz va fertilizatsiya","Apoptoz va meyoz"],
      e: "Mitoz (somatik) va meyoz (jinsiy) bo'linish.", d: "medium" },

    { q: "Qon guruhlari nechi xil (ABO)?",
      a: 2, o: ["2","3","4","6"],
      e: "ABO sistemasida 4 qon guruhi: O, A, B, AB.", d: "easy" },

    { q: "Evolyutsiya nazariyasi muallifi?",
      a: 3, o: ["Mendel","Pastyor","Watson","Darvin"],
      e: "Charlz Darvin — tabiy tanlanish yo'li bilan evolyutsiya nazariyasi.", d: "easy" },

    { q: "Hujayra membranasi asosi?",
      a: 0, o: ["Ikki qavat fosfolipid","Oqsil qavati","DNK","Sellyuloza"],
      e: "Hujayra membranasi — ikki qavat fosfolipid + oqsillar.", d: "medium" },

    { q: "Ferment (enzim) nima?",
      a: 2, o: ["Lipid","Vitamin","Biologik katalizator","Mineral"],
      e: "Ferment — reaksiyani tezlashtiradigan biologik katalizator (oqsil).", d: "medium" },

    { q: "Fotosintez umumiy tenglamasi?",
      a: 1, o: ["CO₂+H₂O→O₂","6CO₂+6H₂O→C₆H₁₂O₆+6O₂","C₆H₁₂O₆→CO₂+H₂O","O₂+CO₂→H₂O"],
      e: "6CO₂ + 6H₂O + yorug'lik → C₆H₁₂O₆ + 6O₂", d: "medium" },

    { q: "Yadro vazifasi?",
      a: 0, o: ["DNK saqlash va boshqarish","Energiya ishlab chiqarish","Oqsil sintezi","Nafas olish"],
      e: "Yadro — DNK saqlash va hujayra faoliyatini boshqarish.", d: "easy" },
  ],

  kimyo: [
    { q: "Suvning kimyoviy formulasi?",
      a: 1, o: ["HO","H₂O","H₂O₂","OH₂"],
      e: "H₂O — ikki vodorod, bir kislorod.", d: "easy" },

    { q: "Birinchi element davriy jadvalda?",
      a: 0, o: ["Vodorod (H)","Geliy (He)","Litiy (Li)","Berilliy (Be)"],
      e: "H — atom raqami 1.", d: "easy" },

    { q: "pH = 7 qanday eritma?",
      a: 2, o: ["Kislotali","Ishqoriy","Neytral","O'ta kislotali"],
      e: "pH 7 = neytral (toza suv).", d: "easy" },

    { q: "NaCl bog' turi?",
      a: 0, o: ["Ion bog'","Kovalent","Metall","Vodorod"],
      e: "NaCl — Na⁺ va Cl⁻ o'rtasidagi ion bog'.", d: "medium" },

    { q: "Avogadro soni?",
      a: 2, o: ["3.01×10²³","3.16×10²³","6.022×10²³","9.8×10²³"],
      e: "Nₐ ≈ 6.022×10²³ zarrcha/mol.", d: "medium" },

    { q: "Ideal gaz tenglamasi?",
      a: 0, o: ["PV = nRT","PV = mRT","P = nRT/m","PV = RT"],
      e: "PV = nRT — ideal gaz holat tenglamasi.", d: "medium" },

    { q: "Oksidlanish nima?",
      a: 1, o: ["Elektron olish","Elektron berish","Proton berish","Proton olish"],
      e: "Oksidlanish — elektron berish jarayoni.", d: "hard" },

    { q: "Benzol formulasi?",
      a: 1, o: ["C₆H₁₂","C₆H₆","C₅H₅","C₆H₁₂O₆"],
      e: "Benzol C₆H₆ — aromatik uglevodorod.", d: "medium" },

    { q: "Mis (Cu) ning atom raqami?",
      a: 2, o: ["26","28","29","30"],
      e: "Cu — mis, atom raqami 29.", d: "hard" },

    { q: "Organik kimyoda asosiy element?",
      a: 1, o: ["Kislorod","Uglerod","Azot","Vodorod"],
      e: "Uglerod (C) — organik kimyo asosi.", d: "medium" },

    { q: "Davriy jadvalda nechta guruh bor?",
      a: 2, o: ["7","14","18","20"],
      e: "Davriy jadvalda 18 ta guruh mavjud.", d: "medium" },

    { q: "Elektrolitik dissotsiatsiya nima?",
      a: 0, o: ["Ionlarga ajralish","Atom parchalanish","Molekula birikish","Oksidlanish"],
      e: "Dissotsiatsiya — erituvchida ionlarga ajralish.", d: "hard" },
  ],

  tarix: [
    { q: "Amir Temur qaysi yili tug'ilgan?",
      a: 0, o: ["1336","1356","1370","1300"],
      e: "Amir Temur 1336 yil 8 aprel, Shahrisabz.", d: "easy" },

    { q: "I Jahon urushi yillari?",
      a: 0, o: ["1914-1918","1939-1945","1912-1916","1917-1921"],
      e: "I Jahon urushi 1914–1918 yillar.", d: "easy" },

    { q: "O'zbekiston mustaqillik yili?",
      a: 1, o: ["1990","1991","1992","1993"],
      e: "1991 yil 1 sentabr.", d: "easy" },

    { q: "Renessans qayerda boshlangan?",
      a: 0, o: ["Italiya","Fransiya","Germaniya","Ispaniya"],
      e: "Renessans XIV–XVII asrlarda Italiyada boshlangan.", d: "medium" },

    { q: "Al-Xorazmiy kim?",
      a: 1, o: ["Fizik","Matematik va astronom","Shifokor","Shoir"],
      e: "IX asr matematik, algebra asoschisi, algoritm atamasi undan.", d: "easy" },

    { q: "Gutenberg nima ixtiro qildi?",
      a: 2, o: ["Telegraf","Kompas","Bosmaxona","Telefon"],
      e: "Iogann Gutenberg ~1440 yilda bosmaxonani ixtiro qildi.", d: "medium" },

    { q: "Fransuz inqilobi yili?",
      a: 1, o: ["1776","1789","1804","1815"],
      e: "Fransuz buyuk inqilobi 1789 yilda boshlangan.", d: "medium" },

    { q: "Ibn Sino kim?",
      a: 0, o: ["Shifokor va faylasuf","Matematik","Shoir","Astronom"],
      e: "Ibn Sino — O'rta asrlar ulug' tabib, 'Tib qonunlari' muallifi.", d: "easy" },

    { q: "Buyuk Ipak yo'li nima?",
      a: 2, o: ["Dengiz yo'li","Temir yo'l","Qadimiy savdo yo'li","Harbiy yo'l"],
      e: "Ipak yo'li — Sharq va G'arbni bog'lagan qadimiy savdo yo'li.", d: "easy" },

    { q: "II Jahon urushi qachon tugagan?",
      a: 1, o: ["1944","1945","1946","1947"],
      e: "II Jahon urushi 1945 yil 2 sentabrda tugagan.", d: "easy" },
  ],

  ingliz: [
    { q: "'Apple' o'zbekcha?",
      a: 0, o: ["Olma","Nok","Uzum","Shaftoli"],
      e: "Apple = olma.", d: "easy" },

    { q: "Present Perfect formulasi?",
      a: 2, o: ["did + V1","will + V1","have/has + V3","am/is/are + Ving"],
      e: "Present Perfect = have/has + Past Participle (V3).", d: "medium" },

    { q: "'She ___ every day.' (go)",
      a: 1, o: ["go","goes","going","gone"],
      e: "3-shaxs birlik Present Simple da goes.", d: "easy" },

    { q: "Passive voice (past simple)?",
      a: 0, o: ["was/were + V3","be + V3","has + V3","did + V3"],
      e: "Past simple passive: was/were + V3.", d: "medium" },

    { q: "Conditional II gap?",
      a: 1, o: ["If+V1 → will+V1","If+Past → would+V1","If+had → would have+V3","If+V3 → can+V1"],
      e: "If + Past Simple → would + V1 — 2-tip shart.", d: "hard" },

    { q: "'Synonym' nima?",
      a: 0, o: ["Ma'nodosh so'z","Qarama-qarshi so'z","Tarjima","Qisqartma"],
      e: "Synonym = sinonim = bir xil yoki yaqin ma'noli so'z.", d: "medium" },

    { q: "Modal verb misollari?",
      a: 2, o: ["do, did, does","have, has, had","can, must, should","be, am, is, are"],
      e: "Modal verblar: can, could, may, might, must, should, would, will.", d: "medium" },

    { q: "'Phenomenon' ko'pligi?",
      a: 1, o: ["phenomenons","phenomena","phenomenas","phenomenes"],
      e: "Phenomenon → phenomena (lotin ko'plik shakli).", d: "hard" },

    { q: "'Nevertheless' ma'nosi?",
      a: 0, o: ["Shunga qaramay","Shuning uchun","Misol uchun","Boshqacha aytganda"],
      e: "Nevertheless = shunga qaramay, biroq (however, yet).", d: "hard" },

    { q: "Article 'the' qachon ishlatiladi?",
      a: 1, o: ["Har doim","Ma'lum ob'ekt oldidan","Har bir ot oldidan","Sonlar oldidan"],
      e: "'The' — definite article, ma'lum/aniq ob'ekt oldida ishlatiladi.", d: "medium" },
  ],

  geografiya: [
    { q: "Dunyodagi eng baland tog'?",
      a: 2, o: ["K2","Elbrus","Everest","Kangchenjunga"],
      e: "Everest (Chomolungma) — 8,848 m, Himoloy.", d: "easy" },

    { q: "O'zbekiston poytaxti?",
      a: 0, o: ["Toshkent","Samarqand","Buxoro","Namangan"],
      e: "Toshkent — O'zbekiston poytaxti.", d: "easy" },

    { q: "Dunyodagi eng katta okean?",
      a: 1, o: ["Atlantika","Tinch okean","Hind okeani","Shimoliy Muz"],
      e: "Tinch okean (Pasifik) — eng katta okean.", d: "easy" },

    { q: "Amazon daryosi qaysi qit'ada?",
      a: 2, o: ["Afrika","Osiyo","Janubiy Amerika","Avstraliya"],
      e: "Amazon — Janubiy Amerika, eng ko'p suvli daryo.", d: "easy" },

    { q: "Sahara cho'li qaysi qit'ada?",
      a: 0, o: ["Afrika","Osiyo","Avstraliya","Amerika"],
      e: "Sahara — Afrika qit'asida, dunyodagi eng katta issiq cho'l.", d: "easy" },

    { q: "O'rta Osiyo davlatlari soni?",
      a: 2, o: ["3","4","5","6"],
      e: "5 ta: O'zbekiston, Qozog'iston, Tojikiston, Turkmaniston, Qirg'iziston.", d: "medium" },

    { q: "Dunyodagi eng chuqur ko'l?",
      a: 1, o: ["Kaspiy","Baykal","Orol","Superior"],
      e: "Baykal — dunyodagi eng chuqur ko'l, 1642 m, Sibir.", d: "medium" },

    { q: "Nil daryosi qaysi dengizga quyiladi?",
      a: 0, o: ["O'rta er dengizi","Qizil dengiz","Hind okeani","Atlantika"],
      e: "Nil O'rta er dengiziga quyiladi.", d: "medium" },

    { q: "Yer yuzasining necha foizi suv?",
      a: 2, o: ["51%","61%","71%","81%"],
      e: "Yer yuzasining taxminan 71% i suv bilan qoplangan.", d: "medium" },

    { q: "Dunyodagi eng katta davlat (maydon)?",
      a: 0, o: ["Rossiya","Kanada","Xitoy","AQSH"],
      e: "Rossiya — 17.1 mln km², dunyodagi eng katta davlat.", d: "easy" },
  ],
};


// ============================================================
//  2. FLASHCARD KARTALARI  (flashcard.html ishlatadi)
//  Format: { q, a }
//    q = savol (old tomoni)
//    a = javob (orqa tomoni)
// ============================================================
const FLASHCARD_CARDS = {

  fizika: [
    { q: "Yorug'lik tezligi (vakuumda)?",          a: "c ≈ 3×10⁸ m/s = 300,000 km/s" },
    { q: "Nyuton II qonuni formulasi?",             a: "F = m·a" },
    { q: "Ohm qonuni?",                             a: "I = U/R" },
    { q: "Gravitatsiya tezlanishi Yorda?",          a: "g ≈ 9.8 m/s²" },
    { q: "Elektr quvvati formulasi?",               a: "P = U·I = I²R = U²/R" },
    { q: "1 atm = ? Pa",                            a: "101,325 Pa" },
    { q: "Arximed kuchi formulasi?",                a: "F = ρ·g·V" },
    { q: "Issiqlik miqdori formulasi?",             a: "Q = m·c·ΔT" },
    { q: "Plank doimiysi?",                         a: "h = 6.626×10⁻³⁴ J·s" },
    { q: "Magnit induksiyasi birligi?",             a: "Tesla (T)" },
    { q: "Foton energiyasi?",                       a: "E = h·f" },
    { q: "α-zarrasi nima?",                         a: "Geliy yadrosi: 2 proton + 2 neytron" },
    { q: "Snell qonuni?",                           a: "n₁·sin(θ₁) = n₂·sin(θ₂)" },
    { q: "Elektr zaryadlari birligi?",              a: "Kulon (C)" },
    { q: "Akustika nima o'rganadi?",               a: "Tovush to'lqinlarini" },
  ],

  matematika: [
    { q: "π qiymati (5 xona)?",                    a: "3.14159..." },
    { q: "Uchburchak yuzasi?",                      a: "S = (a × h) / 2" },
    { q: "Doira yuzasi?",                           a: "S = π·r²" },
    { q: "Kvadrat tenglama formulasi?",             a: "x = (−b ± √D) / 2a" },
    { q: "sin²θ + cos²θ = ?",                      a: "= 1" },
    { q: "(a+b)² kengaytma?",                      a: "a² + 2ab + b²" },
    { q: "Faktorial 5! = ?",                        a: "120" },
    { q: "Arifmetik progressiya yig'indisi?",       a: "Sn = n(a₁+aₙ)/2" },
    { q: "d/dx(xⁿ) = ?",                           a: "n·xⁿ⁻¹" },
    { q: "e qiymati?",                              a: "e ≈ 2.71828..." },
    { q: "log_a(b·c) = ?",                         a: "log_a(b) + log_a(c)" },
    { q: "∫x dx = ?",                              a: "x²/2 + C" },
    { q: "C(n,k) kombinatsiya formulasi?",          a: "n! / (k! × (n−k)!)" },
    { q: "Shar hajmi?",                             a: "V = (4/3)πr³" },
    { q: "Pifagor teoremasi?",                      a: "a² + b² = c²" },
  ],

  informatika: [
    { q: "Binary 1010₂ = ? o'nlik",                a: "10" },
    { q: "HTTP 404 xatosi?",                        a: "Not Found — sahifa topilmadi" },
    { q: "O(n log n) algoritmlar?",                 a: "Merge sort, Heap sort" },
    { q: "DNS nima?",                               a: "Domain Name System — domen → IP" },
    { q: "RAM nima?",                               a: "Random Access Memory — operativ xotira" },
    { q: "OOP 4 tamoyili?",                         a: "Encapsulation, Inheritance, Polymorphism, Abstraction" },
    { q: "git commit nima?",                        a: "O'zgarishlarni lokal repoga saqlash" },
    { q: "API nima?",                               a: "Application Programming Interface" },
    { q: "Boolean qiymatlar?",                      a: "True va False" },
    { q: "Rekursiya nima?",                         a: "Funksiya o'zini o'zi chaqirishi" },
    { q: "CSS Flexbox?",                            a: "Elementlarni moslashuvchan joylashtirish" },
    { q: "SQL SELECT nima?",                        a: "Jadvaldan ma'lumot olish buyrug'i" },
    { q: "Python tuple?",                           a: "Immutable (o'zgarmas) tartibli to'plam" },
    { q: "HTTP GET vs POST?",                       a: "GET — olish; POST — yuborish/yaratish" },
    { q: "Binary search murakkabligi?",             a: "O(log n)" },
  ],

  biologiya: [
    { q: "Mitoxondriya vazifasi?",                  a: "ATP sintezi — hujayra energiyasi" },
    { q: "DNK nima?",                               a: "Dezoksiribonuklein kislota — irsiy ma'lumot" },
    { q: "Fotosintez joyi?",                        a: "Xloroplast" },
    { q: "Mitoz va meyoz farqi?",                   a: "Mitoz: 2 diploid; Meyoz: 4 gaploid hujayra" },
    { q: "Immunitet turlari?",                      a: "Tug'ma (innate) va orttirilgan (adaptive)" },
    { q: "Darvin nazariyasi asosi?",                a: "Tabiy tanlanish (natural selection)" },
    { q: "Ferment (enzim) nima?",                   a: "Biologik katalizator (oqsil)" },
    { q: "Qon guruhlari (ABO)?",                    a: "O (I), A (II), B (III), AB (IV)" },
    { q: "Yadro vazifasi?",                         a: "DNK saqlash va hujayrani boshqarish" },
    { q: "Fotosintez tenglamasi?",                  a: "6CO₂+6H₂O→C₆H₁₂O₆+6O₂" },
    { q: "Hujayra membranasi?",                     a: "Ikki qavat fosfolipid + oqsillar" },
    { q: "Ribosoma vazifasi?",                      a: "Oqsil sintezi" },
    { q: "Ekosistema nima?",                        a: "Tirik organizmlar + muhit birligi" },
    { q: "Virus — tirik organizm?",                 a: "Yo'q, hujayradan tashqarida tirik emas" },
    { q: "Gomeostatik nima?",                       a: "Organizm ichki muhitining barqarorligi" },
  ],

  kimyo: [
    { q: "H₂O nima?",                               a: "Suv — 2H + 1O" },
    { q: "pH shkalasi?",                             a: "0–14: <7 kislota, 7 neytral, >7 ishqor" },
    { q: "Avogadro soni?",                           a: "6.022×10²³ zarrcha/mol" },
    { q: "Ideal gaz tenglamasi?",                    a: "PV = nRT" },
    { q: "Benzol formulasi?",                        a: "C₆H₆" },
    { q: "Kovalent bog' nima?",                      a: "Umumiy elektron juftligi orqali bog'" },
    { q: "Oksidlanish nima?",                        a: "Elektron berish jarayoni" },
    { q: "Mis atom raqami?",                         a: "29" },
    { q: "Davriy jadvalda guruhlar soni?",           a: "18 ta guruh" },
    { q: "NaCl bog' turi?",                          a: "Ion bog'" },
    { q: "Mол nima?",                                a: "6.022×10²³ ta zarrcha" },
    { q: "Elektroliz nima?",                         a: "Elektr toki ta'sirida kimyoviy reaksiya" },
    { q: "Organik kimyo asosiy elementi?",           a: "Uglerod (C)" },
    { q: "Vodorod bog'?",                            a: "H va elektromanfiy atom (O, N, F) orasidagi bog'" },
    { q: "Davriy qonunni kim kashf qildi?",          a: "Dmitriy Mendeleev (1869)" },
  ],

  tarix: [
    { q: "Amir Temur tug'ilgan joy va yil?",         a: "1336 yil, Shahrisabz" },
    { q: "I Jahon urushi yillari?",                  a: "1914–1918" },
    { q: "O'zbekiston mustaqilligi?",                a: "1991 yil 1 sentabr" },
    { q: "Renessans?",                               a: "XIV–XVII asrlar, Italiyadan boshlangan" },
    { q: "Al-Xorazmiy kim?",                         a: "IX asr matematik, algebra asoschisi" },
    { q: "Ibn Sino kim?",                            a: "O'rta asrlar tabib, 'Tib qonunlari' muallifi" },
    { q: "Fransuz inqilobi yili?",                   a: "1789 yil" },
    { q: "II Jahon urushi tugagan yil?",             a: "1945 yil" },
    { q: "Gutenberg ixtirosi?",                      a: "Bosmaxona (~1440)" },
    { q: "Ipak yo'li nima?",                         a: "Sharq–G'arb qadimiy savdo yo'li" },
    { q: "Ulug'bek kim?",                            a: "Amir Temur nabirasi, astronom va olim" },
    { q: "Beruni kim?",                              a: "XI asr olim, matematikchi, tarixchi" },
  ],

  ingliz: [
    { q: "'Beautiful' o'zbekcha?",                   a: "Chiroyli, go'zal" },
    { q: "Present Perfect formulasi?",               a: "have/has + V3" },
    { q: "'Vocabulary' nima?",                       a: "Lug'at boyligi, so'zlar to'plami" },
    { q: "Passive voice (past)?",                    a: "was/were + V3" },
    { q: "Modal verblar?",                           a: "can, could, may, might, must, should, would" },
    { q: "Conditional II?",                          a: "If + Past Simple → would + V1" },
    { q: "'Synonym' nima?",                          a: "Ma'nodosh so'z" },
    { q: "'Phenomenon' ko'pligi?",                   a: "phenomena" },
    { q: "3-shaxs birlik Present Simple?",           a: "Felga -s/-es qo'shiladi (goes, watches)" },
    { q: "'Nevertheless' ma'nosi?",                  a: "Shunga qaramay" },
    { q: "Definite article 'the' nima?",             a: "Ma'lum ob'ekt oldidan qo'yiladigan article" },
    { q: "Future Simple formulasi?",                 a: "will + V1" },
  ],

  geografiya: [
    { q: "Dunyodagi eng baland tog'?",               a: "Everest — 8,848 m" },
    { q: "O'zbekiston poytaxti?",                    a: "Toshkent" },
    { q: "Eng katta okean?",                         a: "Tinch okean (Pasifik)" },
    { q: "Amazon daryosi qayerda?",                  a: "Janubiy Amerika" },
    { q: "Sahara cho'li?",                           a: "Shimoliy Afrika, ~9.2 mln km²" },
    { q: "O'rta Osiyo davlatlari?",                  a: "O'z, Qoz, Toj, Turk, Qirg' — 5 ta" },
    { q: "Baykal ko'li?",                            a: "Dunyodagi eng chuqur ko'l, 1642 m, Sibir" },
    { q: "Yer yuzasi necha % suv?",                  a: "~71%" },
    { q: "Eng katta davlat (maydon)?",               a: "Rossiya — 17.1 mln km²" },
    { q: "Dunyodagi eng uzun daryo?",                a: "Nil (Afrika) — ~6,650 km" },
    { q: "Orol dengizi nima bo'ldi?",                a: "XX asrda qurib, maydon 10x kichraydi" },
    { q: "Antarktidani qit'a deyish mumkinmi?",      a: "Ha, muzlik ostida quruqlik bor" },
  ],
};


// ============================================================
//  3. TEZKOR SAVOLLARI  (tezkor.html ishlatadi)
//  Format: { q, a }
//    q = qisqa savol
//    a = qisqa to'g'ri javob (matn bilan tekshiriladi)
//  Eslatma: javob kichik harfda tekshiriladi, trim() qilinadi
// ============================================================
const TEZKOR_QUESTIONS = {

  fizika: [
    { q: "F = m × ?",         a: "a" },
    { q: "1 kVt = ? Vt",      a: "1000" },
    { q: "I = U / ?",         a: "r" },
    { q: "g = ? m/s²",        a: "9.8" },
    { q: "P = U × ?",         a: "i" },
    { q: "c = ? km/s",        a: "300000" },
    { q: "1 atm = ? Pa",      a: "101325" },
    { q: "E = m × c × ?",     a: "2" },
  ],

  matematika: [
    { q: "π ≈ ?",             a: "3.14" },
    { q: "5! = ?",            a: "120" },
    { q: "sin 90° = ?",       a: "1" },
    { q: "cos 0° = ?",        a: "1" },
    { q: "log₂(8) = ?",       a: "3" },
    { q: "√144 = ?",          a: "12" },
    { q: "2⁸ = ?",            a: "256" },
    { q: "7 × 8 = ?",         a: "56" },
    { q: "15² = ?",           a: "225" },
    { q: "e ≈ ?",             a: "2.72" },
  ],

  informatika: [
    { q: "1010₂ = ? (o'nlik)", a: "10" },
    { q: "HTTP 404 = ?",       a: "not found" },
    { q: "DNS = ?",            a: "domain name system" },
    { q: "RAM = ?",            a: "random access memory" },
    { q: "HTML = ?",           a: "hypertext markup language" },
    { q: "1 bayt = ? bit",     a: "8" },
    { q: "1 KB = ? bayt",      a: "1024" },
    { q: "WWW = ?",            a: "world wide web" },
  ],

  biologiya: [
    { q: "ATP ishlab chiqaradigan organell?", a: "mitoxondriya" },
    { q: "Fotosintez joyi?",                  a: "xloroplast" },
    { q: "DNK = ?",                           a: "dezoksiribonuklein kislota" },
    { q: "Qon guruhlari soni (ABO)?",         a: "4" },
    { q: "Odam kromosomlari soni?",           a: "46" },
  ],

  kimyo: [
    { q: "H₂O = ?",           a: "suv" },
    { q: "Neytral pH = ?",    a: "7" },
    { q: "NaCl = ?",          a: "osh tuzi" },
    { q: "Cu atom raqami?",   a: "29" },
    { q: "Benzol = ?",        a: "c6h6" },
    { q: "Avogadro soni?",    a: "6.022" },
  ],

  tarix: [
    { q: "Temur tug'ilgan yil?",   a: "1336" },
    { q: "O'z. mustaqillik yili?", a: "1991" },
    { q: "I Jahon urushi boshlanishi?", a: "1914" },
    { q: "Fransuz inqilobi yili?", a: "1789" },
  ],

  ingliz: [
    { q: "Apple = ?",          a: "olma" },
    { q: "have + ? = P.Perfect", a: "v3" },
    { q: "3-shaxs birlik: he go_", a: "es" },
    { q: "Synonym = ?",        a: "ma'nodosh" },
  ],

  geografiya: [
    { q: "Eng baland tog'?",           a: "everest" },
    { q: "O'zbekiston poytaxti?",      a: "toshkent" },
    { q: "Eng katta okean?",           a: "tinch" },
    { q: "Eng chuqur ko'l?",           a: "baykal" },
    { q: "Yer yuzasi suv % ?",         a: "71" },
  ],
};


// ============================================================
//  4. SO'Z TOPISH (puzzle.html ishlatadi)
//  Format: { word, hint }
//    word = topilishi kerak so'z (KATTA HARFDA)
//    hint = izoh/maslahat
// ============================================================
const PUZZLE_WORDS = {

  fizika: [
    { word: "PROTON",      hint: "Atom yadrosidagi musbat zaryadli zarrcha" },
    { word: "NEYTRON",     hint: "Atom yadrosidagi zaryadlanmagan zarrcha" },
    { word: "ELEKTRON",    hint: "Manfiy zaryadli elementar zarrcha" },
    { word: "FOTON",       hint: "Yorug'likning kvanti" },
    { word: "ENERGIA",     hint: "Ish bajarish qobiliyati (J)" },
    { word: "INERSIYA",    hint: "Jismning tinchlik holatini saqlash xususiyati" },
    { word: "TEZLIK",      hint: "Vaqt birligidagi yo'l (m/s)" },
    { word: "MASSA",       hint: "Jism inersiyasining o'lchovi (kg)" },
    { word: "BOSIM",       hint: "Yuzaga perpendikulyar kuch (Pa)" },
    { word: "MAGNIT",      hint: "Metallarni tortadigan jism" },
  ],

  matematika: [
    { word: "INTEGRAL",    hint: "Funksiya ostidagi maydonni hisoblash" },
    { word: "DERIVATIV",   hint: "Funksiyaning o'zgarish tezligi" },
    { word: "VEKTOR",      hint: "Yo'nalishi va kattaligi bor miqdor" },
    { word: "MATRISA",     hint: "Sonlar to'rtburchak jadvali" },
    { word: "FUNKSIYA",    hint: "x dan y ga moslik qoidasi" },
    { word: "LOGARIFM",    hint: "Darajaning teskari amali" },
    { word: "FAKTORIAL",   hint: "n! = 1×2×3×...×n" },
    { word: "DIAGONAL",    hint: "Quadrat yoki to'rtburchakni kesuvchi chiziq" },
    { word: "KVADRAT",     hint: "To'rt teng tomonli to'rtburchak" },
    { word: "KOMBINATSIYA",hint: "Tartibsiz tanlov soni" },
  ],

  informatika: [
    { word: "ALGORITM",    hint: "Masalani hal qilish ketma-ket qadamlari" },
    { word: "MASSIV",      hint: "Bir turdagi elementlar to'plami (array)" },
    { word: "FUNKSIYA",    hint: "Qayta ishlatiladigan kod bloki" },
    { word: "REKURSIYA",   hint: "O'zini o'zi chaqiradigan funksiya" },
    { word: "PROTOKOL",    hint: "Tarmoq aloqa qoidalari (HTTP, TCP)" },
    { word: "KOMPILATOR",  hint: "Kodni mashina tiliga o'giruvchi dastur" },
    { word: "INTERFEYS",   hint: "Foydalanuvchi bilan dastur orasidagi muhit" },
    { word: "OBEKT",       hint: "OOP da ma'lumot va metodlar birligi" },
    { word: "SINF",        hint: "OOP da ob'ekt uchun shablon (class)" },
    { word: "ITERATOR",    hint: "To'plam elementlarini birma-bir aylanuvchi" },
  ],

  biologiya: [
    { word: "HUJAYRА",     hint: "Hayotning asosiy strukturaviy birligi" },
    { word: "XLOROFIL",    hint: "O'simlikka yashil rang beradigan pigment" },
    { word: "MITOZ",       hint: "Somatik hujayra bo'linishi" },
    { word: "FERMENT",     hint: "Biologik katalizator (enzim)" },
    { word: "VAKUOL",      hint: "Hujayradagi suv to'plangan bo'shliq" },
    { word: "VITAMIN",     hint: "Ozuqa modda, oz miqdorda zarur" },
    { word: "PROTEIN",     hint: "Aminokislotalardan tuzilgan biopolimer" },
    { word: "LIPID",       hint: "Yog'lar va moy — energiya zahirasi" },
    { word: "GLIKOLIZ",    hint: "Glyukozaning parchalanish jarayoni" },
    { word: "MUTATSIYA",   hint: "DNK dagi o'zgarish" },
  ],

  kimyo: [
    { word: "ELEKTRON",    hint: "Manfiy zaryadli zarrcha, atom tarkibida" },
    { word: "VALENT",      hint: "Element kimyoviy bog' hosil qilish qobiliyati" },
    { word: "POLIMER",     hint: "Ko'p monomerdan tashkil topgan makromolekula" },
    { word: "KISLOTA",     hint: "pH < 7, H⁺ ion ajratuvchi modda" },
    { word: "ISHQOR",      hint: "pH > 7, OH⁻ ion ajratuvchi modda" },
    { word: "KATALIZ",     hint: "Katalizator ta'sirida reaksiya tezlashishi" },
    { word: "IZOMER",      hint: "Bir xil formulali, har xil tuzilishli molekulalar" },
    { word: "BENZOL",      hint: "C₆H₆ — aromatik uglevodorod" },
    { word: "OKSID",       hint: "Kislorod bilan birikma" },
    { word: "ERITMA",      hint: "Bir modda boshqasida eriganidan hosil bo'lgan aralashma" },
  ],

  tarix: [
    { word: "IMPERIYA",    hint: "Ko'p millatli yirik davlat tuzilmasi" },
    { word: "RESPUBLIKA",  hint: "Saylov yo'li bilan boshqariladigan davlat" },
    { word: "DEMOKRATIYA", hint: "Xalq boshqaruvi prinsipi" },
    { word: "INQILOB",     hint: "Jamiyatdagi tez va tubdan o'zgarish" },
    { word: "DIPLOMATIYA", hint: "Davlatlar orasidagi munosabatlar san'ati" },
    { word: "ARXEOLOGIYA", hint: "Qazishmalar orqali o'tmishni o'rganish" },
    { word: "RENESSANS",   hint: "Uyg'onish davri — XIV–XVII asrlar" },
    { word: "KOLONIYA",    hint: "Boshqa davlat tomonidan boshqariladigan hudud" },
  ],

  ingliz: [
    { word: "GRAMMAR",     hint: "Til qoidalari tizimi" },
    { word: "SYNONYM",     hint: "Ma'nodosh so'z" },
    { word: "ANTONYM",     hint: "Qarama-qarshi ma'noli so'z" },
    { word: "PRONOUN",     hint: "Otning o'rnini bosuvchi so'z (I, she, they)" },
    { word: "ADJECTIVE",   hint: "Sifat — otni ta'riflovchi so'z" },
    { word: "ADVERB",      hint: "Ravish — fe'lni ta'riflovchi so'z" },
    { word: "PASSIVE",     hint: "Majhul nisbat (was written)" },
    { word: "TENSE",       hint: "Zamon (o'tgan, hozirgi, kelasi)" },
  ],

  geografiya: [
    { word: "MATERIK",     hint: "Katta quruqlik (qit'a)" },
    { word: "VULKAN",      hint: "Lava otadigan tog'" },
    { word: "EKVATOR",     hint: "Yer sharini ikkiga bo'ladigan xayoliy chiziq" },
    { word: "MERIDIAN",    hint: "Shimoldan Janubga yo'nalgan xayoliy chiziq" },
    { word: "GIDROSFERA",  hint: "Yer yuzasidagi barcha suv qobig'i" },
    { word: "LITOSFERA",   hint: "Yer qobig'i va yuqori mantiya" },
    { word: "ATMOSFERA",   hint: "Yer atrofidagi gaz qobig'i" },
    { word: "TSUNAMI",     hint: "Zilzila yoki vulqon natijasida paydo bo'lgan to'lqin" },
    { word: "DELTA",       hint: "Daryo quyilgan joyda hosil bo'lgan tekislik" },
    { word: "PLATFORMA",   hint: "Tekis va barqaror yer qobig'i bo'limi" },
  ],
};


// ============================================================
//  5. XOTIRA O'YINI JUFTLARI  (memory.html ishlatadi)
//  Format: { term, definition }
//    term       = birinchi karta (atama)
//    definition = ikkinchi karta (ta'rif/javob)
// ============================================================
const MEMORY_PAIRS = {

  fizika: [
    { term: "F = ma",             definition: "Nyuton II qonuni" },
    { term: "I = U/R",            definition: "Ohm qonuni" },
    { term: "P = U·I",            definition: "Elektr quvvati" },
    { term: "c ≈ 3×10⁸ m/s",     definition: "Yorug'lik tezligi" },
    { term: "g = 9.8 m/s²",      definition: "Gravitatsiya tezlanishi" },
    { term: "E = mc²",            definition: "Einstein tengligi" },
    { term: "F = ρgV",            definition: "Arximed kuchi" },
    { term: "Tesla",              definition: "Magnit induksiyasi birligi" },
    { term: "Joule",              definition: "Energiya birligi" },
    { term: "Watt",               definition: "Quvvat birligi" },
    { term: "Hertz",              definition: "Chastota birligi" },
    { term: "Ohm",                definition: "Qarshilik birligi" },
  ],

  matematika: [
    { term: "a²+2ab+b²",         definition: "(a+b)²" },
    { term: "n!/k!(n-k)!",       definition: "Kombinatsiya C(n,k)" },
    { term: "πr²",               definition: "Doira yuzasi" },
    { term: "a²+b²=c²",         definition: "Pifagor teoremasi" },
    { term: "x²/2+C",           definition: "∫x dx" },
    { term: "n·xⁿ⁻¹",           definition: "d/dx(xⁿ)" },
    { term: "Sn=n(a₁+aₙ)/2",   definition: "Arifm. progressiya yig'indisi" },
    { term: "2.71828...",        definition: "Eyler soni (e)" },
    { term: "3.14159...",        definition: "Pi soni (π)" },
    { term: "1 radian",         definition: "180°/π ≈ 57.3°" },
    { term: "sin²θ+cos²θ",      definition: "= 1" },
    { term: "(4/3)πr³",         definition: "Shar hajmi" },
  ],

  informatika: [
    { term: "O(log n)",          definition: "Binary search" },
    { term: "O(n log n)",        definition: "Merge sort" },
    { term: "O(n²)",             definition: "Bubble sort" },
    { term: "404",               definition: "Not Found" },
    { term: "200",               definition: "OK — muvaffaqiyatli" },
    { term: "HTML",              definition: "HyperText Markup Language" },
    { term: "CSS",               definition: "Cascading Style Sheets" },
    { term: "DNS",               definition: "Domain Name System" },
    { term: "API",               definition: "Application Programming Interface" },
    { term: "RAM",               definition: "Random Access Memory" },
    { term: "SQL",               definition: "Structured Query Language" },
    { term: "OOP",               definition: "Object Oriented Programming" },
  ],

  biologiya: [
    { term: "Mitoxondriya",      definition: "ATP sintezi — energiya" },
    { term: "Xloroplast",        definition: "Fotosintez joyi" },
    { term: "Ribosoma",          definition: "Oqsil sintezi" },
    { term: "Yadro",             definition: "DNK saqlash" },
    { term: "Vakuol",            definition: "Suv va moddalar saqlash" },
    { term: "Mitoz",             definition: "2 diploid hujayra" },
    { term: "Meyoz",             definition: "4 gaploid hujayra" },
    { term: "Leykosit",          definition: "Oq qon hujayra — immunitet" },
    { term: "Eritrosit",         definition: "Qizil qon hujayra — kislorod" },
    { term: "DNK",               definition: "Irsiy ma'lumot tashuvchi" },
    { term: "Ferment",           definition: "Biologik katalizator" },
    { term: "Ekosistema",        definition: "Organizmlar + muhit birligi" },
  ],

  kimyo: [
    { term: "H₂O",               definition: "Suv" },
    { term: "NaCl",              definition: "Osh tuzi" },
    { term: "CO₂",               definition: "Karbonat angidrid" },
    { term: "H₂SO₄",            definition: "Sulfat kislota" },
    { term: "NaOH",              definition: "Natriy gidroksid (ishqor)" },
    { term: "C₆H₆",             definition: "Benzol" },
    { term: "C₆H₁₂O₆",         definition: "Glyukoza" },
    { term: "pH = 7",            definition: "Neytral eritma" },
    { term: "PV = nRT",          definition: "Ideal gaz tenglamasi" },
    { term: "6.022×10²³",       definition: "Avogadro soni" },
    { term: "Ion bog'",          definition: "NaCl tipidagi bog'" },
    { term: "Kovalent bog'",     definition: "H₂, O₂ tipidagi bog'" },
  ],

  tarix: [
    { term: "1336 yil",          definition: "Amir Temur tug'ildi" },
    { term: "1991 yil",          definition: "O'zbekiston mustaqilligi" },
    { term: "1914-1918",         definition: "I Jahon urushi" },
    { term: "1939-1945",         definition: "II Jahon urushi" },
    { term: "1789 yil",          definition: "Fransuz inqilobi" },
    { term: "Al-Xorazmiy",       definition: "Algebra asoschisi" },
    { term: "Ibn Sino",          definition: "Tib qonunlari muallifi" },
    { term: "Ulug'bek",          definition: "Samarqand observatoriyasi" },
    { term: "Renessans",         definition: "XIV–XVII asr Uyg'onish" },
    { term: "Gutenberg",         definition: "Bosmaxona ixtirosi ~1440" },
    { term: "Beruni",            definition: "XI asr encyclopedist olim" },
    { term: "Ipak yo'li",        definition: "Sharq-G'arb savdo yo'li" },
  ],

  ingliz: [
    { term: "have/has + V3",     definition: "Present Perfect" },
    { term: "was/were + V3",     definition: "Past Passive" },
    { term: "will + V1",         definition: "Future Simple" },
    { term: "If+Past→would+V1", definition: "Conditional II" },
    { term: "Synonym",           definition: "Ma'nodosh so'z" },
    { term: "Antonym",           definition: "Qarama-qarshi so'z" },
    { term: "Noun",              definition: "Ot (odам, kitob)" },
    { term: "Verb",              definition: "Fe'l (run, write)" },
    { term: "Adjective",         definition: "Sifat (beautiful)" },
    { term: "Adverb",            definition: "Ravish (quickly)" },
    { term: "Article",           definition: "a, an, the" },
    { term: "Preposition",       definition: "in, on, at, by..." },
  ],

  geografiya: [
    { term: "Everest",           definition: "Dunyodagi eng baland tog' (8848 m)" },
    { term: "Nil",               definition: "Dunyodagi eng uzun daryo" },
    { term: "Amazon",            definition: "Janubiy Amerikaning eng katta daryosi" },
    { term: "Baykal",            definition: "Dunyodagi eng chuqur ko'l" },
    { term: "Sahara",            definition: "Dunyodagi eng katta issiq cho'l" },
    { term: "Rossiya",           definition: "Dunyodagi eng katta davlat" },
    { term: "Tinch okean",       definition: "Dunyodagi eng katta okean" },
    { term: "Toshkent",          definition: "O'zbekiston poytaxti" },
    { term: "Ekvator",           definition: "0° kenglik chizig'i" },
    { term: "Atmosfera",         definition: "Yer atrofidagi havo qobig'i" },
    { term: "Vulkan",            definition: "Lava otadigan tog'" },
    { term: "Delta",             definition: "Daryo og'zidagi tekislik" },
  ],
};
