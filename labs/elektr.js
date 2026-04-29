// ==========================================
// ELEKTR VA MAGNETIZM LABORATORIYALARI
// ==========================================

// 1. ZANJIR QISMI UCHUN OM QONUNI (I = U/R)
function initOhmLaw() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #facc15;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline"><i class="fas fa-arrow-left"></i> Orqaga</button>
                <h3><i class="fas fa-bolt"></i> Om qonuni laboratoriyasi</h3>
                <span></span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 250px; background: #fefce8; padding: 20px; border-radius: 10px;">
                    <label>Kuchlanish (U): <b id="u_val">12</b> V</label>
                    <input type="range" id="voltsU" min="1" max="50" step="1" value="12" style="width:100%" oninput="updateOhm()">
                    
                    <label style="margin-top:15px; display:block;">Qarshilik (R): <b id="r_val">10</b> Ω</label>
                    <input type="range" id="resR" min="1" max="100" step="1" value="10" style="width:100%" oninput="updateOhm()">
                    
                    <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #facc15;">
                        <p id="resI" style="font-weight:bold; font-size: 1.1rem; color: #854d0e;">Tok kuchi: I = 1.20 A</p>
                    </div>
                    <button onclick="recordOhm()" class="btn" style="width:100%; margin-top:20px; background:#facc15; color:#854d0e; font-weight:bold;">Natijani saqlash</button>
                </div>
                <div style="flex: 2; min-width: 300px; background: #1e293b; border-radius: 10px; display: flex; flex-direction: column; justify-content: center; align-items: center; color: white; position: relative;">
                    <div style="width: 200px; height: 100px; border: 3px solid #facc15; border-radius: 5px; display: flex; align-items: center; justify-content: center; position: relative;">
                         <span style="background: #1e293b; padding: 0 10px;">R = <span id="diag_r">10</span> Ω</span>
                         <div style="position: absolute; bottom: -50px; left: 50%; transform: translateX(-50%);">
                            <i class="fas fa-battery-full" style="font-size: 2rem;"></i>
                            <p style="text-align: center;">U = <span id="diag_u">12</span>V</p>
                         </div>
                    </div>
                    <p id="flow_speed" style="margin-top: 70px; color: #facc15;">Elektronlar oqimi...</p>
                </div>
            </div>
        </div>
    `;
    updateOhm();
}

function updateOhm() {
    const u = document.getElementById('voltsU').value;
    const r = document.getElementById('resR').value;
    const i = (u / r).toFixed(2);
    
    document.getElementById('u_val').innerText = u;
    document.getElementById('r_val').innerText = r;
    document.getElementById('diag_u').innerText = u;
    document.getElementById('diag_r').innerText = r;
    document.getElementById('resI').innerText = `Tok kuchi: I = ${i} A`;
}

function recordOhm() {
    const u = document.getElementById('voltsU').value;
    const r = document.getElementById('resR').value;
    const i = (u / r).toFixed(2);
    saveResult(`Om qonuni: U=${u}V, R=${r}Ω, I=${i}A`);
}

// 2. QARSHILIKLARNI KETMA-KET ULASH
function initSeries() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #3b82f6;">
            <h3>Ketma-ket ulanish (R = R₁ + R₂)</h3>
            <div style="display: flex; gap: 20px; margin-top: 20px;">
                <div style="flex: 1; background: #eff6ff; padding: 20px; border-radius: 10px;">
                    <label>R₁: <b id="r1_val">10</b> Ω</label>
                    <input type="range" id="r1" min="1" max="50" value="10" style="width:100%" oninput="updateSeries()">
                    <label>R₂: <b id="r2_val">20</b> Ω</label>
                    <input type="range" id="r2" min="1" max="50" value="20" style="width:100%" oninput="updateSeries()">
                    <p id="totalR_series" style="margin-top: 15px; font-weight:bold;">Umumiy R: 30 Ω</p>
                    <button onclick="recordSeries()" class="btn" style="width:100%; margin-top:10px; background:#3b82f6; color:white;">Saqlash</button>
                    <button onclick="renderLabs()" class="btn btn-outline" style="width:100%; margin-top:5px;">Orqaga</button>
                </div>
                <div style="flex: 2; background: white; border: 2px dashed #3b82f6; border-radius: 10px; display: flex; align-items: center; justify-content: center; gap: 0;">
                    <div style="width: 60px; height: 30px; border: 2px solid #3b82f6; text-align: center;">R₁</div>
                    <div style="width: 40px; height: 2px; background: #3b82f6;"></div>
                    <div style="width: 60px; height: 30px; border: 2px solid #3b82f6; text-align: center;">R₂</div>
                </div>
            </div>
        </div>
    `;
    updateSeries();
}

function updateSeries() {
    const r1 = parseInt(document.getElementById('r1').value);
    const r2 = parseInt(document.getElementById('r2').value);
    document.getElementById('r1_val').innerText = r1;
    document.getElementById('r2_val').innerText = r2;
    document.getElementById('totalR_series').innerText = `Umumiy R: ${r1 + r2} Ω`;
}

function recordSeries() {
    const r1 = document.getElementById('r1').value;
    const r2 = document.getElementById('r2').value;
    saveResult(`Ketma-ket: R₁=${r1}Ω, R₂=${r2}Ω, R_umumiy=${Number(r1)+Number(r2)}Ω`);
}

// 3. QARSHILIKLARNI PARALLEL ULASH
function initParallel() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #ec4899;">
            <h3>Parallel ulanish (1/R = 1/R₁ + 1/R₂)</h3>
            <div style="display: flex; gap: 20px; margin-top: 20px;">
                <div style="flex: 1; background: #fdf2f8; padding: 20px; border-radius: 10px;">
                    <label>R₁: <b id="p1_val">10</b> Ω</label>
                    <input type="range" id="p1" min="1" max="50" value="10" style="width:100%" oninput="updateParallel()">
                    <label>R₂: <b id="p2_val">10</b> Ω</label>
                    <input type="range" id="p2" min="1" max="50" value="10" style="width:100%" oninput="updateParallel()">
                    <p id="totalR_parallel" style="margin-top: 15px; font-weight:bold;">Umumiy R: 5.00 Ω</p>
                    <button onclick="recordParallel()" class="btn" style="width:100%; margin-top:10px; background:#ec4899; color:white;">Saqlash</button>
                    <button onclick="renderLabs()" class="btn btn-outline" style="width:100%; margin-top:5px;">Orqaga</button>
                </div>
                <div style="flex: 2; background: white; border: 2px dashed #ec4899; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px;">
                    <div style="width: 60px; height: 30px; border: 2px solid #ec4899; text-align: center;">R₁</div>
                    <div style="width: 60px; height: 30px; border: 2px solid #ec4899; text-align: center;">R₂</div>
                </div>
            </div>
        </div>
    `;
}

function updateParallel() {
    const r1 = parseFloat(document.getElementById('p1').value);
    const r2 = parseFloat(document.getElementById('p2').value);
    const rTotal = (r1 * r2) / (r1 + r2);
    document.getElementById('p1_val').innerText = r1;
    document.getElementById('p2_val').innerText = r2;
    document.getElementById('totalR_parallel').innerText = `Umumiy R: ${rTotal.toFixed(2)} Ω`;
}

function recordParallel() {
    const r1 = document.getElementById('p1').value;
    const r2 = document.getElementById('p2').value;
    const rTotal = (r1 * r2) / (Number(r1) + Number(r2));
    saveResult(`Parallel: R₁=${r1}Ω, R₂=${r2}Ω, R_umumiy=${rTotal.toFixed(2)}Ω`);
}
