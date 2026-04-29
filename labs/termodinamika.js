// ==========================================
// TERMODINAMIKA LABORATORIYALARI (V3.0)
// ==========================================

// 1. GAZ QONUNLARI (Izojarayonlar: PV/T = const)
function initGasLaws() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #ef4444; background: #fff5f5;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline"><i class="fas fa-arrow-left"></i> Orqaga</button>
                <h3><i class="fas fa-compress-arrows-alt"></i> Ideal gaz qonunlari</h3>
                <div style="font-family: 'Courier New', monospace; background: #1e293b; color: #ef4444; padding: 5px 15px; border-radius: 5px;">PV = nRT</div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 300px; background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    <div style="margin-bottom: 20px;">
                        <label>Harorat (T): <b id="t_val" style="color:#ef4444">300</b> K</label>
                        <input type="range" id="tempT" min="100" max="1000" value="300" style="width:100%" oninput="updateGas()">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label>Hajm (V): <b id="v_val" style="color:#3b82f6">5.0</b> m³</label>
                        <input type="range" id="volV" min="1" max="10" step="0.1" value="5" style="width:100%" oninput="updateGas()">
                    </div>
                    <div style="background: #f8fafc; padding: 15px; border-radius: 10px; border-left: 5px solid #1e293b;">
                        <p style="margin:0; font-size: 0.9rem;">Bosim (P):</p>
                        <h2 id="pressP" style="margin:5px 0; color:#1e293b;">24.9 Pa</h2>
                    </div>
                    <button onclick="recordGas()" class="btn" style="width:100%; margin-top:20px; background:#ef4444; color:white;">Natijani saqlash</button>
                </div>
                <div style="flex: 2; min-width: 350px; background: #1e293b; border-radius: 20px; position: relative; height: 350px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    <div id="piston_container" style="width: 200px; border: 4px solid #94a3b8; border-top: none; position: relative; height: 250px; display:flex; align-items:flex-end;">
                        <div id="piston_head" style="width: 100%; height: 20px; background: #64748b; position: absolute; bottom: 150px; transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 2px;"></div>
                        <canvas id="moleculesCanvas" width="192" height="250" style="background: rgba(59, 130, 246, 0.1);"></canvas>
                    </div>
                    <div style="position: absolute; right: 20px; top: 20px; color: white; text-align: center;">
                        <i class="fas fa-tachometer-alt" style="font-size: 2rem; color: #ef4444;"></i>
                        <p>Manometr</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    startGasSimulation();
}

