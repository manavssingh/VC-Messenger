const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { db, logAudit, getConversationId } = require('../db');
const { authenticateToken, requireRole } = require('../middleware/auth');

// GET /api/users/contacts - Filtered by role permissions
router.get('/contacts', authenticateToken, (req, res) => {
  const currentUser = req.user;

  let query = '';
  let params = [];

  if (currentUser.role === 'agent') {
    // AGENT CAN ONLY MESSAGE SUPERVISORS AND ADMINS
    query = `
      SELECT id, username, full_name, role, department, avatar_color, status, last_seen
      FROM users
      WHERE id != ? AND status = 'active' AND role IN ('supervisor', 'admin')
      ORDER BY role ASC, full_name ASC
    `;
    params = [currentUser.id];
  } else {
    // SUPERVISORS AND ADMINS CAN MESSAGE ANYONE
    query = `
      SELECT id, username, full_name, role, department, avatar_color, status, last_seen
      FROM users
      WHERE id != ?
      ORDER BY 
        CASE role WHEN 'admin' THEN 1 WHEN 'supervisor' THEN 2 ELSE 3 END,
        full_name ASC
    `;
    params = [currentUser.id];
  }

  const contacts = db.prepare(query).all(...params);

  // Attach unread count and latest message preview for each contact
  const enrichedContacts = contacts.map(contact => {
    const convId = getConversationId(currentUser.id, contact.id);

    const unread = db.prepare(`
      SELECT COUNT(*) as count FROM messages
      WHERE conversation_id = ? AND sender_id = ? AND receiver_id = ? AND is_read = 0
    `).get(convId, contact.id, currentUser.id).count;

    const lastMsg = db.prepare(`
      SELECT content, file_name, created_at, sender_id
      FROM messages
      WHERE conversation_id = ?
      ORDER BY id DESC LIMIT 1
    `).get(convId);

    return {
      ...contact,
      unreadCount: unread,
      lastMessage: lastMsg ? {
        content: lastMsg.content || (lastMsg.file_name ? `📎 ${lastMsg.file_name}` : ''),
        createdAt: lastMsg.created_at,
        isFromMe: lastMsg.sender_id === currentUser.id
      } : null
    };
  });

  res.json(enrichedContacts);
});

// GET /api/users - Admin only: List all users
router.get('/', authenticateToken, requireRole('admin'), (req, res) => {
  const users = db.prepare(`
    SELECT id, username, full_name, role, department, avatar_color, status, last_seen, created_at
    FROM users
    ORDER BY id ASC
  `).all();

  // Add stats per user
  const usersWithStats = users.map(u => {
    const sentCount = db.prepare('SELECT COUNT(*) as c FROM messages WHERE sender_id = ?').get(u.id).c;
    const fileCount = db.prepare('SELECT COUNT(*) as c FROM messages WHERE sender_id = ? AND file_url IS NOT NULL').get(u.id).c;
    return {
      ...u,
      stats: {
        sentMessages: sentCount,
        sharedFiles: fileCount
      }
    };
  });

  res.json(usersWithStats);
});

// POST /api/users - Admin only: Create new user
router.post('/', authenticateToken, requireRole('admin'), (req, res) => {
  const { username, password, full_name, role, department, avatar_color } = req.body;

  if (!username || !password || !full_name || !role) {
    return res.status(400).json({ error: 'Username, password, full name, and role are required' });
  }

  const validRoles = ['admin', 'supervisor', 'agent'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
  }

  const cleanUsername = username.trim().toLowerCase();
  if (cleanUsername.length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters' });
  }

  if (password.length < 5) {
    return res.status(400).json({ error: 'Password must be at least 5 characters' });
  }

  // Check if username already exists
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(cleanUsername);
  if (existing) {
    return res.status(409).json({ error: 'Username is already taken. Please choose another.' });
  }

  const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#6366f1'];
  const assignedColor = avatar_color || colors[Math.floor(Math.random() * colors.length)];
  const hash = bcrypt.hashSync(password, 10);

  const stmt = db.prepare(`
    INSERT INTO users (username, password_hash, full_name, role, department, avatar_color, status)
    VALUES (?, ?, ?, ?, ?, ?, 'active')
  `);

  const result = stmt.run(
    cleanUsername,
    hash,
    full_name.trim(),
    role,
    department ? department.trim() : 'Operations',
    assignedColor
  );

  const newUser = db.prepare(`
    SELECT id, username, full_name, role, department, avatar_color, status, created_at
    FROM users WHERE id = ?
  `).get(result.lastInsertRowid);

  logAudit(req.user.id, 'CREATE_USER', `Created user @${newUser.username} (${newUser.role})`);

  res.status(201).json(newUser);
});

// PUT /api/users/:id - Admin only: Update user
router.put('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { full_name, role, department, status, avatar_color } = req.body;

  const target = db.prepare('SELECT id, username, role FROM users WHERE id = ?').get(userId);
  if (!target) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Protect the primary admin from being changed to non-admin or deactivated if they are the last admin
  if (target.role === 'admin' && (role !== 'admin' || status === 'inactive')) {
    const adminCount = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'admin' AND status = 'active'").get().c;
    if (adminCount <= 1) {
      return res.status(400).json({ error: 'Cannot downgrade or deactivate the sole remaining active Administrator' });
    }
  }

  const updates = [];
  const params = [];

  if (full_name) { updates.push('full_name = ?'); params.push(full_name.trim()); }
  if (role) { 
    if (!['admin', 'supervisor', 'agent'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    updates.push('role = ?'); params.push(role); 
  }
  if (department) { updates.push('department = ?'); params.push(department.trim()); }
  if (status) { 
    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    updates.push('status = ?'); params.push(status); 
  }
  if (avatar_color) { updates.push('avatar_color = ?'); params.push(avatar_color); }

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields provided to update' });
  }

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(userId);

  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  const updatedUser = db.prepare(`
    SELECT id, username, full_name, role, department, avatar_color, status, updated_at
    FROM users WHERE id = ?
  `).get(userId);

  logAudit(req.user.id, 'UPDATE_USER', `Updated user @${updatedUser.username}`);

  res.json(updatedUser);
});

// POST /api/users/:id/reset-password - Admin only: Reset password
router.post('/:id/reset-password', authenticateToken, requireRole('admin'), (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 5) {
    return res.status(400).json({ error: 'New password must be at least 5 characters long' });
  }

  const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const hash = bcrypt.hashSync(newPassword, 10);
  db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(hash, userId);

  logAudit(req.user.id, 'RESET_PASSWORD', `Admin reset password for user @${user.username}`);

  res.json({ message: `Password reset successfully for @${user.username}` });
});

// DELETE /api/users/:id - Admin only: Delete user
router.delete('/:id', authenticateToken, requireRole('admin'), (req, res) => {
  const userId = parseInt(req.params.id, 10);

  if (userId === req.user.id) {
    return res.status(400).json({ error: 'You cannot delete your own admin account' });
  }

  const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  logAudit(req.user.id, 'DELETE_USER', `Deleted user @${user.username}`);

  res.json({ message: `User @${user.username} deleted successfully` });
});

module.exports = router;
