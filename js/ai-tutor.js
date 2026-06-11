/* ═══════════════════════════════════════════════════
   ai-tutor.js — Ziyomap AI Tutor moduli
   Fan + rejimga qarab moslashuvchi o'qituvchi
═══════════════════════════════════════════════════ */

(function () {
    /* ── Holat ── */
    const tutorHistory = [];   // { role, content }[]

    /* ── DOM ── */
    const messagesEl = () => document.getElementById('tutor-messages');
    const inputEl    = () => document.getElementById('tutor-input');
    const sendBtn    = () => document.getElementById('tutor-send-btn');

    /* ── System prompt generatori ── */
    function buildSystemPrompt(subj, mode) {
        const subjNames = {
            fizika:      'Fizika',
            matematika:  'Matematika',
            kimyo:       'Kimyo',
            biologiya:   'Biologiya',
            informatika: 'Informatika (dasturlash)',
            tarix:       'Tarix',
            ingliz:      'Ingliz tili',
            umumiy:      'Umumiy fanlar',
        };
        const modeInstructions = {
            explain: `Talabaga ${subjNames[subj] || subj} fanidan tushuntirib ber.
Murakkab tushunchalarni oddiy misollarda izohlash, vizual tasvirlar (ASCII) va analogiyalar qo'lla.
Har bir tushunchadan keyin "Tushundingizmi? Savolingiz bormi?" deb so'ra.`,

            exam: `Talabani ${subjNames[subj] || subj} fanidan imtihonga tayyorla.
Avval mavzuni so'ra, so'ng 3-5 ta savoldan iborat mini-test tuzib ber (variantlar A/B/C/D bilan).
Javoblarni alohida ber, xatolarni tushuntir.`,

            qa: `${subjNames[subj] || subj} fanidan savol-javob rejimida ishlash.
Talabaning savollariga aniq, qisqa va ravshan javob ber.
Agar savol noto'g'ri shaklda bo'lsa, to'g'rilash bilan birga javob ber.`,

            step: `${subjNames[subj] || subj} fanini bosqichma-bosqich o'rgatish.
Har bir mavzuni kichik bo'laklarga bo'l:
1. Nazariya (3-5 gap)
2. Misol yechish
3. Mustaqil mashq (talabaga topshiriq ber)
4. Natijani tekshirish
Keyingi bosqichga faqat oldingi o'zlashtirilgandan keyin o'tish.`,
        };

        return `Sen Ziyomap ta'lim platformasining AI-Tutorisan. 
Fan: ${subjNames[subj] || subj}
O'qitish uslubi: ${modeInstructions[mode] || modeInstructions.explain}

Qo'shimcha ko'rsatmalar:
- O'zbek tilida yoz (so'ralsa boshqa tilda ham yoza olasan)
- Matematik formulalarni LaTeX bilan yoz: \\( x^2 \\) yoki \\[ E=mc^2 \\]
- Kodlarni \`\`\`python ... \`\`\` ichida yoz
- Rag'batlantiruvchi va do'stona bo'l
- Maktab/kollej darajasiga mos tushuntir`;
    }

    /* ── Xabar qo'shish ── */
    function appendMsg(role, html) {
        const wrap = messagesEl();
        if (!wrap) return;
        const div = document.createElement('div');
        div.className = role === 'user' ? 'user-bubble' : 'bot-bubble';
        div.innerHTML = html;
        wrap.appendChild(div);
        wrap.scrollTop = wrap.scrollHeight;
    }

    function appendThinking() {
        const wrap = messagesEl();
        if (!wrap) return null;
        const div = document.createElement('div');
        div.className = 'bot-bubble thinking-bubble';
        div.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
        wrap.appendChild(div);
        wrap.scrollTop = wrap.scrollHeight;
        return div;
    }

    /* ── Asosiy funksiya ── */
    window.sendTutorMessage = async function () {
        const inp = inputEl();
        const btn = sendBtn();
        if (!inp) return;

        const text = inp.value.trim();
        if (!text) return;

        /* Auth tekshirish */
        const U = window.ZiyomapUsage;
        if (!U || !U.getUser()) {
            if (window.ZiyomapNotifications) {
                ZiyomapNotifications.warning('Iltimos, avval tizimga kiring!');
            }
            return;
        }

        /* UI */
        inp.value = '';
        if (btn) btn.disabled = true;
        appendMsg('user', escapeHtml(text));

        const thinking = appendThinking();

        /* Tarix */
        tutorHistory.push({ role: 'user', content: text });

        try {
            const systemPrompt = buildSystemPrompt(
                window.tutorSubject || 'umumiy',
                window.tutorMode    || 'explain'
            );

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: tutorHistory,
                    system:   systemPrompt,
                }),
            });

            if (!res.ok) throw new Error('Server xatosi: ' + res.status);

            const data = await res.json();
            const reply = data.content || data.reply || data.text || '(Javob kelmadi)';

            tutorHistory.push({ role: 'assistant', content: reply });

            if (thinking) thinking.remove();
            appendMsg('bot', renderMarkdown(reply));

            /* MathJax qayta render */
            if (window.MathJax) MathJax.typesetPromise();

            /* Foydalanish log */
            if (U) U.logUsage('ai-tutor', 'AI Tutor');

        } catch (err) {
            if (thinking) thinking.remove();
            appendMsg('bot', '⚠️ Xatolik yuz berdi: ' + escapeHtml(err.message));
            console.error('[ai-tutor]', err);
        } finally {
            if (btn) btn.disabled = false;
            if (inp) inp.focus();
        }
    };

    /* ── Yordamchi funksiyalar ── */
    function escapeHtml(str) {
        return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    }

    function renderMarkdown(text) {
        if (window.marked) return marked.parse(text);
        return escapeHtml(text).replace(/\n/g, '<br>');
    }

    /* ── Enter tugmasi ── */
    document.addEventListener('DOMContentLoaded', function () {
        const inp = document.getElementById('tutor-input');
        if (inp) {
            inp.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendTutorMessage();
                }
            });
        }
    });
})();
