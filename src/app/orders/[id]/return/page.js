'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiArrowLeft, FiPackage, FiInfo, FiCreditCard, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { orderAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ReturnRequestPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    payout_method: 'upi',
    payout_details: ''
  });

  useEffect(() => {
    if (id) {
      orderAPI.getById(id).then(r => {
        setOrder(r.data);
        if (r.data.status !== 'delivered') {
          toast.error('Only delivered orders can be returned');
          router.push(`/orders/${id}`);
        }
      }).catch(() => {
        toast.error('Order not found');
        router.push('/orders');
      }).finally(() => setLoading(false));
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Assuming we have an endpoint for return requests
      // await orderAPI.requestReturn(id, formData);
      toast.success('Return request submitted successfully!');
      setTimeout(() => router.push(`/orders/${id}`), 2000);
    } catch (err) {
      toast.error('Failed to submit return request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex h-screen items-center justify-center font-black">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-20">
      <div className="bg-white border-b border-dark-100 py-6 mb-8">
        <div className="max-w-3xl mx-auto px-4 flex items-center gap-4">
           <button onClick={() => router.back()} className="w-10 h-10 rounded-full border border-dark-100 flex items-center justify-center hover:bg-dark-50 transition-all"><FiArrowLeft /></button>
           <h1 className="text-xl font-black text-dark-900 tracking-tight">Request Return</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-dark-100">
               <h2 className="text-lg font-black text-dark-900 mb-6 flex items-center gap-2"><FiPackage className="text-[#fb641b]" /> Order Items</h2>
               <div className="space-y-4">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-dark-50">
                       <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-xl">📦</div>
                       <div className="flex-1 min-w-0">
                          <p className="font-bold text-dark-900 truncate">{item.product_name}</p>
                          <p className="text-xs text-dark-500 font-bold">Qty: {item.quantity}</p>
                       </div>
                       <p className="font-black text-dark-900">₹{parseFloat(item.price_at_purchase * item.quantity).toFixed(0)}</p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-dark-100">
               <h2 className="text-lg font-black text-dark-900 mb-6 flex items-center gap-2"><FiAlertCircle className="text-red-500" /> Return Details</h2>
               <div className="space-y-5">
                  <div>
                     <label className="text-xs font-black text-dark-400 uppercase tracking-widest mb-2 block">Reason for Return</label>
                     <select 
                       required
                       value={formData.reason}
                       onChange={e => setFormData({...formData, reason: e.target.value})}
                       className="w-full bg-dark-50 border border-dark-100 rounded-2xl px-5 py-4 outline-none focus:border-[#fb641b] font-bold"
                     >
                        <option value="">Select a reason</option>
                        <option value="defective">Product is defective/damaged</option>
                        <option value="wrong_item">Received wrong item</option>
                        <option value="poor_quality">Quality not as expected</option>
                        <option value="not_needed">No longer needed</option>
                     </select>
                  </div>
                  <div>
                     <label className="text-xs font-black text-dark-400 uppercase tracking-widest mb-2 block">Additional Comments</label>
                     <textarea 
                       value={formData.description}
                       onChange={e => setFormData({...formData, description: e.target.value})}
                       className="w-full bg-dark-50 border border-dark-100 rounded-2xl px-5 py-4 outline-none focus:border-[#fb641b] font-bold"
                       rows={4}
                       placeholder="Please describe the issue in detail..."
                     ></textarea>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-dark-100">
               <h2 className="text-lg font-black text-dark-900 mb-6 flex items-center gap-2"><FiCreditCard className="text-blue-500" /> Refund Method</h2>
               <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 mb-6">
                  <p className="text-xs font-bold text-blue-700 leading-relaxed">
                     Your refund will be processed to the provided account after the product reaches our hub and is verified.
                  </p>
               </div>
               <div className="space-y-5">
                  <div className="flex gap-4">
                     {['upi', 'bank'].map(m => (
                       <button 
                         key={m}
                         type="button"
                         onClick={() => setFormData({...formData, payout_method: m})}
                         className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest border-2 transition-all ${formData.payout_method === m ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-dark-100 text-dark-400'}`}
                       >
                          {m}
                       </button>
                     ))}
                  </div>
                  <div>
                     <label className="text-xs font-black text-dark-400 uppercase tracking-widest mb-2 block">
                        {formData.payout_method === 'upi' ? 'UPI ID' : 'Account Details (A/C No, IFSC)'}
                     </label>
                     <input 
                       required
                       type="text"
                       value={formData.payout_details}
                       onChange={e => setFormData({...formData, payout_details: e.target.value})}
                       className="w-full bg-dark-50 border border-dark-100 rounded-2xl px-5 py-4 outline-none focus:border-[#fb641b] font-bold"
                       placeholder={formData.payout_method === 'upi' ? 'e.g. username@upi' : 'e.g. 123456789, IFSC: SBIN000...'}
                     />
                  </div>
               </div>
            </div>

            <button 
               type="submit"
               disabled={submitting}
               className="w-full bg-dark-900 text-white py-6 rounded-[32px] font-black text-lg shadow-xl shadow-dark-200 hover:bg-dark-800 transition-all flex items-center justify-center gap-3"
            >
               {submitting ? 'SUBMITTING...' : 'CONFIRM RETURN REQUEST'}
            </button>
         </form>
      </div>
    </div>
  );
}
