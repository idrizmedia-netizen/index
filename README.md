# Ziyomap (ziyomap.uz)

O'qituvchi va o'quvchilar uchun ta'lim platformasi: virtual laboratoriyalar, o'yinlar, o'qitish metodlari,
onlayn doska, AI yordamchi, tanlovlar va obuna tizimi.

## Texnologiyalar
- **Frontend:** sof HTML / CSS / JS (`*.html`, `js/`, `css/`)
- **Auth + DB:** Firebase Auth va Firestore (`firestore.rules`)
- **AI:** `api/chat.js` (Vercel Edge, Gemini) — faqat tizimga kirgan foydalanuvchilar uchun
- **Telegram:** `api/telegram.js` (faqat adminlar uchun: kanalga post, shaxsiy xabar, ulanishlar) va `api/notify.js` (tanlov bildirishnomalari). Bot tokeni faqat Vercel'da
- **Blog:** saytning o'zida — maqolalar Firestore'da (`articles`), admin muharriri `admin-maqola.html`
- **Hosting:** Vercel (`vercel.json` — yo'naltirish va xavfsizlik sarlavhalari)

## Vercel muhit o'zgaruvchilari (Settings → Environment Variables)
| Nomi | Majburiy | Izoh |
|------|----------|------|
| `GEMINI_API_KEY` | ha | Google AI Studio kaliti |
| `TELEGRAM_BOT_TOKEN` | Telegram uchun majburiy | @BotFather tokeni. **Faqat shu yerda saqlanadi** — kodda va Firestore'da emas. **Sensitive** belgisini yoqing |
| `TELEGRAM_CHANNEL` | ixtiyoriy | Maqola/yangilik yuboriladigan kanal (`@ziyomap_kanal` yoki `-100...`). Bo'lmasa admin paneldagi "kanal username" ishlatiladi |
| `TELEGRAM_CHAT_ID` | ixtiyoriy | Tanlov ro'yxatdan o'tish bildirishnomalari boradigan admin chat |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | tavsiya | Rate limit uchun ishonchli hisoblagich (bo'lmasa xotiradagi taxminiy limit ishlaydi) |
| `ALLOWED_ORIGINS` | ixtiyoriy | Qo'shimcha ruxsat etilgan originlar (vergul bilan) |

## Maqola yozish va Telegramga yuborish
1. Admin sifatida kiring → **Admin panel → «Maqola yozish»** (`admin-maqola.html`).
2. Sarlavha, kategoriya, muqova rasmi va matnni yozing (matn mini-Markdown: `## sarlavha`, `**qalin**`, `*kursiv*`, `[havola](https://...)`, `- ro'yxat`).
3. **Nashr qilish** bosilganda maqola saytda (`maqolalar.html`, bosh sahifa) chiqadi va, belgi yoqilgan bo'lsa, **Telegram kanalga avtomatik yuboriladi**.
4. Telegram uchun: Vercel'da `TELEGRAM_BOT_TOKEN` qo'yilgan (o'zgaruvchi qo'shgach **Redeploy** qiling), Admin panel → Telegram'da **kanal username** kiritilgan va bot kanalda **administrator** bo'lishi kerak.

## Xavfsizlik
- `firestore.rules` o'zgarganda uni Firebase konsolida **Rules** bo'limiga joylashtirib **Publish** qiling.
- `js/admin-guard.js` dagi `OWNER_UID` va `firestore.rules` dagi `ownerUid()` bir xil bo'lishi shart.
- Bot tokenlari va API kalitlarini hech qachon Firestore'ning ommaviy hujjatlariga yoki kodga yozmang.

## O'rnatish
`QOLLANMA.md` ga qarang (admin panel va tanlov tizimi).
