'use client';
import { useEffect, useState, Suspense } from 'react';
import { FiUser, FiMail, FiPhone, FiLock, FiLogOut, FiShoppingBag, FiMapPin, FiCreditCard, FiHelpCircle, FiArrowRight, FiShield, FiRefreshCw, FiHeart, FiStar } from 'react-icons/fi';
import useAuthStore from '@/store/authStore';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import SupportSystem from '@/components/SupportSystem';
import { useSearchParams } from 'next/navigation';

function ProfileContent() {
  const searchParams = useSearchParams();
  const preselectedOrder = searchParams.get('order');
  const initialTab = searchParams.get('tab') || 'profile';

  const { user, logout, setAuth, isLoading, fetchUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user && !isLoading) {
      // Maybe try one more fetch if we have a token but no user
      const token = localStorage.getItem('token');
      if (token) fetchUser();
    }
  }, [user, isLoading, fetchUser]);
  
  // Forms
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [bankForm, setBankForm] = useState({ upi_id: '', account_no: '', ifsc: '', bank_name: '' });

  useEffect(() => {
    if (user) {
      setBankForm({
        upi_id: user.upi_id || '',
        account_no: user.bank_details?.account_no || '',
        ifsc: user.bank_details?.ifsc || '',
        bank_name: user.bank_details?.bank_name || '',
      });
    }
  }, [user]);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      await authAPI.changePassword(passwordForm);
      toast.success('Password updated successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.message || 'Failed to update password'); }
    setSaving(false);
  };

  const handleBankUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        upi_id: bankForm.upi_id,
        bank_details: {
          account_no: bankForm.account_no,
          ifsc: bankForm.ifsc,
          bank_name: bankForm.bank_name
        }
      };
      const res = await authAPI.updateProfile(data);
      setAuth(res.data, localStorage.getItem('token'));
      toast.success('Bank details updated successfully!');
    } catch (err) { toast.error(err.message || 'Update failed'); }
    setSaving(false);
  };

  const handleLogout = () => { logout(); window.location.href = '/login'; };

  const inputClass = "w-full border-b border-fk-divider py-2 outline-none focus:border-fk-blue text-sm transition-all placeholder:text-fk-muted bg-transparent font-medium";
  const labelClass = "text-[10px] font-bold text-fk-muted uppercase tracking-wider mb-1 block";

  if (isLoading) return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-10 h-10 border-4 border-fk-blue border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center animate-fk-fade">
      <div className="w-20 h-20 bg-fk-bg rounded-full flex items-center justify-center mb-4"><FiUser size={40} className="text-fk-muted" /></div>
      <h2 className="text-2xl font-bold text-fk-text">Please Login</h2>
      <p className="text-sm text-fk-muted mt-2">Login to see your profile and manage orders</p>
      <button onClick={() => window.location.href = '/login'} className="btn-fk-primary px-12 mt-6">Login Now</button>
    </div>
  );

  return (
    <div className="max-w-[1248px] mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
      
      {/* Sidebar */}
      <div className="w-full md:w-[280px] space-y-4">
        <div className="bg-white p-3 shadow-fk rounded-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-fk-bg rounded-full flex items-center justify-center text-fk-blue font-bold text-xl uppercase">{user.name?.[0]}</div>
          <div><p className="text-xs text-fk-muted">Hello,</p><p className="text-sm font-bold text-fk-text leading-tight">{user.name}</p></div>
        </div>

        <div className="bg-white shadow-fk rounded-sm overflow-hidden">
          <div className="border-b border-fk-divider">
            <button onClick={() => window.location.href = '/orders'} className="w-full px-5 py-4 flex items-center gap-4 text-fk-muted hover:text-fk-blue border-b border-fk-divider transition-all">
              <FiShoppingBag /> <span className="font-bold text-sm uppercase">My Orders</span>
              <FiArrowRight className="ml-auto opacity-30" />
            </button>
            
            <div className="px-5 py-4 flex items-center gap-4 text-fk-blue bg-fk-bg/30">
               <FiUser /> <span className="font-bold text-sm uppercase">Account Settings</span>
            </div>
            <div className="pl-14 pb-2">
               <button onClick={() => setActiveTab('profile')} className={`w-full text-left py-3 text-sm transition-colors font-medium ${activeTab === 'profile' ? 'text-fk-blue font-bold' : 'text-fk-text'}`}>Profile Information</button>
               <button onClick={() => setActiveTab('wishlist')} className={`w-full text-left py-3 text-sm transition-colors font-medium ${activeTab === 'wishlist' ? 'text-fk-blue font-bold' : 'text-fk-text'}`}>My Wishlist</button>
               <button onClick={() => setActiveTab('reviews')} className={`w-full text-left py-3 text-sm transition-colors font-medium ${activeTab === 'reviews' ? 'text-fk-blue font-bold' : 'text-fk-text'}`}>My Reviews</button>
               <button onClick={() => window.location.href = '/addresses'} className="w-full text-left py-3 text-sm text-fk-text transition-colors font-medium hover:text-fk-blue">Manage Addresses</button>
               <button onClick={() => setActiveTab('bank')} className={`w-full text-left py-3 text-sm transition-colors font-medium ${activeTab === 'bank' ? 'text-fk-blue font-bold' : 'text-fk-text'}`}>Bank / UPI Details</button>
               <button onClick={() => setActiveTab('security')} className={`w-full text-left py-3 text-sm transition-colors font-medium ${activeTab === 'security' ? 'text-fk-blue font-bold' : 'text-fk-text'}`}>Change Password</button>
               <button onClick={() => setActiveTab('returns')} className={`w-full text-left py-3 text-sm transition-colors font-medium ${activeTab === 'returns' ? 'text-fk-blue font-bold' : 'text-fk-text'}`}>Returns & Refunds</button>
            </div>

            <button onClick={() => setActiveTab('support')} className={`w-full px-5 py-4 flex items-center gap-4 hover:text-fk-blue border-t border-fk-divider transition-all ${activeTab === 'support' ? 'text-fk-blue bg-fk-bg/30 font-bold' : 'text-fk-muted'}`}>
               <FiHelpCircle /> <span className="font-bold text-sm uppercase">Help Center</span>
            </button>
          </div>
          
          <button onClick={handleLogout} className="w-full px-5 py-4 flex items-center gap-4 text-red-600 hover:bg-fk-bg transition-colors border-t border-fk-divider">
            <FiLogOut /> <span className="font-bold text-sm uppercase">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        
        {activeTab === 'profile' && (
          <div className="bg-white p-8 shadow-fk rounded-sm animate-fk-fade">
            <h2 className="text-lg font-bold text-fk-text mb-8">Personal Information</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              try {
                const res = await authAPI.updateProfile({ name: user.name, phone: user.phone });
                setAuth(res.data, localStorage.getItem('token'));
                toast.success('Profile updated!');
              } catch (err) { toast.error(err.message); }
              setSaving(false);
            }} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-2xl">
               <div>
                 <label className={labelClass}>Full Name</label>
                 <input 
                   value={user.name || ''} 
                   onChange={e => setAuth({ ...user, name: e.target.value }, localStorage.getItem('token'))} 
                   className={inputClass} 
                   placeholder="Enter your full name"
                 />
               </div>
               <div>
                 <label className={labelClass}>Email Address</label>
                 <input value={user.email} disabled className={`${inputClass} bg-slate-50 cursor-not-allowed`} />
               </div>
               <div>
                 <label className={labelClass}>Phone Number</label>
                 <input 
                   value={user.phone || ''} 
                   onChange={e => setAuth({ ...user, phone: e.target.value }, localStorage.getItem('token'))} 
                   className={inputClass} 
                   placeholder="Enter your phone number"
                 />
               </div>
               <div><label className={labelClass}>Account Role</label><input value={user.role?.replace('_', ' ')} disabled className={`${inputClass} uppercase text-[10px] bg-slate-50`} /></div>
               <div className="md:col-span-2 pt-4">
                 <button type="submit" disabled={saving} className="btn-fk-primary px-12 py-3">
                   {saving ? 'Updating...' : 'Save Profile Changes'}
                 </button>
               </div>
            </form>
          </div>
        )}

        {activeTab === 'bank' && (
          <div className="bg-white p-8 shadow-fk rounded-sm animate-fk-fade">
            <h2 className="text-lg font-bold text-fk-text mb-2 flex items-center gap-2"><FiCreditCard className="text-fk-blue" /> Bank & UPI Details</h2>
            <p className="text-xs text-fk-muted mb-8 font-medium italic">Used for refunds and seller payouts.</p>
            <form onSubmit={handleBankUpdate} className="space-y-8 max-w-2xl">
               <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-3">
                 <FiShield className="text-fk-blue" />
                 <p className="text-[10px] font-bold text-blue-700 uppercase">Your financial data is encrypted and secure.</p>
               </div>
               
               <div>
                 <label className={labelClass}>UPI ID (for instant refunds)</label>
                 <input placeholder="username@upi" className={inputClass} value={bankForm.upi_id} onChange={e => setBankForm({...bankForm, upi_id: e.target.value})} />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div><label className={labelClass}>Bank Name</label><input placeholder="e.g. HDFC Bank" className={inputClass} value={bankForm.bank_name} onChange={e => setBankForm({...bankForm, bank_name: e.target.value})} /></div>
                 <div><label className={labelClass}>Account Number</label><input placeholder="XXXX XXXX XXXX" className={inputClass} value={bankForm.account_no} onChange={e => setBankForm({...bankForm, account_no: e.target.value})} /></div>
                 <div><label className={labelClass}>IFSC Code</label><input placeholder="HDFC0001234" className={inputClass} value={bankForm.ifsc} onChange={e => setBankForm({...bankForm, ifsc: e.target.value})} /></div>
               </div>

               <button type="submit" disabled={saving} className="btn-fk-primary px-12 py-3 mt-4">{saving ? 'Saving...' : 'Save Bank Details'}</button>
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white p-8 shadow-fk rounded-sm animate-fk-fade">
            <h2 className="text-lg font-bold text-fk-text mb-8 flex items-center gap-2"><FiLock className="text-fk-blue" /> Change Password</h2>
            <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-2xl">
               <div><label className={labelClass}>Current Password</label><input type="password" className={inputClass} value={passwordForm.currentPassword} onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})} required /></div>
               <div className="hidden md:block"></div>
               <div><label className={labelClass}>New Password</label><input type="password" className={inputClass} value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})} required /></div>
               <div><label className={labelClass}>Confirm New Password</label><input type="password" className={inputClass} value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} required /></div>
               <div className="md:col-span-2 pt-4"><button type="submit" disabled={saving} className="btn-fk-primary px-12 py-3">{saving ? 'Updating...' : 'Update Password'}</button></div>
            </form>
          </div>
        )}

        {activeTab === 'support' && (
          <div className="bg-white p-4 md:p-8 shadow-fk rounded-sm animate-fk-fade">
            <h2 className="text-lg font-bold text-fk-text mb-6 flex items-center gap-2"><FiHelpCircle className="text-fk-blue" /> Customer Support</h2>
            <SupportSystem preselectedOrder={preselectedOrder} />
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div className="bg-white p-8 shadow-fk rounded-sm animate-fk-fade">
             <h2 className="text-lg font-bold text-fk-text mb-6 flex items-center gap-2"><FiHeart className="text-fk-blue" /> My Wishlist</h2>
             <div className="p-12 text-center border-2 border-dashed border-fk-divider rounded-2xl">
                <div className="w-16 h-16 bg-fk-bg rounded-full flex items-center justify-center mx-auto mb-4 text-fk-muted"><FiHeart size={32} /></div>
                <h3 className="text-lg font-bold text-fk-text">Your wishlist is empty</h3>
                <p className="text-sm text-fk-muted mt-2 mb-8 max-w-sm mx-auto">Save your favorite products here so you can find them easily later.</p>
                <button onClick={() => window.location.href = '/products'} className="btn-fk-primary px-10">Browse Products</button>
             </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white p-8 shadow-fk rounded-sm animate-fk-fade">
             <h2 className="text-lg font-bold text-fk-text mb-6 flex items-center gap-2"><FiStar className="text-fk-blue" /> My Reviews</h2>
             <div className="p-12 text-center border-2 border-dashed border-fk-divider rounded-2xl">
                <div className="w-16 h-16 bg-fk-bg rounded-full flex items-center justify-center mx-auto mb-4 text-fk-muted"><FiStar size={32} /></div>
                <h3 className="text-lg font-bold text-fk-text">No reviews yet</h3>
                <p className="text-sm text-fk-muted mt-2 mb-8 max-w-sm mx-auto">Share your experience with products you've purchased to help other customers.</p>
                <button onClick={() => window.location.href = '/orders'} className="btn-fk-primary px-10">View Orders to Review</button>
             </div>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="bg-white p-8 shadow-fk rounded-sm animate-fk-fade">
             <h2 className="text-lg font-bold text-fk-text mb-6 flex items-center gap-2"><FiRefreshCw className="text-fk-blue" /> Returns & Refunds</h2>
             <div className="p-12 text-center border-2 border-dashed border-fk-divider rounded-2xl">
                <div className="w-16 h-16 bg-fk-bg rounded-full flex items-center justify-center mx-auto mb-4 text-fk-muted"><FiRefreshCw size={32} /></div>
                <h3 className="text-lg font-bold text-fk-text">Manage your returns</h3>
                <p className="text-sm text-fk-muted mt-2 mb-8 max-w-sm mx-auto">To initiate a return, go to your 'My Orders' section and select the delivered order you wish to return.</p>
                <button onClick={() => window.location.href = '/orders'} className="btn-fk-primary px-10">Go to My Orders</button>
             </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center p-6"><div className="w-10 h-10 border-4 border-fk-blue border-t-transparent rounded-full animate-spin"></div></div>}>
      <ProfileContent />
    </Suspense>
  );
}
