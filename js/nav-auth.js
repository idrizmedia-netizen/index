(function () {
    const U = window.ZiyomapUsage;
    if (!U) return;

    const loginBtn   = document.getElementById('login-btn');
    const mobileLoginBtn = document.getElementById('login-btn-m');
    const logoutBtn  = document.getElementById('logout-btn');

    /* Eski dropdown elementlari — mavjud bo'lsa yashiriladi */
    const dropdown      = document.getElementById('myDropdown');
    const historyList   = document.getElementById('usage-history-list');
    const historyEmpty  = document.getElementById('usage-history-empty');
    const historySection= document.getElementById('usage-history-section');

    /* Dropdownni butunlay o'chirish */
    if (dropdown) dropdown.style.display = 'none';

    /* ── Profil UI ni yangilash ── */
    function syncProfileUI() {
        const user = U.getUser();

        /* Avatar va ism elementlari */
        const btnAvatar  = document.getElementById('btn-user-avatar');
        const btnName    = document.getElementById('btn-user-name');
        const btnAvatarM = document.getElementById('btn-user-avatar-m');
        const userPhoto  = document.getElementById('user-photo');
        const userName   = document.getElementById('user-name');
        const userEmail  = document.getElementById('user-email');

        if (user) {
            const firstName = user.displayName ? user.displayName.split(' ')[0] : 'Profil';
            const photo     = user.photoURL || 'https://www.w3schools.com/howto/img_avatar.png';

            /* Desktop avatar + ism */
            if (btnAvatar) btnAvatar.src = photo;
            if (btnName)   btnName.innerText = firstName;

            /* Mobile avatar + ism */
            if (btnAvatarM) btnAvatarM.src = photo;
            if (mobileLoginBtn) {
                const s = mobileLoginBtn.querySelector('span');
                if (s) s.innerText = firstName;
            }

            /* Tugma rangi: yashil = kirgan */
            if (loginBtn) {
                loginBtn.style.background = '#10b981';
                loginBtn.href = 'dashboard.html';
                loginBtn.title = 'Shaxsiy kabinet';
                loginBtn.onclick = null; // dropdown ochmasin
            }
            if (mobileLoginBtn) {
                mobileLoginBtn.style.background = '#10b981';
                mobileLoginBtn.href = 'dashboard.html';
                mobileLoginBtn.onclick = null;
            }

            /* Dropdown ichidagi ma'lumotlar (agar hali DOM da bo'lsa) */
            if (userPhoto) userPhoto.src = photo;
            if (userName)  userName.innerText = user.displayName || 'Foydalanuvchi';
            if (userEmail) {
                let prov = '';
                if (user.provider === 'local')    prov = 'Login: ' + (user.localLogin || '—');
                else if (user.provider === 'guest') prov = 'Mehmon (ism bilan)';
                else prov = user.email || '';
                userEmail.innerText = prov;
            }

        } else {
            /* Tizimga kirmagan */
            const defaultPhoto = 'https://www.w3schools.com/howto/img_avatar.png';
            if (btnAvatar)  btnAvatar.src  = defaultPhoto;
            if (btnAvatarM) btnAvatarM.src = defaultPhoto;
            if (btnName)    btnName.innerText = 'Kirish';
            if (mobileLoginBtn) {
                const s = mobileLoginBtn.querySelector('span');
                if (s) s.innerText = 'Kirish';
            }

            if (loginBtn) {
                loginBtn.style.background = '';
                loginBtn.href  = 'kirish.html';
                loginBtn.title = 'Google orqali kirish';
                loginBtn.onclick = null;
            }
            if (mobileLoginBtn) {
                mobileLoginBtn.style.background = '';
                mobileLoginBtn.href  = 'kirish.html';
                mobileLoginBtn.onclick = null;
            }
        }
    }

    /* ── Logout (agar sahifada bo'lsa) ── */
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!confirm('Chiqishni xohlaysizmi?')) return;
            U.clearSession();
            window.location.href = 'kirish.html?logout=1';
        });
    }

    /* ── Faollik kuzatish ── */
    document.querySelectorAll('[data-track]').forEach((el) => {
        el.addEventListener('click', () => {
            if (!U.getUser()) return;
            U.logUsage(el.dataset.track, el.dataset.trackLabel || el.dataset.track);
        });
    });

    /* ── Ishga tushirish ── */
    syncProfileUI();
    if (U.getUser()) U.logUsage('bosh-sahifa', 'Bosh sahifa');
})();
