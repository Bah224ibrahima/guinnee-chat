// ═══════════════════════════════════════════════════
//   GUINÉE CHAT — app.js
//   🔴 Rouge #CE1126  🟡 Jaune #FCD116  🟢 Vert #009460
// ═══════════════════════════════════════════════════

// ── Données initiales ────────────────────────────────
const CONTACTS = [
  { id:1, name:"Fatoumata Diallo", avatar:"FD", status:"online",  lastSeen:"en ligne",           color:"#CE1126", unread:2  },
  { id:2, name:"Mamadou Bah",      avatar:"MB", status:"offline", lastSeen:"hier à 22:14",        color:"#009460", unread:0  },
  { id:3, name:"Aissatou Camara",  avatar:"AC", status:"online",  lastSeen:"en ligne",           color:"#CE1126", unread:5  },
  { id:4, name:"Ibrahim Kouyaté",  avatar:"IK", status:"away",    lastSeen:"il y a 5 min",       color:"#FCD116", unread:0  },
  { id:5, name:"Mariama Sylla",    avatar:"MS", status:"online",  lastSeen:"en ligne",           color:"#009460", unread:1  },
  { id:6, name:"Groupe Famille 🏠",avatar:"GF", status:"group",   lastSeen:"groupe · 6 membres", color:"#CE1126", unread:12 },
];

const STATUSES = [
  { id:1, name:"Mamadou Bah",     avatar:"MB", color:"#009460", time:"Il y a 20 min", seen:false },
  { id:2, name:"Aissatou Camara", avatar:"AC", color:"#CE1126", time:"Il y a 1h",     seen:false },
  { id:3, name:"Ibrahim Kouyaté", avatar:"IK", color:"#FCD116", time:"Il y a 2h",     seen:true  },
  { id:4, name:"Mariama Sylla",   avatar:"MS", color:"#009460", time:"Il y a 3h",     seen:true  },
];

const INIT_MESSAGES = {
  1: [
    { id:1, text:"Salut ! Comment tu vas ? 😊",   sender:"them", time:"10:23", type:"text", status:"read" },
    { id:2, text:"Très bien merci ! Et toi ?",     sender:"me",   time:"10:25", type:"text", status:"read" },
    { id:3, text:"Super ! T'as vu le match hier ?",sender:"them", time:"10:26", type:"text", status:"read" },
    { id:4, text:"Oui c'était incroyable 🔥",      sender:"me",   time:"10:28", type:"text", status:"read" },
    { id:5, text:"On se retrouve ce weekend ?",    sender:"them", time:"10:30", type:"text", status:"delivered" },
  ],
  2: [
    { id:1, text:"Hey ! Tu m'envoies le doc ?",         sender:"them", time:"hier", type:"text", status:"read" },
    { id:2, text:"Bien sûr, je te l'envoie maintenant", sender:"me",   time:"hier", type:"text", status:"read" },
  ],
  3: [
    { id:1, text:"Coucou !! 👋",          sender:"them", time:"09:00", type:"text", status:"read" },
    { id:2, text:"T'es libre pour déjeuner ?", sender:"them", time:"09:01", type:"text", status:"read" },
    { id:3, text:"Oui je suis dispo !",    sender:"me",   time:"09:15", type:"text", status:"read" },
    { id:4, text:"Café du coin alors ?",   sender:"them", time:"09:16", type:"text", status:"read" },
    { id:5, text:"Parfait 😄",             sender:"me",   time:"09:17", type:"text", status:"read" },
  ],
  4: [],
  5: [{ id:1, text:"Bonjour ! J'ai une question", sender:"them", time:"11:45", type:"text", status:"read" }],
  6: [
    { id:1, text:"Maman: On se voit dimanche ?",   sender:"them", time:"lun.", type:"text", status:"read" },
    { id:2, text:"Oui bien sûr !",                 sender:"me",   time:"lun.", type:"text", status:"read" },
    { id:3, text:"Papa: Je fais un barbecue 🍖",   sender:"them", time:"lun.", type:"text", status:"read" },
  ],
};

const BOT_RESPONSES = [
  "Super ! 😄","Ah oui vraiment ?","Haha 😂","C'est trop bien !",
  "Je suis d'accord 👍","Ok je vois !","On en reparlera 😉",
  "Bonne idée !","Merci pour l'info !","Waw, incroyable ! 🔥",
];

