// ==========================================
// OPTIKA LABORATORIYALARI (Vizuallashtirilgan)
// ==========================================

// Yordamchi funksiya: Natijalarni tozalash
function clearResultsForNewLab() {
    const list = document.getElementById('results-list');
    if (list) list.innerHTML = "";
}

// 1. YORUGLIKNING QAYTISHI
function initReflection() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #f59e0b; background: #f8fafc;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline"><i class="fas fa-arrow-left"></i> Chiqish</button>
                <h3><i class="fas fa-sync-alt"></i> Yorug'likning qaytish qonuni (Tajriba)</h3>
                <div style="font-size: 0.8rem; background: #fef3c7; padding: 5px 10px; border-radius: 5px;">Qonun: α = β</div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 280px; background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    <label style="font-weight: bold; color: #475569;">Lazer yo'nalishi (α): <span id="alpha_val" style="color:#f59e0b; font-size: 1.2rem;">45</span>°</label>
                    <input type="range" id="angleAlpha" min="0" max="85" step="1" value="45" style="width:100%; margin: 15px 0;" oninput="updateReflection()">
                    
                    <div style="margin-top: 20px; padding: 15px; background: #fffbeb; border-radius: 10px; border: 1px dashed #f59e0b;">
                        <p style="margin:0; color:#92400e;"><b>Ekranda:</b></p>
                        <p id="resBeta" style="font-size: 1.1rem; margin:5px 0 0 0;">Qaytish burchagi: β = 45°</p>
                    </div>
                    <button onclick="recordReflection()" class="btn" style="width:100%; margin-top:20px; background:#f59e0b; color:white; font-weight:bold;">Natijani jadvalga yozish</button>
                </div>
                <div style="flex: 2; min-width: 300px; background: #0f172a; border-radius: 15px; position: relative; overflow: hidden; box-shadow: inset 0 0 50px rgba(0,0,0,0.5);">
                    <canvas id="reflectionCanvas" width="500" height="350" style="width: 100%;"></canvas>
                    <div style="position: absolute; bottom: 10px; left: 10px; color: #64748b; font-size: 0.7rem;">Optik Stol v2.0</div>
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
    const bottomY = canvas.height - 60;
    const rayLength = 220;
    
    // 1. Ko'zgu (Stil berilgan)
    let grad = ctx.createLinearGradient(100, bottomY, 400, bottomY);
    grad.addColorStop(0, '#94a3b8'); grad.addColorStop(0.5, '#f1f5f9'); grad.addColorStop(1, '#94a3b8');
    ctx.strokeStyle = grad; ctx.lineWidth = 8;
    ctx.beginPath(); ctx.moveTo(80, bottomY); ctx.lineTo(420, bottomY); ctx.stroke();
    
    // 2. Normal
    ctx.setLineDash([8, 8]); ctx.strokeStyle = "rgba(148, 163, 184, 0.5)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(midX, bottomY); ctx.lineTo(midX, 40); ctx.stroke();
    ctx.setLineDash([]);

    const rad = (90 - alpha) * Math.PI / 180;
    
    // 3. Tushuvchi nur (Glow effekti bilan)
    ctx.shadowBlur = 15; ctx.shadowColor = "#facc15";
    ctx.strokeStyle = "#facc15"; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(midX - rayLength * Math.cos(rad), bottomY - rayLength * Math.sin(rad));
    ctx.lineTo(midX, bottomY); ctx.stroke();

    // 4. Qaytuvchi nur
    ctx.shadowColor = "#fb923c";
    ctx.strokeStyle = "#fb923c";
    ctx.beginPath();
    ctx.moveTo(midX, bottomY);
    ctx.lineTo(midX + rayLength * Math.cos(rad), bottomY - rayLength * Math.sin(rad));
    ctx.stroke();
    ctx.shadowBlur = 0; // Glow stop

    // Lazer manbasi vizuali
    ctx.fillStyle = "#334155";
    ctx.fillRect(midX - rayLength * Math.cos(rad) - 10, bottomY - rayLength * Math.sin(rad) - 10, 20, 20);
}

