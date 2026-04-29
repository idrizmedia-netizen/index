// ==========================================
// TO'LQINLAR LABORATORIYALARI (V3.0)
// ==========================================

// 1. TOVUSH TO'LQINLARI (Ossillograf)
function initSoundWaves() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #06b6d4; background: #f0f9ff;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline"><i class="fas fa-arrow-left"></i> Orqaga</button>
                <h3><i class="fas fa-volume-up"></i> Tovush to'lqinlari (Ossillograf)</h3>
                <div style="font-family: monospace; background: #083344; color: #22d3ee; padding: 5px 15px; border-radius: 5px;">y = A·sin(ωt + φ)</div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 280px; background: white; padding: 20px; border-radius: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    <label>Chastota (f): <b id="f_val" style="color:#06b6d4">440</b> Hz</label>
                    <input type="range" id="freqF" min="100" max="1000" value="440" style="width:100%" oninput="updateSound()">
                    
                    <label style="margin-top:15px; display:block;">Amplituda (A): <b id="a_val">50</b> %</label>
                    <input type="range" id="ampA" min="10" max="100" value="50" style="width:100%" oninput="updateSound()">
                    
                    <div style="margin-top:20px; padding:15px; background:#083344; border-radius:10px; color:#22d3ee;">
                        <small>Tovush balandligi:</small>
                        <div id="volume_bar" style="height:10px; background:#164e63; border-radius:5px; margin-top:5px; overflow:hidden;">
                            <div id="volume_fill" style="width:50%; height:100%; background:#22d3ee; transition:0.3s;"></div>
                        </div>
                    </div>
                    <button onclick="recordSound()" class="btn" style="width:100%; margin-top:20px; background:#06b6d4; color:white;">Spektrni saqlash</button>
                </div>
                <div style="flex: 2; min-width: 350px; background: #000; border: 4px solid #334155; border-radius: 10px; position: relative; height: 300px;">
                    <canvas id="waveCanvas" width="600" height="300" style="width:100%; height:100%;"></canvas>
                    <div style="position: absolute; top: 10px; right: 10px; color: #22d3ee; font-size: 0.7rem; border: 1px solid #22d3ee; padding: 2px 5px;">LIVE OSCILLOSCOPE</div>
                </div>
            </div>
        </div>
    `;
    animateWave();
}

// 2. DOPPLER EFFEKTI (Harakatdagi manba)
function initDoppler() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #f43f5e;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline">Orqaga</button>
                <h3><i class="fas fa-broadcast-tower"></i> Doppler effekti</h3>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 250px; background: #fff1f2; padding: 20px; border-radius: 15px;">
                    <label>Manba tezligi (v): <b id="v_src">50</b> m/s</label>
                    <input type="range" id="sourceV" min="0" max="150" value="50" style="width:100%" oninput="updateDoppler()">
                    <div style="margin-top:20px; background:white; padding:10px; border-radius:8px; font-size:0.9rem;">
                        <p>Oldinda: <span id="f_front" style="color:#f43f5e; font-weight:bold;">---</span></p>
                        <p>Ortda: <span id="f_back" style="color:#3b82f6; font-weight:bold;">---</span></p>
                    </div>
                </div>
                <div style="flex: 2; background: #1e293b; border-radius: 15px; height: 300px; position: relative; overflow: hidden;">
                    <canvas id="dopplerCanvas" width="600" height="300" style="width:100%; height:100%;"></canvas>
                </div>
            </div>
        </div>
    `;
    animateDoppler();
}

