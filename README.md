# VC Messenger - Corporate LAN Portal & Secure File Exchange

A modern, real-time corporate messaging and file-sharing portal designed for on-premise local area networks (LAN / Wi-Fi). It allows company teams to chat and transfer files directly over their office IP network without relying on external cloud providers.

---

## 🚀 Live Access Details

- **Local Host URL:** `http://localhost:3001`
- **LAN / Wi-Fi Network URL:** `http://<YOUR_IP>:3001` (e.g. `http://192.168.30.3:3001`)

---

## 👥 Role-Based Access Control (RBAC) Matrix

| Role | Who They Can Message | Special Capabilities |
| :--- | :--- | :--- |
| **Admin** | **Everyone** (Supervisors, Agents, Admins) | Create users, assign roles, deactivate accounts, reset passwords, audit logs, broadcast announcements |
| **Supervisor** | **Everyone** (Supervisors, Agents, Admins) | Broadcast company announcements, 1-on-1 chats with any team member, view shared file history |
| **Agent** | **Supervisors & Admins ONLY** | **Strictly blocked from messaging other agents** (enforced on both UI & backend API/WebSocket) |

---

## 🔑 Initial Administrator Account

| Role | Username | Password | Purpose |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | Portal Administrator with User Management console |

*Note: Use the Admin Console to create your company's Supervisors and Agents, set their usernames, and assign their roles.*

---

## 🛠️ Key Features Built

1. **Strict Policy Enforcement**:
   - Backend middleware (`server/middleware/rbac.js`) and Socket.IO layer strictly reject any agent-to-agent communication with HTTP `403 Forbidden`.
   - The Agent contact list dynamically filters out fellow agents so they only see available Supervisors and Administrators.
2. **Fast LAN File Sharing**:
   - High-speed direct uploads up to 100MB over office Wi-Fi/Ethernet.
   - Drag-and-drop file upload zone directly in the chat window.
   - Inline preview for images and documents.
   - Dedicated "Shared Files" drawer per conversation with one-click download.
3. **Real-time Messaging & Presence**:
   - WebSockets (Socket.IO) for instant message delivery and read receipts (`✓` delivered, `✓✓` read).
   - Live online/offline presence tracking.
   - Live typing indicators ("Sarah is typing...").
4. **Admin Console**:
   - Create new users and assign roles (`Admin`, `Supervisor`, `Agent`).
   - Edit user roles, departments, or account status (`active` / `inactive`).
   - Reset user passwords.
   - View real-time security audit trails with client IP addresses.
5. **Supervisor & Admin Announcements**:
   - Broadcast global noticeboard alerts (Normal or Urgent) visible to all staff.
6. **Network & QR Code Helper**:
   - Auto-discovers active IPv4 interfaces and generates QR codes so team members can scan from their smartphones.

---

## 🏃 Running the Application

### 1. Start the Server
```bash
npm start
```
The server will bind to `0.0.0.0:3001` and serve both the API and the React frontend.

### 2. Rebuilding the Frontend (if modifications are made)
```bash
npm run build
```

---

## 📂 Project Structure

```
VC Messenger/
├── server/
│   ├── server.js              # Express app & Socket.io server (port 3001)
│   ├── db.js                  # SQLite database, WAL mode & auto-seeding
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication & role authorization
│   │   └── rbac.js            # Strict messaging RBAC (Agent restriction)
│   ├── routes/
│   │   ├── auth.js            # Login, password change, demo users
│   │   ├── users.js           # Admin user management & contact list
│   │   ├── chats.js           # Message history & RBAC chat delivery
│   │   ├── files.js           # Multer file upload & download
│   │   ├── announcements.js   # Broadcast notices
│   │   └── system.js          # Network IP discovery & QR generation
│   └── socket/
│       └── socketHandler.js   # Real-time WebSocket messaging & typing
├── client/
│   ├── src/
│   │   ├── App.jsx            # Main app shell & socket event listeners
│   │   ├── api.js             # Axios client with JWT interceptor
│   │   ├── socket.js          # Socket.io client
│   │   └── components/
│   │       ├── Login.jsx      # Login page with demo switcher & LAN banner
│   │       ├── Navbar.jsx     # Header with LAN IP badge & role tags
│   │       ├── Sidebar.jsx    # Contact list with RBAC filtering & search
│   │       ├── ChatArea.jsx   # Message list, drag-and-drop, typing indicator
│   │       ├── AdminConsole.jsx # User creation & role management
│   │       ├── SharedFilesDrawer.jsx # Exchanged files browser
│   │       ├── AnnouncementsModal.jsx # Broadcast alerts
│   │       ├── QrCodeModal.jsx # Mobile scan & connect QR code
│   │       └── ChangePasswordModal.jsx
│   └── vite.config.js
├── uploads/                   # Local file storage for shared files
├── vc_messenger.db            # SQLite database
└── package.json
```