const EMOJIS = ["😊","😂","❤️","🔥","👍","😍","🎉","😭","🙏","😘","💪","🥰","😎","🤩","👏","✨","💯","🎊","🥳","😄","😆","🤣","😅","😋","😜","🤔","😴","🤗","😏","😒"];

// ── État de l'application ─────────────────────────────
let registeredUsers = [];
let currentUser     = null;
let fakeOtpCode     = "";
let contacts        = JSON.parse(JSON.stringify(CONTACTS));
let messages        = JSON.parse(JSON.stringify(INIT_MESSAGES));
let selectedContact = null;
let isRecording     = false;
let recInterval     = null;
let recSeconds      = 0;
let msgIdCounter    = 1000;
let voicePlayers    = {};

// ── Navigation entre écrans ───────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const screen = document.getElementById(id);
  if (screen) screen.classList.add('active');
}

// ── Validation des champs ─────────────────────────────
function validatePhone(input, fieldId) {
  input.value = input.value.replace(/\D/g, '');
  const field = document.getElementById(fieldId);
  field.classList.toggle('ok', input.value.length >= 8);
  const btn = document.getElementById('btn-send-sms');
  if (btn) btn.disabled = input.value.length < 8;
}

function validateName(input, fieldId) {
  document.getElementById(fieldId).classList.toggle('ok', input.value.trim().length > 2);
  checkRegisterBtn();
}

function validatePass(input, fieldId) {
  document.getElementById(fieldId).classList.toggle('ok', input.value.length >= 6);
  checkRegisterBtn();
}

function checkRegisterBtn() {
  const otpComplete = document.querySelectorAll('.otp-box.filled').length === 6;
  const name = document.getElementById('reg-name');
  const pass = document.getElementById('reg-pass');
  const btn  = document.getElementById('btn-register');
  if (btn) btn.disabled = !(otpComplete && name && name.value.trim().length > 2 && pass && pass.value.length >= 6);
}

function togglePass(inputId, btn) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') { input.type = 'text'; btn.textContent = '🙈'; }
  else { input.type = 'password'; btn.textContent = '👁️'; }
}

// ── Envoi du SMS ──────────────────────────────────────
function sendSMS() {
  const phone = document.getElementById('reg-phone').value;
  fakeOtpCode = String(Math.floor(100000 + Math.random() * 900000));
  document.getElementById('otp-phone-display').textContent = '+224 ' + phone;
  document.getElementById('sms-code-display').textContent = fakeOtpCode;
  // Reset OTP boxes
  for (let i = 0; i < 6; i++) {
    const box = document.getElementById('otp' + i);
    box.value = '';
    box.classList.remove('filled');
  }
  document.getElementById('otp-extra').style.display = 'none';
  document.getElementById('btn-register').disabled = true;
  showScreen('screen-otp');
}

// ── Saisie OTP ────────────────────────────────────────
function otpInput(index) {
  const box = document.getElementById('otp' + index);
  box.value = box.value.replace(/\D/g, '').slice(-1);
  box.classList.toggle('filled', box.value !== '');
  if (box.value && index < 5) document.getElementById('otp' + (index + 1)).focus();
  checkOtp();
}

function otpKey(event, index) {
  if (event.key === 'Backspace' && !document.getElementById('otp' + index).value && index > 0) {
    document.getElementById('otp' + (index - 1)).focus();
  }
}

function checkOtp() {
  let code = '';
  for (let i = 0; i < 6; i++) code += document.getElementById('otp' + i).value;
  if (code.length === 6) {
    document.getElementById('otp-extra').style.display = 'block';
    checkRegisterBtn();
  }
}

function resendCode() {
  fakeOtpCode = String(Math.floor(100000 + Math.random() * 900000));
  document.getElementById('sms-code-display').textContent = fakeOtpCode;
  for (let i = 0; i < 6; i++) {
    const box = document.getElementById('otp' + i);
    box.value = '';
    box.classList.remove('filled');
  }
  document.getElementById('otp-extra').style.display = 'none';
}

