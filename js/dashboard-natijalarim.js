/* ===================================================
   ZIYOMAP — "Mening tanlov natijalarim" paneli
   dashboard.html ning body qismiga TEGMAYDI — o'zi
   yangi panel yaratib, .dash-wrap ichiga qo'shadi.

   Bu yerda: test boshlash, suhbatga kirish, suhbat bileti
   va to'lov (kvitansiya/"Men to'ladim") funksiyalari ham bor —
   ro'yxatdan o'tish sahifasiga qaytib yurish shart emas.
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

    let db, authInst, updateDocFn, docFn, setDocFn, serverTimestampFn;

    function esc(str) {
        const d = document.createElement('div');
        d.textContent = str == null ? '' : String(str);
        return d.innerHTML;
    }

    function fmtDate(iso) {
        if (!iso) return null;
        const d2 = new Date(iso);
        if (isNaN(d2.getTime())) return iso;
        return d2.toLocaleString('uz-UZ', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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
            const { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc, setDoc, serverTimestamp } = await import(
                'https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js'
            );
            const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
            authInst = getAuth(app);
            await new Promise((resolve) => {
                const unsub = onAuthStateChanged(authInst, () => {
                    unsub();
                    resolve();
                });
            });
            db = getFirestore(app);
            docFn = doc;
            updateDocFn = updateDoc;
            setDocFn = setDoc;
            serverTimestampFn = serverTimestamp;
            const queryUid = (authInst.currentUser && authInst.currentUser.uid) || user.uid;

            const snap = await getDocs(query(collection(db, 'registrations'), where('uid', '==', queryUid)));

            if (snap.empty) {
                target.innerHTML =
                    '<div style="color:var(--muted);text-align:center;padding:20px;font-size:13px">' +
                    'Hali tanlovda ishtirok etmagansiz. <a href="tanlov-royxat.html" style="color:var(--primary);font-weight:700">Ro\u2018yxatdan o\u2018ting →</a></div>';
                return;
            }

            const regs = [];
            snap.forEach((d) => regs.push({ id: d.id, ...d.data() }));

            // Har bir tanlovning ma'lumotlarini (sanalar, test, suhbat biletlari) bitta marta yuklaymiz
            const contestIds = [...new Set(regs.map((r) => r.contestId).filter(Boolean))];
            const contestDates = {};
            const testDocs = {};
            const ticketDocs = {};
            await Promise.all(
                contestIds.map(async (cid) => {
                    try {
                        const [cSnap, tSnap, tkSnap] = await Promise.all([
                            getDoc(doc(db, 'contests', cid)),
                            getDoc(doc(db, 'tests', cid)),
                            getDoc(doc(db, 'interview-tickets', cid)),
                        ]);
                        if (cSnap.exists()) contestDates[cid] = cSnap.data();
                        if (tSnap.exists()) testDocs[cid] = tSnap.data();
                        if (tkSnap.exists()) ticketDocs[cid] = tkSnap.data();
                    } catch (err) {
                        console.error('Tanlov ma\u2019lumotini yuklashda xatolik:', err);
                    }
                })
            );

            let signatureSettings = {};
            try {
                const sigSnap = await getDoc(doc(db, 'site-content', 'diploma-signature'));
                if (sigSnap.exists()) signatureSettings = sigSnap.data();
            } catch (err) {
                console.error('Imzo ma\u2019lumotini yuklashda xatolik:', err);
            }

            let html = '';
            let historyHtml = '';
            regs.forEach((r) => {
                const hasScore = r.score !== null && r.score !== undefined;
                const hasInterview = r.interviewScore !== null && r.interviewScore !== undefined;
                const hasOpen = r.openScore !== null && r.openScore !== undefined;
                const hasRank = r.rank !== null && r.rank !== undefined;
                const medal = r.rank === 1 ? '🥇' : r.rank === 2 ? '🥈' : r.rank === 3 ? '🥉' : '🏆';
                const total = (r.score ?? 0) + (r.interviewScore ?? 0) + (r.openScore ?? 0);
                const c = contestDates[r.contestId] || {};
                const test = testDocs[r.contestId] || null;

                const fallbackTestStart = c.testDateStart ? `${c.testDateStart}T${c.testDailyStart || '00:00'}` : null;
                const fallbackTestEnd = c.testDateEnd ? `${c.testDateEnd}T${c.testDailyEnd || '23:59'}` : null;
                const fallbackInterviewStart = c.interviewDateStart ? `${c.interviewDateStart}T${c.interviewDailyStart || '00:00'}` : null;
                const fallbackInterviewEnd = c.interviewDateEnd ? `${c.interviewDateEnd}T${c.interviewDailyEnd || '23:59'}` : null;
                const effTestStart = r.assignedTestStart || fallbackTestStart;
                const effTestEnd = r.assignedTestEnd || fallbackTestEnd;
                const effInterviewStart = r.assignedInterviewStart || fallbackInterviewStart;
                const effInterviewEnd = r.assignedInterviewEnd || fallbackInterviewEnd;

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
                    if (c.interviewQuestionsCount || c.interviewMaxScore) {
                        const parts = [];
                        if (c.interviewQuestionsCount) parts.push(`${c.interviewQuestionsCount} ta savol so\u2018raladi`);
                        if (c.interviewMaxScore) parts.push(`umumiy ${c.interviewMaxScore} ball`);
                        dateBits.push(`Suhbat haqida: ${parts.join(', ')}`);
                    }
                    if (c.interviewResponsibleEmail) {
                        dateBits.push(`Bog\u2018lanish: ${c.interviewResponsibleEmail}`);
                    }
                } else if (effTestStart || effTestEnd) {
                    dateBits.push(`Test vaqti: ${effTestStart ? fmtDate(effTestStart) : '\u2014'}${effTestEnd ? ' \u2013 ' + fmtDate(effTestEnd) : ''}`);
                }
                if (c.regStartDate || c.regEndDate) {
                    dateBits.push(`Ro\u2018yxatdan o\u2018tish: ${c.regStartDate || '\u2014'} \u2013 ${c.regEndDate || '\u2014'}`);
                }
                const contactBits = [];
                if (c.organizer) contactBits.push(`Tashkilotchi: ${c.organizer}`);
                if (c.responsibleName) contactBits.push(`Mas\u2019ul shaxs: ${c.responsibleName}${c.responsiblePhone ? ' (' + c.responsiblePhone + ')' : ''}`);

                const countdown = belowThreshold ? null : pickCountdown(effTestStart, effTestEnd, effInterviewStart, effInterviewEnd, testEnded);

                // ── Harakat tugmalari: Testni boshlash / Suhbatga kirish ──
                const actionBtns = [];
                const retakeActive = r.retakeUntil && new Date() <= new Date(r.retakeUntil);
                if (test && test.published && (!testEnded || retakeActive)) {
                    actionBtns.push(`<a href="test.html?contest=${r.contestId}" class="dash-action-btn" style="background:var(--primary)"><i class="fas fa-file-pen"></i> Testni boshlash</a>`);
                }
                const meetEnabled = c.meetLinkEnabled !== false;
                const nowForMeet = new Date();
                const withinInterviewWindow =
                    (!effInterviewStart || nowForMeet >= new Date(effInterviewStart)) &&
                    (!effInterviewEnd || nowForMeet <= new Date(effInterviewEnd));
                if (c.meetLink && meetEnabled && !belowThreshold && withinInterviewWindow) {
                    actionBtns.push(`<a href="${esc(c.meetLink)}" target="_blank" rel="noopener" class="dash-action-btn" style="background:#059669"><i class="fas fa-video"></i> Suhbatga kirish</a>`);
                }
                if (hasRank) {
                    actionBtns.push(`<button type="button" class="dash-action-btn" data-diploma="${r.id}" style="background:linear-gradient(135deg,#f59e0b,#ea580c)"><i class="fas fa-award"></i> Diplomni yuklab olish</button>`);
                } else if (hasScore || hasInterview) {
                    actionBtns.push(`<button type="button" class="dash-action-btn" data-certificate="${r.id}" style="background:#6366f1"><i class="fas fa-certificate"></i> Ishtirok sertifikati</button>`);
                }

                // ── Suhbat bileti: suhbatdan 10 daqiqa oldin va suhbat davomida ko'rinadi ──
                let ticketHtml = '';
                if (!belowThreshold && r.assignedTicketNumber && effInterviewStart) {
                    const showFrom = new Date(new Date(effInterviewStart).getTime() - 10 * 60000);
                    const showUntil = effInterviewEnd ? new Date(effInterviewEnd) : new Date(new Date(effInterviewStart).getTime() + 60 * 60000);
                    if (now >= showFrom && now <= showUntil) {
                        const ticket = (ticketDocs[r.contestId]?.tickets || []).find((t) => String(t.number) === String(r.assignedTicketNumber));
                        if (ticket) {
                            ticketHtml = `<div class="dash-sub-box" style="background:#eef2ff;border:1px solid #c7d2fe">
                                <p style="font-weight:800;color:#3730a3;margin-bottom:8px"><i class="fas fa-ticket"></i> Sizning suhbat biletingiz: №${esc(ticket.number)}</p>
                                <ol style="padding-left:20px;color:#312e81;font-size:0.9rem;margin:0">
                                    ${ticket.questions.map((q) => `<li>${esc(q)}</li>`).join('')}
                                </ol>
                                <p style="color:var(--muted);font-size:0.78rem;margin-top:6px">Suhbat boshida admin/komissiyaga bilet raqamingizni ayting va shu savollarga javob bering.</p>
                            </div>`;
                        }
                    }
                }

                // ── To'lov bo'limi (agar tanlov pullik bo'lsa) ──
                let paymentHtml = '';
                if (c.isPaid) {
                    const status = r.paymentStatus;
                    let deadlineDate = null;
                    if (fallbackTestStart) {
                        deadlineDate = new Date(fallbackTestStart);
                        deadlineDate.setDate(deadlineDate.getDate() - 1);
                    }
                    const deadlineText = deadlineDate ? fmtDate(deadlineDate.toISOString()) : 'belgilanmagan';
                    let statusText = '';
                    let showConfirmForm = false;
                    if (status === 'paid') {
                        statusText = '\u2705 To\u2018lovingiz admin tomonidan tasdiqlangan.';
                    } else if (status === 'tekshirilmoqda') {
                        statusText = `\u{1F4E4} To\u2018lovingiz haqida ma\u2019lumot qabul qilindi, tekshirilmoqda. To\u2018lov muddati: ${deadlineText}.`;
                    } else if (status === 'bekor_qilindi') {
                        statusText = '\u274c Ro\u2018yxatingiz to\u2018lov muddati o\u2018tganligi sababli bekor qilingan. Savollar bo\u2018lsa admin bilan bog\u2018laning.';
                    } else {
                        statusText = `\u23f3 To\u2018lov holati: kutilmoqda. To\u2018lov muddati: ${deadlineText}. Iltimos, kvitansiyadagi ma\u2019lumotlar bo\u2018yicha o\u2018tkazma qiling, so\u2018ng "Men to\u2018ladim" tugmasini bosing.`;
                        showConfirmForm = true;
                    }
                    paymentHtml = `<div class="dash-sub-box" data-payment-box style="background:#fffbeb;border:1px solid #fde68a">
                        <p style="font-weight:800;color:#92400e;margin-bottom:6px"><i class="fas fa-money-bill-wave"></i> Bu tanlov pullik</p>
                        <p style="font-size:0.85rem;color:#92400e">${esc(statusText)}</p>
                        <button type="button" class="dash-action-btn" data-show-receipt="${r.id}" style="background:#f59e0b;margin-top:8px"><i class="fas fa-receipt"></i> Kvitansiyani ko\u2018rsatish</button>
                        <div data-receipt-box="${r.id}" style="display:none;margin-top:14px;padding:16px;border-radius:12px;background:#fff;border:2px dashed var(--border);text-align:left">
                            <h4 style="margin-bottom:8px;text-align:center">To\u2018lov kvitansiyasi</h4>
                            <p><b>Tanlov:</b> ${esc(r.contestTitle)}</p>
                            <p><b>Ishtirokchi:</b> ${esc(r.fullName)}</p>
                            <p><b>ID:</b> ${esc(r.customId)}</p>
                            <p><b>Summa:</b> ${esc(c.paymentAmount || '?')} so\u2018m</p>
                            <p><b>Hisob/karta raqami:</b> ${esc(c.paymentAccount || '\u2014')}</p>
                            <p><b>Qabul qiluvchi:</b> ${esc(c.paymentReceiver || '\u2014')}</p>
                            <p><b>To\u2018lov muddati:</b> ${esc(deadlineText)}</p>
                            <p style="background:#fef3c7;padding:10px;border-radius:8px;margin:10px 0"><b>\u26a0\ufe0f O\u2018tkazma izohiga albatta shu kodni yozing:</b><br><span style="font-size:1.1rem;font-weight:800;color:#92400e">TOLOV-${esc(r.customId)}</span></p>
                            <div style="display:flex;justify-content:center;margin:14px 0" data-qr-box="${r.id}"></div>
                            <button type="button" class="dash-action-btn" data-print-receipt="${r.id}" style="background:var(--primary)"><i class="fas fa-print"></i> Chop etish</button>
                        </div>
                        ${showConfirmForm ? `
                        <div style="margin-top:14px;padding-top:14px;border-top:1px dashed #fbbf24">
                            <p style="font-weight:700;font-size:0.85rem;color:#92400e;margin-bottom:8px">O\u2018tkazmani amalga oshirgandan so\u2018ng:</p>
                            <input type="file" accept="image/*" data-receipt-input="${r.id}">
                            <p style="color:#92400e;font-size:0.75rem;margin-top:6px">Chek/o\u2018tkazma skrinshotini yuklang (ixtiyoriy, lekin tezroq tasdiqlanishi uchun tavsiya etiladi).</p>
                            <button type="button" class="dash-action-btn" data-mark-paid="${r.id}" style="background:#059669;margin-top:10px"><i class="fas fa-check"></i> Men to\u2018ladim</button>
                            <p data-payment-self-status="${r.id}" style="font-size:0.78rem;margin-top:6px"></p>
                        </div>` : ''}
                    </div>`;
                }

                const rowHtml = `<div class="activity-row-wrap" style="border-bottom:1px solid var(--border);padding-bottom:14px;margin-bottom:14px">
                    <div class="activity-row" style="border:none;padding:0;margin:0">
                        <div class="act-icon" style="background:#fdf2f8;font-size:16px">${medal}</div>
                        <div style="flex:1">
                            <div class="act-label">${esc(r.contestTitle)}</div>
                            <div class="act-time">ID: ${esc(r.customId)}${hasScore ? ' \u00b7 Test: ' + esc(r.score) : ''}${hasInterview ? ' \u00b7 Suhbat: ' + esc(r.interviewScore) : ''}${hasOpen ? ' \u00b7 Ochiq savollar: ' + esc(r.openScore) : ''}</div>
                            ${dateBits.length ? `<div class="act-time" style="color:var(--primary)">${esc(dateBits.join(' \u00b7 '))}</div>` : ''}
                            ${contactBits.length ? `<div class="act-time" style="color:var(--muted)">${esc(contactBits.join(' \u00b7 '))}</div>` : ''}
                            ${countdown ? `<div class="act-time countdown-timer" data-countdown-target="${esc(countdown.target)}" data-countdown-label="${esc(countdown.label)}" style="color:#ea580c;font-weight:700"></div>` : ''}
                            ${hasRank ? `<div style="display:inline-block;margin-top:4px;padding:2px 10px;border-radius:20px;background:linear-gradient(135deg,#f59e0b,#ea580c);color:#fff;font-size:11px;font-weight:800">${esc(r.rank)}-o\u2018rin</div>` : ''}
                        </div>
                        <div style="font-weight:800;color:${hasScore || hasInterview || hasOpen ? 'var(--primary)' : 'var(--muted)'};text-align:right">
                            ${hasScore || hasInterview || hasOpen ? esc(total) + ' ball<br><span style=\'font-size:11px;font-weight:600;color:var(--muted)\'>jami</span>' : 'Kutilmoqda'}
                        </div>
                    </div>
                    ${actionBtns.length ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 0 52px">${actionBtns.join('')}</div>` : ''}
                    ${ticketHtml}
                    ${paymentHtml}
                </div>`;

                // Tanlov: ro'yxatdan o'tishdan boshlab, suhbat tugab, g'oliblar e'lon qilinmaguncha
                // "faol" hisoblanadi. G'oliblar e'lon qilingach (rank belgilangach) — "Tanlov tarixi"ga o'tadi.
                if (hasRank) {
                    historyHtml += rowHtml;
                } else {
                    html += rowHtml;
                }
            });
            if (!html && historyHtml) {
                html = '<div style="color:var(--muted);text-align:center;padding:14px;font-size:13px">Hozircha faol tanlovingiz yo\u2018q.</div>';
            }
            if (historyHtml) {
                html += `<details style="margin-top:10px">
                    <summary style="cursor:pointer;font-weight:700;color:var(--primary);font-size:0.9rem;padding:8px 0">📜 Tanlov tarixi (${historyHtml.split('activity-row-wrap').length - 1} ta yakunlangan)</summary>
                    <div style="margin-top:8px">${historyHtml}</div>
                </details>`;
            }
            target.innerHTML = html;
            updateCountdowns(target);
            clearInterval(window.__ziyomapCountdownInterval);
            window.__ziyomapCountdownInterval = setInterval(() => updateCountdowns(target), 30000);

            wirePaymentActions(target, regs, contestDates);
            wireCertificateActions(target, regs, contestDates, signatureSettings);
        } catch (err) {
            console.error('Natijalarni yuklashda xatolik:', err);
            target.innerHTML = '<div style="color:var(--muted);text-align:center;padding:20px;font-size:13px">Yuklashda xatolik yuz berdi.</div>';
        }
    }

    function ordinalUz(n) {
        return `${n}-o\u2018rin`;
    }

    const UZ_MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
    function fmtCertDate(d) {
        return `${d.getFullYear()}-yil ${d.getDate()}-${UZ_MONTHS[d.getMonth()]}`;
    }

    function formatOfficialName(name) {
        if (!name) return '';
        const parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0];
        const surname = parts[0];
        const initials = parts.slice(1).map((p) => p[0].toUpperCase() + '.').join('');
        return `${surname} ${initials}`;
    }

    function buildCertificateHtml(r, c, isWinner, certNumber, signatureSettings) {
        const today = fmtCertDate(new Date());
        const total = (r.score ?? 0) + (r.interviewScore ?? 0) + (r.openScore ?? 0);
        const logoUrl = `${window.location.origin}/images/nav-icon.png`;
        const verifyUrl = `${window.location.origin}/tasdiqlash.html?id=${encodeURIComponent(certNumber)}`;

        // Rang mavzulari: 1/2/3-o'rin uchun tilla/kumush/bronza, boshqa o'rinlar va oddiy
        // ishtirok sertifikati uchun brendga mos alohida ranglar.
        const romanDegree = { 1: 'I', 2: 'II', 3: 'III' };
        const themes = {
            1: { label: 'I DARAJALI DIPLOM', bg: 'linear-gradient(160deg,#fffdf3 0%,#fdf3d0 55%,#faedb0 100%)', border: '#c99a1e', ring: '#f2c94c', text: '#7a5b0a', deep: '#8a6512', medal: '🥇' },
            2: { label: 'II DARAJALI DIPLOM', bg: 'linear-gradient(160deg,#fbfcfe 0%,#e9edf3 55%,#dbe1ea 100%)', border: '#8b96a3', ring: '#c3cdd8', text: '#3f4a56', deep: '#526071', medal: '🥈' },
            3: { label: 'III DARAJALI DIPLOM', bg: 'linear-gradient(160deg,#fdf5ec 0%,#f3ddc2 55%,#e8c69e 100%)', border: '#a5622a', ring: '#cb8a4f', text: '#6b3d17', deep: '#87491c', medal: '🥉' },
        };
        const defaultWinnerTheme = { label: 'DIPLOM', bg: 'linear-gradient(160deg,#f8f5ff 0%,#ece3fb 55%,#ddcdf7 100%)', border: '#7c3aed', ring: '#a78bfa', text: '#4c1d95', deep: '#5b21b6', medal: '🏆' };
        const certTheme = { label: 'SERTIFIKAT', bg: 'linear-gradient(160deg,#f0f7ff 0%,#dbeafe 55%,#c3ddfb 100%)', border: '#2563eb', ring: '#60a5fa', text: '#1e3a8a', deep: '#1e40af', medal: '🎓' };

        const theme = isWinner ? (themes[r.rank] || defaultWinnerTheme) : certTheme;

        const mainText = isWinner
            ? `<b>${esc(r.contestTitle)}</b> tanlovida<br><span class="cert-rank">${ordinalUz(r.rank)}</span>ni egallagani uchun taqdim etiladi`
            : `<b>${esc(r.contestTitle)}</b> tanlovida faol ishtirok etganligi uchun taqdim etiladi`;
        const scoreLine = (r.score != null || r.interviewScore != null)
            ? `<div class="cert-score">Umumiy natija: <b>${esc(total)} ball</b></div>`
            : '';
        const rawSignerName = signatureSettings.signerName || c.responsibleName || c.organizer || 'Ziyomap';
        const signerName = formatOfficialName(rawSignerName);
        const signatureImg = signatureSettings.signatureImageUrl
            ? `<img src="${signatureSettings.signatureImageUrl}" class="cert-signature-img" alt="">`
            : '';

        return `<!DOCTYPE html><html lang="uz"><head><meta charset="UTF-8"><title>${esc(theme.label)} \u2014 ${esc(r.fullName)}</title>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"><\/script>
        <style>
            @page { size: landscape; margin: 0; }
            *{box-sizing:border-box}
            body{
                font-family:'Montserrat',sans-serif;margin:0;padding:36px;
                background:#e7e2d8;color:${theme.text};
            }
            .cert-outer{
                position:relative;overflow:hidden;
                border:3px solid ${theme.border};border-radius:10px;
                background:${theme.bg};
                min-height:560px;padding:6px;
            }
            .cert-inner{
                position:relative;height:100%;
                border:2px solid ${theme.ring};border-radius:6px;
                padding:40px 60px 30px;text-align:center;
                display:flex;flex-direction:column;align-items:center;justify-content:center;
                min-height:540px;
            }
            .cert-watermark{
                position:absolute;top:50%;left:50%;width:340px;height:340px;
                transform:translate(-50%,-50%);opacity:0.06;pointer-events:none;
                background-image:url('${logoUrl}');background-size:contain;background-repeat:no-repeat;background-position:center;
            }
            .cert-corner{position:absolute;width:40px;height:40px;border:3px solid ${theme.border};opacity:0.65}
            .cc-tl{top:14px;left:14px;border-right:none;border-bottom:none;border-top-left-radius:6px}
            .cc-tr{top:14px;right:14px;border-left:none;border-bottom:none;border-top-right-radius:6px}
            .cc-bl{bottom:14px;left:14px;border-right:none;border-top:none;border-bottom-left-radius:6px}
            .cc-br{bottom:14px;right:14px;border-left:none;border-top:none;border-bottom-right-radius:6px}
            .cert-medal{font-size:52px;margin-bottom:2px;filter:drop-shadow(0 2px 3px rgba(0,0,0,0.15))}
            .cert-brand{
                font-family:'Playfair Display',serif;font-weight:700;font-size:15px;
                letter-spacing:5px;color:${theme.deep};margin-bottom:20px;text-transform:uppercase;
                display:flex;align-items:center;gap:10px;
            }
            .cert-brand::before,.cert-brand::after{content:'';width:36px;height:1px;background:${theme.border}}
            .cert-title{
                font-family:'Playfair Display',serif;font-weight:800;font-size:42px;
                letter-spacing:3px;color:${theme.deep};margin-bottom:24px;text-transform:uppercase;
                text-shadow:0 1px 0 rgba(255,255,255,0.5);
            }
            .cert-given-to{font-size:13px;letter-spacing:3px;text-transform:uppercase;color:${theme.text};opacity:0.65;margin-bottom:10px}
            .cert-name{
                font-family:'Playfair Display',serif;font-size:36px;font-weight:700;color:${theme.deep};
                padding:2px 36px 14px;margin-bottom:22px;position:relative;
            }
            .cert-name::after{content:'';position:absolute;bottom:0;left:15%;right:15%;height:2px;background:${theme.border}}
            .cert-text{font-size:16px;line-height:1.8;max-width:640px;margin-bottom:14px;color:${theme.text}}
            .cert-rank{
                font-family:'Playfair Display',serif;font-weight:700;font-size:20px;color:${theme.deep};
            }
            .cert-score{font-size:14px;color:${theme.deep};margin-bottom:20px;font-weight:600;letter-spacing:0.5px}
            .cert-footer{
                display:flex;justify-content:space-between;align-items:flex-end;
                width:100%;max-width:660px;margin-top:16px;gap:14px;
            }
            .cert-footer-block{font-size:12px;color:${theme.text};opacity:0.85;text-align:center;flex:1}
            .cert-footer-line{border-top:1.5px solid ${theme.border};padding-top:6px;min-width:150px;min-height:14px;display:flex;align-items:flex-end;justify-content:center}
            .cert-signature-img{max-height:44px;max-width:150px;object-fit:contain;margin-bottom:-4px}
            .cert-qr-block{display:flex;flex-direction:column;align-items:center;font-size:10px;color:${theme.text};opacity:0.85}
            #cert-qr{margin-bottom:4px}
            .cert-num{position:absolute;bottom:16px;left:50%;transform:translateX(-50%);font-size:10px;letter-spacing:1px;color:${theme.text};opacity:0.5}
        </style>
        </head><body>
        <div class="cert-outer">
            <div class="cert-inner">
                <div class="cert-watermark"></div>
                <div class="cert-corner cc-tl"></div>
                <div class="cert-corner cc-tr"></div>
                <div class="cert-corner cc-bl"></div>
                <div class="cert-corner cc-br"></div>
                <div class="cert-medal">${theme.medal}</div>
                <div class="cert-brand">ZIYOMAP</div>
                <div class="cert-title">${esc(theme.label)}</div>
                <div class="cert-given-to">Ushbu hujjat quyidagi shaxsga taqdim etiladi</div>
                <div class="cert-name">${esc(r.fullName)}</div>
                <div class="cert-text">${mainText}</div>
                ${scoreLine}
                <div class="cert-footer">
                    <div class="cert-footer-block"><div class="cert-footer-line">${esc(today)}</div>Berilgan sana</div>
                    <div class="cert-qr-block"><div id="cert-qr"></div>Haqiqiyligini tekshirish</div>
                    <div class="cert-footer-block"><div class="cert-footer-line">${signatureImg}</div>${esc(signerName)}</div>
                </div>
                <div class="cert-num">${esc(certNumber)}</div>
            </div>
        </div>
        <script>
            window.onload = () => {
                try { new QRCode(document.getElementById('cert-qr'), { text: ${JSON.stringify(verifyUrl)}, width: 64, height: 64 }); } catch (e) {}
                setTimeout(() => window.print(), 500);
            };
        <\/script>
        </body></html>`;
    }

    function wireCertificateActions(container, regs, contestDates, signatureSettings) {
        container.querySelectorAll('[data-diploma], [data-certificate]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.diploma || btn.dataset.certificate;
                const r = regs.find((x) => x.id === id);
                if (!r) return;
                const c = contestDates[r.contestId] || {};
                const isWinner = !!btn.dataset.diploma;
                const certNumber = `ZM-${(r.customId || '').replace(/[^0-9A-Za-z]/g, '')}-${new Date().getFullYear()}`;

                // Tasdiqlash uchun ommaviy o'qiladigan qisqa yozuv saqlanadi (QR shu yerga ishora qiladi)
                try {
                    await setDocFn(docFn(db, 'certificates', certNumber), {
                        uid: (authInst.currentUser && authInst.currentUser.uid) || null,
                        fullName: r.fullName,
                        contestTitle: r.contestTitle,
                        isWinner,
                        rank: isWinner ? r.rank : null,
                        score: (r.score ?? 0) + (r.interviewScore ?? 0) + (r.openScore ?? 0),
                        issuedDateText: fmtCertDate(new Date()),
                        issuedAt: serverTimestampFn(),
                    }, { merge: true });
                } catch (err) {
                    console.error('Sertifikat yozuvini saqlashda xatolik:', err);
                }

                const html = buildCertificateHtml(r, c, isWinner, certNumber, signatureSettings || {});
                const w = window.open('', '_blank');
                if (!w) return;
                w.document.write(html);
                w.document.close();
            });
        });
    }

    function wirePaymentActions(container, regs, contestDates) {
        container.querySelectorAll('[data-show-receipt]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.showReceipt;
                const box = container.querySelector(`[data-receipt-box="${id}"]`);
                if (!box) return;
                box.style.display = box.style.display === 'none' ? 'block' : 'none';
                if (box.style.display === 'block') {
                    const qrBox = container.querySelector(`[data-qr-box="${id}"]`);
                    const r = regs.find((x) => x.id === id);
                    const c = contestDates[r?.contestId] || {};
                    if (qrBox && window.QRCode && !qrBox.dataset.rendered) {
                        qrBox.innerHTML = '';
                        const qrText = `To'lov: ${c.paymentAmount || ''} so'm | Kimga: ${c.paymentReceiver || ''} | Hisob: ${c.paymentAccount || ''} | Izoh: TOLOV-${r.customId}`;
                        new window.QRCode(qrBox, { text: qrText, width: 160, height: 160 });
                        qrBox.dataset.rendered = '1';
                    }
                    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            });
        });

        container.querySelectorAll('[data-print-receipt]').forEach((btn) => {
            btn.addEventListener('click', () => window.print());
        });

        container.querySelectorAll('[data-mark-paid]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                const id = btn.dataset.markPaid;
                const statusEl = container.querySelector(`[data-payment-self-status="${id}"]`);
                const fileInput = container.querySelector(`[data-receipt-input="${id}"]`);
                const file = fileInput && fileInput.files && fileInput.files[0];
                btn.disabled = true;
                statusEl.textContent = 'Yuborilmoqda...';
                statusEl.style.color = '#92400e';
                try {
                    let receiptDataUrl = null;
                    let imageWarning = '';
                    if (file) {
                        try {
                            receiptDataUrl = await new Promise((resolve, reject) => {
                                const img = new Image();
                                const reader = new FileReader();
                                const timeout = setTimeout(() => reject(new Error('vaqt tugadi')), 15000);
                                reader.onload = () => {
                                    img.onload = () => {
                                        clearTimeout(timeout);
                                        const maxSize = 700;
                                        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
                                        const canvas = document.createElement('canvas');
                                        canvas.width = Math.round(img.width * scale);
                                        canvas.height = Math.round(img.height * scale);
                                        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
                                        resolve(canvas.toDataURL('image/jpeg', 0.7));
                                    };
                                    img.onerror = () => {
                                        clearTimeout(timeout);
                                        reject(new Error('rasm formati mos kelmadi'));
                                    };
                                    img.src = reader.result;
                                };
                                reader.onerror = () => {
                                    clearTimeout(timeout);
                                    reject(new Error('fayl o\u2018qilmadi'));
                                };
                                reader.readAsDataURL(file);
                            });
                        } catch (imgErr) {
                            console.error('Chek rasmini qayta ishlashda xatolik:', imgErr);
                            receiptDataUrl = null;
                            imageWarning = ' (Diqqat: rasm yuklanmadi — JPG/PNG sifatida qayta urinib ko\u2018ring yoki rasmsiz davom eting.)';
                        }
                    }
                    await updateDocFn(docFn(db, 'registrations', id), {
                        paymentStatus: 'tekshirilmoqda',
                        paymentReceiptUrl: receiptDataUrl,
                        paymentSubmittedAt: serverTimestampFn(),
                    });
                    statusEl.textContent = `\u2705 Ma\u2019lumot yuborildi! Admin tez orada tekshiradi.${imageWarning}`;
                    statusEl.style.color = imageWarning ? '#c2410c' : '#059669';
                } catch (err) {
                    console.error(err);
                    statusEl.textContent = 'Xatolik yuz berdi, qayta urinib ko\u2018ring.';
                    statusEl.style.color = '#dc2626';
                    btn.disabled = false;
                }
            });
        });
    }

    window.addEventListener('load', () => setTimeout(load, 400));
})();
