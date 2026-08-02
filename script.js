/**
 * VIRTUAL CALL - Full Frontend Architecture
 * WebRTC / Socket Signal-Ready Vanilla JS Application
 */

// ==========================================
// 1. i18n & Localization Dictionary
// ==========================================
const TRANSLATIONS = {
  en: {
    voiceCall: "Voice Call",
    videoCall: "Video Call",
    quickSimulate: "Quick Simulation (Demo)",
    simIncomingVoice: "Simulate In-Voice",
    simIncomingVideo: "Simulate In-Video",
    searchPlaceholder: "Search by name or number...",
    allCalls: "All",
    missedCalls: "Missed",
    notificationsTitle: "Notifications",
    clearAll: "Clear All",
    save: "Save",
    virtualNumberLabel: "Virtual Number:",
    preferencesHeader: "Preferences",
    languageSetting: "Language",
    themeSetting: "Theme Mode",
    devicePermissions: "Permissions & Media",
    micPermission: "Microphone Access",
    micPermissionDesc: "Allow web app to capture audio",
    camPermission: "Camera Access",
    camPermissionDesc: "Allow web app to stream video",
    accountPrivacy: "Account & Danger Zone",
    resetAccount: "Reset Account Data",
    navDialer: "Keypad",
    navContacts: "Contacts",
    navRecents: "Recents",
    navNotifications: "Alerts",
    navSettings: "Settings",
    addContactTitle: "Add New Contact",
    contactNameLabel: "Contact Name",
    contactVNumLabel: "Virtual Number (5 Digits)",
    cancel: "Cancel",
    saveContact: "Save Contact",
    connecting: "Connecting...",
    ringing: "Ringing...",
    connected: "Connected",
    callEnded: "Call Ended",
    invalidVNum: "Please enter a valid 5-digit number.",
    nameUpdated: "Display name updated successfully!",
    nameCooldownErr: "Name can only be changed once every 3 days.",
    contactAdded: "Contact saved successfully!",
    numCopied: "Virtual Number copied to clipboard!",
    accountResetConfirm: "Are you sure you want to reset your Virtual Call account?"
  },
  ar: {
    voiceCall: "مكالمة صوتية",
    videoCall: "مكالمة فيديو",
    quickSimulate: "محاكاة سريعة (تجربة)",
    simIncomingVoice: "محاكاة مكالمة صوتية واردة",
    simIncomingVideo: "محاكاة مكالمة فيديو واردة",
    searchPlaceholder: "البحث بالاسم أو الرقم...",
    allCalls: "الكل",
    missedCalls: "المائتة",
    notificationsTitle: "الإشعارات",
    clearAll: "مسح الكل",
    save: "حفظ",
    virtualNumberLabel: "الرقم الافتراضي:",
    preferencesHeader: "التفضيلات",
    languageSetting: "اللغة",
    themeSetting: "وضع المظهر",
    devicePermissions: "الأذونات والوسائط",
    micPermission: "الوصول للميكروفون",
    micPermissionDesc: "السماح للتطبيق بالتقاط الصوت",
    camPermission: "الوصول للكاميرا",
    camPermissionDesc: "السماح للتطبيق ببث الفيديو",
    accountPrivacy: "الحساب والخصوصية",
    resetAccount: "إعادة ضبط بيانات الحساب",
    navDialer: "لوحة الاتصال",
    navContacts: "جهات الاتصال",
    navRecents: "السجل",
    navNotifications: "التنبيهات",
    navSettings: "الإعدادات",
    addContactTitle: "إضافة جهة اتصال جديدة",
    contactNameLabel: "اسم جهة الاتصال",
    contactVNumLabel: "الرقم الافتراضي (5 أرقام)",
    cancel: "إلغاء",
    saveContact: "حفظ جهة الاتصال",
    connecting: "جاري الاتصال...",
    ringing: "جاري الرنين...",
    connected: "متصل",
    callEnded: "انتهت المكالمة",
    invalidVNum: "يرجى إدخال رقم افتراضي صحيح مكون من 5 أرقام.",
    nameUpdated: "تم تحديث الاسم بنجاح!",
    nameCooldownErr: "يمكن تغيير الاسم مرة واحدة كل 3 أيام فقط.",
    contactAdded: "تم حفظ جهة الاتصال بنجاح!",
    numCopied: "تم نسخ الرقم الافتراضي إلى الحافظة!",
    accountResetConfirm: "هل أنت ألكيد من رغبتك في إعادة ضبط حسابك؟"
  }
};

