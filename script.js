let myId = "";
let peer = null;
let activeCall = null;
let incomingCallObj = null;
let localStream = null;
let currentChatPeer = "";

// تشغيل النظام عند التحميل
window.onload = function() {
    let savedProfile = localStorage.getItem('user_profile');
    if(savedProfile) {
        document.getElementById('setupScreen').style.display = 'none';
        initAppEngine(JSON.parse(savedProfile));
    }
}

// إتمام الإعدادات الأولى المأخوذة من المستخدم
function completeSetup() {
    let name = document.getElementById('inputName').value.trim();
    let theme = document.getElementById('selectTheme').value;
    let fileInput = document.getElementById('inputAvatarFile');

    if(!name) {
        alert('الرجاء إدخال الاسم.');
        return;
    }

    if(fileInput.files && fileInput.files[0]) {
        let reader = new FileReader();
        reader.onload = function(e) {
            saveAndBoot(name, e.target.result, theme);
        };
        reader.readAsDataURL(fileInput.files[0]);
    } else {
        // صورة افتراضية في حال لم يرفع صورة
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

    // توليد 5 أرقام فريدة للاتصال
    myId = localStorage.getItem('my_peer_id');
    if(!myId) {
        myId = Math.floor(10000 + Math.random() * 90000).toString();
        localStorage.setItem('my_peer_id', myId);
    }
    document.getElementById('myPeerIdDisplay').innerText = myId;

    // تشغيل PeerJS
    peer = new Peer("net_call_" + myId);
    peer.on('call', (call) => {
        incomingCallObj = call;
        document.getElementById('incomingCallerText').innerText = "المتصل: " + call.peer.replace("net_call_", "");
        document.getElementById('incomingModal').style.display = 'flex';
        document.getElementById('ringtone').play().catch(e => console.log(e));
    });
}

// تبديل التبويبات السفلية
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
    let profile = JSON.parse(localStorage.getItem('user_profile'));
    if(profile) {
        profile.theme = next;
        localStorage.setItem('user_profile', JSON.stringify(profile));
    }
}

// محادثات وشات داخلي
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
    appendMsgUI(text, 'msg-out');
    saveMsgStore(currentChatPeer, text, 'msg-out');
    input.value = '';
}

function handleKey(e) {
    if(e.key === 'Enter') sendMessage();
}

function appendMsgUI(text, type) {
    let box = document.getElementById('roomMessagesBox');
    let div = document.createElement('div');
    div.className = `msg-bubble ${type}`;
    div.innerText = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
}

function saveMsgStore(peerCode, text, type) {
    let history = JSON.parse(localStorage.getItem('chat_' + peerCode) || '[]');
    history.push({ text, type });
    localStorage.setItem('chat_' + peerCode, JSON.stringify(history));
}

function loadMessages(peerCode) {
    let box = document.getElementById('roomMessagesBox');
    box.innerHTML = '';
    let history = JSON.parse(localStorage.getItem('chat_' + peerCode) || '[]');
    if(history.length === 0) {
        appendMsgUI('مرحباً بك في المحادثة المباشرة.', 'msg-in');
    } else {
        history.forEach(m => appendMsgUI(m.text, m.type));
    }
}

// الاتصال المرئي
async function startCall() {
    let target = document.getElementById('targetIdInput').value.trim();
    if(target.length !== 5) {
        alert('أدخل رقم مكون من 5 خانات');
        return;
    }
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        document.getElementById('localVideo').srcObject = localStream;
        let call = peer.call("net_call_" + target, localStream);
        setupCall(call);
    } catch(e) {
        alert('فشل تشغيل الكاميرا والميكروفون');
    }
}

function startCallFromRoom() {
    if(currentChatPeer) {
        document.getElementById('targetIdInput').value = currentChatPeer;
        startCall();
    }
}

function setupCall(call) {
    activeCall = call;
    document.getElementById('callScreen').style.display = 'flex';
    call.on('stream', (stream) => {
        document.getElementById('remoteVideo').srcObject = stream;
    });
    call.on('close', () => { endCall(); });
}

function acceptCall() {
    document.getElementById('ringtone').pause();
    document.getElementById('incomingModal').style.display = 'none';
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
        localStream = stream;
        document.getElementById('localVideo').srcObject = stream;
        incomingCallObj.answer(stream);
        setupCall(incomingCallObj);
    }).catch(e => alert('فشل الاتصال'));
}

function rejectCall() {
    document.getElementById('ringtone').pause();
    if(incomingCallObj) incomingCallObj.close();
    document.getElementById('incomingModal').style.display = 'none';
}

function endCall() {
    if(activeCall) activeCall.close();
    if(localStream) {
        localStream.getTracks().forEach(t => t.stop());
    }
    document.getElementById('callScreen').style.display = 'none';
}

function changeLanguage(lang) {
    if(lang === 'en') {
        document.getElementById('setupTitle').innerText = 'Personal Account Setup';
        document.getElementById('lblName').innerText = 'Your Name:';
        document.getElementById('lblAvatar').innerText = 'Profile Picture from phone:';
        document.getElementById('lblTheme').innerText = 'Theme Mode:';
        document.getElementById('btnStart').innerText = 'Get Started';
        document.getElementById('headerTitle').innerText = 'Chats';
        document.getElementById('navChat').innerText = 'Chats';
        document.getElementById('navNotif').innerText = 'Notifications';
        document.getElementById('navMenu').innerText = 'Menu';
    } else {
        document.getElementById('setupTitle').innerText = 'إعداد حسابك الشخصي';
        document.getElementById('lblName').innerText = 'اسمك:';
        document.getElementById('lblAvatar').innerText = 'صورة الحساب من هاتفك:';
        document.getElementById('lblTheme').innerText = 'المظهر:';
        document.getElementById('btnStart').innerText = 'بدء الاستخدام';
        document.getElementById('headerTitle').innerText = 'الدردشات';
        document.getElementById('navChat').innerText = 'الدردشات';
        document.getElementById('navNotif').innerText = 'الإشعارات';
        document.getElementById('navMenu').innerText = 'القائمة';
    }
}

function filterChats(q) {
    document.querySelectorAll('.chat-item').forEach(item => {
        let name = item.querySelector('.chat-name').innerText;
        item.style.display = name.includes(q) ? 'flex' : 'none';
    });
}

function openStoryModal(imgUrl, name) {
    alert('عرض قصة المستخدم: ' + name);
}

function addMyStory() {
    let url = prompt('أدخل رابط صورة لقصتك الجديدة:');
    if(url) alert('تمت إضافة القصة بنجاح');
}

function openProfile() {
    switchTab('menu', document.querySelectorAll('.nav-btn')[2]);
}
