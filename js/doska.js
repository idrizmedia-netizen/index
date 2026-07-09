/* ════════════════════════════════════════════════════════════
   ZiyoDoska — to'liq funksional interaktiv doska
   Sahifalar, fon tanlash (rang/gradient/rasm), widgetlar
   (Taymer, Sekundomer, Soat, Matn), chizish, shakllar
════════════════════════════════════════════════════════════ */

const canvas = document.getElementById('board-canvas');
const ctx = canvas.getContext('2d');
const toolbar = document.getElementById('floating-toolbar');
const bgWrap = document.getElementById('doska-bg-wrap');
const tbBody = document.getElementById('tb-body');
const collapseBtn = document.getElementById('tb-collapse');
const collapseIcon = document.getElementById('tb-collapse-icon');
const widgetLayer = document.getElementById('widget-layer');
const pinnedLayer = document.getElementById('pinned-layer');

let drawing = false;
let color = '#ffffff';
let lineWidth = 4;
let tool = 'pen'; // pen | eraser | shape-line | shape-rect | shape-circle
let shapeStart = null;
let undoStack = [];
const MAX_UNDO = 25;

/* Lazer ko'rsatkich holati (kerakli funksiyalardan oldin e'lon qilinadi) */
let laserMode = false;
let laserPoints = [];
let lastCleanSnapshot = null;

/* Zoom holati */
let currentZoom = 1;
const ZOOM_MIN = 0.4;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.15;

/* Doska (canvas) ichki piksel zichligini oshirish — zoom qilinganda
   rasm sifati/chiziqlar xiralashib qolmasligi uchun canvas ekranda
   ko'rinadigan o'lchamdan RENDER_SCALE marta yuqori aniqlikda
   chiziladi (haqiqiy piksel zichligi), so'ng ekranga moslab
   kichraytirib ko'rsatiladi — shu sababli qanchalik kattalashtirsak
   ham (ZOOM_MAX gacha) tasvir doim aniq va tiniq bo'lib qoladi. */
const RENDER_SCALE = Math.min(3, Math.max(1, ZOOM_MAX));

/* Qo'l (pan) rejimi holati */
let panMode = false;

/* ════════════════════════════════════
   SAHIFALAR (slaydlar)
════════════════════════════════════ */
let pages = [{ dataUrl: null, bg: { type: 'color', value: '#0f172a' }, pinned: [] }];
let currentPage = 0;

function applyPageBg(bg) {
    if (!bgWrap) return;
    if (bg.type === 'color') {
        bgWrap.style.background = bg.value;
        bgWrap.style.backgroundImage = '';
    } else if (bg.type === 'gradient') {
        bgWrap.style.background = bg.value;
        bgWrap.style.backgroundImage = '';
    } else if (bg.type === 'image') {
        bgWrap.style.backgroundImage = `url(${bg.value})`;
        bgWrap.style.backgroundSize = 'cover';
        bgWrap.style.backgroundPosition = 'center';
    } else if (bg.type === 'pattern') {
        bgWrap.style.background = bg.value;
    }
}

function savePageSnapshot() {
    try {
        pages[currentPage].dataUrl = canvas.toDataURL();
    } catch { /* ignore */ }
    /* Joriy sahifadagi pinned-text elementlarini saqlash */
    pages[currentPage].pinned = Array.from(pinnedLayer.children).map((el) => ({
        text: el.querySelector('.pinned-text-content')?.textContent || '',
        x: parseFloat(el.style.left) || 0,
        y: parseFloat(el.style.top) || 0,
        fontSize: parseFloat(el.style.fontSize) || 16,
        color: el.style.color || '#ffffff',
        fontFamily: el.style.fontFamily || "'Inter', sans-serif",
        width: el.style.width ? parseFloat(el.style.width) : null,
    }));
}

function loadPageSnapshot(idx) {
    const page = pages[idx];
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    applyPageBg(page.bg);
    if (page.dataUrl) {
        const img = new Image();
        img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        img.src = page.dataUrl;
    }
    /* Pinned-text elementlarini tozalab, joriy sahifa uchun qayta yaratish */
    pinnedLayer.innerHTML = '';
    (page.pinned || []).forEach((pt) => createPinnedText(pt));
    updatePageNav();
}

function updatePageNav() {
    const label = document.getElementById('page-nav-label');
    const prevBtn = document.getElementById('page-nav-prev');
    const nextBtn = document.getElementById('page-nav-next');
    if (label) label.textContent = `${currentPage + 1} / ${pages.length}`;
    if (prevBtn) prevBtn.disabled = currentPage === 0;
    if (nextBtn) nextBtn.disabled = currentPage === pages.length - 1;
}

function goToPage(idx) {
    if (idx < 0 || idx >= pages.length || idx === currentPage) return;
    savePageSnapshot();
    currentPage = idx;
    undoStack = [];
    loadPageSnapshot(currentPage);
}

function addPage() {
    savePageSnapshot();
    const newBg = document.documentElement.getAttribute('data-doska-theme') === 'light'
        ? { type: 'color', value: '#ffffff' }
        : { type: 'color', value: '#0f172a' };
    pages.push({ dataUrl: null, bg: newBg, pinned: [] });
    currentPage = pages.length - 1;
    undoStack = [];
    loadPageSnapshot(currentPage);
    showToast('Yangi sahifa qo\'shildi');
}

function deletePage() {
    if (pages.length <= 1) { showToast('Kamida 1 sahifa qolishi kerak'); return; }
    if (!confirm(`${currentPage + 1}-sahifani o'chirasizmi?`)) return;
    pages.splice(currentPage, 1);
    currentPage = Math.max(0, currentPage - 1);
    undoStack = [];
    loadPageSnapshot(currentPage);
    showToast('Sahifa o\'chirildi');
}

document.getElementById('page-nav-prev')?.addEventListener('click', () => goToPage(currentPage - 1));
document.getElementById('page-nav-next')?.addEventListener('click', () => goToPage(currentPage + 1));
document.getElementById('page-nav-add')?.addEventListener('click', addPage);
document.getElementById('page-nav-delete')?.addEventListener('click', deletePage);

/* ════════════════════════════════════
   TOAST
════════════════════════════════════ */
let toastEl = null;
function showToast(msg) {
    if (!toastEl) {
        toastEl = document.createElement('div');
        toastEl.className = 'doska-toast';
        document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove('show'), 1800);
}

/* ════════════════════════════════════
   CANVAS RESIZE
════════════════════════════════════ */
function resizeCanvas() {
    const wrap = canvas.parentElement;
    const temp = document.createElement('canvas');
    temp.width = canvas.width;
    temp.height = canvas.height;
    if (canvas.width && canvas.height) temp.getContext('2d').drawImage(canvas, 0, 0);
    /* Canvas CSS orqali (100%) wrap o'lchamida ko'rinadi, lekin haqiqiy
       piksel soni RENDER_SCALE marta ko'p — shu tufayli zoom qilinganda
       ham tasvir xira bo'lmaydi. */
    canvas.width = Math.round(wrap.clientWidth * RENDER_SCALE);
    canvas.height = Math.round(wrap.clientHeight * RENDER_SCALE);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (temp.width && temp.height) ctx.drawImage(temp, 0, 0, canvas.width, canvas.height);
}

function pushUndo() {
    try {
        undoStack.push(canvas.toDataURL());
        if (undoStack.length > MAX_UNDO) undoStack.shift();
    } catch { /* ignore */ }
}

function undo() {
    if (!undoStack.length) return;
    const img = new Image();
    img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
    };
    img.src = undoStack.pop();
}

function getCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let cx, cy;
    if (e.touches && e.touches.length) {
        cx = e.touches[0].clientX;
        cy = e.touches[0].clientY;
    } else {
        cx = e.clientX;
        cy = e.clientY;
    }
    return {
        x: (cx - rect.left) * scaleX,
        y: (cy - rect.top) * scaleY,
    };
}

/* ════════════════════════════════════
   CHIZISH MANTIG'I
════════════════════════════════════ */
let snapshotBeforeShape = null;

function startDraw(e) {
    if (e.target.closest('.floating-toolbar') || e.target.closest('.board-widget') || e.target.closest('.page-nav')) return;
    if (panMode) return;
    drawing = true;
    const p = getCoords(e);

    if (laserMode) {
        lastCleanSnapshot = lastCleanSnapshot || (() => { const im = new Image(); im.src = canvas.toDataURL(); return im; })();
        laserPoints = [{ x: p.x, y: p.y, t: Date.now() }];
        requestAnimationFrame(laserLoop);
        e.preventDefault();
        return;
    }

    pushUndo();

    if (tool === 'pen' || tool === 'eraser') {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
    } else if (tool.startsWith('shape-')) {
        shapeStart = p;
        snapshotBeforeShape = canvas.toDataURL();
    }
    e.preventDefault();
}

