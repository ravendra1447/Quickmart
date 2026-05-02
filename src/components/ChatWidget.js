'use client';
import { useState, useEffect, useRef } from 'react';
import { FiMessageSquare, FiSend, FiX, FiMinimize2, FiMaximize2, FiUser, FiHeadphones } from 'react-icons/fi';
import { supportAPI } from '@/lib/api';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

export default function ChatWidget() {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTicket) scrollToBottom();
  }, [messages]);

  const fetchTickets = async () => {
    try {
      const res = await supportAPI.listTickets();
      setTickets(res.data || []);
    } catch (err) {}
  };

  const fetchMessages = async (ticketId) => {
    try {
      const res = await supportAPI.getTicket(ticketId);
      setMessages(res.data.messages || []);
      setActiveTicket(res.data);
    } catch (err) {}
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeTicket) return;
    try {
      setLoading(true);
      await supportAPI.sendMessage(activeTicket.id, { message: message.trim() });
      setMessage('');
      fetchMessages(activeTicket.id);
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const createNewTicket = async () => {
    try {
      const subject = prompt('What is the issue about?');
      if (!subject) return;
      const res = await supportAPI.createTicket({ 
        subject, 
        category: 'general', 
        priority: 'medium', 
        message: 'Hello, I need help with my order.' 
      });
      fetchTickets();
      fetchMessages(res.data.id);
    } catch (err) {}
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchTickets();
    }
  }, [isOpen, user]);

  useEffect(() => {
    let interval;
    if (activeTicket && isOpen && !isMinimized) {
      interval = setInterval(() => fetchMessages(activeTicket.id), 5000);
    }
    return () => clearInterval(interval);
  }, [activeTicket, isOpen, isMinimized]);

  if (!user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
      {isOpen && (
        <div className={`bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden transition-all duration-300 flex flex-col ${isMinimized ? 'h-16 w-64' : 'h-[500px] w-80 sm:w-96'}`}>
          {/* Header */}
          <div className="bg-[#2874f0] p-4 text-white flex items-center justify-between cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <FiHeadphones />
              </div>
              <div>
                <h4 className="text-sm font-black tracking-tight">QuickMart Support</h4>
                <p className="text-[10px] font-bold opacity-80">Online | Average response: 2m</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                {isMinimized ? <FiMaximize2 /> : <FiMinimize2 />}
              </button>
              <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <FiX />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {activeTicket ? (
                /* Chat view */
                <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
                  <div className="p-3 bg-white border-b border-slate-100 flex items-center gap-3">
                    <button onClick={() => setActiveTicket(null)} className="text-fk-blue font-bold text-xs hover:underline">← Back</button>
                    <span className="text-xs font-black text-dark-900 truncate">Ticket: {activeTicket.subject}</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                    {messages.map((m, i) => (
                      <div key={i} className={`flex ${m.sender_role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium shadow-sm ${m.sender_role === 'user' ? 'bg-[#2874f0] text-white rounded-tr-none' : 'bg-white text-dark-800 rounded-tl-none border border-slate-100'}`}>
                          {m.message}
                          <p className={`text-[8px] mt-1 opacity-60 ${m.sender_role === 'user' ? 'text-right' : 'text-left'}`}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                    <input 
                      type="text" 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:border-fk-blue transition-all"
                    />
                    <button type="submit" disabled={loading} className="w-10 h-10 bg-[#fb641b] text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-orange-600 transition-all disabled:opacity-50">
                      <FiSend />
                    </button>
                  </form>
                </div>
              ) : (
                /* Ticket List */
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50">
                    <h5 className="text-[10px] font-black text-dark-400 uppercase tracking-widest px-1">Your Support Tickets</h5>
                    {tickets.length === 0 ? (
                      <div className="text-center py-10">
                        <FiMessageSquare className="mx-auto text-slate-200 mb-2" size={40} />
                        <p className="text-xs text-dark-400 font-bold">No active tickets.</p>
                      </div>
                    ) : (
                      tickets.map(t => (
                        <button key={t.id} onClick={() => fetchMessages(t.id)} className="w-full bg-white p-4 rounded-2xl border border-slate-100 text-left hover:border-fk-blue transition-all group">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-black text-dark-900 group-hover:text-fk-blue transition-colors truncate pr-2">{t.subject}</span>
                            <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${t.status === 'open' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>{t.status}</span>
                          </div>
                          <p className="text-[10px] text-dark-500 truncate">{t.last_message || 'No messages yet'}</p>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="p-4 bg-white border-t border-slate-100">
                    <button onClick={createNewTicket} className="w-full py-3 bg-[#fb641b] text-white font-black text-xs uppercase rounded-xl shadow-lg hover:bg-orange-600 transition-all">
                      Start New Conversation
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-[#fb641b] text-white rounded-full shadow-[0_10px_30px_rgba(251,100,27,0.4)] flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all animate-bounce-slow"
        >
          <FiMessageSquare />
        </button>
      )}

      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow { animation: bounce-slow 3s infinite ease-in-out; }
      `}</style>
    </div>
  );
}
