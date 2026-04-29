// 1. Filtr tugmalarini avtomatik yaratish funksiyasi
function createFilterButtons() {
    const labSection = document.querySelector("#lab");
    const grid = document.querySelector("#lab .grid");
    
    if (!labSection || !grid) return;

    // Mavjud kategoriyalarni aniqlash (Takrorlanmas va kichik harflarda olish)
    const categories = ['all', ...new Set(physicsLabs.map(lab => lab.category.toLowerCase()))];

    // Tugmalar uchun konteyner yaratish
    let filterContainer = document.querySelector(".filter-container");
    if (!filterContainer) {
        filterContainer = document.createElement("div");
        filterContainer.className = "filter-container";
        filterContainer.style.textAlign = "center";
        filterContainer.style.marginBottom = "30px";
        labSection.insertBefore(filterContainer, grid);
    }

    // Tugmalarni chizish
    filterContainer.innerHTML = categories.map(cat => `
        <button onclick="renderLabs('${cat}')" class="btn btn-outline" 
                style="margin: 5px; padding: 8px 20px; text-transform: capitalize; border-color: #2563eb; color: #2563eb;">
            ${cat === 'all' ? 'Hammasi' : cat.replace('-', ' ')}
        </button>
    `).join('');
}

// 2. Laboratoriyalarni ekranda chiqarish
function renderLabs(filterCategory = 'all') {
    const labGrid = document.querySelector("#lab .grid");
    if (!labGrid) return;

    labGrid.innerHTML = "";

    // Filtrlashda trim() va toLowerCase() qo'shildi (Xatolikni oldini olish uchun)
    const filteredLabs = filterCategory === 'all' 
        ? physicsLabs 
        : physicsLabs.filter(lab => lab.category.trim().toLowerCase() === filterCategory.trim().toLowerCase());

    filteredLabs.forEach(lab => {
        const card = document.createElement("div");
        card.className = "card";
        card.setAttribute("data-aos", "fade-up");

        card.innerHTML = `
            <div style="text-align: center;">
                <i class="fas ${lab.icon}" style="font-size: 2.5rem; color: #2563eb; margin-bottom: 15px;"></i>
                <h3 style="margin: 10px 0; font-size: 1.1rem;">${lab.title}</h3>
                <button onclick="openLab('${lab.component}')" class="btn" style="width: 100%; font-size: 0.9rem;">
                    Boshlash
                </button>
            </div>
        `;
        labGrid.appendChild(card);
    });

    // Yangi kartochkalar uchun animatsiyani yangilash
    if (window.AOS) {
        AOS.refresh();
    }
}

// 3. Avtomatik ishga tushirish (Dynamic Caller)
function openLab(componentName) {
    if (typeof window[componentName] === "function") {
        window[componentName]();
        document.getElementById('lab').scrollIntoView({ behavior: 'smooth' });
    } else {
        const grid = document.querySelector("#lab .grid");
        grid.innerHTML = `
            <div class="card" style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                <i class="fas fa-tools" style="font-size: 4rem; color: #94a3b8; margin-bottom: 20px;"></i>
                <h2>Ushbu laboratoriya tayyorlanmoqda</h2>
                <p>Tez kunda "${componentName}" moduli to'liq ishga tushadi.</p>
                <button onclick="renderLabs()" class="btn" style="margin-top: 20px;">Orqaga qaytish</button>
            </div>
        `;
    }
}

// Sahifa yuklanganda ishga tushirish
document.addEventListener("DOMContentLoaded", () => {
    createFilterButtons(); 
    renderLabs();          
});
