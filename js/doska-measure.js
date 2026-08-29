/* ════════════════════════════════════════════════════════════
   ZiyoDoska — O'LCHOV ASBOBLARI (Chizg'ich / Sirkul / Ugolnik)
   Real hayotdagi chizmachilik asboblariga o'xshatilgan:
   sudrab ko'chiriladi, aylantiriladi, ustida santimetr/gradus
   belgilari bor. Asbob faol bo'lganda uning qirrasi/burchagiga
   "yopishib" to'g'ri chiziq yoki doira chiziladi.

   Bu fayl doska.js dan KEYIN yuklanadi va uning global
   o'zgaruvchi/funksiyalaridan (canvas, ctx, color, lineWidth,
   RENDER_SCALE, tool, getCoords, pushUndo, showToast,
   scheduleAutosave, applyShapeStrokeStyle, finishShapePath)
   to'g'ridan-to'g'ri foydalanadi — chunki bir xil <script>
   global doirasida ishlaydi.
════════════════════════════════════════════════════════════ */

/* Chizg'ich va ugolnikning ekrandagi (screen-space) shkalasi:
   1 santimetr = shuncha CSS piksel. Asbob canvas zoomidan
   mustaqil (position:fixed), shu sababli bu qiymat doim bir xil. */
const PX_PER_CM = 16;

const rulerTool = document.getElementById('ruler-tool');
const compassTool = document.getElementById('compass-tool');
const setsquareTool = document.getElementById('setsquare-tool');

/* ════════════════════════════════════
   UMUMIY: SUDRASH (DRAG)
════════════════════════════════════ */
function makeFixedDraggable(container, handle) {
    let dragging = false, sx = 0, sy = 0, sl = 0, st = 0;
    function start(cx, cy) {
        dragging = true;
        const r = container.getBoundingClientRect();
        container.style.left = r.left + 'px';
        container.style.top = r.top + 'px';
        container.style.right = 'auto';
        container.style.marginLeft = '0';
        sx = cx; sy = cy; sl = r.left; st = r.top;
    }
    function move(cx, cy) {
        if (!dragging) return;
        container.style.left = (sl + (cx - sx)) + 'px';
        container.style.top = (st + (cy - sy)) + 'px';
    }
    function end() { dragging = false; }
    handle.addEventListener('mousedown', (e) => {
        e.preventDefault(); e.stopPropagation();
        start(e.clientX, e.clientY);
        const mm = (ev) => move(ev.clientX, ev.clientY);
        const mu = () => { end(); document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
        document.addEventListener('mousemove', mm);
        document.addEventListener('mouseup', mu);
    });
    handle.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        const t = e.touches[0];
        start(t.clientX, t.clientY);
    }, { passive: true });
    handle.addEventListener('touchmove', (e) => {
        if (!dragging) return;
        const t = e.touches[0];
        move(t.clientX, t.clientY);
        e.preventDefault();
    }, { passive: false });
    handle.addEventListener('touchend', end);
}

