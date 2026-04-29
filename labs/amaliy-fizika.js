// ==========================================
// AMALIY FIZIKA LABORATORIYALARI (V3.0)
// ==========================================

// 1. GIDRAVLIK PRESS (Paskal qonuni: F1/S1 = F2/S2)
function initHydraulicPress() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #0ea5e9; background: #f0f9ff;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline"><i class="fas fa-arrow-left"></i> Orqaga</button>
                <h3><i class="fas fa-weight-hanging"></i> Gidravlik press simulyatori</h3>
                <div style="font-family: monospace; background: #0c4a6e; color: #38bdf8; padding: 5px 15px; border-radius: 5px;">P = F / S</div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 280px; background: white; padding: 20px; border-radius: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    <label>Kichik porshen kuchi (F₁): <b id="f1_val">100</b> N</label>
                    <input type="range" id="forceF1" min="10" max="500" value="100" style="width:100%" oninput="updatePress()">
                    
                    <label style="margin-top:15px; display:block;">Yuzalar nisbati (S₂/S₁): <b id="s_ratio">5</b> marta</label>
                    <input type="range" id="ratioS" min="2" max="10" value="5" style="width:100%" oninput="updatePress()">
                    
                    <div style="margin-top:20px; padding:15px; background:#e0f2fe; border-radius:10px; border-left:5px solid #0ea5e9;">
                        <p>Katta porshendagi kuch (F₂):</p>
                        <h2 id="f2_result" style="color:#0369a1;">500 N</h2>
                        <small style="color:#64748b;">*Gidravlik mashina kuchda yutuq beradi.</small>
                    </div>
                </div>
                <div style="flex: 2; min-width: 350px; background: white; border: 2px solid #e2e8f0; border-radius: 20px; height: 350px; display: flex; align-items: flex-end; justify-content: center; gap: 0; padding-bottom: 40px; overflow: hidden;">
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div id="piston1_weight" style="margin-bottom: 5px; transition: 0.3s;"><i class="fas fa-arrow-down" style="color:#0ea5e9;"></i></div>
                        <div id="piston1" style="width: 40px; height: 100px; background: #38bdf8; border: 2px solid #0c4a6e; border-top-width: 8px; position:relative;"></div>
                    </div>
                    <div style="width: 100px; height: 30px; background: #38bdf8; border-bottom: 2px solid #0c4a6e; border-top: 2px solid #0c4a6e;"></div>
                    <div style="display: flex; flex-direction: column; align-items: center;">
                        <div id="piston2_weight" style="width: 80px; height: 60px; background: #64748b; color:white; display:flex; align-items:center; justify-content:center; border-radius: 5px; margin-bottom: 5px; transition: 0.3s; font-size: 0.8rem;">YUK</div>
                        <div id="piston2" style="width: 120px; height: 60px; background: #38bdf8; border: 2px solid #0c4a6e; border-top-width: 10px; position:relative;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    updatePress();
}

