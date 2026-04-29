// ==========================================
// 1. MATEMATIK MAYATNIK
// ==========================================
let pendulumInterval;
function initPendulum() {
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; text-align: center;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline" style="padding: 5px 15px;"> <i class="fas fa-arrow-left"></i> Orqaga</button>
                <h3>Matematik mayatnik tebranishi</h3>
                <span></span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">
                <div style="flex: 1; min-width: 250px; text-align: left; background: #f8fafc; padding: 20px; border-radius: 10px;">
                    <label>Ip uzunligi (m): <b id="l_val">1.0</b></label>
                    <input type="range" id="lengthL" min="0.5" max="3" step="0.1" value="1" style="width:100%" oninput="updatePendulum()">
                    <label style="margin-top:15px; display:block;">Boshlang'ich burchak: <b id="a_val">30</b>°</label>
                    <input type="range" id="angleA" min="5" max="60" step="5" value="30" style="width:100%" oninput="updatePendulum()">
                    <div style="margin-top: 20px; padding: 10px; background: white; border-radius: 8px; border-left: 4px solid #2563eb;">
                        <p id="resT" style="margin: 5px 0;">Davr: T = 2.01 s</p>
                        <p id="resF" style="margin: 5px 0;">Chastota: ν = 0.50 Hz</p>
                    </div>
                </div>
                <div style="flex: 1; min-width: 300px; background: white; border-radius: 10px; border: 1px solid #e2e8f0;">
                    <canvas id="pendulumCanvas" width="300" height="300"></canvas>
                </div>
            </div>
        </div>
    `;
    startPendulumAnimation();
}

function updatePendulum() {
    const L = document.getElementById('lengthL').value;
    const A = document.getElementById('angleA').value;
    document.getElementById('l_val').innerText = L;
    document.getElementById('a_val').innerText = A;
    const T = (2 * Math.PI * Math.sqrt(L / 9.81)).toFixed(2);
    document.getElementById('resT').innerText = `Davr: T = ${T} s`;
    document.getElementById('resF').innerText = `Chastota: ν = ${(1/T).toFixed(2)} Hz`;
}

function startPendulumAnimation() {
    const canvas = document.getElementById('pendulumCanvas');
    const ctx = canvas.getContext('2d');
    let time = 0;
    if (pendulumInterval) clearInterval(pendulumInterval);
    pendulumInterval = setInterval(() => {
        const L_val = document.getElementById('lengthL').value;
        const A_val = document.getElementById('angleA').value;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const originX = canvas.width / 2;
        const originY = 50;
        const length = L_val * 70;
        const angle = (A_val * Math.PI / 180) * Math.cos(time);
        const endX = originX + length * Math.sin(angle);
        const endY = originY + length * Math.cos(angle);
        ctx.beginPath();
        ctx.moveTo(originX, originY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(endX, endY, 15, 0, Math.PI * 2);
        ctx.fillStyle = "#2563eb";
        ctx.fill();
        time += 0.05 / Math.sqrt(L_val);
    }, 20);
}

// ==========================================
// 2. ERKIN TUSHISH
// ==========================================
function initFreeFall() {
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; text-align: center;">
             <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline" style="padding: 5px 15px;">Orqaga</button>
                <h3>Erkin tushish dinamikasi</h3>
                <span></span>
            </div>
            <div style="background: #f1f5f9; padding: 20px; border-radius: 15px; display: flex; flex-direction: column; align-items: center;">
                <canvas id="fallCanvas" width="100" height="300" style="background: white; border: 1px solid #cbd5e1;"></canvas>
                <div style="margin-top: 20px;">
                    <button onclick="startFalling()" class="btn">Tashlab yuborish</button>
                    <p id="fallInfo" style="margin-top: 10px; font-weight: bold;">Vaqt: 0.00 s</p>
                </div>
            </div>
        </div>
    `;
}

