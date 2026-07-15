# Ziyomap — Admin panel + Tanlov tizimi | O'rnatish qo'llanmasi

Bu tizim mavjud Firebase loyihangizga ("ziyomap") **Firestore** qo'shib ishlaydi.
Eski fayllaringizning **birortasiga ham tegilmagan** — faqat yangi fayllar qo'shildi
va 2 ta joyga bittadan `<script>` qatori qo'shish kifoya.

---

## 1-QADAM — Firestore'ni yoqish

1. https://console.firebase.google.com → **ziyomap** loyihasini oching
2. Chap menyudan **Firestore Database** → **Create database**
3. Rejim: **Production mode** → joylashuv: `eur3` yoki sizga yaqin hudud → **Enable**

## 2-QADAM — Xavfsizlik qoidalarini qo'yish

1. Firestore → **Rules** bo'limiga o'ting
2. `firestore.rules` faylidagi kodni to'liq nusxalab, joylashtiring — email allaqachon
   **idrizmedia@gmail.com** qilib to'ldirilgan, hech narsa o'zgartirish shart emas
3. **Publish** tugmasini bosing

   ✅ `js/admin-guard.js` faylida ham email allaqachon **idrizmedia@gmail.com**
   qilib to'ldirilgan — bu sizning doimiy asosiy admin (owner) emailingiz.

## 3-QADAM — Fayllarni GitHub repo'ga yuklash

Quyidagi fayllarni xuddi shu joylashuvda qo'shing:

```
index/
├── admin.html                      ← YANGI
├── tanlov-royxat.html              ← YANGI
├── firestore.rules                 ← faqat konsolga joylashtirish uchun (saqlab qo'ying)
└── js/
    ├── admin-guard.js              ← YANGI
    ├── admin-panel.js              ← YANGI
    ├── firestore-notify.js         ← YANGI
    ├── tanlov-royxat.js            ← YANGI
    ├── dashboard-natijalarim.js    ← YANGI
    └── public-stats.js             ← YANGI
```

## 4-QADAM — Mavjud sahifalarga bitta qatordan qo'shish

### `index.html` ga (bosh sahifa):
`</body>` tegidan OLDIN, boshqa `<script>` teglaridan keyin qo'shing:
```html
<script src="js/admin-guard.js"></script>
<script src="js/firestore-notify.js"></script>
<script src="js/public-stats.js"></script>
```
Va navbar ichida (masalan login tugmasi yonida) admin panelga havola qo'shing —
bu faqat siz va admin qilib belgilagan odamlarga ko'rinadi:
```html
<a href="admin.html" data-admin-only style="display:none" title="Admin panel">
  <i class="fas fa-shield-halved"></i>
</a>
```
Shuningdek, "Tanlov" tugmasini istalgan joyga (masalan navbar yoki bosh sahifa
bo'limiga) qo'shing:
```html
<a href="tanlov-royxat.html">Tanlovga ro'yxatdan o'tish</a>
```

### `dashboard.html` ga (shaxsiy kabinet):
Mavjud 3 ta script qatoridan keyin, shunchaki 2 qatorni qo'shing:
```html
<script src="js/admin-guard.js"></script>
<script src="js/dashboard-natijalarim.js"></script>
```
("Mening tanlov natijalarim" paneli sahifaga avtomatik qo'shiladi — HTML qo'lda
o'zgartirilmaydi.)

### Boshqa barcha sahifalarga (ixtiyoriy, agar bell/admin tugmasi hamma joyda
kerak bo'lsa) xuddi shu 2–3 qatorni qo'shing.

---

## Bu tizim qanday ishlaydi

- **Admin panel** (`admin.html`) — faqat sizning emailingiz (va siz qo'shgan
  emaillar) bilan ochiladi. Boshqalar uchun "kirish huquqingiz yo'q" ko'rinadi.
- **Adminlar** tabida (faqat sizga ko'rinadi) yangi admin email qo'sha olasiz —
  ular Google bilan kirishi bilanoq darhol admin panelga ega bo'ladi.
- **Tanlovlar** tabida yangi tanlov yaratasiz — bir vaqtda faqat bitta faol
  tanlov bo'lishi tavsiya etiladi, lekin istasangiz bir nechtasini ham
  ochiq qoldirishingiz mumkin (`tanlov-royxat.html` eng oxirgi ochilganini oladi).
- Foydalanuvchi `tanlov-royxat.html` ga kirsa: Google bilan kirgan bo'lishi
  shart, so'ng F.I.Sh, maktab, yosh, telefon kiritadi → **tasdiqlovchi kod
  so'ralmaydi** → darhol `ZM-2026-0001` ko'rinishidagi ID oladi.
- Bu bildirishnoma qo'ng'iroq (🔔) belgisida VA asosiy oynada (toast) barcha
  foydalanuvchilarga chiqadi — chunki `firestore-notify.js` mavjud
  `notifications.js` tizimingizga ma'lumotni "quyib beradi", uni buzmaydi.
- **Ishtirokchilar** tabida admin har bir ishtirokchiga ball qo'yadi →
  bu ball foydalanuvchining `dashboard.html` sahifasida "Mening tanlov
  natijalarim" panelida avtomatik chiqadi.
- Bosh sahifadagi statistika vidjeti (ro'yxatdan o'tganlar soni, tanlovlar
  soni) **login talab qilmaydi** — istalgan qurilmada, kirmagan holda ham
  ko'rinadi.

## Muhim eslatma

- Bu bepul Firebase "Spark" tarifida ishlaydi (kunlik limit yetarli darajada
  katta — kichik/o'rta loyiha uchun mos).
- `stats/public` hujjatidagi hisoblagich har bir tizimga kirgan foydalanuvchi
  tomonidan yozilishi mumkin (faqat sonni oshirish uchun) — bu kichik loyiha
  uchun xavfsiz kompromis, lekin juda katta miqyosda Cloud Function orqali
  qilingani ma'qulroq bo'lardi.
