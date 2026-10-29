import React, { useState } from 'react';
import { 
  Radio, 
  Wifi, 
  Bell, 
  Shield, 
  MessageSquare, 
  LogOut, 
  Key, 
  Megaphone,
  User,
  ChevronDown
} from 'lucide-react';

export function Navbar({ 
  currentUser, 
  currentTab, 
  setCurrentTab, 
  onLogout, 
  onOpenAnnouncements, 
  onOpenChangePassword,
  networkInfo,
  unreadAnnouncementsCount
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 uppercase tracking-wider">
            Admin
          </span>
        );
      case 'supervisor':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase tracking-wider">
            Supervisor
          </span>
        );
      case 'agent':
        return (
          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-wider">
            Agent
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 md:px-6 flex items-center justify-between z-30 shrink-0">
      {/* Left: Brand & Navigation */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
              <span>VC Messenger</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <div className="text-[10px] text-slate-400 font-medium">Corporate LAN Portal</div>
          </div>
        </div>

        {/* Admin Tab Switcher */}
        {currentUser.role === 'admin' && (
          <nav className="hidden sm:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setCurrentTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'chat'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Messenger
            </button>
            <button
              onClick={() => setCurrentTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                currentTab === 'admin'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Admin Console
            </button>
          </nav>
        )}
      </div>

      {/* Center: LAN IP quick display */}
      <div className="hidden lg:flex items-center gap-2 bg-slate-950/80 border border-slate-800/80 px-3.5 py-1.5 rounded-full text-xs text-slate-300">
        <Wifi className="w-3.5 h-3.5 text-emerald-400" />
        <span className="text-slate-400">LAN Host:</span>
        <span className="font-mono text-slate-200 font-medium">
          {networkInfo ? networkInfo.primaryUrl : 'Detecting IP...'}
        </span>
      </div>

      {/* Right: Actions, Announcements & User Menu */}
      <div className="flex items-center gap-3">

        {/* Announcements button */}
        <button
          onClick={onOpenAnnouncements}
          className="relative p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          title="Company Announcements"
        >
          <Megaphone className="w-4 h-4" />
          {unreadAnnouncementsCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadAnnouncementsCount}
            </span>
          )}
        </button>

        {/* User Info & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 transition-all cursor-pointer"
          >
            <div
              className="w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundColor: currentUser.avatar_color || '#3b82f6' }}
            >
              {currentUser.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-white leading-tight">
                {currentUser.full_name}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                {getRoleBadge(currentUser.role)}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl py-1.5 z-50 text-xs">
                <div className="px-3.5 py-2 border-b border-slate-800 mb-1">
                  <div className="font-semibold text-white">{currentUser.full_name}</div>
                  <div className="text-slate-400 font-mono text-[11px]">@{currentUser.username}</div>
                  <div className="mt-1">{getRoleBadge(currentUser.role)}</div>
                </div>

                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => {
                      setCurrentTab(currentTab === 'chat' ? 'admin' : 'chat');
                      setMenuOpen(false);
                    }}
                    className="w-full px-3.5 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    {currentTab === 'chat' ? (
                      <>
                        <Shield className="w-3.5 h-3.5 text-blue-400" />
                        <span>Open Admin Console</span>
                      </>
                    ) : (
                      <>
                        <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                        <span>Open Messenger</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => {
                    onOpenChangePassword();
                    setMenuOpen(false);
                  }}
                  className="w-full px-3.5 py-2 text-left text-slate-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Change Password</span>
                </button>

                <div className="my-1 border-t border-slate-800" />

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full px-3.5 py-2 text-left text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
