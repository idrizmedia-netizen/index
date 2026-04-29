// ==========================================
// OPTIKA LABORATORIYALARI
// ==========================================

// 1. YORUGLIKNING QAYTISHI (Mirror Reflection)
function initReflection() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #f59e0b;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline"><i class="fas fa-arrow-left"></i> Orqaga</button>
                <h3><i class="fas fa-lightbulb"></i> Yorug'likning qaytish qonuni</h3>
                <span></span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 250px; background: #fffbeb; padding: 20px; border-radius: 10px;">
                    <label>Tushish burchagi (α): <b id="alpha_val">45</b>°</label>
                    <input type="range" id="angleAlpha" min="0" max="85" step="1" value="45" style="width:100%" oninput="updateReflection()">
                    
                    <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #f59e0b;">
                        <p id="resBeta">Qaytish burchagi: β = 45°</p>
                    </div>
                    <button onclick="recordReflection()" class="btn" style="width:100%; margin-top:20px; background:#f59e0b; color:white;">Natijani saqlash</button>
                </div>
                <div style="flex: 2; min-width: 300px; background: #0f172a; border-radius: 10px; display: flex; justify-content: center; align-items: center;">
                    <canvas id="reflectionCanvas" width="400" height="300"></canvas>
                </div>
            </div>
        </div>
    `;
    updateReflection();
}

function updateReflection() {
    const alpha = parseInt(document.getElementById('angleAlpha').value);
    document.getElementById('alpha_val').innerText = alpha;
    document.getElementById('resBeta').innerText = `Qaytish burchagi: β = ${alpha}°`;
    
    const canvas = document.getElementById('reflectionCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const midX = canvas.width / 2;
    const bottomY = canvas.height - 50;
    const rayLength = 150;
    
    // Ko'zgu
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(50, bottomY); ctx.lineTo(350, bottomY); ctx.stroke();
    
    // Normal (punktir)
    ctx.setLineDash([5, 5]); ctx.strokeStyle = "#64748b"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(midX, bottomY); ctx.lineTo(midX, 50); ctx.stroke();
    ctx.setLineDash([]);

    const rad = (90 - alpha) * Math.PI / 180;
    
    // Tushuvchi nur
    ctx.strokeStyle = "#facc15"; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(midX - rayLength * Math.cos(rad), bottomY - rayLength * Math.sin(rad));
    ctx.lineTo(midX, bottomY);
    ctx.stroke();

    // Qaytuvehi nur
    ctx.strokeStyle = "#fb923c";
    ctx.beginPath();
    ctx.moveTo(midX, bottomY);
    ctx.lineTo(midX + rayLength * Math.cos(rad), bottomY - rayLength * Math.sin(rad));
    ctx.stroke();
}

function recordReflection() {
    const a = document.getElementById('angleAlpha').value;
    saveResult(`Qaytish: α=${a}°, β=${a}° (α=β)`);
}

// 2. YORUGLIKNING SINISHI (Refraction - Snell Qonuni)
function initRefraction() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #0ea5e9;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline">Orqaga</button>
                <h3><i class="fas fa-water"></i> Yorug'likning sinish qonuni</h3>
                <span></span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 250px; background: #f0f9ff; padding: 20px; border-radius: 10px;">
                    <label>Muhit (n₂): <b id="n_val">1.33</b> (Suv)</label>
                    <select id="mediumN" class="btn btn-outline" style="width:100%; margin-bottom:15px;" onchange="updateRefraction()">
                        <option value="1.33">Suv (n=1.33)</option>
                        <option value="1.5">Shisha (n=1.5)</option>
                        <option value="2.42">Olmos (n=2.42)</option>
                    </select>
                    <label>Tushish burchagi (i): <b id="i_val">45</b>°</label>
                    <input type="range" id="angleI" min="0" max="80" step="1" value="45" style="width:100%" oninput="updateRefraction()">
                    <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                        <p id="resGamma">Sinish burchagi: r = 32.1°</p>
                    </div>
                    <button onclick="recordRefraction()" class="btn" style="width:100%; margin-top:20px; background:#0ea5e9; color:white;">Natijani saqlash</button>
                </div>
                <div style="flex: 2; min-width: 300px; background: white; border: 1px solid #e2e8f0; border-radius: 10px;">
                    <canvas id="refractionCanvas" width="400" height="300"></canvas>
                </div>
            </div>
        </div>
    `;
    updateRefraction();
}

