// ==========================================
// ASTRONOMIYA LABORATORIYALARI (V3.0)
// ==========================================

// 1. SAYYORALAR HARAKATI (Kepler qonunlari)
function initPlanets() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #fbbf24; background: #fffbeb;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline"><i class="fas fa-arrow-left"></i> Orqaga</button>
                <h3><i class="fas fa-globe-asia"></i> Kepler qonunlari va Gravitatsiya</h3>
                <div style="font-family: monospace; background: #451a03; color: #fbbf24; padding: 5px 15px; border-radius: 5px;">F = G·(m₁m₂)/r²</div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 280px; background: white; padding: 20px; border-radius: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    <label>Orbita ekssentrisiteti: <b id="e_val">0.0</b></label>
                    <input type="range" id="eccE" min="0" max="0.9" step="0.05" value="0" style="width:100%" oninput="updatePlanets()">
                    
                    <label style="margin-top:15px; display:block;">Sizning vazningiz (Yerda): <input type="number" id="userMass" value="70" style="width:60px"> kg</label>
                    
                    <div style="margin-top:20px; padding:15px; background:#fef3c7; border-radius:10px; border-left:5px solid #fbbf24;">
                        <p style="font-size:0.9rem;">Boshqa sayyoralardagi vazningiz:</p>
                        <div id="weight_list" style="font-size:0.85rem; line-height:1.6;"></div>
                    </div>
                </div>
                <div style="flex: 2; min-width: 350px; background: #020617; border-radius: 20px; height: 350px; position: relative; overflow: hidden;">
                    <canvas id="orbitCanvas" width="500" height="350" style="width:100%"></canvas>
                    <div style="position: absolute; bottom: 10px; left: 10px; color: #94a3b8; font-size: 0.7rem;">*Masshtab shartli ravishda olingan</div>
                </div>
            </div>
        </div>
    `;
    startOrbitSimulation();
}

// 2. OY FAZALARI (Yer-Oy-Quyosh sistemasi)
function initMoonPhases() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #94a3b8;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline">Orqaga</button>
                <h3><i class="fas fa-moon"></i> Oy fazalari simulyatori</h3>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 250px; background: #f8fafc; padding: 20px; border-radius: 15px;">
                    <p>Oyning sutkadagi holati:</p>
                    <input type="range" id="moonDay" min="0" max="29" value="0" style="width:100%" oninput="updateMoon()">
                    <div style="margin-top:20px; background:white; padding:15px; border-radius:10px; text-align:center;">
                        <h4 id="phase_name" style="color:#1e293b;">Yangi Oy</h4>
                        <div id="moon_visual" style="font-size: 4rem; margin:10px 0;">🌑</div>
                    </div>
                </div>
                <div style="flex: 2; background: #000; border-radius: 15px; height: 300px; position: relative; display: flex; align-items: center; justify-content: center;">
                    <div style="color: #fbbf24; position: absolute; left: 20px;"><i class="fas fa-sun fa-3x"></i><br><small>Quyosh nuri</small></div>
                    <div style="width:60px; height:60px; background:#3b82f6; border-radius:50%; box-shadow: 0 0 20px #3b82f6;"></div> <div id="moon_orbit_ball" style="width:20px; height:20px; background:#94a3b8; border-radius:50%; position:absolute;"></div>
                </div>
            </div>
        </div>
    `;
    updateMoon();
}

