// ==========================================
// AMALIY FIZIKA: YUQORI DARAJADAGI LABORATORIYALAR
// ==========================================

// 1. AVTOMOBIL TORMOZLANISHI (ID: 71)
function initBrakingDistance() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #ef4444; background: #fff1f2;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline">Orqaga</button>
                <h3 style="color:#991b1b;"><i class="fas fa-car-crash"></i> Avtomobil Xavfsizligi va Ishqalanish</h3>
                <div style="display: flex; gap: 10px;">
                    <span class="badge" style="background:#ef4444; color:white; padding:5px 10px; border-radius:4px;">ABS Tizimi: ON</span>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 300px 1fr; gap: 20px;">
                <div style="background: white; padding: 20px; border-radius: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    <div style="margin-bottom:20px;">
                        <label>Tezlik Spidometri: <b id="v_text">60</b> km/soat</label>
                        <input type="range" id="v_input" min="0" max="180" value="60" style="width:100%" oninput="updateBrakeUI()">
                    </div>
                    
                    <div style="margin-bottom:20px;">
                        <label>Yo'l qoplamasi:</label>
                        <select id="road_mu" class="btn btn-outline" style="width:100%" onchange="updateBrakeUI()">
                            <option value="0.8">Quruq Asfalt (μ=0.8)</option>
                            <option value="0.4">Yomg'irli yo'l (μ=0.4)</option>
                            <option value="0.15">Muzlama (μ=0.15)</option>
                        </select>
                    </div>

                    <div style="background:#f8fafc; padding:15px; border-radius:10px; border:1px solid #e2e8f0;">
                        <p style="font-size:0.8rem; color:#64748b;">HISOBLANGAN NATIJA:</p>
                        <p>Kinetik Energiya: <b id="k_energy">0</b> J</p>
                        <p>Tormoz yo'li: <b id="s_dist" style="color:#ef4444; font-size:1.2rem;">0 m</b></p>
                    </div>
                    
                    <button onclick="startBrakingSim()" class="btn" style="width:100%; margin-top:15px; background:#ef4444; color:white; font-weight:bold;">TORMOZNI BOSISH!</button>
                </div>

                <div style="background: #1e293b; border-radius: 15px; position: relative; height: 350px; overflow: hidden; border: 4px solid #334155;">
                    <div id="road_stripes" style="position:absolute; top:55%; width:200%; height:4px; background:repeating-linear-gradient(90deg, white, white 40px, transparent 40px, transparent 80px);"></div>
                    
                    <div id="ruler" style="position:absolute; bottom:20px; width:100%; height:30px; display:flex; color:rgba(255,255,255,0.5); font-size:10px; border-top:1px solid rgba(255,255,255,0.2);"></div>

                    <div id="sim_car" style="position:absolute; left:50px; top:130px; transition: 0.1s linear;">
                        <div style="position:relative;">
                            <i class="fas fa-car-side" style="font-size:4rem; color:#fbbf24;"></i>
                            <div id="brake_light" style="position:absolute; right:75px; top:25px; width:8px; height:15px; background:red; filter:blur(4px); display:none;"></div>
                        </div>
                    </div>
                    
                    <div id="crash_wall" style="position:absolute; right:0; top:0; width:20px; height:100%; background:repeating-linear-gradient(45deg, #f59e0b, #f59e0b 10px, #000 10px, #000 20px);"></div>
                </div>
            </div>
        </div>
    `;
    updateBrakeUI();
    drawRuler();
}

// 2. LIFT VA VAZNSIZLIK (ID: 72)
function initWeightless() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #8b5cf6; background: #f5f3ff;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <h3><i class="fas fa-arrows-alt-v"></i> Liftda Ortiqcha Yuklanish va Vaznsizlik</h3>
                <div id="g_meter" style="background:#1e293b; color:#10b981; padding:5px 15px; border-radius:20px; font-family:monospace;">G-FORCE: 1.0g</div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 300px; gap: 20px; margin-top:20px;">
                <div style="background:white; border-radius:15px; height:450px; position:relative; border:8px solid #cbd5e1; display:flex; justify-content:center;">
                    <div id="lift_cabin" style="width:160px; height:220px; background:#e2e8f0; border:4px solid #475569; position:absolute; bottom:20px; transition: 2s cubic-bezier(0.45, 0, 0.55, 1); display:flex; flex-direction:column; align-items:center; padding:10px;">
                        <div style="width:100%; height:5px; background:#94a3b8; margin-bottom:10px;"></div>
                        <div style="width:60px; height:80px; border:2px solid #1e293b; position:relative; background:white;">
                            <div id="spring" style="width:2px; background:#1e293b; margin:0 auto; height:30px; transition:0.3s;"></div>
                            <div id="weight_ball" style="width:20px; height:20px; background:#ef4444; border-radius:50%; margin:-5px auto 0;"></div>
                        </div>
                        <i class="fas fa-user-tie" style="font-size:4rem; margin-top:10px; color:#1e293b;"></i>
                    </div>
                </div>

                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div class="card" style="background:white;">
                        <p>Harakatni tanlang:</p>
                        <button onclick="liftAction('up')" class="btn" style="background:#8b5cf6; color:white; width:100%; margin-bottom:5px;">Tezlanish bilan yuqoriga</button>
                        <button onclick="liftAction('down')" class="btn" style="background:#3b82f6; color:white; width:100%; margin-bottom:5px;">Tezlanish bilan pastga</button>
                        <button onclick="liftAction('stop')" class="btn btn-outline" style="width:100%;">To'xtash (Inertsiya)</button>
                    </div>
                    <div class="card" style="background:#1e293b; color:#34d399; text-align:center;">
                        <small>OG'IRLIK (P):</small>
                        <h1 id="p_val">700 N</h1>
                        <small id="status_text" style="color:#94a3b8;">Tinch holat</small>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// 3. GIDRAVLIK PRESS (ID: 73)
function initHydraulic() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #0ea5e9; background: #f0f9ff;">
            <h3><i class="fas fa-oil-can"></i> Gidravlik Mashina: Kuchda Yutuq</h3>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:30px; margin-top:20px;">
                <div style="background:white; padding:20px; border-radius:15px;">
                    <label>Kichik porshen yuzasi (S₁): <b>10 cm²</b></label><br>
                    <label>Katta porshen yuzasi (S₂): <b id="s2_text">100 cm²</b></label>
                    <input type="range" id="s2_input" min="20" max="200" value="100" style="width:100%" oninput="updateHydSim()">
                    
                    <hr style="margin:20px 0;">
                    
                    <label>Berilayotgan kuch (F₁): <b id="f1_text">50 N</b></label>
                    <input type="range" id="f1_input" min="0" max="500" value="50" style="width:100%" oninput="updateHydSim()">
                    
                    <div style="margin-top:20px; background:#e0f2fe; padding:20px; border-radius:10px; border-left:5px solid #0ea5e9;">
                        <p>Chiquvchi kuch (F₂):</p>
                        <h1 id="f2_res" style="color:#0369a1;">500 N</h1>
                        <p id="lift_capacity" style="font-size:0.8rem; color:#64748b;">Bu kuch bilan 51.0 kg yukni ko'tarish mumkin.</p>
                    </div>
                </div>

                <div style="background:white; border-radius:15px; padding:20px; position:relative; height:350px; display:flex; align-items:flex-end; justify-content:center; gap:0;">
                    <div style="display:flex; flex-direction:column; align-items:center;">
                        <div id="p1_block" style="width:30px; height:150px; background:#38bdf8; border:3px solid #0369a1; border-top:8px solid #475569; transition:0.3s;"></div>
                        <div style="width:30px; height:30px; background:#38bdf8; border-left:3px solid #0369a1; border-right:3px solid #0369a1;"></div>
                    </div>
                    <div style="width:120px; height:30px; background:#38bdf8; border-bottom:3px solid #0369a1; border-top:3px solid transparent;"></div>
                    <div style="display:flex; flex-direction:column; align-items:center;">
                         <div id="p2_weight" style="width:80px; height:50px; background:#64748b; margin-bottom:2px; border-radius:5px; color:white; display:flex; align-items:center; justify-content:center; font-size:0.7rem;">YUK</div>
                         <div id="p2_block" style="width:100px; height:80px; background:#38bdf8; border:3px solid #0369a1; border-top:10px solid #475569; transition:0.3s;"></div>
                         <div style="width:100px; height:30px; background:#38bdf8; border-left:3px solid #0369a1; border-right:3px solid #0369a1;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    updateHydSim();
}

// --- LOGIKA FUNKSIYALARI ---

function updateBrakeUI() {
    const v = document.getElementById('v_input').value;
    const mu = document.getElementById('road_mu').value;
    document.getElementById('v_text').innerText = v;
    
    // S = v^2 / (2 * mu * g) | v m/s da bo'lishi kerak
    const v_ms = v / 3.6;
    const s = (v_ms * v_ms) / (2 * mu * 9.8);
    const ke = 0.5 * 1200 * v_ms * v_ms; // 1200 kg moshina uchun
    
    document.getElementById('s_dist').innerText = s.toFixed(1) + " m";
    document.getElementById('k_energy').innerText = Math.round(ke).toLocaleString() + " J";
}

function startBrakingSim() {
    const car = document.getElementById('sim_car');
    const light = document.getElementById('brake_light');
    const v = document.getElementById('v_input').value;
    const s = parseFloat(document.getElementById('s_dist').innerText);
    
    light.style.display = "block";
    car.style.transition = "0s";
    car.style.left = "50px";
    
    setTimeout(() => {
        car.style.transition = `left ${v/20}s ease-out`;
        car.style.left = (50 + s * 5) + "px"; // Masshtab 1m = 5px
        
        if((50 + s * 5) > 600) { // Devorga urilish
            setTimeout(() => { 
                car.style.color = "red";
                alert("AVARIYA! Tormoz yo'li yetmadi.");
            }, (v/20)*800);
        }
    }, 100);
}

function liftAction(type) {
    const lift = document.getElementById('lift_cabin');
    const pText = document.getElementById('p_val');
    const gText = document.getElementById('g_meter');
    const spring = document.getElementById('spring');
    const status = document.getElementById('status_text');
    
    let m = 70; // kg
    let g = 9.8;
    let a = 0;

    if(type === 'up') {
        lift.style.bottom = "200px";
        a = 3;
        status.innerText = "Tezlanuvchan yuqoriga";
        status.style.color = "#ef4444";
    } else if(type === 'down') {
        lift.style.bottom = "20px";
        a = -4;
        status.innerText = "Tezlanuvchan pastga";
        status.style.color = "#3b82f6";
    } else {
        a = 0;
        status.innerText = "Tinch / Tekis";
        status.style.color = "#94a3b8";
    }

    const P = m * (g + a);
    const G = (g + a) / 9.8;
    
    pText.innerText = Math.round(P) + " N";
    gText.innerText = `G-FORCE: ${G.toFixed(1)}g`;
    spring.style.height = (30 + a * 5) + "px";
}

function updateHydSim() {
    const f1 = document.getElementById('f1_input').value;
    const s2 = document.getElementById('s2_input').value;
    const s1 = 10;
    
    const f2 = (f1 * s2) / s1;
    document.getElementById('f1_text').innerText = f1 + " N";
    document.getElementById('s2_text').innerText = s2 + " cm²";
    document.getElementById('f2_res').innerText = Math.round(f2) + " N";
    document.getElementById('lift_capacity').innerText = `Bu kuch bilan ${(f2/9.8).toFixed(1)} kg yukni ko'tarish mumkin.`;
    
    // Porshenlar harakati
    document.getElementById('p1_block').style.height = (150 - f1/10) + "px";
    document.getElementById('p2_block').style.height = (80 + f1/(s2/10)) + "px";
}

function drawRuler() {
    const ruler = document.getElementById('ruler');
    for(let i=0; i<200; i+=20) {
        const mark = document.createElement('div');
        mark.style.width = "100px";
        mark.style.borderLeft = "1px solid white";
        mark.innerText = i + "m";
        ruler.appendChild(mark);
    }
}
