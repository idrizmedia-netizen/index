/* ===================================================
   ZIYOMAP — "Guruhlar" va "Do'stlar" (real-time chat) moduli
   Mavjud fayllarning birortasiga ham tegmaydi. Ikki bo'lim:
   1) Guruhlar   — faqat admin yaratadi; tanlovdan ro'yxatdan
                   o'tgan foydalanuvchi tegishli guruhga
                   avtomatik qo'shiladi (bu qism tanlov-royxat.js
                   ichida, GURUHLAR-QOLLANMA.md dagi qo'shimcha orqali sodir bo'ladi).
   2) Do'stlar   — foydalanuvchilar bir-biriga so'rov yuborib,
                   qabul qilingach ikkovi o'zaro yozishadi.
   =================================================== */
(function () {
    'use strict';

    const firebaseConfig = {
        apiKey: 'AIzaSyA2LiNy7o7l6kn1FTvOcXqBs14M3PVsjbI',
        authDomain: 'ziyomap.firebaseapp.com',
        projectId: 'ziyomap',
        storageBucket: 'ziyomap.firebasestorage.app',
        messagingSenderId: '982123868162',
        appId: '1:982123868162:web:6845723988c030fcd1f71b',
    };

    const els = {};
    let db, authInst, currentUser;
    let fb = {};
    let selectedGroupId = null;
    let selectedFriendUid = null;
    let groupsCache = [];
    let friendsCache = [];
    let unsubGroupMemberships, unsubGroupMessages;
    let unsubIncomingRequests, unsubFriendships, unsubDmMessages;

    function esc(str) {
        const d = document.createElement('div');
        d.textContent = str == null ? '' : String(str);
        return d.innerHTML;
    }
    function initials(name) {
        return (name || '?').trim().slice(0, 2).toUpperCase();
    }
    const PALETTE = ['#0d9488', '#4f46e5', '#d97706', '#db2777', '#0891b2', '#7c3aed'];
    function colorFor(str) {
        let hash = 0;
        for (let i = 0; i < (str || '').length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
        return PALETTE[Math.abs(hash) % PALETTE.length];
    }
    function timeStr(ts) {
        if (!ts) return '';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });
    }
    function pairId(a, b) {
        return a < b ? `${a}_${b}` : `${b}_${a}`;
    }

    function cacheEls() {
        [
            'guruh-gate', 'guruh-app', 'guruh-login-link',
            'tab-groups-btn', 'tab-friends-btn', 'panel-groups', 'panel-friends',
            'guruh-list', 'guruh-new-btn',
            'guruh-modal', 'guruh-modal-name', 'guruh-modal-desc', 'guruh-modal-contest', 'guruh-modal-create', 'guruh-modal-cancel',
            'guruh-no-selection', 'guruh-chat-pane', 'guruh-chat-title', 'guruh-chat-desc',
            'guruh-messages', 'guruh-text-input', 'guruh-send-btn',
            'guruh-me-name', 'guruh-me-avatar',
            'dost-search-input', 'dost-search-btn', 'dost-search-result',
            'dost-requests-list', 'dost-friends-list',
            'dost-no-selection', 'dost-chat-pane', 'dost-chat-title',
            'dost-messages', 'dost-text-input', 'dost-send-btn',
        ].forEach((id) => (els[id] = document.getElementById(id)));
    }

    /* ============ TABS ============ */
    function showTab(tab) {
        const isGroups = tab === 'groups';
        els['panel-groups'].style.display = isGroups ? 'flex' : 'none';
        els['panel-friends'].style.display = isGroups ? 'none' : 'flex';
        els['tab-groups-btn'].classList.toggle('active', isGroups);
        els['tab-friends-btn'].classList.toggle('active', !isGroups);
    }

    /* ============ GURUHLAR ============ */
    function renderGroups() {
        const list = els['guruh-list'];
        if (!groupsCache.length) {
            list.innerHTML = '<div class="guruh-empty"><p>Siz hali hech qanday guruhga qo\'shilmagansiz</p><span>Admin sizni guruhga qo\'shganda yoki tanlovdan ro\'yxatdan o\'tganingizda bu yerda paydo bo\'ladi.</span></div>';
            return;
        }
        list.innerHTML = groupsCache
            .map((g) => {
                const active = g.id === selectedGroupId ? ' guruh-item-active' : '';
                const c = colorFor(g.name);
                return `<div class="guruh-item${active}" data-id="${esc(g.id)}">
                    <div class="guruh-avatar" style="background:${c}20;color:${c}">${esc(initials(g.name))}</div>
                    <div class="guruh-item-text">
                        <div class="guruh-item-name">${esc(g.name)}</div>
                        ${g.desc ? `<div class="guruh-item-desc">${esc(g.desc)}</div>` : ''}
                    </div>
                </div>`;
            })
            .join('');
        list.querySelectorAll('.guruh-item').forEach((item) => item.addEventListener('click', () => selectGroup(item.dataset.id)));
    }

    function renderMessages(container, list, mineUid) {
        if (!list.length) {
            container.innerHTML = '<div class="guruh-empty-msgs">Hali xabar yo\'q. Birinchi bo\'lib yozing!</div>';
            return;
        }
        container.innerHTML = list
            .map((m) => {
                const mine = m.uid === mineUid;
                const c = colorFor(m.name || m.uid || '');
                return `<div class="guruh-msg-row ${mine ? 'mine' : ''}">
                    ${!mine ? `<div class="guruh-avatar sm" style="background:${c}20;color:${c}">${esc(initials(m.name))}</div>` : ''}
                    <div class="guruh-msg-col">
                        ${!mine ? `<div class="guruh-author">${esc(m.name || 'Foydalanuvchi')}</div>` : ''}
                        <div class="guruh-bubble ${mine ? 'mine' : ''}">${esc(m.text)}</div>
                        <div class="guruh-time ${mine ? 'right' : ''}">${timeStr(m.createdAt)}</div>
                    </div>
                </div>`;
            })
            .join('');
        container.scrollTop = container.scrollHeight;
    }

    async function loadMyGroups() {
        // Eski usul (collectionGroup so'rovi) ba'zi hollarda "Missing or
        // insufficient permissions" xatoligini berardi. Shuning uchun endi
        // shunchaki o'zimizning users/{uid} hujjatidagi groupIds ro'yxatini
        // o'qiymiz — bu har doim ishonchli ishlaydi.
        const { doc, onSnapshot, getDoc } = fb;
        unsubGroupMemberships = onSnapshot(
            doc(db, 'users', currentUser.uid),
            async (userSnap) => {
                const groupIds = (userSnap.exists() && userSnap.data().groupIds) || [];
                const groups = [];
                for (const gid of groupIds) {
                    try {
                        const gs = await getDoc(doc(db, 'chat-groups', gid));
                        if (gs.exists()) groups.push({ id: gid, ...gs.data() });
                    } catch (e) { /* o'chirilgan guruh bo'lishi mumkin */ }
                }
                groupsCache = groups;
                renderGroups();
            },
            (err) => {
                console.error("Guruhlarni yuklashda xatolik:", err);
                els['guruh-list'].innerHTML =
                    '<div class="guruh-empty"><p>Guruhlarni yuklab bo\'lmadi</p><span>Sahifani yangilab ko\'ring. Davom etsa, F12 → Console dagi xatoni tekshiring.</span></div>';
            }
        );
    }

    async function selectGroup(id) {
        selectedGroupId = id;
        renderGroups();
        const group = groupsCache.find((g) => g.id === id);
        if (!group) return;
        els['guruh-no-selection'].style.display = 'none';
        els['guruh-chat-pane'].style.display = 'flex';
        els['guruh-chat-title'].textContent = group.name;
        els['guruh-chat-desc'].textContent = group.desc || '';
        els['guruh-chat-desc'].style.display = group.desc ? 'block' : 'none';

        if (unsubGroupMessages) unsubGroupMessages();
        const { collection, query, orderBy, onSnapshot } = fb;
        const q = query(collection(db, 'chat-groups', id, 'messages'), orderBy('createdAt', 'asc'));
        unsubGroupMessages = onSnapshot(q, (snap) => {
            renderMessages(els['guruh-messages'], snap.docs.map((d) => d.data()), currentUser.uid);
        });
    }

    async function createGroup() {
        if (!(window.ZiyomapAdminGuard && ZiyomapAdminGuard.isAdmin)) return;
        const name = (els['guruh-modal-name'].value || '').trim();
        const desc = (els['guruh-modal-desc'].value || '').trim();
        const contestId = (els['guruh-modal-contest'].value || '').trim();
        if (!name) return;
        const { collection, addDoc, doc, setDoc, serverTimestamp } = fb;
        try {
            const ref = await addDoc(collection(db, 'chat-groups'), {
                name,
                desc,
                contestId: contestId || null,
                createdBy: currentUser.uid,
                createdAt: serverTimestamp(),
            });
            await setDoc(doc(db, 'chat-groups', ref.id, 'members', currentUser.uid), {
                uid: currentUser.uid,
                name: currentUser.displayName || 'Admin',
                joinedAt: serverTimestamp(),
            });
            closeGroupModal();
        } catch (e) {
            alert("Guruh yaratishda xatolik yuz berdi. Qayta urinib ko'ring.");
        }
    }

    async function sendGroupMessage() {
        const text = (els['guruh-text-input'].value || '').trim();
        if (!text || !selectedGroupId) return;
        els['guruh-text-input'].value = '';
        const { collection, addDoc, serverTimestamp } = fb;
        try {
            await addDoc(collection(db, 'chat-groups', selectedGroupId, 'messages'), {
                uid: currentUser.uid,
                name: currentUser.displayName || 'Foydalanuvchi',
                text,
                createdAt: serverTimestamp(),
            });
        } catch (e) {
            alert("Xabar yuborilmadi. Qayta urinib ko'ring.");
        }
    }

    function openGroupModal() {
        els['guruh-modal'].style.display = 'flex';
        els['guruh-modal-name'].value = '';
        els['guruh-modal-desc'].value = '';
        els['guruh-modal-contest'].value = '';
        els['guruh-modal-name'].focus();
    }
    function closeGroupModal() {
        els['guruh-modal'].style.display = 'none';
    }

    /* ============ DO'STLAR ============ */
    async function searchFriend() {
        const email = (els['dost-search-input'].value || '').trim().toLowerCase();
        const resultBox = els['dost-search-result'];
        if (!email) return;
        resultBox.innerHTML = '<div class="dost-hint">Qidirilmoqda…</div>';
        const { collection, query, where, getDocs, addDoc, serverTimestamp } = fb;
        try {
            const snap = await getDocs(query(collection(db, 'users'), where('email', '==', email)));
            if (snap.empty) {
                resultBox.innerHTML = '<div class="dost-hint">Bunday email bilan foydalanuvchi topilmadi.</div>';
                return;
            }
            const found = snap.docs[0];
            const uid = found.id;
            if (uid === currentUser.uid) {
                resultBox.innerHTML = '<div class="dost-hint">Bu sizning emailingiz.</div>';
                return;
            }
            const name = found.data().displayName || email;
            const c = colorFor(name);
            resultBox.innerHTML = `<div class="dost-found">
                <div class="guruh-avatar sm" style="background:${c}20;color:${c}">${esc(initials(name))}</div>
                <span>${esc(name)}</span>
                <button id="dost-send-request-btn">So'rov yuborish</button>
            </div>`;
            document.getElementById('dost-send-request-btn').addEventListener('click', async () => {
                try {
                    await addDoc(collection(db, 'friend-requests'), {
                        fromUid: currentUser.uid,
                        fromName: currentUser.displayName || 'Foydalanuvchi',
                        toUid: uid,
                        status: 'pending',
                        createdAt: serverTimestamp(),
                    });
                    resultBox.innerHTML = '<div class="dost-hint">So\'rov yuborildi ✓</div>';
                } catch (e) {
                    resultBox.innerHTML = '<div class="dost-hint">So\'rov yuborilmadi. Balki avval yuborilgan.</div>';
                }
            });
        } catch (e) {
            resultBox.innerHTML = '<div class="dost-hint">Qidiruvda xatolik yuz berdi.</div>';
        }
    }

    async function loadIncomingRequests() {
        const { collection, query, where, onSnapshot } = fb;
        const q = query(collection(db, 'friend-requests'), where('toUid', '==', currentUser.uid), where('status', '==', 'pending'));
        unsubIncomingRequests = onSnapshot(q, (snap) => {
            const list = els['dost-requests-list'];
            if (snap.empty) {
                list.innerHTML = '';
                return;
            }
            list.innerHTML = `<div class="dost-section-title">So'rovlar</div>` + snap.docs
                .map((d) => {
                    const r = d.data();
                    const c = colorFor(r.fromName);
                    return `<div class="dost-request" data-id="${d.id}" data-from="${esc(r.fromUid)}" data-name="${esc(r.fromName)}">
                        <div class="guruh-avatar sm" style="background:${c}20;color:${c}">${esc(initials(r.fromName))}</div>
                        <span class="dost-req-name">${esc(r.fromName)}</span>
                        <button class="dost-accept" title="Qabul qilish"><i class="fa-solid fa-check"></i></button>
                        <button class="dost-decline" title="Rad etish"><i class="fa-solid fa-xmark"></i></button>
                    </div>`;
                })
                .join('');
            list.querySelectorAll('.dost-accept').forEach((btn) => {
                const row = btn.closest('.dost-request');
                btn.addEventListener('click', () => respondRequest(row.dataset.id, row.dataset.from, row.dataset.name, true));
            });
            list.querySelectorAll('.dost-decline').forEach((btn) => {
                const row = btn.closest('.dost-request');
                btn.addEventListener('click', () => respondRequest(row.dataset.id, row.dataset.from, row.dataset.name, false));
            });
        });
    }

    async function respondRequest(reqId, fromUid, fromName, accept) {
        const { doc, updateDoc, setDoc, serverTimestamp } = fb;
        try {
            await updateDoc(doc(db, 'friend-requests', reqId), { status: accept ? 'accepted' : 'declined' });
            if (accept) {
                const id = pairId(currentUser.uid, fromUid);
                await setDoc(doc(db, 'friendships', id), {
                    uids: [currentUser.uid, fromUid].sort(),
                    createdAt: serverTimestamp(),
                });
            }
        } catch (e) {
            alert("Amalni bajarishda xatolik yuz berdi.");
        }
    }

    async function loadFriendships() {
        const { collection, query, where, onSnapshot, doc, getDoc } = fb;
        const q = query(collection(db, 'friendships'), where('uids', 'array-contains', currentUser.uid));
        unsubFriendships = onSnapshot(q, async (snap) => {
            const friends = [];
            for (const d of snap.docs) {
                const uids = d.data().uids || [];
                const otherUid = uids.find((u) => u !== currentUser.uid);
                if (!otherUid) continue;
                try {
                    const us = await getDoc(doc(db, 'users', otherUid));
                    friends.push({ pairId: d.id, uid: otherUid, name: us.exists() ? us.data().displayName : 'Foydalanuvchi' });
                } catch (e) { /* ignore */ }
            }
            friendsCache = friends;
            renderFriends();
        });
    }

    function renderFriends() {
        const list = els['dost-friends-list'];
        const header = '<div class="dost-section-title">Do\'stlar</div>';
        if (!friendsCache.length) {
            list.innerHTML = header + '<div class="dost-hint">Hali do\'stlaringiz yo\'q. Yuqoridan email orqali qidiring.</div>';
            return;
        }
        list.innerHTML = header + friendsCache
            .map((f) => {
                const active = f.uid === selectedFriendUid ? ' guruh-item-active' : '';
                const c = colorFor(f.name);
                return `<div class="guruh-item${active}" data-uid="${esc(f.uid)}" data-pair="${esc(f.pairId)}">
                    <div class="guruh-avatar" style="background:${c}20;color:${c}">${esc(initials(f.name))}</div>
                    <div class="guruh-item-text"><div class="guruh-item-name">${esc(f.name)}</div></div>
                </div>`;
            })
            .join('');
        list.querySelectorAll('.guruh-item').forEach((item) =>
            item.addEventListener('click', () => selectFriend(item.dataset.uid, item.dataset.pair))
        );
    }

    async function selectFriend(uid, pid) {
        selectedFriendUid = uid;
        renderFriends();
        const friend = friendsCache.find((f) => f.uid === uid);
        if (!friend) return;
        els['dost-no-selection'].style.display = 'none';
        els['dost-chat-pane'].style.display = 'flex';
        els['dost-chat-title'].textContent = friend.name;

        if (unsubDmMessages) unsubDmMessages();
        const { collection, query, orderBy, onSnapshot } = fb;
        const q = query(collection(db, 'friendships', pid, 'messages'), orderBy('createdAt', 'asc'));
        unsubDmMessages = onSnapshot(q, (snap) => {
            renderMessages(els['dost-messages'], snap.docs.map((d) => d.data()), currentUser.uid);
        });
    }

    async function sendDmMessage() {
        const text = (els['dost-text-input'].value || '').trim();
        const friend = friendsCache.find((f) => f.uid === selectedFriendUid);
        if (!text || !friend) return;
        els['dost-text-input'].value = '';
        const { collection, addDoc, serverTimestamp } = fb;
        try {
            await addDoc(collection(db, 'friendships', friend.pairId, 'messages'), {
                uid: currentUser.uid,
                name: currentUser.displayName || 'Foydalanuvchi',
                text,
                createdAt: serverTimestamp(),
            });
        } catch (e) {
            alert("Xabar yuborilmadi. Qayta urinib ko'ring.");
        }
    }

    /* ============ ADMIN TUGMASI ============ */
    // admin-guard.js data-admin-only elementlarni o'zi ham ko'rsatadi/yashiradi,
    // lekin bu yerda ham to'g'ridan-to'g'ri tekshirib, ikki karra ishonchli qilamiz.
    function updateAdminButton() {
        const isAdmin = !!(window.ZiyomapAdminGuard && ZiyomapAdminGuard.isAdmin);
        if (els['guruh-new-btn']) els['guruh-new-btn'].style.display = isAdmin ? '' : 'none';
    }

    /* ============ UMUMIY ============ */
    function bindEvents() {
        els['tab-groups-btn'].addEventListener('click', () => showTab('groups'));
        els['tab-friends-btn'].addEventListener('click', () => showTab('friends'));

        els['guruh-new-btn'].addEventListener('click', openGroupModal);
        els['guruh-modal-cancel'].addEventListener('click', closeGroupModal);
        els['guruh-modal'].addEventListener('click', (e) => { if (e.target === els['guruh-modal']) closeGroupModal(); });
        els['guruh-modal-create'].addEventListener('click', createGroup);
        els['guruh-send-btn'].addEventListener('click', sendGroupMessage);
        els['guruh-text-input'].addEventListener('keydown', (e) => { if (e.key === 'Enter') sendGroupMessage(); });

        els['dost-search-btn'].addEventListener('click', searchFriend);
        els['dost-search-input'].addEventListener('keydown', (e) => { if (e.key === 'Enter') searchFriend(); });
        els['dost-send-btn'].addEventListener('click', sendDmMessage);
        els['dost-text-input'].addEventListener('keydown', (e) => { if (e.key === 'Enter') sendDmMessage(); });
    }

    async function boot() {
        cacheEls();

        if (!(window.ZiyomapUsage && ZiyomapUsage.isLoggedIn())) {
            els['guruh-gate'].style.display = 'flex';
            els['guruh-app'].style.display = 'none';
            if (els['guruh-login-link'] && window.ZiyomapAuthGuard) {
                els['guruh-login-link'].href = ZiyomapAuthGuard.loginUrl(window.location.href);
            }
            return;
        }

        els['guruh-gate'].style.display = 'none';
        els['guruh-app'].style.display = 'flex';

        const localUser = ZiyomapUsage.getUser();
        els['guruh-me-name'].textContent = localUser.displayName || 'Foydalanuvchi';
        const c = colorFor(localUser.displayName || localUser.uid || '');
        els['guruh-me-avatar'].style.background = c + '20';
        els['guruh-me-avatar'].style.color = c;
        els['guruh-me-avatar'].textContent = initials(localUser.displayName);

        const { initializeApp, getApps, getApp } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js');
        const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js');
        const firestoreMod = await import('https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js');
        fb = firestoreMod;

        const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
        authInst = getAuth(app);
        db = fb.getFirestore(app);

        currentUser = await new Promise((resolve) => {
            const unsub = onAuthStateChanged(authInst, (u) => { unsub(); resolve(u); });
        });

        if (!currentUser) {
            els['guruh-gate'].style.display = 'flex';
            els['guruh-app'].style.display = 'none';
            return;
        }

        bindEvents();
        showTab('groups');
        loadMyGroups();
        loadIncomingRequests();
        loadFriendships();

        updateAdminButton();
        document.addEventListener('ziyomap-admin-checked', updateAdminButton);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', boot);
    } else {
        boot();
    }
})();