// 3. QUYOSH TIZIMI (Interaktiv model)
function initSolarSystem() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #f97316; background: #111827; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline" style="color:white; border-color:white;">Orqaga</button>
                <h3><i class="fas fa-sun"></i> Quyosh tizimi dinamikasi</h3>
                <span></span>
            </div>
            <div style="position: relative; height: 450px; overflow: hidden; border: 1px solid #374151; border-radius: 15px;">
                <canvas id="solarCanvas" width="800" height="450" style="width:100%"></canvas>
                <div style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.5); padding: 10px; border-radius: 8px; font-size: 0.8rem;">
                    <p><i class="fas fa-mouse-pointer"></i> Sayyoralar tezligi real nisbatda emas</p>
                </div>
            </div>
        </div>
    `;
    startSolarSimulation();
}

// --- ANIMATSIYA VA MANTIQ ---

function startOrbitSimulation() {
    const canvas = document.getElementById('orbitCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let angle = 0;

    function animate() {
        if(!document.getElementById('orbitCanvas')) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const ecc = parseFloat(document.getElementById('eccE').value);
        const a = 120; // Katta yarim o'q
        const b = a * Math.sqrt(1 - ecc * ecc); // Kichik yarim o'q
        const focus = Math.sqrt(a * a - b * b);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        // Orbita
        ctx.beginPath();
        ctx.ellipse(centerX + focus, centerY, a, b, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
        ctx.stroke();

        // Quyosh (Fokusda)
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath(); ctx.arc(centerX + focus, centerY, 15, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 15; ctx.shadowColor = "#fbbf24";

        // Sayyora
        const x = centerX + focus + a * Math.cos(angle);
        const y = centerY + b * Math.sin(angle);
        
        // Tezlik Keplerning 2-qonuniga ko'ra (fokusga yaqinlashganda tezlashadi)
        const dist = Math.sqrt(Math.pow(x - (centerX+focus), 2) + Math.pow(y - centerY, 2));
        const speed = 0.05 * (150 / dist);

        ctx.fillStyle = "#3b82f6";
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;

        angle += speed;
        requestAnimationFrame(animate);
    }
    animate();
    updatePlanets();
}

function updatePlanets() {
    const m = parseFloat(document.getElementById('userMass').value) || 0;
    const weights = [
        {name: "Oy", g: 1.62},
        {name: "Mars", g: 3.71},
        {name: "Yupiter", g: 24.79},
        {name: "Venera", g: 8.87}
    ];
    let html = "";
    weights.forEach(p => {
        const w = (m * p.g / 9.8).toFixed(1);
        html += `<p>${p.name}: <b>${w} kg</b></p>`;
    });
    document.getElementById('weight_list').innerHTML = html;
}

function updateMoon() {
    const day = document.getElementById('moonDay').value;
    const phases = [
        {name: "Yangi Oy", icon: "🌑"},
        {name: "Yosh Oy", icon: "🌒"},
        {name: "Birinchi chorak", icon: "🌓"},
        {name: "Ortib boruvchi", icon: "🌔"},
        {name: "To'liq Oy", icon: "🌕"},
        {name: "Kamayuvchi", icon: "🌖"},
        {name: "Oxirgi chorak", icon: "🌗"},
        {name: "Eski Oy", icon: "🌘"}
    ];
    const index = Math.floor((day / 30) * 8);
    document.getElementById('phase_name').innerText = phases[index].name;
    document.getElementById('moon_visual').innerText = phases[index].icon;

    const orbBall = document.getElementById('moon_orbit_ball');
    if(orbBall) {
        const angle = (day / 29) * Math.PI * 2;
        orbBall.style.left = (150 + Math.cos(angle) * 100) + "px";
        orbBall.style.top = (140 + Math.sin(angle) * 100) + "px";
    }
}

function startSolarSimulation() {
    const canvas = document.getElementById('solarCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const planets = [
        {name: "Merkuriy", r: 40, size: 4, color: "#94a3b8", speed: 0.04},
        {name: "Venera", r: 70, size: 7, color: "#fbbf24", speed: 0.015},
        {name: "Yer", r: 100, size: 8, color: "#3b82f6", speed: 0.01},
        {name: "Mars", r: 130, size: 6, color: "#ef4444", speed: 0.008},
        {name: "Yupiter", r: 180, size: 14, color: "#d97706", speed: 0.004}
    ];

    function draw() {
        if(!document.getElementById('solarCanvas')) return;
        ctx.fillStyle = "rgba(17, 24, 39, 0.3)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // Quyosh
        ctx.fillStyle = "#f97316";
        ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI*2); ctx.fill();

        planets.forEach(p => {
            const angle = Date.now() * p.speed * 0.1;
            const x = cx + Math.cos(angle) * p.r;
            const y = cy + Math.sin(angle) * p.r;

            // Orbita chizig'i
            ctx.beginPath(); ctx.arc(cx, cy, p.r, 0, Math.PI*2);
            ctx.strokeStyle = "#374151"; ctx.stroke();

            // Sayyora
            ctx.fillStyle = p.color;
            ctx.beginPath(); ctx.arc(x, y, p.size, 0, Math.PI*2); ctx.fill();
            ctx.fillStyle = "white"; ctx.font = "10px Arial";
            ctx.fillText(p.name, x + 10, y);
        });
        requestAnimationFrame(draw);
    }
    draw();
}
