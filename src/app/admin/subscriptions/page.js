'use client';
import { useState, useEffect } from 'react';
import { subscriptionAPI } from '@/lib/api';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminSubscriptionsPage() {
  const [activeTab, setActiveTab] = useState('plans'); // plans, history
  const [plans, setPlans] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', compare_at_price: '', duration_months: 1, features: []
  });
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    if (activeTab === 'plans') fetchPlans();
    if (activeTab === 'history') fetchHistory();
  }, [activeTab]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await subscriptionAPI.getAdminPlans();
      setPlans(res);
    } catch (err) {
      toast.error(err.message || 'Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await subscriptionAPI.getSellerSubscriptions();
      setHistory(res);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setFormData({ ...formData, features: [...(formData.features || []), newFeature.trim()] });
    setNewFeature('');
  };

  const removeFeature = (index) => {
    const updatedFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: updatedFeatures });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await subscriptionAPI.updatePlan(editingPlan.id, formData);
        toast.success('Plan updated successfully');
      } else {
        await subscriptionAPI.createPlan(formData);
        toast.success('Plan created successfully');
      }
      setShowModal(false);
      fetchPlans();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    try {
      await subscriptionAPI.deletePlan(id);
      toast.success('Plan deleted');
      fetchPlans();
    } catch (err) {
      toast.error('Failed to delete plan');
    }
  };

  return (
    <div className="min-h-screen -m-8 p-8 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto space-y-10 pb-20">
        <div className="space-y-2">
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600 tracking-tight">
            Subscription Center
          </h1>
          <p className="text-dark-500 font-bold text-lg">Design premium growth paths for your seller community</p>
        </div>

        {/* Tabs & Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/70 backdrop-blur-2xl p-5 rounded-[40px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] border border-white/50">
          <div className="flex p-1.5 bg-dark-100/50 rounded-2xl w-full md:w-fit">
            <button onClick={() => setActiveTab('plans')} className={`px-10 py-3.5 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeTab === 'plans' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100' : 'text-dark-400 hover:bg-dark-100'}`}>
              Manage Plans
            </button>
            <button onClick={() => setActiveTab('history')} className={`px-10 py-3.5 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeTab === 'history' ? 'bg-white text-indigo-600 shadow-xl shadow-indigo-100' : 'text-dark-400 hover:bg-dark-100'}`}>
              Revenue History
            </button>
          </div>

          {activeTab === 'plans' && (
            <button
              onClick={() => { setEditingPlan(null); setFormData({ name: '', description: '', price: '', compare_at_price: '', duration_months: 1, features: [] }); setShowModal(true); }}
              className="flex items-center justify-center gap-3 px-10 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-2xl font-black shadow-2xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all w-full md:w-fit"
            >
              <FiPlus className="text-xl" /> Create New Plan
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => <div key={i} className="h-[500px] bg-white/50 rounded-[48px] animate-pulse"></div>)}
          </div>
        ) : activeTab === 'plans' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-white p-10 rounded-[56px] border border-white shadow-[0_40px_100px_-20px_rgba(79,70,229,0.08)] hover:shadow-[0_40px_100px_-20px_rgba(79,70,229,0.15)] transition-all duration-500 group relative overflow-hidden flex flex-col h-full">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-full -mr-20 -mt-20 group-hover:scale-150 transition-transform duration-700"></div>

                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-between items-start mb-8">
                      <div className="px-5 py-2 bg-indigo-50 text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest w-fit">
                        {plan.duration_months} Months Access
                      </div>
                      <button onClick={() => { setEditingPlan(plan); setFormData({ ...plan, features: plan.features || [] }); setShowModal(true); }}
                        className="p-4 bg-dark-50 text-dark-400 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                        <FiEdit2 className="text-lg" />
                      </button>
                    </div>

                    <h3 className="text-3xl font-black text-dark-900 leading-tight mb-4">{plan.name}</h3>

                    <div className="flex items-center gap-3 mb-8">
                      <span className="text-5xl font-black text-dark-900 tracking-tighter">₹{plan.price}</span>
                      {plan.compare_at_price && parseFloat(plan.compare_at_price) > 0 && (
                        <div className="flex flex-col">
                          <span className="text-lg text-dark-300 line-through font-bold">₹{plan.compare_at_price}</span>
                          <span className="text-[10px] font-black text-green-600 uppercase tracking-tighter">
                            Save {Math.round(((plan.compare_at_price - plan.price) / plan.compare_at_price) * 100)}% OFF
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-grow space-y-6 mb-10">
                      <p className="text-dark-500 font-bold text-sm leading-relaxed">{plan.description}</p>
                      <div className="space-y-4 pt-6 border-t border-dark-50">
                        {(plan.features || []).map((f, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-dark-700 font-bold text-sm">
                            <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <FiCheck className="text-white text-[10px]" />
                            </div>
                            {f}
                          </div>
                        ))}
                        {(!plan.features || plan.features.length === 0) && (
                          <p className="text-dark-300 italic text-xs">Edit plan to add exclusive benefits</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-dark-50 flex items-center gap-3 text-[10px] font-black text-dark-400 uppercase tracking-widest">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      Available for all Sellers
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {plans.length === 0 && (
              <div className="py-20 text-center space-y-4">
                <div className="w-24 h-24 bg-dark-50 rounded-full flex items-center justify-center mx-auto">
                  <FiInfo className="text-3xl text-dark-200" />
                </div>
                <p className="text-dark-400 font-black text-xl">No active subscription plans found</p>
              </div>
            )}
          </>
        ) : (
          <div className="bg-white rounded-[40px] overflow-hidden border-2 border-dark-50 shadow-2xl shadow-dark-100/20 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-dark-50/50 text-dark-400 text-[11px] font-black uppercase tracking-[0.2em]">
                  <th className="px-10 py-6">Seller Identity</th>
                  <th className="px-10 py-6">Plan & Method</th>
                  <th className="px-10 py-6">Payment Proof</th>
                  <th className="px-10 py-6">Revenue</th>
                  <th className="px-10 py-6">Status & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-50">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-indigo-50/30 transition-all group">
                    <td className="px-10 py-8">
                      <p className="font-black text-dark-900 text-lg">{h.seller?.user?.name}</p>
                      <p className="text-sm text-dark-400 font-bold">{h.seller?.user?.email}</p>
                    </td>
                    <td className="px-10 py-8">
                      <div className="space-y-2">
                        <div className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-wider w-fit">
                          {h.plan_name}
                        </div>
                        <p className="text-[10px] font-black text-dark-400 uppercase">Paid via {h.payment_method}</p>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      {h.payment_method === 'upi' ? (
                        <div className="space-y-1">
                          <p className="text-xs font-black text-dark-900">UPI: {h.upi_id || 'N/A'}</p>
                          <p className="text-[10px] font-bold text-indigo-600">TXN: {h.payment_reference || 'N/A'}</p>
                        </div>
                      ) : (
                        <p className="text-xs font-black text-dark-900">Manual Cash Payment</p>
                      )}
                    </td>
                    <td className="px-10 py-8">
                      <p className="text-xl font-black text-dark-900 tracking-tighter">₹{h.amount_paid}</p>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-4">
                        <span className={`px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-sm ${
                          h.payment_status === 'completed' ? 'bg-green-500/10 text-green-600' : 
                          h.payment_status === 'pending' ? 'bg-amber-500/10 text-amber-600' : 
                          'bg-red-500/10 text-red-600'
                        }`}>
                          {h.payment_status}
                        </span>
                        
                        {h.payment_status === 'pending' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={async () => {
                                if(confirm('Approve this payment? Plan will activate immediately.')) {
                                  await subscriptionAPI.approveSubscription(h.id);
                                  toast.success('Subscription activated!');
                                  fetchHistory();
                                }
                              }}
                              className="p-3 bg-green-500 text-white rounded-xl hover:scale-110 transition-all shadow-lg shadow-green-100"
                            >
                              <FiCheck />
                            </button>
                            <button 
                              onClick={async () => {
                                if(confirm('Reject this payment?')) {
                                  await subscriptionAPI.rejectSubscription(h.id);
                                  toast.error('Subscription rejected');
                                  fetchHistory();
                                }
                              }}
                              className="p-3 bg-red-500 text-white rounded-xl hover:scale-110 transition-all shadow-lg shadow-red-100"
                            >
                              <FiX />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {history.length === 0 && (
              <div className="px-10 py-32 text-center">
                <div className="w-20 h-20 bg-dark-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FiInfo className="text-2xl text-dark-200" />
                </div>
                <p className="text-dark-400 font-black text-2xl tracking-tight">Financial history is currently empty</p>
              </div>
            )}
          </div>
        )}

        {/* Premium Modal */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-dark-900/80 backdrop-blur-md overflow-y-auto">
            <div className="bg-white w-full max-w-2xl rounded-[48px] shadow-[0_100px_150px_-50px_rgba(0,0,0,0.5)] animate-in zoom-in duration-300 relative my-auto border-8 border-indigo-50/50">
              <div className="p-10 border-b border-dark-50 flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black text-dark-900 tracking-tight">{editingPlan ? 'Refine Plan' : 'Forge New Plan'}</h2>
                  <p className="text-dark-400 font-bold text-sm">Define value and features for your sellers</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-4 hover:bg-red-50 hover:text-red-600 text-dark-400 rounded-[24px] transition-all"><FiX className="text-xl" /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2 col-span-full">
                    <label className="text-[11px] font-black text-dark-400 uppercase tracking-[0.2em] ml-2">Plan Name</label>
                    <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-8 py-5 rounded-[24px] border-2 border-dark-50 focus:border-indigo-600 outline-none transition-all font-black text-lg shadow-sm" placeholder="e.g. ULTRA GROWTH" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-dark-400 uppercase tracking-[0.2em] ml-2">Selling Price (₹)</label>
                    <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-8 py-5 rounded-[24px] border-2 border-dark-50 focus:border-indigo-600 outline-none transition-all font-black text-lg shadow-sm" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-dark-400 uppercase tracking-[0.2em] ml-2">Original Price (₹)</label>
                    <input type="number" value={formData.compare_at_price} onChange={e => setFormData({ ...formData, compare_at_price: e.target.value })}
                      className="w-full px-8 py-5 rounded-[24px] border-2 border-dark-50 focus:border-indigo-600 outline-none transition-all font-black text-lg shadow-sm text-dark-300" placeholder="0" />
                  </div>

                  <div className="space-y-2 col-span-full">
                    <label className="text-[11px] font-black text-dark-400 uppercase tracking-[0.2em] ml-2">Duration Period</label>
                    <select value={formData.duration_months} onChange={e => setFormData({ ...formData, duration_months: e.target.value })}
                      className="w-full px-8 py-5 rounded-[24px] border-2 border-dark-50 focus:border-indigo-600 outline-none transition-all font-black text-lg appearance-none shadow-sm cursor-pointer">
                      <option value={1}>1 Month (Standard)</option>
                      <option value={6}>6 Months (Value Pack)</option>
                      <option value={12}>12 Months (Best Deal)</option>
                    </select>
                  </div>

                  <div className="space-y-4 col-span-full">
                    <label className="text-[11px] font-black text-dark-400 uppercase tracking-[0.2em] ml-2">Plan Benefits & Features</label>
                    <div className="flex gap-3">
                      <input type="text" value={newFeature} onChange={e => setNewFeature(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                        className="flex-1 px-8 py-5 rounded-[24px] border-2 border-dark-50 focus:border-indigo-600 outline-none transition-all font-bold text-sm shadow-sm" placeholder="Add a benefit... e.g. Zero Commission" />
                      <button type="button" onClick={addFeature} className="px-8 bg-indigo-50 text-indigo-600 rounded-[24px] font-black hover:bg-indigo-600 hover:text-white transition-all">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {(formData.features || []).map((f, i) => (
                        <div key={i} className="flex items-center gap-2 px-5 py-3 bg-indigo-50 text-indigo-600 rounded-2xl text-xs font-black group">
                          {f} <button type="button" onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-600"><FiX /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 col-span-full">
                    <label className="text-[11px] font-black text-dark-400 uppercase tracking-[0.2em] ml-2">Description</label>
                    <textarea required rows={3} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-8 py-5 rounded-[24px] border-2 border-dark-50 focus:border-indigo-600 outline-none transition-all font-bold text-sm shadow-sm resize-none" placeholder="Elaborate on the value proposition..."></textarea>
                  </div>
                </div>

                <button type="submit" className="w-full py-6 bg-indigo-600 text-white rounded-[32px] font-black text-xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3">
                  {editingPlan ? 'Update Plan Configuration' : 'Release Subscription Plan'} <FiCheck className="text-2xl" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

