// ==========================================
// FIZIK PARADOKSLAR: YUQORI TEXNOLOGIK SIMULYATSIYALAR
// ==========================================

// 1. VAQT DILATATSIYASI (ID: 81 - initTimeDilation)
function initTimeDilation() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #6366f1; background: #020617; color: #f8fafc;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline" style="color:white; border-color:#334155;">Orqaga</button>
                <h3 style="color:#818cf8;"><i class="fas fa-rocket"></i> Relyativistik Vaqt (Lorents o'zgarishi)</h3>
                <div id="gamma_factor" style="font-family:monospace; background:#1e1b4b; color:#818cf8; padding:5px 15px; border:1px solid #4338ca; border-radius:5px;">γ = 1.00</div>
            </div>

            <div style="display: grid; grid-template-columns: 320px 1fr; gap: 20px;">
                <div style="background: #0f172a; padding: 20px; border-radius: 15px; border: 1px solid #1e293b;">
                    <label style="color:#94a3b8; font-size:0.8rem;">KEMA TEZLIGI (v):</label>
                    <div style="display:flex; align-items:center; gap:10px; margin:10px 0;">
                        <input type="range" id="v_rel" min="0" max="0.999" step="0.001" value="0.8" style="width:100%" oninput="updateRelUI()">
                        <b id="v_display" style="color:#6366f1;">0.80c</b>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top:20px;">
                        <div style="background:#1e293b; padding:15px; border-radius:10px; text-align:center; border:1px solid #334155;">
                            <small style="color:#94a3b8;">YERDAGI SOAT</small>
                            <h2 id="earth_clock" style="color:#38bdf8; font-family:monospace;">00:00</h2>
                        </div>
                        <div style="background:#1e293b; padding:15px; border-radius:10px; text-align:center; border:1px solid #4338ca;">
                            <small style="color:#94a3b8;">KEMADAGI SOAT</small>
                            <h2 id="ship_clock" style="color:#818cf8; font-family:monospace;">00:00</h2>
                        </div>
                    </div>

                    <div style="margin-top:20px; background:rgba(99,102,241,0.1); padding:15px; border-radius:10px; font-size:0.85rem;">
                        <p id="paradox_info" style="color:#cbd5e1;">Yerdagi egizak kemadagi egizakka qaraganda tezroq qariydi.</p>
                    </div>

                    <button onclick="toggleSpaceTrip()" id="trip_btn" class="btn" style="width:100%; margin-top:20px; background:#6366f1; color:white; border:none; box-shadow: 0 0 15px rgba(99,102,241,0.4);">PARVOZNI BOSHLASH</button>
                </div>

                <div style="background: black; border-radius: 15px; position: relative; height: 400px; overflow: hidden; border: 2px solid #1e293b;">
                    <canvas id="warpCanvas" style="position:absolute; width:100%; height:100%;"></canvas>
                    <div id="space_ship" style="position:absolute; left:10%; top:45%; font-size:3rem; color:#fff; text-shadow: 0 0 20px #6366f1;">
                        <i class="fas fa-rocket"></i>
                        <div style="position:absolute; left:-40px; top:15px; width:40px; height:10px; background:linear-gradient(to left, #6366f1, transparent); border-radius:50%; filter:blur(2px);"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    initWarpEffect();
    updateRelUI();
}

// 2. SHRYODINGER MUSHUGI (ID: 82 - initSchrodinger)
function initSchrodinger() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #1e293b; background: #f8fafc;">
            <div style="text-align:center; margin-bottom:30px;">
                <h3><i class="fas fa-microchip"></i> Kvant Superpozitsiyasi Paneli</h3>
                <p style="color:#64748b;">Kuzatuv amalga oshirilmaguncha mushuk 50% o'lik va 50% tirik holatda bo'ladi.</p>
            </div>

            <div style="display: flex; justify-content: center; gap: 40px; flex-wrap: wrap;">
                <div id="quantum_chamber" style="width:300px; height:350px; background:#1e293b; border-radius:20px; border:10px solid #334155; position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; cursor:pointer; transition:0.5s;" onclick="revealCat()">
                    <div id="blur_shield" style="position:absolute; width:100%; height:100%; background:rgba(56,189,248,0.2); backdrop-filter:blur(10px); border-radius:10px; z-index:2; display:flex; align-items:center; justify-content:center;">
                        <i class="fas fa-atom fa-spin" style="font-size:4rem; color:#38bdf8;"></i>
                    </div>
                    <i id="cat_state" class="fas fa-cat" style="font-size:6rem; color:white;"></i>
                    <div id="poison_gas" style="position:absolute; bottom:20px; font-size:2rem; color:#10b981;"><i class="fas fa-flask"></i></div>
                </div>

                <div style="width:320px;">
                    <div class="card" style="background:#111827; color:#10b981; font-family:monospace; border-left:4px solid #10b981;">
                        <p>> STATUS: <span id="sys_status">SUPERPOZITSIYA</span></p>
                        <p>> EHTIMOLLIK: <span id="prob">50/50</span></p>
                        <p id="wave_func">> Ψ(t): |Tirik⟩ + |O'lik⟩</p>
                    </div>
                    
                    <div style="margin-top:20px; padding:20px; background:white; border-radius:15px; box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);">
                        <h5>Laboratoriya jihozlari:</h5>
                        <ul style="font-size:0.85rem; color:#64748b; margin-top:10px;">
                            <li>Geyger hisoblagichi (Radioaktiv manba)</li>
                            <li>Sianid kislotasi kapsulasi</li>
                            <li>Kvant izolyatsiya qobig'i</li>
                        </ul>
                        <button onclick="initSchrodinger()" class="btn" style="width:100%; margin-top:15px; background:#1e293b; color:white;">TIZIMNI QAYTA YUKLASH</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 3. EGRI FAZO (ID: 83 - initCurvedSpace)
