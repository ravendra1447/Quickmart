'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { subscriptionAPI } from '@/lib/api';
import { FiCheckCircle, FiClock, FiAlertCircle, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function SubscriptionPage() {
  const [status, setStatus] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentData, setPaymentData] = useState({
    method: 'upi',
    upi_id: '',
    payment_reference: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statusRes, plansRes] = await Promise.all([
        subscriptionAPI.getStatus(),
        subscriptionAPI.getPlans()
      ]);
      setStatus(statusRes);
      setPlans(plansRes);
    } catch (err) {
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    try {
      setPurchasing(selectedPlan.id);
      const res = await subscriptionAPI.purchasePlan({
        plan_id: selectedPlan.id,
        payment_method: paymentData.method,
        upi_id: paymentData.upi_id,
        payment_reference: paymentData.payment_reference
      });
      toast.success(res.message);
      setShowPaymentModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) return <div className="animate-pulse space-y-6">
    <div className="h-32 bg-dark-100 rounded-2xl"></div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => <div key={i} className="h-96 bg-dark-100 rounded-2xl"></div>)}
    </div>
  </div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Compact Status Card */}
      <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-center gap-4 ${
        status?.subscription_status === 'active' 
          ? 'bg-white border-green-100' 
          : 'bg-white border-red-100'
      }`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
          status?.subscription_status === 'active' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {status?.subscription_status === 'active' ? <FiCheckCircle /> : <FiAlertCircle />}
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl font-black text-dark-900">
            {status?.subscription_status === 'active' ? 'Status: Active' : 'Status: Inactive'}
          </h2>
          <p className="text-xs text-dark-500 font-bold">
            {status?.subscription_status === 'active' 
              ? `Validity: ${new Date(status.validity_expiry).toLocaleDateString()}`
              : 'Please recharge to continue selling.'}
          </p>
        </div>

        {status?.plan && (
          <div className="px-4 py-2 bg-dark-50 rounded-xl border border-dark-100">
            <p className="text-[9px] font-black text-dark-400 uppercase tracking-wider mb-0.5">Plan</p>
            <p className="text-sm font-black text-dark-900">{status.plan.name}</p>
          </div>
        )}
      </div>

      <div className="space-y-1 text-center md:text-left">
        <h1 className="text-2xl font-black text-dark-900">Subscription Plans</h1>
        <p className="text-dark-400 font-bold text-sm">Choose a plan that fits your business.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <div key={plan.id} className={`p-6 rounded-2xl border transition-all flex flex-col ${
            status?.plan?.id === plan.id ? 'border-indigo-600 bg-white ring-2 ring-indigo-50' : 'border-dark-100 bg-white'
          }`}>
            <div className="mb-4">
              <h3 className="text-lg font-black text-dark-900 mb-1">{plan.name}</h3>
              <p className="text-dark-400 font-bold text-xs line-clamp-2">{plan.description}</p>
            </div>

            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-3xl font-black text-dark-900 tracking-tight">₹{plan.price}</span>
              <span className="text-dark-400 font-bold text-[10px]">/ {plan.duration_months} mo</span>
            </div>

            <div className="flex-grow space-y-2 mb-8">
              {(plan.features || ['Full Dashboard', 'Order Tracking', 'Support']).map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-dark-600 font-bold text-xs">
                  <FiCheckCircle className="text-green-500 text-[10px] shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            <button
              onClick={() => { setSelectedPlan(plan); setShowPaymentModal(true); }}
              disabled={status?.plan?.id === plan.id}
              className={`w-full py-3 rounded-xl font-black text-sm transition-all ${
                status?.plan?.id === plan.id
                  ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
                  : 'bg-black text-white hover:bg-zinc-800 active:scale-95'
              }`}
            >
              {status?.plan?.id === plan.id ? 'Active' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>

      {/* Compact History */}
      {status?.history?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-zinc-100">
          <h2 className="text-xl font-black text-dark-900 mb-4">Payment History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[500px]">
              <thead>
                <tr className="text-zinc-400 text-[9px] font-black uppercase tracking-widest border-b border-zinc-100">
                  <th className="pb-3">Plan</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">Reference</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {status.history.map((h) => (
                  <tr key={h.id}>
                    <td className="py-3 font-black text-dark-900 text-sm">{h.plan_name}</td>
                    <td className="py-3 font-black text-dark-900 text-sm">₹{h.amount_paid}</td>
                    <td className="py-3">
                      <p className="text-[8px] font-black text-zinc-400 uppercase">{h.payment_method}</p>
                      <p className="text-[10px] font-bold text-zinc-600 truncate max-w-[100px]">{h.payment_reference || 'N/A'}</p>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                        h.payment_status === 'completed' ? 'bg-green-50 text-green-600' : 
                        h.payment_status === 'pending' ? 'bg-amber-50 text-amber-600' : 
                        'bg-red-50 text-red-600'
                      }`}>
                        {h.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Compact Modal */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-dark-900">Checkout</h2>
                <p className="text-xs text-zinc-400 font-bold">{selectedPlan.name}</p>
              </div>
              <p className="text-2xl font-black text-indigo-600">₹{selectedPlan.price}</p>
            </div>

            <form onSubmit={handlePurchase} className="p-6 space-y-4">
              <div className="flex p-1 bg-zinc-50 rounded-xl">
                {['upi', 'cash'].map((m) => (
                  <button key={m} type="button" onClick={() => setPaymentData({ ...paymentData, method: m })}
                    className={`flex-1 py-2 rounded-lg font-black text-[10px] uppercase transition-all ${paymentData.method === m ? 'bg-white text-indigo-600 shadow-sm' : 'text-zinc-400'}`}>
                    {m}
                  </button>
                ))}
              </div>

              {paymentData.method === 'upi' ? (
                <div className="space-y-4">
                  <div className="bg-indigo-50 p-4 rounded-2xl flex items-center gap-4">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=quickmart@upi&pn=QuickMart&am=${selectedPlan.price}&cu=INR`} 
                      alt="QR" className="w-16 h-16 bg-white p-1.5 rounded-lg shadow-sm" />
                    <div>
                      <p className="text-[9px] font-black text-indigo-600 uppercase">Scan to Pay</p>
                      <p className="text-sm font-black text-dark-900">quickmart@upi</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest ml-1">TXN ID</label>
                    <input required type="text" value={paymentData.payment_reference} onChange={e => setPaymentData({ ...paymentData, payment_reference: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-100 focus:border-indigo-600 outline-none font-bold text-sm" placeholder="12 digit number" />
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 text-center space-y-3">
                  <FiClock className="text-2xl text-amber-600 mx-auto" />
                  <p className="text-[10px] font-bold text-amber-900">Enter your receipt number for cash payment.</p>
                  <input type="text" value={paymentData.payment_reference} onChange={e => setPaymentData({ ...paymentData, payment_reference: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-amber-200 outline-none font-bold text-sm text-amber-900" placeholder="Receipt #" />
                </div>
              )}

              <div className="flex flex-col gap-2 pt-2">
                <button type="submit" disabled={purchasing} className="w-full py-3.5 bg-black text-white rounded-xl font-black text-sm hover:bg-zinc-900 transition-all">
                  {purchasing ? 'Confirming...' : 'Confirm Payment'}
                </button>
                <button type="button" onClick={() => setShowPaymentModal(false)} className="w-full py-2 text-zinc-400 font-bold text-xs">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Compact Footer Support */}
      <div className="bg-black rounded-xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-center md:text-left">
          <h3 className="text-lg font-black leading-tight">Need Help?</h3>
          <p className="text-zinc-400 font-bold text-[10px]">Contact our support for custom plans.</p>
        </div>
        <button className="px-5 py-2 bg-white text-black rounded-lg font-black text-[10px] hover:bg-zinc-200 transition-all active:scale-95">
          Support
        </button>
      </div>
    </div>
  );
}