// 2. YORUGLIKNING SINISHI
function initRefraction() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #0ea5e9; background: #f0f9ff;">
             <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline">Orqaga</button>
                <h3><i class="fas fa-vial"></i> Sinish koeffitsienti tajribasi</h3>
                <div id="snell_formula" style="font-family: serif; font-size: 1.1rem; color: #0369a1;">n₁·sin(α) = n₂·sin(β)</div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 280px; background: white; padding: 20px; border-radius: 15px;">
                    <label style="font-weight: bold;">Ikkinchi muhitni tanlang:</label>
                    <select id="mediumN" class="btn btn-outline" style="width:100%; margin: 10px 0; border-color: #0ea5e9;" onchange="updateRefraction()">
                        <option value="1.33">Suv (n=1.33)</option>
                        <option value="1.5">Shisha (n=1.5)</option>
                        <option value="2.42">Olmos (n=2.42)</option>
                        <option value="1.0">Vakuum (n=1.0)</option>
                    </select>
                    <label style="display:block; margin-top:15px;">Tushish burchagi (i): <b id="i_val" style="color:#0ea5e9">45</b>°</label>
                    <input type="range" id="angleI" min="0" max="80" step="1" value="45" style="width:100%" oninput="updateRefraction()">
                    
                    <div style="margin-top: 20px; padding: 20px; background: #e0f2fe; border-radius: 12px; text-align: center;">
                        <span style="font-size: 0.9rem; color: #0369a1;">Hisoblangan sinish burchagi:</span>
                        <h2 id="resGamma" style="margin: 5px 0; color: #0369a1;">32.1°</h2>
                    </div>
                    <button onclick="recordRefraction()" class="btn" style="width:100%; margin-top:20px; background:#0ea5e9; color:white;">O'lchovni saqlash</button>
                </div>
                <div style="flex: 2; min-width: 300px; background: white; border-radius: 15px; position: relative; border: 2px solid #bae6fd;">
                    <canvas id="refractionCanvas" width="500" height="350" style="width: 100%;"></canvas>
                </div>
            </div>
        </div>
    `;
    updateRefraction();
}

function updateRefraction() {
    const n1 = 1.0; 
    const n2 = parseFloat(document.getElementById('mediumN').value);
    const i = parseInt(document.getElementById('angleI').value);
    const rRad = Math.asin((n1 * Math.sin(i * Math.PI / 180)) / n2);
    const rDeg = (rRad * 180 / Math.PI).toFixed(1);
    
    document.getElementById('i_val').innerText = i;
    document.getElementById('resGamma').innerText = `${rDeg}°`;

    const canvas = document.getElementById('refractionCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const midX = canvas.width / 2;
    const midY = canvas.height / 2;

    // Muhit (Suv/Shisha vizuali)
    let waterGrad = ctx.createLinearGradient(0, midY, 0, canvas.height);
    waterGrad.addColorStop(0, "rgba(14, 165, 233, 0.2)");
    waterGrad.addColorStop(1, "rgba(14, 165, 233, 0.5)");
    ctx.fillStyle = waterGrad; ctx.fillRect(0, midY, canvas.width, canvas.height/2);
    
    // Chegara chizig'i
    ctx.strokeStyle = "#0ea5e9"; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(canvas.width, midY); ctx.stroke();

    // Normal
    ctx.setLineDash([5, 5]); ctx.strokeStyle = "#94a3b8";
    ctx.beginPath(); ctx.moveTo(midX, 20); ctx.lineTo(midX, canvas.height - 20); ctx.stroke();
    ctx.setLineDash([]);

    // Nur chizish
    ctx.shadowBlur = 10;
    // Tushuvchi
    ctx.strokeStyle = "#ef4444"; ctx.shadowColor = "#ef4444";
    ctx.beginPath();
    ctx.moveTo(midX - 150 * Math.sin(i * Math.PI / 180), midY - 150 * Math.cos(i * Math.PI / 180));
    ctx.lineTo(midX, midY); ctx.stroke();

    // Singan
    ctx.strokeStyle = "#2563eb"; ctx.shadowColor = "#2563eb";
    ctx.beginPath();
    ctx.moveTo(midX, midY);
    ctx.lineTo(midX + 150 * Math.sin(rRad), midY + 150 * Math.cos(rRad));
    ctx.stroke();
    ctx.shadowBlur = 0;
}

// 3. YUPQA LINZA (Vizual Optik O'q)
function initLens() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #8b5cf6; background: #fafafa;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline">Chiqish</button>
                <h3><i class="fas fa-search"></i> Linza yordamida tasvir yasash</h3>
                <span style="color: #8b5cf6; font-weight: bold;">1/F = 1/d + 1/f</span>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 280px; background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
                    <div style="margin-bottom: 20px;">
                        <label>Fokus masofasi (F): <b id="f_lens_val" style="color:#8b5cf6">50</b> mm</label>
                        <input type="range" id="lensF" min="30" max="80" step="5" value="50" style="width:100%" oninput="updateLens()">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label>Buyum masofasi (d): <b id="d_val" style="color:#10b981">120</b> mm</label>
                        <input type="range" id="lensD" min="85" max="250" step="5" value="120" style="width:100%" oninput="updateLens()">
                    </div>
                    <div id="lens_info" style="padding: 15px; background: #f3f4f6; border-radius: 10px; font-size: 0.9rem;">
                        <p id="resLensF" style="margin:0; font-weight: bold; color: #4b5563;">Tasvir masofasi: f = 85.7 mm</p>
                        <p id="magnification" style="margin:5px 0 0 0; font-size: 0.8rem; color: #6b7280;">Kattalashtirish: k = 0.71</p>
                    </div>
                    <button onclick="recordLens()" class="btn" style="width:100%; margin-top:20px; background:#8b5cf6; color:white;">Natijani saqlash</button>
                </div>
                <div style="flex: 2; min-width: 300px; background: white; border: 1px solid #e5e7eb; border-radius: 15px; position: relative;">
                    <canvas id="lensCanvas" width="600" height="300" style="width: 100%;"></canvas>
                    <div style="position: absolute; top: 10px; right: 10px; font-size: 0.7rem; color: #9ca3af;">Masofalar shartli birliklarda</div>
                </div>
            </div>
        </div>
    `;
    updateLens();
}