function updateRefraction() {
    const n1 = 1.0; // Havo
    const n2 = parseFloat(document.getElementById('mediumN').value);
    const i = parseInt(document.getElementById('angleI').value);
    
    // Snell qonuni: n1*sin(i) = n2*sin(r)
    const rRad = Math.asin((n1 * Math.sin(i * Math.PI / 180)) / n2);
    const rDeg = (rRad * 180 / Math.PI).toFixed(1);
    
    document.getElementById('i_val').innerText = i;
    document.getElementById('n_val').innerText = n2;
    document.getElementById('resGamma').innerText = `Sinish burchagi: r = ${rDeg}°`;

    const canvas = document.getElementById('refractionCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Suv/Muhit vizualizatsiyasi
    ctx.fillStyle = "#e0f2fe"; ctx.fillRect(0, 150, 400, 150);
    ctx.strokeStyle = "#0ea5e9"; ctx.beginPath(); ctx.moveTo(0,150); ctx.lineTo(400,150); ctx.stroke();
    
    const midX = 200, midY = 150;
    
    // Tushuvchi nur
    ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(midX - 120 * Math.sin(i * Math.PI / 180), midY - 120 * Math.cos(i * Math.PI / 180));
    ctx.lineTo(midX, midY); ctx.stroke();

    // Singan nur
    ctx.strokeStyle = "#3b82f6";
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(midX + 120 * Math.sin(rRad), midY + 120 * Math.cos(rRad));
    ctx.stroke();
}

function recordRefraction() {
    const i = document.getElementById('angleI').value;
    const r = document.getElementById('resGamma').innerText.split('=')[1];
    const n = document.getElementById('mediumN').value;
    saveResult(`Sinish: i=${i}°, n=${n} bo'lganda r=${r.trim()}`);
}

// 3. YUPQA LINZA (Lens Formula)
function initLens() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #8b5cf6;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline">Orqaga</button>
                <h3><i class="fas fa-glasses"></i> Yupqa linza formulasi</h3>
                <span></span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 250px; background: #f5f3ff; padding: 20px; border-radius: 10px;">
                    <label>Fokus masofasi (F): <b id="f_lens_val">50</b> mm</label>
                    <input type="range" id="lensF" min="30" max="80" step="5" value="50" style="width:100%" oninput="updateLens()">
                    
                    <label style="margin-top:15px; display:block;">Buyum masofasi (d): <b id="d_val">100</b> mm</label>
                    <input type="range" id="lensD" min="85" max="200" step="5" value="120" style="width:100%" oninput="updateLens()">
                    
                    <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                        <p id="resLensF">Tasvir masofasi: f = 85.7 mm</p>
                    </div>
                    <button onclick="recordLens()" class="btn" style="width:100%; margin-top:20px; background:#8b5cf6; color:white;">Natijani saqlash</button>
                </div>
                <div style="flex: 2; min-width: 300px; background: white; border: 1px solid #e2e8f0; border-radius: 10px; overflow:hidden;">
                    <canvas id="lensCanvas" width="500" height="250"></canvas>
                </div>
            </div>
        </div>
    `;
    updateLens();
}

function updateLens() {
    const F = parseInt(document.getElementById('lensF').value);
    const d = parseInt(document.getElementById('lensD').value);
    
    // 1/F = 1/d + 1/f  =>  f = (F*d)/(d-F)
    const f = (F * d) / (d - F);
    
    document.getElementById('f_lens_val').innerText = F;
    document.getElementById('d_val').innerText = d;
    document.getElementById('resLensF').innerText = `Tasvir masofasi: f = ${f.toFixed(1)} mm`;

    const canvas = document.getElementById('lensCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const midX = canvas.width / 2;
    const midY = canvas.height / 2;

    // Asosiy optik o'q
    ctx.strokeStyle = "#94a3b8"; ctx.setLineDash([2, 2]);
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(500, midY); ctx.stroke();
    ctx.setLineDash([]);

    // Linza (Yig'uvchi)
    ctx.strokeStyle = "#8b5cf6"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(midX, 50); ctx.lineTo(midX, 200); ctx.stroke();
    // Linza uchlari
    ctx.beginPath(); ctx.moveTo(midX-10, 60); ctx.lineTo(midX, 50); ctx.lineTo(midX+10, 60); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(midX-10, 190); ctx.lineTo(midX, 200); ctx.lineTo(midX+10, 190); ctx.stroke();

    // Buyum (Srelka)
    ctx.strokeStyle = "#10b981"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(midX - d, midY); ctx.lineTo(midX - d, midY - 40); ctx.stroke();

    // Tasvir
    ctx.strokeStyle = "#ef4444";
    ctx.beginPath(); ctx.moveTo(midX + f, midY); ctx.lineTo(midX + f, midY + (40 * f/d)); ctx.stroke();
}

function recordLens() {
    const d = document.getElementById('lensD').value;
    const f = document.getElementById('resLensF').innerText.split('=')[1];
    saveResult(`Linza: d=${d}mm, F=${document.getElementById('lensF').value}mm bo'lsa f=${f.trim()}`);
}
