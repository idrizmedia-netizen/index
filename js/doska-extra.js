/* ════════════════════════════════════════════════════════════
   ZiyoDoska — QO'SHIMCHA IMKONIYATLAR
   1) Tanlash vositasi (select/move/delete)
   2) Rasmni doskaga obyekt sifatida joylashtirish
   3) PDF'ni fon sifatida import qilish
   4) Barcha sahifalarni PDF qilib eksport qilish
   5) Darsni video sifatida yozib olish

   doska.js va doska-measure.js dan KEYIN yuklanadi, ularning
   global o'zgaruvchi/funksiyalaridan foydalanadi.
════════════════════════════════════════════════════════════ */

/* Canvas'ning CSS-displey (ekran) koordinatasini beradi — zoom/RENDER_SCALE
   ta'sirisiz, faqat canvas'ning ekrandagi to'rtburchagiga nisbatan. */
function getDisplayCoords(e) {
    const rect = canvas.getBoundingClientRect();
    let cx, cy;
    if (e.touches && e.touches.length) { cx = e.touches[0].clientX; cy = e.touches[0].clientY; }
    else { cx = e.clientX; cy = e.clientY; }
    return { x: cx - rect.left, y: cy - rect.top };
}

/* ════════════════════════════════════════════════════════════
   1) TANLASH VOSITASI
   Sudrab to'rtburchak chizasiz → shu qismi "kesib olinadi" →
   uni boshqa joyga sudrab qo'yasiz yoki Delete bilan o'chirasiz.
════════════════════════════════════════════════════════════ */
let selectDrawing = false;
let selectStart = null;
let selectionBoxEl = null;
let selectionRect = null;       // {x,y,w,h} canvas-ichki piksellarda
let selectionImageData = null;  // kesib olingan piksel bufferi
let selectionHoleImageData = null; // butun canvas, "teshik" bilan (kesilgan joy bo'sh)
let selectionMoveDragging = false;

function ensureSelectionBox() {
    if (!selectionBoxEl) {
        selectionBoxEl = document.createElement('div');
        selectionBoxEl.className = 'selection-box';
        document.getElementById('widget-layer').appendChild(selectionBoxEl);
        attachSelectionDrag();
    }
    return selectionBoxEl;
}

function clearSelectionState(restoreOriginal) {
    if (restoreOriginal && selectionHoleImageData && selectionImageData && selectionRect) {
        ctx.putImageData(selectionHoleImageData, 0, 0);
        ctx.putImageData(selectionImageData, selectionRect.x, selectionRect.y);
    }
    if (selectionBoxEl) selectionBoxEl.style.display = 'none';
    selectionRect = null;
    selectionImageData = null;
    selectionHoleImageData = null;
}

function startSelect(e) {
    if (tool !== 'select') return;
    if (e.target.closest('.floating-toolbar') || e.target.closest('.measure-tool') || e.target.closest('.selection-box')) return;
    clearSelectionState(false);
    selectDrawing = true;
    selectStart = getDisplayCoords(e);
    const box = ensureSelectionBox();
    box.style.display = 'block';
    box.classList.remove('has-content');
    box.style.left = selectStart.x + 'px';
    box.style.top = selectStart.y + 'px';
    box.style.width = '0px';
    box.style.height = '0px';
    e.preventDefault();
}

function moveSelectDraw(e) {
    if (!selectDrawing) return;
    const p = getDisplayCoords(e);
    const x = Math.min(p.x, selectStart.x);
    const y = Math.min(p.y, selectStart.y);
    const w = Math.abs(p.x - selectStart.x);
    const h = Math.abs(p.y - selectStart.y);
    selectionBoxEl.style.left = x + 'px';
    selectionBoxEl.style.top = y + 'px';
    selectionBoxEl.style.width = w + 'px';
    selectionBoxEl.style.height = h + 'px';
    e.preventDefault();
}

function endSelectDraw() {
    if (!selectDrawing) return;
    selectDrawing = false;
    const boxRect = selectionBoxEl.getBoundingClientRect();
    const canvasRect = canvas.getBoundingClientRect();
    if (boxRect.width < 6 || boxRect.height < 6) { selectionBoxEl.style.display = 'none'; return; }
    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;
    const sx = Math.round((boxRect.left - canvasRect.left) * scaleX);
    const sy = Math.round((boxRect.top - canvasRect.top) * scaleY);
    const sw = Math.round(boxRect.width * scaleX);
    const sh = Math.round(boxRect.height * scaleY);

    pushUndo();
    selectionRect = { x: sx, y: sy, w: sw, h: sh };
    selectionImageData = ctx.getImageData(sx, sy, sw, sh);
    ctx.clearRect(sx, sy, sw, sh);
    selectionHoleImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    selectionBoxEl.classList.add('has-content');
    showToast('✅ Tanlandi — sudrab ko\u2019chiring yoki Delete bosib o\u2019chiring');
}

