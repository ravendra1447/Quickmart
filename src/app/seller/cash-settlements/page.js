'use client';
import { useState, useEffect } from 'react';
import { sellerAPI } from '@/lib/api';
import { FiDollarSign, FiCheck, FiX, FiClock, FiUser, FiCalendar } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function CashSettlementsPage() {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    fetchSettlements();
  }, []);

  const fetchSettlements = async () => {
    try {
      setLoading(true);
      const res = await sellerAPI.getCashSettlements();
      setSettlements(Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []));
    } catch (err) {
      toast.error('Failed to load settlements');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    if (!confirm('Are you sure you have received this cash amount?')) return;
    try {
      setConfirming(true);
      await sellerAPI.confirmCashSettlement(id);
      toast.success('Cash settlement confirmed! 💰');
      fetchSettlements();
    } catch (err) {
      toast.error(err.message || 'Failed to confirm settlement');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return (
    <div className="space-y-4 animate-pulse p-4">
      <div className="h-10 bg-slate-100 rounded-xl w-1/4 mb-8"></div>
      {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-50 rounded-2xl"></div>)}
    </div>
  );

  return (
    <div className="animate-fade-in max-w-5xl">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-dark-900 tracking-tight">Cash Settlements</h1>
        <p className="text-dark-500 font-medium mt-1">Confirm cash collections from your delivery partners</p>
      </div>

      <div className="grid gap-6">
        {settlements.length === 0 ? (
          <div className="bg-white rounded-[32px] p-16 text-center shadow-sm border border-slate-100">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                <FiDollarSign size={40} />
             </div>
             <h3 className="text-xl font-black text-dark-900">No settlement requests</h3>
             <p className="text-dark-400 font-medium mt-2">Pending cash collections will appear here.</p>
          </div>
        ) : (
          settlements.map((s) => (
            <div key={s.id} className={`bg-white rounded-3xl p-6 shadow-sm border transition-all ${s.status === 'pending' ? 'border-orange-200 ring-4 ring-orange-50' : 'border-slate-100'}`}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6 flex-1">
                   <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${s.status === 'confirmed' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                      <FiDollarSign />
                   </div>
                   <div>
                      <div className="flex items-center gap-3 mb-1">
                         <span className="text-2xl font-black text-dark-900 tracking-tighter">₹{s.amount}</span>
                         <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${s.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700 animate-pulse'}`}>
                            {s.status}
                         </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-dark-400">
                         <div className="flex items-center gap-1.5"><FiUser /> {s.deliveryPartner?.name || 'Partner'}</div>
                         <div className="flex items-center gap-1.5"><FiCalendar /> {new Date(s.createdAt).toLocaleDateString()}</div>
                         <div className="flex items-center gap-1.5"><FiClock /> {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                      {s.notes && <p className="mt-3 text-xs italic text-dark-400 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 inline-block">"{s.notes}"</p>}
                   </div>
                </div>

                <div className="w-full md:w-auto">
                  {s.status === 'pending' ? (
                    <button 
                      onClick={() => handleConfirm(s.id)}
                      disabled={confirming}
                      className="w-full md:w-auto px-8 py-4 bg-orange-500 text-white font-black rounded-2xl shadow-xl shadow-orange-100 hover:bg-orange-600 transition-all flex items-center justify-center gap-3"
                    >
                      <FiCheck size={20} /> Received Cash
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 text-green-600 font-black text-xs uppercase tracking-widest bg-green-50 px-4 py-3 rounded-2xl border border-green-100">
                      <FiCheck /> Settled & Credited
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-12 p-8 bg-blue-50/50 rounded-[32px] border border-blue-100 flex items-start gap-4">
         <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 flex-shrink-0 mt-1">
            <FiClock size={20} />
         </div>
         <div>
            <h4 className="font-black text-dark-900 tracking-tight">How it works?</h4>
            <p className="text-sm text-dark-500 font-medium leading-relaxed mt-1">
              When a delivery boy collects cash from a customer, it appears in their "Cash in Hand". 
              Once they hand over the cash to you physically, you must click **"Received Cash"** here to settle the balance. 
              This will update your store earnings and clear the partner's liability.
            </p>
         </div>
      </div>
    </div>
  );
}