function moveDraw(e) {
    if (!drawing) return;
    const p = getCoords(e);

    if (laserMode) {
        laserPoints.push({ x: p.x, y: p.y, t: Date.now() });
        e.preventDefault();
        return;
    }

    if (tool === 'pen' || tool === 'eraser') {
        ctx.strokeStyle = color;
        ctx.lineWidth = (tool === 'eraser' ? lineWidth * 2.5 : lineWidth) * RENDER_SCALE;
        ctx.globalCompositeOperation = tool === 'eraser' ? 'destination-out' : 'source-over';
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
    } else if (tool.startsWith('shape-') && shapeStart) {
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            drawShape(shapeStart, p);
        };
        img.src = snapshotBeforeShape;
    }
    e.preventDefault();
}

function drawShape(start, end) {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = lineWidth * RENDER_SCALE;
    ctx.globalCompositeOperation = 'source-over';
    ctx.beginPath();
    if (tool === 'shape-line') {
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    } else if (tool === 'shape-rect') {
        ctx.rect(start.x, start.y, end.x - start.x, end.y - start.y);
        ctx.stroke();
    } else if (tool === 'shape-circle') {
        const r = Math.hypot(end.x - start.x, end.y - start.y);
        ctx.arc(start.x, start.y, r, 0, Math.PI * 2);
        ctx.stroke();
    } else if (tool === 'shape-arrow') {
        drawArrow(start, end);
    } else if (tool === 'shape-triangle') {
        drawTriangle(start, end);
    } else if (tool === 'shape-star') {
        drawStar(start, end);
    }
}

function drawArrow(start, end) {
    const headLen = Math.max(14, lineWidth * 3) * RENDER_SCALE;
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - headLen * Math.cos(angle - Math.PI / 6), end.y - headLen * Math.sin(angle - Math.PI / 6));
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(end.x - headLen * Math.cos(angle + Math.PI / 6), end.y - headLen * Math.sin(angle + Math.PI / 6));
    ctx.stroke();
}

function drawTriangle(start, end) {
    const w = end.x - start.x;
    const h = end.y - start.y;
    ctx.beginPath();
    ctx.moveTo(start.x + w / 2, start.y);
    ctx.lineTo(start.x, start.y + h);
    ctx.lineTo(start.x + w, start.y + h);
    ctx.closePath();
    ctx.stroke();
}

function drawStar(start, end) {
    const cx = start.x;
    const cy = start.y;
    const rOuter = Math.hypot(end.x - start.x, end.y - start.y);
    const rInner = rOuter * 0.42;
    const spikes = 5;
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - rOuter);
    for (let i = 0; i < spikes; i++) {
        let x = cx + Math.cos(rot) * rOuter;
        let y = cy + Math.sin(rot) * rOuter;
        ctx.lineTo(x, y);
        rot += step;
        x = cx + Math.cos(rot) * rInner;
        y = cy + Math.sin(rot) * rInner;
        ctx.lineTo(x, y);
        rot += step;
    }
    ctx.lineTo(cx, cy - rOuter);
    ctx.closePath();
    ctx.stroke();
}

function endDraw() {
    drawing = false;
    ctx.globalCompositeOperation = 'source-over';
    shapeStart = null;
}

canvas.addEventListener('mousedown', startDraw);
canvas.addEventListener('mousemove', moveDraw);
canvas.addEventListener('mouseup', endDraw);
canvas.addEventListener('mouseleave', endDraw);
canvas.addEventListener('touchstart', startDraw, { passive: false });
canvas.addEventListener('touchmove', moveDraw, { passive: false });
canvas.addEventListener('touchend', endDraw);

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
applyPageBg(pages[0].bg);
pushUndo();

/* ════════════════════════════════════
   TOOLBAR — SECTION TABS (Chizish/Widget/Fon)
════════════════════════════════════ */
document.querySelectorAll('.tb-tab').forEach((btn) => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tb-tab').forEach((b) => b.classList.remove('active'));
        document.querySelectorAll('.tb-section').forEach((s) => s.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('tb-section-' + btn.dataset.section)?.classList.add('active');
    });
});

/* ════════════════════════════════════
   RANG VA QALAM
════════════════════════════════════ */
document.querySelectorAll('.color-dot').forEach((btn) => {
    btn.addEventListener('click', () => {
        if (panMode) togglePanMode(true);
        tool = 'pen';
        canvas.classList.remove('eraser-mode', 'shape-mode');
        document.getElementById('btn-eraser')?.classList.remove('active');
        document.querySelectorAll('.shape-btn').forEach((b) => b.classList.remove('active'));
        color = btn.dataset.color;
        document.querySelectorAll('.color-dot').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

document.getElementById('brush-size')?.addEventListener('input', (e) => {
    lineWidth = parseInt(e.target.value, 10);
    const label = document.getElementById('brush-size-label');
    if (label) label.textContent = lineWidth + 'px';
});

document.getElementById('btn-eraser')?.addEventListener('click', () => {
    const isActive = tool === 'eraser';
    tool = isActive ? 'pen' : 'eraser';
    canvas.classList.toggle('eraser-mode', tool === 'eraser');
    document.getElementById('btn-eraser').classList.toggle('active', tool === 'eraser');
});

/* ── SHAKLLAR ── */
document.querySelectorAll('.shape-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        const shape = btn.dataset.shape;
        if (tool === shape) {
            tool = 'pen';
            document.querySelectorAll('.shape-btn').forEach((b) => b.classList.remove('active'));
        } else {
            tool = shape;
            canvas.classList.remove('eraser-mode');
            document.getElementById('btn-eraser')?.classList.remove('active');
            document.querySelectorAll('.shape-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
        }
    });
});

document.getElementById('btn-undo')?.addEventListener('click', undo);

document.getElementById('btn-clear')?.addEventListener('click', () => {
    if (!confirm('Butun doskani tozalaysizmi?')) return;
    pushUndo();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

document.getElementById('btn-save')?.addEventListener('click', () => {
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const ex = exportCanvas.getContext('2d');
    const bg = pages[currentPage].bg;
    if (bg.type === 'color' || bg.type === 'gradient' || bg.type === 'pattern') {
        ex.fillStyle = bg.type === 'color' ? bg.value : '#0f172a';
        ex.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
    }
    ex.drawImage(canvas, 0, 0);
    const link = document.createElement('a');
    link.download = 'ZiyoDoska_' + Date.now() + '.png';
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
});

document.getElementById('btn-fullscreen')?.addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.();
    } else {
        document.exitFullscreen?.();
    }
});

/* ════════════════════════════════════
   TOOLBAR COLLAPSE
════════════════════════════════════ */
function setToolbarCollapsed(collapsed) {
    if (!toolbar || !tbBody) return;
    toolbar.classList.toggle('collapsed', collapsed);
    tbBody.classList.toggle('tb-hidden', collapsed);
    if (collapseBtn) collapseBtn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
    if (collapseIcon) {
        collapseIcon.className = collapsed ? 'fas fa-chevron-down' : 'fas fa-chevron-up';
    }
    try {
        localStorage.setItem('doska_toolbar_collapsed', collapsed ? '1' : '0');
    } catch { /* ignore */ }
}

function toggleToolbar() {
    setToolbarCollapsed(!toolbar.classList.contains('collapsed'));
}

window.DoskaUI = { toggleToolbar, setToolbarCollapsed };

if (collapseBtn) {
    setToolbarCollapsed(localStorage.getItem('doska_toolbar_collapsed') === '1');
    collapseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleToolbar();
    });
}