function updateLens() {
    const F = parseInt(document.getElementById('lensF').value);
    const d = parseInt(document.getElementById('lensD').value);
    const f = (F * d) / (d - F);
    const k = Math.abs(f / d).toFixed(2);
    
    document.getElementById('f_lens_val').innerText = F;
    document.getElementById('d_val').innerText = d;
    document.getElementById('resLensF').innerText = `Tasvir masofasi: f = ${f.toFixed(1)} mm`;
    document.getElementById('magnification').innerText = `Kattalashtirish: k = ${k}`;

    const canvas = document.getElementById('lensCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const midX = canvas.width / 2;
    const midY = canvas.height / 2;
    const scale = 1.5; // Vizual masshtab

    // Optik o'q
    ctx.strokeStyle = "#cbd5e1"; ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(canvas.width, midY); ctx.stroke();
    ctx.setLineDash([]);

    // Fokus nuqtalari
    ctx.fillStyle = "#ef4444";
    ctx.beginPath(); ctx.arc(midX - F*scale, midY, 3, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(midX + F*scale, midY, 3, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "#4b5563"; ctx.fillText("F", midX - F*scale - 5, midY + 15);
    ctx.fillText("F", midX + F*scale - 5, midY + 15);

    // Linza vizuali
    ctx.strokeStyle = "#8b5cf6"; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(midX, 40); ctx.lineTo(midX, 260); ctx.stroke();
    // Linza botiqligi/qabariqligi belgilari
    ctx.beginPath(); ctx.moveTo(midX-10, 50); ctx.lineTo(midX, 40); ctx.lineTo(midX+10, 50); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(midX-10, 250); ctx.lineTo(midX, 260); ctx.lineTo(midX+10, 250); ctx.stroke();

    // Buyum (Yashil srelka)
    ctx.strokeStyle = "#10b981"; ctx.lineWidth = 5;
    ctx.beginPath(); 
    ctx.moveTo(midX - d*scale, midY); 
    ctx.lineTo(midX - d*scale, midY - 60); 
    ctx.lineTo(midX - d*scale - 5, midY - 50);
    ctx.moveTo(midX - d*scale, midY - 60);
    ctx.lineTo(midX - d*scale + 5, midY - 50);
    ctx.stroke();

    // Tasvir (Qizil srelka)
    const imgH = 60 * (f/d);
    ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 5;
    ctx.beginPath(); 
    ctx.moveTo(midX + f*scale, midY); 
    ctx.lineTo(midX + f*scale, midY + imgH);
    ctx.stroke();

    // Nurlar (Simulyatsiya)
    ctx.strokeStyle = "rgba(245, 158, 11, 0.4)"; ctx.lineWidth = 1;
    // 1-nur: Parallel
    ctx.beginPath(); ctx.moveTo(midX - d*scale, midY - 60); ctx.lineTo(midX, midY - 60); ctx.lineTo(midX + f*scale, midY + imgH); ctx.stroke();
    // 2-nur: Optik markazdan
    ctx.beginPath(); ctx.moveTo(midX - d*scale, midY - 60); ctx.lineTo(midX + f*scale, midY + imgH); ctx.stroke();
}