// ── Inscription ───────────────────────────────────────
function doRegister() {
  let code = '';
  for (let i = 0; i < 6; i++) code += document.getElementById('otp' + i).value;

  const errEl = document.getElementById('otp-error');
  if (code !== fakeOtpCode) {
    showError(errEl, '⚠️ Code SMS incorrect. Réessayez.');
    return;
  }
  const name = document.getElementById('reg-name').value.trim();
  const pass = document.getElementById('reg-pass').value;
  const phone = document.getElementById('reg-phone').value;

  if (!name) { showError(errEl, '⚠️ Entrez votre prénom et nom.'); return; }
  if (pass.length < 6) { showError(errEl, '⚠️ Mot de passe minimum 6 caractères.'); return; }

  const user = {
    name,
    phone: '+224' + phone,
    password: pass,
    avatar: name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
  };
  registeredUsers.push(user);
  currentUser = user;
  errEl.style.display = 'none';
  launchApp();
}

// ── Connexion ─────────────────────────────────────────
function doLogin() {
  const phone = document.getElementById('login-phone').value;
  const pass  = document.getElementById('login-pass').value;
  const errEl = document.getElementById('login-error');
  const user  = registeredUsers.find(u => u.phone === '+224' + phone && u.password === pass);
  if (!user) { showError(errEl, '⚠️ Numéro ou mot de passe incorrect.'); return; }
  currentUser = user;
  errEl.style.display = 'none';
  launchApp();
}

function showError(el, msg) {
  el.textContent = msg;
  el.style.display = 'block';
}

// ── Lancement de l'application ────────────────────────
function launchApp() {
  document.getElementById('sb-user-name').textContent = currentUser.name;
  document.getElementById('sb-avatar-text').textContent = currentUser.avatar;
  renderContacts();
  renderStatuses();
  buildEmojiPicker();
  showScreen('screen-app');
}

// ── Rendu contacts ────────────────────────────────────
function renderContacts(filter = '') {
  const list = document.getElementById('contact-list');
  list.innerHTML = '';
  const filtered = contacts.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));

  filtered.forEach(c => {
    const lastMsg = messages[c.id] && messages[c.id].length > 0 ? messages[c.id][messages[c.id].length - 1] : null;
    const preview = lastMsg
      ? (lastMsg.type === 'image' ? '📷 Photo' : lastMsg.type === 'file' ? '📎 Fichier' : lastMsg.type === 'voice' ? '🎙️ Vocal' : lastMsg.text)
      : 'Commencer une conversation...';
    const time = lastMsg ? lastMsg.time : '';
    const isActive = selectedContact && selectedContact.id === c.id;

    const div = document.createElement('div');
    div.className = 'contact-item' + (isActive ? ' active' : '');
    div.onclick = () => openContact(c);
    div.innerHTML = `
      <div class="contact-avatar" style="background:${c.color}">
        ${c.avatar}
        ${c.status !== 'group' ? `<div class="status-dot ${c.status}"></div>` : ''}
      </div>
      <div class="contact-info">
        <div class="contact-top">
          <span class="contact-name">${c.name}</span>
          <span class="contact-time${c.unread > 0 ? ' unread' : ''}">${time}</span>
        </div>
        <div class="contact-bottom">
          <span class="contact-preview">${preview}</span>
          ${c.unread > 0 ? `<div class="unread-badge">${c.unread}</div>` : ''}
        </div>
      </div>`;
    list.appendChild(div);
  });
}

// ── Rendu statuts ─────────────────────────────────────
function renderStatuses() {
  const list = document.getElementById('status-list');
  list.innerHTML = '';
  STATUSES.forEach(s => {
    const div = document.createElement('div');
    div.className = 'status-item';
    div.onclick = () => openStatus(s);
    div.innerHTML = `
      <div class="status-ring${s.seen ? ' seen' : ''}">
        <div class="status-ring-inner">
          <div class="status-avatar-inner" style="background:${s.color}">${s.avatar}</div>
        </div>
      </div>
      <div>
        <div style="color:#f0d0d0;font-size:14px;font-weight:700">${s.name}</div>
        <div style="color:#a07070;font-size:12px;font-weight:600">${s.time}</div>
      </div>`;
    list.appendChild(div);
  });
}

