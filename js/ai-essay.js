/* ═══════════════════════════════════════════════════
   ai-essay.js — Ziyomap Essay Checker moduli
   Matnni til va darajaga qarab tahlil qiladi
═══════════════════════════════════════════════════ */

(function () {

    /* ── System prompt ── */
    function buildEssayPrompt(lang, level) {
        const langNames = { uz: "o'zbek", ru: "rus", en: "ingliz" };
        const levelNames = {
            standard: "standart (umumiy)",
            academic:  "akademik (ilmiy uslub)",
            school:    "maktab (o'quvchi ishi)",
        };

        return `Sen professional matn muharriri va tilshunos o'qituvchisan.
Sening vazifang — ${langNames[lang] || "o'zbek"} tilidagi matnni ${levelNames[level] || "standart"} darajada tekshirish.

Tahlil qilib, FAQAT quyidagi JSON formatida javob ber (boshqa hech narsa yozma):
{
  "score": <1 dan 10 gacha baho, son>,
  "summary": "<2-3 gaplik umumiy baho>",
  "spelling": {
    "count": <xato soni>,
    "items": ["<xato> → <to'g'risi>", ...]
  },
  "grammar": {
    "count": <xato soni>,
    "items": ["<xato jumlaning qismi> → <to'g'risi>", ...]
  },
  "style": {
    "score": <1-10>,
    "comment": "<uslub haqida izoh>"
  },
  "strengths": ["<kuchli tomon 1>", "<kuchli tomon 2>", ...],
  "suggestions": ["<tavsiya 1>", "<tavsiya 2>", ...]
}

Javobda JSON dan boshqa hech narsa bo'lmasin. Markdown \`\`\` ham kerak emas.`;
    }

    /* ── Natijani HTML ga aylantirish ── */
    function renderResult(data) {
        const scoreColor = data.score >= 8 ? '#10b981' :
                           data.score >= 5 ? '#f59e0b' : '#ef4444';

        let html = `<div class="essay-score" style="color:${scoreColor}">${data.score}/10</div>`;

        if (data.summary) {
            html += `<div class="essay-section">
                <div class="essay-section-title">📊 Umumiy baho</div>
                <div>${esc(data.summary)}</div>
            </div>`;
        }

        /* Imlo xatolari */
        if (data.spelling) {
            const cnt = data.spelling.count || 0;
            html += `<div class="essay-section" style="border-color:${cnt > 0 ? '#ef4444' : '#10b981'}">
                <div class="essay-section-title">🔤 Imlo xatolari — ${cnt} ta</div>`;
            if (cnt > 0 && data.spelling.items?.length) {
                html += '<ul style="margin:6px 0 0;padding-left:18px;">';
                data.spelling.items.forEach(i => {
                    html += `<li style="margin-bottom:3px;">${esc(i)}</li>`;
                });
                html += '</ul>';
            } else if (cnt === 0) {
                html += '<div style="color:#10b981;font-weight:700;">✅ Imlo xatolari topilmadi</div>';
            }
            html += '</div>';
        }

        /* Grammatika */
        if (data.grammar) {
            const cnt = data.grammar.count || 0;
            html += `<div class="essay-section" style="border-color:${cnt > 0 ? '#f59e0b' : '#10b981'}">
                <div class="essay-section-title">📝 Grammatik xatolar — ${cnt} ta</div>`;
            if (cnt > 0 && data.grammar.items?.length) {
                html += '<ul style="margin:6px 0 0;padding-left:18px;">';
                data.grammar.items.forEach(i => {
                    html += `<li style="margin-bottom:3px;">${esc(i)}</li>`;
                });
                html += '</ul>';
            } else if (cnt === 0) {
                html += '<div style="color:#10b981;font-weight:700;">✅ Grammatik xatolar topilmadi</div>';
            }
            html += '</div>';
        }

        /* Uslub */
        if (data.style) {
            const sc = data.style.score || '—';
            html += `<div class="essay-section" style="border-color:#8b5cf6">
                <div class="essay-section-title">✍️ Uslub — ${sc}/10</div>
                <div>${esc(data.style.comment || '')}</div>
            </div>`;
        }

        /* Kuchli tomonlar */
        if (data.strengths?.length) {
            html += `<div class="essay-section" style="border-color:#10b981">
                <div class="essay-section-title">💪 Kuchli tomonlar</div>
                <ul style="margin:6px 0 0;padding-left:18px;">`;
            data.strengths.forEach(s => {
                html += `<li style="margin-bottom:3px;">${esc(s)}</li>`;
            });
            html += '</ul></div>';
        }

        /* Tavsiyalar */
        if (data.suggestions?.length) {
            html += `<div class="essay-section" style="border-color:#0ea5e9">
                <div class="essay-section-title">💡 Tavsiyalar</div>
                <ul style="margin:6px 0 0;padding-left:18px;">`;
            data.suggestions.forEach(s => {
                html += `<li style="margin-bottom:3px;">${esc(s)}</li>`;
            });
            html += '</ul></div>';
        }

        return html;
    }

    /* ── Asosiy funksiya ── */
    window.checkEssay = async function () {
        const textEl   = document.getElementById('essayText');
        const resultEl = document.getElementById('essayResult');
        const contentEl= document.getElementById('essayResultContent');
        const btn      = document.getElementById('essayCheckBtn');

        if (!textEl || !resultEl || !contentEl || !btn) return;

        const text = textEl.value.trim();
        if (!text || text.length < 20) {
            alert("Iltimos, kamida 20 belgidan iborat matn kiriting.");
            return;
        }

        /* Auth */
        const U = window.ZiyomapUsage;
        if (!U || !U.getUser()) {
            if (window.ZiyomapNotifications) {
                ZiyomapNotifications.warning('Iltimos, avval tizimga kiring!');
            }
            return;
        }

        /* UI — loading */
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Tekshirilmoqda...';
        resultEl.classList.remove('show');

        const lang  = window.essayLang  || 'uz';
        const level = window.essayLevel || 'standard';

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: text }],
                    system:   buildEssayPrompt(lang, level),
                }),
            });

            if (!res.ok) throw new Error('Server xatosi: ' + res.status);

            const raw  = await res.json();
            const reply = raw.content || raw.reply || raw.text || '';

            /* JSON parse */
            let data;
            try {
                const clean = reply.replace(/```json|```/g, '').trim();
                data = JSON.parse(clean);
            } catch {
                /* JSON kelmasa — oddiy matn ko'rsat */
                contentEl.innerHTML = `<div class="essay-section">${reply.replace(/\n/g,'<br>')}</div>`;
                resultEl.classList.add('show');
                return;
            }

            contentEl.innerHTML = renderResult(data);
            resultEl.classList.add('show');
            resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

            /* Log */
            if (U) U.logUsage('ai-essay', 'Essay Checker');

        } catch (err) {
            contentEl.innerHTML = `<div class="essay-section" style="border-color:#ef4444">
                ⚠️ Xatolik: ${esc(err.message)}
            </div>`;
            resultEl.classList.add('show');
            console.error('[ai-essay]', err);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-search"></i> Matnni tekshirish';
        }
    };

    /* ── generateTests — ai-chat.js ga qo'shimcha ── */
    window.generateTests = async function () {
        const subjectEl = document.getElementById('genSubject');
        const countEl   = document.getElementById('genCount');
        const topicEl   = document.getElementById('genTopic');
        const resultEl  = document.getElementById('genResult');
        const btn       = document.getElementById('genBtn');

        if (!subjectEl || !countEl || !resultEl || !btn) return;

        const subject = subjectEl.value;
        const count   = countEl.value   || '10';
        const topic   = topicEl?.value.trim() || subject;

        /* Auth */
        const U = window.ZiyomapUsage;
        if (!U || !U.getUser()) {
            if (window.ZiyomapNotifications) ZiyomapNotifications.warning('Iltimos, avval tizimga kiring!');
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yaratilmoqda...';
        resultEl.classList.remove('show');

        const prompt = `${subject} fanidan "${topic}" mavzusida ${count} ta test savoli tuzing.
Har bir savol uchun:
- Savol raqami va matni
- A, B, C, D javob variantlari
- To'g'ri javob (oxirida)

Formatni qat'iy saqlang. O'zbek tilida yozing.`;

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: 'user', content: prompt }],
                }),
            });

            if (!res.ok) throw new Error('Server xatosi: ' + res.status);

            const raw   = await res.json();
            const reply = raw.content || raw.reply || raw.text || '(Javob kelmadi)';

            let html = window.marked ? marked.parse(reply)
                       : reply.replace(/\n/g, '<br>');

            resultEl.innerHTML = html;
            resultEl.classList.add('show');
            resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

            if (U) U.logUsage('ai-gen', 'Test Generator');

        } catch (err) {
            resultEl.innerHTML = `⚠️ Xatolik: ${esc(err.message)}`;
            resultEl.classList.add('show');
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<i class="fas fa-layer-group"></i> Testlarni yaratish';
        }
    };

    /* ── HTML escape ── */
    function esc(str) {
        return String(str || '')
            .replace(/&/g,'&amp;')
            .replace(/</g,'&lt;')
            .replace(/>/g,'&gt;');
    }

})();
