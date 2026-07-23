/* ===================================================
   ZIYOMAP — "Mening tanlov natijalarim" paneli
   dashboard.html ning body qismiga TEGMAYDI — o'zi
   yangi panel yaratib, .dash-wrap ichiga qo'shadi.
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

    function esc(str) {
        const d = document.createElement('div');
        d.textContent = str == null ? '' : String(str);
        return d.innerHTML;
    }

    function updateCountdowns(container) {
        if (!container) return;
        container.querySelectorAll('.countdown-timer').forEach((el) => {
            const target = new Date(el.dataset.countdownTarget);
            const label = el.dataset.countdownLabel || '';
            const diffMs = target.getTime() - Date.now();
            if (isNaN(target.getTime())) {
                el.textContent = '';
                return;
            }
            if (diffMs <= 0) {
                el.textContent = `${label} vaqti keldi!`;
                return;
            }
            const totalMinutes = Math.floor(diffMs / 60000);
            const days = Math.floor(totalMinutes / 1440);
            const hours = Math.floor((totalMinutes % 1440) / 60);
            const minutes = totalMinutes % 60;
            const parts = [];
            if (days) parts.push(`${days} kun`);
            if (hours || days) parts.push(`${hours} soat`);
            parts.push(`${minutes} daqiqa`);
            el.textContent = `\u23f0 ${label}: ${parts.join(' ')} qoldi`;
        });
    }

    function buildPanel() {
        const wrap = document.querySelector('.dash-wrap');
        if (!wrap) return null;
        const panel = document.createElement('div');
        panel.className = 'panel';
        panel.style.marginBottom = '28px';
        panel.innerHTML =
            '<div class="panel-title">🏆 Mening tanlov natijalarim</div>' +
            '<div id="myContestResults"><div style="color:var(--muted);text-align:center;padding:20px;font-size:13px">Yuklanmoqda...</div></div>';
        wrap.appendChild(panel);
        return panel.querySelector('#myContestResults');
    }

    async function load() {
        const user = window.ZiyomapUsage && ZiyomapUsage.getUser();
        if (!user || !user.uid) return;

        const target = buildPanel();
        if (!target) return;

        try {
            const { initializeApp, getApps, getApp } = await import(
                'https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js'
            );
            const { getAuth, onAuthStateChanged } = await import(
                'https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js'
            );
            const { getFirestore, collection, query, where, getDocs, doc, getDoc } = await import(
                'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js'
            );
            const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
            const authInst = getAuth(app);
            await new Promise((resolve) => {
                const unsub = onAuthStateChanged(authInst, () => {
                    unsub();
                    resolve();
                });
            });
            const db = getFirestore(app);
            const queryUid = (authInst.currentUser && authInst.currentUser.uid) || user.uid;

            const snap = await getDocs(query(collection(db, 'registrations'), where('uid', '==', queryUid)));

            if (snap.empty) {
                target.innerHTML =
                    '<div style="color:var(--muted);text-align:center;padding:20px;font-size:13px">' +
                    'Hali tanlovda ishtirok etmagansiz. <a href="tanlov-royxat.html" style="color:var(--primary);font-weight:700">Ro\u2018yxatdan o\u2018ting →</a></div>';
                return;
            }

            const regs = [];
            snap.forEach((d) => regs.push(d.data()));

            // Har bir tanlovning test/suhbat sanalarini olish uchun kontestlarni bitta marta yuklaymiz
            const contestIds = [...new Set(regs.map((r) => r.contestId).filter(Boolean))];
            const contestDates = {};
            await Promise.all(
                contestIds.map(async (cid) => {
                    try {
                        const cSnap = await getDoc(doc(db, 'contests', cid));
                        if (cSnap.exists()) contestDates[cid] = cSnap.data();
                    } catch (err) {
                        console.error('Tanlov ma\u2019lumotini yuklashda xatolik:', err);
                    }
                })
            );

            function fmtDate(iso) {
                if (!iso) return null;
                const d2 = new Date(iso);
                if (isNaN(d2.getTime())) return iso;
                return d2.toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
            }

            function pickCountdown(effTestStart, effTestEnd, effInterviewStart, effInterviewEnd, testEnded) {
                const now = new Date();
                if (!testEnded && effTestStart && now < new Date(effTestStart)) {
                    return { target: effTestStart, label: 'Testgacha' };
                }
                if (!testEnded && effTestEnd && effTestStart && now >= new Date(effTestStart) && now < new Date(effTestEnd)) {
                    return { target: effTestEnd, label: 'Test tugashiga' };
                }
                if (testEnded && effInterviewStart && now < new Date(effInterviewStart)) {
                    return { target: effInterviewStart, label: 'Suhbatgacha' };
                }
                if (testEnded && effInterviewEnd && effInterviewStart && now < new Date(effInterviewEnd)) {
                    return { target: effInterviewEnd, label: 'Suhbat tugashiga' };
                }
                return null;
            }

            let html = '';
            regs.forEach((r) => {
                const hasScore = r.score !== null && r.score !== undefined;
                const hasInterview = r.interviewScore !== null && r.interviewScore !== undefined;
                const hasOpen = r.openScore !== null && r.openScore !== undefined;
                const hasRank = r.rank !== null && r.rank !== undefined;
                const medal = r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : '🏆';
                const total = (r.score ?? 0) + (r.interviewScore ?? 0) + (r.openScore ?? 0);
                const c = contestDates[r.contestId] || {};

                // Shaxsiy (avtomatik taqsimlangan) vaqt bo'lsa o'shani, bo'lmasa tanlovning umumiy kunlar oralig'ini olamiz
                const fallbackTestStart = c.testDateStart ? `${c.testDateStart}T${c.testDailyStart || '00:00'}` : null;
                const fallbackTestEnd = c.testDateEnd ? `${c.testDateEnd}T${c.testDailyEnd || '23:59'}` : null;
                const fallbackInterviewStart = c.interviewDateStart ? `${c.interviewDateStart}T${c.interviewDailyStart || '00:00'}` : null;
                const fallbackInterviewEnd = c.interviewDateEnd ? `${c.interviewDateEnd}T${c.interviewDailyEnd || '23:59'}` : null;
                const effTestStart = r.assignedTestStart || fallbackTestStart;
                const effTestEnd = r.assignedTestEnd || fallbackTestEnd;
                const effInterviewStart = r.assignedInterviewStart || fallbackInterviewStart;
                const effInterviewEnd = r.assignedInterviewEnd || fallbackInterviewEnd;

                // Ketma-ketlik: test hali tugamagan yoki topshirilmagan bo'lsa — test vaqti ko'rsatiladi;
                // test oynasi tugagandan keyin — suhbat vaqti ko'rsatiladi (agar minimal ball talabi bo'lsa, shuni tekshiradi).
                const now = new Date();
                const testEnded = effTestEnd ? now > new Date(effTestEnd) : false;
                const belowThreshold = testEnded && hasScore && c.minScoreToAdvance != null && r.score < c.minScoreToAdvance;
                const dateBits = [];
                if (!testEnded && (effTestStart || effTestEnd)) {
                    dateBits.push(`Test vaqti: ${effTestStart ? fmtDate(effTestStart) : '\u2014'}${effTestEnd ? ' \u2013 ' + fmtDate(effTestEnd) : ''}`);
                } else if (belowThreshold) {
                    dateBits.push(`Suhbat bosqichiga o\u2018tish uchun minimal ball: ${c.minScoreToAdvance} (sizning balingiz: ${r.score}) \u2014 afsuski, bu safar suhbat bosqichiga o\u2018ta olmadingiz.`);
                } else if (effInterviewStart || effInterviewEnd) {
                    dateBits.push(`Suhbat vaqti: ${effInterviewStart ? fmtDate(effInterviewStart) : '\u2014'}${effInterviewEnd ? ' \u2013 ' + fmtDate(effInterviewEnd) : ''}`);
                } else if (effTestStart || effTestEnd) {
                    dateBits.push(`Test vaqti: ${effTestStart ? fmtDate(effTestStart) : '\u2014'}${effTestEnd ? ' \u2013 ' + fmtDate(effTestEnd) : ''}`);
                }

                const countdown = belowThreshold ? null : pickCountdown(effTestStart, effTestEnd, effInterviewStart, effInterviewEnd, testEnded);

                html += `<div class="activity-row">
                    <div class="act-icon" style="background:#fdf2f8;font-size:16px">${medal}</div>
                    <div style="flex:1">
                        <div class="act-label">${esc(r.contestTitle)}</div>
                        <div class="act-time">ID: ${esc(r.customId)}${hasScore ? ' \u00b7 Test: ' + esc(r.score) : ''}${hasInterview ? ' \u00b7 Suhbat: ' + esc(r.interviewScore) : ''}${hasOpen ? ' \u00b7 Ochiq savollar: ' + esc(r.openScore) : ''}</div>
                        ${dateBits.length ? `<div class="act-time" style="color:var(--primary)">${esc(dateBits.join(' \u00b7 '))}</div>` : ''}
                        ${countdown ? `<div class="act-time countdown-timer" data-countdown-target="${esc(countdown.target)}" data-countdown-label="${esc(countdown.label)}" style="color:#ea580c;font-weight:700"></div>` : ''}
                        ${hasRank ? `<div style="display:inline-block;margin-top:4px;padding:2px 10px;border-radius:20px;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;font-size:11px;font-weight:800">${esc(r.rank)}-o\u2018rin</div>` : ''}
                    </div>
                    <div style="font-weight:800;color:${hasScore || hasInterview || hasOpen ? 'var(--primary)' : 'var(--muted)'};text-align:right">
                        ${hasScore || hasInterview || hasOpen ? esc(total) + ' ball<br><span style=\'font-size:11px;font-weight:600;color:var(--muted)\'>jami</span>' : 'Kutilmoqda'}
                    </div>
                </div>`;
            });
            target.innerHTML = html;
            updateCountdowns(target);
            clearInterval(window.__ziyomapCountdownInterval);
            window.__ziyomapCountdownInterval = setInterval(() => updateCountdowns(target), 30000);
        } catch (err) {
            console.error('Natijalarni yuklashda xatolik:', err);
            target.innerHTML = '<div style="color:var(--muted);text-align:center;padding:20px;font-size:13px">Yuklashda xatolik yuz berdi.</div>';
        }
    }

    window.addEventListener('load', () => setTimeout(load, 400));
})();
