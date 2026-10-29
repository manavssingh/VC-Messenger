const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const { db, getConversationId } = require('../db');
const { checkMessagingPermission } = require('../middleware/rbac');

// Track online sockets: userId -> Set of socketIds
const onlineUsers = new Map();

function initSocket(io) {
  // Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      const user = db.prepare(`
        SELECT id, username, full_name, role, status
        FROM users WHERE id = ?
      `).get(payload.id);

      if (!user || user.status !== 'active') {
        return next(new Error('Account inactive or invalid'));
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.user;
    const userId = user.id;

    // Join personal room
    socket.join(`user:${userId}`);

    // Track online status
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Broadcast user online to everyone
    io.emit('user_presence_change', {
      userId,
      isOnline: true,
      lastSeen: new Date().toISOString()
    });

    // Send currently online user IDs to the connected socket
    socket.emit('initial_online_users', Array.from(onlineUsers.keys()));

    // Handle sending message via Socket.IO
    socket.on('send_message', (data, callback) => {
      try {
        const { targetUserId, content, file_url, file_name, file_size, file_type } = data;
        const targetId = parseInt(targetUserId, 10);

        if (!targetId || (!content && !file_url)) {
          if (callback) callback({ error: 'Message content or file required' });
          return;
        }

        // Strict RBAC Verification
        const check = checkMessagingPermission(user, targetId);
        if (!check.allowed) {
          if (callback) callback({ error: check.reason });
          return;
        }

        const convId = getConversationId(userId, targetId);

        // Ensure conversation exists
        const conv = db.prepare('SELECT id FROM conversations WHERE id = ?').get(convId);
        if (!conv) {
          db.prepare(`
            INSERT INTO conversations (id, user1_id, user2_id, last_message_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
          `).run(convId, Math.min(userId, targetId), Math.max(userId, targetId));
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
          userId,
          targetId,
          content ? content.trim() : null,
          file_url || null,
          file_name || null,
          file_size || null,
          file_type || null
        );

        const insertedMsg = db.prepare(`
          SELECT m.id, m.conversation_id, m.sender_id, m.receiver_id, m.content,
                 m.file_url, m.file_name, m.file_size, m.file_type, m.is_read, m.created_at,
                 u.username as sender_username, u.full_name as sender_name, u.avatar_color as sender_avatar
          FROM messages m
          JOIN users u ON m.sender_id = u.id
          WHERE m.id = ?
        `).get(result.lastInsertRowid);

        // Emit to recipient
        io.to(`user:${targetId}`).emit('new_message', insertedMsg);

        // Emit to sender's other tabs/sessions
        io.to(`user:${userId}`).emit('message_sent', insertedMsg);

        if (callback) callback({ success: true, message: insertedMsg });
      } catch (err) {
        console.error('Error sending message over socket:', err);
        if (callback) callback({ error: 'Internal server error while sending message' });
      }
    });

    // Typing indicators
    socket.on('typing_start', ({ targetUserId }) => {
      io.to(`user:${targetUserId}`).emit('user_typing', {
        userId,
        username: user.username,
        full_name: user.full_name
      });
    });

    socket.on('typing_stop', ({ targetUserId }) => {
      io.to(`user:${targetUserId}`).emit('user_stop_typing', {
        userId
      });
    });

    // Mark messages read
    socket.on('mark_read', ({ targetUserId }) => {
      const targetId = parseInt(targetUserId, 10);
      const convId = getConversationId(userId, targetId);

      db.prepare(`
        UPDATE messages 
        SET is_read = 1 
        WHERE conversation_id = ? AND sender_id = ? AND receiver_id = ? AND is_read = 0
      `).run(convId, targetId, userId);

      io.to(`user:${targetId}`).emit('messages_read', {
        byUserId: userId,
        conversationId: convId
      });
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          const nowIso = new Date().toISOString();
          db.prepare('UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = ?').run(userId);

          io.emit('user_presence_change', {
            userId,
            isOnline: false,
            lastSeen: nowIso
          });
        }
      }
    });
  });
}

module.exports = {
  initSocket,
  onlineUsers
};
