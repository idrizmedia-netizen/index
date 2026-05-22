// metodlar/js/data.js
const metodlarData = [
  // ==========================================
  // 1-QISM: YANGI MAVZU UCHUN (10 TA METOD)
  // ==========================================
  {
    id: "aqliy-hujum",
    title: "Aqliy hujum (Brainstorming)",
    category: "yangi-mavzu",
    categoryLabel: "Yangi mavzu uchun",
    duration: "5-10 daqiqa",
    difficulty: "Oddiy",
    description: "O'quvchilarning mavzu bo'yicha erkin fikrlash va tezkor g'oyalar berish qobiliyatini rivojlantiruvchi interaktiv metod.",
    equipment: ["Doska", "Rangli markerlar"],
    steps: [
      "O'qituvchi doskaga muammoli savol yoki kalit so'zni yozadi.",
      "O'quvchilarga 2-3 daqiqa davomida xayoliga kelgan har qanday g'oyani aytishga ruxsat beriladi (hech qanday g'oya tanqid qilinmaydi).",
      "Barcha fikrlar doskaga qisqa qilib guruhlab yozib boriladi.",
      "Dars yakunida eng to'g'ri va real yechimlar birgalikda saralab olinadi."
    ]
  },
  {
    id: "klaster",
    title: "Klaster (Tarmoqlar metodi)",
    category: "yangi-mavzu",
    categoryLabel: "Yangi mavzu uchun",
    duration: "10 daqiqa",
    difficulty: "Oddiy",
    description: "Yangi mavzuni boshlashdan oldin tushunchalar o'rtasidagi bog'liqlikni vizual xarita ko'rinishida tasvirlash va fikrlarni erkin tarmoqlash.",
    equipment: ["Vatman yoki Doska", "Rangli flomasterlar"],
    steps: [
      "Markazga asosiy tushuncha doira ichiga yoziladi (masalan: Energiya).",
      "O'quvchilar ushbu tushuncha bilan bog'liq bo'lgan tarmoqlarni aytishadi (Kinetik, Potensial, Issiqlik va h.k.).",
      "Har bir tarmoq o'z navbatida mayda shaxobchalarga bo'linib boradi.",
      "Tizimli fikrlash xaritasi hosil bo'ladi."
    ]
  },
  {
    id: "zinama-zina",
    title: "Zinama-zina metodi",
    category: "yangi-mavzu",
    categoryLabel: "Yangi mavzu uchun",
    duration: "15 daqiqa",
    difficulty: "O'rta",
    description: "Yangi tushunchalarni oddiydan murakkabga qarab, bosqichma-bosqich zanjir shaklida o'zlashtirish o'yini.",
    equipment: ["Zina shaklidagi chizilgan plakat"],
    steps: [
      "Doskaga 5 ta pog'onadan iborat zina chiziladi.",
      "Har bir pog'onaga yangi mavzuning kalit atamalari joylashtiriladi.",
      "O'quvchilar quyi pog'onadagi atamani tushunib, misol keltirgan holda yuqoriga qarab ko'tarilib borishadi."
    ]
  },
  {
    id: "insert-metodi",
    title: "INSERT (Faol matn o'qish)",
    category: "yangi-mavzu",
    categoryLabel: "Yangi mavzu uchun",
    duration: "15-20 daqiqa",
    difficulty: "O'rta",
    description: "Yangi mavzu matnini o'qish davomida maxsus belgilar qo'yish orqali tahliliy fikrlashni oshirish.",
    equipment: ["Darslik yoki yangi mavzu matni", "Qalam"],
    steps: [
      "O'quvchilar matnni o'qib, chetiga belgilar qo'yishadi: 'V' - bilardim, '+' - yangi ma'lumot, '-' - men o'ylaganga qarshi, '?' - tushunarsiz.",
      "O'qish yakunida belgilar bo'yicha umumiy jadval tuziladi.",
      "Tushunarsiz ('?') bo'lgan qismlar sinf bo'lib muhokama qilinadi."
    ]
  },
  {
    id: "muammoli-vaziyat",
    title: "Muammoli vaziyat",
    category: "yangi-mavzu",
    categoryLabel: "Yangi mavzu uchun",
    duration: "10 daqiqa",
    difficulty: "Yuqori",
    description: "Yangi mavzuga oid hayotiy va yechimi qiyin bo'lgan muammoni o'rtaga tashlash orqali o'quvchilarda qiziqish uyg'otish.",
    equipment: ["Muammo yozilgan slayd yoki tarqatma"],
    steps: [
      "O'qituvchi yangi qonuniyatni tushuntirishdan oldin ziddiyatli savol beradi (Masalan: 'Nega og'ir kema cho'kmaydi, mayda mix esa cho'kadi?').",
      "O'quvchilar o'z farazlarini aytishadi.",
      "Yangi mavzu dars davomida shu muammoning ilmiy yechimini ochishga qaratiladi."
    ]
  },
  {
    id: "bumerang",
    title: "Bumerang texnologiyasi",
    category: "yangi-mavzu",
    categoryLabel: "Yangi mavzu uchun",
    duration: "20 daqiqa",
    difficulty: "Yuqori",
    description: "O'quvchilar dars davomida materialni mustaqil o'rganib, bir-birlariga tushuntirishlari va nazorat qilishlari.",
    equipment: ["Kichik guruhlar uchun matnlar"],
    steps: [
      "Yangi mavzu 4 ta qismga bo'linadi va guruhlarga tarqatiladi.",
      "Har bir guruh o'z qismini mukammal o'rganib, guruh a'zolari boshqa guruhlarga tarqalib, o'z qismlarini o'rgatishadi.",
      "Fikr almashilgach, hamma o'z guruhiga qaytadi ('bumerang' kabi) va umumiy xulosa qilinadi."
    ]
  },
  {
    id: "g'oyalar-generatorlari",
    title: "G'oyalar generatori",
    category: "yangi-mavzu",
    categoryLabel: "Yangi mavzu uchun",
    duration: "12 daqiqa",
    difficulty: "O'rta",
    description: "Mavzu yuzasidan yangi va noodatiy g'oyalar hamda kreativ yechimlarni tezkor jamlash usuli.",
    equipment: ["G'oyalar qutisi", "Rangli qog'ozlar"],
    steps: [
      "Sinf 2 guruhga bo'linadi: 'Generatorlar' (g'oya beruvchilar) va 'Ekspertlar' (g'oyani baholovchilar).",
      "Yangi mavzu doirasida muammo beriladi, generatorlar tezkor g'oyalar yozishadi.",
      "Ekspertlar eng kreativ va qo'llash mumkin bo'lgan 3 ta g'oyani saralab beradi."
    ]
  },
  {
    id: "assotsiatsiyalar",
    title: "Assotsiatsiyalar (Tafakkur chorrahasi)",
    category: "yangi-mavzu",
    categoryLabel: "Yangi mavzu uchun",
    duration: "5 daqiqa",
    difficulty: "Oddiy",
    description: "Yangi mavzu atamasini eshitganda xayolga kelgan birinchi tushunchalar orqali darsga kirib borish.",
    equipment: ["Doska"],
    steps: [
      "O'qituvchi doskaga yangi so'zni yozadi (Masalan: 'Magnit').",
      "O'quvchilar bu so'z bilan bog'liq xayoliga kelgan istalgan so'zlarni zanjir qilib aytishadi (Temir, tortishish, qutb).",
      "Ushbu so'zlar asosida yangi darsning rejasi bog'lanadi."
    ]
  },
  {
    id: "bilasizmi-yo'qmi",
    title: "Bilasizmi, yo'qmi?",
    category: "yangi-mavzu",
    categoryLabel: "Yangi mavzu uchun",
    duration: "7 daqiqa",
    difficulty: "Oddiy",
    description: "Yangi mavzuga oid qiziqarli, hayratlanarli ilmiy faktlarni so'rash orqali o'quvchilar diqqatini jalb etish.",
    equipment: ["Slayd yoki qog'ozlar"],
    steps: [
      "O'qituvchi 5 ta qiziqarli tezis o'qiydi (Masalan: 'Yorug'lik Yer sharini 1 soniyada 7 marta aylanib chiqa oladi, bunga ishonasizmi?').",
      "O'quvchilar 'Ha' yoki 'Yo'q' deb javob berishadi.",
      "To'g'ri javoblar yangi dars mazmuni orqali isbotlanadi."
    ]
  },
  {
    id: "modellashtirish",
    title: "Kichik modellashtirish",
    category: "yangi-mavzu",
    categoryLabel: "Yangi mavzu uchun",
    duration: "15 daqiqa",
    difficulty: "O'rta",
    description: "Yangi mavzudagi mavhum tushunchalarni oddiy narsalar yordamida ko'rgazmali modellashtirish.",
    equipment: ["Plastilin, sim, koptoklar, iplar"],
    steps: [
      "Mavzu tushuntirilayotganda (Masalan: Molekula yoki Atom strukturasi) o'quvchilarga materiallar beriladi.",
      "O'quvchilar o'qituvchi ketma-ketligi asosida ob'ekt modelini o'zlari yasashadi.",
      "Vizual va qo'l motorikasi orqali mavzu xotirada muhrlanadi."
    ]
  },

  // ==========================================
  // 2-QISM: MAVZUNI MUSTAHKAMLANISH (10 TA METOD)
  // ==========================================
  {
    id: "sinkveyn",
    title: "Sinkveyn (Beshlik metod)",
    category: "mustahkamlash",
    categoryLabel: "Mavzuni mustahkamlash",
    duration: "10 daqiqa",
    difficulty: "O'rta",
    description: "Mavzuni qisqa va lo'nda tushunish, so'z boyligini oshirish va tahlil qilish uchun ajoyib 5 qatorli she'riy metod.",
    equipment: ["Tarqatma qog'ozlar", "Ruchka"],
    steps: [
      "1-qator: Mavzuga oid bitta ot (masalan: Linza).",
      "2-qator: Mavzuni ta'riflovchi ikkita sifat (masalan: Yupqa, qavariq).",
      "3-qator: Mavzuga oid uchta fe'l (masalan: Sindiradi, yig'adi, ko'rsatadi).",
      "4-qator: Mavzuning mohiyatini ochuvchi 4 ta so'zdan iborat jumla.",
      "5-qator: Mavzuning ma'nodoshi bo'lgan bitta so'z (Sinonim)."
    ]
  },
  {
    id: "bbyu",
    title: "BBYU (Bilaman, Bilishni xohlayman, Bilib oldim)",
    category: "mustahkamlash",
    categoryLabel: "Mavzuni mustahkamlash",
    duration: "Dars davomida",
    difficulty: "O'rta",
    description: "O'quvchining dars davomidagi shaxsiy rivojlanishini va bilim olish faolligini kuzatish imkonini beruvchi jadval metodi.",
    equipment: ["Doskada chizilgan 3 ustunli jadval", "Daftar"],
    steps: [
      "Dars boshida o'quvchilar mavzu haqida nimalarni bilishini 1-ustunga yozishadi ('Bilaman').",
      "Nimalarni bilmoqchi ekanliklarini 2-ustunga yozishadi ('Bilishni xohlayman').",
      "Dars oxirida nimalarni o'rganganliklarini 3-ustunga qayd etishadi ('Bilib oldim')."
    ]
  },
  {
    id: "charxpalak",
    title: "Charxpalak o'yini",
    category: "mustahkamlash",
    categoryLabel: "Mavzuni mustahkamlash",
    duration: "15 daqiqa",
    difficulty: "O'rta",
    description: "Guruhlar o'rtasida savol-javob va materiallarni almashish orqali barcha o'quvchilarni faollashtirish.",
    equipment: ["Savollar yozilgan plakatlar", "Rangli markerlar"],
    steps: [
      "Har bir guruhga bittadan muammoli savol yozilgan qog'oz beriladi.",
      "Guruh a'zolari o'z javoblarini yozib, qog'ozni soat mili bo'yicha keyingi guruhga uzatishadi (charxpalak kabi).",
      "Keyingi guruh tayyor javobni to'ldiradi. Qog'ozlar o'z egalariga qaytib kelgach, taqdimot qilinadi."
    ]
  },
  {
    id: "kubik-metodi",
    title: "Tafakkur kubigi",
    category: "mustahkamlash",
    categoryLabel: "Mavzuni mustahkamlash",
    duration: "12 daqiqa",
    difficulty: "O'rta",
    description: "Kubikning 6 ta tomonidagi maxsus buyruqlar yordamida mavzuni har tomonlama tahlil qilish.",
    equipment: ["6 tomonida buyruqlar yozilgan kubik"],
    steps: [
      "Kubik tashlanadi. Chiqqan tomonga qarab o'quvchi javob beradi:",
      "1. Tasvirlang, 2. Taqqoslang, 3. Bog'lang, 4. Tahlil qiling, 5. Qo'llang, 6. Baholang.",
      "Bu metod o'quvchini bir qolipda fikrlashdan asraydi."
    ]
  },
  {
    id: "domino-zanjiri",
    title: "Domino zanjiri",
    category: "mustahkamlash",
    categoryLabel: "Mavzuni mustahkamlash",
    duration: "10 daqiqa",
    difficulty: "Oddiy",
    description: "Formula va qonuniyatlarni eslab qolish uchun savol-javob qismlarini mantiqiy zanjir ko'rinishida yig'ish.",
    equipment: ["Chap tomonida savol, o'ng tomonida boshqa savolning javobi bor kartochkalar"],
    steps: [
      "Birinchi o'quvchi o'z kartochkasidagi savolni o'qiydi.",
      "Kimda shu savolning javobi bo'lsa, u javobni o'qib, o'zidagi yangi savolni davom ettiradi.",
      "Zanjir uzilmay hamma kartochkalar tugaguncha domino kabi davom etadi."
    ]
  },
  {
    id: "baliq-skeleti",
    title: "Fishbone (Baliq skeleti)",
    category: "mustahkamlash",
    categoryLabel: "Mavzuni mustahkamlash",
    duration: "15 daqiqa",
    difficulty: "Yuqori",
    description: "Muammoning kelib chiqish sabablari va uning oqibatlarini vizual sxemada tizimli tahlil qilish.",
    equipment: ["Baliq skeleti chizilgan plakat"],
    steps: [
      "Baliqning bosh qismiga asosiy muammo yoziladi.",
      "Tepadagi suyaklariga muammoning sabablari, pastki suyaklariga esa ularni isbotlovchi dalillar yoziladi.",
      "Dum qismida esa umumiy yechim va xulosa shakllantiriladi."
    ]
  },
  {
    id: "haqiqat-yolg'on",
    title: "To'g'ri yoki Noto'g'ri (True/False)",
    category: "mustahkamlash",
    categoryLabel: "Mavzuni mustahkamlash",
    duration: "8 daqiqa",
    difficulty: "Oddiy",
    description: "O'tilgan mavzu bo'yicha qoidalarni tezkor tekshirish va o'quvchilarning hushyorligini oshirish.",
    equipment: ["Yashil va Qizil kartochkalar"],
    steps: [
      "O'qituvchi dars yuzasidan hukm o'qiydi (Masalan: 'Kuch birligi - Nyuton').",
      "Fikr to'g'ri bo'lsa o'quvchilar Yashil, noto'g'ri bo'lsa Qizil kartochkani ko'tarishadi.",
      "Xato qilgan o'quvchilar bilan qoida qayta takrorlanadi."
    ]
  },
  {
    id: "tushunchalar-burchagi",
    title: "Tushunchalar burchagi",
    category: "mustahkamlash",
    categoryLabel: "Mavzuni mustahkamlash",
    duration: "10 daqiqa",
    difficulty: "O'rta",
    description: "Mavzudagi qarama-qarshi yoki turlicha yondashuvlarni sinf burchaklarida muhokama qilish.",
    equipment: ["Xonaning 4 ta burchagi uchun yozuvlar"],
    steps: [
      "Xonaning burchaklariga 'To'liq qo'shilaman', 'Qisman qo'shilaman', 'Qo'shilmayman', 'Fikrim yo'q' deb yozib qo'yiladi.",
      "O'qituvchi bahsli fikr aytadi. O'quvchilar o'z qarashlariga mos burchakka borishadi.",
      "Har bir burchak o'z tanlovini guruh bo'lib himoya qiladi."
    ]
  },
  {
    id: "kim-chaqqon",
    title: "Kim chaqqon? (Estafeta o'yini)",
    category: "mustahkamlash",
    categoryLabel: "Mavzuni mustahkamlash",
    duration: "10 daqiqa",
    difficulty: "Oddiy",
    description: "Guruhlar o'rtasida formulalar yoki topshiriqlarni tezkorlik bilan ketma-ket bajarish musobaqasi.",
    equipment: ["Doska, marker"],
    steps: [
      "Doska guruhlar soniga ko'ra bo'linadi.",
      "Har bir guruhdan birinchi o'quvchi chiqib topshiriqning 1-qismini bajaradi va markerni keyingisiga beradi.",
      "Qaysi guruh birinchi va xatosiz zanjirni yakunlasa, o'sha guruh g'olib bo'ladi."
    ]
  },
  {
    id: "venn-diagrammasi",
    title: "Venn diagrammasi",
    category: "mustahkamlash",
    categoryLabel: "Mavzuni mustahkamlash",
    duration: "12 daqiqa",
    difficulty: "O'rta",
    description: "Ikki yoki uchta o'xshash tushunchaning farqli va umumiy jihatlarini doiralar kesishmasida taqqoslash.",
    equipment: ["Doska yoki A3 qog'oz"],
    steps: [
      "Doskaga ikkita kesishuvchi doira chiziladi (Masalan: 'O'zgarmas tok' va 'O'zgaruvchan tok').",
      "Doiralarning chekka qismlariga ularning faqat o'ziga xos farqlari yoziladi.",
      "Markazdagi kesishgan qismga esa ularning umumiy o'xshashliklari yozib to'ldiriladi."
    ]
  },

  // ==========================================
  // 3-QISM: REFLEKSIYA / DARS OXIRIDA (10 TA METOD)
  // ==========================================
  {
    id: "3-qayd",
    title: "3 ta qayd (Refleksiya)",
    category: "refleksiya",
    categoryLabel: "Dars oxirida (Refleksiya)",
    duration: "5 daqiqa",
    difficulty: "Oddiy",
    description: "Dars yakunida o'quvchilar mavzuni qanchalik o'zlashtirganini aniqlash va fikrini jamlash uchun tezkor qaydlar tizimi.",
    equipment: ["Kichik stikerlar"],
    steps: [
      "O'quvchilarga kichik rangli qog'ozlar (stikerlar) tarqatiladi.",
      "Ular dars bo'yicha quyidagi 3 ta savolga qisqa va aniq vizual javob yozishadi:",
      "1. Bugun darsda o'rgangan eng muhim 2 ta ma'lumotim.",
      "2. Menga hali ham biroz tushunarsiz bo'lib qolayotgan 1 ta jihat.",
      "3. Keyingi darsda o'qituvchidan so'ramoqchi bo'lgan savolim."
    ]
  },
  {
    id: "fsmb",
    title: "FSMB Metodi",
    category: "refleksiya",
    categoryLabel: "Dars oxirida (Refleksiya)",
    duration: "15 daqiqa",
    difficulty: "Yuqori",
    description: "O'quvchilarda bahs-munozara madaniyatini, o'z fikrini dalillash va tahliliy fikrlashni rivojlantiruvchi jiddiy metod.",
    equipment: ["A4 qog'oz", "Ruchka"],
    steps: [
      "F - Fikringizni bayon eting ('Menimcha...').",
      "S - Fikringiz bayoniga sabab ko'rsating ('Chunki...').",
      "M - Ko'rsatilgan sababni isbotlovchi dalil/misol keltiring ('Bunga misol qilib...').",
      "B - Fikringizni umumlashtiring ('Xulosa qilib aytganda...')."
    ]
  },
  {
    id: "svetofor-metodi",
    title: "Svetofor (O'z-o'zini baholash)",
    category: "refleksiya",
    categoryLabel: "Dars oxirida (Refleksiya)",
    duration: "3 daqiqa",
    difficulty: "Oddiy",
    description: "Dars oxirida o'quvchilar darsni tushunish darajasini svetofor ranglari orqali o'qituvchiga bildirish.",
    equipment: ["Yashil, Sariq va Qizil doirachalar"],
    steps: [
      "Har bir o'quvchi dars yakunida bitta rangni ko'taradi:",
      "Yashil - 'Mavzuni to'liq tushundim va mustaqil qo'llay olaman'.",
      "Sariq - 'Tushundim, lekin dars yuzasidan menda hali savollar bor'.",
      "Qizil - 'Mavzuni umuman tushunmadim, menga yordam kerak'."
    ]
  },
  {
    id: "telegram-chat",
    title: "Telegram Chat (Sinf tarmog'i)",
    category: "refleksiya",
    categoryLabel: "Dars oxirida (Refleksiya)",
    duration: "5 daqiqa",
    difficulty: "Oddiy",
    description: "Dars tugashida ijtimoiy tarmoq formatidan foydalanib, dars haqida qisqa guruhli sharh qoldirish.",
    equipment: ["Doskadagi chat maketi yoki qog'ozlar"],
    steps: [
      "O'quvchilar stikerga dars haqidagi o'z taassurotlarini 'sms' xabar ko'rinishida yozishadi.",
      "Sms oxiriga mavzuga mos 'emoji' (smaylik) chizishadi.",
      "Doskadagi 'Sinfimiz chati' plakatiga stikerlarni yopishtirib ketishadi."
    ]
  },
  {
    id: "tugallanmagan-jumla",
    title: "Tugallanmagan jumla",
    category: "refleksiya",
    categoryLabel: "Dars oxirida (Refleksiya)",
    duration: "5 daqiqa",
    difficulty: "Oddiy",
    description: "O'qituvchi boshlab bergan gapni yakunlash orqali darsni umumlashtirish.",
    equipment: ["Savollar ro'yxati"],
    steps: [
      "O'qituvchi gap boshlaydi: 'Bugungi darsda men uchun eng qiyin bo'lgan narsa bu...'",
      "Yoki: 'Bugun men o'zim uchun kashf qildimki...'",
      "O'quvchilar zanjir shaklida gapni o'z fikrlari bilan yakunlashadi."
    ]
  },
  {
    id: "bilimlar-darakhti",
    title: "Bilimlar daraxti",
    category: "refleksiya",
    categoryLabel: "Dars oxirida (Refleksiya)",
    duration: "6 daqiqa",
    difficulty: "Oddiy",
    description: "Dars natijalarini daraxtga meva yoki barglar yopishtirish orqali vizual aks ettirish.",
    equipment: ["Doskadagi katta daraxt chizmasi, yashil va sarg'ish barglar"],
    steps: [
      "Agar o'quvchi darsda yangi bilim olgan bo'lsa - Yashil bargni daraxtga yopishtiradi.",
      "Agar dars zerikarli yoki tushunarsiz bo'lgan bo'lsa - Sariq (to'kilgan) bargni daraxt tagiga qo'yadi.",
      "Daraxtning ko'rinishidan darsning umumiy sifati aniqlanadi."
    ]
  },
  {
    id: "yutuqlar-cho'qqisi",
    title: "Muvaffaqiyat cho'qqisi",
    category: "refleksiya",
    categoryLabel: "Dars oxirida (Refleksiya)",
    duration: "5 daqiqa",
    difficulty: "O'rta",
    description: "O'quvchi dars davomida o'z harakatini va o'zlashtirishini tog' cho'qqisining qaysi qismida ekanligi bilan baholashi.",
    equipment: ["Tog' va cho'qqi chizilgan plakat, odamcha stikerlari"],
    steps: [
      "Plakatda tog' etagi, o'rtasi va cho'qqisi tasvirlangan.",
      "O'quvchilar o'z ismlari yozilgan odamcha stikerini mos joyga qo'yishadi:",
      "Etagida - harakat boshida, O'rtasida - o'rtacha o'zlashtirish, Cho'qqida - mavzuni zabt etdi."
    ]
  },
  {
    id: "chamadon-go'shtmaydalagich-savat",
    title: "Chamadon, Go'shtmaydalagich, Savat",
    category: "refleksiya",
    categoryLabel: "Dars oxirida (Refleksiya)",
    duration: "7 daqiqa",
    difficulty: "O'rta",
    description: "Olingan bilimlarni hayotda kerakligi, qayta ishlash zarurligi yoki keraksizligiga qarab 3 guruhga ajratish.",
    equipment: ["3 ta rasm: Chamadon, Go'shtmaydalagich, Savat"],
    steps: [
      "Chamadon - 'Men uchun juda kerakli ma'lumot, o'zim bilan kelajakka olib ketaman'.",
      "Go'shtmaydalagich - 'Ma'lumot qiziq, lekin hali qayta o'ylab, ustida ishlashim kerak'.",
      "Savat - 'Keraksiz yoki eski ma'lumot, esimdan chiqaraman'."
    ]
  },
  {
    id: "plyus-minus-qiziqarli",
    title: "PMQ (Plyus, Minus, Qiziqarli)",
    category: "refleksiya",
    categoryLabel: "Dars oxirida (Refleksiya)",
    duration: "10 daqiqa",
    difficulty: "O'rta",
    description: "Darsning barcha jihatlarini ijobiy, salbiy va e'tiborga loyiq tomonlarini uch ustunli jadvalda tahlil qilish.",
    equipment: ["Uch ustunli PMQ jadvali"],
    steps: [
      "O'quvchilar jadvalni to'ldirishadi:",
      "'+' (plyus) - darsning eng yoqqan va foydali qismlari.",
      "'-' (minus) - tushunarsiz qolgan yoki qiyinchilik tug'dirgan joylari.",
      "'Q' (qiziqarli) - darsda hayratlantirgan yangi faktlar."
    ]
  },
  {
    id: "sink-peyn-xat",
    title: "O'qituvchiga xat",
    category: "refleksiya",
    categoryLabel: "Dars oxirida (Refleksiya)",
    duration: "5 daqiqa",
    difficulty: "Oddiy",
    description: "O'quvchilar anonim tarzda o'qituvchiga dars sifati va tushunarsiz vaziyatlar bo'yicha xat yozish tizimi.",
    equipment: ["Kichik konvert yoki quti"],
    steps: [
      "O'quvchilar ismini yozmasdan darsda ularga nima ko'proq yoqqani va keyingi darsda nimalarni o'zgartirish kerakligini yozishadi.",
      "Xatlar dars oxirida maxsus qutiga tashlanadi.",
      "Bu metod o'qituvchi uchun teskari aloqa (feedback) vazifasini o'taydi."
    ]
  }
];
