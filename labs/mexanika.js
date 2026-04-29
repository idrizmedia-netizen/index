// ==========================================
// YORDAMCHI FUNKSIYALAR (NATIJALARNI SAQLASH)
// ==========================================
function saveResult(text) {
    const list = document.getElementById('results-list');
    if (!list) return;
    
    // "Hali natija yo'q" yozuvini o'chirish
    if (list.querySelector('p')) {
        list.innerHTML = '';
    }

    const entry = document.createElement('div');
    entry.className = "result-item"; // index.html dagi CSS dan foydalanadi
    entry.style = "background: white; padding: 10px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 0.85rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); margin-bottom: 5px; animation: slideIn 0.3s ease;";
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    entry.innerHTML = `<i class="fas fa-check-circle" style="color: #22c55e;"></i> <strong>${time}</strong>: ${text}`;
    
    list.prepend(entry);
}

// ==========================================
// 1. MATEMATIK MAYATNIK (MUKAMMAL)
// ==========================================
let pendulumInterval;
let isPendulumRunning = false;

function initPendulum() {
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #2563eb;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline"><i class="fas fa-arrow-left"></i> Orqaga</button>
                <h3><i class="fas fa-microscope"></i> Matematik mayatnik tebranishi</h3>
                <span></span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 250px; background: #f8fafc; padding: 20px; border-radius: 10px;">
                    <label><i class="fas fa-ruler-vertical"></i> Ip uzunligi (L): <b id="l_val">1.0</b> m</label>
                    <input type="range" id="lengthL" min="0.5" max="3" step="0.1" value="1" style="width:100%" oninput="updatePendulum()">
                    
                    <label style="margin-top:15px; display:block;"><i class="fas fa-compress-arrows-alt"></i> Burchak (α): <b id="a_val">30</b>°</label>
                    <input type="range" id="angleA" min="5" max="60" step="5" value="30" style="width:100%" oninput="updatePendulum()">
                    
                    <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #2563eb; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">
                        <p id="resT" style="margin: 5px 0;">Davr: T = 2.01 s</p>
                        <p id="resF" style="margin: 5px 0;">Chastota: ν = 0.50 Hz</p>
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button id="pStart" onclick="startPendulum()" class="btn" style="flex:1; background: #2563eb; color:white;">Start</button>
                        <button onclick="resetPendulum()" class="btn btn-outline" style="flex:1;">Reset</button>
                    </div>
                </div>
                <div style="flex: 1; min-width: 300px; background: #ffffff; border-radius: 10px; border: 1px solid #e2e8f0; display: flex; justify-content: center; align-items: center; background-image: radial-gradient(#e2e8f0 1px, transparent 1px); background-size: 20px 20px;">
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
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const originX = canvas.width / 2;
    const originY = 30;
    const length = L * 70;
    const angle = A * Math.PI / 180;
    const endX = originX + length * Math.sin(angle);
    const endY = originY + length * Math.cos(angle);
    
    // Ip
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.lineTo(endX, endY);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#94a3b8"; 
    ctx.stroke();

    // Yuk (Shar)
    const grad = ctx.createRadialGradient(endX-5, endY-5, 2, endX, endY, 15);
    grad.addColorStop(0, '#60a5fa');
    grad.addColorStop(1, '#2563eb');
    
    ctx.beginPath(); 
    ctx.arc(endX, endY, 15, 0, Math.PI * 2);
    ctx.fillStyle = grad; 
    ctx.fill();
    ctx.strokeStyle = "#1e40af";
    ctx.stroke();
}

function startPendulum() {
    if (isPendulumRunning) return;
    isPendulumRunning = true;
    document.getElementById('pStart').disabled = true;
    const canvas = document.getElementById('pendulumCanvas');
    const ctx = canvas.getContext('2d');
    let time = 0;
    
    const L = document.getElementById('lengthL').value;
    const A = document.getElementById('angleA').value;
    const T = (2 * Math.PI * Math.sqrt(L / 9.81)).toFixed(2);

    saveResult(`Mayatnik boshlandi: L=${L}m, α=${A}°`);

    pendulumInterval = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const originX = canvas.width / 2;
        const originY = 30;
        const angle = (A * Math.PI / 180) * Math.cos(time);
        const endX = originX + (L * 70) * Math.sin(angle);
        const endY = originY + (L * 70) * Math.cos(angle);
        
        ctx.beginPath(); ctx.moveTo(originX, originY); ctx.lineTo(endX, endY);
        ctx.strokeStyle = "#475569"; ctx.stroke();
        
        ctx.beginPath(); ctx.arc(endX, endY, 15, 0, Math.PI * 2);
        ctx.fillStyle = "#2563eb"; ctx.fill();
        
        time += 0.08 / Math.sqrt(L);
    }, 20);
}

function resetPendulum() {
    clearInterval(pendulumInterval);
    isPendulumRunning = false;
    if(document.getElementById('pStart')) document.getElementById('pStart').disabled = false;
    updatePendulum();
}

