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

    let db, authInst, updateDocFn, docFn, serverTimestampFn;

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
            const { getFirestore, collection, query, where, getDocs, doc, getDoc, updateDoc, serverTimestamp } = await import(
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

            let html = '';
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
                } else if (effTestStart || effTestEnd) {
                    dateBits.push(`Test vaqti: ${effTestStart ? fmtDate(effTestStart) : '\u2014'}${effTestEnd ? ' \u2013 ' + fmtDate(effTestEnd) : ''}`);
                }
                if (c.regStartDate || c.regEndDate) {
                    dateBits.push(`Ro\u2018yxatdan o\u2018tish: ${c.regStartDate || '\u2014'} \u2013 ${c.regEndDate || '\u2014'}`);
                }

                const countdown = belowThreshold ? null : pickCountdown(effTestStart, effTestEnd, effInterviewStart, effInterviewEnd, testEnded);

                // ── Harakat tugmalari: Testni boshlash / Suhbatga kirish ──
                const actionBtns = [];
                if (test && test.published) {
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

                html += `<div class="activity-row-wrap" style="border-bottom:1px solid var(--border);padding-bottom:14px;margin-bottom:14px">
                    <div class="activity-row" style="border:none;padding:0;margin:0">
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
                    </div>
                    ${actionBtns.length ? `<div style="display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 0 52px">${actionBtns.join('')}</div>` : ''}
                    ${ticketHtml}
                    ${paymentHtml}
                </div>`;
            });
            target.innerHTML = html;
            updateCountdowns(target);
            clearInterval(window.__ziyomapCountdownInterval);
            window.__ziyomapCountdownInterval = setInterval(() => updateCountdowns(target), 30000);

            wirePaymentActions(target, regs, contestDates);
        } catch (err) {
            console.error('Natijalarni yuklashda xatolik:', err);
            target.innerHTML = '<div style="color:var(--muted);text-align:center;padding:20px;font-size:13px">Yuklashda xatolik yuz berdi.</div>';
        }
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
