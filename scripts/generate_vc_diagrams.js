const puppeteer = require('../VC/node_modules/puppeteer-core');
const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'vc_report_assets', 'diagrams');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const diagrams = [
  // 1. Gantt Chart
  {
    id: 'fig01_gantt',
    width: 1200,
    height: 620,
    html: `
    <div style="width:1200px; height:620px; background:#ffffff; font-family:'Times New Roman', Times, serif; padding:30px; box-sizing:border-box;">
      <div style="text-align:center; margin-bottom:20px;">
        <h2 style="margin:0; font-size:22px; color:#1e3a8a; font-weight:bold; text-transform:uppercase;">Figure 1: Gantt Chart – Project Development Schedule</h2>
        <p style="margin:5px 0 0 0; font-size:13px; color:#475569;">VC Messenger Engineering Timeline (Early August to Mid-September 2026)</p>
      </div>
      <svg width="1140" height="500" style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px;">
        <!-- Timeline Header -->
        <rect x="260" y="30" width="850" height="40" fill="#1e293b" rx="4"/>
        <text x="330" y="55" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">Aug Early</text>
        <line x1="400" y1="30" x2="400" y2="470" stroke="#94a3b8" stroke-dasharray="3,3"/>
        <text x="470" y="55" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">Aug Mid</text>
        <line x1="540" y1="30" x2="540" y2="470" stroke="#94a3b8" stroke-dasharray="3,3"/>
        <text x="610" y="55" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">Aug Late</text>
        <line x1="680" y1="30" x2="680" y2="470" stroke="#94a3b8" stroke-dasharray="3,3"/>
        <text x="750" y="55" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">Sep Early</text>
        <line x1="820" y1="30" x2="820" y2="470" stroke="#94a3b8" stroke-dasharray="3,3"/>
        <text x="890" y="55" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">Sep Mid</text>
        <line x1="960" y1="30" x2="960" y2="470" stroke="#94a3b8" stroke-dasharray="3,3"/>
        <text x="1035" y="55" fill="#ffffff" font-size="12" font-weight="bold" text-anchor="middle">Sep Late</text>

        <!-- Phase Labels -->
        <text x="240" y="115" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="end">1. Requirements & System Spec</text>
        <rect x="270" y="95" width="200" height="32" rx="6" fill="#3b82f6"/>
        <text x="370" y="115" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">Aug 01 - Aug 12</text>

        <text x="240" y="175" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="end">2. SQLite Schema & WAL Core</text>
        <rect x="420" y="155" width="190" height="32" rx="6" fill="#0284c7"/>
        <text x="515" y="175" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">Aug 10 - Aug 20</text>

        <text x="240" y="235" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="end">3. Socket.IO Real-time Engine</text>
        <rect x="560" y="215" width="180" height="32" rx="6" fill="#2563eb"/>
        <text x="650" y="235" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">Aug 18 - Aug 28</text>

        <text x="240" y="295" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="end">4. RBAC Policy & File Streaming</text>
        <rect x="690" y="275" width="180" height="32" rx="6" fill="#4f46e5"/>
        <text x="780" y="295" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">Aug 26 - Sep 05</text>

        <text x="240" y="355" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="end">5. React SPA & Admin Console</text>
        <rect x="790" y="335" width="210" height="32" rx="6" fill="#7c3aed"/>
        <text x="895" y="355" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">Sep 01 - Sep 12</text>

        <text x="240" y="415" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="end">6. LAN Hardening & Documentation</text>
        <rect x="940" y="395" width="150" height="32" rx="6" fill="#059669"/>
        <text x="1015" y="415" fill="#ffffff" font-size="11" font-weight="bold" text-anchor="middle">Sep 10 - Sep 18</text>
      </svg>
    </div>
    `
  },

  // 2. PERT Chart
  {
    id: 'fig02_pert',
    width: 1200,
    height: 600,
    html: `
    <div style="width:1200px; height:600px; background:#ffffff; font-family:'Times New Roman', Times, serif; padding:25px; box-sizing:border-box;">
      <div style="text-align:center; margin-bottom:20px;">
        <h2 style="margin:0; font-size:22px; color:#1e3a8a; font-weight:bold; text-transform:uppercase;">Figure 2: PERT Chart – Activity Network</h2>
        <p style="margin:4px 0 0 0; font-size:13px; color:#475569;">Project Dependency Graph with Critical Path (A → B → C → D → F)</p>
      </div>
      <svg width="1150" height="480" style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px;">
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#1e3a8a" />
          </marker>
          <marker id="arr-crit" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#dc2626" />
          </marker>
        </defs>

        <!-- Node 1 -->
        <circle cx="100" cy="240" r="32" fill="#eff6ff" stroke="#dc2626" stroke-width="3"/>
        <text x="100" y="245" text-anchor="middle" font-size="16" font-weight="bold" fill="#0f172a">1</text>
        <text x="100" y="285" text-anchor="middle" font-size="11" fill="#64748b">Start</text>

        <!-- Arrow A (Critical) -->
        <line x1="132" y1="240" x2="268" y2="240" stroke="#dc2626" stroke-width="3" marker-end="url(#arr-crit)"/>
        <text x="200" y="225" text-anchor="middle" font-size="12" font-weight="bold" fill="#dc2626">A: Spec (12d)</text>

        <!-- Node 2 -->
        <circle cx="300" cy="240" r="32" fill="#eff6ff" stroke="#dc2626" stroke-width="3"/>
        <text x="300" y="245" text-anchor="middle" font-size="16" font-weight="bold" fill="#0f172a">2</text>
        <text x="300" y="285" text-anchor="middle" font-size="11" fill="#64748b">Spec Done</text>

        <!-- Arrow B (Critical) -->
        <line x1="332" y1="240" x2="468" y2="240" stroke="#dc2626" stroke-width="3" marker-end="url(#arr-crit)"/>
        <text x="400" y="225" text-anchor="middle" font-size="12" font-weight="bold" fill="#dc2626">B: DB Schema (10d)</text>

        <!-- Node 3 -->
        <circle cx="500" cy="240" r="32" fill="#eff6ff" stroke="#dc2626" stroke-width="3"/>
        <text x="500" y="245" text-anchor="middle" font-size="16" font-weight="bold" fill="#0f172a">3</text>
        <text x="500" y="285" text-anchor="middle" font-size="11" fill="#64748b">DB Ready</text>

        <!-- Arrow C (Critical) -->
        <line x1="532" y1="240" x2="668" y2="240" stroke="#dc2626" stroke-width="3" marker-end="url(#arr-crit)"/>
        <text x="600" y="225" text-anchor="middle" font-size="12" font-weight="bold" fill="#dc2626">C: WebSocket (10d)</text>

        <!-- Node 4 -->
        <circle cx="700" cy="240" r="32" fill="#eff6ff" stroke="#dc2626" stroke-width="3"/>
        <text x="700" y="245" text-anchor="middle" font-size="16" font-weight="bold" fill="#0f172a">4</text>
        <text x="700" y="285" text-anchor="middle" font-size="11" fill="#64748b">Core Server</text>

        <!-- Split into D (Top, Critical) & E (Bottom) -->
        <line x1="725" y1="220" x2="845" y2="140" stroke="#dc2626" stroke-width="3" marker-end="url(#arr-crit)"/>
        <text x="765" y="165" text-anchor="middle" font-size="12" font-weight="bold" fill="#dc2626">D: RBAC & Files (10d)</text>

        <line x1="725" y1="260" x2="845" y2="340" stroke="#1e3a8a" stroke-width="2" stroke-dasharray="4,4" marker-end="url(#arr)"/>
        <text x="765" y="325" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e3a8a">E: UI Redesign (8d)</text>

        <!-- Node 5 (Top) -->
        <circle cx="870" cy="120" r="32" fill="#eff6ff" stroke="#dc2626" stroke-width="3"/>
        <text x="870" y="125" text-anchor="middle" font-size="16" font-weight="bold" fill="#0f172a">5</text>
        <text x="870" y="75" text-anchor="middle" font-size="11" fill="#64748b">Features Done</text>

        <!-- Node 6 (Bottom) -->
        <circle cx="870" cy="360" r="32" fill="#f8fafc" stroke="#1e3a8a" stroke-width="2"/>
        <text x="870" y="365" text-anchor="middle" font-size="16" font-weight="bold" fill="#0f172a">6</text>
        <text x="870" y="405" text-anchor="middle" font-size="11" fill="#64748b">UI Done</text>

        <!-- Convergence to End (Node 7) -->
        <line x1="900" y1="135" x2="1025" y2="225" stroke="#dc2626" stroke-width="3" marker-end="url(#arr-crit)"/>
        <text x="980" y="170" text-anchor="middle" font-size="12" font-weight="bold" fill="#dc2626">F: Testing (8d)</text>

        <line x1="900" y1="345" x2="1025" y2="255" stroke="#1e3a8a" stroke-width="2" marker-end="url(#arr)"/>
        <text x="980" y="320" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e3a8a">Integration</text>

        <!-- Node 7 -->
        <circle cx="1050" cy="240" r="32" fill="#ecfdf5" stroke="#059669" stroke-width="3"/>
        <text x="1050" y="245" text-anchor="middle" font-size="16" font-weight="bold" fill="#065f46">7</text>
        <text x="1050" y="285" text-anchor="middle" font-size="11" fill="#059669">Complete</text>
      </svg>
    </div>
    `
  },

  // 3. ERD
  {
    id: 'fig03_erd',
    width: 1250,
    height: 750,
    html: `
    <div style="width:1250px; height:750px; background:#ffffff; font-family:'Times New Roman', Times, serif; padding:25px; box-sizing:border-box;">
      <div style="text-align:center; margin-bottom:15px;">
        <h2 style="margin:0; font-size:22px; color:#1e3a8a; font-weight:bold; text-transform:uppercase;">Figure 3: Entity-Relationship Diagram (ERD)</h2>
        <p style="margin:4px 0 0 0; font-size:13px; color:#475569;">Normalized Relational Schema Architecture (SQLite WAL Mode)</p>
      </div>
      <svg width="1200" height="650" style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px;">
        <defs>
          <marker id="crow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#1e3a8a" />
          </marker>
        </defs>

        <!-- Table: USERS -->
        <g transform="translate(60, 50)">
          <rect width="260" height="260" fill="#ffffff" stroke="#1e3a8a" stroke-width="2" rx="4"/>
          <rect width="260" height="35" fill="#1e3a8a" rx="4"/>
          <text x="130" y="23" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">USERS</text>
          <text x="15" y="60" font-size="12" font-weight="bold" fill="#dc2626">PK  id : INTEGER</text>
          <text x="15" y="85" font-size="12" fill="#0f172a">username : TEXT UNIQUE</text>
          <text x="15" y="110" font-size="12" fill="#0f172a">password_hash : TEXT</text>
          <text x="15" y="135" font-size="12" fill="#0f172a">full_name : TEXT</text>
          <text x="15" y="160" font-size="12" fill="#0f172a">role : TEXT ('admin'|'supervisor'|'agent')</text>
          <text x="15" y="185" font-size="12" fill="#0f172a">department : TEXT</text>
          <text x="15" y="210" font-size="12" fill="#0f172a">avatar_color : TEXT</text>
          <text x="15" y="235" font-size="12" fill="#0f172a">status : TEXT ('active'|'inactive')</text>
        </g>

        <!-- Table: CONVERSATIONS -->
        <g transform="translate(470, 50)">
          <rect width="260" height="180" fill="#ffffff" stroke="#1e3a8a" stroke-width="2" rx="4"/>
          <rect width="260" height="35" fill="#1e3a8a" rx="4"/>
          <text x="130" y="23" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">CONVERSATIONS</text>
          <text x="15" y="60" font-size="12" font-weight="bold" fill="#dc2626">PK  id : TEXT ('conv_u1_u2')</text>
          <text x="15" y="85" font-size="12" font-weight="bold" fill="#2563eb">FK  user1_id : INTEGER</text>
          <text x="15" y="110" font-size="12" font-weight="bold" fill="#2563eb">FK  user2_id : INTEGER</text>
          <text x="15" y="135" font-size="12" fill="#0f172a">last_message_at : DATETIME</text>
          <text x="15" y="160" font-size="12" fill="#0f172a">created_at : DATETIME</text>
        </g>

        <!-- Table: MESSAGES -->
        <g transform="translate(870, 50)">
          <rect width="270" height="270" fill="#ffffff" stroke="#1e3a8a" stroke-width="2" rx="4"/>
          <rect width="270" height="35" fill="#1e3a8a" rx="4"/>
          <text x="135" y="23" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">MESSAGES</text>
          <text x="15" y="60" font-size="12" font-weight="bold" fill="#dc2626">PK  id : INTEGER</text>
          <text x="15" y="85" font-size="12" font-weight="bold" fill="#2563eb">FK  conversation_id : TEXT</text>
          <text x="15" y="110" font-size="12" font-weight="bold" fill="#2563eb">FK  sender_id : INTEGER</text>
          <text x="15" y="135" font-size="12" font-weight="bold" fill="#2563eb">FK  receiver_id : INTEGER</text>
          <text x="15" y="160" font-size="12" fill="#0f172a">content : TEXT</text>
          <text x="15" y="185" font-size="12" fill="#0f172a">file_url : TEXT (optional)</text>
          <text x="15" y="210" font-size="12" fill="#0f172a">file_name / size / type</text>
          <text x="15" y="235" font-size="12" fill="#0f172a">is_read : INTEGER (0|1)</text>
          <text x="15" y="260" font-size="12" fill="#0f172a">created_at : DATETIME</text>
        </g>

        <!-- Table: ANNOUNCEMENTS -->
        <g transform="translate(180, 410)">
          <rect width="280" height="190" fill="#ffffff" stroke="#1e3a8a" stroke-width="2" rx="4"/>
          <rect width="280" height="35" fill="#1e3a8a" rx="4"/>
          <text x="140" y="23" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">ANNOUNCEMENTS</text>
          <text x="15" y="60" font-size="12" font-weight="bold" fill="#dc2626">PK  id : INTEGER</text>
          <text x="15" y="85" font-size="12" font-weight="bold" fill="#2563eb">FK  sender_id : INTEGER</text>
          <text x="15" y="110" font-size="12" fill="#0f172a">title : TEXT</text>
          <text x="15" y="135" font-size="12" fill="#0f172a">content : TEXT</text>
          <text x="15" y="160" font-size="12" fill="#0f172a">priority : TEXT ('normal'|'urgent')</text>
          <text x="15" y="180" font-size="12" fill="#0f172a">created_at : DATETIME</text>
        </g>

        <!-- Table: AUDIT_LOGS -->
        <g transform="translate(680, 410)">
          <rect width="280" height="190" fill="#ffffff" stroke="#1e3a8a" stroke-width="2" rx="4"/>
          <rect width="280" height="35" fill="#1e3a8a" rx="4"/>
          <text x="140" y="23" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">AUDIT_LOGS</text>
          <text x="15" y="60" font-size="12" font-weight="bold" fill="#dc2626">PK  id : INTEGER</text>
          <text x="15" y="85" font-size="12" font-weight="bold" fill="#2563eb">FK  user_id : INTEGER</text>
          <text x="15" y="110" font-size="12" fill="#0f172a">action : TEXT</text>
          <text x="15" y="135" font-size="12" fill="#0f172a">details : TEXT</text>
          <text x="15" y="160" font-size="12" fill="#0f172a">ip_address : TEXT</text>
          <text x="15" y="180" font-size="12" fill="#0f172a">created_at : DATETIME</text>
        </g>

        <!-- Relationship Lines -->
        <line x1="320" y1="120" x2="470" y2="120" stroke="#1e3a8a" stroke-width="2" marker-end="url(#crow)"/>
        <text x="395" y="110" text-anchor="middle" font-size="11" font-weight="bold" fill="#1e3a8a">1 : N (Participant)</text>

        <line x1="730" y1="120" x2="870" y2="120" stroke="#1e3a8a" stroke-width="2" marker-end="url(#crow)"/>
        <text x="800" y="110" text-anchor="middle" font-size="11" font-weight="bold" fill="#1e3a8a">1 : N (Belongs)</text>

        <path d="M 190 310 L 190 410" stroke="#1e3a8a" stroke-width="2" marker-end="url(#crow)" fill="none"/>
        <text x="235" y="360" text-anchor="middle" font-size="11" font-weight="bold" fill="#1e3a8a">1 : N (Broadcasts)</text>

        <path d="M 280 310 L 280 380 L 700 380 L 700 410" stroke="#1e3a8a" stroke-width="2" marker-end="url(#crow)" fill="none"/>
        <text x="500" y="375" text-anchor="middle" font-size="11" font-weight="bold" fill="#1e3a8a">1 : N (Generates Audit Trail)</text>
      </svg>
    </div>
    `
  },

  // 4. DFD Level 0
  {
    id: 'fig04_dfd_lvl0',
    width: 1200,
    height: 650,
    html: `
    <div style="width:1200px; height:650px; background:#ffffff; font-family:'Times New Roman', Times, serif; padding:25px; box-sizing:border-box;">
      <div style="text-align:center; margin-bottom:15px;">
        <h2 style="margin:0; font-size:22px; color:#1e3a8a; font-weight:bold; text-transform:uppercase;">Figure 4: DFD Level 0 (Context Diagram)</h2>
        <p style="margin:4px 0 0 0; font-size:13px; color:#475569;">System Boundary & External Role Entities (Admin, Supervisor, Agent)</p>
      </div>
      <svg width="1150" height="550" style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px;">
        <defs>
          <marker id="arr-dfd" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#1e3a8a" />
          </marker>
        </defs>

        <!-- Process 0.0 -->
        <circle cx="575" cy="275" r="115" fill="#eff6ff" stroke="#1e3a8a" stroke-width="3"/>
        <text x="575" y="245" text-anchor="middle" font-size="16" font-weight="bold" fill="#1e3a8a">0.0</text>
        <text x="575" y="275" text-anchor="middle" font-size="16" font-weight="bold" fill="#0f172a">VC MESSENGER</text>
        <text x="575" y="298" text-anchor="middle" font-size="13" font-weight="bold" fill="#2563eb">CORPORATE LAN SYSTEM</text>
        <text x="575" y="320" text-anchor="middle" font-size="11" fill="#64748b">(Socket.IO, RBAC, SQLite)</text>

        <!-- Entity 1: Administrator -->
        <g transform="translate(60, 60)">
          <rect width="180" height="90" rx="8" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
          <text x="90" y="42" text-anchor="middle" font-size="14" font-weight="bold" fill="#dc2626">SYSTEM</text>
          <text x="90" y="62" text-anchor="middle" font-size="14" font-weight="bold" fill="#dc2626">ADMINISTRATOR</text>
        </g>

        <!-- Entity 2: Supervisor -->
        <g transform="translate(60, 390)">
          <rect width="180" height="90" rx="8" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
          <text x="90" y="42" text-anchor="middle" font-size="14" font-weight="bold" fill="#7c3aed">SHIFT</text>
          <text x="90" y="62" text-anchor="middle" font-size="14" font-weight="bold" fill="#7c3aed">SUPERVISOR</text>
        </g>

        <!-- Entity 3: Field Agent -->
        <g transform="translate(910, 230)">
          <rect width="180" height="90" rx="8" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
          <text x="90" y="42" text-anchor="middle" font-size="14" font-weight="bold" fill="#059669">FIELD / SUPPORT</text>
          <text x="90" y="62" text-anchor="middle" font-size="14" font-weight="bold" fill="#059669">AGENT</text>
        </g>

        <!-- Admin Flows -->
        <path d="M 240 95 L 480 215" stroke="#1e3a8a" stroke-width="1.5" marker-end="url(#arr-dfd)" fill="none"/>
        <text x="290" y="145" font-size="11" fill="#0f172a">User Master, Roles, Audit Inquiries</text>

        <path d="M 465 235 L 240 120" stroke="#059669" stroke-width="1.5" stroke-dasharray="3,3" marker-end="url(#arr-dfd)" fill="none"/>
        <text x="270" y="190" font-size="11" fill="#059669">Live Audits, System Health, Logs</text>

        <!-- Supervisor Flows -->
        <path d="M 240 420 L 480 330" stroke="#1e3a8a" stroke-width="1.5" marker-end="url(#arr-dfd)" fill="none"/>
        <text x="270" y="395" font-size="11" fill="#0f172a">Broadcast Notice, Group & 1-on-1 Chats</text>

        <path d="M 465 350 L 240 445" stroke="#059669" stroke-width="1.5" stroke-dasharray="3,3" marker-end="url(#arr-dfd)" fill="none"/>
        <text x="260" y="435" font-size="11" fill="#059669">Agent Message Streams, File Archive</text>

        <!-- Agent Flows -->
        <path d="M 910 260 L 695 260" stroke="#1e3a8a" stroke-width="1.5" marker-end="url(#arr-dfd)" fill="none"/>
        <text x="800" y="250" text-anchor="middle" font-size="11" fill="#0f172a">Chat to Supervisor, 100MB File Upload</text>

        <path d="M 695 290 L 910 290" stroke="#059669" stroke-width="1.5" stroke-dasharray="3,3" marker-end="url(#arr-dfd)" fill="none"/>
        <text x="800" y="310" text-anchor="middle" font-size="11" fill="#059669">Read Receipts, Noticeboard, Filtered Contacts</text>
      </svg>
    </div>
    `
  },

  // 5. DFD Level 1
  {
    id: 'fig05_dfd_lvl1',
    width: 1250,
    height: 750,
    html: `
    <div style="width:1250px; height:750px; background:#ffffff; font-family:'Times New Roman', Times, serif; padding:25px; box-sizing:border-box;">
      <div style="text-align:center; margin-bottom:15px;">
        <h2 style="margin:0; font-size:22px; color:#1e3a8a; font-weight:bold; text-transform:uppercase;">Figure 5: DFD Level 1 – Real-Time Messaging & File Exchange Process</h2>
        <p style="margin:4px 0 0 0; font-size:13px; color:#475569;">Functional Process Decomposition & Data Store Interactions</p>
      </div>
      <svg width="1200" height="650" style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px;">
        <defs>
          <marker id="arr2" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#1e3a8a" />
          </marker>
        </defs>

        <!-- Process 1.0: Auth & JWT -->
        <circle cx="160" cy="120" r="50" fill="#eff6ff" stroke="#1e3a8a" stroke-width="2"/>
        <text x="160" y="115" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e3a8a">1.0</text>
        <text x="160" y="132" text-anchor="middle" font-size="11" font-weight="bold" fill="#0f172a">AUTH & JWT</text>

        <!-- Process 2.0: RBAC Contact Filter -->
        <circle cx="500" cy="120" r="50" fill="#eff6ff" stroke="#1e3a8a" stroke-width="2"/>
        <text x="500" y="115" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e3a8a">2.0</text>
        <text x="500" y="132" text-anchor="middle" font-size="11" font-weight="bold" fill="#0f172a">RBAC FILTER</text>

        <!-- Process 3.0: WebSocket Dispatch -->
        <circle cx="840" cy="120" r="50" fill="#eff6ff" stroke="#1e3a8a" stroke-width="2"/>
        <text x="840" y="115" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e3a8a">3.0</text>
        <text x="840" y="132" text-anchor="middle" font-size="11" font-weight="bold" fill="#0f172a">MESSAGE BUS</text>

        <!-- Process 4.0: LAN File Streaming -->
        <circle cx="280" cy="460" r="50" fill="#eff6ff" stroke="#1e3a8a" stroke-width="2"/>
        <text x="280" y="455" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e3a8a">4.0</text>
        <text x="280" y="472" text-anchor="middle" font-size="11" font-weight="bold" fill="#0f172a">FILE STREAM</text>

        <!-- Process 5.0: Noticeboard -->
        <circle cx="620" cy="460" r="50" fill="#eff6ff" stroke="#1e3a8a" stroke-width="2"/>
        <text x="620" y="455" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e3a8a">5.0</text>
        <text x="620" y="472" text-anchor="middle" font-size="11" font-weight="bold" fill="#0f172a">BROADCAST</text>

        <!-- Process 6.0: Audit Logging -->
        <circle cx="960" cy="460" r="50" fill="#eff6ff" stroke="#1e3a8a" stroke-width="2"/>
        <text x="960" y="455" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e3a8a">6.0</text>
        <text x="960" y="472" text-anchor="middle" font-size="11" font-weight="bold" fill="#0f172a">AUDIT LOG</text>

        <!-- Data Stores -->
        <g transform="translate(320, 270)">
          <line x1="0" y1="0" x2="160" y2="0" stroke="#1e3a8a" stroke-width="2"/>
          <line x1="0" y1="35" x2="160" y2="35" stroke="#1e3a8a" stroke-width="2"/>
          <text x="10" y="22" font-size="12" font-weight="bold" fill="#1e3a8a">D1: users</text>
        </g>

        <g transform="translate(680, 270)">
          <line x1="0" y1="0" x2="160" y2="0" stroke="#1e3a8a" stroke-width="2"/>
          <line x1="0" y1="35" x2="160" y2="35" stroke="#1e3a8a" stroke-width="2"/>
          <text x="10" y="22" font-size="12" font-weight="bold" fill="#1e3a8a">D2: messages</text>
        </g>

        <!-- Connectors -->
        <line x1="210" y1="120" x2="450" y2="120" stroke="#1e3a8a" stroke-width="1.5" marker-end="url(#arr2)"/>
        <line x1="550" y1="120" x2="790" y2="120" stroke="#1e3a8a" stroke-width="1.5" marker-end="url(#arr2)"/>
        <line x1="185" y1="165" x2="320" y2="280" stroke="#1e3a8a" stroke-width="1.5" marker-end="url(#arr2)"/>
        <line x1="760" y1="165" x2="760" y2="270" stroke="#1e3a8a" stroke-width="1.5" marker-end="url(#arr2)"/>
        <line x1="280" y1="410" x2="680" y2="295" stroke="#1e3a8a" stroke-width="1.5" marker-end="url(#arr2)"/>
        <line x1="960" y1="410" x2="880" y2="165" stroke="#1e3a8a" stroke-width="1.5" marker-end="url(#arr2)"/>
      </svg>
    </div>
    `
  },

  // 6. Use Case Diagram
  {
    id: 'fig06_usecase',
    width: 1250,
    height: 750,
    html: `
    <div style="width:1250px; height:750px; background:#ffffff; font-family:'Times New Roman', Times, serif; padding:25px; box-sizing:border-box;">
      <div style="text-align:center; margin-bottom:15px;">
        <h2 style="margin:0; font-size:22px; color:#1e3a8a; font-weight:bold; text-transform:uppercase;">Figure 6: Use Case Diagram</h2>
        <p style="margin:4px 0 0 0; font-size:13px; color:#475569;">Functional Capabilities Mapped to Operational Roles</p>
      </div>
      <svg width="1200" height="650" style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px;">
        <!-- Boundary Box -->
        <rect x="280" y="40" width="640" height="570" fill="#ffffff" stroke="#1e3a8a" stroke-width="2" rx="8"/>
        <text x="600" y="70" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e3a8a">VC MESSENGER LAN PORTAL</text>

        <!-- Use Cases (Ellipses) -->
        <ellipse cx="600" cy="115" rx="140" ry="25" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
        <text x="600" y="120" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">Authenticate via JWT / LAN IP</text>

        <ellipse cx="600" cy="180" rx="140" ry="25" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
        <text x="600" y="185" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">Real-Time 1-on-1 Chat & Presence</text>

        <ellipse cx="600" cy="245" rx="140" ry="25" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
        <text x="600" y="250" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">Direct LAN File Transfer (Up to 100MB)</text>

        <ellipse cx="600" cy="310" rx="140" ry="25" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
        <text x="600" y="315" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">View & Download Shared Files Drawer</text>

        <ellipse cx="600" cy="375" rx="140" ry="25" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
        <text x="600" y="380" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">Broadcast Urgent / Normal Noticeboard</text>

        <ellipse cx="600" cy="440" rx="140" ry="25" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
        <text x="600" y="445" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">Manage Users, Roles & Passwords</text>

        <ellipse cx="600" cy="505" rx="140" ry="25" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
        <text x="600" y="510" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">Inspect Real-time Security Audit Trail</text>

        <ellipse cx="600" cy="570" rx="140" ry="25" fill="#eff6ff" stroke="#2563eb" stroke-width="1.5"/>
        <text x="600" y="575" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">Auto-Discover IP & QR Mobile Pairing</text>

        <!-- Left Actor: Admin -->
        <g transform="translate(100, 160)">
          <circle cx="40" cy="30" r="18" fill="#ffffff" stroke="#dc2626" stroke-width="2"/>
          <line x1="40" y1="48" x2="40" y2="90" stroke="#dc2626" stroke-width="2"/>
          <line x1="15" y1="65" x2="65" y2="65" stroke="#dc2626" stroke-width="2"/>
          <line x1="40" y1="90" x2="15" y2="125" stroke="#dc2626" stroke-width="2"/>
          <line x1="40" y1="90" x2="65" y2="125" stroke="#dc2626" stroke-width="2"/>
          <text x="40" y="145" text-anchor="middle" font-size="13" font-weight="bold" fill="#dc2626">Administrator</text>
        </g>

        <!-- Left Actor: Supervisor -->
        <g transform="translate(100, 420)">
          <circle cx="40" cy="30" r="18" fill="#ffffff" stroke="#7c3aed" stroke-width="2"/>
          <line x1="40" y1="48" x2="40" y2="90" stroke="#7c3aed" stroke-width="2"/>
          <line x1="15" y1="65" x2="65" y2="65" stroke="#7c3aed" stroke-width="2"/>
          <line x1="40" y1="90" x2="15" y2="125" stroke="#7c3aed" stroke-width="2"/>
          <line x1="40" y1="90" x2="65" y2="125" stroke="#7c3aed" stroke-width="2"/>
          <text x="40" y="145" text-anchor="middle" font-size="13" font-weight="bold" fill="#7c3aed">Supervisor</text>
        </g>

        <!-- Right Actor: Agent -->
        <g transform="translate(1060, 280)">
          <circle cx="40" cy="30" r="18" fill="#ffffff" stroke="#059669" stroke-width="2"/>
          <line x1="40" y1="48" x2="40" y2="90" stroke="#059669" stroke-width="2"/>
          <line x1="15" y1="65" x2="65" y2="65" stroke="#059669" stroke-width="2"/>
          <line x1="40" y1="90" x2="15" y2="125" stroke="#059669" stroke-width="2"/>
          <line x1="40" y1="90" x2="65" y2="125" stroke="#059669" stroke-width="2"/>
          <text x="40" y="145" text-anchor="middle" font-size="13" font-weight="bold" fill="#059669">Agent</text>
        </g>

        <!-- Links from Admin -->
        <line x1="160" y1="200" x2="460" y2="120" stroke="#dc2626" stroke-width="1.5"/>
        <line x1="160" y1="210" x2="460" y2="180" stroke="#dc2626" stroke-width="1.5"/>
        <line x1="160" y1="220" x2="460" y2="245" stroke="#dc2626" stroke-width="1.5"/>
        <line x1="160" y1="230" x2="460" y2="375" stroke="#dc2626" stroke-width="1.5"/>
        <line x1="160" y1="240" x2="460" y2="440" stroke="#dc2626" stroke-width="1.5"/>
        <line x1="160" y1="250" x2="460" y2="505" stroke="#dc2626" stroke-width="1.5"/>
        <line x1="160" y1="260" x2="460" y2="570" stroke="#dc2626" stroke-width="1.5"/>

        <!-- Links from Supervisor -->
        <line x1="160" y1="460" x2="460" y2="120" stroke="#7c3aed" stroke-width="1.5"/>
        <line x1="160" y1="470" x2="460" y2="180" stroke="#7c3aed" stroke-width="1.5"/>
        <line x1="160" y1="480" x2="460" y2="245" stroke="#7c3aed" stroke-width="1.5"/>
        <line x1="160" y1="490" x2="460" y2="310" stroke="#7c3aed" stroke-width="1.5"/>
        <line x1="160" y1="500" x2="460" y2="375" stroke="#7c3aed" stroke-width="1.5"/>

        <!-- Links from Agent (Restricted!) -->
        <line x1="1040" y1="320" x2="740" y2="120" stroke="#059669" stroke-width="1.5"/>
        <line x1="1040" y1="330" x2="740" y2="180" stroke="#059669" stroke-width="1.5"/>
        <line x1="1040" y1="340" x2="740" y2="245" stroke="#059669" stroke-width="1.5"/>
        <line x1="1040" y1="350" x2="740" y2="310" stroke="#059669" stroke-width="1.5"/>
        <line x1="1040" y1="360" x2="740" y2="570" stroke="#059669" stroke-width="1.5"/>
      </svg>
    </div>
    `
  },

  // 7. System Architecture (Three-Tier)
  {
    id: 'fig07_architecture',
    width: 1250,
    height: 750,
    html: `
    <div style="width:1250px; height:750px; background:#ffffff; font-family:'Times New Roman', Times, serif; padding:25px; box-sizing:border-box;">
      <div style="text-align:center; margin-bottom:15px;">
        <h2 style="margin:0; font-size:22px; color:#1e3a8a; font-weight:bold; text-transform:uppercase;">Figure 7: Three-Tier LAN System Architecture</h2>
        <p style="margin:4px 0 0 0; font-size:13px; color:#475569;">Presentation, Application, and Persistence Tiers over On-Premise Network</p>
      </div>
      <svg width="1200" height="650" style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px;">
        <defs>
          <marker id="arr-arch" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#1e3a8a" />
          </marker>
        </defs>

        <!-- Tier 1: Client Tier -->
        <g transform="translate(60, 40)">
          <rect width="1080" height="150" fill="#ffffff" stroke="#2563eb" stroke-width="2" rx="8"/>
          <rect width="1080" height="32" fill="#2563eb" rx="8"/>
          <text x="540" y="22" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">TIER 1: PRESENTATION & CLIENT LAYER (React 18 + Vite + Tailwind CSS)</text>
          
          <rect x="40" y="55" width="220" height="70" fill="#f1f5f9" stroke="#cbd5e1" rx="6"/>
          <text x="150" y="85" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">Chat Workspace</text>
          <text x="150" y="105" text-anchor="middle" font-size="11" fill="#64748b">Direct Messaging & Drag/Drop</text>

          <rect x="300" y="55" width="220" height="70" fill="#f1f5f9" stroke="#cbd5e1" rx="6"/>
          <text x="410" y="85" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">RBAC Contact Sidebar</text>
          <text x="410" y="105" text-anchor="middle" font-size="11" fill="#64748b">Dynamic Role Filtering</text>

          <rect x="560" y="55" width="220" height="70" fill="#f1f5f9" stroke="#cbd5e1" rx="6"/>
          <text x="670" y="85" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">Admin Console & Logs</text>
          <text x="670" y="105" text-anchor="middle" font-size="11" fill="#64748b">User CRUD & IP Audits</text>

          <rect x="820" y="55" width="220" height="70" fill="#f1f5f9" stroke="#cbd5e1" rx="6"/>
          <text x="930" y="85" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">QR & Noticeboard</text>
          <text x="930" y="105" text-anchor="middle" font-size="11" fill="#64748b">Mobile Pairing & Alerts</text>
        </g>

        <!-- Protocol Flow 1 -->
        <line x1="600" y1="190" x2="600" y2="240" stroke="#1e3a8a" stroke-width="2" marker-end="url(#arr-arch)"/>
        <line x1="620" y1="240" x2="620" y2="190" stroke="#059669" stroke-width="2" marker-end="url(#arr-arch)"/>
        <text x="450" y="215" font-size="11" font-weight="bold" fill="#1e3a8a">HTTP REST (Port 3001) / WebSocket Events</text>
        <text x="640" y="215" font-size="11" font-weight="bold" fill="#059669">JSON Payload / 100MB Binary Stream</text>

        <!-- Tier 2: Application Tier -->
        <g transform="translate(60, 240)">
          <rect width="1080" height="170" fill="#ffffff" stroke="#1e3a8a" stroke-width="2" rx="8"/>
          <rect width="1080" height="32" fill="#1e3a8a" rx="8"/>
          <text x="540" y="22" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">TIER 2: APPLICATION & REAL-TIME ENGINE (Node.js + Express + Socket.IO)</text>
          
          <rect x="40" y="55" width="180" height="90" fill="#eff6ff" stroke="#93c5fd" rx="6"/>
          <text x="130" y="85" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e3a8a">JWT Auth & RBAC</text>
          <text x="130" y="105" text-anchor="middle" font-size="10" fill="#475569">Strict 403 Agent Interceptor</text>
          <text x="130" y="125" text-anchor="middle" font-size="10" fill="#475569">Policy Enforcement</text>

          <rect x="250" y="55" width="180" height="90" fill="#eff6ff" stroke="#93c5fd" rx="6"/>
          <text x="340" y="85" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e3a8a">Socket.IO Server</text>
          <text x="340" y="105" text-anchor="middle" font-size="10" fill="#475569">Room Multiplexing</text>
          <text x="340" y="125" text-anchor="middle" font-size="10" fill="#475569">Typing & Read Receipts</text>

          <rect x="460" y="55" width="180" height="90" fill="#eff6ff" stroke="#93c5fd" rx="6"/>
          <text x="550" y="85" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e3a8a">Multer Stream Engine</text>
          <text x="550" y="105" text-anchor="middle" font-size="10" fill="#475569">100MB File Uploader</text>
          <text x="550" y="125" text-anchor="middle" font-size="10" fill="#475569">MIME Validation</text>

          <rect x="670" y="55" width="180" height="90" fill="#eff6ff" stroke="#93c5fd" rx="6"/>
          <text x="760" y="85" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e3a8a">System Discovery</text>
          <text x="760" y="105" text-anchor="middle" font-size="10" fill="#475569">IPv4 Interface Scanner</text>
          <text x="760" y="125" text-anchor="middle" font-size="10" fill="#475569">QR Code Generation</text>

          <rect x="880" y="55" width="160" height="90" fill="#eff6ff" stroke="#93c5fd" rx="6"/>
          <text x="960" y="85" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e3a8a">Audit Trail Logger</text>
          <text x="960" y="105" text-anchor="middle" font-size="10" fill="#475569">Client IP Address Capture</text>
          <text x="960" y="125" text-anchor="middle" font-size="10" fill="#475569">Security Compliance</text>
        </g>

        <!-- Protocol Flow 2 -->
        <line x1="600" y1="410" x2="600" y2="460" stroke="#1e3a8a" stroke-width="2" marker-end="url(#arr-arch)"/>
        <line x1="620" y1="460" x2="620" y2="410" stroke="#059669" stroke-width="2" marker-end="url(#arr-arch)"/>
        <text x="440" y="435" font-size="11" font-weight="bold" fill="#1e3a8a">Native C++ SQLite Bindings</text>
        <text x="640" y="435" font-size="11" font-weight="bold" fill="#059669">Synchronous WAL Journaling</text>

        <!-- Tier 3: Data Tier -->
        <g transform="translate(60, 460)">
          <rect width="1080" height="150" fill="#ffffff" stroke="#0f172a" stroke-width="2" rx="8"/>
          <rect width="1080" height="32" fill="#0f172a" rx="8"/>
          <text x="540" y="22" fill="#ffffff" font-size="14" font-weight="bold" text-anchor="middle">TIER 3: PERSISTENCE & FILE STORAGE LAYER (SQLite WAL Engine + Local Disk)</text>
          
          <rect x="150" y="55" width="340" height="75" fill="#f8fafc" stroke="#94a3b8" rx="6"/>
          <text x="320" y="85" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">vc_messenger.db (SQLite 3)</text>
          <text x="320" y="105" text-anchor="middle" font-size="11" fill="#475569">Tables: users, conversations, messages, announcements, audit_logs</text>

          <rect x="590" y="55" width="340" height="75" fill="#f8fafc" stroke="#94a3b8" rx="6"/>
          <text x="760" y="85" text-anchor="middle" font-size="13" font-weight="bold" fill="#0f172a">uploads/ Storage Repository</text>
          <text x="760" y="105" text-anchor="middle" font-size="11" fill="#475569">Local Binary File Storage up to 100MB per Payload</text>
        </g>
      </svg>
    </div>
    `
  },

  // 8. Flowchart: Message & File Dispatch with RBAC
  {
    id: 'fig08_flowchart',
    width: 1200,
    height: 750,
    html: `
    <div style="width:1200px; height:750px; background:#ffffff; font-family:'Times New Roman', Times, serif; padding:20px; box-sizing:border-box;">
      <div style="text-align:center; margin-bottom:15px;">
        <h2 style="margin:0; font-size:22px; color:#1e3a8a; font-weight:bold; text-transform:uppercase;">Figure 8: Flowchart – Message & File Dispatch with RBAC Validation</h2>
        <p style="margin:4px 0 0 0; font-size:13px; color:#475569;">Dual-Role Enforcement Pipeline (Client Filter + Backend 403 Forbidden Interceptor)</p>
      </div>
      <svg width="1150" height="660" style="background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px;">
        <defs>
          <marker id="arr-flow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#1e3a8a" />
          </marker>
        </defs>

        <!-- Start -->
        <rect x="500" y="30" width="150" height="40" rx="20" fill="#1e293b"/>
        <text x="575" y="55" fill="#ffffff" font-size="13" font-weight="bold" text-anchor="middle">USER INITIATES CHAT</text>

        <!-- Step 1 -->
        <line x1="575" y1="70" x2="575" y2="100" stroke="#1e3a8a" stroke-width="2" marker-end="url(#arr-flow)"/>
        <rect x="475" y="100" width="200" height="45" rx="4" fill="#eff6ff" stroke="#1e3a8a" stroke-width="1.5"/>
        <text x="575" y="127" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">Extract JWT & Recipient ID</text>

        <!-- Decision 1: Is Sender Agent? -->
        <line x1="575" y1="145" x2="575" y2="185" stroke="#1e3a8a" stroke-width="2" marker-end="url(#arr-flow)"/>
        <polygon points="575,185 685,230 575,275 465,230" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
        <text x="575" y="225" text-anchor="middle" font-size="11" font-weight="bold" fill="#92400e">Is Sender Role</text>
        <text x="575" y="240" text-anchor="middle" font-size="11" font-weight="bold" fill="#92400e">'Agent'?</text>

        <!-- Branch: No (Supervisor / Admin) -->
        <line x1="685" y1="230" x2="850" y2="230" stroke="#059669" stroke-width="2" marker-end="url(#arr-flow)"/>
        <text x="740" y="220" font-size="11" font-weight="bold" fill="#059669">NO (Admin/Supervisor)</text>

        <rect x="850" y="207" width="200" height="45" rx="4" fill="#ecfdf5" stroke="#059669" stroke-width="1.5"/>
        <text x="950" y="234" text-anchor="middle" font-size="12" font-weight="bold" fill="#065f46">Permit Unrestricted Dispatch</text>

        <!-- Branch: Yes (Sender is Agent) -->
        <line x1="575" y1="275" x2="575" y2="315" stroke="#dc2626" stroke-width="2" marker-end="url(#arr-flow)"/>
        <text x="585" y="295" font-size="11" font-weight="bold" fill="#dc2626">YES</text>

        <!-- Decision 2: Is Recipient Agent? -->
        <polygon points="575,315 685,360 575,405 465,360" fill="#fee2e2" stroke="#dc2626" stroke-width="2"/>
        <text x="575" y="355" text-anchor="middle" font-size="11" font-weight="bold" fill="#991b1b">Is Recipient Role</text>
        <text x="575" y="370" text-anchor="middle" font-size="11" font-weight="bold" fill="#991b1b">'Agent'?</text>

        <!-- Branch: YES to Recipient Agent -> BLOCKED! -->
        <line x1="465" y1="360" x2="250" y2="360" stroke="#dc2626" stroke-width="2" marker-end="url(#arr-flow)"/>
        <text x="350" y="350" text-anchor="middle" font-size="11" font-weight="bold" fill="#dc2626">YES (Agent-to-Agent Violation)</text>

        <rect x="100" y="337" width="150" height="45" rx="4" fill="#fef2f2" stroke="#ef4444" stroke-width="2"/>
        <text x="175" y="357" text-anchor="middle" font-size="12" font-weight="bold" fill="#991b1b">403 Forbidden</text>
        <text x="175" y="372" text-anchor="middle" font-size="10" fill="#b91c1c">Log Security Audit Violation</text>

        <line x1="175" y1="382" x2="175" y2="430" stroke="#dc2626" stroke-width="1.5" marker-end="url(#arr-flow)"/>
        <rect x="100" y="430" width="150" height="35" rx="17" fill="#991b1b"/>
        <text x="175" y="452" text-anchor="middle" font-size="11" font-weight="bold" fill="#ffffff">REJECT / ABORT</text>

        <!-- Branch: NO to Recipient Agent (Recipient is Supervisor/Admin) -->
        <line x1="575" y1="405" x2="575" y2="460" stroke="#059669" stroke-width="2" marker-end="url(#arr-flow)"/>
        <text x="585" y="430" font-size="11" font-weight="bold" fill="#059669">NO (To Supervisor/Admin)</text>

        <!-- Common Success Path -->
        <path d="M 950 252 L 950 490 L 700 490" stroke="#059669" stroke-width="2" marker-end="url(#arr-flow)" fill="none"/>

        <rect x="475" y="465" width="220" height="50" rx="4" fill="#eff6ff" stroke="#1e3a8a" stroke-width="1.5"/>
        <text x="585" y="488" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">Persist Message / Upload File</text>
        <text x="585" y="504" text-anchor="middle" font-size="10" fill="#475569">Write SQLite WAL + Disk Archive</text>

        <!-- Emit WebSocket Event -->
        <line x1="585" y1="515" x2="585" y2="550" stroke="#1e3a8a" stroke-width="2" marker-end="url(#arr-flow)"/>
        <rect x="475" y="550" width="220" height="45" rx="4" fill="#eff6ff" stroke="#1e3a8a" stroke-width="1.5"/>
        <text x="585" y="572" text-anchor="middle" font-size="12" font-weight="bold" fill="#0f172a">Emit 'new_message' via Socket.IO</text>
        <text x="585" y="587" text-anchor="middle" font-size="10" fill="#475569">Instant Delivery to Recipient Room</text>

        <!-- Complete -->
        <line x1="585" y1="595" x2="585" y2="620" stroke="#059669" stroke-width="2" marker-end="url(#arr-flow)"/>
        <rect x="500" y="620" width="170" height="32" rx="16" fill="#059669"/>
        <text x="585" y="641" text-anchor="middle" font-size="12" font-weight="bold" fill="#ffffff">DELIVERY COMPLETE</text>
      </svg>
    </div>
    `
  }
];

(async () => {
  console.log('Launching Puppeteer Chrome to render 8 technical diagrams...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  for (const d of diagrams) {
    const page = await browser.newPage();
    await page.setViewport({ width: d.width, height: d.height, deviceScaleFactor: 2 });
    await page.setContent(d.html, { waitUntil: 'networkidle0' });
    const targetFile = path.join(outDir, `${d.id}.png`);
    await page.screenshot({ path: targetFile, omitBackground: false });
    console.log(`Rendered: ${d.id}.png (${d.width}x${d.height})`);
    await page.close();
  }

  await browser.close();
  console.log('All 8 technical diagrams successfully generated!');
})();
