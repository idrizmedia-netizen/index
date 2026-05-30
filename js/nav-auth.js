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

        if (user) {
            const name = user.displayName ? user.displayName.split(' ')[0] : 'Profil';
            if (btnAvatar) btnAvatar.src = user.photoURL || 'https://www.w3schools.com/howto/img_avatar.png';
            if (btnName) btnName.innerText = name;
            if (loginBtn) {
                loginBtn.style.background = '#10b981';
                loginBtn.href = '#';
                loginBtn.title = 'Profil va foydalanish tarixi';
            }
            if (userPhoto) userPhoto.src = user.photoURL || 'https://www.w3schools.com/howto/img_avatar.png';
            if (userName) userName.innerText = user.displayName || 'Foydalanuvchi';
            if (userEmail) {
                const prov = user.provider === 'phone' ? user.phoneNumber : user.provider === 'telegram' ? '@' + (user.username || 'telegram') : user.email || '';
                userEmail.innerText = prov || '';
            }
        } else {
            if (btnAvatar) btnAvatar.src = 'https://www.w3schools.com/howto/img_avatar.png';
            if (btnName) btnName.innerText = 'Kirish';
            if (loginBtn) {
                loginBtn.style.background = '';
                loginBtn.href = 'kirish.html';
                loginBtn.title = 'Google orqali kirish';
            }
            if (userPhoto) userPhoto.src = '';
            if (userName) userName.innerText = 'Mehmon';
            if (userEmail) userEmail.innerText = '—';
            if (dropdown) dropdown.classList.remove('show');
            if (historySection) historySection.style.display = 'none';
        }
    }

    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            if (!U.getUser()) return;
            e.preventDefault();
            if (dropdown) {
                dropdown.classList.toggle('show');
                if (dropdown.classList.contains('show')) renderUsageHistory();
            }
        });
    }

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