// ==========================================
// 2. ERKIN TUSHISH (BALANDLIK BILAN)
// ==========================================
let fallTimer;
function initFreeFall() {
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #e11d48;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline">Orqaga</button>
                <h3><i class="fas fa-meteor"></i> Erkin tushish laboratoriyasi</h3>
                <span></span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">
                <div style="flex: 1; min-width: 250px; background: #fff1f2; padding: 20px; border-radius: 10px;">
                    <label><i class="fas fa-arrows-alt-v"></i> Balandlik (h): <b id="h_val">20</b> m</label>
                    <input type="range" id="heightH" min="10" max="100" step="5" value="20" style="width:100%" oninput="updateFall()">
                    
                    <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #e11d48; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                        <p id="resFallTime">Kutilayotgan vaqt: 2.02 s</p>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button id="fStart" onclick="startFalling()" class="btn" style="background:#e11d48; color:white; flex:1;">Tashlash</button>
                        <button onclick="updateFall()" class="btn btn-outline" style="flex:1;">Reset</button>
                    </div>
                </div>
                <div style="flex: 1; background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; height: 350px; position: relative; overflow: hidden; background-image: linear-gradient(#e2e8f0 1px, transparent 1px); background-size: 100% 50px;">
                    <div id="fallBall" style="position: absolute; left: 50%; transform: translateX(-50%); top: 10px; width: 30px; height: 30px; background: radial-gradient(circle at 10px 10px, #fb7185, #e11d48); border-radius: 50%; box-shadow: 0 4px 10px rgba(225, 29, 72, 0.3);"></div>
                    <div style="position: absolute; bottom: 0; width: 100%; height: 10px; background: #475569; border-top: 3px solid #1e293b;"></div>
                    <p id="liveTimer" style="position: absolute; top: 10px; right: 10px; font-weight: bold; color: #e11d48; background: white; padding: 5px 10px; border-radius: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">0.00s</p>
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
    const maxPx = 300; 

    fallTimer = setInterval(() => {
        let elapsed = (Date.now() - startTime) / 1000;
        let currentY = (0.5 * g * elapsed * elapsed);
        
        let movePx = (currentY / h) * maxPx;
        ball.style.top = (10 + movePx) + "px";
        timerText.innerText = elapsed.toFixed(2) + "s";

        if (currentY >= h) {
            clearInterval(fallTimer);
            const finalT = Math.sqrt((2 * h) / g).toFixed(2);
            ball.style.top = (10 + maxPx) + "px";
            timerText.innerText = finalT + "s (Bax!)";
            saveResult(`Erkin tushish: h=${h}m, t=${finalT}s da urildi.`);
        }
    }, 20);
}

// ==========================================
// 3. NYUTON 2-QONUNI (DINAMIKA)
// ==========================================
let newtonInterval;
function initNewtonTwo() {
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #16a34a;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline">Orqaga</button>
                <h3><i class="fas fa-truck-moving"></i> Nyuton 2-qonuni (F = m · a)</h3>
                <span></span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 250px; text-align: left; background: #f0fdf4; padding: 20px; border-radius: 10px;">
                    <label><i class="fas fa-weight-hanging"></i> Massa (m): <b id="m_val">5</b> kg</label>
                    <input type="range" id="massM" min="1" max="20" step="1" value="5" style="width:100%" oninput="updateNewton()">
                    
                    <label style="margin-top:15px; display:block;"><i class="fas fa-arrow-right"></i> Kuch (F): <b id="f_val">10</b> N</label>
                    <input type="range" id="forceF" min="1" max="50" step="1" value="10" style="width:100%" oninput="updateNewton()">
                    
                    <div style="margin-top: 20px; padding: 10px; background: white; border-radius: 8px; border-left: 4px solid #16a34a; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        <p id="resA" style="font-weight:bold;">Tezlanish: a = 2.00 m/s²</p>
                    </div>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button id="nStart" onclick="runNewtonExperiment()" class="btn" style="flex:1; background:#16a34a; color:white;">Boshlash</button>
                        <button onclick="updateNewton()" class="btn btn-outline" style="flex:1;">Reset</button>
                    </div>
                </div>
                <div style="flex: 2; min-width: 300px; background: #1e293b; border-radius: 10px; position: relative; height: 250px; overflow: hidden; border: 4px solid #334155;">
                    <div style="position: absolute; bottom: 50px; width: 100%; height: 4px; background: #475569;"></div>
                    <div id="box" style="position: absolute; bottom: 54px; left: 10px; width: 60px; height: 40px; background: #22c55e; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; box-shadow: 0 4px 0 #15803d;">m</div>
                    <div id="forceArrow" style="position: absolute; bottom: 65px; left: 75px; color: #fbbf24; font-weight: bold; transition: 0.1s;">
                        <i class="fas fa-long-arrow-alt-right" style="font-size: 2rem;"></i> F
                    </div>
                    <p style="position: absolute; bottom: 10px; width: 100%; text-align: center; color: #94a3b8; font-size: 0.8rem;">Silliq gorizontal sirt (ishqalanishsiz)</p>
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
    document.getElementById('forceArrow').style.left = "75px";
    document.getElementById('nStart').disabled = false;
}

function runNewtonExperiment() {
    const box = document.getElementById('box');
    const arrow = document.getElementById('forceArrow');
    const f = document.getElementById('forceF').value;
    const m = document.getElementById('massM').value;
    const a = f / m;
    
    document.getElementById('nStart').disabled = true;
    let posX = 10; let v = 0; let dt = 0.1;

    saveResult(`Dinamika: F=${f}N, m=${m}kg, a=${a.toFixed(2)}m/s²`);

    newtonInterval = setInterval(() => {
        v += a * dt; 
        posX += v;
        box.style.left = posX + "px";
        arrow.style.left = (posX + 65) + "px";
        
        if (posX > 550) {
            clearInterval(newtonInterval);
            arrow.style.opacity = "0";
        }
    }, 30);
}
