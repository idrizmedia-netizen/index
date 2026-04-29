// ==========================================
// 1. MATEMATIK MAYATNIK (MUKAMMAL)
// ==========================================
let pendulumInterval;
let isPendulumRunning = false;

function initPendulum() {
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline"><i class="fas fa-arrow-left"></i> Orqaga</button>
                <h3>Matematik mayatnik tebranishi</h3>
                <span></span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 250px; background: #f8fafc; padding: 20px; border-radius: 10px;">
                    <label>Ip uzunligi (L): <b id="l_val">1.0</b> m</label>
                    <input type="range" id="lengthL" min="0.5" max="3" step="0.1" value="1" style="width:100%" oninput="updatePendulum()">
                    
                    <label style="margin-top:15px; display:block;">Burchak (α): <b id="a_val">30</b>°</label>
                    <input type="range" id="angleA" min="5" max="60" step="5" value="30" style="width:100%" oninput="updatePendulum()">
                    
                    <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #2563eb;">
                        <p id="resT">Davr: T = 2.01 s</p>
                        <p id="resF">Chastota: ν = 0.50 Hz</p>
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button id="pStart" onclick="startPendulum()" class="btn" style="flex:1;">Start</button>
                        <button onclick="resetPendulum()" class="btn btn-outline" style="flex:1;">Reset</button>
                    </div>
                </div>
                <div style="flex: 1; min-width: 300px; background: white; border-radius: 10px; border: 1px solid #e2e8f0; display: flex; justify-content: center;">
                    <canvas id="pendulumCanvas" width="300" height="300"></canvas>
                </div>
            </div>
        </div>
    `;
    updatePendulum();
}

function updatePendulum() {
    if(isPendulumRunning) resetPendulum();
    const L = document.getElementById('lengthL').value;
    const A = document.getElementById('angleA').value;
    document.getElementById('l_val').innerText = L;
    document.getElementById('a_val').innerText = A;
    const T = (2 * Math.PI * Math.sqrt(L / 9.81)).toFixed(2);
    document.getElementById('resT').innerText = `Davr: T = ${T} s`;
    document.getElementById('resF').innerText = `Chastota: ν = ${(1/T).toFixed(2)} Hz`;
    drawStaticPendulum(L, A);
}

function drawStaticPendulum(L, A) {
    const canvas = document.getElementById('pendulumCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const originX = canvas.width / 2;
    const originY = 50;
    const length = L * 70;
    const angle = A * Math.PI / 180;
    const endX = originX + length * Math.sin(angle);
    const endY = originY + length * Math.cos(angle);
    
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = "#94a3b8"; ctx.stroke();
    ctx.beginPath(); ctx.arc(endX, endY, 15, 0, Math.PI * 2);
    ctx.fillStyle = "#2563eb"; ctx.fill();
}

function startPendulum() {
    if (isPendulumRunning) return;
    isPendulumRunning = true;
    document.getElementById('pStart').disabled = true;
    const canvas = document.getElementById('pendulumCanvas');
    const ctx = canvas.getContext('2d');
    let time = 0;
    
    pendulumInterval = setInterval(() => {
        const L = document.getElementById('lengthL').value;
        const A = document.getElementById('angleA').value;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const originX = canvas.width / 2;
        const originY = 50;
        const angle = (A * Math.PI / 180) * Math.cos(time);
        const endX = originX + (L * 70) * Math.sin(angle);
        const endY = originY + (L * 70) * Math.cos(angle);
        
        ctx.beginPath(); ctx.moveTo(originX, originY); ctx.lineTo(endX, endY);
        ctx.strokeStyle = "#475569"; ctx.stroke();
        ctx.beginPath(); ctx.arc(endX, endY, 15, 0, Math.PI * 2);
        ctx.fillStyle = "#2563eb"; ctx.fill();
        time += 0.05 / Math.sqrt(L);
    }, 20);
}

function resetPendulum() {
    clearInterval(pendulumInterval);
    isPendulumRunning = false;
    document.getElementById('pStart').disabled = false;
    const L = document.getElementById('lengthL').value;
    const A = document.getElementById('angleA').value;
    drawStaticPendulum(L, A);
}

// ==========================================
// 2. ERKIN TUSHISH (BALANDLIK BILAN)
// ==========================================
let fallTimer;
function initFreeFall() {
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline">Orqaga</button>
                <h3>Erkin tushish laboratoriyasi</h3>
                <span></span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">
                <div style="flex: 1; min-width: 250px; background: #f1f5f9; padding: 20px; border-radius: 10px; text-align: left;">
                    <label>Balandlik (h): <b id="h_val">20</b> m</label>
                    <input type="range" id="heightH" min="10" max="100" step="5" value="20" style="width:100%" oninput="updateFall()">
                    
                    <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #e11d48;">
                        <p id="resFallTime">Kutilayotgan vaqt: 2.02 s</p>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button id="fStart" onclick="startFalling()" class="btn" style="background:#e11d48; flex:1;">Tashlash</button>
                        <button onclick="updateFall()" class="btn btn-outline" style="flex:1;">Reset</button>
                    </div>
                </div>
                <div style="flex: 1; background: white; border: 1px solid #cbd5e1; border-radius: 10px; height: 350px; position: relative;">
                    <div id="fallBall" style="position: absolute; left: 50%; transform: translateX(-50%); top: 10px; width: 30px; height: 30px; background: #e11d48; border-radius: 50%;"></div>
                    <div style="position: absolute; bottom: 0; width: 100%; height: 5px; background: #475569;"></div>
                    <p id="liveTimer" style="position: absolute; top: 10px; right: 10px; font-weight: bold; color: #64748b;">0.00s</p>
                </div>
            </div>
        </div>
    `;
    updateFall();
}

