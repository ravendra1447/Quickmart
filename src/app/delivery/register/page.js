'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiTruck, FiUser, FiMail, FiPhone, FiLock, FiMapPin, FiBriefcase, FiCreditCard } from 'react-icons/fi';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';

export default function DeliveryRegister() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    vehicle_type: 'bike',
    vehicle_number: '',
    city: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Step 1: Register User as delivery_partner
      const regData = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        role: 'delivery_partner'
      };
      
      const res = await authAPI.register(regData);
      
      // Step 2: (Optional) We could call another API to save vehicle details 
      // but for now let's assume the backend handles it or we'll add it later
      
      toast.success('Registration successful! Please login to continue.');
      router.push('/login');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    }
    setLoading(false);
  };

  const inputClass = "w-full border-b border-fk-divider py-3 outline-none focus:border-fk-blue text-sm transition-all placeholder:text-fk-muted bg-transparent font-medium";
  const labelClass = "text-[10px] font-black text-fk-muted uppercase tracking-widest mb-1 block";

  return (
    <div className="min-h-screen bg-fk-bg flex items-center justify-center p-4 pt-28">
      <div className="max-w-[900px] w-full bg-white rounded-sm shadow-fk-high overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Information */}
        <div className="bg-[#172337] w-full md:w-[35%] p-10 flex flex-col justify-between text-white">
          <div>
            <h2 className="text-3xl font-bold mb-4">Join Our Delivery Fleet</h2>
            <p className="text-lg opacity-80 leading-relaxed font-medium">Earn money by delivering orders in your city. Work on your own schedule.</p>
          </div>
          <div className="space-y-6 mt-10">
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><FiTruck /></div>
                <p className="text-sm font-bold">Flexible Timing</p>
             </div>
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><FiCreditCard /></div>
                <p className="text-sm font-bold">Weekly Payments</p>
             </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-[65%] p-10 py-12">
          <h2 className="text-2xl font-black text-[#212121] mb-8">Delivery Partner Registration</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div>
                <label className={labelClass}>Full Name</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className={inputClass} placeholder="Enter your name" required />
              </div>
              <div>
                <label className={labelClass}>Email Address</label>
                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className={inputClass} placeholder="email@example.com" required />
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className={inputClass} placeholder="10-digit mobile" required />
              </div>
              <div>
                <label className={labelClass}>Password</label>
                <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className={inputClass} placeholder="Create a password" required />
              </div>
              <div>
                <label className={labelClass}>Vehicle Type</label>
                <select value={form.vehicle_type} onChange={e => setForm({...form, vehicle_type: e.target.value})} className={inputClass}>
                  <option value="bike">Bike</option>
                  <option value="scooter">Scooter</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="walk">On Foot</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Vehicle Number</label>
                <input value={form.vehicle_number} onChange={e => setForm({...form, vehicle_number: e.target.value})} className={inputClass} placeholder="e.g. UP 32 XX 0000" />
              </div>
            </div>

            <p className="text-[10px] text-fk-muted leading-relaxed mt-4">
              By clicking Register, you agree to comply with our delivery partner guidelines and safety protocols.
            </p>

            <button type="submit" disabled={loading} className="w-full btn-fk-primary py-4 text-base shadow-xl shadow-blue-100">
              {loading ? 'Registering...' : 'Register as Partner'}
            </button>
            
            <p className="text-center text-sm font-bold mt-6">
              Already have an account? <Link href="/login" className="text-fk-blue">Login here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
