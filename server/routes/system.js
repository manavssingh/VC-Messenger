const express = require('express');
const router = express.Router();
const os = require('os');
const { db } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/system/network-info - Discover IP addresses
router.get('/network-info', (req, res) => {
  try {
    const port = process.env.PORT || 3001;
    const interfaces = os.networkInterfaces();
    const networkIps = [];

    for (const name of Object.keys(interfaces)) {
      for (const net of interfaces[name]) {
        // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
        if (net.family === 'IPv4' && !net.internal) {
          networkIps.push({
            interface: name,
            ip: net.address,
            url: `http://${net.address}:${port}`
          });
        }
      }
    }

    // Determine primary URL (first active non-internal IPv4)
    const primaryIp = networkIps.length > 0 ? networkIps[0].ip : 'localhost';
    const primaryUrl = `http://${primaryIp}:${port}`;

    res.json({
      port,
      hostname: os.hostname(),
      primaryIp,
      primaryUrl,
      localUrl: `http://localhost:${port}`,
      networkIps
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve network info', details: err.message });
  }
});

// GET /api/system/stats - Admin only
router.get('/stats', authenticateToken, requireRole('admin'), (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  const activeUsers = db.prepare("SELECT COUNT(*) as c FROM users WHERE status = 'active'").get().c;
  const totalMessages = db.prepare('SELECT COUNT(*) as c FROM messages').get().c;
  const totalFiles = db.prepare('SELECT COUNT(*) as c FROM messages WHERE file_url IS NOT NULL').get().c;
  const totalAnnouncements = db.prepare('SELECT COUNT(*) as c FROM announcements').get().c;

  const roleCounts = db.prepare(`
    SELECT role, COUNT(*) as count 
    FROM users 
    GROUP BY role
  `).all();

  res.json({
    totalUsers,
    activeUsers,
    totalMessages,
    totalFiles,
    totalAnnouncements,
    roleCounts,
    uptimeSeconds: Math.floor(process.uptime()),
    serverTime: new Date().toISOString()
  });
});

// GET /api/system/audit-logs - Admin only
router.get('/audit-logs', authenticateToken, requireRole('admin'), (req, res) => {
  const logs = db.prepare(`
    SELECT l.id, l.action, l.details, l.ip_address, l.created_at,
           u.username, u.full_name, u.role
    FROM audit_logs l
    LEFT JOIN users u ON l.user_id = u.id
    ORDER BY l.id DESC
    LIMIT 100
  `).all();

  res.json(logs);
});

module.exports = router;
