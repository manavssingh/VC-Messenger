import React, { useState, useEffect } from 'react';
import { X, FileText, Image as ImageIcon, Download, Paperclip, Clock, User } from 'lucide-react';
import api from '../api';

export function SharedFilesDrawer({ isOpen, onClose, targetUser }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (isOpen && targetUser) {
      setLoading(true);
      api.get(`/chats/shared-files/${targetUser.id}`)
        .then(res => setFiles(res.data))
        .catch(err => console.error('Failed to load shared files:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, targetUser]);

  if (!isOpen || !targetUser) return null;

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const isImageFile = (type) => {
    return type && type.startsWith('image/');
  };

  const filteredFiles = files.filter(f => {
    if (filter === 'images') return isImageFile(f.file_type);
    if (filter === 'docs') return !isImageFile(f.file_type);
    return true;
  });

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col text-slate-100 animate-slide-left">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="font-bold text-sm text-white">Shared Files</h3>
            <p className="text-[11px] text-slate-400">With {targetUser.full_name}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="p-3 border-b border-slate-800/80 flex items-center gap-2 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            filter === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          All ({files.length})
        </button>
        <button
          onClick={() => setFilter('images')}
          className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            filter === 'images' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Images
        </button>
        <button
          onClick={() => setFilter('docs')}
          className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            filter === 'docs' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          Documents
        </button>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center py-10 text-xs text-slate-400">Loading files...</div>
        ) : filteredFiles.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p>No shared files found in this chat.</p>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.id}
              className="p-3 bg-slate-950/70 border border-slate-800/90 rounded-xl hover:border-slate-700 transition-all flex items-center justify-between gap-3 group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  {isImageFile(file.file_type) ? (
                    <ImageIcon className="w-5 h-5" />
                  ) : (
                    <FileText className="w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-200 truncate group-hover:text-blue-400 transition-colors">
                    {file.file_name}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>•</span>
                    <span>{new Date(file.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <a
                href={file.file_url}
                download={file.file_name}
                className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer shrink-0"
                title="Download File over LAN"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 text-center bg-slate-950/40">
        Direct LAN Transfer • High-speed local access
      </div>
    </div>
  );
}