// ── Tabs ──────────────────────────────────────────────
function switchTab(tab) {
  document.getElementById('tab-chats').classList.toggle('active', tab === 'chats');
  document.getElementById('tab-status').classList.toggle('active', tab === 'status');
  document.getElementById('panel-chats').style.display = tab === 'chats' ? 'flex' : 'none';
  document.getElementById('panel-status').style.display = tab === 'status' ? 'block' : 'none';
  if (tab === 'chats') document.getElementById('panel-chats').style.flexDirection = 'column';
}

// ── Recherche ─────────────────────────────────────────
function filterContacts(value) { renderContacts(value); }

// ── Ouvrir un contact ─────────────────────────────────
function openContact(contact) {
  selectedContact = contact;
  contact.unread = 0;

  // Marquer comme lu
  if (messages[contact.id]) {
    messages[contact.id].forEach(m => m.status = 'read');
  }

  renderContacts(document.getElementById('search-input').value);

  // Header
  document.getElementById('chat-avatar').textContent = contact.avatar;
  document.getElementById('chat-avatar').style.background = contact.color;
  document.getElementById('chat-name').textContent = contact.name;
  document.getElementById('chat-status').textContent = contact.lastSeen;

  // Afficher chat
  document.getElementById('empty-state').style.display = 'none';
  const activeChat = document.getElementById('active-chat');
  activeChat.style.display = 'flex';

  // Mobile : cacher sidebar
  if (window.innerWidth < 768) {
    document.querySelector('.sidebar').classList.add('hidden');
    document.getElementById('back-btn').style.display = 'flex';
  }

  renderMessages();
  scrollToBottom();
}

// ── Retour à la liste (mobile) ────────────────────────
function backToList() {
  selectedContact = null;
  document.querySelector('.sidebar').classList.remove('hidden');
  document.getElementById('active-chat').style.display = 'none';
  document.getElementById('empty-state').style.display = 'flex';
}

// ── Rendu messages ────────────────────────────────────
function renderMessages() {
  const area = document.getElementById('messages-area');
  area.innerHTML = '<div class="date-divider"><span>AUJOURD\'HUI</span></div>';

  if (!selectedContact || !messages[selectedContact.id]) return;

  messages[selectedContact.id].forEach(m => {
    area.appendChild(createMessageEl(m));
  });
}

function createMessageEl(m) {
  const row = document.createElement('div');
  row.className = 'message-row ' + m.sender;
  row.id = 'msg-' + m.id;

  const bubble = document.createElement('div');
  bubble.className = 'bubble ' + m.sender;

  let content = '';

  if (m.type === 'image') {
    content = `<img src="${m.url}" class="msg-image" alt="image"/>`;
  } else if (m.type === 'file') {
    content = `<div class="file-bubble">
      <div class="file-icon">📎</div>
      <div><div class="file-name">${m.text}</div><div class="file-size">${m.fileSize || ''}</div></div>
    </div>`;
  } else if (m.type === 'voice') {
    const vid = 'voice-' + m.id;
    content = `<div class="voice-bubble" id="${vid}">
      <button class="voice-play" onclick="toggleVoice(${m.id}, ${m.duration})">▶</button>
      <div class="voice-waves" id="waves-${m.id}">${generateWaveBars()}</div>
      <span class="voice-dur" id="dur-${m.id}">${formatTime(m.duration)}</span>
    </div>`;
  } else {
    content = `<span class="bubble-text">${escapeHtml(m.text)}</span>`;
  }

  const statusIcon = m.sender === 'me' ? getMsgStatus(m.status) : '';
  bubble.innerHTML = `${content}
    <div class="bubble-meta">
      <span class="bubble-time">${m.time}</span>
      ${statusIcon}
    </div>`;

  row.appendChild(bubble);
  return row;
}

function generateWaveBars() {
  const heights = [4,8,14,10,18,12,8,16,10,6,14,9,16,11,7,13,8,15,10,6];
  return heights.map(h => `<div class="voice-bar" style="height:${h}px"></div>`).join('');
}

function getMsgStatus(status) {
  if (status === 'read')      return '<span class="msg-status read">✓✓</span>';
  if (status === 'delivered') return '<span class="msg-status">✓✓</span>';
  return '<span class="msg-status">✓</span>';
}

