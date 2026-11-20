# Ziyomap (ziyomap.uz)

O'qituvchi va o'quvchilar uchun ta'lim platformasi: virtual laboratoriyalar, o'yinlar, o'qitish metodlari,
onlayn doska, AI yordamchi, tanlovlar va obuna tizimi.

## Texnologiyalar
- **Frontend:** sof HTML / CSS / JS (`*.html`, `js/`, `css/`)
- **Auth + DB:** Firebase Auth va Firestore (`firestore.rules`)
- **AI:** `api/chat.js` (Vercel Edge, Gemini) — faqat tizimga kirgan foydalanuvchilar uchun
- **Telegram bildirishnoma:** `api/notify.js` (bot tokeni serverda)
- **Blog:** Sanity CMS (`studio/`)
- **Hosting:** Vercel (`vercel.json` — yo'naltirish va xavfsizlik sarlavhalari)

## Vercel muhit o'zgaruvchilari (Settings → Environment Variables)
| Nomi | Majburiy | Izoh |
|------|----------|------|
| `GEMINI_API_KEY` | ha | Google AI Studio kaliti |
| `TELEGRAM_BOT_TOKEN` | ixtiyoriy | Adminga tanlov bildirishnomalari uchun |
| `TELEGRAM_CHAT_ID` | ixtiyoriy | Bildirishnoma boradigan chat |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | tavsiya | Rate limit uchun ishonchli hisoblagich (bo'lmasa xotiradagi taxminiy limit ishlaydi) |
| `ALLOWED_ORIGINS` | ixtiyoriy | Qo'shimcha ruxsat etilgan originlar (vergul bilan) |

## Xavfsizlik
- `firestore.rules` o'zgarganda uni Firebase konsolida **Rules** bo'limiga joylashtirib **Publish** qiling.
- `js/admin-guard.js` dagi `OWNER_UID` va `firestore.rules` dagi `ownerUid()` bir xil bo'lishi shart.
- Bot tokenlari va API kalitlarini hech qachon Firestore'ning ommaviy hujjatlariga yoki kodga yozmang.

## O'rnatish
`QOLLANMA.md` ga qarang (admin panel va tanlov tizimi).