function initCurvedSpace() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #ec4899; background: #000; color: white;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h3><i class="fas fa-infinity"></i> Umumiy Nisbiylik: Fazoning egilishi</h3>
                <span id="mass_info" style="color:#ec4899;">Massa: Qora tuynuk darajasi</span>
            </div>
            
            <div style="display:grid; grid-template-columns: 1fr 300px; gap:20px;">
                <canvas id="gravityCanvas" width="700" height="450" style="background:#000; cursor:crosshair; width:100%; border-radius:15px; border:1px solid #333;"></canvas>
                
                <div style="background:#111827; padding:20px; border-radius:15px; border:1px solid #ec4899;">
                    <label>Ob'ekt Massasi (M):</label>
                    <input type="range" id="massRange" min="5" max="100" value="50" style="width:100%; accent-color:#ec4899;" oninput="updateGravitySim()">
                    
                    <div style="margin-top:30px; border-top:1px solid #334155; padding-top:20px;">
                        <p style="font-size:0.8rem; color:#94a3b8;">FAZO-VAQT GEOMETRIYASI:</p>
                        <p>Egrilik radiusi: <b id="radius_val">0</b> km</p>
                        <p>Yorug'lik og'ishi: <b id="light_bend">0°</b></p>
                    </div>
                    
                    <p style="margin-top:20px; font-size:0.75rem; color:#64748b; line-height:1.4;">
                        Massa qanchalik katta bo'lsa, u fazo-vaqt to'rini shunchalik kuchli egadi. Yorug'lik nurlari ham bu egrilik bo'ylab harakatlanadi.
                    </p>
                </div>
            </div>
        </div>
    `;
    updateGravitySim();
}

// --- MANTIQ VA ANIMATSIYA ---

let spaceTimer = null;
let earthSec = 0;
let shipSec = 0;

function updateRelUI() {
    const v = document.getElementById('v_rel').value;
    const gamma = 1 / Math.sqrt(1 - v * v);
    document.getElementById('v_display').innerText = v + "c";
    document.getElementById('gamma_factor').innerText = "γ = " + gamma.toFixed(2);
}

function toggleSpaceTrip() {
    const btn = document.getElementById('trip_btn');
    if(spaceTimer) {
        clearInterval(spaceTimer);
        spaceTimer = null;
        btn.innerText = "PARVOZNI DAVOM ETTIRISH";
    } else {
        btn.innerText = "TO'XTATISH";
        spaceTimer = setInterval(() => {
            const v = document.getElementById('v_rel').value;
            const gamma = 1 / Math.sqrt(1 - v * v);
            earthSec += 1;
            shipSec += (1 / gamma);
            
            document.getElementById('earth_clock').innerText = formatTime(earthSec);
            document.getElementById('ship_clock').innerText = formatTime(shipSec);
        }, 100);
    }
}

function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
}

function revealCat() {
    const shield = document.getElementById('blur_shield');
    const cat = document.getElementById('cat_state');
    const status = document.getElementById('sys_status');
    const wave = document.getElementById('wave_func');
    
    shield.style.opacity = "0";
    setTimeout(() => shield.style.display = "none", 500);
    
    const isAlive = Math.random() > 0.5;
    if(isAlive) {
        cat.className = "fas fa-cat";
        cat.style.color = "#10b981";
        status.innerText = "TIRIK (Kollaps)";
        wave.innerText = "> Ψ(t): |Tirik⟩";
    } else {
        cat.className = "fas fa-skull-crossbones";
        cat.style.color = "#ef4444";
        status.innerText = "O'LIK (Kollaps)";
        wave.innerText = "> Ψ(t): |O'lik⟩";
    }
}

function updateGravitySim() {
    const canvas = document.getElementById('gravityCanvas');
    const ctx = canvas.getContext('2d');
    const mass = document.getElementById('massRange').value;
    
    ctx.clearRect(0,0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Fazo to'rini chizish (Grid)
    for(let i=0; i<canvas.width; i+=20) {
        ctx.beginPath();
        for(let j=0; j<canvas.height; j+=10) {
            const dx = i - centerX;
            const dy = j - centerY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const offset = (mass * 100) / (dist + 50);
            
            ctx.lineTo(i, j + offset);
        }
        ctx.stroke();
    }
    
    // Markaziy massa
    const grad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, mass);
    grad.addColorStop(0, "#ec4899");
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.beginPath(); ctx.arc(centerX, centerY, mass, 0, Math.PI*2); ctx.fill();
    
    document.getElementById('radius_val').innerText = (mass * 120).toLocaleString();
    document.getElementById('light_bend').innerText = (mass / 2).toFixed(1) + "°";
}

function initWarpEffect() {
    // Canvas yulduzlar animatsiyasi kodi (vizual effekt uchun)
}
