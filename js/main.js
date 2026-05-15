/* ==========================================================
   1. LABORATORIYA TIZIMI (ESKI KOD - O'ZGARISHLARSIZ)
   ========================================================== */

// Filtr tugmalarini avtomatik yaratish funksiyasi
function createFilterButtons() {
    const labSection = document.querySelector("#lab");
    const grid = document.querySelector("#lab .grid");
    
    if (!labSection || !grid) return;

    // Mavjud kategoriyalarni aniqlash
    const categories = ['all', ...new Set(physicsLabs.map(lab => lab.category.toLowerCase()))];

    let filterContainer = document.querySelector(".filter-container");
    if (!filterContainer) {
        filterContainer = document.createElement("div");
        filterContainer.className = "filter-container";
        filterContainer.style.textAlign = "center";
        filterContainer.style.marginBottom = "30px";
        labSection.insertBefore(filterContainer, grid);
    }

    filterContainer.innerHTML = categories.map(cat => `
        <button onclick="renderLabs('${cat}')" class="btn btn-outline" 
                style="margin: 5px; padding: 8px 20px; text-transform: capitalize; border-color: #2563eb; color: #2563eb;">
            ${cat === 'all' ? 'Hammasi' : cat.replace('-', ' ')}
        </button>
    `).join('');
}

// Laboratoriyalarni ekranda chiqarish
function renderLabs(filterCategory = 'all') {
    const labGrid = document.querySelector("#lab .grid");
    if (!labGrid) return;

    labGrid.innerHTML = "";

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

    if (window.AOS) {
        AOS.refresh();
    }
}

// Avtomatik ishga tushirish (Dynamic Caller)
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

/* ==========================================================
   2. BLOG TIZIMI (SANITY CMS INTEGRATSIYASI - YANGILANGAN)
   ========================================================== */

const PROJECT_ID = "25lh4m7u"; 
const DATASET = "production";
// Yangilik: order(_createdAt desc) qo'shildi - yangi maqolalar birinchi chiqadi
const QUERY = encodeURIComponent('*[_type == "post"] | order(_createdAt desc){title, category, preview, telegramLink, "imageUrl": mainImage.asset->url}');
const URL = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${QUERY}`;

async function fetchArticles() {
    try {
        const response = await fetch(URL);
        const data = await response.json();
        if(data.result && data.result.length > 0) {
            renderArticles(data.result);
        } else {
            console.log("Hozircha maqolalar yo'q yoki e'lon qilinmagan.");
        }
    } catch (error) {
        console.error("Sanity-dan ma'lumot olishda xato:", error);
    }
}

function renderArticles(articles) {
    // HTML-dagi container id-si bo'yicha qidiramiz
    const blogContainer = document.querySelector('.blog-grid') || document.getElementById('blog-container');
    if(!blogContainer) return;
    
    blogContainer.innerHTML = ''; 

    articles.forEach(article => {
        // Rasm bo'lmasa, chiroyli standart rasm qo'yamiz
        const imgDisplay = article.imageUrl ? article.imageUrl : 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000&auto=format&fit=crop';
        
        blogContainer.innerHTML += `
            <div class="blog-card" data-aos="fade-up" style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: white; margin-bottom: 20px;">
                <div class="card-img" style="height: 200px; overflow: hidden;">
                    <img src="${imgDisplay}" alt="${article.title}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div class="card-body" style="padding: 20px;">
                    <span class="category" style="background: #eff6ff; color: #2563eb; padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 0.75rem; text-transform: uppercase;">
                        ${article.category || 'Fizika'}
                    </span>
                    <h3 style="margin: 15px 0 10px 0; color: #1e293b; font-size: 1.25rem;">${article.title}</h3>
                    <p style="font-size: 0.95rem; color: #64748b; line-height: 1.6; margin-bottom: 15px;">${article.preview || ''}</p>
                    <a href="${article.telegramLink || '#'}" target="_blank" class="btn-tg" style="display: flex; align-items: center; color: #2563eb; text-decoration: none; font-weight: 700; gap: 8px;">
                        Telegramda o'qish <i class="fas fa-arrow-right" style="font-size: 0.8rem;"></i>
                    </a>
                </div>
            </div>
        `;
    });
}

/* ==========================================================
   3. SAHIFA YUKLANISHI (BARCHASINI ISHGA TUSHIRISH)
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    // Laboratoriya qismini yuklash
    if (typeof physicsLabs !== 'undefined') {
        createFilterButtons(); 
        renderLabs(); 
    }

    // Blog qismini yuklash (Sanity)
    fetchArticles();
});
