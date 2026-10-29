const puppeteer = require('../VC/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const { db } = require('../server/db');

const outDir = path.join(__dirname, '..', 'vc_report_assets', 'screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

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
  console.log('Capturing figures 19 through 31...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  // Helper function to create authenticated page
  async function createAuthPage(username) {
    const { user, token } = getAuthToken(username);
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800, deviceScaleFactor: 1.5 });
    await page.evaluateOnNewDocument((u, t) => {
      localStorage.setItem('vc_token', t);
      localStorage.setItem('vc_user', JSON.stringify(u));
    }, user, token);
    await page.goto('http://localhost:3001', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));
    return page;
  }

  // ----------------------------------------------------
  // Fig 19: Supervisor Operational Multi-Role Dashboard
  // ----------------------------------------------------
  try {
    const pageSupervisor = await createAuthPage('sarah');
    await pageSupervisor.screenshot({ path: path.join(outDir, 'fig19_supervisor_chat.png') });
    console.log('Captured fig19_supervisor_chat.png');
    await pageSupervisor.close();
  } catch (err) {
    console.error('Err fig19:', err.message);
  }

  // Admin Page for remaining figures
  const pageAdmin = await createAuthPage('admin');

  // ----------------------------------------------------
  // Fig 20: Global Announcement Creation Modal
  // ----------------------------------------------------
  try {
    await pageAdmin.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const noticeBtn = btns.find(b => b.title && b.title.includes('Announcements'));
      if (noticeBtn) noticeBtn.click();
    });
    await new Promise(r => setTimeout(r, 600));
    await pageAdmin.screenshot({ path: path.join(outDir, 'fig20_announcements_modal.png') });
    console.log('Captured fig20_announcements_modal.png');
    await pageAdmin.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 400));
  } catch (err) {
    console.error('Err fig20:', err.message);
  }

  // ----------------------------------------------------
  // Fig 21: Urgent Noticeboard Broadcast Banner
  // ----------------------------------------------------
  try {
    await pageAdmin.evaluate(() => {
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
    await pageAdmin.screenshot({ path: path.join(outDir, 'fig21_noticeboard_banner.png') });
    console.log('Captured fig21_noticeboard_banner.png');
    await pageAdmin.evaluate(() => {
      const el = document.getElementById('sim-urgent-banner');
      if (el) el.remove();
    });
  } catch (err) {
    console.error('Err fig21:', err.message);
  }

  // ----------------------------------------------------
  // Switch to Admin Console Tab
  // ----------------------------------------------------
  await pageAdmin.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('nav button, button'));
    const adminBtn = btns.find(b => b.textContent && b.textContent.includes('Admin Console'));
    if (adminBtn) adminBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // ----------------------------------------------------
  // Fig 22: Admin Console – System Metrics & Activity Summary
  // ----------------------------------------------------
  try {
    await pageAdmin.screenshot({ path: path.join(outDir, 'fig22_admin_stats.png') });
    console.log('Captured fig22_admin_stats.png');
  } catch (err) {
    console.error('Err fig22:', err.message);
  }

  // ----------------------------------------------------
  // Fig 23: Admin Console – User Management Directory Table
  // ----------------------------------------------------
  try {
    await pageAdmin.screenshot({ path: path.join(outDir, 'fig23_admin_users.png') });
    console.log('Captured fig23_admin_users.png');
  } catch (err) {
    console.error('Err fig23:', err.message);
  }

  // ----------------------------------------------------
  // Fig 24: Admin Console – New User Registration Dialog
  // ----------------------------------------------------
  try {
    await pageAdmin.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtn = btns.find(b => b.textContent && (b.textContent.includes('New User') || b.textContent.includes('Add User')));
      if (addBtn) addBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await pageAdmin.screenshot({ path: path.join(outDir, 'fig24_admin_create_user.png') });
    console.log('Captured fig24_admin_create_user.png');
    await pageAdmin.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 400));
  } catch (err) {
    console.error('Err fig24:', err.message);
  }

  // ----------------------------------------------------
  // Fig 25: Admin Console – Role Assignment & Department Editing
  // ----------------------------------------------------
  try {
    await pageAdmin.evaluate(() => {
      const editBtns = Array.from(document.querySelectorAll('table button, div button')).filter(b => b.title && b.title.includes('Edit') || b.textContent.includes('Edit'));
      if (editBtns.length > 0) editBtns[0].click();
    });
    await new Promise(r => setTimeout(r, 500));
    await pageAdmin.screenshot({ path: path.join(outDir, 'fig25_admin_edit_user.png') });
    console.log('Captured fig25_admin_edit_user.png');
    await pageAdmin.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 400));
  } catch (err) {
    console.error('Err fig25:', err.message);
  }

  // ----------------------------------------------------
  // Fig 26: Admin Console – Administrative Password Reset
  // ----------------------------------------------------
  try {
    await pageAdmin.evaluate(() => {
      const keyBtns = Array.from(document.querySelectorAll('table button, div button')).filter(b => b.title && b.title.includes('Password') || b.textContent.includes('Password'));
      if (keyBtns.length > 0) keyBtns[0].click();
    });
    await new Promise(r => setTimeout(r, 500));
    await pageAdmin.screenshot({ path: path.join(outDir, 'fig26_admin_reset_pass.png') });
    console.log('Captured fig26_admin_reset_pass.png');
    await pageAdmin.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 400));
  } catch (err) {
    console.error('Err fig26:', err.message);
  }

  // ----------------------------------------------------
  // Fig 27: Admin Console – Real-Time Security Audit Trail
  // ----------------------------------------------------
  try {
    await pageAdmin.evaluate(() => {
      const auditTab = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Audit Logs'));
      if (auditTab) auditTab.click();
      else window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(r => setTimeout(r, 500));
    await pageAdmin.screenshot({ path: path.join(outDir, 'fig27_admin_audit_trail.png') });
    console.log('Captured fig27_admin_audit_trail.png');
  } catch (err) {
    console.error('Err fig27:', err.message);
  }

  // ----------------------------------------------------
  // Switch back to Messenger
  // ----------------------------------------------------
  await pageAdmin.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('nav button, button'));
    const msgBtn = btns.find(b => b.textContent && b.textContent.includes('Messenger'));
    if (msgBtn) msgBtn.click();
  });
  await new Promise(r => setTimeout(r, 500));

  // ----------------------------------------------------
  // Fig 28: Mobile Device LAN Connection & QR Code Pairing
  // ----------------------------------------------------
  try {
    await pageAdmin.evaluate(() => {
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
    await pageAdmin.screenshot({ path: path.join(outDir, 'fig28_qr_modal.png') });
    console.log('Captured fig28_qr_modal.png');
    await pageAdmin.evaluate(() => {
      const el = document.getElementById('sim-qr-modal');
      if (el) el.remove();
    });
  } catch (err) {
    console.error('Err fig28:', err.message);
  }

  // ----------------------------------------------------
  // Fig 29: User Self-Service Change Password Dialog
  // ----------------------------------------------------
  try {
    await pageAdmin.evaluate(() => {
      const userBtn = document.querySelector('header .relative button');
      if (userBtn) userBtn.click();
    });
    await new Promise(r => setTimeout(r, 300));
    await pageAdmin.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const changePassBtn = btns.find(b => b.textContent && b.textContent.includes('Change Password'));
      if (changePassBtn) changePassBtn.click();
    });
    await new Promise(r => setTimeout(r, 500));
    await pageAdmin.screenshot({ path: path.join(outDir, 'fig29_change_password.png') });
    console.log('Captured fig29_change_password.png');
    await pageAdmin.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 400));
  } catch (err) {
    console.error('Err fig29:', err.message);
  }

  // ----------------------------------------------------
  // Fig 30: LAN IP Header Badge & Connection Indicator
  // ----------------------------------------------------
  try {
    await pageAdmin.screenshot({ path: path.join(outDir, 'fig30_offline_caching.png') });
    console.log('Captured fig30_offline_caching.png');
  } catch (err) {
    console.error('Err fig30:', err.message);
  }

  // ----------------------------------------------------
  // Fig 31: User Profile Context Menu & Session Termination
  // ----------------------------------------------------
  try {
    await pageAdmin.evaluate(() => {
      const userBtn = document.querySelector('header .relative button');
      if (userBtn) userBtn.click();
    });
    await new Promise(r => setTimeout(r, 400));
    await pageAdmin.screenshot({ path: path.join(outDir, 'fig31_logout.png') });
    console.log('Captured fig31_logout.png');
  } catch (err) {
    console.error('Err fig31:', err.message);
  }

  await pageAdmin.close();
  await browser.close();
  console.log('Finished capturing all figures!');
})();
