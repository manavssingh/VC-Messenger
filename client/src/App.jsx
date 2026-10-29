import React, { useState, useEffect, useCallback } from 'react';
import api from './api';
import { connectSocket, disconnectSocket, getSocket } from './socket';
import { Login } from './components/Login';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { AdminConsole } from './components/AdminConsole';
import { SharedFilesDrawer } from './components/SharedFilesDrawer';
import { AnnouncementsModal } from './components/AnnouncementsModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { MessageSquare } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem('vc_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('vc_token'));
  const [currentTab, setCurrentTab] = useState('chat'); // 'chat' or 'admin'
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [networkInfo, setNetworkInfo] = useState(null);

  // Modals
  const [showAnnouncementsModal, setShowAnnouncementsModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showFilesDrawer, setShowFilesDrawer] = useState(false);
  const [unreadAnnouncementsCount, setUnreadAnnouncementsCount] = useState(0);

  // Load network info
  useEffect(() => {
    api.get('/system/network-info')
      .then(res => setNetworkInfo(res.data))
      .catch(err => console.error('Failed to load network info:', err));
  }, []);

  // Fetch contacts
  const fetchContacts = useCallback(async () => {
    if (!token) return;
    try {
      const res = await api.get('/users/contacts');
      setContacts(res.data);
      // If a contact is selected, keep reference fresh
      if (selectedContact) {
        const updated = res.data.find(c => c.id === selectedContact.id);
        if (updated) setSelectedContact(prev => ({ ...prev, ...updated }));
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    }
  }, [token, selectedContact?.id]);

  useEffect(() => {
    if (currentUser && token) {
      fetchContacts();
    }
  }, [currentUser, token]);

  // Setup Socket Connection
  useEffect(() => {
    if (!currentUser || !token) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(token);

    socket.on('initial_online_users', (ids) => {
      setOnlineUserIds(ids);
    });

    socket.on('user_presence_change', ({ userId, isOnline }) => {
      setOnlineUserIds(prev => {
        if (isOnline) {
          return prev.includes(userId) ? prev : [...prev, userId];
        } else {
          return prev.filter(id => id !== userId);
        }
      });
    });

    socket.on('new_message', (msg) => {
      // Update contact list unread count & last message
      setContacts(prev => prev.map(c => {
        if (c.id === msg.sender_id) {
          const isCurrentActive = selectedContact?.id === msg.sender_id;
          return {
            ...c,
            unreadCount: isCurrentActive ? 0 : (c.unreadCount || 0) + 1,
            lastMessage: {
              content: msg.content || (msg.file_name ? `📎 ${msg.file_name}` : ''),
              createdAt: msg.created_at,
              isFromMe: false
            }
          };
        }
        return c;
      }));
    });

    socket.on('message_sent', (msg) => {
      setContacts(prev => prev.map(c => {
        if (c.id === msg.receiver_id) {
          return {
            ...c,
            lastMessage: {
              content: msg.content || (msg.file_name ? `📎 ${msg.file_name}` : ''),
              createdAt: msg.created_at,
              isFromMe: true
            }
          };
        }
        return c;
      }));
    });

    socket.on('new_announcement', () => {
      setUnreadAnnouncementsCount(prev => prev + 1);
    });

    return () => {
      disconnectSocket();
    };
  }, [currentUser?.id, token, selectedContact?.id]);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('vc_token');
    localStorage.removeItem('vc_user');
    disconnectSocket();
    setCurrentUser(null);
    setToken(null);
    setSelectedContact(null);
    setCurrentTab('chat');
  };

  const handleLoginSuccess = (user, jwtToken) => {
    setCurrentUser(user);
    setToken(jwtToken);
    setCurrentTab('chat');
  };

  const handleSelectContact = (contact) => {
    setSelectedContact(contact);
    // Mark as read in local contact state
    setContacts(prev => prev.map(c => c.id === contact.id ? { ...c, unreadCount: 0 } : c));
  };

  const handleMessageSentUpdate = (newMsg) => {
    // Immediately update sidebar last message for this recipient
    setContacts(prev => prev.map(c => {
      if (c.id === newMsg.receiver_id) {
        return {
          ...c,
          lastMessage: {
            content: newMsg.content || (newMsg.file_name ? `📎 ${newMsg.file_name}` : ''),
            createdAt: newMsg.created_at,
            isFromMe: true
          }
        };
      }
      return c;
    }));
  };

  if (!currentUser || !token) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 font-sans">
      {/* Global Navbar */}
      <Navbar
        currentUser={currentUser}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onLogout={handleLogout}
        onOpenAnnouncements={() => {
          setShowAnnouncementsModal(true);
          setUnreadAnnouncementsCount(0);
        }}
        onOpenChangePassword={() => setShowChangePasswordModal(true)}
        networkInfo={networkInfo}
        unreadAnnouncementsCount={unreadAnnouncementsCount}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {currentTab === 'admin' && currentUser.role === 'admin' ? (
          <AdminConsole />
        ) : (
          <div className="flex-1 flex w-full h-full overflow-hidden">
            {/* Left Sidebar */}
            <div className={`w-full md:w-80 lg:w-96 h-full ${selectedContact ? 'hidden md:flex' : 'flex'}`}>
              <Sidebar
                currentUser={currentUser}
                contacts={contacts}
                selectedContact={selectedContact}
                onSelectContact={handleSelectContact}
                onlineUserIds={onlineUserIds}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
            </div>

            {/* Chat Area or Empty Placeholder */}
            <div className={`flex-1 h-full ${selectedContact ? 'flex' : 'hidden md:flex'}`}>
              {selectedContact ? (
                <ChatArea
                  currentUser={currentUser}
                  selectedContact={selectedContact}
                  onBack={() => setSelectedContact(null)}
                  onOpenFilesDrawer={() => setShowFilesDrawer(true)}
                  isOnline={onlineUserIds.includes(selectedContact.id)}
                  onMessageSent={handleMessageSentUpdate}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-500 bg-slate-950">
                  <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 mb-4 shadow-xl">
                    <MessageSquare className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-base text-slate-300">VC Messenger Direct Chat</h3>
                  <p className="text-xs text-slate-400 max-w-sm mt-1">
                    Select a contact on the left to start sending messages and sharing files directly over the local network.
                  </p>
                  {currentUser.role === 'agent' && (
                    <div className="mt-4 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                      Agent Mode: You can message Shift Supervisors and Administrators.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Global Modals */}
      <AnnouncementsModal
        isOpen={showAnnouncementsModal}
        onClose={() => setShowAnnouncementsModal(false)}
        currentUser={currentUser}
      />

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />

      {selectedContact && (
        <SharedFilesDrawer
          isOpen={showFilesDrawer}
          onClose={() => setShowFilesDrawer(false)}
          targetUser={selectedContact}
        />
      )}
    </div>
  );
}
