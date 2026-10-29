import React, { useState } from 'react';
import { 
  Search, 
  ShieldCheck, 
  Headphones, 
  ShieldAlert, 
  MessageSquare, 
  Clock, 
  Check, 
  CheckCheck,
  UserCheck,
  Filter
} from 'lucide-react';

export function Sidebar({ 
  currentUser, 
  contacts, 
  selectedContact, 
  onSelectContact, 
  onlineUserIds, 
  searchQuery, 
  setSearchQuery 
}) {
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch = 
      c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.department && c.department.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (roleFilter === 'all') return true;
    return c.role === roleFilter;
  });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
            Admin
          </span>
        );
      case 'supervisor':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
            Supervisor
          </span>
        );
      case 'agent':
        return (
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            Agent
          </span>
        );
      default:
        return null;
    }
  };

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <aside className="w-full md:w-80 lg:w-96 bg-slate-900/95 border-r border-slate-800 flex flex-col h-full shrink-0 select-none">
      {/* Top Banner explaining role rules */}
      {currentUser.role === 'agent' ? (
        <div className="p-3 bg-blue-950/40 border-b border-blue-900/40 text-[11px] text-blue-300 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-blue-200">Agent Communication Policy:</span>
            <p className="text-blue-300/80 mt-0.5 leading-snug">
              You are connected directly to Shift Supervisors & Administrators for escalations.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-purple-950/30 border-b border-purple-900/30 text-[11px] text-purple-300 flex items-start gap-2">
          <UserCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-purple-200">Supervisor Portal:</span>
            <p className="text-purple-300/80 mt-0.5 leading-snug">
              Full channel access: Message any team member or broadcast alerts.
            </p>
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="p-3 border-b border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or @username..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
          />
        </div>

        {/* Filters if Supervisor or Admin */}
        {currentUser.role !== 'agent' && (
          <div className="flex items-center gap-1.5 mt-2.5">
            <button
              onClick={() => setRoleFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                roleFilter === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setRoleFilter('agent')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                roleFilter === 'agent'
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              Agents
            </button>
            <button
              onClick={() => setRoleFilter('supervisor')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                roleFilter === 'supervisor'
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              Supervisors
            </button>
          </div>
        )}
      </div>

      {/* Contacts List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
        {filteredContacts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-slate-600 stroke-[1.5]" />
            <p>No contacts found.</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-2 text-blue-400 hover:underline cursor-pointer"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          filteredContacts.map((contact) => {
            const isOnline = onlineUserIds.includes(contact.id);
            const isSelected = selectedContact?.id === contact.id;

            return (
              <div
                key={contact.id}
                onClick={() => onSelectContact(contact)}
                className={`p-3.5 flex items-center gap-3 cursor-pointer transition-colors relative ${
                  isSelected
                    ? 'bg-blue-600/15 border-l-4 border-blue-500'
                    : 'hover:bg-slate-800/60'
                }`}
              >
                {/* Avatar with Online Badge */}
                <div className="relative shrink-0">
                  <div
                    className="w-10 h-10 rounded-xl text-white font-bold text-sm flex items-center justify-center shadow-md"
                    style={{ backgroundColor: contact.avatar_color || '#3b82f6' }}
                  >
                    {contact.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                      isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
                    }`}
                    title={isOnline ? 'Online now' : 'Offline'}
                  />
                </div>

                {/* Contact Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="font-semibold text-xs text-white truncate">
                      {contact.full_name}
                    </div>
                    {contact.lastMessage?.createdAt && (
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                        {formatMessageTime(contact.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-slate-400 font-mono">@{contact.username}</span>
                    <span className="text-slate-600">•</span>
                    {getRoleBadge(contact.role)}
                  </div>

                  {/* Last Message Snippet */}
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[11px] text-slate-400 truncate max-w-[180px]">
                      {contact.lastMessage ? (
                        <span>
                          {contact.lastMessage.isFromMe && <span className="text-slate-500">You: </span>}
                          {contact.lastMessage.content}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">No messages yet</span>
                      )}
                    </p>

                    {/* Unread Counter Badge */}
                    {contact.unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold shrink-0 ml-1">
                        {contact.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-slate-950/60 border-t border-slate-800/80 text-[10px] text-slate-500 text-center flex items-center justify-between">
        <span>Contacts: {filteredContacts.length}</span>
        <span>Online: {contacts.filter(c => onlineUserIds.includes(c.id)).length}</span>
      </div>
    </aside>
  );
}
