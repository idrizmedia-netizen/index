/* ============================================================
   Admin panel orqali qo'shilgan metodlarni Firestore'dan yuklaydi.
   Statik (data.js) ro'yxatga qo'shimcha sifatida ishlatiladi.
   ============================================================ */
async function loadRemoteMetodlar() {
    try {
        const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js');
        const { getFirestore, collection, getDocs, query, orderBy } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js');
        const firebaseConfig = {
            apiKey: 'AIzaSyA2LiNy7o7l6kn1FTvOcXqBs14M3PVsjbI',
            authDomain: 'ziyomap.firebaseapp.com',
            projectId: 'ziyomap',
            storageBucket: 'ziyomap.firebasestorage.app',
            messagingSenderId: '982123868162',
            appId: '1:982123868162:web:6845723988c030fcd1f71b',
        };
        const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        const db = getFirestore(app);
        const snap = await getDocs(query(collection(db, 'metodlar'), orderBy('createdAt', 'desc')));
        const items = [];
        snap.forEach((d) => {
            const data = d.data();
            items.push({
                id: d.id,
                title: data.title || '',
                category: data.category || 'yangi-mavzu',
                categoryLabel: data.categoryLabel || '',
                duration: data.duration || '',
                difficulty: data.difficulty || 'Oddiy',
                description: data.description || '',
                equipment: data.equipment || [],
                steps: data.steps || [],
                fileUrl: data.fileUrl || null,
                fileName: data.fileName || null,
            });
        });
        return items;
    } catch (err) {
        console.error("Qo'shimcha metodlarni yuklashda xatolik:", err);
        return [];
    }
}