// 2. AVTOMOBIL TORMOZ TIZIMI (Ishqalanish kuchi)
function initCarBrakes() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #ef4444; background: #fef2f2;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline">Orqaga</button>
                <h3><i class="fas fa-car-crash"></i> Tormozlanish masofasi</h3>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 280px; background: white; padding: 20px; border-radius: 15px;">
                    <label>Tezlik (v): <b id="v_car">60</b> km/soat</label>
                    <input type="range" id="speedV" min="20" max="150" value="60" style="width:100%" oninput="updateBrakes()">
                    
                    <label style="margin-top:15px; display:block;">Yo'l holati:</label>
                    <select id="roadType" class="btn btn-outline" style="width:100%" onchange="updateBrakes()">
                        <option value="0.7">Quruq asfalt (μ=0.7)</option>
                        <option value="0.4">Ho'l yo'l (μ=0.4)</option>
                        <option value="0.1">Muzlama (μ=0.1)</option>
                    </select>
                    
                    <div style="margin-top:20px; border-left:5px solid #ef4444; padding-left:15px;">
                        <p>Tormoz yo'li: <b id="stopDist" style="font-size:1.5rem; color:#ef4444;">---</b></p>
                    </div>
                    <button onclick="startBrakeTest()" class="btn" style="width:100%; margin-top:15px; background:#ef4444; color:white;">Sinovni boshlash</button>
                </div>
                <div style="flex: 2; background: #334155; border-radius: 15px; height: 300px; position: relative; overflow: hidden; display: flex; align-items: center;">
                    <div style="width:100%; height:2px; background:white; position:absolute; top:50%; border:1px dashed rgba(255,255,255,0.3);"></div>
                    <div id="car_model" style="position:absolute; left: 0; transition: 0s; font-size: 2.5rem; color: #fbbf24;">
                        <i class="fas fa-car"></i>
                    </div>
                    <div id="stop_line" style="position:absolute; left: 80%; height:100px; width:10px; background:#ef4444; display:none;"></div>
                </div>
            </div>
        </div>
    `;
    updateBrakes();
}

// 3. LIFTDA VAZNSIZLIK (Inertsiya va Og'irlik)
function initElevatorPhysics() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #8b5cf6;">
            <h3><i class="fas fa-arrows-alt-v"></i> Liftda vazn o'zgarishi</h3>
            <div style="display: flex; gap: 20px; margin-top: 20px; flex-wrap: wrap;">
                <div style="flex: 1; background: #f5f3ff; padding: 20px; border-radius: 15px;">
                    <p>Lift harakati:</p>
                    <button onclick="moveElevator('up')" class="btn" style="width:100%; margin-bottom:10px;">Tezlanish bilan yuqoriga (a > 0)</button>
                    <button onclick="moveElevator('down')" class="btn" style="width:100%; margin-bottom:10px;">Tezlanish bilan pastga (a < 0)</button>
                    <button onclick="moveElevator('const')" class="btn btn-outline" style="width:100%;">Tekis harakat (a = 0)</button>
                    
                    <div style="margin-top:20px; padding:15px; background:white; border-radius:10px; text-align:center;">
                        <p>Dinamometr ko'rsatkichi:</p>
                        <h2 id="weightP" style="color:#8b5cf6;">700 N</h2>
                    </div>
                </div>
                <div style="flex: 2; background: #f1f5f9; border-radius: 15px; height: 350px; position: relative; display: flex; justify-content: center; overflow: hidden; border: 2px solid #ddd;">
                    <div id="elevator_cabin" style="width:120px; height:180px; background:#cbd5e1; border:4px solid #475569; position:absolute; bottom: 50px; transition: 2s cubic-bezier(0.45, 0.05, 0.55, 0.95); display:flex; flex-direction:column; align-items:center; justify-content:center;">
                        <div style="width:40px; height:10px; background:#1e293b; margin-bottom: 50px;"></div> <i class="fas fa-user" style="font-size: 3rem; color:#1e293b;"></i>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- LOGIKA VA ANIMATSIYALAR ---

function updatePress() {
    const f1 = parseFloat(document.getElementById('forceF1').value);
    const ratio = parseFloat(document.getElementById('ratioS').value);
    const f2 = f1 * ratio;
    
    document.getElementById('f1_val').innerText = f1;
    document.getElementById('s_ratio').innerText = ratio;
    document.getElementById('f2_result').innerText = f2 + " N";

    // Vizual balandliklarni o'zgartirish (Suyuqlik hajmi saqlanishi)
    const p1 = document.getElementById('piston1');
    const p2 = document.getElementById('piston2');
    const h1 = 100 - (f1 / 10);
    const h2 = 60 + (f1 / (10 * ratio));
    
    p1.style.height = h1 + "px";
    p2.style.height = h2 + "px";
}

function updateBrakes() {
    const v = parseFloat(document.getElementById('speedV').value) / 3.6; // m/s
    const mu = parseFloat(document.getElementById('roadType').value);
    const g = 9.8;
    const s = (v * v) / (2 * mu * g);
    
    document.getElementById('v_car').innerText = Math.round(v * 3.6);
    document.getElementById('stopDist').innerText = s.toFixed(1) + " metr";
    return s;
}

function startBrakeTest() {
    const car = document.getElementById('car_model');
    const s = updateBrakes();
    const line = document.getElementById('stop_line');
    
    car.style.transition = "0s";
    car.style.left = "0%";
    line.style.display = "block";
    line.style.left = (s * 5) + "px"; // Masshtablash

    setTimeout(() => {
        car.style.transition = "2s ease-out";
        car.style.left = (s * 5) + "px";
    }, 100);
}

function moveElevator(dir) {
    const cabin = document.getElementById('elevator_cabin');
    const p = document.getElementById('weightP');
    const m = 70; // kg
    const g = 9.8;
    const a = 2.5; // m/s^2 tezlanish

    if(dir === 'up') {
        cabin.style.bottom = "150px";
        p.innerText = Math.round(m * (g + a)) + " N (Ortiqcha yuklanish!)";
        p.style.color = "#ef4444";
    } else if(dir === 'down') {
        cabin.style.bottom = "10px";
        p.innerText = Math.round(m * (g - a)) + " N (Vaznsizlikka yaqin)";
        p.style.color = "#3b82f6";
    } else {
        cabin.style.bottom = "80px";
        p.innerText = Math.round(m * g) + " N (Normal)";
        p.style.color = "#8b5cf6";
    }
}
