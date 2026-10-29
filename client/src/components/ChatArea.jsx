import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Paperclip, 
  FileText, 
  Image as ImageIcon, 
  Download, 
  Check, 
  CheckCheck, 
  X, 
  FolderArchive,
  ArrowLeft,
  Info,
  Clock,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import api from '../api';
import { getSocket } from '../socket';

export function ChatArea({ 
  currentUser, 
  selectedContact, 
  onBack, 
  onOpenFilesDrawer, 
  isOnline,
  onMessageSent
}) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isPeerTyping, setIsPeerTyping] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch messages when contact changes
  useEffect(() => {
    if (!selectedContact) return;

    setLoading(true);
    api.get(`/chats/${selectedContact.id}/messages`)
      .then((res) => {
        setMessages(res.data.messages || []);
        scrollToBottom();
      })
      .catch((err) => {
        console.error('Failed to load chat history:', err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Mark messages as read
    api.post(`/chats/${selectedContact.id}/read`).catch(() => {});
    const socket = getSocket();
    if (socket) {
      socket.emit('mark_read', { targetUserId: selectedContact.id });
    }
  }, [selectedContact?.id]);

  // Socket event listeners for real-time messages & typing
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !selectedContact) return;

    const handleNewMessage = (msg) => {
      if (msg.sender_id === selectedContact.id || msg.receiver_id === selectedContact.id) {
        setMessages((prev) => [...prev, msg]);
        scrollToBottom();

        // Mark as read immediately if current chat is active
        if (msg.sender_id === selectedContact.id) {
          socket.emit('mark_read', { targetUserId: selectedContact.id });
          api.post(`/chats/${selectedContact.id}/read`).catch(() => {});
        }
      }
    };

    const handleMessageSent = (msg) => {
      if (msg.receiver_id === selectedContact.id) {
        setMessages((prev) => {
          // Avoid duplicates if already added locally
          if (prev.some(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        scrollToBottom();
      }
    };

    const handleMessagesRead = (data) => {
      if (data.byUserId === selectedContact.id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender_id === currentUser.id ? { ...m, is_read: 1 } : m
          )
        );
      }
    };

    const handleUserTyping = (data) => {
      if (data.userId === selectedContact.id) {
        setIsPeerTyping(true);
      }
    };

    const handleUserStopTyping = (data) => {
      if (data.userId === selectedContact.id) {
        setIsPeerTyping(false);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_sent', handleMessageSent);
    socket.on('messages_read', handleMessagesRead);
    socket.on('user_typing', handleUserTyping);
    socket.on('user_stop_typing', handleUserStopTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_sent', handleMessageSent);
      socket.off('messages_read', handleMessagesRead);
      socket.off('user_typing', handleUserTyping);
      socket.off('user_stop_typing', handleUserStopTyping);
    };
  }, [selectedContact?.id, currentUser.id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);

    // Typing notification over socket
    const socket = getSocket();
    if (socket && selectedContact) {
      socket.emit('typing_start', { targetUserId: selectedContact.id });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing_stop', { targetUserId: selectedContact.id });
      }, 1500);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !selectedFile) || isUploading) return;

    let fileUrl = null;
    let fileName = null;
    let fileSize = null;
    let fileType = null;

    if (selectedFile) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFile);

      try {
        const uploadRes = await api.post('/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(pct);
          }
        });

        fileUrl = uploadRes.data.file_url;
        fileName = uploadRes.data.file_name;
        fileSize = uploadRes.data.file_size;
        fileType = uploadRes.data.file_type;
      } catch (err) {
        alert(err.response?.data?.error || 'File upload failed');
        setIsUploading(false);
        setUploadProgress(0);
        return;
      }
    }

    const payload = {
      targetUserId: selectedContact.id,
      content: inputText.trim() || (fileName ? `Sent file: ${fileName}` : ''),
      file_url: fileUrl,
      file_name: fileName,
      file_size: fileSize,
      file_type: fileType
    };

    try {
      const res = await api.post(`/chats/${selectedContact.id}/messages`, payload);
      const newMsg = res.data;
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      scrollToBottom();
      if (onMessageSent) {
        onMessageSent(newMsg);
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send message');
    }

    // Reset input state
    setInputText('');
    setSelectedFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
    scrollToBottom();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      className="flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {/* Drag and Drop Overlay */}
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-blue-600/20 backdrop-blur-sm border-2 border-dashed border-blue-400 flex flex-col items-center justify-center pointer-events-none animate-pulse">
          <div className="p-4 bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 flex flex-col items-center">
            <Paperclip className="w-10 h-10 text-blue-400 mb-2 animate-bounce" />
            <p className="text-sm font-semibold text-white">Drop file to send over LAN</p>
            <p className="text-xs text-slate-400 mt-1">High-speed local network transfer up to 100MB</p>
          </div>
        </div>
      )}

      {/* Chat Header */}
      <div className="h-16 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between z-10 shrink-0 backdrop-blur-md">
        <div className="flex items-center gap-3">
          {/* Back button on mobile */}
          <button
            onClick={onBack}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Contact Avatar */}
          <div className="relative">
            <div
              className="w-10 h-10 rounded-xl text-white font-bold text-sm flex items-center justify-center shadow-md"
              style={{ backgroundColor: selectedContact.avatar_color || '#3b82f6' }}
            >
              {selectedContact.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-500'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-sm text-white">{selectedContact.full_name}</h2>
              <span className="text-[11px] font-mono text-slate-400">@{selectedContact.username}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className="capitalize">{selectedContact.role}</span>
              <span>•</span>
              <span className={isOnline ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                {isOnline ? 'Online now' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenFilesDrawer}
            className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-xs text-slate-200 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="View shared files"
          >
            <Paperclip className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Shared Files</span>
          </button>
        </div>
      </div>

      {/* Messages List Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-xs">
            Loading conversation...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
              <Info className="w-6 h-6" />
            </div>
            <p className="font-semibold text-slate-400">No messages exchanged yet</p>
            <p className="text-slate-500 max-w-xs text-center">
              Send a direct message or drop files to communicate instantly over your company LAN.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.sender_id === currentUser.id;
            const isImage = msg.file_type && msg.file_type.startsWith('image/');

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {/* Peer Avatar */}
                {!isMe && (
                  <div
                    className="w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm mb-1"
                    style={{ backgroundColor: selectedContact.avatar_color || '#3b82f6' }}
                  >
                    {selectedContact.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}

                {/* Bubble Container */}
                <div
                  className={`max-w-[85%] sm:max-w-md rounded-2xl p-3.5 shadow-md ${
                    isMe
                      ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-br-xs'
                      : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-bl-xs'
                  }`}
                >
                  {/* File Attachment Card if present */}
                  {msg.file_url && (
                    <div className="mb-2.5">
                      {isImage ? (
                        <div className="rounded-xl overflow-hidden border border-white/10 group relative cursor-pointer">
                          <img
                            src={msg.file_url}
                            alt={msg.file_name}
                            className="max-h-60 w-full object-cover rounded-xl"
                            onClick={() => setPreviewImage(msg.file_url)}
                          />
                          <a
                            href={msg.file_url}
                            download={msg.file_name}
                            className="absolute bottom-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Download full image"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      ) : (
                        <div
                          className={`p-3 rounded-xl flex items-center justify-between gap-3 border ${
                            isMe
                              ? 'bg-white/10 border-white/15 text-white'
                              : 'bg-slate-950/80 border-slate-800 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 shrink-0">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold truncate select-all">
                                {msg.file_name}
                              </div>
                              <div className="text-[10px] opacity-75 font-mono">
                                {formatFileSize(msg.file_size)}
                              </div>
                            </div>
                          </div>
                          <a
                            href={msg.file_url}
                            download={msg.file_name}
                            className={`p-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
                              isMe
                                ? 'bg-white/20 hover:bg-white/30 text-white'
                                : 'bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white'
                            }`}
                            title="Download file over IP"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message Text */}
                  {msg.content && (
                    <div className="text-xs sm:text-sm whitespace-pre-wrap break-words leading-relaxed">
                      {msg.content}
                    </div>
                  )}

                  {/* Message Timestamp & Read Receipt */}
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                      isMe ? 'text-blue-100/75' : 'text-slate-400'
                    }`}
                  >
                    <span>{formatTime(msg.created_at)}</span>
                    {isMe && (
                      <span title={msg.is_read ? 'Read' : 'Delivered'}>
                        {msg.is_read ? (
                          <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Peer Typing Indicator */}
        {isPeerTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-400 pl-1 animate-pulse">
            <span className="font-semibold text-slate-300">{selectedContact.full_name}</span> is typing
            <span className="inline-flex gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Pending File Attachment Chip */}
      {selectedFile && (
        <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <Paperclip className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="font-medium text-slate-200 truncate block">
                {selectedFile.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {formatFileSize(selectedFile.size)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUploading && (
              <span className="text-[10px] text-blue-400 font-mono">
                {uploadProgress}%
              </span>
            )}
            <button
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              disabled={isUploading}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-3 md:p-4 bg-slate-900 border-t border-slate-800">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Attachment Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/60 transition-all cursor-pointer shrink-0 disabled:opacity-50"
            title="Attach file or photo over LAN"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {/* Message Textarea */}
          <div className="flex-1 relative">
            <textarea
              value={inputText}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message @${selectedContact.username}... (Press Enter to send)`}
              rows={1}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all resize-none max-h-32"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!inputText.trim() && !selectedFile) || isUploading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/25 transition-all cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Enlarged view"
              className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl object-contain"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
