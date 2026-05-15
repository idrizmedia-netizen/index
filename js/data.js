// Barcha 9 ta bo'lim uchun laboratoriyalar bazasi (Jami: 27 ta)
const physicsLabs = [
    // 1. MEXANIKA
    { id: 1, category: "mexanika", title: "Matematik mayatnik", icon: "fa-tachometer-alt", component: "initPendulum" },
    { id: 2, category: "mexanika", title: "Erkin tushish", icon: "fa-arrow-down", component: "initFreeFall" },
    { id: 3, category: "mexanika", title: "Nyuton 2-qonuni", icon: "fa-dumbbell", component: "initNewtonTwo" },

    // 2. OPTIKA (Funksiya nomlari optika.js ga moslandi)
    { id: 11, category: "optika", title: "Yorug'likning qaytishi", icon: "fa-lightbulb", component: "initReflection" },
    { id: 12, category: "optika", title: "Yorug'likning sinishi", icon: "fa-water", component: "initRefraction" },
    { id: 13, category: "optika", title: "Yupqa linzalar", icon: "fa-glasses", component: "initLens" },

    // 3. ELEKTR
    { id: 21, category: "elektr", title: "Om qonuni (Zanjir)", icon: "fa-bolt", component: "initOhmCircuit" },
    { id: 22, category: "elektr", title: "Qarshiliklarni ulash", icon: "fa-microchip", component: "initResistors" },
    { id: 23, category: "elektr", title: "Kondensator quvvati", icon: "fa-battery-half", component: "initCapacitor" },

    // 4. TERMODINAMIKA
    { id: 31, category: "termodinamika", title: "Gaz qonunlari", icon: "fa-thermometer-half", component: "initGasLaws" },
    { id: 32, category: "termodinamika", title: "Broun harakati", icon: "fa-atom", component: "initBrownian" },
    { id: 33, category: "termodinamika", title: "Issiqlik muvozanati", icon: "fa-fire-alt", component: "initHeatEquilibrium" },

    // 5. TOLQINLAR
    { id: 41, category: "tolqinlar", title: "Tovush to'lqinlari", icon: "fa-volume-up", component: "initSoundWaves" },
    { id: 42, category: "tolqinlar", title: "Doppler effekti", icon: "fa-broadcast-tower", component: "initDoppler" },
    { id: 43, category: "tolqinlar", title: "Prujinali tebranish", icon: "fa-wave-square", component: "initSpring" },

    // 6. YADRO FIZIKASI
    { id: 51, category: "yadro-fizikasi", title: "Radioaktiv yemirilish", icon: "fa-radiation", component: "initRadioactive" },
    { id: 52, category: "yadro-fizikasi", title: "Fotoeffekt", icon: "fa-sun", component: "initPhotoEffect" },
    { id: 53, category: "yadro-fizikasi", title: "Bor atom modeli", icon: "fa-circle-notch", component: "initBohrModel" },

    // 7. ASTRONOMIYA
    { id: 61, category: "astronomiya", title: "Sayyoralar harakati", icon: "fa-globe-asia", component: "initPlanets" },
    { id: 62, category: "astronomiya", title: "Oy fazalari", icon: "fa-moon", component: "initMoonPhases" },
    { id: 63, category: "astronomiya", title: "Quyosh tizimi", icon: "fa-sun", component: "initSolarSystem" },

    // 8. AMALIY FIZIKA
    { id: 71, category: "amaliy-fizika", title: "Avtomobil tormozi", icon: "fa-car-crash", component: "initBrakingDistance" },
    { id: 72, category: "amaliy-fizika", title: "Liftda vaznsizlik", icon: "fa-arrows-alt-v", component: "initWeightless" },
    { id: 73, category: "amaliy-fizika", title: "Gidravlik press", icon: "fa-compress-arrows-alt", component: "initHydraulic" },

    // 9. PARADOKSLAR
    { id: 81, category: "paradokslar", title: "Vaqt dilatatsiyasi", icon: "fa-hourglass-start", component: "initTimeDilation" },
    { id: 82, category: "paradokslar", title: "Shryodinger mushugi", icon: "fa-cat", component: "initSchrodinger" },
    { id: 83, category: "paradokslar", title: "Egri fazo", icon: "fa-infinity", component: "initCurvedSpace" }
];
// --- SANITY KONFIGURATSIYASI VA MAQOLALAR FUNKSIYASI ---

