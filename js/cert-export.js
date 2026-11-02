/* ══════════════════════════════════════════════════════════════
   ZIYOMAP — SERTIFIKATNI TO'G'RIDAN-TO'G'RI PDF QILISH
   (chop etish oynasisiz) + OMMAVIY YUKLAB OLISH (ZIP / bitta PDF)

   Kutubxonalar (html2canvas, jsPDF, JSZip) kerak bo'lganda cdnjs'dan
   o'zi yuklanadi — HTML sahifalarga qo'shimcha <script> kerak emas.

   Ishlatilishi:
     await ZiyomapCertExport.downloadPdf(certHtml, 'Diplom-Aliyev.pdf')
     await ZiyomapCertExport.downloadBulk(items, { format:'zip'|'pdf', name, onProgress, shouldCancel })
        items = [{ html, filename }]
   ══════════════════════════════════════════════════════════════ */
(function () {
    'use strict';

    var LIBS = {
        html2canvas: 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
        jspdf: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
        jszip: 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
    };

    function loadScript(src) {
        return new Promise(function (resolve, reject) {
            if (document.querySelector('script[data-ziyo-lib="' + src + '"]')) {
                // allaqachon qo'shilgan — yuklanib bo'lishini kutamiz
                var existing = document.querySelector('script[data-ziyo-lib="' + src + '"]');
                if (existing.dataset.loaded === '1') return resolve();
                existing.addEventListener('load', function () { resolve(); });
                existing.addEventListener('error', function () { reject(new Error('Skript yuklanmadi: ' + src)); });
                return;
            }
            var s = document.createElement('script');
            s.src = src;
            s.dataset.ziyoLib = src;
            s.onload = function () { s.dataset.loaded = '1'; resolve(); };
            s.onerror = function () { reject(new Error('Skript yuklanmadi: ' + src)); };
            document.head.appendChild(s);
        });
    }

    function ensureLibs(needZip) {
        var jobs = [
            window.html2canvas ? Promise.resolve() : loadScript(LIBS.html2canvas),
            (window.jspdf && window.jspdf.jsPDF) ? Promise.resolve() : loadScript(LIBS.jspdf)
        ];
        if (needZip) jobs.push(window.JSZip ? Promise.resolve() : loadScript(LIBS.jszip));
        return Promise.all(jobs);
    }

    function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

    // Chop etish oynasini ochadigan qatorlarni olib tashlaydi (iframe ichida print chiqmasin)
    function stripAutoPrint(html) {
        return String(html).replace(/setTimeout\(\s*\(\)\s*=>\s*window\.print\(\)\s*,\s*\d+\s*\)\s*;?/g, '');
    }

    // Sertifikat HTML'ini ko'rinmas iframe'da chizadi va canvas qaytaradi
    async function renderCanvas(html) {
        await ensureLibs(false);
        var iframe = document.createElement('iframe');
        iframe.setAttribute('aria-hidden', 'true');
        iframe.style.cssText = 'position:fixed;left:-12000px;top:0;width:1123px;height:900px;border:0;opacity:0;pointer-events:none';
        var loaded = new Promise(function (resolve, reject) {
            var t = setTimeout(function () { reject(new Error('Sertifikat yuklanishi uzoq cho\u2018zildi')); }, 25000);
            iframe.addEventListener('load', function () { clearTimeout(t); resolve(); });
        });
        iframe.srcdoc = stripAutoPrint(html);
        document.body.appendChild(iframe);
        try {
            await loaded;
            var doc = iframe.contentDocument;
            var win = iframe.contentWindow;

            // QR kod window.onload ichida chiziladi — paydo bo'lishini kutamiz (ko'pi bilan ~5 soniya)
            for (var i = 0; i < 50; i++) {
                var qr = doc.querySelector('#cert-qr');
                if (!qr) break; // QR bloki bo'lmagan hujjat
                var img = qr.querySelector('img');
                if (qr.querySelector('canvas') && img && img.src && img.src.indexOf('data:') === 0) break;
                await sleep(100);
            }
            if (doc.fonts && doc.fonts.ready) { try { await doc.fonts.ready; } catch (e) { /* ignore */ } }
            // Hamma rasmlar yuklanishini kutamiz
            var pending = Array.prototype.filter.call(doc.images, function (im) { return !im.complete; });
            if (pending.length) {
                await Promise.race([
                    Promise.all(pending.map(function (im) {
                        return new Promise(function (r) { im.addEventListener('load', r); im.addEventListener('error', r); });
                    })),
                    sleep(8000)
                ]);
            }
            await sleep(150);

            var target = doc.querySelector('.cert-outer') || doc.body;
            var canvas = await window.html2canvas(target, {
                scale: 2,
                useCORS: true,
                backgroundColor: null,
                logging: false,
                windowWidth: win.innerWidth || 1123
            });
            return canvas;
        } finally {
            if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        }
    }

    // Canvas'ni oq fonli (JPEG uchun) tekis tasvirga aylantiradi
    function flatten(canvas) {
        var flat = document.createElement('canvas');
        flat.width = canvas.width;
        flat.height = canvas.height;
        var ctx = flat.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, flat.width, flat.height);
        ctx.drawImage(canvas, 0, 0);
        return flat;
    }

    function newPdf() {
        var JsPDF = window.jspdf.jsPDF;
        return new JsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
    }

    function addCanvasPage(pdf, canvas, isFirst) {
        if (!isFirst) pdf.addPage('a4', 'landscape');
        var pw = 297, ph = 210, m = 8;
        var maxW = pw - 2 * m, maxH = ph - 2 * m;
        var ratio = canvas.width / canvas.height;
        var w = maxW, h = w / ratio;
        if (h > maxH) { h = maxH; w = h * ratio; }
        var x = (pw - w) / 2, y = (ph - h) / 2;
        pdf.addImage(flatten(canvas).toDataURL('image/jpeg', 0.93), 'JPEG', x, y, w, h, undefined, 'FAST');
    }

    function safeFileName(name, ext) {
        var base = String(name || 'sertifikat')
            .replace(/[\\/:*?"<>|\u0000-\u001f]/g, '')
            .replace(/\s+/g, ' ')
            .trim()
            .slice(0, 80) || 'sertifikat';
        return base + (ext || '');
    }

    function saveBlob(blob, filename) {
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 4000);
    }

    // Bitta sertifikat -> PDF Blob
    async function htmlToPdfBlob(html) {
        var canvas = await renderCanvas(html);
        var pdf = newPdf();
        addCanvasPage(pdf, canvas, true);
        return pdf.output('blob');
    }

    // Bitta sertifikatni to'g'ridan-to'g'ri yuklab oladi
    async function downloadPdf(html, filename) {
        var blob = await htmlToPdfBlob(html);
        saveBlob(blob, safeFileName(filename.replace(/\.pdf$/i, ''), '.pdf'));
    }

    // Ommaviy: items = [{ html, filename }], opts.format = 'zip' | 'pdf'
    async function downloadBulk(items, opts) {
        opts = opts || {};
        var format = opts.format === 'pdf' ? 'pdf' : 'zip';
        var onProgress = opts.onProgress || function () {};
        var shouldCancel = opts.shouldCancel || function () { return false; };
        var base = safeFileName(opts.name || 'sertifikatlar');
        await ensureLibs(format === 'zip');

        var done = 0, failed = [];
        var pdf = format === 'pdf' ? newPdf() : null;
        var zip = format === 'zip' ? new window.JSZip() : null;
        var usedNames = {};

        for (var i = 0; i < items.length; i++) {
            if (shouldCancel()) return { cancelled: true, done: done, failed: failed };
            var it = items[i];
            onProgress(i, items.length, it.filename);
            try {
                if (format === 'pdf') {
                    var canvas = await renderCanvas(it.html);
                    addCanvasPage(pdf, canvas, done === 0);
                } else {
                    var blob = await htmlToPdfBlob(it.html);
                    var fn = safeFileName(it.filename.replace(/\.pdf$/i, ''), '.pdf');
                    if (usedNames[fn]) { usedNames[fn]++; fn = fn.replace(/\.pdf$/, '-' + usedNames[fn] + '.pdf'); }
                    else usedNames[fn] = 1;
                    zip.file(fn, blob);
                }
                done++;
            } catch (err) {
                console.error('Sertifikat PDF qilinmadi:', it.filename, err);
                failed.push(it.filename);
            }
        }
        onProgress(items.length, items.length, '');
        if (!done) return { cancelled: false, done: 0, failed: failed };

        if (format === 'pdf') {
            saveBlob(pdf.output('blob'), base + '.pdf');
        } else {
            var zblob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
            saveBlob(zblob, base + '.zip');
        }
        return { cancelled: false, done: done, failed: failed };
    }

    window.ZiyomapCertExport = {
        ensureLibs: ensureLibs,
        htmlToPdfBlob: htmlToPdfBlob,
        downloadPdf: downloadPdf,
        downloadBulk: downloadBulk,
        safeFileName: safeFileName,
        saveBlob: saveBlob
    };
})();