/* ════════════════════════════════════
   TOOLBAR DRAG (mavjud, saqlangan)
════════════════════════════════════ */
const dragHandle = toolbar?.querySelector('.tb-drag');
if (dragHandle && toolbar) {
    let drag = false;
    let sx = 0;
    let sy = 0;
    let sl = 0;
    let st = 0;

    function clamp(v, a, b) {
        return Math.min(Math.max(v, a), b);
    }

    function onDragStart(cx, cy) {
        drag = true;
        sx = cx;
        sy = cy;
        sl = toolbar.offsetLeft;
        st = toolbar.offsetTop;
    }

    function onDragMove(cx, cy) {
        if (!drag) return;
        const dx = cx - sx;
        const dy = cy - sy;
        const w = toolbar.offsetWidth;
        const h = toolbar.offsetHeight;
        toolbar.style.left = clamp(sl + dx, 4, window.innerWidth - w - 4) + 'px';
        toolbar.style.top = clamp(st + dy, 56, window.innerHeight - h - 4) + 'px';
    }

    function onDragEnd() {
        drag = false;
        try {
            localStorage.setItem('doska_toolbar_free_pos', JSON.stringify({
                left: toolbar.style.left,
                top: toolbar.style.top,
            }));
            localStorage.removeItem('doska_toolbar_pos');
        } catch { /* ignore */ }
    }

    dragHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toolbar.classList.remove('default-position');
        const r = toolbar.getBoundingClientRect();
        toolbar.style.left = r.left + 'px';
        toolbar.style.top = r.top + 'px';
        toolbar.style.right = 'auto';
        toolbar.style.bottom = 'auto';
        toolbar.style.transform = 'none';
        onDragStart(e.clientX, e.clientY);
        const mm = (ev) => onDragMove(ev.clientX, ev.clientY);
        const mu = () => {
            onDragEnd();
            document.removeEventListener('mousemove', mm);
            document.removeEventListener('mouseup', mu);
        };
        document.addEventListener('mousemove', mm);
        document.addEventListener('mouseup', mu);
    });

    dragHandle.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        toolbar.classList.remove('default-position');
        const r = toolbar.getBoundingClientRect();
        toolbar.style.left = r.left + 'px';
        toolbar.style.top = r.top + 'px';
        toolbar.style.right = 'auto';
        toolbar.style.bottom = 'auto';
        toolbar.style.transform = 'none';
        const t = e.touches[0];
        onDragStart(t.clientX, t.clientY);
    }, { passive: true });
    dragHandle.addEventListener('touchmove', (e) => {
        if (!drag) return;
        const t = e.touches[0];
        onDragMove(t.clientX, t.clientY);
        e.preventDefault();
    }, { passive: false });
    dragHandle.addEventListener('touchend', onDragEnd);
}

/* ════════════════════════════════════
   FON TANLASH MODALI
════════════════════════════════════ */
const COLOR_SWATCHES = [
    '#ffffff', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#fef3c7', '#fde68a', '#d9f99d', '#bbf7d0',
    '#a5f3fc', '#bfdbfe', '#ddd6fe', '#fbcfe8', '#0f172a', '#1e293b', '#111827', '#000000',
];
const GRADIENT_SWATCHES = [
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#ec4899,#f472b6)',
    'linear-gradient(135deg,#0ea5e9,#38bdf8)',
    'linear-gradient(135deg,#22c55e,#4ade80)',
    'linear-gradient(135deg,#f97316,#fb923c)',
    'linear-gradient(135deg,#a855f7,#d8b4fe)',
    'linear-gradient(135deg,#f43f5e,#fda4af)',
    'linear-gradient(135deg,#818cf8,#c4b5fd)',
];
const PATTERN_SWATCHES = [
    { name: 'Katakcha', css: 'repeating-linear-gradient(0deg,#1e293b,#1e293b 1px,#0f172a 1px,#0f172a 28px),repeating-linear-gradient(90deg,#1e293b,#1e293b 1px,#0f172a 1px,#0f172a 28px)' },
    { name: 'Chiziqli', css: 'repeating-linear-gradient(0deg,#1e293b,#1e293b 1px,#0f172a 1px,#0f172a 32px)' },
    { name: 'Nuqtalar', css: 'radial-gradient(circle,#334155 2px,#0f172a 2px)' },
];

function buildBgModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'bg-modal-overlay';
    overlay.innerHTML = `
        <div class="modal-box">
            <div class="modal-header">
                <h3>Fon tanlash</h3>
                <button class="modal-close" id="bg-modal-close" aria-label="Yopish"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-tabs">
                <button class="modal-tab active" data-bgtab="color">🎨 Ranglar</button>
                <button class="modal-tab" data-bgtab="image">🖼 Rasmlar</button>
                <button class="modal-tab" data-bgtab="pattern">▦ Patternlar</button>
            </div>
            <div class="modal-body">
                <div class="bg-tab-panel" data-bgpanel="color">
                    <div class="modal-section-label">Ranglar</div>
                    <div class="color-grid" id="bg-color-grid"></div>
                    <div class="hex-row">
                        <div class="hex-swatch-preview" id="hex-preview" style="background:#ffffff"></div>
                        <input type="text" class="hex-input" id="hex-input" placeholder="#ffffff" value="#ffffff">
                        <button class="hex-apply-btn" id="hex-apply">Qo'llash</button>
                    </div>
                    <button type="button" class="tb-btn full" id="bg-full-picker-btn" style="margin-bottom:16px">
                        <i class="fas fa-eye-dropper"></i> Boshqa rangni tanlash (to'liq palitra)
                    </button>
                    <div class="modal-section-label">Gradientlar</div>
                    <div class="gradient-grid" id="bg-gradient-grid"></div>
                </div>
                <div class="bg-tab-panel" data-bgpanel="image" style="display:none">
                    <div class="modal-section-label">Rasm yuklash</div>
                    <label class="image-upload-zone" for="bg-image-input">
                        <i class="fas fa-cloud-arrow-up"></i>
                        <p>Rasm tanlash uchun bosing</p>
                    </label>
                    <input type="file" id="bg-image-input" accept="image/*" hidden>
                </div>
                <div class="bg-tab-panel" data-bgpanel="pattern" style="display:none">
                    <div class="modal-section-label">Patternlar</div>
                    <div class="pattern-grid" id="bg-pattern-grid"></div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const colorGrid = overlay.querySelector('#bg-color-grid');
    COLOR_SWATCHES.forEach((c) => {
        const sw = document.createElement('button');
        sw.type = 'button';
        sw.className = 'color-swatch';
        sw.style.background = c;
        sw.addEventListener('click', () => {
            setPageBg({ type: 'color', value: c });
            overlay.querySelectorAll('.color-swatch').forEach((s) => s.classList.remove('active'));
            sw.classList.add('active');
        });
        colorGrid.appendChild(sw);
    });

    const gradGrid = overlay.querySelector('#bg-gradient-grid');
    GRADIENT_SWATCHES.forEach((g) => {
        const sw = document.createElement('button');
        sw.type = 'button';
        sw.className = 'gradient-swatch';
        sw.style.background = g;
        sw.addEventListener('click', () => {
            setPageBg({ type: 'gradient', value: g });
            overlay.querySelectorAll('.gradient-swatch').forEach((s) => s.classList.remove('active'));
            sw.classList.add('active');
        });
        gradGrid.appendChild(sw);
    });

    const patGrid = overlay.querySelector('#bg-pattern-grid');
    PATTERN_SWATCHES.forEach((p) => {
        const sw = document.createElement('button');
        sw.type = 'button';
        sw.className = 'pattern-swatch';
        sw.style.background = p.css;
        sw.style.backgroundSize = p.name === 'Nuqtalar' ? '14px 14px' : 'auto';
        sw.title = p.name;
        sw.addEventListener('click', () => {
            setPageBg({ type: 'pattern', value: p.css });
            overlay.querySelectorAll('.pattern-swatch').forEach((s) => s.classList.remove('active'));
            sw.classList.add('active');
        });
        patGrid.appendChild(sw);
    });

    const hexInput = overlay.querySelector('#hex-input');
    const hexPreview = overlay.querySelector('#hex-preview');
    hexInput.addEventListener('input', () => {
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hexInput.value)) {
            hexPreview.style.background = hexInput.value;
        }
    });
    overlay.querySelector('#hex-apply').addEventListener('click', () => {
        const v = hexInput.value.trim();
        if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) {
            setPageBg({ type: 'color', value: v });
        } else {
            showToast('Noto\'g\'ri hex format');
        }
    });

    overlay.querySelector('#bg-full-picker-btn').addEventListener('click', () => {
        openColorPicker(hexInput.value || '#ffffff', (hex) => {
            setPageBg({ type: 'color', value: hex });
            hexInput.value = hex;
            hexPreview.style.background = hex;
        });
    });

    overlay.querySelector('#bg-image-input').addEventListener('change', (e) => {
        const f = e.target.files[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            setPageBg({ type: 'image', value: ev.target.result });
            closeBgModal();
        };
        reader.readAsDataURL(f);
    });

    overlay.querySelectorAll('.modal-tab').forEach((tab) => {
        tab.addEventListener('click', () => {
            overlay.querySelectorAll('.modal-tab').forEach((t) => t.classList.remove('active'));
            tab.classList.add('active');
            overlay.querySelectorAll('.bg-tab-panel').forEach((p) => { p.style.display = 'none'; });
            overlay.querySelector(`[data-bgpanel="${tab.dataset.bgtab}"]`).style.display = 'block';
        });
    });

    overlay.querySelector('#bg-modal-close').addEventListener('click', closeBgModal);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeBgModal(); });

    return overlay;
}

let bgModalEl = null;
function openBgModal() {
    if (!bgModalEl) bgModalEl = buildBgModal();
    bgModalEl.classList.add('open');
}
function closeBgModal() {
    if (bgModalEl) bgModalEl.classList.remove('open');
}
function setPageBg(bg) {
    pages[currentPage].bg = bg;
    applyPageBg(bg);
    showToast('Fon o\'zgartirildi');
    if (typeof scheduleAutosave === 'function') scheduleAutosave();
}

document.getElementById('btn-open-bg-modal')?.addEventListener('click', openBgModal);

/* ════════════════════════════════════
   TO'LIQ RANG TANLAGICH (HSV picker)
   EduBaza uslubidagi spektr + slider + RGB
════════════════════════════════════ */
let colorPickerEl = null;
let colorPickerCallback = null;

function hexToRgb(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
    const num = parseInt(hex, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
}
function hsvToRgb(h, s, v) {
    h = h / 360; s = s / 100; v = v / 100;
    let r, g, b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    return { r: r * 255, g: g * 255, b: b * 255 };
}
function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
        if (max === r) h = ((g - b) / d) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
    const s = max === 0 ? 0 : d / max;
    return { h, s: s * 100, v: max * 100 };
}

function buildColorPicker() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'color-picker-overlay';
    overlay.innerHTML = `
        <div class="modal-box" style="width:300px">
            <div class="modal-header">
                <h3>Rang tanlash</h3>
                <button class="modal-close" id="cp-close" aria-label="Yopish"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="cp-sv-box" id="cp-sv-box">
                    <div class="cp-sv-cursor" id="cp-sv-cursor"></div>
                </div>
                <div class="cp-hue-row">
                    <div class="cp-preview" id="cp-preview"></div>
                    <div class="cp-hue-slider" id="cp-hue-slider">
                        <div class="cp-hue-cursor" id="cp-hue-cursor"></div>
                    </div>
                </div>
                <div class="cp-rgb-row">
                    <div class="cp-rgb-field"><input type="text" id="cp-r" value="255" maxlength="3"><label>R</label></div>
                    <div class="cp-rgb-field"><input type="text" id="cp-g" value="255" maxlength="3"><label>G</label></div>
                    <div class="cp-rgb-field"><input type="text" id="cp-b" value="255" maxlength="3"><label>B</label></div>
                </div>
                <div class="cp-hex-row">
                    <input type="text" id="cp-hex" value="#ffffff" placeholder="#rrggbb">
                    <button type="button" id="cp-apply" class="hex-apply-btn">Tanlash</button>
                </div>
                <div class="cp-swatch-grid" id="cp-swatch-grid"></div>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);

    const svBox = overlay.querySelector('#cp-sv-box');
    const svCursor = overlay.querySelector('#cp-sv-cursor');
    const hueSlider = overlay.querySelector('#cp-hue-slider');
    const hueCursor = overlay.querySelector('#cp-hue-cursor');
    const preview = overlay.querySelector('#cp-preview');
    const rIn = overlay.querySelector('#cp-r');
    const gIn = overlay.querySelector('#cp-g');
    const bIn = overlay.querySelector('#cp-b');
    const hexIn = overlay.querySelector('#cp-hex');

    let state = { h: 0, s: 0, v: 100 };

    function updateFromHSV() {
        const { h, s, v } = state;
        svBox.style.background = `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${h},100%,50%))`;
        hueSlider.style.background = 'linear-gradient(to right, red, yellow, lime, cyan, blue, magenta, red)';
        svCursor.style.left = s + '%';
        svCursor.style.top = (100 - v) + '%';
        hueCursor.style.left = (h / 360 * 100) + '%';

        const { r, g, b } = hsvToRgb(h, s, v);
        const hex = rgbToHex(r, g, b);
        preview.style.background = hex;
        rIn.value = Math.round(r);
        gIn.value = Math.round(g);
        bIn.value = Math.round(b);
        hexIn.value = hex;
    }

    function setFromRgb(r, g, b) {
        const hsv = rgbToHsv(r, g, b);
        state = hsv;
        updateFromHSV();
    }

    function pickFromSvBox(clientX, clientY) {
        const rect = svBox.getBoundingClientRect();
        let x = (clientX - rect.left) / rect.width;
        let y = (clientY - rect.top) / rect.height;
        x = Math.max(0, Math.min(1, x));
        y = Math.max(0, Math.min(1, y));
        state.s = x * 100;
        state.v = (1 - y) * 100;
        updateFromHSV();
    }
    function pickFromHue(clientX) {
        const rect = hueSlider.getBoundingClientRect();
        let x = (clientX - rect.left) / rect.width;
        x = Math.max(0, Math.min(1, x));
        state.h = x * 360;
        updateFromHSV();
    }

    let draggingSv = false, draggingHue = false;
    svBox.addEventListener('mousedown', (e) => { draggingSv = true; pickFromSvBox(e.clientX, e.clientY); });
    window.addEventListener('mousemove', (e) => { if (draggingSv) pickFromSvBox(e.clientX, e.clientY); if (draggingHue) pickFromHue(e.clientX); });
    window.addEventListener('mouseup', () => { draggingSv = false; draggingHue = false; });
    hueSlider.addEventListener('mousedown', (e) => { draggingHue = true; pickFromHue(e.clientX); });

    svBox.addEventListener('touchstart', (e) => { pickFromSvBox(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });
    svBox.addEventListener('touchmove', (e) => { pickFromSvBox(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); }, { passive: false });
    hueSlider.addEventListener('touchstart', (e) => { pickFromHue(e.touches[0].clientX); }, { passive: true });
    hueSlider.addEventListener('touchmove', (e) => { pickFromHue(e.touches[0].clientX); e.preventDefault(); }, { passive: false });

    [rIn, gIn, bIn].forEach((inp) => {
        inp.addEventListener('change', () => {
            setFromRgb(parseInt(rIn.value) || 0, parseInt(gIn.value) || 0, parseInt(bIn.value) || 0);
        });
    });
    hexIn.addEventListener('change', () => {
        const v = hexIn.value.trim();
        if (/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v)) {
            const { r, g, b } = hexToRgb(v.startsWith('#') ? v : '#' + v);
            setFromRgb(r, g, b);
        }
    });

    /* Tezkor tanlov ranglar qatori */
    const quickSwatches = ['#ffffff','#000000','#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#10b981','#14b8a6','#06b6d4','#0ea5e9','#3b82f6','#6366f1','#8b5cf6','#a855f7','#d946ef','#ec4899','#f43f5e','#78716c'];
    const swatchGrid = overlay.querySelector('#cp-swatch-grid');
    quickSwatches.forEach((c) => {
        const sw = document.createElement('button');
        sw.type = 'button';
        sw.className = 'cp-quick-swatch';
        sw.style.background = c;
        sw.addEventListener('click', () => { const { r, g, b } = hexToRgb(c); setFromRgb(r, g, b); });
        swatchGrid.appendChild(sw);
    });

    overlay.querySelector('#cp-apply').addEventListener('click', () => {
        if (colorPickerCallback) colorPickerCallback(hexIn.value);
        closeColorPicker();
    });
    overlay.querySelector('#cp-close').addEventListener('click', closeColorPicker);
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeColorPicker(); });

    overlay._setFromRgb = setFromRgb;
    updateFromHSV();
    return overlay;
}

function openColorPicker(initialHex, callback) {
    colorPickerCallback = callback;
    if (!colorPickerEl) colorPickerEl = buildColorPicker();
    try {
        const { r, g, b } = hexToRgb(initialHex || '#ffffff');
        colorPickerEl._setFromRgb(r, g, b);
    } catch { /* ignore */ }
    colorPickerEl.classList.add('open');
}
function closeColorPicker() {
    if (colorPickerEl) colorPickerEl.classList.remove('open');
}

/* Qalam uchun maxsus rang tugmasi */
document.getElementById('pen-custom-color-btn')?.addEventListener('click', () => {
    openColorPicker(color, (hex) => {
        if (panMode) togglePanMode(true);
        color = hex;
        tool = 'pen';
        canvas.classList.remove('eraser-mode');
        document.getElementById('btn-eraser')?.classList.remove('active');
        document.querySelectorAll('.shape-btn').forEach((b) => b.classList.remove('active'));
        document.querySelectorAll('.color-dot').forEach((b) => b.classList.remove('active'));
        const trigger = document.getElementById('pen-custom-color-btn');
        if (trigger) { trigger.style.background = hex; trigger.classList.add('active'); }
    });
});

/* ════════════════════════════════════
   YOPISHQOQ ESLATMA (Sticky Note)
════════════════════════════════════ */
const STICKY_COLORS = ['#fde047', '#fda4af', '#a7f3d0', '#bfdbfe', '#ddd6fe'];
let stickyColorIndex = 0;

