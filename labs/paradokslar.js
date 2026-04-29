// ==========================================
// FIZIK PARADOKSLAR LABORATORIYASI (V3.0)
// ==========================================

// 1. EGIZAKLAR PARADOKSI (Vaqtning sekinlashishi)
function initTwinParadox() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #8b5cf6; background: #1e1b4b; color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline" style="color:white; border-color:white;">Orqaga</button>
                <h3><i class="fas fa-user-friends"></i> Egizaklar paradoksi (Nisbiylik nazariyasi)</h3>
                <div style="font-family: monospace; color: #a78bfa;">t' = t * √(1 - v²/c²)</div>
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 20px;">
                <div style="flex: 1; min-width: 280px; background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px;">
                    <label>Kema tezligi (v): <b id="c_speed">0.8</b> c</label>
                    <input type="range" id="shipV" min="0.1" max="0.99" step="0.01" value="0.8" style="width:100%" oninput="updateTwins()">
                    
                    <div style="margin-top:25px; display:grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div style="text-align:center; padding:10px; background:rgba(59,130,246,0.2); border-radius:10px;">
                            <p><i class="fas fa-home"></i> Yerdagi egizak</p>
                            <h2 id="earth_age">20.0</h2> yosh
                        </div>
                        <div style="text-align:center; padding:10px; background:rgba(167,139,250,0.2); border-radius:10px;">
                            <p><i class="fas fa-rocket"></i> Kosmonavt</p>
                            <h2 id="ship_age">20.0</h2> yosh
                        </div>
                    </div>
                    <button onclick="startSpaceTrip()" class="btn" style="width:100%; margin-top:20px; background:#8b5cf6; color:white;">Parvozni boshlash</button>
                </div>
                <div style="flex: 2; min-width: 350px; background: #000; border-radius: 15px; height: 320px; position: relative; overflow: hidden;">
                    <div id="stars" style="position:absolute; width:100%; height:100%;"></div>
                    <div id="earth_planet" style="position:absolute; left:20px; top:120px; font-size:4rem; color:#3b82f6;"><i class="fas fa-globe"></i></div>
                    <div id="rocket_ship" style="position:absolute; left:100px; top:140px; font-size:2rem; color:#f8fafc; transition: 0.1s;"><i class="fas fa-rocket"></i></div>
                </div>
            </div>
        </div>
    `;
    updateTwins();
}

// 2. GIDROSTATIK PARADOKS (Paskal idishlari)
function initHydroParadox() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #06b6d4;">
            <h3><i class="fas fa-fill-drip"></i> Gidrostatik paradoks</h3>
            <p style="margin-bottom:15px; font-size:0.9rem; color:#64748b;">Idish shakli turlicha bo'lsa-da, suv sathi va pastdagi bosim bir xil bo'ladi.</p>
            <div style="display: flex; flex-direction: column; align-items: center; background: white; padding: 40px; border-radius: 15px;">
                <div style="display: flex; align-items: flex-end; gap: 40px; height: 200px;">
                    <div style="width:60px; height:180px; border:3px solid #0c4a6e; border-top:0; position:relative;">
                        <div class="water-level" style="position:absolute; bottom:0; width:100%; background:#38bdf8; transition:0.5s;"></div>
                    </div>
                    <div style="width:100px; height:180px; clip-path: polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%); border:3px solid #0c4a6e; border-top:0; position:relative; background:#eee;">
                         <div class="water-level" style="position:absolute; bottom:0; width:100%; height:0%; background:#38bdf8; transition:0.5s;"></div>
                    </div>
                    <div style="width:100px; height:180px; clip-path: polygon(0% 0%, 100% 0%, 70% 100%, 30% 100%); border:3px solid #0c4a6e; border-top:0; position:relative; background:#eee;">
                         <div class="water-level" style="position:absolute; bottom:0; width:100%; height:0%; background:#38bdf8; transition:0.5s;"></div>
                    </div>
                </div>
                <div style="width:400px; height:20px; background:#38bdf8; margin-top:-3px; border:3px solid #0c4a6e; border-top:0;"></div>
                <input type="range" id="waterH" min="0" max="100" value="50" style="width:300px; margin-top:30px;" oninput="updateWater()">
            </div>
        </div>
    `;
    updateWater();
}