/* ════════════════════════════════════
   UMUMIY: AYLANTIRISH (ROTATE)
════════════════════════════════════ */
function makeRotatable(container, handle) {
    container.dataset.rotation = container.dataset.rotation || '0';
    let rotating = false, startMouseAngle = 0, startRot = 0;
    function centerOf(el) {
        const r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    function angleTo(cx, cy) {
        const c = centerOf(container);
        return Math.atan2(cy - c.y, cx - c.x) * 180 / Math.PI;
    }
    function start(cx, cy) {
        rotating = true;
        startMouseAngle = angleTo(cx, cy);
        startRot = parseFloat(container.dataset.rotation) || 0;
    }
    function move(cx, cy) {
        if (!rotating) return;
        const cur = angleTo(cx, cy);
        const newRot = startRot + (cur - startMouseAngle);
        container.dataset.rotation = String(newRot);
        container.style.transform = `rotate(${newRot}deg)`;
    }
    function end() { rotating = false; }
    handle.addEventListener('mousedown', (e) => {
        e.preventDefault(); e.stopPropagation();
        start(e.clientX, e.clientY);
        const mm = (ev) => move(ev.clientX, ev.clientY);
        const mu = () => { end(); document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
        document.addEventListener('mousemove', mm);
        document.addEventListener('mouseup', mu);
    });
    handle.addEventListener('touchstart', (e) => {
        e.stopPropagation();
        const t = e.touches[0];
        start(t.clientX, t.clientY);
    }, { passive: true });
    handle.addEventListener('touchmove', (e) => {
        if (!rotating) return;
        const t = e.touches[0];
        move(t.clientX, t.clientY);
        e.preventDefault();
    }, { passive: false });
    handle.addEventListener('touchend', end);
}
function getRotationDeg(container) { return parseFloat(container.dataset.rotation) || 0; }

/* Ekran pikselini canvas ichki piksel birligiga o'giradi (zoom/RENDER_SCALE hisobga olinadi) */
function screenPxToCanvasPx(px) {
    const rect = canvas.getBoundingClientRect();
    return px * (canvas.width / rect.width);
}

/* ════════════════════════════════════
   JONLI (LIVE) O'LCHOV YORLIG'I
════════════════════════════════════ */
let measureLiveLabel = null;
function showLiveLabel(text, clientX, clientY) {
    if (!measureLiveLabel) {
        measureLiveLabel = document.createElement('div');
        measureLiveLabel.className = 'measure-live-label';
        document.body.appendChild(measureLiveLabel);
    }
    measureLiveLabel.textContent = text;
    measureLiveLabel.style.left = (clientX + 16) + 'px';
    measureLiveLabel.style.top = (clientY - 28) + 'px';
    measureLiveLabel.style.display = 'block';
}
function hideLiveLabel() {
    if (measureLiveLabel) measureLiveLabel.style.display = 'none';
}

/* ════════════════════════════════════════════════════════════
   1) CHIZG'ICH (RULER) — santimetrli chiziqlar
════════════════════════════════════════════════════════════ */
function buildRulerTicks() {
    const wrap = document.getElementById('ruler-ticks');
    if (!wrap) return;
    wrap.innerHTML = '';
    const widthPx = rulerTool.offsetWidth || 320;
    const cmCount = Math.floor(widthPx / PX_PER_CM);
    for (let cm = 0; cm <= cmCount; cm++) {
        const x = cm * PX_PER_CM;
        const major = cm % 1 === 0; // har santimetrda katta chiziq
        const tick = document.createElement('div');
        tick.className = 'tick ' + (major ? 'major' : 'minor');
        tick.style.left = x + 'px';
        wrap.appendChild(tick);
        if (major) {
            const label = document.createElement('div');
            label.className = 'tick-label';
            label.style.left = x + 'px';
            label.textContent = cm;
            wrap.appendChild(label);
        }
        /* Yarim-santimetr (mm o'rtasi) chizig'i */
        if (cm < cmCount) {
            const half = document.createElement('div');
            half.className = 'tick minor';
            half.style.left = (x + PX_PER_CM / 2) + 'px';
            wrap.appendChild(half);
        }
    }
    const unit = document.createElement('div');
    unit.className = 'tick-unit';
    unit.textContent = 'sm';
    wrap.appendChild(unit);
}
buildRulerTicks();
window.addEventListener('resize', buildRulerTicks);

makeFixedDraggable(rulerTool, document.getElementById('ruler-drag'));
makeRotatable(rulerTool, document.getElementById('ruler-rotate'));

document.getElementById('ruler-close')?.addEventListener('click', () => {
    rulerTool.style.display = 'none';
    document.getElementById('tool-ruler')?.classList.remove('active');
    if (tool === 'ruler-line') tool = 'pen';
});

/* ════════════════════════════════════════════════════════════
   2) UGOLNIK / TRANSPORTIR (90° SET-SQUARE)
════════════════════════════════════════════════════════════ */
function buildSetsquareSVG() {
    const svg = document.getElementById('setsquare-svg');
    if (!svg) return;
    const A = { x: 30, y: 190 }; // to'g'ri burchak uchi
    const B = { x: 30, y: 20 };  // tik tomon uchi
    const C = { x: 200, y: 190 }; // gorizontal tomon uchi
    const parts = [];
    parts.push(`<path d="M${A.x},${A.y} L${B.x},${B.y} L${C.x},${C.y} Z" fill="rgba(148,163,184,0.32)" stroke="#475569" stroke-width="2.5" stroke-linejoin="round"/>`);

    /* Tik tomon (santimetr belgilari) */
    const legLenV = A.y - B.y;
    for (let cm = 0; cm * 10 <= legLenV; cm++) {
        const y = A.y - cm * 10;
        const major = cm % 5 === 0;
        const tickLen = major ? 12 : 6;
        parts.push(`<line x1="${A.x}" y1="${y}" x2="${A.x + tickLen}" y2="${y}" stroke="#334155" stroke-width="1.2"/>`);
        if (major) parts.push(`<text x="${A.x + 15}" y="${y + 3}" font-size="9" fill="#334155" font-family="monospace">${cm}</text>`);
    }
    /* Gorizontal tomon (santimetr belgilari) */
    const legLenH = C.x - A.x;
    for (let cm = 0; cm * 10 <= legLenH; cm++) {
        const x = A.x + cm * 10;
        const major = cm % 5 === 0;
        const tickLen = major ? 12 : 6;
        parts.push(`<line x1="${x}" y1="${A.y}" x2="${x}" y2="${A.y - tickLen}" stroke="#334155" stroke-width="1.2"/>`);
        if (major && cm > 0) parts.push(`<text x="${x - 4}" y="${A.y - 16}" font-size="9" fill="#334155" font-family="monospace">${cm}</text>`);
    }
    /* Burchak yoyi — transportir kabi 0° dan 90° gacha, har 15° da belgi */
    const R = 42;
    for (let deg = 0; deg <= 90; deg += 15) {
        const rad = deg * Math.PI / 180;
        const x1 = A.x + Math.cos(rad) * (R - 6);
        const y1 = A.y - Math.sin(rad) * (R - 6);
        const x2 = A.x + Math.cos(rad) * R;
        const y2 = A.y - Math.sin(rad) * R;
        parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ff8a3d" stroke-width="1.4"/>`);
        const lx = A.x + Math.cos(rad) * (R + 13);
        const ly = A.y - Math.sin(rad) * (R + 13);
        parts.push(`<text x="${lx - 7}" y="${ly + 3}" font-size="8" fill="#ff8a3d" font-family="monospace">${deg}°</text>`);
    }
    parts.push(`<text x="150" y="34" font-size="9" fill="#64748b" font-family="monospace">sm</text>`);
    svg.innerHTML = parts.join('');
}
buildSetsquareSVG();

makeFixedDraggable(setsquareTool, document.getElementById('setsquare-drag'));
makeRotatable(setsquareTool, document.getElementById('setsquare-rotate'));

document.getElementById('setsquare-close')?.addEventListener('click', () => {
    setsquareTool.style.display = 'none';
    document.getElementById('tool-setsquare')?.classList.remove('active');
    if (tool === 'setsquare-line') tool = 'pen';
});

/* ════════════════════════════════════════════════════════════
   3) SIRKUL (COMPASS) — markazi qadaladi, radiusi sudraladi
════════════════════════════════════════════════════════════ */
const compassPin = document.getElementById('compass-pin');
const compassArm = document.getElementById('compass-arm');
const compassRadiusHandle = document.getElementById('compass-radius-handle');
const compassRadiusLabel = document.getElementById('compass-radius-label');

let compassAngleDeg = -35;
let compassRadiusPx = 90;
let compassDragging = false;
let compassSnapshotBeforeCircle = null;

function updateCompassArm(angleDeg, lengthPx) {
    compassAngleDeg = angleDeg;
    compassRadiusPx = Math.max(14, lengthPx);
    compassArm.style.height = compassRadiusPx + 'px';
    compassArm.style.transform = `rotate(${angleDeg}deg)`;
    const rad = angleDeg * Math.PI / 180;
    const endX = -compassRadiusPx * Math.sin(rad);
    const endY = compassRadiusPx * Math.cos(rad);
    compassRadiusHandle.style.left = (endX - 13) + 'px';
    compassRadiusHandle.style.top = (endY - 13) + 'px';
    const cm = (compassRadiusPx / PX_PER_CM).toFixed(1);
    compassRadiusLabel.textContent = cm + ' sm';
    compassRadiusLabel.style.left = (endX + 16) + 'px';
    compassRadiusLabel.style.top = (endY - 40) + 'px';
}
updateCompassArm(compassAngleDeg, compassRadiusPx);

makeFixedDraggable(compassTool, compassPin);

function compassOrigin() {
    const r = compassTool.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function compassRadiusStart() {
    compassDragging = true;
    pushUndo();
    try { compassSnapshotBeforeCircle = canvas.toDataURL(); } catch { compassSnapshotBeforeCircle = null; }
}
function compassRadiusMove(cx, cy) {
    if (!compassDragging) return;
    const origin = compassOrigin();
    const px = cx - origin.x, py = cy - origin.y;
    const L = Math.max(14, Math.hypot(px, py));
    const A = Math.atan2(-px, py) * 180 / Math.PI;
    updateCompassArm(A, L);

    if (compassSnapshotBeforeCircle) {
        const centerCanvas = getCoords({ clientX: origin.x, clientY: origin.y });
        const radiusCanvas = screenPxToCanvasPx(L);
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            applyShapeStrokeStyle();
            ctx.beginPath();
            ctx.arc(centerCanvas.x, centerCanvas.y, radiusCanvas, 0, Math.PI * 2);
            finishShapePath();
            ctx.setLineDash([]);
        };
        img.src = compassSnapshotBeforeCircle;
    }
    showLiveLabel((L / PX_PER_CM).toFixed(1) + ' sm radius', cx, cy);
}
function compassRadiusEnd() {
    if (!compassDragging) return;
    compassDragging = false;
    hideLiveLabel();
    scheduleAutosave();
    showToast('⭕ Sirkul bilan doira chizildi');
}

compassRadiusHandle.addEventListener('mousedown', (e) => {
    e.preventDefault(); e.stopPropagation();
    compassRadiusStart();
    const mm = (ev) => compassRadiusMove(ev.clientX, ev.clientY);
    const mu = (ev) => { compassRadiusMove(ev.clientX, ev.clientY); compassRadiusEnd(); document.removeEventListener('mousemove', mm); document.removeEventListener('mouseup', mu); };
    document.addEventListener('mousemove', mm);
    document.addEventListener('mouseup', mu);
});
compassRadiusHandle.addEventListener('touchstart', (e) => {
    e.stopPropagation();
    compassRadiusStart();
}, { passive: true });
compassRadiusHandle.addEventListener('touchmove', (e) => {
    if (!compassDragging) return;
    const t = e.touches[0];
    compassRadiusMove(t.clientX, t.clientY);
    e.preventDefault();
}, { passive: false });
compassRadiusHandle.addEventListener('touchend', (e) => {
    compassRadiusEnd();
});

document.getElementById('compass-close')?.addEventListener('click', () => {
    compassTool.style.display = 'none';
    document.getElementById('tool-compass')?.classList.remove('active');
});

/* ════════════════════════════════════════════════════════════
   4) TOOLBAR TUGMALARI — asbobni ko'rsatish/yashirish
      va chizishni shu asbobga "moslash" (snap)
════════════════════════════════════════════════════════════ */
function toggleMeasureTool(btn, el, toolName) {
    btn?.addEventListener('click', () => {
        const showing = el.style.display !== 'none';
        if (showing) {
            el.style.display = 'none';
            btn.classList.remove('active');
            if (tool === toolName) tool = 'pen';
        } else {
            el.style.display = 'block';
            btn.classList.add('active');
            if (toolName) {
                tool = toolName;
                canvas.classList.remove('eraser-mode');
                document.getElementById('btn-eraser')?.classList.remove('active');
                document.querySelectorAll('.shape-btn, .pen-mode-btn').forEach((b) => b.classList.remove('active'));
            }
            showToast('📐 Asbobni sudrab joylashtiring, burchagidan aylantiring');
        }
    });
}
toggleMeasureTool(document.getElementById('tool-ruler'), rulerTool, 'ruler-line');
toggleMeasureTool(document.getElementById('tool-compass'), compassTool, null);
toggleMeasureTool(document.getElementById('tool-setsquare'), setsquareTool, 'setsquare-line');

/* ════════════════════════════════════════════════════════════
   5) CHIZG'ICH / UGOLNIK QIRRASIGA "YOPISHIB" CHIZISH
      Chiziq foydalanuvchi qanday sudramasin, asbobning joriy
      burchagiga (ugolnik uchun ikkala tomoniga ham) yopishadi.
════════════════════════════════════════════════════════════ */
let measureDrawing = false;
let measureLineStart = null;
let measureLineStartScreen = null;
let measureSnapshotBeforeLine = null;

function isMeasureLineTool() {
    return tool === 'ruler-line' || tool === 'setsquare-line';
}

function measureStartDraw(e) {
    if (!isMeasureLineTool()) return;
    if (e.target.closest('.measure-tool') || e.target.closest('.floating-toolbar') || e.target.closest('.page-nav')) return;
    measureDrawing = true;
    const cx = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
    const cy = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
    measureLineStartScreen = { x: cx, y: cy };
    measureLineStart = getCoords(e);
    try { measureSnapshotBeforeLine = canvas.toDataURL(); } catch { measureSnapshotBeforeLine = null; }
    e.preventDefault();
}

function bestSnapAngle(dragAngleDeg) {
    const base = tool === 'ruler-line' ? getRotationDeg(rulerTool) : getRotationDeg(setsquareTool);
    const candidates = tool === 'setsquare-line' ? [base, base + 90] : [base];
    let best = candidates[0], bestDiff = 999;
    candidates.forEach((c) => {
        [c, c + 180].forEach((variant) => {
            let diff = Math.abs(((dragAngleDeg - variant + 540) % 360) - 180);
            if (diff < bestDiff) { bestDiff = diff; best = variant; }
        });
    });
    return best;
}

function measureMoveDraw(e) {
    if (!measureDrawing || !measureLineStart) return;
    const cx = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
    const cy = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
    const screenDx = cx - measureLineStartScreen.x;
    const screenDy = cy - measureLineStartScreen.y;
    const dragAngle = Math.atan2(screenDy, screenDx) * 180 / Math.PI;
    const snapAngle = bestSnapAngle(dragAngle);
    const rad = snapAngle * Math.PI / 180;

    const dragScreenLen = Math.hypot(screenDx, screenDy);
    const projScreenLen = dragScreenLen * Math.cos((dragAngle - snapAngle) * Math.PI / 180);

    const p = getCoords(e);
    const canvasDx = p.x - measureLineStart.x;
    const canvasDy = p.y - measureLineStart.y;
    const canvasDragLen = Math.hypot(canvasDx, canvasDy);
    const canvasProjLen = canvasDragLen * Math.cos((Math.atan2(canvasDy, canvasDx) * 180 / Math.PI - snapAngle) * Math.PI / 180);

    const end = {
        x: measureLineStart.x + Math.cos(rad) * canvasProjLen,
        y: measureLineStart.y + Math.sin(rad) * canvasProjLen,
    };

    if (measureSnapshotBeforeLine) {
        const img = new Image();
        img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);
            applyShapeStrokeStyle();
            ctx.beginPath();
            ctx.moveTo(measureLineStart.x, measureLineStart.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
            ctx.setLineDash([]);
        };
        img.src = measureSnapshotBeforeLine;
    }

    const cmLen = (Math.abs(projScreenLen) / PX_PER_CM).toFixed(1);
    showLiveLabel(`${cmLen} sm · ${Math.round(((snapAngle % 360) + 360) % 360)}°`, cx, cy);
    e.preventDefault();
}

function measureEndDraw() {
    if (!measureDrawing) return;
    measureDrawing = false;
    measureLineStart = null;
    hideLiveLabel();
    scheduleAutosave();
}

canvas.addEventListener('mousedown', measureStartDraw);
canvas.addEventListener('mousemove', measureMoveDraw);
canvas.addEventListener('mouseup', measureEndDraw);
canvas.addEventListener('mouseleave', measureEndDraw);
canvas.addEventListener('touchstart', measureStartDraw, { passive: false });
canvas.addEventListener('touchmove', measureMoveDraw, { passive: false });
canvas.addEventListener('touchend', measureEndDraw);
