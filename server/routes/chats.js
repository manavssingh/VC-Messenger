const express = require('express');
const router = express.Router();
const { db, getConversationId } = require('../db');
const { authenticateToken } = require('../middleware/auth');
const { checkMessagingPermission } = require('../middleware/rbac');

// GET /api/chats/:targetUserId/messages - Load chat history
router.get('/:targetUserId/messages', authenticateToken, (req, res) => {
  const currentUserId = req.user.id;
  const targetUserId = parseInt(req.params.targetUserId, 10);

  if (isNaN(targetUserId)) {
    return res.status(400).json({ error: 'Invalid target user ID' });
  }

  // Check messaging permission
  const check = checkMessagingPermission(req.user, targetUserId);
  if (!check.allowed) {
    return res.status(403).json({ error: check.reason });
  }

  const convId = getConversationId(currentUserId, targetUserId);

  // Mark all unread messages from target user as read
  db.prepare(`
    UPDATE messages 
    SET is_read = 1 
    WHERE conversation_id = ? AND sender_id = ? AND receiver_id = ? AND is_read = 0
  `).run(convId, targetUserId, currentUserId);

  // Retrieve messages with sender/receiver details
  const messages = db.prepare(`
    SELECT m.id, m.conversation_id, m.sender_id, m.receiver_id, m.content,
           m.file_url, m.file_name, m.file_size, m.file_type, m.is_read, m.created_at,
           u.username as sender_username, u.full_name as sender_name, u.avatar_color as sender_avatar
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = ?
    ORDER BY m.id ASC
  `).all(convId);

  res.json({
    conversationId: convId,
    targetUser: check.receiver,
    messages
  });
});

// POST /api/chats/:targetUserId/messages - Send message via REST API
router.post('/:targetUserId/messages', authenticateToken, (req, res) => {
  const currentUserId = req.user.id;
  const targetUserId = parseInt(req.params.targetUserId, 10);
  const { content, file_url, file_name, file_size, file_type } = req.body;

  if (isNaN(targetUserId)) {
    return res.status(400).json({ error: 'Invalid target user ID' });
  }

  if (!content && !file_url) {
    return res.status(400).json({ error: 'Message content or file attachment is required' });
  }

  // Enforce strict RBAC: Agent CANNOT message another agent!
  const check = checkMessagingPermission(req.user, targetUserId);
  if (!check.allowed) {
    return res.status(403).json({ error: check.reason });
  }

  const convId = getConversationId(currentUserId, targetUserId);

  // Ensure conversation record exists
  const existingConv = db.prepare('SELECT id FROM conversations WHERE id = ?').get(convId);
  if (!existingConv) {
    db.prepare(`
      INSERT INTO conversations (id, user1_id, user2_id, last_message_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `).run(convId, Math.min(currentUserId, targetUserId), Math.max(currentUserId, targetUserId));
  } else {
    db.prepare('UPDATE conversations SET last_message_at = CURRENT_TIMESTAMP WHERE id = ?').run(convId);
  }

  // Insert message
  const stmt = db.prepare(`
    INSERT INTO messages (conversation_id, sender_id, receiver_id, content, file_url, file_name, file_size, file_type, is_read)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
  `);

  const result = stmt.run(
    convId,
    currentUserId,
    targetUserId,
    content ? content.trim() : null,
    file_url || null,
    file_name || null,
    file_size || null,
    file_type || null
  );

  const insertedMessage = db.prepare(`
    SELECT m.id, m.conversation_id, m.sender_id, m.receiver_id, m.content,
           m.file_url, m.file_name, m.file_size, m.file_type, m.is_read, m.created_at,
           u.username as sender_username, u.full_name as sender_name, u.avatar_color as sender_avatar
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.id = ?
  `).get(result.lastInsertRowid);

  // Emit to socket if io instance is attached
  const io = req.app.get('io');
  if (io) {
    io.to(`user:${targetUserId}`).emit('new_message', insertedMessage);
    io.to(`user:${currentUserId}`).emit('message_sent', insertedMessage);
  }

  res.status(201).json(insertedMessage);
});

// POST /api/chats/:targetUserId/read - Mark messages as read
router.post('/:targetUserId/read', authenticateToken, (req, res) => {
  const currentUserId = req.user.id;
  const targetUserId = parseInt(req.params.targetUserId, 10);
  const convId = getConversationId(currentUserId, targetUserId);

  db.prepare(`
    UPDATE messages 
    SET is_read = 1 
    WHERE conversation_id = ? AND sender_id = ? AND receiver_id = ? AND is_read = 0
  `).run(convId, targetUserId, currentUserId);

  const io = req.app.get('io');
  if (io) {
    io.to(`user:${targetUserId}`).emit('messages_read', {
      byUserId: currentUserId,
      conversationId: convId
    });
  }

  res.json({ success: true });
});

// GET /api/chats/shared-files/:targetUserId - List all shared files between two users
router.get('/shared-files/:targetUserId', authenticateToken, (req, res) => {
  const currentUserId = req.user.id;
  const targetUserId = parseInt(req.params.targetUserId, 10);
  const convId = getConversationId(currentUserId, targetUserId);

  const files = db.prepare(`
    SELECT m.id, m.file_url, m.file_name, m.file_size, m.file_type, m.created_at,
           u.username as sender_username, u.full_name as sender_name
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = ? AND m.file_url IS NOT NULL
    ORDER BY m.id DESC
  `).all(convId);

  res.json(files);
});

module.exports = router;