function addStickyWidget() {
    const stickyColor = STICKY_COLORS[stickyColorIndex % STICKY_COLORS.length];
    stickyColorIndex++;
    const el = createWidgetShell('📝 Eslatma', null);
    el.classList.add('sticky-widget');
    el.style.background = stickyColor;
    el.style.borderColor = stickyColor;

    const ta = document.createElement('textarea');
    ta.className = 'sticky-widget-text';
    ta.placeholder = 'Tez eslatma...';
    el.appendChild(ta);

    ta.addEventListener('mousedown', (e) => e.stopPropagation());
    ta.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });

    setTimeout(() => ta.focus(), 50);
}
document.getElementById('widget-sticky')?.addEventListener('click', addStickyWidget);

/* ════════════════════════════════════
   LAZER KO'RSATKICH — vaqtinchalik chiziq
   (taqdimot uchun, o'zi avtomatik o'chadi)
════════════════════════════════════ */
function toggleLaserMode() {
    laserMode = !laserMode;
    const btn = document.getElementById('widget-laser');
    if (btn) btn.classList.toggle('active', laserMode);
    canvas.classList.toggle('laser-mode', laserMode);
    if (laserMode) showToast('🔴 Lazer rejimi yoqildi — chizilgan chiziqlar avtomatik o\'chadi');
}
document.getElementById('widget-laser')?.addEventListener('click', toggleLaserMode);

function laserLoop() {
    if (!laserPoints.length) return;
    ctx.save();
    const now = Date.now();
    laserPoints = laserPoints.filter((p) => now - p.t < 900);
    redrawWithoutLaser();
    laserPoints.forEach((p, i) => {
        if (i === 0) return;
        const prev = laserPoints[i - 1];
        const age = (now - p.t) / 900;
        ctx.globalAlpha = Math.max(0, 1 - age);
        ctx.strokeStyle = '#ff3b3b';
        ctx.lineWidth = 4 * RENDER_SCALE;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
    });
    ctx.restore();
    if (laserPoints.length) requestAnimationFrame(laserLoop);
}

function redrawWithoutLaser() {
    if (!lastCleanSnapshot) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(lastCleanSnapshot, 0, 0);
}

/* ════════════════════════════════════
   YORDAM MODALI (klaviatura yorliqlari)
════════════════════════════════════ */
function buildHelpModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'help-modal-overlay';
    overlay.innerHTML = `
        <div class="modal-box" style="width:340px">
            <div class="modal-header">
                <h3><i class="fas fa-keyboard"></i> Tezkor yo'llar</h3>
                <button class="modal-close" id="help-modal-close" aria-label="Yopish"><i class="fas fa-times"></i></button>
            </div>
            <div class="modal-body">
                <div class="help-row"><kbd>Ctrl</kbd> + <kbd>Z</kbd><span>Orqaga qaytarish</span></div>
                <div class="help-row"><kbd>E</kbd><span>O'chirgich</span></div>
                <div class="help-row"><kbd>P</kbd><span>Qalam</span></div>
                <div class="help-row"><kbd>F</kbd><span>To'liq ekran</span></div>
                <div class="help-row"><kbd>←</kbd> <kbd>→</kbd><span>Sahifa almashtirish</span></div>
                <div class="modal-section-label" style="margin-top:14px">Maslahatlar</div>
                <p style="font-size:0.8rem;color:#94a3b8;line-height:1.6;margin:0">
                    Matn yoki Eslatma widgetini ⋯ tutqichdan sudrab joylashtiring.
                    Matnni "Doskaga chiqarish" tugmasi bilan doimiy chizmaga aylantirishingiz mumkin.
                    Lazer rejimi taqdimotlar uchun — chizgan chiziqlaringiz o'zi yo'qoladi.
                </p>
            </div>
        </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('#help-modal-close').addEventListener('click', () => overlay.classList.remove('open'));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.classList.remove('open'); });
    return overlay;
}
let helpModalEl = null;
document.getElementById('btn-help')?.addEventListener('click', () => {
    if (!helpModalEl) helpModalEl = buildHelpModal();
    helpModalEl.classList.add('open');
});

/* ════════════════════════════════════
   QO'SHIMCHA KLAVIATURA YORLIQLARI
════════════════════════════════════ */
document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
    if (e.key === 'e' || e.key === 'E') document.getElementById('btn-eraser')?.click();
    if (e.key === 'p' || e.key === 'P') {
        tool = 'pen';
        canvas.classList.remove('eraser-mode');
        document.getElementById('btn-eraser')?.classList.remove('active');
    }
    if (e.key === 'f' || e.key === 'F') document.getElementById('btn-fullscreen')?.click();
    if (e.key === 'ArrowLeft') goToPage(currentPage - 1);
    if (e.key === 'ArrowRight') goToPage(currentPage + 1);
});

/* ════════════════════════════════════
   WIDGETLAR — Taymer / Sekundomer / Soat / Matn
════════════════════════════════════ */
let widgetIdCounter = 0;

function makeWidgetDraggable(el) {
    let dx = 0, dy = 0, startX = 0, startY = 0, dragging = false;

    function onStart(cx, cy) {
        dragging = true;
        el.classList.add('dragging');
        const rect = el.getBoundingClientRect();
        const parentRect = el.parentElement.getBoundingClientRect();
        startX = cx;
        startY = cy;
        dx = rect.left - parentRect.left;
        dy = rect.top - parentRect.top;
    }
    function onMove(cx, cy) {
        if (!dragging) return;
        const ndx = dx + (cx - startX);
        const ndy = dy + (cy - startY);
        el.style.left = ndx + 'px';
        el.style.top = ndy + 'px';
    }
    function onEnd() {
        dragging = false;
        el.classList.remove('dragging');
    }

    const head = el.querySelector('.board-widget-head');
    if (!head) return;
    head.addEventListener('mousedown', (e) => {
        if (e.target.closest('.board-widget-close')) return;
        e.preventDefault();
        onStart(e.clientX, e.clientY);
        const mm = (ev) => onMove(ev.clientX, ev.clientY);
        const mu = () => {
            onEnd();
            document.removeEventListener('mousemove', mm);
            document.removeEventListener('mouseup', mu);
        };
        document.addEventListener('mousemove', mm);
        document.addEventListener('mouseup', mu);
    });
    head.addEventListener('touchstart', (e) => {
        if (e.target.closest('.board-widget-close')) return;
        const t = e.touches[0];
        onStart(t.clientX, t.clientY);
    }, { passive: true });
    head.addEventListener('touchmove', (e) => {
        if (!dragging) return;
        const t = e.touches[0];
        onMove(t.clientX, t.clientY);
        e.preventDefault();
    }, { passive: false });
    head.addEventListener('touchend', onEnd);
}

let widgetSpawnIndex = 0;
function createWidgetShell(title, closeCb) {
    const id = 'bw_' + (widgetIdCounter++);
    const el = document.createElement('div');
    el.className = 'board-widget';
    el.id = id;
    const cascadeStep = 36;
    const baseLeft = 40 + (widgetSpawnIndex % 6) * cascadeStep;
    const baseTop = 40 + (widgetSpawnIndex % 6) * cascadeStep;
    widgetSpawnIndex++;
    el.style.left = baseLeft + 'px';
    el.style.top = baseTop + 'px';
    el.innerHTML = `
        <div class="board-widget-head">
            <span class="board-widget-title">${title}</span>
            <button type="button" class="board-widget-close" aria-label="Yopish"><i class="fas fa-times"></i></button>
        </div>
    `;
    el.querySelector('.board-widget-close').addEventListener('click', (e) => {
        e.stopPropagation();
        if (closeCb) closeCb();
        el.remove();
    });
    widgetLayer.appendChild(el);
    makeWidgetDraggable(el);
    return el;
}

function addTimerWidget() {
    let timerHandle = null;
    const el = createWidgetShell('⏱ Taymer', () => clearInterval(timerHandle));
    const body = document.createElement('div');
    body.innerHTML = `
        <div class="board-widget-display" id="${el.id}-display">05:00</div>
        <div class="board-widget-controls">
            <button class="bw-btn" data-act="dec"><i class="fas fa-minus"></i></button>
            <button class="bw-btn" data-act="play"><i class="fas fa-play"></i></button>
            <button class="bw-btn" data-act="reset"><i class="fas fa-rotate-left"></i></button>
            <button class="bw-btn" data-act="inc"><i class="fas fa-plus"></i></button>
        </div>
    `;
    el.appendChild(body);
    let total = 300, remaining = 300, running = false;
    const display = body.querySelector(`#${el.id}-display`);
    const playBtn = body.querySelector('[data-act="play"]');

    function render() {
        const m = Math.floor(Math.max(0, remaining) / 60).toString().padStart(2, '0');
        const s = Math.max(0, remaining % 60).toString().padStart(2, '0');
        display.textContent = `${m}:${s}`;
        display.style.color = remaining <= 10 && remaining > 0 ? '#fca5a5' : '#fff';
    }
    body.querySelector('[data-act="inc"]').addEventListener('click', () => { total += 60; remaining += 60; render(); });
    body.querySelector('[data-act="dec"]').addEventListener('click', () => { total = Math.max(0, total - 60); remaining = Math.max(0, remaining - 60); render(); });
    body.querySelector('[data-act="reset"]').addEventListener('click', () => { remaining = total; render(); });
    playBtn.addEventListener('click', () => {
        running = !running;
        playBtn.innerHTML = running ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        if (running) {
            timerHandle = setInterval(() => {
                remaining--;
                render();
                if (remaining <= 0) {
                    clearInterval(timerHandle);
                    running = false;
                    playBtn.innerHTML = '<i class="fas fa-play"></i>';
                    showToast('⏱ Taymer tugadi!');
                }
            }, 1000);
        } else {
            clearInterval(timerHandle);
        }
    });
    render();
}