// Rasmdagi ma'lumotlar asosida:
const sanityConfig = {
    projectId: "25lh4m7u", // Rasmdan olindi
    dataset: "production",
    useCdn: true,
    apiVersion: "2023-05-03"
};

/**
 * Sanity-dan maqolalarni tortib kelish va HTML-ga chiqarish funksiyasi
 */
async function fetchSanityPosts() {
    const container = document.getElementById('posts-container');
    
    // Agar sahifada posts-container bo'lmasa, funksiyani to'xtatish
    if (!container) return;

    // GROQ so'rovi: Maqolalarni sanasi bo'yicha tartiblab olish
    const query = encodeURIComponent('*[_type == "post"] | order(publishedAt desc)');
    const url = `https://${sanityConfig.projectId}.api.sanity.io/v2021-10-21/data/query/${sanityConfig.dataset}?query=${query}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.result && data.result.length > 0) {
            container.innerHTML = ""; // "Yuklanmoqda" yozuvini o'chirish

            data.result.forEach(post => {
                // Sanity-dan kelgan rasmni yasash (agar rasm bo'lsa)
                let imageUrl = 'https://via.placeholder.com/400x200?text=Ziyomap+Maqola';
                if (post.mainImage && post.mainImage.asset) {
                    // Sanity rasm URL-ini formatlash (soddalashtirilgan)
                    const ref = post.mainImage.asset._ref;
                    const assetId = ref.replace('image-', '').replace('-png', '.png').replace('-jpg', '.jpg');
                    imageUrl = `https://cdn.sanity.io/images/${sanityConfig.projectId}/${sanityConfig.dataset}/${assetId}`;
                }

                // Sanani formatlash
                const date = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('uz-UZ') : 'Yaqinda';

                // HTML kartochka yaratish
                const postHtml = `
                    <div class="card" data-aos="fade-up">
                        <div class="post-image-wrapper" style="width:100%; height:180px; overflow:hidden; border-radius:10px; margin-bottom:15px;">
                            <img src="${imageUrl}" alt="${post.title}" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                        <span style="color: #64748b; font-size: 0.85rem; margin-bottom: 10px; display: block;">${date}</span>
                        <h3 style="font-size: 1.2rem; margin-bottom: 10px;">${post.title}</h3>
                        <p style="font-size: 0.9rem; color: #475569; line-height: 1.5; margin-bottom: 15px;">
                            ${post.excerpt || 'Ushbu maqola orqali fizika va texnologiyaning yangi qirralarini kashf qiling.'}
                        </p>
                        <a href="/post/${post.slug?.current || '#'}" class="btn" style="padding: 8px 15px; font-size: 0.85rem; text-decoration:none; display:inline-block;">O'qish</a>
                    </div>
                `;
                container.innerHTML += postHtml;
            });
        } else {
            container.innerHTML = "<p style='text-align:center; grid-column: 1/-1;'>Hozircha maqolalar mavjud emas.</p>";
        }
    } catch (error) {
        console.error("Sanity-dan ma'lumot olishda xato:", error);
        container.innerHTML = "<p style='text-align:center; grid-column: 1/-1; color:red;'>Maqolalarni yuklashda xatolik yuz berdi. CORS sozlamalarini tekshiring.</p>";
    }
}

// Sahifa yuklanganda maqolalarni chaqirish
document.addEventListener('DOMContentLoaded', fetchSanityPosts);
