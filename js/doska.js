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

let drawing = false;
let color = '#ffffff';
let lineWidth = 4;
let tool = 'pen'; // pen | eraser | shape-line | shape-rect | shape-circle
let shapeStart = null;
let undoStack = [];
const MAX_UNDO = 25;

/* ════════════════════════════════════
   SAHIFALAR (slaydlar)
════════════════════════════════════ */
let pages = [{ dataUrl: null, bg: { type: 'color', value: '#0f172a' } }];
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
    pages.push({ dataUrl: null, bg: { type: 'color', value: '#0f172a' } });
    currentPage = pages.length - 1;
    undoStack = [];
    loadPageSnapshot(currentPage);
    showToast('Yangi sahifa qo\'shildi');
}

document.getElementById('page-nav-prev')?.addEventListener('click', () => goToPage(currentPage - 1));
document.getElementById('page-nav-next')?.addEventListener('click', () => goToPage(currentPage + 1));
document.getElementById('page-nav-add')?.addEventListener('click', addPage);

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
    canvas.width = wrap.clientWidth;
    canvas.height = wrap.clientHeight;
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
    drawing = true;
    pushUndo();
    const p = getCoords(e);

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

    if (tool === 'pen' || tool === 'eraser') {
        ctx.strokeStyle = color;
        ctx.lineWidth = tool === 'eraser' ? lineWidth * 2.5 : lineWidth;
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
    ctx.lineWidth = lineWidth;
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
    const headLen = Math.max(14, lineWidth * 3);
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
    }

    dragHandle.addEventListener('mousedown', (e) => {
        e.preventDefault();
        e.stopPropagation();
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
}

document.getElementById('btn-open-bg-modal')?.addEventListener('click', openBgModal);

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

function addTextWidget() {
    const el = createWidgetShell('✏️ Matn', null);
    el.classList.add('text-widget');

    const controls = document.createElement('div');
    controls.className = 'text-widget-controls';
    controls.innerHTML = `
        <button type="button" class="tw-ctrl-btn" data-act="size-dec" title="Kichraytirish"><i class="fas fa-minus"></i></button>
        <button type="button" class="tw-ctrl-btn" data-act="size-inc" title="Kattalashtirish"><i class="fas fa-plus"></i></button>
        <button type="button" class="tw-color-dot" data-color="#ffffff" style="background:#fff" title="Oq"></button>
        <button type="button" class="tw-color-dot" data-color="#ff8a3d" style="background:#ff8a3d" title="Apelsin"></button>
        <button type="button" class="tw-color-dot" data-color="#2dd4bf" style="background:#2dd4bf" title="Firuza"></button>
        <button type="button" class="tw-color-dot" data-color="#fde047" style="background:#fde047" title="Sariq"></button>
    `;
    el.appendChild(controls);

    const ta = document.createElement('textarea');
    ta.className = 'board-widget-text';
    ta.placeholder = 'Matn yozing...';
    ta.style.fontSize = '16px';
    ta.style.color = '#ffffff';
    el.appendChild(ta);

    /* Boshqaruv tugmalari klik bo'lganda widget surilmasligi uchun */
    controls.addEventListener('mousedown', (e) => e.stopPropagation());
    controls.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });
    ta.addEventListener('mousedown', (e) => e.stopPropagation());
    ta.addEventListener('touchstart', (e) => e.stopPropagation(), { passive: true });

    let fontSize = 16;
    controls.querySelector('[data-act="size-inc"]').addEventListener('click', () => {
        fontSize = Math.min(48, fontSize + 2);
        ta.style.fontSize = fontSize + 'px';
    });
    controls.querySelector('[data-act="size-dec"]').addEventListener('click', () => {
        fontSize = Math.max(10, fontSize - 2);
        ta.style.fontSize = fontSize + 'px';
    });
    controls.querySelectorAll('.tw-color-dot').forEach((dot) => {
        dot.addEventListener('click', () => { ta.style.color = dot.dataset.color; });
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
   AUTH + USAGE LOG
════════════════════════════════════ */
if (window.ZiyomapUsage?.getUser()) {
    ZiyomapUsage.logUsage('doska', 'Onlayn doska');
}

updatePageNav();