// 3. SHRYODINGER MUSUGI (Kvant superpozitsiyasi)
function initCatParadox() {
    clearResultsForNewLab();
    const grid = document.querySelector("#lab .grid");
    grid.innerHTML = `
        <div class="card" style="grid-column: 1 / -1; border-top: 5px solid #1e293b; background: #f1f5f9;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <button onclick="renderLabs()" class="btn btn-outline">Orqaga</button>
                <h3><i class="fas fa-cat"></i> Shryodinger mushugi (Kvant fizikasi)</h3>
            </div>
            <div style="display: flex; justify-content: center; gap: 40px; padding: 40px;">
                <div id="quantum_box" style="width: 250px; height: 250px; background: #475569; border: 8px solid #1e293b; border-radius: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s;" onclick="observeCat()">
                    <i id="cat_icon" class="fas fa-question" style="font-size: 5rem; color: white;"></i>
                </div>
                <div style="max-width: 300px;">
                    <div id="quantum_status" style="padding: 20px; background: white; border-radius: 15px; border-left: 5px solid #1e293b;">
                        Quti yopiq. Mushuk ham o'lik, ham tirik (Superpozitsiya). <br><br><b>Kuzatish uchun qutini bosing!</b>
                    </div>
                    <button onclick="resetCat()" class="btn" style="margin-top: 20px; width: 100%;">Tajribani qaytarish</button>
                </div>
            </div>
        </div>
    `;
}

// --- LOGIKA VA ANIMATSIYALAR ---

let earthYears = 20.0;
let shipYears = 20.0;
let tripInterval;

function updateTwins() {
    const v = parseFloat(document.getElementById('shipV').value);
    document.getElementById('c_speed').innerText = v.toFixed(2);
}

function startSpaceTrip() {
    if(tripInterval) clearInterval(tripInterval);
    const v = parseFloat(document.getElementById('shipV').value);
    const gamma = Math.sqrt(1 - v*v);
    const rocket = document.getElementById('rocket_ship');
    
    tripInterval = setInterval(() => {
        earthYears += 0.1;
        shipYears += (0.1 * gamma);
        
        document.getElementById('earth_age').innerText = earthYears.toFixed(1);
        document.getElementById('ship_age').innerText = shipYears.toFixed(1);
        
        const pos = 100 + (Math.sin(Date.now()/1000) * 50);
        rocket.style.left = pos + "px";
        
        if(earthYears > 100) clearInterval(tripInterval);
    }, 100);
}

function updateWater() {
    const h = document.getElementById('waterH').value;
    document.querySelectorAll('.water-level').forEach(el => {
        el.style.height = h + "%";
    });
}

function observeCat() {
    const box = document.getElementById('quantum_box');
    const icon = document.getElementById('cat_icon');
    const status = document.getElementById('quantum_status');
    
    const isAlive = Math.random() > 0.5;
    
    box.style.background = isAlive ? "#10b981" : "#ef4444";
    icon.className = isAlive ? "fas fa-cat" : "fas fa-skull-crossbones";
    status.innerHTML = isAlive ? 
        "<h3 style='color:#10b981'>Mushuk TiriK!</h3>To'lqin funksiyasi kollapsga uchradi." : 
        "<h3 style='color:#ef4444'>Mushuk O'lik!</h3>Kvant holat aniqlandi.";
}

function resetCat() {
    const box = document.getElementById('quantum_box');
    const icon = document.getElementById('cat_icon');
    const status = document.getElementById('quantum_status');
    
    box.style.background = "#475569";
    icon.className = "fas fa-question";
    status.innerHTML = "Quti yopiq. Mushuk ham o'lik, ham tirik (Superpozitsiya). <br><br><b>Kuzatish uchun qutini bosing!</b>";
}
