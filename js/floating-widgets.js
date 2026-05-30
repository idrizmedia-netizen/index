(function () {
    const STORAGE_PREFIX = 'ziyomap_fab_pos_';

    function loadPos(id, fallback) {
        try {
            const raw = localStorage.getItem(STORAGE_PREFIX + id);
            if (raw) return JSON.parse(raw);
        } catch {
            /* ignore */
        }
        return fallback;
    }

    function savePos(id, left, top) {
        localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify({ left, top }));
    }

    function clamp(val, min, max) {
        return Math.min(Math.max(val, min), max);
    }

    function makeDraggable(el) {
        const id = el.dataset.fabId || el.id || 'fab';
        const defaults = {
            robot: { left: window.innerWidth - 76, top: window.innerHeight - 100 },
            doska: { left: window.innerWidth - 76, top: window.innerHeight - 170 },
        };
        const fallback = defaults[id] || {
            left: window.innerWidth - 76,
            top: window.innerHeight - 120,
        };
        const saved = loadPos(id, fallback);
        el.style.position = 'fixed';
        el.style.left = saved.left + 'px';
        el.style.top = saved.top + 'px';
        el.style.right = 'auto';
        el.style.bottom = 'auto';
        el.style.zIndex = '9990';
        el.style.touchAction = 'none';

        let dragging = false;
        let moved = false;
        let startX = 0;
        let startY = 0;
        let origLeft = 0;
        let origTop = 0;

        const onPointerDown = (e) => {
            if (e.button !== undefined && e.button !== 0) return;
            dragging = true;
            moved = false;
            startX = e.clientX;
            startY = e.clientY;
            origLeft = parseFloat(el.style.left) || 0;
            origTop = parseFloat(el.style.top) || 0;
            el.setPointerCapture?.(e.pointerId);
            el.classList.add('fab-dragging');
        };

        const onPointerMove = (e) => {
            if (!dragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (Math.abs(dx) + Math.abs(dy) > 4) moved = true;
            const w = el.offsetWidth;
            const h = el.offsetHeight;
            const left = clamp(origLeft + dx, 8, window.innerWidth - w - 8);
            const top = clamp(origTop + dy, 8, window.innerHeight - h - 8);
            el.style.left = left + 'px';
            el.style.top = top + 'px';
        };

        const onPointerUp = (e) => {
            if (!dragging) return;
            dragging = false;
            el.classList.remove('fab-dragging');
            el.releasePointerCapture?.(e.pointerId);
            const left = parseFloat(el.style.left) || 0;
            const top = parseFloat(el.style.top) || 0;
            savePos(id, left, top);
            if (moved) {
                el.dataset.didDrag = '1';
                setTimeout(() => {
                    delete el.dataset.didDrag;
                }, 300);
            }
        };

        el.addEventListener('pointerdown', onPointerDown);
        el.addEventListener('pointermove', onPointerMove);
        el.addEventListener('pointerup', onPointerUp);
        el.addEventListener('pointercancel', onPointerUp);

        el.addEventListener(
            'click',
            (e) => {
                if (el.dataset.didDrag === '1') {
                    e.preventDefault();
                    e.stopPropagation();
                }
            },
            true
        );
    }

    function init() {
        document.querySelectorAll('.floating-widget').forEach(makeDraggable);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
