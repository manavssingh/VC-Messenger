const express = require('express');
const router = express.Router();
const { db, logAudit } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/announcements - View all announcements (Accessible by all roles)
router.get('/', authenticateToken, (req, res) => {
  const announcements = db.prepare(`
    SELECT a.id, a.title, a.content, a.priority, a.created_at,
           u.username as sender_username, u.full_name as sender_name, u.role as sender_role
    FROM announcements a
    JOIN users u ON a.sender_id = u.id
    ORDER BY a.id DESC
    LIMIT 50
  `).all();

  res.json(announcements);
});

// POST /api/announcements - Create broadcast announcement (Supervisor & Admin only)
router.post('/', authenticateToken, requireRole('admin', 'supervisor'), (req, res) => {
  const { title, content, priority } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const validPriority = ['normal', 'urgent'].includes(priority) ? priority : 'normal';

  const stmt = db.prepare(`
    INSERT INTO announcements (sender_id, title, content, priority)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(req.user.id, title.trim(), content.trim(), validPriority);

  const announcement = db.prepare(`
    SELECT a.id, a.title, a.content, a.priority, a.created_at,
           u.username as sender_username, u.full_name as sender_name, u.role as sender_role
    FROM announcements a
    JOIN users u ON a.sender_id = u.id
    WHERE a.id = ?
  `).get(result.lastInsertRowid);

  logAudit(req.user.id, 'CREATE_ANNOUNCEMENT', `Posted announcement: "${title}"`);

  // Broadcast to all connected sockets
  const io = req.app.get('io');
  if (io) {
    io.emit('new_announcement', announcement);
  }

  res.status(201).json(announcement);
});

// DELETE /api/announcements/:id - Delete announcement (Admin & creator only)
router.delete('/:id', authenticateToken, requireRole('admin', 'supervisor'), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = db.prepare('SELECT sender_id FROM announcements WHERE id = ?').get(id);

  if (!item) {
    return res.status(404).json({ error: 'Announcement not found' });
  }

  if (req.user.role !== 'admin' && item.sender_id !== req.user.id) {
    return res.status(403).json({ error: 'You can only delete your own announcements' });
  }

  db.prepare('DELETE FROM announcements WHERE id = ?').run(id);
  res.json({ message: 'Announcement deleted' });
});

module.exports = router;
