// metodlar/js/detail.js

document.addEventListener("DOMContentLoaded", () => {
    // 1. URL tarkibidagi query-parametrdan metod ID'sini ajratib olish (?id=aqliy-hujum)
    const params = new URLSearchParams(window.location.search);
    const metodId = params.get("id");

    // 2. data.js ichidagi massivdan shu ID'ga mos keladigan metod ob'ektini qidirish
    const metod = metodlarData.find(m => m.id === metodId);

    const container = document.getElementById("metod-content");

    // Agar metod topilmasa xatolik xabarini ko'rsatish
    if (!metod) {
        container.innerHTML = `
            <div class="text-center py-10">
                <h2 class="text-2xl font-bold text-red-500 mb-2">❌ Metod topilmadi!</h2>
                <p class="text-gray-400 text-sm">Siz qidirayotgan sahifa mavjud emas yoki o'chirilgan.</p>
                <a href="index.html" class="inline-block mt-6 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition">
                    Ro'yxatga qaytish
                </a>
            </div>
        `;
        return;
    }

    // 3. Kerakli jihozlar (equipment) ro'yxatini HTML ko'rinishida shakllantirish
    const equipmentList = metod.equipment.map(item => `
        <span class="px-3 py-1.5 bg-[#0f172a]/60 rounded-xl text-xs font-medium text-gray-300 border border-gray-800">
            🛠 ${item}
        </span>
    `).join("");

    // 4. Qadamlarni (steps) tartib raqami bilan, bosqichma-bosqich shakllantirish
    const stepsList = metod.steps.map((step, index) => `
        <div class="flex gap-4 items-start p-4 bg-[#0f172a]/20 rounded-2xl border border-gray-800/40 hover:border-blue-500/20 transition duration-200">
            <div class="flex-shrink-0 w-8 h-8 rounded-xl bg-blue-600/10 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-sm">
                ${index + 1}
            </div>
            <p class="text-gray-300 text-sm md:text-base leading-relaxed pt-0.5">${step}</p>
        </div>
    `).join("");

    // 5. Tayyorlangan ma'lumotlarni asosiy HTML blok ichiga joylashtirish
    container.innerHTML = `
        <span class="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
            ${metod.categoryLabel}
        </span>
        
        <h1 class="text-2xl md:text-3xl font-bold text-white mt-4 mb-3">${metod.title}</h1>
        
        <p class="text-gray-400 text-sm md:text-base leading-relaxed mb-6 italic">
            "${metod.description}"
        </p>
        
        <div class="flex flex-wrap gap-4 p-4 bg-[#0f172a]/40 rounded-2xl mb-8 border border-gray-800/60 text-xs md:text-sm text-gray-300">
            <div><span class="text-gray-500">⏱ Davomiyligi:</span> <strong class="text-white">${metod.duration}</strong></div>
            <div class="hidden md:block text-gray-700">|</div>
            <div><span class="text-gray-500">📊 Tayyorgarlik darajasi:</span> <strong class="text-white">${metod.difficulty}</strong></div>
        </div>

        <div class="mb-8">
            <h3 class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Kerakli jihozlar:</h3>
            <div class="flex flex-wrap gap-2">${equipmentList}</div>
        </div>

        <hr class="border-gray-800 my-8">

        <div>
            <h3 class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4">🎯 Dars ssenariysi (Bosqichma-bosqich):</h3>
            <div class="space-y-3">${stepsList}</div>
        </div>
    `;
});
