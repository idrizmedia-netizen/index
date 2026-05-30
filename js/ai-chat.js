let currentFileBase64 = null;
let currentFileType = null;
let chatHistory = [];

const userInputAi = document.getElementById('user-input-ai');
const sendBtnAi = document.getElementById('send-btn-ai');
const chatMessages = document.getElementById('chat-messages');
const fileInput = document.getElementById('file-upload');
const previewBox = document.getElementById('image-preview-box');
const previewImg = document.getElementById('preview-img');
const authNotice = document.getElementById('auth-notice');

function isLoggedIn() {
    return window.ZiyomapUsage ? !!ZiyomapUsage.getUser() : false;
}

function updateAuthUI() {
    const loggedIn = isLoggedIn();
    if (userInputAi) {
        userInputAi.disabled = !loggedIn;
        userInputAi.placeholder = loggedIn
            ? 'Savol yoki rasm tavsifi...'
            : 'Avval tizimga kiring (Kirish sahifasi)';
    }
    if (sendBtnAi) sendBtnAi.disabled = !loggedIn;
    if (authNotice) authNotice.style.display = loggedIn ? 'none' : 'block';
}

updateAuthUI();

if (isLoggedIn() && window.ZiyomapUsage) {
    ZiyomapUsage.logUsage('ai-chat', 'Ziyomap AI');
}

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
}

if (fileInput) {
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        currentFileType = file.type;
        const reader = new FileReader();
        reader.onload = (event) => {
            currentFileBase64 = event.target.result.split(',')[1];
            if (file.type.startsWith('image/') && previewImg && previewBox) {
                previewImg.src = event.target.result;
                previewBox.style.display = 'block';
            } else if (previewBox) {
                previewBox.style.display = 'block';
                if (previewImg) previewImg.style.display = 'none';
            }
        };
        reader.readAsDataURL(file);
    });
}

window.cancelImage = function () {
    currentFileBase64 = null;
    currentFileType = null;
    if (previewBox) previewBox.style.display = 'none';
    if (previewImg) {
        previewImg.src = '';
        previewImg.style.display = '';
    }
    if (fileInput) fileInput.value = '';
};

function appendAiMessage(sender, text) {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const msgDiv = document.createElement('div');
    msgDiv.id = id;
    msgDiv.className = 'chat-msg ' + (sender === 'user' ? 'user' : 'ai');

    if (sender === 'user') {
        msgDiv.innerHTML = `<div class="message-content">${text.replace(/\n/g, '<br>')}</div>`;
    } else {
        let formatted = text;
        if (typeof marked !== 'undefined' && text !== 'Ziyomap AI tahlil qilmoqda...') {
            formatted = marked.parse(text);
        } else {
            formatted = text.replace(/\n/g, '<br>');
        }
        msgDiv.innerHTML = `<div class="message-content ai-text">${formatted}</div>`;
    }

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return id;
}

function updateAiMessage(id, text) {
    const el = document.getElementById(id);
    if (!el) return;
    const contentDiv = el.querySelector('.message-content');
    if (!contentDiv) return;
    contentDiv.innerHTML =
        typeof marked !== 'undefined' ? marked.parse(text) : text.replace(/\n/g, '<br>');
    if (window.MathJax) {
        MathJax.typesetPromise([contentDiv]).catch(() => {});
    }
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addActionButtons(msgId, content) {
    const msgDiv = document.getElementById(msgId);
    if (!msgDiv) return;

    const btnContainer = document.createElement('div');
    btnContainer.className = 'msg-actions';

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'msg-action-btn';
    copyBtn.innerHTML = '<i class="fas fa-copy"></i> Nusxalash';
    copyBtn.onclick = () => {
        const contentDiv = msgDiv.querySelector('.message-content');
        const cleanText = contentDiv ? contentDiv.innerText : content;
        navigator.clipboard.writeText(cleanText).then(() => {
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Nusxalandi!';
            copyBtn.style.background = '#10b981';
            copyBtn.style.color = 'white';
            copyBtn.style.borderColor = '#10b981';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i> Nusxalash';
                copyBtn.style.background = 'transparent';
                copyBtn.style.color = '';
                copyBtn.style.borderColor = '';
            }, 2000);
        });
    };

    const downloadBtn = document.createElement('button');
    downloadBtn.type = 'button';
    downloadBtn.className = 'msg-action-btn';
    downloadBtn.innerHTML = '<i class="fas fa-download"></i> Saqlash';
    downloadBtn.onclick = () => {
        const contentDiv = msgDiv.querySelector('.message-content');
        const cleanText = contentDiv ? contentDiv.innerText : content;
        const blob = new Blob([cleanText], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Ziyomap_Javob_${msgId}.txt`;
        link.click();
    };

    btnContainer.appendChild(copyBtn);
    btnContainer.appendChild(downloadBtn);
    msgDiv.appendChild(btnContainer);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendAiMessage() {
    if (!isLoggedIn()) {
        updateAuthUI();
        return;
    }

    const text = userInputAi.value.trim();
    if (!text && !currentFileBase64) return;

    appendAiMessage('user', text + (currentFileBase64 ? ' [Fayl yuborildi]' : ''));

    const imageToSend = currentFileBase64;
    const typeToSend = currentFileType;
    userInputAi.value = '';
    cancelImage();

    const loadingId = appendAiMessage('ai', 'Ziyomap AI tahlil qilmoqda...');

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: text,
                history: chatHistory,
                image: imageToSend,
                mimeType: typeToSend,
            }),
        });
        const data = await response.json();
        const aiReply = data.reply || data.error || 'Javob olinmadi.';

        updateAiMessage(loadingId, aiReply);
        if (data.reply) addActionButtons(loadingId, aiReply);

        chatHistory.push({ role: 'user', parts: [{ text }] });
        chatHistory.push({ role: 'model', parts: [{ text: aiReply }] });

        if (window.ZiyomapUsage) {
            ZiyomapUsage.logUsage('ai-xabar', 'AI ga savol yuborildi');
        }
    } catch {
        updateAiMessage(loadingId, 'Xatolik yuz berdi. Internet yoki serverni tekshiring.');
    }
}

if (sendBtnAi) sendBtnAi.addEventListener('click', sendAiMessage);
if (userInputAi) {
    userInputAi.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendAiMessage();
    });
    userInputAi.addEventListener('focus', () => {
        setTimeout(() => {
            userInputAi.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }, 300);
    });
}

function syncMobileKeyboardOffset() {
    const vv = window.visualViewport;
    if (!vv) return;
    const gap = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    document.documentElement.style.setProperty('--kb-offset', gap + 'px');
}

if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncMobileKeyboardOffset);
    window.visualViewport.addEventListener('scroll', syncMobileKeyboardOffset);
    syncMobileKeyboardOffset();
}
