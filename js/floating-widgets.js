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

    function defaultPos(id) {
        const map = {
            robot: { left: window.innerWidth - 68, top: window.innerHeight - 88 },
            doska: { left: window.innerWidth - 68, top: window.innerHeight - 158 },
        };
        return map[id] || { left: window.innerWidth - 68, top: window.innerHeight - 120 };
    }

    function makeDraggable(wrapper) {
        const id = wrapper.dataset.fabId || wrapper.id || 'fab';
        const link = wrapper.querySelector('.fab-link');
        const handle = wrapper.querySelector('.fab-drag-handle') || wrapper;
        const saved = loadPos(id, defaultPos(id));

        wrapper.style.position = 'fixed';
        wrapper.style.left = saved.left + 'px';
        wrapper.style.top = saved.top + 'px';
        wrapper.style.zIndex = '9990';

        let dragging = false;
        let moved = false;
        let startX = 0;
        let startY = 0;
        let origLeft = 0;
        let origTop = 0;

        function onStart(clientX, clientY) {
            dragging = true;
            moved = false;
            startX = clientX;
            startY = clientY;
            origLeft = parseFloat(wrapper.style.left) || 0;
            origTop = parseFloat(wrapper.style.top) || 0;
            wrapper.classList.add('fab-dragging');
        }

        function onMove(clientX, clientY) {
            if (!dragging) return;
            const dx = clientX - startX;
            const dy = clientY - startY;
            if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
            const w = wrapper.offsetWidth;
            const h = wrapper.offsetHeight;
            wrapper.style.left = clamp(origLeft + dx, 4, window.innerWidth - w - 4) + 'px';
            wrapper.style.top = clamp(origTop + dy, 4, window.innerHeight - h - 4) + 'px';
        }

        function onEnd() {
            if (!dragging) return;
            dragging = false;
            wrapper.classList.remove('fab-dragging');
            savePos(id, parseFloat(wrapper.style.left) || 0, parseFloat(wrapper.style.top) || 0);
            if (moved) {
                wrapper.dataset.didDrag = '1';
                setTimeout(() => delete wrapper.dataset.didDrag, 400);
            }
        }

        wrapper.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
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

        /* Sensorli ekran — butun tugma */
        wrapper.addEventListener(
            'touchstart',
            (e) => {
                const t = e.touches[0];
                onStart(t.clientX, t.clientY);
            },
            { passive: true }
        );

        wrapper.addEventListener(
            'touchmove',
            (e) => {
                if (!dragging) return;
                const t = e.touches[0];
                onMove(t.clientX, t.clientY);
                if (moved) e.preventDefault();
            },
            { passive: false }
        );

        wrapper.addEventListener('touchend', onEnd);

        if (link) {
            link.addEventListener('click', (e) => {
                if (wrapper.dataset.didDrag === '1') {
                    e.preventDefault();
                    e.stopPropagation();
                }
            });
        }
    }

    function init() {
        document.querySelectorAll('.floating-widget-wrap').forEach(makeDraggable);
    }

    window.addEventListener('resize', () => {
        document.querySelectorAll('.floating-widget-wrap').forEach((el) => {
            const id = el.dataset.fabId;
            if (!id) return;
            const left = parseFloat(el.style.left) || 0;
            const top = parseFloat(el.style.top) || 0;
            const w = el.offsetWidth;
            const h = el.offsetHeight;
            el.style.left = clamp(left, 4, window.innerWidth - w - 4) + 'px';
            el.style.top = clamp(top, 4, window.innerHeight - h - 4) + 'px';
        });
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