function escapeHtml(text) {
  return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Envoi de message texte ────────────────────────────
function doSend() {
  const input = document.getElementById('message-input');
  const text = input.value.trim();
  if (!text || !selectedContact) return;
  input.value = '';
  updateSendMicBtn();

  const msg = createMsg('text', { text });
  addMessage(msg);

  // Marquer comme livré
  setTimeout(() => {
    msg.status = 'delivered';
    updateMsgStatus(msg.id, 'delivered');
  }, 500);

  // Bot répond
  setTimeout(() => showTyping(), 1000);
  setTimeout(() => {
    hideTyping();
    const bot = createMsg('text', { text: BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)] }, 'them');
    addMessage(bot);
    msg.status = 'read';
    updateMsgStatus(msg.id, 'read');
  }, 2500);
}

function onInput() { updateSendMicBtn(); }

function onKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
}

function updateSendMicBtn() {
  const val = document.getElementById('message-input').value.trim();
  const sendBtn = document.getElementById('send-btn');
  const micBtn  = document.getElementById('mic-btn');
  if (val) {
    sendBtn.classList.remove('hidden'); sendBtn.style.display = 'flex';
    micBtn.classList.add('hidden');    micBtn.style.display = 'none';
  } else {
    sendBtn.classList.add('hidden');   sendBtn.style.display = 'none';
    micBtn.classList.remove('hidden'); micBtn.style.display = 'flex';
  }
}

// ── Envoi de fichier/image ────────────────────────────
function sendFile(input) {
  const file = input.files[0];
  if (!file || !selectedContact) return;
  const url = URL.createObjectURL(file);
  const isImage = file.type.startsWith('image/');
  const msg = createMsg(isImage ? 'image' : 'file', {
    text: file.name,
    url,
    fileSize: (file.size / 1024).toFixed(1) + ' KB',
  });
  addMessage(msg);
  input.value = '';
}

// ── Message vocal ─────────────────────────────────────
function toggleRec() {
  if (isRecording) stopRec(); else startRec();
}

function startRec() {
  isRecording = true;
  recSeconds = 0;
  document.getElementById('mic-btn').className = 'mic-btn rec';
  document.getElementById('mic-btn').textContent = '⏹';
  document.getElementById('recording-ui').style.display = 'flex';
  document.getElementById('message-input').style.display = 'none';

  // Barres ondes animées
  const wave = document.getElementById('rec-wave');
  wave.innerHTML = Array.from({length:18}).map(() =>
    `<div style="width:3px;border-radius:2px;background:#CE112299;height:${6+Math.random()*12}px"></div>`
  ).join('');

  recInterval = setInterval(() => {
    recSeconds++;
    document.getElementById('rec-timer').textContent = formatTime(recSeconds);
  }, 1000);
}

function stopRec() {
  clearInterval(recInterval);
  isRecording = false;
  const duration = recSeconds;
  recSeconds = 0;

  document.getElementById('mic-btn').className = 'mic-btn idle';
  document.getElementById('mic-btn').textContent = '🎙️';
  document.getElementById('recording-ui').style.display = 'none';
  document.getElementById('message-input').style.display = 'block';

  if (duration > 0 && selectedContact) {
    const msg = createMsg('voice', { duration });
    addMessage(msg);
  }
}

function cancelRec() {
  clearInterval(recInterval);
  isRecording = false;
  recSeconds = 0;
  document.getElementById('mic-btn').className = 'mic-btn idle';
  document.getElementById('mic-btn').textContent = '🎙️';
  document.getElementById('recording-ui').style.display = 'none';
  document.getElementById('message-input').style.display = 'block';
}