function startFalling() {
    const canvas = document.getElementById('fallCanvas');
    const ctx = canvas.getContext('2d');
    const info = document.getElementById('fallInfo');
    let y = 20; let v = 0; let t = 0; const g = 0.5;
    const fallTimer = setInterval(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(50, y, 10, 0, Math.PI * 2);
        ctx.fillStyle = "#e11d48";
        ctx.fill();
        v += g; y += v; t += 0.1;
        info.innerText = `Vaqt: ${t.toFixed(2)} s`;
        if (y > canvas.height - 15) {
            clearInterval(fallTimer);
            info.innerText += " (Yerga tushdi!)";
        }
    }, 30);
}

// ==========================================
// 3. NYUTON 2-QONUNI (YANGI QO'SHILDI)
// ==========================================
let newtonInterval;
function initNewtonTwo() {
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; text-align: center;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline" style="padding: 5px 15px;">Orqaga</button>
                <h3>Nyuton 2-qonuni (F = m * a)</h3>
                <span></span>
            </div>
            
            <div style="display: flex; flex-wrap: wrap; gap: 20px; justify-content: center;">
                <div style="flex: 1; min-width: 250px; text-align: left; background: #f0fdf4; padding: 20px; border-radius: 10px;">
                    <label>Jism massasi (kg): <b id="m_val">5</b></label>
                    <input type="range" id="massM" min="1" max="20" step="1" value="5" style="width:100%" oninput="updateNewton()">
                    
                    <label style="margin-top:15px; display:block;">Ta'sir etuvchi kuch (N): <b id="f_val">10</b></label>
                    <input type="range" id="forceF" min="1" max="50" step="1" value="10" style="width:100%" oninput="updateNewton()">
                    
                    <div style="margin-top: 20px; padding: 10px; background: white; border-radius: 8px; border-left: 4px solid #16a34a;">
                        <p id="resA" style="margin: 5px 0; font-weight: bold;">Tezlanish: a = 2.00 m/s²</p>
                    </div>
                    <button onclick="runNewtonExperiment()" class="btn" style="width:100%; margin-top:15px; background:#16a34a;">Harakatni boshlash</button>
                </div>

                <div style="flex: 2; min-width: 300px; background: #334155; border-radius: 10px; position: relative; overflow: hidden; height: 250px;">
                    <div id="road" style="position: absolute; bottom: 50px; width: 100%; height: 2px; background: white; border-style: dashed;"></div>
                    <div id="box" style="position: absolute; bottom: 52px; left: 10px; width: 50px; height: 50px; background: #22c55e; border: 2px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">m</div>
                    <div id="forceArrow" style="position: absolute; bottom: 77px; left: 65px; color: #fbbf24; font-size: 24px;"> <i class="fas fa-arrow-right"></i> <span style="font-size: 14px;">F</span></div>
                </div>
            </div>
        </div>
    `;
}

function updateNewton() {
    const m = document.getElementById('massM').value;
    const f = document.getElementById('forceF').value;
    document.getElementById('m_val').innerText = m;
    document.getElementById('f_val').innerText = f;
    const a = (f / m).toFixed(2);
    document.getElementById('resA').innerText = `Tezlanish: a = ${a} m/s²`;
    
    // Boxni joyiga qaytarish
    const box = document.getElementById('box');
    box.style.left = "10px";
    const arrow = document.getElementById('forceArrow');
    arrow.style.left = "65px";
}

function runNewtonExperiment() {
    const box = document.getElementById('box');
    const arrow = document.getElementById('forceArrow');
    const m = document.getElementById('massM').value;
    const f = document.getElementById('forceF').value;
    const a = f / m;
    
    let posX = 10;
    let velocity = 0;
    
    if (newtonInterval) clearInterval(newtonInterval);
    
    newtonInterval = setInterval(() => {
        velocity += a * 0.1; 
        posX += velocity;
        
        box.style.left = posX + "px";
        arrow.style.left = (posX + 55) + "px";
        
        if (posX > 500) {
            clearInterval(newtonInterval);
        }
    }, 30);
}