// ==========================================
// 2. Storage & State Management
// ==========================================
class AppState {
  constructor() {
    this.init();
  }

  init() {
    // Generate permanent 5-digit number if new user
    let profile = JSON.parse(localStorage.getItem('vc_user_profile'));
    if (!profile) {
      const randomVNum = Math.floor(10000 + Math.random() * 90000).toString();
      profile = {
        vnum: randomVNum,
        name: "User_" + randomVNum,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop",
        createdAt: new Date().toLocaleDateString(),
        lastNameChange: 0
      };
      localStorage.setItem('vc_user_profile', JSON.stringify(profile));
    }
    this.profile = profile;

    // Contacts
    this.contacts = JSON.parse(localStorage.getItem('vc_contacts')) || [
      { name: "Ahmad Zaid", vnum: "72810", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop" },
      { name: "Sarah Connor", vnum: "15384", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop" }
    ];

    // Call Logs
    this.recents = JSON.parse(localStorage.getItem('vc_recents')) || [
      { name: "Ahmad Zaid", vnum: "72810", type: "incoming", missed: false, time: "10:42 AM", date: "Today" },
      { name: "Sarah Connor", vnum: "15384", type: "outgoing", missed: true, time: "Yesterday", date: "Yesterday" }
    ];

    // Notifications
    this.notifications = JSON.parse(localStorage.getItem('vc_notifs')) || [
      { id: 1, text: "Welcome to Virtual Call! Your ID is #" + this.profile.vnum, time: "Just now" }
    ];

    // App Preferences
    this.lang = localStorage.getItem('vc_lang') || 'en';
    this.theme = localStorage.getItem('vc_theme') || 'dark';
  }

  saveProfile() {
    localStorage.setItem('vc_user_profile', JSON.stringify(this.profile));
  }

  saveContacts() {
    localStorage.setItem('vc_contacts', JSON.stringify(this.contacts));
  }

  saveRecents() {
    localStorage.setItem('vc_recents', JSON.stringify(this.recents));
  }

  saveNotifs() {
    localStorage.setItem('vc_notifs', JSON.stringify(this.notifications));
  }
}

// ==========================================
// 3. WebRTC Call Manager Infrastructure (Backend Stub Ready)
// ==========================================
class CallManager {
  constructor(ui) {
    this.ui = ui;
    this.activeCall = null; // { peerVNum, peerName, type, isIncoming, timerInterval, seconds }
    this.localStream = null;
    this.remoteStream = null;
    this.peerConnection = null; // Stub for RTCPeerConnection
    this.socket = null; // Stub for Socket.IO connection
  }

  // Socket Connection Setup Placeholder for Node.js Backend
  connectSignalServer(serverUrl) {
    console.log("[SignalReady] Initializing WebRTC signaling to:", serverUrl);
    // Future implementation:
    // this.socket = io(serverUrl);
    // this.socket.on('incoming-call', data => this.onIncomingCallSignal(data));
  }

  startCall(targetVNum, type = 'voice', peerName = "Remote User") {
    if (this.activeCall) return;

    this.activeCall = {
      peerVNum: targetVNum,
      peerName: peerName,
      type: type, // 'voice' | 'video'
      status: 'connecting',
      seconds: 0,
      timerInterval: null,
      isMuted: false,
      isCamOff: false
    };

    this.ui.showActiveCallOverlay(this.activeCall);
    this.updateStatus('connecting', TRANSLATIONS[state.lang].connecting);

    // Simulate WebRTC Signaling & Connection sequence
    setTimeout(() => {
      if (this.activeCall) this.updateStatus('ringing', TRANSLATIONS[state.lang].ringing);
    }, 1500);

    setTimeout(() => {
      if (this.activeCall) this.connectCall();
    }, 3500);
  }

  simulateIncomingCall(callerName, callerVNum, type = 'voice') {
    this.pendingIncoming = { name: callerName, vnum: callerVNum, type: type };
    this.ui.showIncomingCallOverlay(this.pendingIncoming);
  }

  acceptIncomingCall() {
    if (!this.pendingIncoming) return;
    const incoming = this.pendingIncoming;
    this.pendingIncoming = null;
    this.ui.hideIncomingOverlay();
    
    this.startCall(incoming.vnum, incoming.type, incoming.name);
  }

  rejectIncomingCall() {
    if (!this.pendingIncoming) return;
    // Log missed call
    state.recents.unshift({
      name: this.pendingIncoming.name,
      vnum: this.pendingIncoming.vnum,
      type: "incoming",
      missed: true,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: "Today"
    });
    state.saveRecents();
    this.ui.renderRecents();

    this.pendingIncoming = null;
    this.ui.hideIncomingOverlay();
    this.ui.showToast(TRANSLATIONS[state.lang].callEnded);
  }

  connectCall() {
    if (!this.activeCall) return;
    this.activeCall.status = 'connected';
    this.updateStatus('connected', TRANSLATIONS[state.lang].connected);
    
    // Start Stream Simulation or getUserMedia
    this.initMediaStream();

    // Start Timer
    this.activeCall.timerInterval = setInterval(() => {
      this.activeCall.seconds++;
      const mins = String(Math.floor(this.activeCall.seconds / 60)).padStart(2, '0');
      const secs = String(this.activeCall.seconds % 60).padStart(2, '0');
      this.ui.updateTimer(`${mins}:${secs}`);
    }, 1000);
  }

  async initMediaStream() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints = {
          audio: true,
          video: this.activeCall.type === 'video'
        };
        this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
        this.ui.bindLocalMediaStream(this.localStream, this.activeCall.type);
      }
    } catch (err) {
      console.warn("Camera/Mic access restricted or simulation mode:", err);
    }
  }

  toggleMute() {
    if (!this.activeCall) return;
    this.activeCall.isMuted = !this.activeCall.isMuted;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(t => t.enabled = !this.activeCall.isMuted);
    }
    return this.activeCall.isMuted;
  }

  toggleCamera() {
    if (!this.activeCall) return;
    this.activeCall.isCamOff = !this.activeCall.isCamOff;
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(t => t.enabled = !this.activeCall.isCamOff);
    }
    return this.activeCall.isCamOff;
  }

  endCall() {
    if (!this.activeCall) return;

    if (this.activeCall.timerInterval) clearInterval(this.activeCall.timerInterval);
    
    // Log call log
    state.recents.unshift({
      name: this.activeCall.peerName,
      vnum: this.activeCall.peerVNum,
      type: "outgoing",
      missed: false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: "Today"
    });
    state.saveRecents();
    this.ui.renderRecents();

    // Stop streams
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.activeCall = null;
    this.ui.hideActiveCallOverlay();
    this.ui.showToast(TRANSLATIONS[state.lang].callEnded);
  }

  updateStatus(statusCode, text) {
    this.ui.updateCallStatusUI(statusCode, text);
  }
}

