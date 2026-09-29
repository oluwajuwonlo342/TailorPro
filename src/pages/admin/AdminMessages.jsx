import { useState, useEffect } from 'react';
import { Mail, CheckCircle, Clock } from 'lucide-react';
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

  if (loading) return <div className="p-8 text-center text-gray-500 font-bold">Loading Messages...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-dark">Support Inbox</h1>
        <p className="text-gray-500 text-sm mt-1">Manage inquiries submitted through the public contact form.</p>
      </div>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-gray-100 shadow-sm text-gray-500 font-medium">
            Your inbox is empty.
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} className={`p-6 rounded-3xl border transition-all ${msg.isRead ? 'bg-white border-gray-100 shadow-sm' : 'bg-blue-50/50 border-blue-100 shadow-md'}`}>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-lg font-bold text-brand-dark flex items-center gap-2">
                    {msg.subject}
                    {!msg.isRead && <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider">New</span>}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1 font-medium">
                    <span className="text-brand-dark">{msg.name}</span>
                    <span>•</span>
                    <a href={`mailto:${msg.email}`} className="text-primary hover:underline">{msg.email}</a>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                
                {!msg.isRead && (
                  <button 
                    onClick={() => markAsRead(msg._id)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                    title="Mark as Read"
                  >
                    <CheckCircle className="w-6 h-6" />
                  </button>
                )}
              </div>
              
              <div className="mt-4 p-4 bg-gray-50 rounded-2xl text-sm text-gray-700 whitespace-pre-wrap font-medium leading-relaxed border border-gray-100">
                {msg.message}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}