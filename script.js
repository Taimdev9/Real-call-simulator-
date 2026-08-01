let currentChatPeer = "";
let localStream = null;
let isMuted = false;
let isCameraOff = false;
let isSharingScreen = false;

window.onload = function() {
    let savedProfile = localStorage.getItem('user_profile');
    if(savedProfile) {
        document.getElementById('setupScreen').style.display = 'none';
        initAppEngine(JSON.parse(savedProfile));
    }
    loadDynamicChats();
}

function completeSetup() {
    let name = document.getElementById('inputName').value.trim();
    let theme = document.getElementById('selectTheme').value;
    let fileInput = document.getElementById('inputAvatarFile');

    if(!name) { alert('الرجاء إدخال الاسم.'); return; }

    if(fileInput.files && fileInput.files[0]) {
        let reader = new FileReader();
        reader.onload = function(e) { saveAndBoot(name, e.target.result, theme); };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        saveAndBoot(name, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde', theme);
    }
}

function saveAndBoot(name, avatar, theme) {
    let profile = { name, avatar, theme };
    localStorage.setItem('user_profile', JSON.stringify(profile));
    document.getElementById('setupScreen').style.display = 'none';
    initAppEngine(profile);
}

function initAppEngine(profile) {
    document.documentElement.setAttribute('data-theme', profile.theme);
    document.getElementById('menuProfileName').innerText = profile.name;
    document.getElementById('menuProfileImg').src = profile.avatar;
    document.getElementById('myStoryImg').src = profile.avatar;
}

function switchTab(tab, btn) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    btn.classList.add('active');
    document.getElementById('searchContainer').style.display = (tab === 'chats') ? 'block' : 'none';
}