// ── Lecture message vocal ─────────────────────────────
function toggleVoice(msgId, duration) {
  const btn   = document.querySelector(`#voice-${msgId} .voice-play`);
  const bars  = document.querySelectorAll(`#waves-${msgId} .voice-bar`);
  const durEl = document.getElementById('dur-' + msgId);
  const player = voicePlayers[msgId];

  if (player && player.playing) {
    clearInterval(player.interval);
    voicePlayers[msgId].playing = false;
    btn.textContent = '▶';
    bars.forEach(b => b.classList.remove('active'));
    durEl.textContent = formatTime(duration);
    return;
  }

  let elapsed = 0;
  const interval = setInterval(() => {
    elapsed = Math.min(elapsed + 0.1, duration);
    durEl.textContent = formatTime(elapsed);
    bars.forEach((b, i) => {
      b.style.height = (4 + Math.random() * 14) + 'px';
      b.classList.toggle('active', Math.random() > 0.3);
    });
    if (elapsed >= duration) {
      clearInterval(interval);
      voicePlayers[msgId] = { playing: false };
      btn.textContent = '▶';
      bars.forEach(b => b.classList.remove('active'));
      durEl.textContent = formatTime(duration);
    }
  }, 100);

  voicePlayers[msgId] = { playing: true, interval };
  btn.textContent = '⏹';
}

// ── Emoji Picker ──────────────────────────────────────
function buildEmojiPicker() {
  const picker = document.getElementById('emoji-picker');
  picker.innerHTML = '';
  EMOJIS.forEach(e => {
    const btn = document.createElement('button');
    btn.className = 'emoji-btn';
    btn.textContent = e;
    btn.onclick = () => {
      const input = document.getElementById('message-input');
      input.value += e;
      input.focus();
      closeEmoji();
      updateSendMicBtn();
    };
    picker.appendChild(btn);
  });
}

function toggleEmoji() {
  const picker = document.getElementById('emoji-picker');
  picker.style.display = picker.style.display === 'flex' ? 'none' : 'flex';
}

function closeEmoji() {
  document.getElementById('emoji-picker').style.display = 'none';
}

// ── Status viewer ─────────────────────────────────────
let statusTimer = null;

function openStatus(s) {
  document.getElementById('status-viewer-avatar').textContent = s.avatar;
  document.getElementById('status-viewer-avatar').style.background = s.color;
  document.getElementById('status-viewer-name').textContent = s.name;
  document.getElementById('status-viewer-time').textContent = s.time;
  document.getElementById('status-content').textContent = ['🌟','✨','🎉','💫','🔥','❤️','😊','🎊','🙌','💪'][s.id % 10];
  document.getElementById('status-content').style.background = `linear-gradient(135deg, ${s.color}22, #000)`;

  // Reset progress bar
  const fill = document.getElementById('status-progress');
  fill.style.animation = 'none';
  fill.offsetHeight; // reflow
  fill.style.animation = 'progress 5s linear forwards';
  fill.onanimationend = () => closeStatus();

  document.getElementById('status-overlay').style.display = 'flex';
}

function closeStatus() {
  document.getElementById('status-overlay').style.display = 'none';
}

// ── Typing indicator ──────────────────────────────────
function showTyping() {
  hideTyping();
  const area = document.getElementById('messages-area');
  const div = document.createElement('div');
  div.id = 'typing-indicator';
  div.className = 'typing-indicator';
  div.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  area.appendChild(div);
  scrollToBottom();
}

function hideTyping() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

// ── Helpers ───────────────────────────────────────────
function createMsg(type, extra = {}, sender = 'me') {
  const now = new Date();
  const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const msg = { id: ++msgIdCounter, sender, type, time, status: 'sent', ...extra };
  if (!messages[selectedContact.id]) messages[selectedContact.id] = [];
  messages[selectedContact.id].push(msg);
  return msg;
}

function addMessage(msg) {
  const area = document.getElementById('messages-area');
  const el = createMessageEl(msg);
  area.appendChild(el);
  scrollToBottom();
  renderContacts(document.getElementById('search-input').value);
}

function updateMsgStatus(msgId, status) {
  const meta = document.querySelector(`#msg-${msgId} .msg-status`);
  if (!meta) return;
  if (status === 'read')      { meta.textContent = '✓✓'; meta.className = 'msg-status read'; }
  else if (status === 'delivered') { meta.textContent = '✓✓'; meta.className = 'msg-status'; }
}

function scrollToBottom() {
  const area = document.getElementById('messages-area');
  setTimeout(() => area.scrollTop = area.scrollHeight, 50);
}

function formatTime(seconds) {
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ── Init ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateSendMicBtn();
  // Responsive
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      document.querySelector('.sidebar').classList.remove('hidden');
    }
  });
});