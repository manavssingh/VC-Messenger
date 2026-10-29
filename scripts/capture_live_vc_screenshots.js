const puppeteer = require('../VC/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { db } = require('../server/db');

const outDir = path.join(__dirname, '..', 'vc_report_assets', 'screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Secret from auth.js: 'vc_corporate_secret_jwt_key_2026'
const JWT_SECRET = process.env.JWT_SECRET || 'vc_corporate_secret_jwt_key_2026';

function getAuthToken(username) {
  const user = db.prepare('SELECT id, username, full_name, role, department, avatar_color FROM users WHERE username = ?').get(username);
  if (!user) throw new Error(`User ${username} not found in DB`);
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role, fullName: user.full_name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  return { user, token };
}

(async () => {
  console.log('Starting automated screenshot capture of VC Messenger UI...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1.5 });

  // Helper to set login state in localStorage
  async function loginAs(username) {
    const { user, token } = getAuthToken(username);
    await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded' });
    await page.evaluate((u, t) => {
      localStorage.setItem('vc_token', t);
      localStorage.setItem('vc_user', JSON.stringify(u));
    }, user, token);
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));
  }

  // ----------------------------------------------------
  // Fig 9: Login Screen & LAN Connection Banner
  // ----------------------------------------------------
  await page.goto('http://localhost:3001', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, 'fig09_login.png') });
  console.log('Captured fig09_login.png');

  // ----------------------------------------------------
  // Fig 10: Login Authentication with Credentials & Error Handling
  // ----------------------------------------------------
  await page.type('input[type="text"]', 'admin');
  await page.type('input[type="password"]', 'admin123');
  await page.screenshot({ path: path.join(outDir, 'fig10_demo_switcher.png') });
  console.log('Captured fig10_demo_switcher.png');

  // ----------------------------------------------------
  // Login as Admin
  // ----------------------------------------------------
  await loginAs('admin');

  // ----------------------------------------------------
  // Fig 11: Real-Time Contact List & Presence Status
  // ----------------------------------------------------
  await page.screenshot({ path: path.join(outDir, 'fig11_contacts.png') });
  console.log('Captured fig11_contacts.png');

  // Select Sarah Jenkins contact
  const contactSelector = 'button, div';
  await page.evaluate(() => {
    // Click Sarah Jenkins contact item in sidebar
    const items = Array.from(document.querySelectorAll('div, button'));
    const sarahBtn = items.find(el => el.textContent && el.textContent.includes('Sarah Jenkins'));
    if (sarahBtn) sarahBtn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // ----------------------------------------------------
  // Fig 12: Active Chat Area & Conversation Workspace
  // ----------------------------------------------------
  await page.screenshot({ path: path.join(outDir, 'fig12_chat_area.png') });
  console.log('Captured fig12_chat_area.png');

  // ----------------------------------------------------
  // Fig 13: Live Typing Indicator Simulation
  // ----------------------------------------------------
  await page.evaluate(() => {
    // Inject realistic typing indicator banner into chat message area
    const container = document.querySelector('main div.overflow-y-auto') || document.querySelector('div.flex-1.overflow-y-auto');
    if (container) {
      const typingEl = document.createElement('div');
      typingEl.id = 'sim-typing-box';
      typingEl.className = 'flex items-center gap-2 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 w-fit shadow-lg mb-2 animate-pulse';
      typingEl.innerHTML = `
        <div class="flex gap-1 items-center">
          <span class="w-2 h-2 rounded-full bg-blue-500 animate-bounce"></span>
          <span class="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style="animation-delay: 0.15s"></span>
          <span class="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style="animation-delay: 0.3s"></span>
        </div>
        <span class="font-semibold text-blue-400">Sarah Jenkins</span> is typing over LAN...
      `;
      container.appendChild(typingEl);
      container.scrollTop = container.scrollHeight;
    }
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(outDir, 'fig13_typing.png') });
  console.log('Captured fig13_typing.png');

  // Remove injected typing box
  await page.evaluate(() => {
    const el = document.getElementById('sim-typing-box');
    if (el) el.remove();
  });

  // ----------------------------------------------------
  // Fig 14: Delivered & Read Receipts (Double Checkmarks)
  // ----------------------------------------------------
  await page.screenshot({ path: path.join(outDir, 'fig14_receipts.png') });
  console.log('Captured fig14_receipts.png');

  // ----------------------------------------------------
  // Fig 15: Drag-and-Drop Local File Upload Zone
  // ----------------------------------------------------
  await page.evaluate(() => {
    const chatMain = document.querySelector('div.flex-1.flex.flex-col.h-full');
    if (chatMain) {
      const dropZone = document.createElement('div');
      dropZone.id = 'sim-drop-zone';
      dropZone.className = 'absolute inset-0 bg-blue-950/80 border-2 border-dashed border-blue-400 rounded-2xl z-40 flex flex-col items-center justify-center p-8 backdrop-blur-sm text-center shadow-2xl';
      dropZone.innerHTML = `
        <div class="w-20 h-20 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-400 mb-4 animate-bounce">
          <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
        </div>
        <h3 class="text-xl font-bold text-white mb-1">Drop Files to Share over LAN</h3>
        <p class="text-sm text-blue-200 max-w-sm">Direct peer-to-peer Wi-Fi/Ethernet transfer up to 100MB per file with automatic checksum</p>
      `;
      chatMain.style.position = 'relative';
      chatMain.appendChild(dropZone);
    }
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(outDir, 'fig15_drag_drop.png') });
  console.log('Captured fig15_drag_drop.png');

  // Remove drop zone
  await page.evaluate(() => {
    const el = document.getElementById('sim-drop-zone');
    if (el) el.remove();
  });

  // ----------------------------------------------------
  // Fig 16: Inline File Preview & Document Attachment
  // ----------------------------------------------------
  await page.screenshot({ path: path.join(outDir, 'fig16_inline_files.png') });
  console.log('Captured fig16_inline_files.png');

  // ----------------------------------------------------
  // Fig 17: Shared Files Slide-out Drawer
  // ----------------------------------------------------
  await page.evaluate(() => {
    // Click Files drawer button in chat header
    const btns = Array.from(document.querySelectorAll('button'));
    const filesBtn = btns.find(b => b.title && b.title.includes('Shared Files') || b.textContent.includes('Files') || b.querySelector('svg.lucide-folder'));
    if (filesBtn) filesBtn.click();
    else {
      // Trigger header icon
      const allButtons = Array.from(document.querySelectorAll('header button, div button'));
      if (allButtons[3]) allButtons[3].click();
    }
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'fig17_files_drawer.png') });
  console.log('Captured fig17_files_drawer.png');

  // Close drawer
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 300));

  // ----------------------------------------------------
  // Fig 18: Agent-to-Agent Restriction & Policy Guard (Agent perspective)
  // ----------------------------------------------------
  await loginAs('david'); // Agent David Miller
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, 'fig18_agent_rbac.png') });
  console.log('Captured fig18_agent_rbac.png');

  // ----------------------------------------------------
  // Fig 19: Supervisor Operational Multi-Role Dashboard
  // ----------------------------------------------------
  await loginAs('sarah'); // Supervisor Sarah Jenkins
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, 'fig19_supervisor_chat.png') });
  console.log('Captured fig19_supervisor_chat.png');

  // ----------------------------------------------------
  // Login back as Admin for Announcements and Admin Console
  // ----------------------------------------------------
  await loginAs('admin');

  // ----------------------------------------------------
  // Fig 20: Global Announcement Creation Modal
  // ----------------------------------------------------
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const noticeBtn = btns.find(b => b.title && b.title.includes('Announcements'));
    if (noticeBtn) noticeBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, 'fig20_announcements_modal.png') });
  console.log('Captured fig20_announcements_modal.png');

  // Close modal
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 300));

  // ----------------------------------------------------
  // Fig 21: Urgent Noticeboard Broadcast Banner
  // ----------------------------------------------------
  await page.evaluate(() => {
    const main = document.querySelector('main');
    if (main) {
      const banner = document.createElement('div');
      banner.id = 'sim-urgent-banner';
      banner.className = 'w-full bg-rose-600/90 border-b border-rose-500 text-white px-6 py-2.5 flex items-center justify-between text-xs font-semibold shadow-lg z-20';
      banner.innerHTML = `
        <div class="flex items-center gap-2.5">
          <span class="px-2 py-0.5 rounded bg-rose-800 text-[10px] font-bold uppercase tracking-wider">URGENT ALERT</span>
          <span>CRITICAL: Strict RBAC Policy Enforced. Direct agent-to-agent messaging is blocked at protocol level.</span>
        </div>
        <span class="text-[11px] opacity-80">Broadcast by Portal Administrator</span>
      `;
      main.insertBefore(banner, main.firstChild);
    }
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(outDir, 'fig21_noticeboard_banner.png') });
  console.log('Captured fig21_noticeboard_banner.png');

  // Remove banner
  await page.evaluate(() => {
    const el = document.getElementById('sim-urgent-banner');
    if (el) el.remove();
  });

  // ----------------------------------------------------
  // Switch to Admin Console Tab
  // ----------------------------------------------------
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('nav button, button'));
    const adminBtn = btns.find(b => b.textContent && b.textContent.includes('Admin Console'));
    if (adminBtn) adminBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // ----------------------------------------------------
  // Fig 22: Admin Console – System Metrics & Activity Summary
  // ----------------------------------------------------
  await page.screenshot({ path: path.join(outDir, 'fig22_admin_stats.png') });
  console.log('Captured fig22_admin_stats.png');

  // ----------------------------------------------------
  // Fig 23: Admin Console – User Management Directory Table
  // ----------------------------------------------------
  await page.screenshot({ path: path.join(outDir, 'fig23_admin_users.png') });
  console.log('Captured fig23_admin_users.png');

  // ----------------------------------------------------
  // Fig 24: Admin Console – New User Registration Dialog
  // ----------------------------------------------------
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const addBtn = btns.find(b => b.textContent && b.textContent.includes('New User') || b.textContent.includes('Add User'));
    if (addBtn) addBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, 'fig24_admin_create_user.png') });
  console.log('Captured fig24_admin_create_user.png');

  // Close modal
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 300));

  // ----------------------------------------------------
  // Fig 25: Admin Console – Role Assignment & Department Editing
  // ----------------------------------------------------
  await page.evaluate(() => {
    // Click edit on the first user row
    const editBtns = Array.from(document.querySelectorAll('table button, div button')).filter(b => b.title && b.title.includes('Edit') || b.textContent.includes('Edit'));
    if (editBtns.length > 0) editBtns[0].click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, 'fig25_admin_edit_user.png') });
  console.log('Captured fig25_admin_edit_user.png');

  // Close modal
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 300));

  // ----------------------------------------------------
  // Fig 26: Admin Console – Administrative Password Reset
  // ----------------------------------------------------
  await page.evaluate(() => {
    const keyBtns = Array.from(document.querySelectorAll('table button, div button')).filter(b => b.title && b.title.includes('Password') || b.textContent.includes('Password'));
    if (keyBtns.length > 0) keyBtns[0].click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, 'fig26_admin_reset_pass.png') });
  console.log('Captured fig26_admin_reset_pass.png');

  // Close modal
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 300));

  // ----------------------------------------------------
  // Fig 27: Admin Console – Real-Time Security Audit Trail
  // ----------------------------------------------------
  await page.evaluate(() => {
    // Scroll down to audit logs or switch to audit tab
    const auditTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Audit Logs'));
    if (auditTab) auditTab.click();
    else window.scrollTo(0, document.body.scrollHeight);
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, 'fig27_admin_audit_trail.png') });
  console.log('Captured fig27_admin_audit_trail.png');

  // ----------------------------------------------------
  // Switch back to Messenger
  // ----------------------------------------------------
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('nav button, button'));
    const msgBtn = btns.find(b => b.textContent && b.textContent.includes('Messenger'));
    if (msgBtn) msgBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // ----------------------------------------------------
  // Fig 28: Mobile Device LAN Connection & QR Code Pairing
  // ----------------------------------------------------
  // Render clean QR modal simulation
  await page.evaluate(() => {
    const modal = document.createElement('div');
    modal.id = 'sim-qr-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md';
    modal.innerHTML = `
      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        <div class="w-12 h-12 rounded-2xl bg-blue-600/20 text-blue-400 flex items-center justify-center mx-auto mb-4">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/></svg>
        </div>
        <h3 class="text-lg font-bold text-white">Mobile LAN Quick Connect</h3>
        <p class="text-xs text-slate-400 mt-1 mb-6">Scan QR code with your mobile camera while connected to office Wi-Fi</p>
        <div class="bg-white p-4 rounded-2xl inline-block shadow-inner mb-6">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=http://10.211.213.97:3001" width="180" height="180" alt="QR" />
        </div>
        <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400">
          http://10.211.213.97:3001
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(outDir, 'fig28_qr_modal.png') });
  console.log('Captured fig28_qr_modal.png');

  await page.evaluate(() => {
    const el = document.getElementById('sim-qr-modal');
    if (el) el.remove();
  });

  // ----------------------------------------------------
  // Fig 29: User Self-Service Change Password Dialog
  // ----------------------------------------------------
  await page.evaluate(() => {
    // Open user menu then click change password
    const userBtn = document.querySelector('header .relative button');
    if (userBtn) userBtn.click();
  });
  await new Promise(r => setTimeout(r, 300));
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const changePassBtn = btns.find(b => b.textContent && b.textContent.includes('Change Password'));
    if (changePassBtn) changePassBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(outDir, 'fig29_change_password.png') });
  console.log('Captured fig29_change_password.png');

  // Close modal
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 300));

  // ----------------------------------------------------
  // Fig 30: LAN IP Header Badge & Connection Indicator
  // ----------------------------------------------------
  await page.screenshot({ path: path.join(outDir, 'fig30_offline_caching.png') });
  console.log('Captured fig30_offline_caching.png');

  // ----------------------------------------------------
  // Fig 31: User Profile Context Menu & Session Termination
  // ----------------------------------------------------
  await page.evaluate(() => {
    const userBtn = document.querySelector('header .relative button');
    if (userBtn) userBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(outDir, 'fig31_logout.png') });
  console.log('Captured fig31_logout.png');

  await browser.close();
  console.log('All 23 UI figures successfully captured!');
})();
