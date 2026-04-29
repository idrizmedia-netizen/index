// ==========================================
// YADRO FIZIKASI LABORATORIYALARI (V3.0)
// ==========================================

// 1. RADIOAKTIV YEMIRILISH (Yarim yemirilish davri)
function initRadioactive() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #10b981; background: #ecfdf5;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline"><i class="fas fa-arrow-left"></i> Orqaga</button>
                <h3><i class="fas fa-radiation"></i> Radioaktiv yemirilish qonuni</h3>
                <div style="font-family: monospace; background: #064e3b; color: #34d399; padding: 5px 15px; border-radius: 5px;">N(t) = N₀·2^(-t/T)</div>
            </div>
            <div style="flex-wrap: wrap; display: flex; gap: 20px;">
                <div style="flex: 1; min-width: 280px; background: white; padding: 20px; border-radius: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                    <label>Yarim yemirilish davri (T): <b id="t_half_val">5</b> s</label>
                    <input type="range" id="halfLifeT" min="1" max="20" value="5" style="width:100%" oninput="resetDecay()">
                    
                    <div style="margin-top: 25px; padding: 15px; background: #f0fdf4; border-radius: 10px; border: 1px solid #34d399;">
                        <p>Qolgan yadrolar: <b id="remain_n" style="color:#059669">100</b> %</p>
                        <p>Vaqt: <b id="timer_t">0.0</b> s</p>
                    </div>
                    <button onclick="startDecay()" id="decayBtn" class="btn" style="width:100%; margin-top:20px; background:#10b981; color:white;">Simulyatsiyani boshlash</button>
                </div>
                <div style="flex: 2; min-width: 350px; background: #000; border-radius: 15px; height: 320px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    <canvas id="atomsCanvas" width="400" height="300"></canvas>
                    <div id="geiger_counter" style="position: absolute; bottom: 10px; right: 10px; color: #10b981; font-family: 'Courier New'; font-size: 0.8rem; border: 1px solid #10b981; padding: 5px;">
                        GEIGER COUNTER: <span id="clicks">0</span> CPS
                    </div>
                </div>
            </div>
        </div>
    `;
    initAtoms();
}

// 2. FOTOEFFEKT (Eynshteyn formulasi)
function initPhotoEffect() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #f59e0b;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline">Orqaga</button>
                <h3><i class="fas fa-sun"></i> Fotoeffekt hodisasi</h3>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 280px; background: #fffbeb; padding: 20px; border-radius: 15px;">
                    <label>Yorug'lik chastotasi (f): <b id="nu_val" style="color:#d97706">Binafsha</b></label>
                    <input type="range" id="lightFreq" min="1" max="7" value="6" style="width:100%" oninput="updatePhoto()">
                    
                    <label style="margin-top:15px; display:block;">Intensivlik: <b id="int_val">50</b> %</label>
                    <input type="range" id="lightInt" min="0" max="100" value="50" style="width:100%" oninput="updatePhoto()">
                    
                    <div id="photo_status" style="margin-top:20px; padding:10px; background:white; border-radius:8px; font-size:0.9rem; border-left:4px solid #f59e0b;">
                        Elektronlar chiqmoqda...
                    </div>
                </div>
                <div style="flex: 2; background: #1e293b; border-radius: 15px; height: 320px; position: relative; overflow: hidden;">
                    <canvas id="photoCanvas" width="500" height="320" style="width:100%"></canvas>
                </div>
            </div>
        </div>
    `;
    startPhotoSimulation();
}