function toggleTheme() {
    let root = document.documentElement;
    let current = root.getAttribute('data-theme');
    let next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    let profile = JSON.parse(localStorage.getItem('user_profile')) || { name: "مستخدم", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde" };
    profile.theme = next;
    localStorage.setItem('user_profile', JSON.stringify(profile));
}

function addNewChatPrompt() {
    let name = prompt('أدخل اسم الشخص للدردشة:');
    if(!name) return;
    let peerId = 'chat_' + Date.now();
    let customChats = JSON.parse(localStorage.getItem('custom_chats') || '[]');
    customChats.push({ name, peerId, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde' });
    localStorage.setItem('custom_chats', JSON.stringify(customChats));
    loadDynamicChats();
    openChat(name, 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde', peerId);
}

function loadDynamicChats() {
    let list = document.getElementById('chatList');
    let customChats = JSON.parse(localStorage.getItem('custom_chats') || '[]');
    customChats.forEach(c => {
        let div = document.createElement('div');
        div.className = 'chat-item';
        div.onclick = () => openChat(c.name, c.avatar, c.peerId);
        div.innerHTML = `
            <div class="avatar-wrap"><img src="${c.avatar}"></div>
            <div class="chat-details">
                <div class="chat-name">${c.name}</div>
                <div class="chat-preview">انقر لبدء المحادثة...</div>
            </div>
        `;
        list.prepend(div);
    });
}

function openChat(name, avatar, peerCode) {
    currentChatPeer = peerCode;
    document.getElementById('roomName').innerText = name;
    document.getElementById('roomAvatar').src = avatar;
    document.getElementById('chatRoomScreen').style.display = 'flex';
    loadMessages(peerCode);
}

function closeChat() {
    document.getElementById('chatRoomScreen').style.display = 'none';
}

function sendMessage() {
    let input = document.getElementById('msgInput');
    let text = input.value.trim();
    if(!text) return;
    appendMsgUI(text, 'msg-out', 'text');
    saveMsgStore(currentChatPeer, text, 'msg-out', 'text');
    input.value = '';
    
    setTimeout(() => {
        let reply = "أهلاً بك، تم استلام رسالتك!";
        appendMsgUI(reply, 'msg-in', 'text');
        saveMsgStore(currentChatPeer, reply, 'msg-in', 'text');
    }, 1000);
}

function sendGalleryImage(input) {
    if(input.files && input.files[0]) {
        let reader = new FileReader();
        reader.onload = function(e) {
            let imgData = e.target.result;
            appendMsgUI(imgData, 'msg-out', 'image');
            saveMsgStore(currentChatPeer, imgData, 'msg-out', 'image');
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function handleKey(e) {
    if(e.key === 'Enter') sendMessage();
}

function appendMsgUI(content, type, dataType) {
    let box = document.getElementById('roomMessagesBox');
    let div = document.createElement('div');
    div.className = `msg-bubble ${type}`;
    if(dataType === 'image') {
        div.innerHTML = `<img src="${content}" class="msg-img">`;
    } else {
        div.innerText = content;
    }
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function saveMsgStore(peerCode, content, type, dataType) {
    let history = JSON.parse(localStorage.getItem('msg_history_' + peerCode) || '[]');
    history.push({ content, type, dataType });
    localStorage.setItem('msg_history_' + peerCode, JSON.stringify(history));
}

function loadMessages(peerCode) {
    let box = document.getElementById('roomMessagesBox');
    box.innerHTML = '';
    let history = JSON.parse(localStorage.getItem('msg_history_' + peerCode) || '[]');
    if(history.length === 0) {
        appendMsgUI('بدء محادثة آمنة.', 'msg-in', 'text');
    } else {
        history.forEach(m => appendMsgUI(m.content, m.type, m.dataType));
    }
}

function addMyStory() {
    let input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = e => {
        if(e.target.files && e.target.files[0]) {
            let reader = new FileReader();
            reader.onload = ev => {
                document.getElementById('myStoryImg').src = ev.target.result;
                alert('تمت إضافة القصة بنجاح من المعرض!');
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    input.click();
}

function filterChats(q) {
    document.querySelectorAll('.chat-item').forEach(item => {
        let name = item.querySelector('.chat-name').innerText;
        item.style.display = name.includes(q) ? 'flex' : 'none';
    });
}

// ---------------- ميزات الاتصال والفلاتر الجديدة ---------------- //

async function startCall(type) {
    document.getElementById('callScreen').style.display = 'flex';
    document.getElementById('callStatusText').innerText = type === 'video' ? 'جاري اتصال الفيديو...' : 'جاري اتصال صوتي...';
    
    if(type === 'video') {
        try {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            let videoElem = document.getElementById('callVideoFeed');
            videoElem.srcObject = localStream;
            videoElem.style.display = 'block';
        } catch(err) {
            alert('تعذر فتح الكاميرا، يرجى السماح بالصلاحيات.');
        }
    } else {
        document.getElementById('callVideoFeed').style.display = 'none';
    }
}

function endCall() {
    if(localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    document.getElementById('callScreen').style.display = 'none';
    document.getElementById('filtersTray').style.display = 'none';
}

function toggleMute() {
    isMuted = !isMuted;
    if(localStream) {
        localStream.getAudioTracks().forEach(track => track.enabled = !isMuted);
    }
    let btn = document.getElementById('btnToggleMute');
    btn.classList.toggle('active-state', isMuted);
    btn.innerHTML = isMuted ? '<i class="fa-solid fa-microphone-slash"></i>' : '<i class="fa-solid fa-microphone"></i>';
}

function toggleCamera() {
    isCameraOff = !isCameraOff;
    if(localStream) {
        localStream.getVideoTracks().forEach(track => track.enabled = !isCameraOff);
    }
    let btn = document.getElementById('btnToggleCam');
    btn.classList.toggle('active-state', isCameraOff);
    btn.innerHTML = isCameraOff ? '<i class="fa-solid fa-video-slash"></i>' : '<i class="fa-solid fa-video"></i>';
}

async function toggleScreenShare() {
    try {
        if(!isSharingScreen) {
            let screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            document.getElementById('callVideoFeed').srcObject = screenStream;
            isSharingScreen = true;
            document.getElementById('btnToggleShare').classList.add('active-state');
        } else {
            document.getElementById('callVideoFeed').srcObject = localStream;
            isSharingScreen = false;
            document.getElementById('btnToggleShare').classList.remove('active-state');
        }
    } catch(err) {
        console.log("تم إلغاء مشاركة الشاشة");
    }
}

function toggleFiltersTray() {
    let tray = document.getElementById('filtersTray');
    tray.style.display = tray.style.display === 'flex' ? 'none' : 'flex';
}

function applyFilter(filterType, filterName) {
    document.getElementById('activeFilterBadge').innerText = filterName;
    document.querySelectorAll('.filter-item').forEach(el => el.classList.remove('active'));
    event.target.classList.add('active');

    let bgLayer = document.getElementById('callBackgroundLayer');
    let videoElem = document.getElementById('callVideoFeed');

    // إعادة ضبط التأثيرات
    videoElem.style.filter = 'none';
    bgLayer.style.backgroundImage = 'none';

    // تطبيق فلاتر الوجه أو الخلفيات الحقيقية من الهاتف
    switch(filterType) {
        case 'dog':
            videoElem.style.filter = 'contrast(1.2) saturate(1.4) drop-shadow(0 0 10px gold)';
            break;
        case 'cat':
            videoElem.style.filter = 'sepia(0.3) saturate(1.5)';
            break;
        case 'glasses':
            videoElem.style.filter = 'grayscale(0.3) contrast(1.3)';
            break;
        case 'crown':
            videoElem.style.filter = 'drop-shadow(0 0 15px yellow)';
            break;
        case 'heart':
            videoElem.style.filter = 'hue-rotate(300deg) saturate(1.5)';
            break;
        case 'fire':
            videoElem.style.filter = 'sepia(0.8) hue-rotate(-30deg) saturate(2)';
            break;
        case 'space':
            bgLayer.style.backgroundImage = 'url("https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86")';
            break;
        case 'beach':
            bgLayer.style.backgroundImage = 'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e")';
            break;
        case 'blur':
            videoElem.style.filter = 'blur(4px)';
            break;
        case 'neon':
            videoElem.style.filter = 'invert(0.2) hue-rotate(90deg) saturate(3)';
            break;
        case 'anime':
            videoElem.style.filter = 'brightness(1.2) contrast(1.1) saturate(1.8)';
            break;
        case 'retro':
            videoElem.style.filter = 'sepia(0.6) contrast(1.2) blur(0.5px)';
            break;
        case 'matrix':
            videoElem.style.filter = 'hue-rotate(90deg) grayscale(0.5) contrast(2)';
            break;
        case 'astronaut':
            bgLayer.style.backgroundImage = 'url("https://images.unsplash.com/photo-1446776811953-b23d57bd21aa")';
            break;
        default:
            break;
    }
}