function updateFall() {
    clearInterval(fallTimer);
    const h = document.getElementById('heightH').value;
    document.getElementById('h_val').innerText = h;
    const t = Math.sqrt((2 * h) / 9.81).toFixed(2);
    document.getElementById('resFallTime').innerText = `Kutilayotgan vaqt: ${t} s`;
    document.getElementById('fallBall').style.top = "10px";
    document.getElementById('liveTimer').innerText = "0.00s";
    document.getElementById('fStart').disabled = false;
}

function startFalling() {
    const ball = document.getElementById('fallBall');
    const timerText = document.getElementById('liveTimer');
    const h = document.getElementById('heightH').value;
    document.getElementById('fStart').disabled = true;
    
    let startTime = Date.now();
    const g = 9.81;
    const maxPx = 300; // Vizual balandlik px da

    fallTimer = setInterval(() => {
        let elapsed = (Date.now() - startTime) / 1000;
        let currentY = (0.5 * g * elapsed * elapsed);
        
        // Vizual ko'chirish
        let movePx = (currentY / h) * maxPx;
        ball.style.top = (10 + movePx) + "px";
        timerText.innerText = elapsed.toFixed(2) + "s";

        if (currentY >= h) {
            clearInterval(fallTimer);
            ball.style.top = (10 + maxPx) + "px";
            timerText.innerText = Math.sqrt((2 * h) / g).toFixed(2) + "s (Bax!)";
        }
    }, 20);
}

// ==========================================
// 3. NYUTON 2-QONUNI
// ==========================================
let newtonInterval;
function initNewtonTwo() {
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline">Orqaga</button>
                <h3>Nyuton 2-qonuni (F = m * a)</h3>
                <span></span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 250px; text-align: left; background: #f0fdf4; padding: 20px; border-radius: 10px;">
                    <label>Massa (m): <b id="m_val">5</b> kg</label>
                    <input type="range" id="massM" min="1" max="20" step="1" value="5" style="width:100%" oninput="updateNewton()">
                    <label style="margin-top:15px; display:block;">Kuch (F): <b id="f_val">10</b> N</label>
                    <input type="range" id="forceF" min="1" max="50" step="1" value="10" style="width:100%" oninput="updateNewton()">
                    
                    <div style="margin-top: 20px; padding: 10px; background: white; border-radius: 8px; border-left: 4px solid #16a34a;">
                        <p id="resA">Tezlanish: a = 2.00 m/s²</p>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button id="nStart" onclick="runNewtonExperiment()" class="btn" style="flex:1; background:#16a34a;">Start</button>
                        <button onclick="updateNewton()" class="btn btn-outline" style="flex:1;">Reset</button>
                    </div>
                </div>
                <div style="flex: 2; min-width: 300px; background: #334155; border-radius: 10px; position: relative; height: 250px; overflow: hidden;">
                    <div style="position: absolute; bottom: 50px; width: 100%; height: 2px; background: white; border-style: dashed; opacity: 0.3;"></div>
                    <div id="box" style="position: absolute; bottom: 52px; left: 10px; width: 50px; height: 50px; background: #22c55e; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white;">m</div>
                    <div id="forceArrow" style="position: absolute; bottom: 77px; left: 65px; color: #fbbf24;"><i class="fas fa-arrow-right"></i> F</div>
                </div>
            </div>
        </div>
    `;
    updateNewton();
}

function updateNewton() {
    clearInterval(newtonInterval);
    const m = document.getElementById('massM').value;
    const f = document.getElementById('forceF').value;
    document.getElementById('m_val').innerText = m;
    document.getElementById('f_val').innerText = f;
    document.getElementById('resA').innerText = `Tezlanish: a = ${(f / m).toFixed(2)} m/s²`;
    document.getElementById('box').style.left = "10px";
    document.getElementById('forceArrow').style.left = "65px";
    document.getElementById('nStart').disabled = false;
}

function runNewtonExperiment() {
    const box = document.getElementById('box');
    const arrow = document.getElementById('forceArrow');
    const a = document.getElementById('forceF').value / document.getElementById('massM').value;
    document.getElementById('nStart').disabled = true;
    let posX = 10; let v = 0;
    newtonInterval = setInterval(() => {
        v += a * 0.1; posX += v;
        box.style.left = posX + "px";
        arrow.style.left = (posX + 55) + "px";
        if (posX > 600) clearInterval(newtonInterval);
    }, 30);
}