function addStopwatchWidget() {
    let swHandle = null;
    const el = createWidgetShell('⏲ Sekundomer', () => clearInterval(swHandle));
    const body = document.createElement('div');
    body.innerHTML = `
        <div class="board-widget-display" id="${el.id}-display">00:00.0</div>
        <div class="board-widget-controls">
            <button class="bw-btn" data-act="play"><i class="fas fa-play"></i></button>
            <button class="bw-btn" data-act="reset"><i class="fas fa-rotate-left"></i></button>
        </div>
    `;
    el.appendChild(body);
    let elapsedMs = 0, running = false, lastTick = 0;
    const display = body.querySelector(`#${el.id}-display`);
    const playBtn = body.querySelector('[data-act="play"]');

    function render() {
        const totalSec = elapsedMs / 1000;
        const m = Math.floor(totalSec / 60).toString().padStart(2, '0');
        const s = Math.floor(totalSec % 60).toString().padStart(2, '0');
        const ds = Math.floor((totalSec % 1) * 10);
        display.textContent = `${m}:${s}.${ds}`;
    }
    playBtn.addEventListener('click', () => {
        running = !running;
        playBtn.innerHTML = running ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
        if (running) {
            lastTick = Date.now();
            swHandle = setInterval(() => {
                const now = Date.now();
                elapsedMs += now - lastTick;
                lastTick = now;
                render();
            }, 100);
        } else {
            clearInterval(swHandle);
        }
    });
    body.querySelector('[data-act="reset"]').addEventListener('click', () => {
        clearInterval(swHandle);
        running = false;
        elapsedMs = 0;
        playBtn.innerHTML = '<i class="fas fa-play"></i>';
        render();
    });
    render();
}

function addClockWidget() {
    let clockHandle = null;
    const el = createWidgetShell('🕐 Soat', () => clearInterval(clockHandle));
    const body = document.createElement('div');
    body.innerHTML = `<div class="board-widget-display" id="${el.id}-display" style="font-size:1.4rem">00:00:00</div>`;
    el.appendChild(body);
    const display = body.querySelector(`#${el.id}-display`);
    function render() {
        const now = new Date();
        display.textContent = now.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    render();
    clockHandle = setInterval(render, 1000);
}

/* ════════════════════════════════════════════════════════════
   PINNED TEXT — doimiy, ko'chiriladigan, resize qilinadigan
   matn elementlari. Har bir sahifa o'z pinned matnlarini saqlaydi.
════════════════════════════════════════════════════════════ */
let pinnedIdCounter = 0;

const PT_COLORS = ['#ffffff', '#ff8a3d', '#2dd4bf', '#fde047', '#f87171', '#a78bfa'];

function createPinnedText(data) {
    const id = 'pt_' + (pinnedIdCounter++);
    const el = document.createElement('div');
    el.className = 'pinned-text';
    el.id = id;
    el.style.left = (data.x || 40) + 'px';
    el.style.top = (data.y || 40) + 'px';
    el.style.fontSize = (data.fontSize || 16) + 'px';
    el.style.color = data.color || '#ffffff';
    el.style.fontFamily = data.fontFamily || "'Inter', sans-serif";
    if (data.width) el.style.width = data.width + 'px';

    const PT_FONTS = [
        { value: "'Inter', sans-serif", label: 'Inter' },
        { value: "'Space Grotesk', sans-serif", label: 'Space Grotesk' },
        { value: "'JetBrains Mono', monospace", label: 'Mono' },
        { value: "Georgia, serif", label: 'Georgia' },
        { value: "'Comic Sans MS', cursive", label: 'Qo\u02bclyozma' },
        { value: "Impact, sans-serif", label: 'Impact' },
    ];

    const toolbar = document.createElement('div');
    toolbar.className = 'pinned-text-toolbar';
    toolbar.innerHTML = `
        <select class="pt-tb-font" data-act="font" title="Shrift">
            ${PT_FONTS.map((f) => `<option value="${f.value}">${f.label}</option>`).join('')}
        </select>
        <button type="button" class="pt-tb-btn" data-act="edit" title="Tahrirlash"><i class="fas fa-pen"></i></button>
        <button type="button" class="pt-tb-btn" data-act="size-dec" title="Kichraytirish"><i class="fas fa-minus"></i></button>
        <button type="button" class="pt-tb-btn" data-act="size-inc" title="Kattalashtirish"><i class="fas fa-plus"></i></button>
        <span class="pt-tb-sep"></span>
        ${PT_COLORS.map((c) => `<button type="button" class="pt-tb-color" data-color="${c}" style="background:${c}"></button>`).join('')}
        <span class="pt-tb-sep"></span>
        <button type="button" class="pt-tb-btn pt-delete" data-act="delete" title="O'chirish"><i class="fas fa-trash"></i></button>
    `;
    el.appendChild(toolbar);
    const fontSelectEl = toolbar.querySelector('.pt-tb-font');
    if (fontSelectEl) fontSelectEl.value = el.style.fontFamily || PT_FONTS[0].value;

    const textSpan = document.createElement('span');
    textSpan.className = 'pinned-text-content';
    textSpan.textContent = data.text || '';
    el.appendChild(textSpan);

    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'pinned-text-resize';
    el.appendChild(resizeHandle);

    pinnedLayer.appendChild(el);
    bindPinnedTextEvents(el, textSpan, toolbar, resizeHandle);
    return el;
}

function bindPinnedTextEvents(el, textSpan, toolbar, resizeHandle) {
    let fontSize = parseFloat(el.style.fontSize) || 16;

    function selectThis() {
        document.querySelectorAll('.pinned-text.selected').forEach((o) => { if (o !== el) o.classList.remove('selected'); });
        el.classList.add('selected');
    }

    /* Tanlash uchun bosish */
    el.addEventListener('click', (e) => {
        if (e.target.closest('.pinned-text-toolbar') || e.target.closest('.pinned-text-resize')) return;
        selectThis();
    });

    /* Tashqariga bosilganda bekor qilish */
    document.addEventListener('mousedown', (e) => {
        if (!el.contains(e.target)) el.classList.remove('selected');
    });

    /* ── SUDRAB KO'CHIRISH ── */
    let dragging = false, startX = 0, startY = 0, origLeft = 0, origTop = 0;
    function onDragStart(cx, cy) {
        selectThis();
        dragging = true;
        el.classList.add('dragging');
        startX = cx; startY = cy;
        origLeft = parseFloat(el.style.left) || 0;
        origTop = parseFloat(el.style.top) || 0;
    }
    function onDragMove(cx, cy) {
        if (!dragging) return;
        const z = currentZoom || 1;
        el.style.left = (origLeft + (cx - startX) / z) + 'px';
        el.style.top = (origTop + (cy - startY) / z) + 'px';
    }
    function onDragEnd() {
        if (dragging) { dragging = false; el.classList.remove('dragging'); scheduleAutosave(); }
    }
    el.addEventListener('mousedown', (e) => {
        if (e.target.closest('.pinned-text-toolbar') || e.target.closest('.pinned-text-resize')) return;
        e.preventDefault();
        onDragStart(e.clientX, e.clientY);
        const mm = (ev) => onDragMove(ev.clientX, ev.clientY);
        const mu = () => { onDragEnd(); document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
        document.addEventListener('mousemove', mm);
        document.addEventListener('mouseup', mu);
    });
    el.addEventListener('touchstart', (e) => {
        if (e.target.closest('.pinned-text-toolbar') || e.target.closest('.pinned-text-resize')) return;
        const t = e.touches[0];
        onDragStart(t.clientX, t.clientY);
    }, { passive: true });
    el.addEventListener('touchmove', (e) => {
        if (!dragging) return;
        const t = e.touches[0];
        onDragMove(t.clientX, t.clientY);
        e.preventDefault();
    }, { passive: false });
    el.addEventListener('touchend', onDragEnd);

    /* ── O'LCHAMINI O'ZGARTIRISH (resize handle) ── */
    let resizing = false, rStartX = 0, rStartFont = 16, rStartWidth = 0;
    function onResizeStart(cx) {
        resizing = true;
        rStartX = cx;
        rStartFont = fontSize;
        rStartWidth = el.offsetWidth;
    }
    function onResizeMove(cx) {
        if (!resizing) return;
        const z = currentZoom || 1;
        const delta = (cx - rStartX) / z;
        fontSize = Math.max(8, Math.min(96, rStartFont + delta * 0.18));
        el.style.fontSize = fontSize + 'px';
        el.style.width = Math.max(60, rStartWidth + delta) + 'px';
    }
    function onResizeEnd() { if (resizing) { resizing = false; scheduleAutosave(); } }
    resizeHandle.addEventListener('mousedown', (e) => {
        e.preventDefault(); e.stopPropagation();
        onResizeStart(e.clientX);
        const mm = (ev) => onResizeMove(ev.clientX);
        const mu = () => { onResizeEnd(); document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
        document.addEventListener('mousemove', mm);
        document.addEventListener('mouseup', mu);
    });
    resizeHandle.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        onResizeStart(e.touches[0].clientX);
    }, { passive: true });
    resizeHandle.addEventListener('touchmove', (e) => {
        onResizeMove(e.touches[0].clientX);
        e.preventDefault();
    }, { passive: false });
    resizeHandle.addEventListener('touchend', onResizeEnd);

    /* ── TOOLBAR HARAKATLARI ── */
    toolbar.addEventListener('mousedown', (e) => e.stopPropagation());
    toolbar.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });

    toolbar.querySelector('[data-act="size-inc"]').addEventListener('click', () => {
        fontSize = Math.min(96, fontSize + 2);
        el.style.fontSize = fontSize + 'px';
        scheduleAutosave();
    });
    toolbar.querySelector('[data-act="size-dec"]').addEventListener('click', () => {
        fontSize = Math.max(8, fontSize - 2);
        el.style.fontSize = fontSize + 'px';
        scheduleAutosave();
    });
    toolbar.querySelector('[data-act="delete"]').addEventListener('click', () => {
        el.remove();
        scheduleAutosave();
    });
    toolbar.querySelector('[data-act="edit"]').addEventListener('click', () => {
        const newText = prompt('Matnni tahrirlash:', textSpan.textContent);
        if (newText !== null) {
            textSpan.textContent = newText;
            scheduleAutosave();
        }
    });
    toolbar.querySelectorAll('.pt-tb-color').forEach((dot) => {
        dot.addEventListener('click', () => {
            el.style.color = dot.dataset.color;
            scheduleAutosave();
        });
    });
    toolbar.querySelector('.pt-tb-font')?.addEventListener('change', (e) => {
        el.style.fontFamily = e.target.value;
        scheduleAutosave();
    });
    toolbar.querySelector('.pt-tb-font')?.addEventListener('mousedown', (e) => e.stopPropagation());
}

