'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { FiSend, FiPaperclip, FiClock, FiCheckCircle, FiPlus, FiChevronLeft, FiHelpCircle } from 'react-icons/fi';
import { supportAPI, commonAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SupportSystem({ preselectedOrder }) {
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  
  const [newTicket, setNewTicket] = useState({
    subject: preselectedOrder ? `Issue with Order #${preselectedOrder}` : '',
    category: preselectedOrder ? 'order' : 'other',
    priority: 'medium',
    message: ''
  });

  const chatRef = useRef(null);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await supportAPI.listTickets();
      setTickets(res.data);
      if (res.data.length > 0 && !activeTicket && !preselectedOrder) {
         // Optionally auto-select first ticket
      }
    } catch (err) { toast.error('Failed to load tickets'); }
    setLoading(false);
  }, [activeTicket, preselectedOrder]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  useEffect(() => {
    if (activeTicket) {
      supportAPI.getTicket(activeTicket.id).then(r => {
        setMessages(r.data.messages || []);
        setTimeout(() => chatRef.current?.scrollTo(0, chatRef.current.scrollHeight), 100);
      });
      // Poll for new messages every 10 seconds
      const timer = setInterval(() => {
        supportAPI.getTicket(activeTicket.id).then(r => setMessages(r.data.messages || []));
      }, 10000);
      return () => clearInterval(timer);
    }
  }, [activeTicket]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await supportAPI.createTicket(newTicket);
      toast.success('Support ticket created!');
      setShowCreate(false);
      fetchTickets();
      setActiveTicket(res.data);
    } catch (err) { toast.error(err.message); }
    setSending(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      const res = await supportAPI.sendMessage(activeTicket.id, { message });
      setMessages([...messages, res.data]);
      setMessage('');
      setTimeout(() => chatRef.current?.scrollTo(0, chatRef.current.scrollHeight), 100);
    } catch (err) { toast.error('Failed to send message'); }
    setSending(false);
  };

  if (loading) return <div className="p-10 text-center animate-pulse">Loading tickets...</div>;

  return (
    <div className="h-[600px] flex border border-fk-divider rounded-xl overflow-hidden bg-white shadow-sm">
      {/* Ticket List Sidebar */}
      <div className={`w-full md:w-80 border-r border-fk-divider flex flex-col ${activeTicket ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-fk-divider flex items-center justify-between bg-fk-bg/30">
           <h3 className="font-black text-xs uppercase tracking-widest text-fk-text">My Tickets</h3>
           <button onClick={() => { setShowCreate(true); setActiveTicket(null); }} className="w-8 h-8 rounded-full bg-fk-blue text-white flex items-center justify-center hover:scale-110 transition-all"><FiPlus /></button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
           {tickets.length === 0 && !showCreate && (
              <div className="p-8 text-center text-fk-muted">
                 <p className="text-xs font-bold">No tickets yet.</p>
              </div>
           )}
           {tickets.map(t => (
             <button key={t.id} onClick={() => { setActiveTicket(t); setShowCreate(false); }} className={`w-full p-4 text-left border-b border-fk-divider hover:bg-fk-bg/30 transition-all ${activeTicket?.id === t.id ? 'bg-fk-bg/50 border-l-4 border-fk-blue' : ''}`}>
                <div className="flex justify-between mb-1">
                   <span className="text-[10px] font-black text-fk-blue uppercase">{t.category}</span>
                   <span className="text-[10px] font-bold text-fk-muted">{new Date(t.updatedAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm font-bold text-fk-text truncate">{t.subject}</p>
                <p className="text-xs text-fk-muted line-clamp-1 mt-1">{t.last_message}</p>
                <div className="flex items-center gap-2 mt-2">
                   <span className={`w-2 h-2 rounded-full ${t.status === 'open' ? 'bg-green-500' : 'bg-fk-muted'}`}></span>
                   <span className="text-[10px] font-black uppercase text-fk-muted tracking-widest">{t.status}</span>
                </div>
             </button>
           ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative bg-slate-50/30">
        {showCreate ? (
           <div className="flex-1 p-8 overflow-y-auto">
              <h3 className="text-xl font-black text-fk-text mb-6">Create New Ticket</h3>
              <form onSubmit={handleCreateTicket} className="space-y-6 max-w-lg">
                 <div>
                    <label className="text-[10px] font-black text-fk-muted uppercase tracking-widest mb-2 block">Category</label>
                    <select value={newTicket.category} onChange={e => setNewTicket({...newTicket, category: e.target.value})} className="w-full p-3 bg-white border border-fk-divider rounded-xl outline-none focus:border-fk-blue font-bold text-sm">
                       <option value="order">Order Issues</option>
                       <option value="payment">Payment Problem</option>
                       <option value="delivery">Delivery Help</option>
                       <option value="return">Return / Refund</option>
                       <option value="other">Other</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-fk-muted uppercase tracking-widest mb-2 block">Subject</label>
                    <input value={newTicket.subject} onChange={e => setNewTicket({...newTicket, subject: e.target.value})} className="w-full p-3 bg-white border border-fk-divider rounded-xl outline-none focus:border-fk-blue font-bold text-sm" placeholder="e.g. Received wrong product" required />
                 </div>
                 <div>
                    <label className="text-[10px] font-black text-fk-muted uppercase tracking-widest mb-2 block">Message</label>
                    <textarea value={newTicket.message} onChange={e => setNewTicket({...newTicket, message: e.target.value})} className="w-full p-3 bg-white border border-fk-divider rounded-xl outline-none focus:border-fk-blue font-bold text-sm min-h-[120px]" placeholder="Describe your issue in detail..." required />
                 </div>
                 <button type="submit" disabled={sending} className="w-full py-4 bg-fk-blue text-white font-black rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-100 transition-all disabled:opacity-50">
                    {sending ? 'Creating...' : 'Submit Ticket'}
                 </button>
              </form>
           </div>
        ) : activeTicket ? (
           <>
              {/* Chat Header */}
              <div className="p-4 border-b border-fk-divider bg-white flex items-center gap-4">
                 <button onClick={() => setActiveTicket(null)} className="md:hidden text-fk-muted"><FiChevronLeft size={24} /></button>
                 <div>
                    <h3 className="font-black text-fk-text leading-tight">{activeTicket.subject}</h3>
                    <p className="text-[10px] font-black text-fk-muted uppercase tracking-widest mt-0.5">Ticket #{activeTicket.id} • {activeTicket.category}</p>
                 </div>
                 {activeTicket.status === 'resolved' && (
                    <div className="ml-auto px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><FiCheckCircle /> Resolved</div>
                 )}
              </div>

              {/* Message List */}
              <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                 {messages.map((m, idx) => (
                    <div key={m.id || idx} className={`flex flex-col ${m.sender_role === 'user' ? 'items-end' : 'items-start'}`}>
                       <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium ${m.sender_role === 'user' ? 'bg-fk-blue text-white rounded-tr-none' : 'bg-white border border-fk-divider text-fk-text rounded-tl-none'}`}>
                          {m.message}
                       </div>
                       <span className="text-[9px] text-fk-muted mt-1 font-bold">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                 ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-fk-divider flex gap-3">
                 <input 
                   value={message} 
                   onChange={e => setMessage(e.target.value)}
                   className="flex-1 bg-fk-bg/50 border border-fk-divider rounded-xl px-4 py-3 outline-none focus:border-fk-blue font-medium text-sm" 
                   placeholder="Type your message..."
                   disabled={sending}
                 />
                 <button type="submit" disabled={sending || !message.trim()} className="w-12 h-12 bg-fk-blue text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-100 disabled:opacity-50">
                    <FiSend />
                 </button>
              </form>
           </>
        ) : (
           <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
              <div className="w-20 h-20 bg-fk-bg rounded-full flex items-center justify-center text-fk-muted mb-4"><FiHelpCircle size={40} /></div>
              <h3 className="text-xl font-black text-fk-text">Need Assistance?</h3>
              <p className="text-sm text-fk-muted mt-2 mb-8 max-w-xs">Select a ticket from the list or create a new one to talk to our support team.</p>
              <button onClick={() => setShowCreate(true)} className="px-8 py-3 bg-fk-blue text-white font-black rounded-xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-100">Create New Ticket</button>
           </div>
        )}
      </div>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
    </div>
  );
}
