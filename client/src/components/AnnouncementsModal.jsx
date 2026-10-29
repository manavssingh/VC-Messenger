import React, { useState, useEffect } from 'react';
import { Megaphone, X, Plus, AlertCircle, Trash2, Calendar, User } from 'lucide-react';
import api from '../api';

export function AnnouncementsModal({ isOpen, onClose, currentUser }) {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('normal');
  const [error, setError] = useState('');

  const loadAnnouncements = () => {
    setLoading(true);
    api.get('/announcements')
      .then(res => setAnnouncements(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      loadAnnouncements();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/announcements', { title, content, priority });
      setTitle('');
      setContent('');
      setPriority('normal');
      setShowCreate(false);
      loadAnnouncements();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to post announcement');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/announcements/${id}`);
      loadAnnouncements();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete');
    }
  };

  const canBroadcast = currentUser.role === 'admin' || currentUser.role === 'supervisor';

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[85vh] text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Company Announcements</h3>
              <p className="text-xs text-slate-400">Broadcasts & Shift Updates</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canBroadcast && !showCreate && (
              <button
                onClick={() => setShowCreate(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Broadcast</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Create Form if triggered */}
          {showCreate && (
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-300">Broadcast to all Agents & Staff</span>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {error && <div className="text-xs text-rose-400">{error}</div>}

              <form onSubmit={handleCreateAnnouncement} className="space-y-3">
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Announcement Title"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100"
                />

                <textarea
                  required
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Detailed message for all staff..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 resize-none"
                />

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-3 text-xs">
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="prio"
                        checked={priority === 'normal'}
                        onChange={() => setPriority('normal')}
                      />
                      <span>Normal</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-amber-400">
                      <input
                        type="radio"
                        name="prio"
                        checked={priority === 'urgent'}
                        onChange={() => setPriority('urgent')}
                      />
                      <span className="font-semibold">Urgent Alert</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Post Broadcast
                  </button>
                </div>
              </form>
            </div>
          )}

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-500">Loading notices...</div>
          ) : announcements.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <Megaphone className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p>No active announcements at this time.</p>
            </div>
          ) : (
            announcements.map((item) => (
              <div
                key={item.id}
                className={`p-4 rounded-xl border ${
                  item.priority === 'urgent'
                    ? 'bg-rose-950/20 border-rose-500/30'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    {item.priority === 'urgent' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        URGENT
                      </span>
                    )}
                    <h4 className="font-bold text-sm text-white">{item.title}</h4>
                  </div>

                  {(currentUser.role === 'admin' || currentUser.username === item.sender_username) && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Announcement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </p>

                <div className="flex items-center gap-3 mt-3 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 font-mono">
                  <span>Posted by: {item.sender_name} ({item.sender_role})</span>
                  <span>•</span>
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
