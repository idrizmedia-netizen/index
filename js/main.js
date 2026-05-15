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
   2. BLOG TIZIMI (SANITY CMS INTEGRATSIYASI)
   ========================================================== */

const PROJECT_ID = "25lh4m7u"; 
const DATASET = "production";
const QUERY = encodeURIComponent('*[_type == "post"]{title, date, category, preview, telegramLink, "imageUrl": mainImage.asset->url}');
const URL = `https://${PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${DATASET}?query=${QUERY}`;

async function fetchArticles() {
    try {
        const response = await fetch(URL);
        const data = await response.json();
        if(data.result) {
            renderArticles(data.result);
        }
    } catch (error) {
        console.error("Sanity-dan ma'lumot olishda xato:", error);
    }
}

function renderArticles(articles) {
    const blogContainer = document.querySelector('.blog-grid') || document.getElementById('blog-container');
    if(!blogContainer) return;
    
    blogContainer.innerHTML = ''; 

    articles.forEach(article => {
        blogContainer.innerHTML += `
            <div class="blog-card" data-aos="fade-up">
                <div class="card-img">
                    <img src="${article.imageUrl || 'https://via.placeholder.com/400x200'}" alt="${article.title}" style="width: 100%; border-radius: 8px;">
                </div>
                <div class="card-body" style="padding: 15px 0;">
                    <span class="category" style="color: #2563eb; font-weight: bold; font-size: 0.8rem;">${article.category || 'Maqola'}</span>
                    <h3 style="margin: 10px 0;">${article.title}</h3>
                    <p style="font-size: 0.9rem; color: #64748b;">${article.preview || ''}</p>
                    <a href="${article.telegramLink}" target="_blank" class="btn-tg" style="display: inline-block; margin-top: 10px; color: #2563eb; text-decoration: none; font-weight: bold;">
                         Telegramda o'qish →
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
