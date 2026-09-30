import { useState, useEffect } from 'react';
import { Mail, CheckCircle, Clock, Inbox } from 'lucide-react';
import api from '../../services/api';

export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/contact');
      setMessages(res.data.data);
    } catch (error) {
      console.error('Failed to load messages', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/contact/${id}/read`);
      setMessages(messages.map(msg => msg._id === id ? { ...msg, isRead: true } : msg));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  // Calculate unread count dynamically
  const unreadCount = messages.filter(msg => !msg.isRead).length;

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Loading Messages...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Header with Unread Notification Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-brand-dark">Support Inbox</h1>
            {unreadCount > 0 && (
              <span className="px-3 py-0.5 rounded-full bg-primary text-white text-xs font-black animate-pulse shadow-sm">
                {unreadCount} New {unreadCount === 1 ? 'Message' : 'Messages'}
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1">Manage inquiries submitted through the public contact form.</p>
        </div>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm text-gray-500 font-medium">
            Your inbox is empty.
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg._id} 
              className={`p-4 sm:p-6 rounded-3xl border transition-all ${
                msg.isRead ? 'bg-white border-gray-100 shadow-sm' : 'bg-blue-50/50 border-blue-200 shadow-md ring-1 ring-blue-100'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                
                {/* Sender & Subject info */}
                <div className="w-full sm:w-auto overflow-hidden">
                  <h3 className="text-base sm:text-lg font-bold text-brand-dark flex flex-wrap items-center gap-2">
                    <span className="break-words">{msg.subject}</span>
                    {!msg.isRead && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider shrink-0">
                        New
                      </span>
                    )}
                  </h3>

                  {/* Responsive metadata layout */}
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 mt-1.5 font-medium">
                    <span className="font-bold text-brand-dark">{msg.name}</span>
                    <span className="hidden sm:inline">•</span>
                    <a href={`mailto:${msg.email}`} className="text-primary hover:underline break-all">{msg.email}</a>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center gap-1 shrink-0 text-gray-400">
                      <Clock className="w-3.5 h-3.5" /> {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {/* Action button */}
                {!msg.isRead && (
                  <button 
                    onClick={() => markAsRead(msg._id)}
                    className="self-end sm:self-center p-2.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-xl transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0"
                    title="Mark as Read"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span className="sm:hidden">Mark Read</span>
                  </button>
                )}
              </div>
              
              {/* Message Content Bubble */}
              <div className="mt-4 p-3.5 sm:p-4 bg-gray-50 rounded-2xl text-sm text-gray-700 whitespace-pre-wrap font-medium leading-relaxed border border-gray-100">
                {msg.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
