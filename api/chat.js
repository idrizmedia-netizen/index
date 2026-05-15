/* ==========================================================
   ZIYOMAP AI - CHAT TIZIMI (TO'LIQ VERSIYA)
   ========================================================== */

let currentFileBase64 = null;
let currentFileType = null;
let chatHistory = []; // Suhbat tarixini saqlash uchun

const chatToggle = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const closeChat = document.getElementById('close-chat');
const fullScreenBtn = document.getElementById('full-screen-chat');
const sendBtnAi = document.getElementById('send-btn-ai');
const userInputAi = document.getElementById('user-input-ai');
const chatMessages = document.getElementById('chat-messages');
const fileInput = document.getElementById('file-upload');
const previewBox = document.getElementById('image-preview-box');
const previewImg = document.getElementById('preview-img');

// Chat oynasini ochish/yopish
if (chatToggle) {
    chatToggle.addEventListener('click', () => {
        chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
    });
}

if (closeChat) {
    closeChat.addEventListener('click', () => {
        chatWindow.style.display = 'none';
    });
}

// To'liq ekran rejimi
if (fullScreenBtn) {
    fullScreenBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('full-screen');
        fullScreenBtn.classList.toggle('fa-expand-alt');
        fullScreenBtn.classList.toggle('fa-compress-alt');
    });
}

// Fayl yuklash va uni Base64 ga o'tkazish
if (fileInput) {
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            currentFileType = file.type;
            const reader = new FileReader();
            reader.onload = function(event) {
                // Backend uchun Base64 qismini olish
                currentFileBase64 = event.target.result.split(',')[1];
                
                // Agar rasm bo'lsa, preview ko'rsatish
                if (file.type.startsWith('image/')) {
                    previewImg.src = event.target.result;
                    previewBox.style.display = 'block';
                } else {
                    previewBox.style.display = 'none';
                }
            };
            reader.readAsDataURL(file);
        }
    });
}

// Faylni bekor qilish
window.cancelImage = function() {
    currentFileBase64 = null;
    currentFileType = null;
    if (previewBox) previewBox.style.display = 'none';
    if (fileInput) fileInput.value = '';
}

// Xabar yuborish funksiyasi
async function sendAiMessage() {
    const text = userInputAi.value.trim();
    if (!text && !currentFileBase64) return;
    
    // Foydalanuvchi xabarini ko'rsatish
    appendAiMessage('user', text + (currentFileBase64 ? " [Fayl ilova qilindi]" : ""));
    
    const imageToSend = currentFileBase64;
    const typeToSend = currentFileType;
    
    userInputAi.value = '';
    cancelImage();
    
    // Yuklanish holati
    const loadingId = appendAiMessage('ai', 'Ziyomap AI oylamoqda...');
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: text,
                history: chatHistory, 
                image: imageToSend,
                mimeType: typeToSend
            })
        });

        const data = await response.json();
        const aiReply = data.reply || "Kechirasiz, javob olishda xatolik yuz berdi.";
        
        // AI javobini yangilash
        updateAiMessage(loadingId, aiReply);
        
        // Agar javob uzun bo'lsa, yuklab olish tugmasini qo'shish
        if (aiReply.length > 300) {
            addDownloadBtn(loadingId, aiReply);
        }

        // Tarixga qo'shish
        chatHistory.push({ role: "user", parts: [{ text: text }] });
        chatHistory.push({ role: "model", parts: [{ text: aiReply }] });

    } catch (error) {
        updateAiMessage(loadingId, "Server bilan bog'lanishda xato yuz berdi.");
        console.error("Chat Error:", error);
    }
}

// Xabar blokini yaratish
function appendAiMessage(sender, text) {
    const id = Date.now();
    const msgDiv = document.createElement('div');
    msgDiv.id = id;
    msgDiv.className = `message ${sender}-message`;
    
    // Stil berish (Mehnatingizdagi dizayn saqlab qolindi)
    msgDiv.style.padding = '12px';
    msgDiv.style.borderRadius = '15px';
    msgDiv.style.marginBottom = '10px';
    msgDiv.style.maxWidth = '85%';
    msgDiv.style.fontSize = '0.95rem';
    msgDiv.style.lineHeight = '1.5';
    
    if (sender === 'user') {
        msgDiv.style.alignSelf = 'flex-end';
        msgDiv.style.background = 'var(--primary-color)';
        msgDiv.style.color = 'white';
        msgDiv.style.borderRadius = '15px 15px 0 15px';
    } else {
        msgDiv.style.alignSelf = 'flex-start';
        msgDiv.style.background = 'rgba(56, 189, 248, 0.1)';
        msgDiv.style.borderLeft = '4px solid var(--primary-color)';
        msgDiv.style.color = 'var(--text-color)';
        msgDiv.style.borderRadius = '0 15px 15px 15px';
    }
    
    msgDiv.innerText = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return id;
}

// Xabarni matn bilan yangilash
function updateAiMessage(id, text) {
    const el = document.getElementById(id);
    if(el) el.innerText = text;
}

// Yuklab olish tugmasi
function addDownloadBtn(msgId, content) {
    const msgDiv = document.getElementById(msgId);
    const btn = document.createElement('button');
    btn.innerHTML = '<i class="fas fa-download"></i> Saqlash (.txt)';
    btn.style = "display: block; margin-top: 10px; padding: 5px 10px; font-size: 0.75rem; cursor: pointer; border-radius: 6px; border: 1px solid var(--primary-color); background: transparent; color: var(--primary-color);";
    
    btn.onclick = () => {
        const blob = new Blob([content], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Ziyomap_Javob.txt`;
        link.click();
    };
    msgDiv.appendChild(btn);
}

// Event listenerlar
if (sendBtnAi) sendBtnAi.addEventListener('click', sendAiMessage);
if (userInputAi) {
    userInputAi.addEventListener('keypress', (e) => { 
        if(e.key === 'Enter') sendAiMessage(); 
    });
}
