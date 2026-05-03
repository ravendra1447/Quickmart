'use client';
import { useEffect, useState, useRef } from 'react';
import { supportAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiMessageSquare, FiClock, FiCheckCircle, FiAlertCircle, FiSend, FiUser, FiCalendar, FiArrowLeft } from 'react-icons/fi';

const statusColors = {
  open: 'bg-blue-100 text-blue-700',
  answered: 'bg-green-100 text-green-700',
  resolved: 'bg-indigo-100 text-indigo-700',
  closed: 'bg-slate-100 text-slate-700',
};

const priorityColors = {
  low: 'text-slate-400',
  medium: 'text-yellow-500',
  high: 'text-red-500',
};

export default function AdminSupport() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await supportAPI.adminListTickets({ status: statusFilter });
      const data = res.data || res;
      setTickets(Array.isArray(data) ? data : (data.tickets || []));
    } catch (err) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const selectTicket = async (ticket) => {
    setSelectedTicket(ticket);
    try {
      const res = await supportAPI.adminGetTicket(ticket.id);
      const data = res.data || res;
      setMessages(data.messages || []);
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    setSending(true);
    try {
      const res = await supportAPI.adminReply(selectedTicket.id, { message: reply });
      const data = res.data || res;
      setMessages([...messages, data]);
      setReply('');
      // Update ticket status in list
      setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: 'answered', last_message: reply } : t));
    } catch (err) {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const updateTicketStatus = async (id, status) => {
    try {
      await supportAPI.adminUpdateStatus(id, { status });
      toast.success(`Status updated to ${status}`);
      setTickets(tickets.map(t => t.id === id ? { ...t, status } : t));
      if (selectedTicket?.id === id) {
        setSelectedTicket({ ...selectedTicket, status });
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading && tickets.length === 0) return <div className="p-8 animate-pulse">Loading tickets...</div>;

  return (
    <div className="flex h-[calc(100vh-180px)] bg-white rounded-[32px] shadow-xl border border-dark-100 overflow-hidden">
      
      {/* Tickets List */}
      <div className={`w-full lg:w-96 border-r border-dark-100 flex flex-col ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-6 border-b border-dark-100">
          <h2 className="text-xl font-black text-dark-900 mb-4">Support Tickets</h2>
          <div className="flex gap-2">
            {['', 'open', 'answered', 'resolved'].map(f => (
              <button 
                key={f} 
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${statusFilter === f ? 'bg-indigo-600 text-white' : 'bg-dark-50 text-dark-400 hover:bg-dark-100'}`}
              >
                {f || 'All'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {tickets.length === 0 ? (
            <div className="p-12 text-center text-dark-400">
              <FiMessageSquare size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-bold">No tickets found</p>
            </div>
          ) : (
            tickets.map(t => (
              <button 
                key={t.id} 
                onClick={() => selectTicket(t)}
                className={`w-full p-6 text-left border-b border-dark-50 transition-all hover:bg-dark-50 ${selectedTicket?.id === t.id ? 'bg-indigo-50/50 border-l-4 border-l-indigo-600' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${statusColors[t.status]}`}>
                    {t.status}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${priorityColors[t.priority]}`}>
                    {t.priority}
                  </span>
                </div>
                <h4 className="font-black text-dark-900 text-sm line-clamp-1 mb-1">{t.subject}</h4>
                <p className="text-xs text-dark-400 line-clamp-1 mb-3">{t.last_message}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-dark-100 flex items-center justify-center text-[8px] font-bold">
                      {t.user?.name?.[0]}
                    </div>
                    <span className="text-[10px] font-bold text-dark-600">{t.user?.name}</span>
                  </div>
                  <span className="text-[9px] text-dark-400 font-medium">
                    {new Date(t.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col bg-dark-50/30 ${!selectedTicket ? 'hidden lg:flex items-center justify-center' : 'flex'}`}>
        {!selectedTicket ? (
          <div className="text-center p-12">
            <div className="w-20 h-20 bg-white rounded-[32px] shadow-xl flex items-center justify-center text-indigo-600 mx-auto mb-6">
              <FiMessageSquare size={32} />
            </div>
            <h3 className="text-2xl font-black text-dark-900 mb-2">Support Dashboard</h3>
            <p className="text-dark-400 font-medium">Select a ticket from the left to start responding.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-6 bg-white border-b border-dark-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedTicket(null)} className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-dark-50 text-dark-600">
                  <FiArrowLeft size={20} />
                </button>
                <div>
                  <h3 className="font-black text-dark-900 text-lg leading-tight">{selectedTicket.subject}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-bold text-dark-400 flex items-center gap-1">
                      <FiUser size={12} /> {selectedTicket.user?.name} ({selectedTicket.user?.email})
                    </span>
                    <span className="text-dark-100">•</span>
                    <span className="text-xs font-bold text-dark-400 flex items-center gap-1">
                      <FiCalendar size={12} /> {new Date(selectedTicket.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <select 
                  value={selectedTicket.status} 
                  onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                  className="bg-dark-50 border-none rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-dark-700 outline-none focus:ring-2 ring-indigo-100"
                >
                  <option value="open">Open</option>
                  <option value="answered">Answered</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
              {messages.map((m, i) => (
                <div key={m.id || i} className={`flex ${m.sender_role === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] rounded-[24px] p-5 shadow-sm ${m.sender_role === 'admin' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-dark-800 rounded-tl-none border border-dark-100'}`}>
                    <div className={`text-[9px] font-black uppercase tracking-widest mb-1 opacity-60 ${m.sender_role === 'admin' ? 'text-white' : 'text-dark-400'}`}>
                      {m.sender_role === 'admin' ? 'Support Agent' : selectedTicket.user?.name}
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{m.message}</p>
                    <div className={`text-[8px] mt-2 opacity-50 text-right font-bold`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Reply Input */}
            <div className="p-6 bg-white border-t border-dark-100">
              <form onSubmit={handleReply} className="flex gap-4">
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder="Type your response here..." 
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    className="w-full bg-dark-50 border-2 border-transparent focus:border-indigo-600 rounded-[20px] px-6 py-4 outline-none transition-all font-medium text-dark-800"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={sending || !reply.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 active:scale-95"
                >
                  <FiSend size={24} />
                </button>
              </form>
              <div className="flex items-center gap-4 mt-4">
                <p className="text-[10px] font-black text-dark-400 uppercase tracking-widest">Quick Status:</p>
                <button onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')} className="text-[10px] font-black text-indigo-600 hover:underline uppercase tracking-widest">Mark as Resolved</button>
                <button onClick={() => updateTicketStatus(selectedTicket.id, 'closed')} className="text-[10px] font-black text-red-500 hover:underline uppercase tracking-widest">Close Ticket</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