function attachSelectionDrag() {
    let dragging = false, startX = 0, startY = 0, origLeft = 0, origTop = 0;
    function onDown(e) {
        if (!selectionBoxEl.classList.contains('has-content')) return;
        dragging = true;
        selectionMoveDragging = true;
        const p = getDisplayCoords(e);
        startX = p.x; startY = p.y;
        origLeft = parseFloat(selectionBoxEl.style.left);
        origTop = parseFloat(selectionBoxEl.style.top);
        e.stopPropagation();
        e.preventDefault();
    }
    function onMove(e) {
        if (!dragging) return;
        const p = getDisplayCoords(e);
        const nl = origLeft + (p.x - startX);
        const nt = origTop + (p.y - startY);
        selectionBoxEl.style.left = nl + 'px';
        selectionBoxEl.style.top = nt + 'px';
        const canvasRect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / canvasRect.width;
        const scaleY = canvas.height / canvasRect.height;
        const newCanvasX = Math.round(nl * scaleX);
        const newCanvasY = Math.round(nt * scaleY);
        if (selectionHoleImageData && selectionImageData) {
            ctx.putImageData(selectionHoleImageData, 0, 0);
            ctx.putImageData(selectionImageData, newCanvasX, newCanvasY);
            selectionRect.x = newCanvasX;
            selectionRect.y = newCanvasY;
        }
    }
    function onUp() {
        if (!dragging) return;
        dragging = false;
        selectionMoveDragging = false;
        scheduleAutosave();
    }
    selectionBoxEl.addEventListener('mousedown', onDown);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    selectionBoxEl.addEventListener('touchstart', onDown, { passive: false });
    document.addEventListener('touchmove', (e) => { if (dragging) { onMove(e.touches[0]); e.preventDefault(); } }, { passive: false });
    document.addEventListener('touchend', onUp);
}

canvas.addEventListener('mousedown', startSelect);
canvas.addEventListener('mousemove', moveSelectDraw);
canvas.addEventListener('mouseup', endSelectDraw);
canvas.addEventListener('touchstart', startSelect, { passive: false });
canvas.addEventListener('touchmove', moveSelectDraw, { passive: false });
canvas.addEventListener('touchend', endSelectDraw);

document.getElementById('btn-select')?.addEventListener('click', () => {
    tool = 'select';
    canvas.classList.remove('eraser-mode');
    document.getElementById('btn-eraser')?.classList.remove('active');
    document.querySelectorAll('.shape-btn, .pen-mode-btn').forEach((b) => b.classList.remove('active'));
    document.getElementById('btn-select')?.classList.add('active');
    showToast('🔲 Tanlash vositasi: to\u2019rtburchak sudrab chizing');
});

document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectionRect) {
        e.preventDefault();
        clearSelectionState(false); // hozirgi (kesilgan) holat saqlanadi — obyekt o'chirilgan bo'ladi
        scheduleAutosave();
        showToast('🗑 Tanlangan qism o\u2019chirildi');
    }
    if (e.key === 'Escape' && selectionRect) {
        clearSelectionState(true); // asl joyiga qaytaradi
        showToast('↩️ Bekor qilindi');
    }
});

/* ════════════════════════════════════════════════════════════
   2) RASMNI DOSKAGA OBYEKT SIFATIDA JOYLASHTIRISH
      Widget sifatida qo'shiladi: sudrab ko'chiriladi, burchagidan
      o'lchami o'zgartiriladi, "Doskaga chiqarish" bosilganda
      canvas'ga chinakam chiziladi (stamp).
════════════════════════════════════════════════════════════ */
function addImageWidgetFromFile(file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
        const el = createWidgetShell('🖼 Rasm', null);
        el.classList.add('image-widget');
        const body = document.createElement('div');
        body.className = 'image-widget-frame';
        body.innerHTML = `<img src="${ev.target.result}" draggable="false">`;
        el.appendChild(body);
        const stampBtn = document.createElement('button');
        stampBtn.type = 'button';
        stampBtn.className = 'tw-stamp-btn';
        stampBtn.innerHTML = '<i class="fas fa-check"></i> Doskaga chiqarish';
        stampBtn.addEventListener('click', () => stampImageWidget(el));
        el.appendChild(stampBtn);
    };
    reader.readAsDataURL(file);
}

function stampImageWidget(wrap) {
    const img = wrap.querySelector('img');
    const frame = wrap.querySelector('.image-widget-frame');
    const canvasRect = canvas.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    const scaleX = canvas.width / canvasRect.width;
    const scaleY = canvas.height / canvasRect.height;
    const dx = (frameRect.left - canvasRect.left) * scaleX;
    const dy = (frameRect.top - canvasRect.top) * scaleY;
    const dw = frameRect.width * scaleX;
    const dh = frameRect.height * scaleY;
    pushUndo();
    ctx.drawImage(img, dx, dy, dw, dh);
    wrap.remove();
    scheduleAutosave();
    showToast('✅ Rasm doskaga chiqarildi');
}

document.getElementById('widget-image')?.addEventListener('click', () => {
    document.getElementById('image-widget-input')?.click();
});
document.getElementById('image-widget-input')?.addEventListener('change', (e) => {
    const f = e.target.files[0];
    if (f) addImageWidgetFromFile(f);
    e.target.value = '';
});

