const canvas = document.getElementById('board-canvas');
const ctx = canvas.getContext('2d');
const toolbar = document.getElementById('floating-toolbar');
const bgWrap = document.getElementById('doska-bg-wrap');
const tbBody = document.getElementById('tb-body');
const collapseBtn = document.getElementById('tb-collapse');
const collapseIcon = document.getElementById('tb-collapse-icon');

let drawing = false;
let color = '#ffffff';
let boardBg = '#0f172a';
let lineWidth = 4;
let isEraser = false;
let undoStack = [];
const MAX_UNDO = 25;

function applyBoardBg(bg) {
    boardBg = bg;
    if (bgWrap) bgWrap.style.background = bg;
    document.documentElement.style.setProperty('--doska-bg', bg);
}

applyBoardBg(boardBg);

function resizeCanvas() {
    const wrap = canvas.parentElement;
    const temp = document.createElement('canvas');
    temp.width = canvas.width;
    temp.height = canvas.height;
    temp.getContext('2d').drawImage(canvas, 0, 0);
    canvas.width = wrap.clientWidth;
    canvas.height = wrap.clientHeight;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.drawImage(temp, 0, 0, canvas.width, canvas.height);
}

function pushUndo() {
    try {
        undoStack.push(canvas.toDataURL());
        if (undoStack.length > MAX_UNDO) undoStack.shift();
    } catch {
        /* ignore */
    }
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

function startDraw(e) {
    if (e.target.closest('.floating-toolbar')) return;
    drawing = true;
    pushUndo();
    const p = getCoords(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    e.preventDefault();
}

function moveDraw(e) {
    if (!drawing) return;
    const p = getCoords(e);
    ctx.strokeStyle = color;
    ctx.lineWidth = isEraser ? lineWidth * 2.5 : lineWidth;
    ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    e.preventDefault();
}

function endDraw() {
    drawing = false;
    ctx.globalCompositeOperation = 'source-over';
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
pushUndo();

document.querySelectorAll('.color-dot').forEach((btn) => {
    btn.addEventListener('click', () => {
        isEraser = false;
        canvas.classList.remove('eraser-mode');
        document.getElementById('btn-eraser')?.classList.remove('active');
        color = btn.dataset.color;
        document.querySelectorAll('.color-dot').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

document.querySelectorAll('.bg-dot').forEach((btn) => {
    btn.addEventListener('click', () => {
        applyBoardBg(btn.dataset.bg);
        document.querySelectorAll('.bg-dot').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

document.getElementById('brush-size')?.addEventListener('input', (e) => {
    lineWidth = parseInt(e.target.value, 10);
    const label = document.getElementById('brush-size-label');
    if (label) label.textContent = lineWidth + 'px';
});

document.getElementById('btn-eraser')?.addEventListener('click', () => {
    isEraser = !isEraser;
    canvas.classList.toggle('eraser-mode', isEraser);
    document.getElementById('btn-eraser').classList.toggle('active', isEraser);
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
    ex.fillStyle = boardBg;
    ex.fillRect(0, 0, exportCanvas.width, exportCanvas.height);
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
    } catch {
        /* ignore */
    }
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
}

if (window.ZiyomapUsage?.getUser()) {
    ZiyomapUsage.logUsage('doska', 'Onlayn doska');
}
