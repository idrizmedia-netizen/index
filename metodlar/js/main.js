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
        // Har bir metod uchun to'q ko'k rangli, chiroyli kartochka yaratish
        const card = `
            <div class="bg-[#1e293b]/50 rounded-2xl border border-gray-800 p-6 flex flex-col justify-between hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5 transition duration-300 backdrop-blur-sm">
                <div>
                    <span class="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        ${metod.categoryLabel}
                    </span>
                    
                    <h3 class="text-xl font-bold text-white mt-4 mb-2 group-hover:text-blue-400 transition">
                        ${metod.title}
                    </h3>
                    
                    <p class="text-gray-400 text-sm line-clamp-3 leading-relaxed">
                        ${metod.description}
                    </p>
                    
                    <div class="flex items-center gap-4 mt-5 text-xs text-gray-400 bg-[#0f172a]/40 p-2.5 rounded-xl border border-gray-800/60 w-fit">
                        <span class="flex items-center gap-1">⏱ ${metod.duration}</span>
                        <span class="flex items-center gap-1">📊 ${metod.difficulty}</span>
                    </div>
                </div>
                
                <div class="mt-6 pt-4 border-t border-gray-800/60">
                    <a href="metod.html?id=${metod.id}" class="block text-center w-full bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white font-medium py-2.5 rounded-xl transition duration-200 border border-blue-500/20 text-sm">
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
    // Barcha tugmalarning aktiv dizaynini olib tashlash va eski holatiga qaytarish
    const buttons = document.querySelectorAll("#filter-buttons button");
    buttons.forEach(btn => {
        btn.className = "px-5 py-2.5 rounded-xl bg-[#1e293b] text-gray-300 border border-gray-700 font-medium transition hover:bg-gray-700 hover:text-white cursor-pointer text-sm";
    });

    // Bosilgan tugmaga ko'k (aktiv) rang berish
    const clickedButton = event.currentTarget;
    clickedButton.className = "px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium shadow-lg shadow-blue-500/20 transition hover:bg-blue-500 cursor-pointer text-sm";

    // Ma'lumotlarni saralash
    if (category === "all") {
        displayMetodlar(metodlarData);
    } else {
        const filtered = metodlarData.filter(m => m.category === category);
        displayMetodlar(filtered);
    }
}