// ==========================================
// 4. UI Manager & Event Bindings
// ==========================================
let state;
let callManager;

document.addEventListener('DOMContentLoaded', () => {
  // Hide splash screen after delay
  setTimeout(() => {
    document.getElementById('splash-screen').classList.add('fade-out');
  }, 1000);

  state = new AppState();
  const ui = new UIManager();
  callManager = new CallManager(ui);

  ui.init();
});

class UIManager {
  init() {
    this.applyTheme(state.theme);
    this.applyLanguage(state.lang);
    this.renderHeader();
    this.renderContacts();
    this.renderRecents();
    this.renderNotifs();
    this.renderSettingsProfile();
    this.setupEventListeners();
  }

  // --- Theme & Language ---
  applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vc_theme', theme);

    const darkIcon = document.getElementById('theme-icon-dark');
    const lightIcon = document.getElementById('theme-icon-light');
    const themeCheckbox = document.getElementById('theme-checkbox');

    if (theme === 'dark') {
      darkIcon.classList.remove('hidden');
      lightIcon.classList.add('hidden');
      if (themeCheckbox) themeCheckbox.checked = true;
      document.getElementById('current-theme-desc').textContent = "Dark Glassmorphism";
    } else {
      darkIcon.classList.add('hidden');
      lightIcon.classList.remove('hidden');
      if (themeCheckbox) themeCheckbox.checked = false;
      document.getElementById('current-theme-desc').textContent = "Light Glassmorphism";
    }
  }

  applyLanguage(lang) {
    state.lang = lang;
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('vc_lang', lang);

    document.getElementById('lang-flag').textContent = lang === 'ar' ? '🇯🇴' : '🇺🇸';
    document.getElementById('current-lang-desc').textContent = lang === 'ar' ? 'العربية (Jordan)' : 'English (US)';
    document.getElementById('settings-lang-switch').textContent = lang === 'ar' ? 'English 🇺🇸' : 'العربية 🇯🇴';

    // Translate all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (TRANSLATIONS[lang][key]) el.textContent = TRANSLATIONS[lang][key];
    });

    // Translate Placeholders
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      const key = el.getAttribute('data-i18n-ph');
      if (TRANSLATIONS[lang][key]) el.setAttribute('placeholder', TRANSLATIONS[lang][key]);
    });
  }

  // --- Render Dynamic Components ---
  renderHeader() {
    document.getElementById('header-display-name').textContent = state.profile.name;
    document.getElementById('header-vnumber').textContent = state.profile.vnum;
    document.getElementById('header-avatar').src = state.profile.avatar;
  }

  renderSettingsProfile() {
    document.getElementById('profile-name-input').value = state.profile.name;
    document.getElementById('profile-vnum-text').textContent = state.profile.vnum;
    document.getElementById('settings-avatar-img').src = state.profile.avatar;
    document.getElementById('profile-created-date').textContent = `Created: ${state.profile.createdAt}`;
    
    this.updateNameCooldownUI();
  }

  updateNameCooldownUI() {
    const lastChange = state.profile.lastNameChange || 0;
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const diff = now - lastChange;

    const cooldownText = document.getElementById('name-cooldown-text');
    const saveBtn = document.getElementById('save-name-btn');

    if (diff < threeDaysMs) {
      const remainingHours = Math.ceil((threeDaysMs - diff) / (1000 * 60 * 60));
      cooldownText.textContent = `Name change available in ${remainingHours}h`;
      saveBtn.disabled = true;
      saveBtn.style.opacity = '0.5';
    } else {
      cooldownText.textContent = "Name change available now";
      saveBtn.disabled = false;
      saveBtn.style.opacity = '1';
    }
  }

  renderContacts(filter = '') {
    const container = document.getElementById('contacts-list-container');
    container.innerHTML = '';

    const list = state.contacts.filter(c => 
      c.name.toLowerCase().includes(filter.toLowerCase()) || c.vnum.includes(filter)
    );

    if (list.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted); font-size:0.85rem;">No contacts found</div>`;
      return;
    }

    list.forEach(c => {
      const el = document.createElement('div');
      el.className = 'contact-item glass-card';
      el.innerHTML = `
        <div class="item-left">
          <img class="item-avatar" src="${c.avatar}" alt="${c.name}" />
          <div class="item-details">
            <h4>${c.name}</h4>
            <p>#${c.vnum}</p>
          </div>
        </div>
        <div class="item-right">
          <button class="icon-btn-sm call-c-voice" data-vnum="${c.vnum}" data-name="${c.name}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </button>
          <button class="icon-btn-sm call-c-video" data-vnum="${c.vnum}" data-name="${c.name}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
          </button>
        </div>
      `;
      container.appendChild(el);
    });

    // Attach click handlers
    container.querySelectorAll('.call-c-voice').forEach(b => {
      b.addEventListener('click', (e) => {
        const vnum = e.currentTarget.dataset.vnum;
        const name = e.currentTarget.dataset.name;
        callManager.startCall(vnum, 'voice', name);
      });
    });
    container.querySelectorAll('.call-c-video').forEach(b => {
      b.addEventListener('click', (e) => {
        const vnum = e.currentTarget.dataset.vnum;
        const name = e.currentTarget.dataset.name;
        callManager.startCall(vnum, 'video', name);
      });
    });
  }

  renderRecents(filter = 'all') {
    const container = document.getElementById('recents-list-container');
    container.innerHTML = '';

    let list = state.recents;
    if (filter === 'missed') {
      list = list.filter(r => r.missed);
    }

    if (list.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted); font-size:0.85rem;">No recent calls</div>`;
      return;
    }

    list.forEach(r => {
      const el = document.createElement('div');
      el.className = 'recent-item glass-card';
      const isMissed = r.missed ? 'call-missed' : '';
      el.innerHTML = `
        <div class="item-left">
          <div class="item-details">
            <h4 class="${isMissed}">${r.name}</h4>
            <p>#${r.vnum} • ${r.time}</p>
          </div>
        </div>
        <div class="item-right">
          <button class="icon-btn-sm redial-btn" data-vnum="${r.vnum}" data-name="${r.name}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
          </button>
        </div>
      `;
      container.appendChild(el);
    });

    container.querySelectorAll('.redial-btn').forEach(b => {
      b.addEventListener('click', (e) => {
        callManager.startCall(e.currentTarget.dataset.vnum, 'voice', e.currentTarget.dataset.name);
      });
    });
  }

  renderNotifs() {
    const container = document.getElementById('notifications-list-container');
    container.innerHTML = '';

    if (state.notifications.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted); font-size:0.85rem;">No notifications</div>`;
      document.getElementById('notif-badge-dot').classList.add('hidden');
      return;
    }

    document.getElementById('notif-badge-dot').classList.remove('hidden');

    state.notifications.forEach(n => {
      const el = document.createElement('div');
      el.className = 'notif-item glass-card';
      el.innerHTML = `
        <div class="item-details">
          <h4>${n.text}</h4>
          <p>${n.time}</p>
        </div>
      `;
      container.appendChild(el);
    });
  }

  // --- Calling Screens UI Controls ---
  showIncomingCallOverlay(data) {
    document.getElementById('incoming-caller-name').textContent = data.name;
    document.getElementById('incoming-caller-vnum').textContent = `#${data.vnum}`;
    document.getElementById('incoming-type-badge').textContent = `Incoming ${data.type.toUpperCase()} Call...`;
    document.getElementById('incoming-call-overlay').classList.remove('hidden');
  }

  hideIncomingOverlay() {
    document.getElementById('incoming-call-overlay').classList.add('hidden');
  }

  showActiveCallOverlay(data) {
    document.getElementById('active-peer-name').textContent = data.peerName;
    document.getElementById('active-peer-vnum').textContent = `#${data.peerVNum}`;
    
    // Video elements toggle
    const localVideo = document.getElementById('local-video');
    const remoteVideo = document.getElementById('remote-video');
    const voiceAvatarContainer = document.getElementById('voice-avatar-container');

    if (data.type === 'video') {
      localVideo.classList.remove('hidden');
      remoteVideo.classList.remove('hidden');
      voiceAvatarContainer.classList.add('hidden');
    } else {
      localVideo.classList.add('hidden');
      remoteVideo.classList.add('hidden');
      voiceAvatarContainer.classList.remove('hidden');
    }

    document.getElementById('active-call-overlay').classList.remove('hidden');
  }

  hideActiveCallOverlay() {
    document.getElementById('active-call-overlay').classList.add('hidden');
  }

  updateCallStatusUI(code, text) {
    document.getElementById('call-status-text').textContent = text;
  }

  updateTimer(timeStr) {
    document.getElementById('call-timer-text').textContent = timeStr;
  }

  bindLocalMediaStream(stream, type) {
    if (type === 'video') {
      const localVideo = document.getElementById('local-video');
      localVideo.srcObject = stream;
    }
  }

  showToast(msg) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span>${msg}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // --- Event Listeners Setup ---
  setupEventListeners() {
    // Bottom Nav Navigation
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetView = e.currentTarget.dataset.view;
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        document.querySelectorAll('.view-panel').forEach(v => v.classList.remove('active'));
        
        e.currentTarget.classList.add('active');
        document.getElementById(targetView).classList.add('active');
      });
    });

    // Theme & Language Header Buttons
    document.getElementById('theme-toggle-btn').addEventListener('click', () => {
      this.applyTheme(state.theme === 'dark' ? 'light' : 'dark');
    });

    document.getElementById('lang-toggle-btn').addEventListener('click', () => {
      this.applyLanguage(state.lang === 'en' ? 'ar' : 'en');
    });

    document.getElementById('settings-lang-switch').addEventListener('click', () => {
      this.applyLanguage(state.lang === 'en' ? 'ar' : 'en');
    });

    document.getElementById('theme-checkbox').addEventListener('change', (e) => {
      this.applyTheme(e.target.checked ? 'dark' : 'light');
    });

    // Keypad Input Buttons
    const dialInput = document.getElementById('dial-input');
    const clearBtn = document.getElementById('dial-clear-btn');

    document.querySelectorAll('.key-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        if (key === 'clear') {
          dialInput.value = '';
        } else if (key === 'backspace') {
          dialInput.value = dialInput.value.slice(0, -1);
        } else if (dialInput.value.length < 5) {
          dialInput.value += key;
        }
        clearBtn.classList.toggle('hidden', dialInput.value.length === 0);
      });
    });

    dialInput.addEventListener('input', () => {
      clearBtn.classList.toggle('hidden', dialInput.value.length === 0);
    });

    clearBtn.addEventListener('click', () => {
      dialInput.value = '';
      clearBtn.classList.add('hidden');
    });

    // Start Calls from Keypad
    document.getElementById('start-voice-btn').addEventListener('click', () => {
      const vnum = dialInput.value.trim();
      if (vnum.length !== 5) {
        this.showToast(TRANSLATIONS[state.lang].invalidVNum);
        return;
      }
      callManager.startCall(vnum, 'voice');
    });

    document.getElementById('start-video-btn').addEventListener('click', () => {
      const vnum = dialInput.value.trim();
      if (vnum.length !== 5) {
        this.showToast(TRANSLATIONS[state.lang].invalidVNum);
        return;
      }
      callManager.startCall(vnum, 'video');
    });

    // Quick Simulation Triggers
    document.getElementById('sim-incoming-voice-btn').addEventListener('click', () => {
      callManager.simulateIncomingCall("Tariq Mansour", "40693", "voice");
    });

    document.getElementById('sim-incoming-video-btn').addEventListener('click', () => {
      callManager.simulateIncomingCall("Lina Haddad", "89120", "video");
    });

    // Incoming Call Modal Actions
    document.getElementById('accept-call-btn').addEventListener('click', () => {
      callManager.acceptIncomingCall();
    });

    document.getElementById('reject-call-btn').addEventListener('click', () => {
      callManager.rejectIncomingCall();
    });

    // In-Call Controls
    document.getElementById('ctrl-hangup-btn').addEventListener('click', () => {
      callManager.endCall();
    });

    document.getElementById('ctrl-mute-btn').addEventListener('click', (e) => {
      const isMuted = callManager.toggleMute();
      e.currentTarget.classList.toggle('active-off', isMuted);
      document.getElementById('icon-mic-on').classList.toggle('hidden', isMuted);
      document.getElementById('icon-mic-off').classList.toggle('hidden', !isMuted);
    });

    document.getElementById('ctrl-cam-btn').addEventListener('click', (e) => {
      const isCamOff = callManager.toggleCamera();
      e.currentTarget.classList.toggle('active-off', isCamOff);
      document.getElementById('icon-cam-on').classList.toggle('hidden', isCamOff);
      document.getElementById('icon-cam-off').classList.toggle('hidden', !isCamOff);
    });

    // Picture in Picture API
    document.getElementById('ctrl-pip-btn').addEventListener('click', async () => {
      const remoteVideo = document.getElementById('remote-video');
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled && remoteVideo.srcObject) {
        await remoteVideo.requestPictureInPicture();
      } else {
        this.showToast("Picture-in-Picture not available in mock mode.");
      }
    });

    // Copy Virtual Number
    document.getElementById('copy-vnum-btn').addEventListener('click', () => {
      navigator.clipboard.writeText(state.profile.vnum);
      this.showToast(TRANSLATIONS[state.lang].numCopied);
    });

    // Save Name Edit (3-Day Limit)
    document.getElementById('save-name-btn').addEventListener('click', () => {
      const newName = document.getElementById('profile-name-input').value.trim();
      const lastChange = state.profile.lastNameChange || 0;
      const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
      
      if (Date.now() - lastChange < threeDaysMs) {
        this.showToast(TRANSLATIONS[state.lang].nameCooldownErr);
        return;
      }

      if (newName) {
        state.profile.name = newName;
        state.profile.lastNameChange = Date.now();
        state.saveProfile();
        this.renderHeader();
        this.updateNameCooldownUI();
        this.showToast(TRANSLATIONS[state.lang].nameUpdated);
      }
    });

    // Contact Search
    document.getElementById('contact-search-input').addEventListener('input', (e) => {
      this.renderContacts(e.target.value);
    });

    // Add Contact Modal
    const addContactModal = document.getElementById('modal-add-contact');
    document.getElementById('open-add-contact-btn').addEventListener('click', () => {
      addContactModal.classList.remove('hidden');
    });

    document.querySelectorAll('.close-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => addContactModal.classList.add('hidden'));
    });

    document.getElementById('add-contact-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('new-contact-name').value.trim();
      const vnum = document.getElementById('new-contact-vnum').value.trim();

      if (name && vnum.length === 5) {
        state.contacts.unshift({
          name, vnum,
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop"
        });
        state.saveContacts();
        this.renderContacts();
        addContactModal.classList.add('hidden');
        this.showToast(TRANSLATIONS[state.lang].contactAdded);
      }
    });

    // Recents Filter Tabs
    document.querySelectorAll('.tab-filters .tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-filters .tab-btn').forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        this.renderRecents(e.currentTarget.dataset.filter);
      });
    });

    // Clear Notifications
    document.getElementById('clear-notifications-btn').addEventListener('click', () => {
      state.notifications = [];
      state.saveNotifs();
      this.renderNotifs();
    });

    // Reset Account
    document.getElementById('reset-account-btn').addEventListener('click', () => {
      if (confirm(TRANSLATIONS[state.lang].accountResetConfirm)) {
        localStorage.clear();
        location.reload();
      }
    });
  }
}