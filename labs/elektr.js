// ==========================================
// ELEKTR VA MAGNETIZM LABORATORIYALARI (V3.0)
// ==========================================

// 1. OM QONUNI (Zanjir qismi)
function initOhmCircuit() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #facc15; background: #fafafa;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline"><i class="fas fa-arrow-left"></i> Chiqish</button>
                <h3><i class="fas fa-bolt"></i> Zanjir qismi uchun Om qonuni</h3>
                <div style="font-family: 'Courier New', monospace; background: #334155; color: #fbbf24; padding: 5px 15px; border-radius: 5px;">I = U / R</div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 300px; background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                    <div style="margin-bottom: 20px;">
                        <label>Manba kuchlanishi (U): <b id="u_val" style="color:#e11d48">12</b> V</label>
                        <input type="range" id="voltsU" min="0" max="100" step="1" value="12" style="width:100%" oninput="updateOhm()">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label>Iste'molchi qarshiligi (R): <b id="r_val" style="color:#2563eb">10</b> Ω</label>
                        <input type="range" id="resR" min="1" max="100" step="1" value="10" style="width:100%" oninput="updateOhm()">
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 20px;">
                        <div style="background: #f8fafc; padding: 10px; border-radius: 10px; border-left: 4px solid #e11d48;">
                            <small>Voltmetr:</small>
                            <div id="disp_u" style="font-size: 1.2rem; font-weight: bold;">12.0 V</div>
                        </div>
                        <div style="background: #f8fafc; padding: 10px; border-radius: 10px; border-left: 4px solid #10b981;">
                            <small>Ampermetr:</small>
                            <div id="disp_i" style="font-size: 1.2rem; font-weight: bold;">1.20 A</div>
                        </div>
                    </div>
                    <button onclick="recordOhm()" class="btn" style="width:100%; margin-top:20px; background:#facc15; color:#854d0e; font-weight:bold; height: 50px;">O'lchovni yozib olish</button>
                </div>
                <div style="flex: 2; min-width: 350px; background: #0f172a; border-radius: 20px; position: relative; overflow: hidden; min-height: 350px;">
                    <canvas id="ohmCanvas" width="500" height="350" style="width: 100%;"></canvas>
                </div>
            </div>
        </div>
    `;
    updateOhm();
}

function updateOhm() {
    const u = parseFloat(document.getElementById('voltsU').value);
    const r = parseFloat(document.getElementById('resR').value);
    const i = r > 0 ? (u / r).toFixed(2) : 0;
    
    document.getElementById('u_val').innerText = u;
    document.getElementById('r_val').innerText = r;
    document.getElementById('disp_u').innerText = u.toFixed(1) + " V";
    document.getElementById('disp_i').innerText = i + " A";

    const canvas = document.getElementById('ohmCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Zanjir simlari (Glow effect)
    ctx.strokeStyle = "#334155"; ctx.lineWidth = 6;
    ctx.strokeRect(centerX - 120, centerY - 80, 240, 160);

    // Rezistor (R)
    ctx.fillStyle = "#1e293b"; ctx.fillRect(centerX - 40, centerY - 95, 80, 30);
    ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 3; ctx.strokeRect(centerX - 40, centerY - 95, 80, 30);
    ctx.fillStyle = "white"; ctx.font = "bold 14px Arial"; ctx.fillText(`R = ${r}Ω`, centerX - 25, centerY - 75);

    // Manba (U)
    ctx.fillStyle = "#1e293b"; ctx.fillRect(centerX - 30, centerY + 65, 60, 30);
    ctx.strokeStyle = "#e11d48"; ctx.strokeRect(centerX - 30, centerY + 65, 60, 30);
    ctx.fillStyle = "white"; ctx.fillText(`${u}V`, centerX - 15, centerY + 85);

    // Ampermetr vizuali
    ctx.beginPath(); ctx.arc(centerX + 120, centerY, 20, 0, Math.PI*2);
    ctx.fillStyle = "#10b981"; ctx.fill(); ctx.fillStyle="white"; ctx.fillText("A", centerX + 115, centerY + 5);

    // ELEKTRONLAR OQIMI ANIMATSIYASI
    if (i > 0) {
        const time = Date.now() * 0.005 * i;
        ctx.fillStyle = "#facc15";
        ctx.shadowBlur = 10; ctx.shadowColor = "#facc15";
        for (let j = 0; j < 12; j++) {
            let pos = (time + j * 50) % 800; // Zanjir perimetri bo'ylab
            // Sodda kvadratik harakat
            let x, y;
            if (pos < 240) { x = centerX - 120 + pos; y = centerY - 80; }
            else if (pos < 400) { x = centerX + 120; y = centerY - 80 + (pos - 240); }
            else if (pos < 640) { x = centerX + 120 - (pos - 400); y = centerY + 80; }
            else { x = centerX - 120; y = centerY + 80 - (pos - 640); }
            ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI*2); ctx.fill();
        }
    }
    ctx.shadowBlur = 0;
    
    // So'rov bo'yicha keyingi kadrni yangilash (faqat animatsiya uchun)
    if(window.location.hash === "#lab") requestAnimationFrame(updateOhm);
}

// 2. QARSHILIKLARNI ULASH (Ketma-ket va Parallel bittada)
function initResistors() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #3b82f6;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline">Orqaga</button>
                <h3><i class="fas fa-microchip"></i> Qarshiliklarni guruhlash</h3>
                <select id="connType" class="btn btn-outline" onchange="updateResCalc()">
                    <option value="series">Ketma-ket ulanish</option>
                    <option value="parallel">Parallel ulanish</option>
                </select>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 280px; background: #eff6ff; padding: 20px; border-radius: 15px;">
                    <label>R₁ qarshilik: <b id="r1_val">20</b> Ω</label>
                    <input type="range" id="res1" min="1" max="100" value="20" style="width:100%" oninput="updateResCalc()">
                    
                    <label style="margin-top:15px; display:block;">R₂ qarshilik: <b id="r2_val">30</b> Ω</label>
                    <input type="range" id="res2" min="1" max="100" value="30" style="width:100%" oninput="updateResCalc()">
                    
                    <div style="margin-top:20px; background:white; padding:15px; border-radius:10px; border: 2px solid #3b82f6;">
                        <span id="formula_text" style="font-size:0.8rem; color:#64748b;">Formula: R = R₁ + R₂</span>
                        <h2 id="resTotal" style="margin:5px 0; color:#1e40af;">50.0 Ω</h2>
                    </div>
                    <button onclick="recordRes()" class="btn" style="width:100%; margin-top:15px; background:#3b82f6; color:white;">Natijani saqlash</button>
                </div>
                <div style="flex: 2; background: white; border-radius: 15px; border: 2px dashed #bfdbfe; display: flex; justify-content: center; align-items: center; min-height:250px;">
                    <canvas id="resCanvas" width="400" height="200"></canvas>
                </div>
            </div>
        </div>
    `;
    updateResCalc();
}

