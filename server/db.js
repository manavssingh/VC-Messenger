const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'vc_messenger.db');
const db = new Database(dbPath);

// Enable WAL mode for high concurrent read/write performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('admin', 'supervisor', 'agent')),
      department TEXT DEFAULT 'Operations',
      avatar_color TEXT DEFAULT '#3b82f6',
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      last_seen DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      user1_id INTEGER NOT NULL,
      user2_id INTEGER NOT NULL,
      last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      conversation_id TEXT NOT NULL,
      sender_id INTEGER NOT NULL,
      receiver_id INTEGER NOT NULL,
      content TEXT,
      file_url TEXT,
      file_name TEXT,
      file_size INTEGER,
      file_type TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sender_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      priority TEXT DEFAULT 'normal' CHECK(priority IN ('normal', 'urgent')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      action TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
    CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(receiver_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  `);

  // Seed default accounts if users table is empty
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount === 0) {
    console.log('🌱 Seeding initial portal users (Admin, Supervisors, Agents)...');

    const seedUsers = [
      {
        username: 'admin',
        password: 'admin123',
        full_name: 'Portal Administrator',
        role: 'admin',
        department: 'Management',
        avatar_color: '#ef4444'
      }
    ];

    const insertStmt = db.prepare(`
      INSERT INTO users (username, password_hash, full_name, role, department, avatar_color, status)
      VALUES (?, ?, ?, ?, ?, ?, 'active')
    `);

    for (const u of seedUsers) {
      const hash = bcrypt.hashSync(u.password, 10);
      insertStmt.run(u.username, hash, u.full_name, u.role, u.department, u.avatar_color);
    }

    // Seed a welcome announcement
    const adminUser = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
    if (adminUser) {
      db.prepare(`
        INSERT INTO announcements (sender_id, title, content, priority)
        VALUES (?, ?, ?, ?)
      `).run(
        adminUser.id,
        'Welcome to VC Messenger Portal',
        'Welcome to our internal communications and file exchange portal. All agents can reach out directly to shift supervisors here. Fast file sharing is enabled over our local network.',
        'normal'
      );
    }

    console.log('✅ Initial seed data created successfully.');
  }
}

// Log audit action
function logAudit(userId, action, details, ipAddress = '') {
  try {
    db.prepare(`
      INSERT INTO audit_logs (user_id, action, details, ip_address)
      VALUES (?, ?, ?, ?)
    `).run(userId, action, typeof details === 'object' ? JSON.stringify(details) : details, ipAddress);
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
}

// Helper: Normalize conversation ID between two users
function getConversationId(userId1, userId2) {
  const [minId, maxId] = [Math.min(userId1, userId2), Math.max(userId1, userId2)];
  return `conv_${minId}_${maxId}`;
}

module.exports = {
  db,
  initDB,
  logAudit,
  getConversationId
};