/* ════════════════════════════════════════════════════════════
   3) PDF'NI FON SIFATIDA IMPORT QILISH
════════════════════════════════════════════════════════════ */
document.getElementById('widget-pdf-bg')?.addEventListener('click', () => {
    document.getElementById('pdf-bg-input')?.click();
});
document.getElementById('pdf-bg-input')?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    if (typeof pdfjsLib === 'undefined') {
        showToast('⚠️ PDF kutubxonasi yuklanmadi, internetni tekshiring');
        return;
    }
    try {
        showToast('⏳ PDF yuklanmoqda...');
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        const buf = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 2 });
        const off = document.createElement('canvas');
        off.width = viewport.width;
        off.height = viewport.height;
        await page.render({ canvasContext: off.getContext('2d'), viewport }).promise;
        const dataUrl = off.toDataURL('image/png');
        setPageBg({ type: 'image', value: dataUrl });
        showToast(`✅ PDF fon qilib qo\u2019yildi${pdf.numPages > 1 ? ' (1-sahifa, jami ' + pdf.numPages + ' sahifa)' : ''}`);
    } catch (err) {
        console.error(err);
        showToast('⚠️ PDF ochilmadi: ' + err.message);
    }
});

/* ════════════════════════════════════════════════════════════
   4) BARCHA SAHIFALARNI PDF QILIB EKSPORT QILISH
════════════════════════════════════════════════════════════ */
document.getElementById('btn-save-pdf')?.addEventListener('click', async () => {
    if (typeof window.jspdf === 'undefined') {
        showToast('⚠️ PDF kutubxonasi yuklanmadi, internetni tekshiring');
        return;
    }
    showToast('⏳ PDF tayyorlanmoqda...');
    try {
        if (typeof savePageSnapshot === 'function') savePageSnapshot();
    } catch { /* eslatma: funksiya nomi versiyaga qarab farq qilishi mumkin */ }

    const { jsPDF } = window.jspdf;
    const w = canvas.width, h = canvas.height;
    const orientation = w >= h ? 'l' : 'p';
    const doc = new jsPDF({ orientation, unit: 'px', format: [w, h] });

    const pageList = (typeof pages !== 'undefined' && pages.length) ? pages : [{ dataUrl: canvas.toDataURL('image/png'), bg: '#0f172a' }];

    pageList.forEach((p, i) => {
        if (i > 0) doc.addPage([w, h], orientation);
        let dataUrl = p.dataUrl;
        if (!dataUrl) {
            const off = document.createElement('canvas');
            off.width = w; off.height = h;
            const octx = off.getContext('2d');
            octx.fillStyle = (p.bg && p.bg.type === 'color') ? p.bg.value : '#0f172a';
            octx.fillRect(0, 0, w, h);
            dataUrl = off.toDataURL('image/png');
        }
        doc.addImage(dataUrl, 'PNG', 0, 0, w, h);
    });

    doc.save('ziyodoska.pdf');
    showToast('✅ PDF yuklandi');
});

/* ════════════════════════════════════════════════════════════
   5) DARSNI VIDEO SIFATIDA YOZIB OLISH
      Eslatma: faqat canvas'ga CHIZILGAN narsalar yoziladi.
      Widgetlar (taymer, matn, sirkul va h.k.) DOM elementlari
      bo'lgani uchun videoga tushmaydi — faqat doskaga "chiqarilgan"
      (stamp qilingan) narsalar tushadi.
════════════════════════════════════════════════════════════ */
let doskaMediaRecorder = null;
let doskaRecordedChunks = [];
let isRecording = false;

function updateRecordBtnUI() {
    const btn = document.getElementById('btn-record');
    if (!btn) return;
    btn.innerHTML = isRecording
        ? '<i class="fas fa-stop" style="color:#ef4444"></i> To\u2019xtatish'
        : '<i class="fas fa-circle" style="color:#ef4444"></i> Yozish';
    btn.classList.toggle('recording-active', isRecording);
}

document.getElementById('btn-record')?.addEventListener('click', () => {
    if (!isRecording) {
        if (typeof canvas.captureStream !== 'function') {
            showToast('⚠️ Brauzeringiz video yozishni qo\u2019llamaydi');
            return;
        }
        const stream = canvas.captureStream(25);
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'video/webm';
        doskaMediaRecorder = new MediaRecorder(stream, { mimeType });
        doskaRecordedChunks = [];
        doskaMediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) doskaRecordedChunks.push(e.data); };
        doskaMediaRecorder.onstop = () => {
            const blob = new Blob(doskaRecordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'ziyodoska-dars-' + Date.now() + '.webm';
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 4000);
            showToast('✅ Video saqlandi (.webm)');
        };
        doskaMediaRecorder.start();
        isRecording = true;
        updateRecordBtnUI();
        showToast('🔴 Yozib olish boshlandi');
    } else {
        doskaMediaRecorder?.stop();
        isRecording = false;
        updateRecordBtnUI();
    }
});
