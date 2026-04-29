// 1. Laboratoriyalarni ekranda chiroyli chiqarish funksiyasi
function renderLabs(filterCategory = 'all') {
    const labGrid = document.querySelector("#lab .grid");
    
    // Agar sahifada grid topilmasa, funksiyani to'xtatish
    if (!labGrid) return;

    // Gridni tozalash
    labGrid.innerHTML = "";

    // Ma'lumotlarni filtrlash
    const filteredLabs = filterCategory === 'all' 
        ? physicsLabs 
        : physicsLabs.filter(lab => lab.category === filterCategory);

    // Har bir laboratoriya uchun kartochka yaratish
    filteredLabs.forEach(lab => {
        const card = document.createElement("div");
        card.className = "card";
        card.setAttribute("data-aos", "fade-up"); // Animatsiya qo'shish

        card.innerHTML = `
            <div style="text-align: center;">
                <i class="fas ${lab.icon}" style="font-size: 3rem; color: #2563eb; margin-bottom: 15px;"></i>
                <h3 style="margin: 10px 0;">${lab.title}</h3>
                <span style="font-size: 0.8rem; color: #64748b; background: #e2e8f0; padding: 3px 10px; border-radius: 12px; text-transform: uppercase;">
                    ${lab.category}
                </span>
                <p style="font-size: 0.9rem; color: #475569; margin: 15px 0;">
                    Ushbu bo'limda interaktiv tajribani boshlashingiz mumkin.
                </p>
                <button onclick="openLab('${lab.component}')" class="btn" style="width: 100%; border: none; cursor: pointer;">
                    Boshlash <i class="fas fa-play" style="font-size: 0.8rem; margin-left: 5px;"></i>
                </button>
            </div>
        `;
        labGrid.appendChild(card);
    });
}

// 2. Laboratoriya oynasini ochish funksiyasi
function openLab(componentName) {
    // Hozircha oddiy xabar chiqaramiz, keyinchalik har bir faylni shu yerda ulaymiz
    console.log(`Ishga tushirilmoqda: ${componentName}`);
    alert(`Tez kunda: ${componentName} laboratoriyasi to'liq ishga tushadi! Hozirda kodlash jarayoni ketmoqda.`);
}

// 3. Sahifa yuklanganda ishlidigan qism
document.addEventListener("DOMContentLoaded", () => {
    // Laboratoriyalarni chiqarish
    renderLabs();

    // Navigatsiyadagi filtrlash tugmalarini yaratish (ixtiyoriy, lekin foydali)
    console.log("Laboratoriya tizimi muvaffaqiyatli yuklandi.");
});