// 3. PRUJINALI TEBRANISH (Guk qonuni)
function initSpring() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #8b5cf6;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline">Orqaga</button>
                <h3><i class="fas fa-wave-square"></i> Prujinali tebranishlar</h3>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; background: #f5f3ff; padding: 20px; border-radius: 15px;">
                    <label>Yuk massasi (m): <b id="m_val">2</b> kg</label>
                    <input type="range" id="massM" min="1" max="10" value="2" style="width:100%" oninput="updateSpring()">
                    <label style="margin-top:15px; display:block;">Bikrlik (k): <b id="k_val">100</b> N/m</label>
                    <input type="range" id="stiffK" min="50" max="500" step="10" value="100" style="width:100%" oninput="updateSpring()">
                    <div style="margin-top:20px; border-left:4px solid #8b5cf6; padding-left:10px;">
                        <p>Davr: <b id="periodT">0.00</b> s</p>
                    </div>
                </div>
                <div style="flex: 2; background: white; border: 2px solid #ddd; border-radius: 15px; height: 350px; display: flex; justify-content: center; position: relative; overflow: hidden;">
                    <div style="width: 100%; height: 20px; background: #475569; position: absolute; top: 0;"></div>
                    <canvas id="springCanvas" width="400" height="350"></canvas>
                </div>
            </div>
        </div>
    `;
    animateSpring();
}

// --- ANIMATSIYA LOGIKALARI ---

function animateWave() {
    const canvas = document.getElementById('waveCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let offset = 0;

    function draw() {
        if (!document.getElementById('waveCanvas')) return;
        ctx.fillStyle = "rgba(0, 0, 0, 0.2)"; // Motion blur effekti
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const freq = document.getElementById('freqF').value / 20;
        const amp = document.getElementById('ampA').value;
        
        ctx.beginPath();
        ctx.strokeStyle = "#22d3ee";
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = "#22d3ee";

        for (let x = 0; x < canvas.width; x++) {
            const y = canvas.height / 2 + Math.sin(x * 0.02 * freq + offset) * amp;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        offset -= 0.1;
        requestAnimationFrame(draw);
    }
    draw();
}

function updateSound() {
    const f = document.getElementById('freqF').value;
    const a = document.getElementById('ampA').value;
    document.getElementById('f_val').innerText = f;
    document.getElementById('a_val').innerText = a;
    document.getElementById('volume_fill').style.width = a + "%";
}

function animateDoppler() {
    const canvas = document.getElementById('dopplerCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let waves = [];
    let sourceX = 0;

    function draw() {
        if (!document.getElementById('dopplerCanvas')) return;
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const speed = parseFloat(document.getElementById('sourceV').value) / 20;
        sourceX += speed;
        if (sourceX > canvas.width) sourceX = 0;

        // Yangi to'lqin chiqarish
        if (Date.now() % 20 < 2) waves.push({x: sourceX, r: 0});

        waves.forEach((w, i) => {
            w.r += 2; // To'lqin kengayishi
            ctx.beginPath();
            ctx.arc(w.x, canvas.height / 2, w.r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(244, 63, 94, ${1 - w.r/300})`;
            ctx.stroke();
            if (w.r > 300) waves.splice(i, 1);
        });

        // Manba (Mashina/Samolyot)
        ctx.fillStyle = "white";
        ctx.font = "20px FontAwesome";
        ctx.fillText("\uf1b9", sourceX - 10, canvas.height / 2 + 7);
        
        requestAnimationFrame(draw);
    }
    draw();
}

function animateSpring() {
    const canvas = document.getElementById('springCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let time = 0;

    function draw() {
        if (!document.getElementById('springCanvas')) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const m = parseFloat(document.getElementById('massM').value);
        const k = parseFloat(document.getElementById('stiffK').value);
        const omega = Math.sqrt(k / m);
        const amplitude = 50;
        const y = 150 + Math.sin(time) * amplitude;
        
        // Prujinani chizish
        ctx.beginPath();
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;
        ctx.moveTo(canvas.width / 2, 20);
        for (let i = 0; i < 20; i++) {
            const py = 20 + (y - 20) / 20 * i;
            const px = canvas.width / 2 + (i % 2 === 0 ? 10 : -10);
            ctx.lineTo(px, py);
        }
        ctx.lineTo(canvas.width / 2, y);
        ctx.stroke();

        // Yukni chizish (Massa)
        ctx.fillStyle = "#8b5cf6";
        ctx.fillRect(canvas.width / 2 - 20, y, 40, 40);
        ctx.fillStyle = "white";
        ctx.fillText(m + "kg", canvas.width / 2 - 10, y + 25);

        time += 0.1 * (omega / 5);
        document.getElementById('periodT').innerText = (2 * Math.PI / omega).toFixed(2);
        requestAnimationFrame(draw);
    }
    draw();
}