function addTextWidget() {
    const el = createWidgetShell('✏️ Matn', null);
    el.classList.add('text-widget');

    const FONT_OPTIONS = [
        { value: "'Inter', sans-serif", label: 'Inter' },
        { value: "'Space Grotesk', sans-serif", label: 'Space Grotesk' },
        { value: "'JetBrains Mono', monospace", label: 'Mono' },
        { value: "Georgia, serif", label: 'Georgia' },
        { value: "'Comic Sans MS', cursive", label: 'Qo\u02bclyozma' },
        { value: "Impact, sans-serif", label: 'Impact' },
    ];

    const controls = document.createElement('div');
    controls.className = 'text-widget-controls';
    controls.innerHTML = `
        <select class="tw-font-select" id="tw-font-select" title="Shrift tanlash">
            ${FONT_OPTIONS.map((f) => `<option value="${f.value}">${f.label}</option>`).join('')}
        </select>
        <button type="button" class="tw-ctrl-btn" data-act="size-dec" title="Kichraytirish"><i class="fas fa-minus"></i></button>
        <button type="button" class="tw-ctrl-btn" data-act="size-inc" title="Kattalashtirish"><i class="fas fa-plus"></i></button>
        <button type="button" class="tw-color-dot" data-color="#ffffff" style="background:#fff" title="Oq"></button>
        <button type="button" class="tw-color-dot" data-color="#ff8a3d" style="background:#ff8a3d" title="Apelsin"></button>
        <button type="button" class="tw-color-dot" data-color="#2dd4bf" style="background:#2dd4bf" title="Firuza"></button>
        <button type="button" class="tw-color-dot" data-color="#fde047" style="background:#fde047" title="Sariq"></button>
        <button type="button" class="tw-color-dot custom-color-trigger" id="tw-custom-color" title="Boshqa rang" style="background:conic-gradient(from 180deg,red,yellow,lime,cyan,blue,magenta,red);display:flex;align-items:center;justify-content:center">
            <i class="fas fa-eye-dropper" style="font-size:8px;color:#fff;text-shadow:0 0 2px #000"></i>
        </button>
    `;
    el.appendChild(controls);

    const ta = document.createElement('textarea');
    ta.className = 'board-widget-text';
    ta.placeholder = 'Matn yozing...';
    ta.style.fontSize = '16px';
    ta.style.color = '#ffffff';
    ta.style.fontFamily = FONT_OPTIONS[0].value;
    el.appendChild(ta);

    const stampBtn = document.createElement('button');
    stampBtn.type = 'button';
    stampBtn.className = 'tw-stamp-btn';
    stampBtn.innerHTML = '<i class="fas fa-check"></i> Doskaga chiqarish';
    stampBtn.title = 'Matnni doskaga doimiy chizib, widgetni yopadi';
    el.appendChild(stampBtn);

    /* Boshqaruv tugmalari klik bo'lganda widget surilmasligi uchun */
    controls.addEventListener('mousedown', (e) => e.stopPropagation());
    controls.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
    ta.addEventListener('mousedown', (e) => e.stopPropagation());
    ta.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
    stampBtn.addEventListener('mousedown', (e) => e.stopPropagation());

    let fontSize = 16;
    controls.querySelector('[data-act="size-inc"]').addEventListener('click', () => {
        fontSize = Math.min(48, fontSize + 2);
        ta.style.fontSize = fontSize + 'px';
    });
    controls.querySelector('[data-act="size-dec"]').addEventListener('click', () => {
        fontSize = Math.max(10, fontSize - 2);
        ta.style.fontSize = fontSize + 'px';
    });
    controls.querySelectorAll('.tw-color-dot:not(.custom-color-trigger)').forEach((dot) => {
        dot.addEventListener('click', () => { ta.style.color = dot.dataset.color; });
    });
    controls.querySelector('#tw-custom-color').addEventListener('click', () => {
        openColorPicker(ta.style.color || '#ffffff', (hex) => { ta.style.color = hex; });
    });
    controls.querySelector('#tw-font-select').addEventListener('change', (e) => {
        ta.style.fontFamily = e.target.value;
    });
    controls.querySelector('#tw-font-select').addEventListener('mousedown', (e) => e.stopPropagation());

    /* ── DOSKAGA CHIQARISH — endi doimiy, ko'chiriladigan/resize qilinadigan element yaratadi ── */
    stampBtn.addEventListener('click', () => {
        const text = ta.value.trim();
        if (!text) { showToast('Avval matn yozing'); return; }
        const wrapRect = canvas.parentElement.getBoundingClientRect();
        const widgetRect = el.getBoundingClientRect();
        const zoomVal = currentZoom || 1;
        const x = (widgetRect.left - wrapRect.left) / zoomVal;
        const y = (widgetRect.top - wrapRect.top) / zoomVal;

        createPinnedText({
            text,
            x,
            y,
            fontSize,
            color: ta.style.color || '#ffffff',
            fontFamily: ta.style.fontFamily || FONT_OPTIONS[0].value,
        });

        el.remove();
        showToast('✅ Matn doskaga chiqarildi — endi sudrab ko\'chiring yoki kattalashtiring');
        scheduleAutosave();
    });

    setTimeout(() => ta.focus(), 50);
}

document.getElementById('widget-timer')?.addEventListener('click', addTimerWidget);
document.getElementById('widget-stopwatch')?.addEventListener('click', addStopwatchWidget);
document.getElementById('widget-clock')?.addEventListener('click', addClockWidget);
document.getElementById('widget-text')?.addEventListener('click', addTextWidget);

/* ════════════════════════════════════
   KEYBOARD SHORTCUTS
════════════════════════════════════ */
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); }
});

