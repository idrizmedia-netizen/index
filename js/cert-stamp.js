/* ══════════════════════════════════════════════════════════════
   ZIYOMAP — SERTIFIKAT / DIPLOM PECHATI (universal)
   Barcha turdagi hujjat (diplom, sertifikat, rag'batlantirish,
   tashakkurnoma) uchun bitta dizayn — rangi hujjat mavzusiga
   (theme.deep) moslashadi. Rasm yuklash shart emas.

   Ishlatilishi:
     ZiyomapStamp.html({ color, year, style })  -> HTML'ga qo'yiladigan tayyor blok
     ZiyomapStamp.svg({ color, year, style })   -> sof SVG matn
     await ZiyomapStamp.png({ color, year, style }) -> PNG (dataURL), PPTX uchun
     style: 'classic' (standart) | 'star8' | 'laurel' | 'none' (pechatsiz)
     Yangi pechat qo'shish: centerXxx() funksiya yozing va svg() / STYLES ga ulang.
   ══════════════════════════════════════════════════════════════ */
(function () {
    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    // Beshburchakli yulduz nuqtalari
    function starPoints(cx, cy, rOuter, rInner) {
        var pts = [];
        for (var i = 0; i < 10; i++) {
            var r = i % 2 === 0 ? rOuter : rInner;
            var a = -Math.PI / 2 + (i * Math.PI) / 5;
            pts.push((cx + r * Math.cos(a)).toFixed(2) + ',' + (cy + r * Math.sin(a)).toFixed(2));
        }
        return pts.join(' ');
    }

    var FONT = "Georgia,'Times New Roman',serif";

    // Umumiy qism: ikki halqa + aylana bo'ylab yozuvlar (tepada va pastda)
    function ring(c, topText, botText) {
        return '<defs>' +
            '<path id="zsTop" d="M 30,100 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0"/>' +
            '<path id="zsBot" d="M 20,100 a 80,80 0 0,0 160,0"/>' +
            '</defs>' +
            '<g fill="none" stroke="' + c + '">' +
            '<circle cx="100" cy="100" r="94" stroke-width="3.2"/>' +
            '<circle cx="100" cy="100" r="89" stroke-width="1"/>' +
            '<circle cx="100" cy="100" r="64" stroke-width="1.6"/>' +
            '</g>' +
            '<text font-family="' + FONT + '" font-size="12.5" font-weight="700" letter-spacing="1.6" fill="' + c + '" text-anchor="middle">' +
            '<textPath href="#zsTop" xlink:href="#zsTop" startOffset="25%">' + topText + '</textPath></text>' +
            '<text font-family="' + FONT + '" font-size="12.5" font-weight="700" letter-spacing="1.6" fill="' + c + '" text-anchor="middle">' +
            '<textPath href="#zsBot" xlink:href="#zsBot" startOffset="50%">' + botText + '</textPath></text>';
    }

    // 1) KLASSIK: markazda yulduz, ZIYOMAP va yil
    function centerClassic(c, year) {
        return '<polygon points="' + starPoints(100, 76, 14, 5.8) + '" fill="' + c + '"/>' +
            '<text x="100" y="109" text-anchor="middle" font-family="' + FONT + '" font-size="17" font-weight="700" letter-spacing="2.4" fill="' + c + '">ZIYOMAP</text>' +
            '<line x1="72" y1="118" x2="128" y2="118" stroke="' + c + '" stroke-width="1.2"/>' +
            '<text x="100" y="135" text-anchor="middle" font-family="' + FONT + '" font-size="13" font-weight="700" letter-spacing="1.5" fill="' + c + '">' + year + '</text>';
    }

    // 2) SAKKIZ QIRRALI YULDUZ: milliy naqsh (ikki kvadrat), markazda "Z", pastda yil
    function centerStar8(c, fg) {
        return '<g fill="' + c + '" fill-opacity="0.10" stroke="' + c + '" stroke-width="2.2" stroke-linejoin="round">' +
            '<rect x="65" y="65" width="70" height="70"/>' +
            '<rect x="65" y="65" width="70" height="70" transform="rotate(45 100 100)"/>' +
            '</g>' +
            '<circle cx="100" cy="100" r="16" fill="' + c + '"/>' +
            '<text x="100" y="108" text-anchor="middle" font-family="' + FONT + '" font-size="22" font-weight="700" fill="' + fg + '">Z</text>';
    }

    // 3) LAVR SHOXI: ikki tomonda lavr barglari, markazda yulduz, ZIYOMAP va yil
    function centerLaurel(c, year) {
        var leaves = '';
        var angles = [30, 52, 74, 96, 118, 140, 162];
        for (var i = 0; i < angles.length; i++) {
            leaves += '<ellipse cx="100" cy="48" rx="9.5" ry="4.2" transform="rotate(' + angles[i] + ' 100 100) rotate(25 100 48)"/>';
            leaves += '<ellipse cx="100" cy="48" rx="9.5" ry="4.2" transform="rotate(' + (-angles[i]) + ' 100 100) rotate(-25 100 48)"/>';
        }
        return '<g fill="' + c + '">' + leaves + '</g>' +
            '<g fill="none" stroke="' + c + '" stroke-width="1.4">' +
            '<path d="M 121.97,52.88 A 52,52 0 0,1 109.03,151.2"/>' +
            '<path d="M 78.03,52.88 A 52,52 0 0,0 90.97,151.2"/>' +
            '</g>' +
            '<polygon points="' + starPoints(100, 76, 9, 3.8) + '" fill="' + c + '"/>' +
            '<text x="100" y="105" text-anchor="middle" font-family="' + FONT + '" font-size="13" font-weight="700" letter-spacing="1.5" fill="' + c + '">ZIYOMAP</text>' +
            '<line x1="80" y1="112" x2="120" y2="112" stroke="' + c + '" stroke-width="1"/>' +
            '<text x="100" y="127" text-anchor="middle" font-family="' + FONT + '" font-size="12" font-weight="700" letter-spacing="1.2" fill="' + c + '">' + year + '</text>';
    }

    var STYLES = [
        { id: 'classic', label: 'Klassik' },
        { id: 'star8', label: 'Sakkiz qirrali yulduz' },
        { id: 'laurel', label: 'Lavr shoxi' },
        { id: 'none', label: 'Pechatsiz' }
    ];

    function svg(opts) {
        opts = opts || {};
        var c = opts.color || '#1e40af';
        var year = esc(opts.year || new Date().getFullYear());
        var style = opts.style || 'classic';
        var topText = esc(opts.topText || 'ZIYOMAP PLATFORMASI');
        var inner, botText;
        if (style === 'star8') {
            botText = esc(opts.bottomText || '\u2605 ' + year + ' \u2605');
            inner = centerStar8(c, opts.textOnInk || '#ffffff');
        } else if (style === 'laurel') {
            botText = esc(opts.bottomText || '\u2605 O\u2018ZBEKISTON \u2605');
            inner = centerLaurel(c, year);
        } else {
            botText = esc(opts.bottomText || '\u2605 O\u2018ZBEKISTON \u2605');
            inner = centerClassic(c, year);
        }
        return '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 200 200" width="200" height="200">' +
            ring(c, topText, botText) + inner + '</svg>';
    }

    // Sertifikat HTML'iga qo'yiladigan blok. Imzo ostida, yarim shaffof va biroz qiyshiq turadi —
    // imzo (z-index:2) pechat ustida to'liq ko'rinib turadi.
    function html(opts) {
        if (opts && opts.style === 'none') return '';
        return '<div class="cert-stamp">' + svg(opts) + '</div>';
    }

    // CSS (HTML qurilmalarda ham bir xil ishlatish uchun)
    var css = '.cert-sig-block{position:relative}' +
        '.cert-sig-slot{position:relative;z-index:2}' +
        '.cert-stamp{position:absolute;left:50%;top:-36px;width:100px;height:100px;margin-left:-36px;' +
        'transform:rotate(-12deg);z-index:1;pointer-events:none;opacity:.95;mix-blend-mode:multiply}' +
        '.cert-stamp svg{width:100%;height:100%;display:block}' +
        '@media print{.cert-stamp{-webkit-print-color-adjust:exact;print-color-adjust:exact}}';

    // PPTX uchun PNG (canvas orqali)
    function png(opts, sizePx) {
        sizePx = sizePx || 600;
        if (opts && opts.style === 'none') return Promise.resolve(null);
        return new Promise(function (resolve, reject) {
            var img = new Image();
            img.onload = function () {
                try {
                    var canvas = document.createElement('canvas');
                    canvas.width = sizePx;
                    canvas.height = sizePx;
                    canvas.getContext('2d').drawImage(img, 0, 0, sizePx, sizePx);
                    resolve(canvas.toDataURL('image/png'));
                } catch (e) { reject(e); }
            };
            img.onerror = function () { reject(new Error('Pechat rasmi yaratilmadi')); };
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg(opts));
        });
    }

    // "1-noyabr, 2026-yil" yoki "2026-yil 1-noyabr" kabi matndan yilni ajratadi
    function yearFrom(text) {
        var m = String(text || '').match(/\d{4}/);
        return m ? m[0] : String(new Date().getFullYear());
    }

    window.ZiyomapStamp = { svg: svg, html: html, png: png, css: css, yearFrom: yearFrom, styles: STYLES };
})();