// 3. BOR ATOM MODELI (Energetik sathlar)
function initBohrModel() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #3b82f6;">
            <h3><i class="fas fa-circle-notch"></i> Bor atom modeli (Vodorod)</h3>
            <div style="display: flex; gap: 20px; margin-top: 20px; flex-wrap: wrap;">
                <div style="flex: 1; background: #eff6ff; padding: 20px; border-radius: 15px;">
                    <p>Elektron sathi (n):</p>
                    <div style="display: flex; gap: 10px; margin: 15px 0;">
                        <button onclick="jumpElectron(1)" class="btn">n=1</button>
                        <button onclick="jumpElectron(2)" class="btn">n=2</button>
                        <button onclick="jumpElectron(3)" class="btn">n=3</button>
                        <button onclick="jumpElectron(4)" class="btn">n=4</button>
                    </div>
                    <div id="bohr_info" style="font-size: 0.85rem; color: #1e40af; line-height: 1.5;">
                        Elektronni yuqori sathga o'tkazish uchun energiya kerak (yutilish).
                    </div>
                </div>
                <div style="flex: 2; background: #0f172a; border-radius: 15px; height: 350px; position: relative;">
                    <canvas id="bohrCanvas" width="400" height="350" style="width:100%"></canvas>
                </div>
            </div>
        </div>
    `;
    drawBohrAtom(1);
}

// --- LOGIKA VA ANIMATSIYALAR ---

let atoms = [];
let decayActive = false;
function initAtoms() {
    const canvas = document.getElementById('atomsCanvas');
    if(!canvas) return;
    atoms = [];
    for(let i=0; i<150; i++) {
        atoms.push({
            x: 50 + Math.random() * 300,
            y: 50 + Math.random() * 200,
            decayed: false,
            color: '#10b981'
        });
    }
    drawDecay();
}

function startDecay() {
    if(decayActive) return;
    decayActive = true;
    let startTime = Date.now();
    const tHalf = parseFloat(document.getElementById('halfLifeT').value) * 1000;

    const interval = setInterval(() => {
        let elapsed = Date.now() - startTime;
        document.getElementById('timer_t').innerText = (elapsed/1000).toFixed(1);
        
        let decayProb = 1 - Math.pow(0.5, 0.05 / (tHalf/1000));
        let activeAtoms = 0;
        let clicks = 0;

        atoms.forEach(a => {
            if(!a.decayed) {
                if(Math.random() < decayProb) {
                    a.decayed = true;
                    a.color = '#ef4444';
                    clicks++;
                } else {
                    activeAtoms++;
                }
            }
        });

        document.getElementById('remain_n').innerText = Math.round((activeAtoms/150)*100);
        document.getElementById('clicks').innerText = clicks * 10;
        drawDecay();

        if(activeAtoms === 0 || !document.getElementById('atomsCanvas')) {
            clearInterval(interval);
            decayActive = false;
        }
    }, 50);
}

function drawDecay() {
    const canvas = document.getElementById('atomsCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0,0, canvas.width, canvas.height);
    atoms.forEach(a => {
        ctx.fillStyle = a.color;
        ctx.beginPath(); ctx.arc(a.x, a.y, 4, 0, Math.PI*2); ctx.fill();
    });
}

function resetDecay() {
    decayActive = false;
    document.getElementById('timer_t').innerText = "0.0";
    document.getElementById('remain_n').innerText = "100";
    initAtoms();
}

// Fotoeffekt Logic
function startPhotoSimulation() {
    const canvas = document.getElementById('photoCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];

    function animate() {
        if(!document.getElementById('photoCanvas')) return;
        ctx.clearRect(0,0, canvas.width, canvas.height);
        
        const f = parseInt(document.getElementById('lightFreq').value);
        const intensity = parseInt(document.getElementById('lightInt').value);
        const colors = ["#ef4444", "#f97316", "#f59e0b", "#10b981", "#3b82f6", "#6366f1", "#a855f7"];
        
        // Katod va Anod
        ctx.fillStyle = "#94a3b8"; ctx.fillRect(50, 100, 20, 120); // Katod
        ctx.fillStyle = "#475569"; ctx.fillRect(430, 100, 20, 120); // Anod

        // Nur chiqarish
        if(intensity > 0) {
            ctx.strokeStyle = colors[f-1]; ctx.lineWidth = 5;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(60, 160); ctx.stroke();
        }

        // Elektronlar (Faqat chastota chegaradan o'tsa - qizil nurning energiyasi kam)
        if(f > 3 && intensity > 0 && Math.random() * 100 < intensity) {
            particles.push({x: 70, y: 100 + Math.random()*120, v: f * 0.8});
        }

        particles.forEach((p, i) => {
            p.x += p.v;
            ctx.fillStyle = "#3b82f6";
            ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2); ctx.fill();
            if(p.x > 430) particles.splice(i, 1);
        });

        document.getElementById('photo_status').innerText = f <= 3 ? "Chiqish ishi bajarilmadi (Energiya kam)" : "Fotoelektronlar oqimi mavjud";
        requestAnimationFrame(animate);
    }
    animate();
}

function jumpElectron(level) {
    drawBohrAtom(level);
    document.getElementById('bohr_info').innerText = `Elektron n=${level} sathga o'tdi.`;
}

function drawBohrAtom(level) {
    const canvas = document.getElementById('bohrCanvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    ctx.clearRect(0,0, canvas.width, canvas.height);
    
    // Yadro
    ctx.fillStyle = "#ef4444";
    ctx.beginPath(); ctx.arc(centerX, centerY, 15, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = "white"; ctx.fillText("+", centerX-5, centerY+5);

    // Orbitalar
    for(let i=1; i<=4; i++) {
        ctx.strokeStyle = i === level ? "#3b82f6" : "#334155";
        ctx.setLineDash([5, 5]);
        ctx.beginPath(); ctx.arc(centerX, centerY, i * 40, 0, Math.PI*2); ctx.stroke();
    }

    // Elektron
    const angle = Date.now() * 0.002;
    const ex = centerX + Math.cos(angle) * (level * 40);
    const ey = centerY + Math.sin(angle) * (level * 40);
    ctx.fillStyle = "#3b82f6"; ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(ex, ey, 8, 0, Math.PI*2); ctx.fill();
    
    requestAnimationFrame(() => drawBohrAtom(level));
}
