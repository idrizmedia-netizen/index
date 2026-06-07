(function () {
    const U = window.ZiyomapUsage;
    if (!U) return;

    const loginBtn = document.getElementById('login-btn');
    const dropdown = document.getElementById('myDropdown');
    const logoutBtn = document.getElementById('logout-btn');
    const historyList = document.getElementById('usage-history-list');
    const historyEmpty = document.getElementById('usage-history-empty');
    const historySection = document.getElementById('usage-history-section');

    function renderUsageHistory() {
        if (!historyList) return;
        const items = U.getUsageHistory();
        if (historySection) historySection.style.display = 'block';
        if (items.length === 0) {
            historyList.innerHTML = '';
            if (historyEmpty) historyEmpty.style.display = 'block';
            return;
        }
        if (historyEmpty) historyEmpty.style.display = 'none';
        historyList.innerHTML = items
            .map(
                (item) =>
                    `<li class="usage-item"><span class="usage-label">${item.label}</span><span class="usage-time">${U.formatWhen(item.at)}</span></li>`
            )
            .join('');
    }

    function syncProfileUI() {
        const user = U.getUser();
        const btnAvatar = document.getElementById('btn-user-avatar');
        const btnName = document.getElementById('btn-user-name');
        const userPhoto = document.getElementById('user-photo');
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        const btnAvatarM = document.getElementById('btn-user-avatar-m');
        const btnNameM = document.getElementById('login-btn-m');

        if (user) {
            const name = user.displayName ? user.displayName.split(' ')[0] : 'Profil';
            if (btnAvatar) btnAvatar.src = user.photoURL || 'https://www.w3schools.com/howto/img_avatar.png';
            if (btnAvatarM) btnAvatarM.src = user.photoURL || 'https://www.w3schools.com/howto/img_avatar.png';
            if (btnName) btnName.innerText = name;
            if (btnNameM) { const s = btnNameM.querySelector('span'); if (s) s.innerText = name; }
            if (loginBtn) {
                loginBtn.style.background = '#10b981';
                loginBtn.href = '#';
                loginBtn.title = 'Profil va foydalanish tarixi';
            }
            if (mobileLoginBtn) {
                mobileLoginBtn.style.background = '#10b981';
                mobileLoginBtn.href = '#';
                mobileLoginBtn.title = 'Profil va foydalanish tarixi';
            }
            if (userPhoto) userPhoto.src = user.photoURL || 'https://www.w3schools.com/howto/img_avatar.png';
            if (userName) userName.innerText = user.displayName || 'Foydalanuvchi';
            if (userEmail) {
                let prov = '';
                if (user.provider === 'phone') prov = user.phoneNumber || '';
                else if (user.provider === 'telegram') prov = '@' + (user.username || 'telegram');
                else if (user.provider === 'local') prov = 'Login: ' + (user.localLogin || '—');
                else if (user.provider === 'guest') prov = 'Mehmon (ism bilan)';
                else prov = user.email || '';
                userEmail.innerText = prov || '';
            }
        } else {
            if (btnAvatar) btnAvatar.src = 'https://www.w3schools.com/howto/img_avatar.png';
            if (btnAvatarM) btnAvatarM.src = 'https://www.w3schools.com/howto/img_avatar.png';
            if (btnName) btnName.innerText = 'Kirish';
            if (btnNameM) { const s = btnNameM.querySelector('span'); if (s) s.innerText = 'Kirish'; }
            if (loginBtn) {
                loginBtn.style.background = '';
                loginBtn.href = 'kirish.html';
                loginBtn.title = 'Google orqali kirish';
            }
            if (mobileLoginBtn) {
                mobileLoginBtn.style.background = '';
                mobileLoginBtn.href = 'kirish.html';
                mobileLoginBtn.title = 'Google orqali kirish';
            }
            if (userPhoto) userPhoto.src = '';
            if (userName) userName.innerText = 'Mehmon';
            if (userEmail) userEmail.innerText = '—';
            if (dropdown) dropdown.classList.remove('show');
            if (historySection) historySection.style.display = 'none';
        }
    }

    function handleLoginClick(e) {
        if (!U.getUser()) return;
        e.preventDefault();
        if (dropdown) {
            dropdown.classList.toggle('show');
            if (dropdown.classList.contains('show')) renderUsageHistory();
        }
    }

    if (loginBtn) loginBtn.addEventListener('click', handleLoginClick);
    const mobileLoginBtn = document.getElementById('login-btn-m');
    if (mobileLoginBtn) mobileLoginBtn.addEventListener('click', handleLoginClick);

    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!confirm('Chiqishni xohlaysizmi? Foydalanish tarixi o‘chadi.')) return;
            U.clearSession();
            window.location.href = 'kirish.html?logout=1';
        });
    }

    window.addEventListener('click', (e) => {
        if (dropdown && dropdown.classList.contains('show')) {
            if (loginBtn && !loginBtn.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        }
    });

    document.querySelectorAll('[data-track]').forEach((el) => {
        el.addEventListener('click', () => {
            if (!U.getUser()) return;
            U.logUsage(el.dataset.track, el.dataset.trackLabel || el.dataset.track);
        });
    });

    syncProfileUI();
    if (U.getUser()) U.logUsage('bosh-sahifa', 'Bosh sahifa');
})();
