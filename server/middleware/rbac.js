const { db } = require('../db');

/**
 * Validates whether the sender has permission to message the receiver.
 * Rule:
 * - Admin: Can message anyone
 * - Supervisor: Can message anyone
 * - Agent: Can ONLY message Supervisor or Admin. CANNOT message another Agent.
 *
 * @param {object} sender - The user sending the message
 * @param {number|object} receiver - The target receiver object or receiver ID
 * @returns {{ allowed: boolean, reason?: string, receiver?: object }}
 */
function checkMessagingPermission(sender, receiver) {
  let targetUser = receiver;
  if (typeof receiver === 'number' || typeof receiver === 'string') {
    targetUser = db.prepare('SELECT id, username, full_name, role, status FROM users WHERE id = ?').get(receiver);
  }

  if (!targetUser) {
    return { allowed: false, reason: 'Target recipient does not exist.' };
  }

  if (targetUser.id === sender.id) {
    return { allowed: false, reason: 'Cannot message yourself.' };
  }

  if (targetUser.status !== 'active') {
    return { allowed: false, reason: 'Recipient account is inactive.' };
  }

  // Admin & Supervisor can message anyone
  if (sender.role === 'admin' || sender.role === 'supervisor') {
    return { allowed: true, receiver: targetUser };
  }

  // Agent role checks
  if (sender.role === 'agent') {
    if (targetUser.role === 'agent') {
      return { 
        allowed: false, 
        reason: 'Policy restriction: Agents are not permitted to message other agents. You may only message supervisors or admins.',
        receiver: targetUser
      };
    }
    // Agents are permitted to message supervisors and admin
    if (targetUser.role === 'supervisor' || targetUser.role === 'admin') {
      return { allowed: true, receiver: targetUser };
    }
  }

  return { allowed: false, reason: 'Permission denied.' };
}

module.exports = {
  checkMessagingPermission
};
