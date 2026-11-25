/* ZIYOMAP — mini-Markdown (xavfsiz). Maqola matnini HTML yoki Telegram HTML'ga aylantiradi.
   Qo'llab-quvvatlanadi: ## / ### sarlavha, **qalin**, *kursiv*, `kod`, [matn](https://havola),
   ![rasm](https://rasm-manzili), - ro'yxat, 1. raqamli ro'yxat, > iqtibos, --- chiziq.
   Barcha kiritilgan matn HTML'dan tozalanadi (escape), faqat http(s) havolalar ruxsat etiladi. */
(function () {
    'use strict';

    function esc(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    const URL_RE = /^https?:\/\/[^\s<>"']+$/i;

    // Havola va kodni vaqtincha olib qo'yib, qolgan matnga kursiv/qalin qo'llaymiz
    function inline(raw, mode) {
        const stash = [];
        const keep = (html) => { stash.push(html); return '\u0000' + (stash.length - 1) + '\u0000'; };
        let t = String(raw == null ? '' : raw);

        t = t.replace(/`([^`\n]+)`/g, (m, code) =>
            keep(mode === 'tg' ? '<code>' + esc(code) + '</code>' : '<code>' + esc(code) + '</code>'));

        t = t.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, (m, label, url) => {
            if (!URL_RE.test(url)) return m;
            const text = esc(label);
            return keep(mode === 'tg'
                ? '<a href="' + esc(url) + '">' + text + '</a>'
                : '<a href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + text + '</a>');
        });

        t = esc(t);
        t = t.replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>');
        t = t.replace(/(^|[^*\w])\*([^*\n]+)\*(?!\*)/g, '$1<i>$2</i>');
        t = t.replace(/(^|[^\w])_([^_\n]+)_(?!\w)/g, '$1<i>$2</i>');
        if (mode !== 'tg') t = t.replace(/<b>/g, '<strong>').replace(/<\/b>/g, '</strong>')
            .replace(/<i>/g, '<em>').replace(/<\/i>/g, '</em>');

        return t.replace(/\u0000(\d+)\u0000/g, (m, i) => stash[+i]);
    }

    function render(md) {
        const lines = String(md == null ? '' : md).replace(/\r\n?/g, '\n').split('\n');
        const out = [];
        let para = [];
        let list = null; // { type:'ul'|'ol', items:[] }

        function flushPara() {
            if (para.length) { out.push('<p>' + para.map((l) => inline(l)).join('<br>') + '</p>'); para = []; }
        }
        function flushList() {
            if (list) {
                out.push('<' + list.type + '>' + list.items.map((i) => '<li>' + inline(i) + '</li>').join('') + '</' + list.type + '>');
                list = null;
            }
        }

        for (const line of lines) {
            const l = line.trimEnd();
            if (!l.trim()) { flushPara(); flushList(); continue; }

            let m;
            if ((m = l.match(/^(#{2,3})\s+(.+)$/))) {
                flushPara(); flushList();
                const lvl = m[1].length === 2 ? 'h2' : 'h3';
                out.push('<' + lvl + '>' + inline(m[2]) + '</' + lvl + '>');
            } else if (/^-{3,}$/.test(l.trim())) {
                flushPara(); flushList(); out.push('<hr>');
            } else if ((m = l.match(/^>\s?(.*)$/))) {
                flushPara(); flushList();
                out.push('<blockquote>' + inline(m[1]) + '</blockquote>');
            } else if ((m = l.match(/^!\[([^\]\n]*)\]\((https?:\/\/[^\s)]+)\)\s*$/)) && URL_RE.test(m[2])) {
                flushPara(); flushList();
                out.push('<figure><img src="' + esc(m[2]) + '" alt="' + esc(m[1]) + '" loading="lazy">' +
                    (m[1] ? '<figcaption>' + esc(m[1]) + '</figcaption>' : '') + '</figure>');
            } else if ((m = l.match(/^\s*[-*•]\s+(.+)$/))) {
                flushPara();
                if (!list || list.type !== 'ul') { flushList(); list = { type: 'ul', items: [] }; }
                list.items.push(m[1]);
            } else if ((m = l.match(/^\s*\d+[.)]\s+(.+)$/))) {
                flushPara();
                if (!list || list.type !== 'ol') { flushList(); list = { type: 'ol', items: [] }; }
                list.items.push(m[1]);
            } else {
                flushList();
                para.push(l);
            }
        }
        flushPara(); flushList();
        return out.join('\n');
    }

    // Oddiy matn (qisqa ta'rif / kartochka uchun)
    function plain(md) {
        return String(md == null ? '' : md)
            .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
            .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
            .replace(/^#{1,3}\s+/gm, '')
            .replace(/^>\s?/gm, '')
            .replace(/^\s*(?:[-*•]|\d+[.)])\s+/gm, '')
            .replace(/(\*\*|\*|_|`)/g, '')
            .replace(/-{3,}/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    // Telegram HTML (faqat <b>, <i>, <a>, <code> teglari ruxsat etilgan)
    function toTelegram(md) {
        return String(md == null ? '' : md).replace(/\r\n?/g, '\n').split('\n').map((l) => {
            let m;
            if ((m = l.match(/^#{2,3}\s+(.+)$/))) return '<b>' + inline(m[1], 'tg') + '</b>';
            if ((m = l.match(/^\s*[-*•]\s+(.+)$/))) return '• ' + inline(m[1], 'tg');
            if ((m = l.match(/^>\s?(.*)$/))) return '❝ ' + inline(m[1], 'tg');
            if (/^!\[/.test(l)) return '';
            return inline(l, 'tg');
        }).join('\n').replace(/\n{3,}/g, '\n\n').trim();
    }

    function readMinutes(md) {
        const words = plain(md).split(/\s+/).filter(Boolean).length;
        return Math.max(1, Math.round(words / 180));
    }

    window.ZiyomapMD = { render, plain, toTelegram, readMinutes, esc };
})();
