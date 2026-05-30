const SANITY_PROJECT_ID = '25lh4m7u';
const SANITY_DATASET = 'production';
const queryText =
    '*[_type == "post"] | order(publishedAt desc) { title, description, excerpt, body, telegramLink, category, categories[]->{title}, "categoryTitle": category->title, "imageUrl": mainImage.asset->url }';
const sanityUrl = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2021-10-21/data/query/${SANITY_DATASET}?query=${encodeURIComponent(queryText)}`;

function displaySanityPosts(posts) {
    const postsContainer = document.getElementById('posts-container');
    if (!postsContainer) return;
    if (!posts || posts.length === 0) {
        postsContainer.innerHTML =
            '<p style="text-align: center; grid-column: 1 / -1;">Hozircha maqolalar mavjud emas.</p>';
        return;
    }

    postsContainer.innerHTML = posts
        .map((post, index) => {
            const delay = index * 200;
            const imageUrl = post.imageUrl || 'https://via.placeholder.com/400x250?text=Ziyomap';
            let postCategory = 'Maqola';
            if (post.category) {
                postCategory =
                    typeof post.category === 'object'
                        ? post.category.title || post.category.name
                        : post.category;
            } else if (post.categories && post.categories[0]) {
                postCategory = post.categories[0].title || post.categories[0].name || 'Maqola';
            }
            if (postCategory === 'Yaqinda' || postCategory.includes('2026') || postCategory.includes('-')) {
                postCategory = "Fizika / Ta'lim";
            }

            let postDescription = "Ushbu maqola uchun qisqacha ta'rif kiritilmagan.";
            if (Array.isArray(post.description)) {
                postDescription = post.description
                    .map((block) =>
                        block.children ? block.children.map((c) => c.text).join('') : ''
                    )
                    .join(' ');
            } else if (Array.isArray(post.body)) {
                postDescription = post.body
                    .map((block) =>
                        block.children ? block.children.map((c) => c.text).join('') : ''
                    )
                    .join(' ');
            } else if (typeof post.description === 'string' && post.description.trim() !== '') {
                postDescription = post.description;
            } else if (typeof post.excerpt === 'string' && post.excerpt.trim() !== '') {
                postDescription = post.excerpt;
            }
            if (postDescription.length > 150) {
                postDescription = postDescription.substring(0, 150) + '...';
            }

            return `
                <div class="card" data-aos="fade-up" data-aos-delay="${delay}">
                    <div class="card-image" style="width: 100%; height: 200px; overflow: hidden; border-radius: 8px; margin-bottom: 15px;">
                        <img src="${imageUrl}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <span style="color: var(--primary-color); font-size: 0.85rem; font-weight: bold; text-transform: uppercase; margin-bottom: 10px; display: block;">${postCategory}</span>
                    <h3 style="margin-top: 0; margin-bottom: 12px; font-size: 1.4rem;">${post.title}</h3>
                    <p style="font-size: 0.95rem; line-height: 1.6; opacity: 0.9; margin-bottom: 25px;">${postDescription}</p>
                    <a href="${post.telegramLink || '#'}" target="_blank" class="btn" style="padding: 10px 25px; font-size: 14px; margin: 0; display: inline-block;">O'qish</a>
                </div>
            `;
        })
        .join('');
}

async function loadSanityPosts() {
    try {
        const response = await fetch(sanityUrl);
        const data = await response.json();
        if (data && data.result) {
            displaySanityPosts(data.result);
            if (typeof AOS !== 'undefined') AOS.refresh();
        }
    } catch (error) {
        console.error('Maqolalarni yuklashda xatolik:', error);
    }
}

loadSanityPosts();
