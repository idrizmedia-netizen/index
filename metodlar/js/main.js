// metodlar/js/main.js

// Sahifa to'liq yuklanganda barcha metodlarni ko'rsatish
document.addEventListener("DOMContentLoaded", () => {
    displayMetodlar(metodlarData);
});

function displayMetodlar(data) {
    const grid = document.getElementById("metodlar-grid");
    grid.innerHTML = ""; // Har safar eski kartochkalarni tozalash

    if (data.length === 0) {
        grid.innerHTML = `
            <div class="text-center text-gray-500 col-span-full py-10">
                <p class="text-lg">Hozircha bu bo'limda metodlar mavjud emas.</p>
            </div>
        `;
        return;
    }

    data.forEach(metod => {
        const card = `
            <div class="rounded-2xl border p-6 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition duration-300" style="background: color-mix(in srgb, var(--metod-card) 92%, transparent); border-color: var(--metod-border);">
                <div>
                    <span class="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        ${metod.categoryLabel}
                    </span>
                    
                    <h3 class="text-xl font-bold mt-4 mb-2 transition" style="color: var(--metod-text);">
                        ${metod.title}
                    </h3>
                    
                    <p class="text-sm line-clamp-3 leading-relaxed" style="color: var(--metod-muted);">
                        ${metod.description}
                    </p>
                    
                    <div class="flex items-center gap-4 mt-5 text-xs p-2.5 rounded-xl border w-fit" style="color: var(--metod-muted); background: var(--metod-btn); border-color: var(--metod-border);">
                        <span class="flex items-center gap-1">⏱ ${metod.duration}</span>
                        <span class="flex items-center gap-1">📊 ${metod.difficulty}</span>
                    </div>
                </div>
                
                <div class="mt-6 pt-4 border-t" style="border-color: var(--metod-border);">
                    <a href="metod.html?id=${metod.id}" class="block text-center w-full bg-blue-600/10 hover:bg-blue-600 text-blue-500 hover:text-white font-medium py-2.5 rounded-xl transition duration-200 border border-blue-500/20 text-sm">
                        Ssenariyni ko'rish →
                    </a>
                </div>
            </div>
        `;
        grid.insertAdjacentHTML("beforeend", card);
    });
}

// Kategoriyalar bo'yicha saralash (Filtrlash) funksiyasi
function filterMetodlar(category) {
    const buttons = document.querySelectorAll("#filter-buttons button");
    buttons.forEach(btn => {
        btn.classList.remove("active");
    });

    const clickedButton = event.currentTarget;
    clickedButton.classList.add("active");

    // Ma'lumotlarni saralash
    if (category === "all") {
        displayMetodlar(metodlarData);
    } else {
        const filtered = metodlarData.filter(m => m.category === category);
        displayMetodlar(filtered);
    }
}
