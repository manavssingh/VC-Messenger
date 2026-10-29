const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const { Server } = require('socket.io');
const os = require('os');

const { initDB } = require('./db');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const chatsRoutes = require('./routes/chats');
const filesRoutes = require('./routes/files');
const announcementsRoutes = require('./routes/announcements');
const systemRoutes = require('./routes/system');
const { initSocket } = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  },
  maxHttpBufferSize: 100 * 1024 * 1024 // 100MB buffer for file transfers
});

app.set('io', io);
initSocket(io);

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Initialize DB schema & seed data
initDB();

// Uploads static directory
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/chats', chatsRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/system', systemRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Serve frontend build if present
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      return res.sendFile(path.join(clientDist, 'index.html'));
    }
    next();
  });
}

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

server.listen(PORT, HOST, () => {
  const interfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        ips.push({ name, ip: net.address });
      }
    }
  }

  console.log('\n==================================================');
  console.log('🚀 VC Messenger Corporate Portal Started Successfully!');
  console.log('==================================================');
  console.log(`Local Access:        http://localhost:${PORT}`);
  ips.forEach(i => {
    console.log(`LAN / IP Access:     http://${i.ip}:${PORT}  (${i.name})`);
  });
  console.log('==================================================');
  console.log('System Accounts:');
  console.log(' - Admin:       admin       / admin123');
  console.log(' (Create Supervisors and Agents via the Admin Console)');
  console.log('==================================================\n');
});