// 2. BROUN HARAKATI (Molekulalar to'qnashuvi)
function initBrownian() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #8b5cf6; background: #f5f3ff;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline">Orqaga</button>
                <h3><i class="fas fa-atom"></i> Broun harakati modeli</h3>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 250px; background: white; padding: 20px; border-radius: 15px;">
                    <label>Zarrachalar soni: <b id="mol_count">50</b></label>
                    <input type="range" id="molSlider" min="10" max="150" value="50" style="width:100%" oninput="updateBrownian()">
                    <label style="margin-top:15px; display:block;">Tezlik: <b id="mol_speed">5</b></label>
                    <input type="range" id="speedSlider" min="1" max="20" value="5" style="width:100%" oninput="updateBrownian()">
                    <div style="margin-top:20px; font-size:0.85rem; color:#6b7280; line-height:1.4;">
                        <i class="fas fa-info-circle"></i> Broun harakati - suyuqlik yoki gaz molekulalarining xaotik harakati natijasidir.
                    </div>
                </div>
                <div style="flex: 2; background: #0f172a; border-radius: 15px; height: 300px; position: relative;">
                    <canvas id="brownianCanvas" width="500" height="300" style="width:100%; height:100%;"></canvas>
                </div>
            </div>
        </div>
    `;
    startBrownianSimulation();
}

// 3. ISSIQLIK MUVOZANATI
function initHeatEquilibrium() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #f59e0b;">
            <h3>Issiqlik muvozanati (Kalorimetr)</h3>
            <div style="display: flex; gap: 20px; margin-top: 20px; flex-wrap: wrap;">
                <div style="flex: 1; background: #fffbeb; padding: 20px; border-radius: 15px;">
                    <p><b>Idish 1 (Issiq):</b> <input type="number" id="t1" value="80" style="width:60px"> °C</p>
                    <p><b>Idish 2 (Sovuq):</b> <input type="number" id="t2" value="20" style="width:60px"> °C</p>
                    <button onclick="calculateEquilibrium()" class="btn" style="width:100%; background:#f59e0b; color:white;">Aralashtirish</button>
                    <div id="equilResult" style="margin-top:15px; font-weight:bold; text-align:center; font-size:1.2rem;"></div>
                </div>
                <div style="flex: 2; display: flex; justify-content: center; align-items: flex-end; gap: 30px; height: 200px; background:white; border-radius:15px; border:1px solid #fde68a;">
                    <div id="cup1" style="width:60px; height:100px; background:#fee2e2; border:2px solid #ef4444; position:relative; border-radius:0 0 10px 10px;">
                        <div style="position:absolute; bottom:0; width:100%; height:80%; background:#ef4444; opacity:0.6;"></div>
                    </div>
                    <i class="fas fa-plus" style="margin-bottom:40px; color:#f59e0b;"></i>
                    <div id="cup2" style="width:60px; height:100px; background:#e0f2fe; border:2px solid #3b82f6; position:relative; border-radius:0 0 10px 10px;">
                        <div style="position:absolute; bottom:0; width:100%; height:80%; background:#3b82f6; opacity:0.6;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- MANTIQ VA ANIMATSIYALAR ---

let gasInterval;
function updateGas() {
    const t = parseFloat(document.getElementById('tempT').value);
    const v = parseFloat(document.getElementById('volV').value);
    const p = ( (t * 0.414) / v ).toFixed(1); // PV=nRT soddalashtirilgan
    
    document.getElementById('t_val').innerText = t;
    document.getElementById('v_val').innerText = v;
    document.getElementById('pressP').innerText = p + " Pa";
    
    const piston = document.getElementById('piston_head');
    piston.style.bottom = (v * 20) + "px";
}

function startGasSimulation() {
    const canvas = document.getElementById('moleculesCanvas');
    const ctx = canvas.getContext('2d');
    let molecules = Array.from({length: 30}, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * 200,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5
    }));

    function animate() {
        if (!document.getElementById('moleculesCanvas')) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const temp = document.getElementById('tempT').value / 300;
        const volumeHeight = document.getElementById('volV').value * 20;

        molecules.forEach(m => {
            m.x += m.vx * temp;
            m.y += m.vy * temp;

            if (m.x < 0 || m.x > canvas.width) m.vx *= -1;
            if (m.y < canvas.height - volumeHeight || m.y > canvas.height) m.vy *= -1;

            ctx.fillStyle = "#ef4444";
            ctx.beginPath();
            ctx.arc(m.x, m.y, 3, 0, Math.PI*2);
            ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    animate();
    updateGas();
}

function calculateEquilibrium() {
    const t1 = parseFloat(document.getElementById('t1').value);
    const t2 = parseFloat(document.getElementById('t2').value);
    const finalT = (t1 + t2) / 2; // Massa bir xil deb olinsa
    
    const resDiv = document.getElementById('equilResult');
    resDiv.innerHTML = `Muvozanat harorati: <span style="color:#f59e0b">${finalT.toFixed(1)} °C</span>`;
    saveResult(`Issiqlik muvozanati: T1=${t1}°C, T2=${t2}°C -> Final=${finalT.toFixed(1)}°C`);
}

// Broun harakati animatsiyasi (Sodda ko'rinish)
function startBrownianSimulation() {
    const canvas = document.getElementById('brownianCanvas');
    const ctx = canvas.getContext('2d');
    let balls = [];

    function initBalls() {
        const count = document.getElementById('molSlider').value;
        balls = Array.from({length: count}, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2
        }));
    }

    function animate() {
        if (!document.getElementById('brownianCanvas')) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const speedMult = document.getElementById('speedSlider').value / 5;

        balls.forEach(b => {
            b.x += b.vx * speedMult;
            b.y += b.vy * speedMult;
            if (b.x < 0 || b.x > canvas.width) b.vx *= -1;
            if (b.y < 0 || b.y > canvas.height) b.vy *= -1;
            ctx.fillStyle = "#8b5cf6";
            ctx.beginPath(); ctx.arc(b.x, b.y, 2, 0, Math.PI*2); ctx.fill();
        });
        requestAnimationFrame(animate);
    }
    initBalls();
    animate();
    window.updateBrownian = initBalls;
}