/* ════════════════════════════════════
   TUN / KUN REJIMI
════════════════════════════════════ */
function applyDoskaTheme(mode) {
    document.documentElement.setAttribute('data-doska-theme', mode);
    try { localStorage.setItem('doska_theme', mode); } catch { /* ignore */ }
}
function initDoskaTheme() {
    let saved = null;
    try { saved = localStorage.getItem('doska_theme'); } catch { /* ignore */ }
    applyDoskaTheme(saved === 'light' ? 'light' : 'dark');
}
document.getElementById('btn-theme-toggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-doska-theme');
    applyDoskaTheme(current === 'light' ? 'dark' : 'light');
});
initDoskaTheme();

/* ════════════════════════════════════════════════════════════
   ZOOM IN / ZOOM OUT
   Butun ish hududini (canvas + widget + pinned text) kattalashtiradi
════════════════════════════════════════════════════════════ */
const zoomLayer = document.getElementById('doska-zoom-layer');
const zoomLabel = document.getElementById('zoom-label');
const zoomLabelMobile = document.getElementById('zoom-label-m');

function applyZoom() {
    if (zoomLayer) zoomLayer.style.transform = `scale(${currentZoom})`;
    const pct = Math.round(currentZoom * 100) + '%';
    if (zoomLabel) zoomLabel.textContent = pct;
    if (zoomLabelMobile) zoomLabelMobile.textContent = pct;
}
function zoomIn() {
    currentZoom = Math.min(ZOOM_MAX, +(currentZoom + ZOOM_STEP).toFixed(2));
    applyZoom();
}
function zoomOut() {
    currentZoom = Math.max(ZOOM_MIN, +(currentZoom - ZOOM_STEP).toFixed(2));
    applyZoom();
}
function zoomReset() {
    currentZoom = 1;
    applyZoom();
}
document.getElementById('zoom-in')?.addEventListener('click', zoomIn);
document.getElementById('zoom-out')?.addEventListener('click', zoomOut);
document.getElementById('zoom-reset')?.addEventListener('click', zoomReset);
document.getElementById('zoom-in-m')?.addEventListener('click', zoomIn);
document.getElementById('zoom-out-m')?.addEventListener('click', zoomOut);

/* Ctrl + scroll orqali ham zoom qilish imkoni */
document.querySelector('.doska-canvas-wrap')?.addEventListener('wheel', (e) => {
    if (!e.ctrlKey) return;
    e.preventDefault();
    if (e.deltaY < 0) zoomIn(); else zoomOut();
}, { passive: false });

/* Klaviatura: Ctrl + / Ctrl - / Ctrl 0 */
document.addEventListener('keydown', (e) => {
    if (!e.ctrlKey) return;
    if (e.key === '=' || e.key === '+') { e.preventDefault(); zoomIn(); }
    if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomOut(); }
    if (e.key === '0') { e.preventDefault(); zoomReset(); }
});

applyZoom();

/* ════════════════════════════════════════════════════════════
   QO'L (PAN) REJIMI
   Yoqilganda chizish to'xtaydi — sichqoncha/barmoq bilan
   zoom qilingan doskani istalgan tomonga suriб ko'rish mumkin
════════════════════════════════════════════════════════════ */
const canvasWrap = document.querySelector('.doska-canvas-wrap');

function togglePanMode(forceOff) {
    panMode = forceOff === true ? false : !panMode;
    const btn = document.getElementById('tb-pan-btn');
    if (btn) btn.classList.toggle('active', panMode);
    canvas.classList.toggle('pan-mode', panMode);
    if (canvasWrap) canvasWrap.classList.toggle('pan-active', panMode);
    if (panMode) {
        /* Pan rejimida boshqa chizish rejimlari vizual jihatdan o'chiriladi */
        showToast('✋ Qo\'l rejimi: doskani sudrab ko\'ring');
    }
}

document.getElementById('tb-pan-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    togglePanMode();
});

/* Sudrab surish (pan) mantig'i — sichqoncha */
let panDragging = false, panStartX = 0, panStartY = 0, panScrollLeft = 0, panScrollTop = 0;

function panStart(cx, cy) {
    if (!panMode || !canvasWrap) return;
    panDragging = true;
    canvas.classList.add('panning');
    canvasWrap.classList.add('panning');
    panStartX = cx;
    panStartY = cy;
    panScrollLeft = canvasWrap.scrollLeft;
    panScrollTop = canvasWrap.scrollTop;
}
function panMove(cx, cy) {
    if (!panDragging || !canvasWrap) return;
    canvasWrap.scrollLeft = panScrollLeft - (cx - panStartX);
    canvasWrap.scrollTop = panScrollTop - (cy - panStartY);
}
function panEnd() {
    panDragging = false;
    canvas.classList.remove('panning');
    if (canvasWrap) canvasWrap.classList.remove('panning');
}

canvas.addEventListener('mousedown', (e) => {
    if (!panMode) return;
    e.preventDefault();
    panStart(e.clientX, e.clientY);
});
window.addEventListener('mousemove', (e) => { if (panMode) panMove(e.clientX, e.clientY); });
window.addEventListener('mouseup', () => { if (panMode) panEnd(); });

canvas.addEventListener('touchstart', (e) => {
    if (!panMode) return;
    const t = e.touches[0];
    panStart(t.clientX, t.clientY);
}, { passive: true });
canvas.addEventListener('touchmove', (e) => {
    if (!panMode || !panDragging) return;
    const t = e.touches[0];
    panMove(t.clientX, t.clientY);
    e.preventDefault();
}, { passive: false });
canvas.addEventListener('touchend', () => { if (panMode) panEnd(); });

/* Sahifa ochilganda, foydalanuvchi avval drag qilib qo'ygan asboblar paneli
   pozitsiyasini tiklash */
(function restoreToolbarFreePosition() {
    let freePos = null;
    try { freePos = JSON.parse(localStorage.getItem('doska_toolbar_free_pos') || 'null'); } catch { /* ignore */ }
    if (freePos && freePos.left && freePos.top && toolbar) {
        toolbar.classList.remove('default-position');
        toolbar.style.left = freePos.left;
        toolbar.style.top = freePos.top;
        toolbar.style.right = 'auto';
        toolbar.style.bottom = 'auto';
        toolbar.style.transform = 'none';
    }
})();



/* ════════════════════════════════════
   AUTH + USAGE LOG
════════════════════════════════════ */
if (window.ZiyomapUsage?.getUser()) {
    ZiyomapUsage.logUsage('doska', 'Onlayn doska');
}

updatePageNav();

/* ════════════════════════════════════
   AVTOMATIK SAQLASH (ehtiyotkorlik bilan)
   Faqat joriy sahifa rasmi + barcha fon sozlamalari saqlanadi.
   localStorage hajmi cheklangani uchun xato chiqsa jim o'tkaziladi.
════════════════════════════════════ */
const AUTOSAVE_KEY = 'ziyodoska_autosave_v1';
let autosaveHandle = null;

function autosaveNow() {
    try {
        savePageSnapshot();
        const payload = {
            pages: pages.map((p) => ({ dataUrl: p.dataUrl, bg: p.bg, pinned: p.pinned || [] })),
            currentPage,
            theme: document.documentElement.getAttribute('data-doska-theme') || 'dark',
            savedAt: Date.now(),
        };
        localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
    } catch {
        /* Hajm chegarasidan oshgan bo'lishi mumkin — jim o'tkaziladi */
    }
}

function scheduleAutosave() {
    clearTimeout(autosaveHandle);
    autosaveHandle = setTimeout(autosaveNow, 1500);
}

function tryRestoreAutosave() {
    let raw = null;
    try { raw = localStorage.getItem(AUTOSAVE_KEY); } catch { return; }
    if (!raw) return;
    try {
        const payload = JSON.parse(raw);
        if (!payload?.pages?.length) return;
        const ageMs = Date.now() - (payload.savedAt || 0);
        if (ageMs > 1000 * 60 * 60 * 24 * 14) return; // 14 kundan eski bo'lsa e'tibor bermaymiz
        if (!confirm('Saqlangan doska holati topildi. Uni tiklaymizmi?')) {
            localStorage.removeItem(AUTOSAVE_KEY);
            return;
        }
        pages = payload.pages;
        currentPage = Math.min(payload.currentPage || 0, pages.length - 1);
        loadPageSnapshot(currentPage);
        showToast('✅ Avvalgi doska tiklandi');
    } catch { /* ignore */ }
}

/* Chizish, widget va fon o'zgarishlarida avtosaqlashni rejalashtirish */
canvas.addEventListener('mouseup', scheduleAutosave);
canvas.addEventListener('touchend', scheduleAutosave);
document.addEventListener('keydown', (e) => { if (e.ctrlKey && e.key === 'z') scheduleAutosave(); });
window.addEventListener('beforeunload', autosaveNow);

tryRestoreAutosave();