function updateResCalc() {
    const type = document.getElementById('connType').value;
    const r1 = parseFloat(document.getElementById('res1').value);
    const r2 = parseFloat(document.getElementById('res2').value);
    let total;

    if(type === 'series') {
        total = r1 + r2;
        document.getElementById('formula_text').innerText = "Formula: R_umumiy = R₁ + R₂";
    } else {
        total = (r1 * r2) / (r1 + r2);
        document.getElementById('formula_text').innerText = "Formula: 1/R = 1/R₁ + 1/R₂";
    }

    document.getElementById('r1_val').innerText = r1;
    document.getElementById('r2_val').innerText = r2;
    document.getElementById('resTotal').innerText = total.toFixed(1) + " Ω";

    // Vizuallash
    const canvas = document.getElementById('resCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#3b82f6"; ctx.lineWidth = 3;

    if(type === 'series') {
        ctx.beginPath();
        ctx.moveTo(50, 100); ctx.lineTo(120, 100); // Sim
        ctx.strokeRect(120, 80, 70, 40); ctx.fillText("R1", 145, 105); // R1
        ctx.moveTo(190, 100); ctx.lineTo(230, 100); // Sim
        ctx.strokeRect(230, 80, 70, 40); ctx.fillText("R2", 255, 105); // R2
        ctx.lineTo(350, 100); ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.moveTo(50, 100); ctx.lineTo(100, 100); 
        ctx.lineTo(100, 60); ctx.lineTo(130, 60); ctx.strokeRect(130, 40, 70, 40); ctx.fillText("R1", 155, 65);
        ctx.moveTo(100, 100); ctx.lineTo(100, 140); ctx.lineTo(130, 140); ctx.strokeRect(130, 120, 70, 40); ctx.fillText("R2", 155, 145);
        ctx.moveTo(200, 60); ctx.lineTo(230, 60); ctx.lineTo(230, 100); ctx.lineTo(350, 100);
        ctx.moveTo(200, 140); ctx.lineTo(230, 140); ctx.lineTo(230, 100); ctx.stroke();
    }
}

// 3. KONDENSATOR VA ELEKTR SIG'IMI
function initCapacitor() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #ec4899;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline">Orqaga</button>
                <h3><i class="fas fa-battery-half"></i> Kondensator sig'imi (C = εε₀S / d)</h3>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 280px; background: #fdf2f8; padding: 20px; border-radius: 15px;">
                    <label>Plastina yuzasi (S): <b id="s_val">100</b> cm²</label>
                    <input type="range" id="capS" min="10" max="500" value="100" style="width:100%" oninput="updateCap()">
                    
                    <label style="margin-top:15px; display:block;">Masofa (d): <b id="d_val">5</b> mm</label>
                    <input type="range" id="capD" min="1" max="20" value="5" style="width:100%" oninput="updateCap()">
                    
                    <div style="margin-top:20px; background:white; padding:15px; border-radius:10px; border-left: 5px solid #ec4899;">
                        <p id="capRes" style="font-weight:bold; color:#be185d; font-size:1.1rem;">Sig'im: C = 17.7 pF</p>
                    </div>
                    <button onclick="recordCap()" class="btn" style="width:100%; margin-top:15px; background:#ec4899; color:white;">Natijani saqlash</button>
                </div>
                <div style="flex: 2; background: #1e293b; border-radius: 15px; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <div id="plate1" style="width: 150px; height: 10px; background: #f472b6; border-radius: 2px; transition: 0.3s; box-shadow: 0 0 15px rgba(236,72,153,0.5);"></div>
                    <div id="dielectric" style="width: 150px; height: 50px; border-left: 2px dashed #475569; border-right: 2px dashed #475569; margin: 10px 0; color: #94a3b8; display: flex; align-items: center; justify-content: center; font-size: 0.8rem;">d = 5mm</div>
                    <div id="plate2" style="width: 150px; height: 10px; background: #f472b6; border-radius: 2px; transition: 0.3s; box-shadow: 0 0 15px rgba(236,72,153,0.5);"></div>
                </div>
            </div>
        </div>
    `;
    updateCap();
}

function updateCap() {
    const s = parseFloat(document.getElementById('capS').value);
    const d = parseFloat(document.getElementById('capD').value);
    const eps0 = 8.85; // 10^-12 F/m
    const cap = (eps0 * (s / 10000)) / (d / 1000) * 1000; // pF da
    
    document.getElementById('s_val').innerText = s;
    document.getElementById('d_val').innerText = d;
    document.getElementById('capRes').innerText = `Sig'im: C = ${cap.toFixed(2)} pF`;

    // Vizual o'zgarish
    const p1 = document.getElementById('plate1');
    const p2 = document.getElementById('plate2');
    const diel = document.getElementById('dielectric');
    
    p1.style.width = (100 + s/5) + "px";
    p2.style.width = (100 + s/5) + "px";
    diel.style.height = (d * 5) + "px";
    diel.innerText = `d = ${d}mm`;
}

// Yordamchi funksiyalar (Natijalarni saqlash uchun)
function recordOhm() {
    const u = document.getElementById('voltsU').value;
    const r = document.getElementById('resR').value;
    const i = (u / r).toFixed(2);
    saveResult(`Om qonuni: U=${u}V, R=${r}Ω, I=${i}A`);
}

function recordRes() {
    const rTotal = document.getElementById('resTotal').innerText;
    const type = document.getElementById('connType').value === 'series' ? 'Ketma-ket' : 'Parallel';
    saveResult(`${type} ulanish: Umumiy qarshilik = ${rTotal}`);
}

function recordCap() {
    const res = document.getElementById('capRes').innerText;
    saveResult(`Kondensator: ${res}`);
}

function saveResult(text) {
    const list = document.getElementById('results-list');
    if (list) {
        const li = document.createElement('li');
        li.style.padding = "8px";
        li.style.borderBottom = "1px solid #eee";
        li.innerHTML = `<i class="fas fa-check-circle" style="color: #10b981;"></i> ${text}`;
        list.prepend(li);
    }
}
