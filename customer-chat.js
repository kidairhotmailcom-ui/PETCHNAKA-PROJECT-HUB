(() => {
  'use strict';
  const API_URL = 'https://petchnikka-jarvis-core.onrender.com/api/public/customer-chat';
  const HISTORY_KEY = 'petchnaka_customer_chat_history_v1';
  const SESSION_KEY = 'petchnaka_customer_chat_id_v1';
  const read = (key, fallback) => {
    try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
    catch { return fallback; }
  };
  const write = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} };
  const getConversationId = () => {
    try {
      let id = localStorage.getItem(SESSION_KEY);
      if (!id) {
        id = crypto.randomUUID ? crypto.randomUUID() : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
          const r = Math.random() * 16 | 0; return (c === 'x' ? r : (r & 3 | 8)).toString(16);
        });
        localStorage.setItem(SESSION_KEY, id);
      }
      return id;
    } catch {
      return crypto.randomUUID ? crypto.randomUUID() : '00000000-0000-4000-8000-000000000001';
    }
  };

  const root = document.createElement('div');
  root.innerHTML = `
    <button class="pk-chat-launcher" type="button" aria-expanded="false" aria-controls="pkChatPanel">คุยกับ AI บริษัท</button>
    <section class="pk-chat-panel" id="pkChatPanel" role="dialog" aria-label="แชทกับเจ้าหน้าที่ AI" aria-modal="false">
      <header class="pk-chat-head">
        <div class="pk-chat-brand"><div class="pk-chat-mark" aria-hidden="true">AI</div><div><div class="pk-chat-title">เจ้าหน้าที่ AI บริษัท</div><div class="pk-chat-subtitle">PETCHNAKA · ตอบคำถามอัตโนมัติ</div></div></div>
        <button class="pk-chat-close" type="button" aria-label="ปิดหน้าต่างแชท">×</button>
      </header>
      <div class="pk-chat-messages" aria-live="polite"></div>
      <form class="pk-chat-form">
        <div class="pk-chat-compose">
          <textarea class="pk-chat-input" rows="1" maxlength="1600" placeholder="พิมพ์คำถามของคุณ..." aria-label="ข้อความที่ต้องการส่ง" required></textarea>
          <button class="pk-chat-send" type="submit">ส่ง</button>
        </div>
        <p class="pk-chat-privacy">ไม่ต้องส่งรหัสผ่าน, OTP, ข้อมูลบัตร หรือข้อมูลลับ การสนทนานี้อาจถูกบันทึกเพื่อให้บริษัทติดตามและปรับปรุงบริการ</p>
      </form>
    </section>`;
  document.body.appendChild(root);

  const launcher = root.querySelector('.pk-chat-launcher');
  const panel = root.querySelector('.pk-chat-panel');
  const close = root.querySelector('.pk-chat-close');
  const messages = root.querySelector('.pk-chat-messages');
  const form = root.querySelector('.pk-chat-form');
  const input = root.querySelector('.pk-chat-input');
  const send = root.querySelector('.pk-chat-send');
  let history = read(HISTORY_KEY, []);
  if (!Array.isArray(history)) history = [];
  history = history.filter(x => x && ['user','assistant'].includes(x.role) && typeof x.content === 'string').slice(-20);

  const addMessage = (role, content) => {
    const node = document.createElement('div');
    node.className = 'pk-chat-message ' + role;
    node.textContent = content;
    messages.appendChild(node);
    messages.scrollTop = messages.scrollHeight;
  };
  const saveHistory = () => write(HISTORY_KEY, history.slice(-20));
  if (history.length) history.forEach(x => addMessage(x.role === 'assistant' ? 'ai' : 'user', x.content));
  else addMessage('ai', 'สวัสดีครับ ยินดีต้อนรับสู่เว็บไซต์บริษัท เพชรนาคา ซิสเต็มเวิร์ค จำกัด มีคำถามเกี่ยวกับสินค้าและบริการ พิมพ์สอบถามได้เลยครับ');

  const openPanel = () => {
    panel.classList.add('is-open');
    launcher.setAttribute('aria-expanded', 'true');
    launcher.textContent = 'ปิดหน้าต่างแชท';
    input.focus();
  };
  const closePanel = () => {
    panel.classList.remove('is-open');
    launcher.setAttribute('aria-expanded', 'false');
    launcher.textContent = 'คุยกับ AI บริษัท';
  };
  launcher.addEventListener('click', () => panel.classList.contains('is-open') ? closePanel() : openPanel());
  close.addEventListener('click', closePanel);

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const message = input.value.trim();
    if (!message || send.disabled) return;
    const previousHistory = history.slice(-4);
    history.push({ role: 'user', content: message });
    saveHistory();
    addMessage('user', message);
    input.value = '';
    send.disabled = true;
    send.textContent = 'กำลังส่ง';
    const typing = document.createElement('div');
    typing.className = 'pk-chat-typing';
    typing.textContent = 'AI กำลังพิมพ์คำตอบ...';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: getConversationId(),
          message,
          history: previousHistory
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.reply) throw new Error(data.error || 'ระบบยังไม่พร้อม');
      typing.remove();
      history.push({ role: 'assistant', content: data.reply });
      saveHistory();
      addMessage('ai', data.reply);
      if (data.handoff_requested) {
        addMessage('notice', 'บันทึกคำขอให้ฝ่ายบริการลูกค้าตรวจสอบแล้ว');
      }
    } catch (error) {
      typing.remove();
      addMessage('notice', 'ขออภัย ขณะนี้ระบบตอบกลับไม่ได้ กรุณาลองใหม่อีกครั้ง หรือติดต่อบริษัทตามข้อมูลที่แสดงบนเว็บไซต์');
    } finally {
      send.disabled = false;
      send.textContent = 'ส่ง';
      input.focus();
    }
  });
})();
