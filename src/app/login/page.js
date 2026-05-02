'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import useAuthStore from '@/store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'otp'
  const [emailForm, setEmailForm] = useState({ email: '', password: '' });
  const [otpForm, setOtpForm] = useState({ identifier: '', otp: '' });
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [receivedOtp, setReceivedOtp] = useState(''); // Store OTP for UI display

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!emailForm.email || !emailForm.password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login(emailForm);
      console.log('[LOGIN] Response:', res);
      
      // res is already unwrapped by axios interceptor: { success, message, data: { user, token } }
      const user = res?.data?.user;
      const token = res?.data?.token;
      
      if (!user || !token) {
        console.error('[LOGIN] Invalid response structure:', res);
        toast.error('Login failed - unexpected server response');
        setLoading(false);
        return;
      }
      
      setAuth(user, token);
      toast.success('Login successful!');
      
      console.log('[LOGIN] Auth success, role:', user.role);
      
      // Attempt redirection
      try {
        if (user.role === 'super_admin') router.push('/admin/dashboard');
        else if (user.role === 'seller') router.push('/seller/dashboard');
        else if (user.role === 'delivery_partner') router.push('/delivery/dashboard');
        else router.push('/');
        
        // Small delay to clear loading after navigation starts
        setTimeout(() => setLoading(false), 500);
      } catch (routerErr) {
        console.error('[LOGIN] Redirection failed:', routerErr);
        window.location.href = '/'; 
      }
    } catch (err) {
      console.error('[LOGIN] Error:', err);
      toast.error(err.message || 'Invalid credentials');
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!otpForm.identifier) return toast.error('Enter phone or email');
    setLoading(true);
    try {
      const type = otpForm.identifier.includes('@') ? 'email' : 'phone';
      const res = await authAPI.sendOtp({ identifier: otpForm.identifier, type });
      console.log('[OTP] Send Response:', res);
      setIsOtpSent(true);
      // res is already unwrapped: { success, message, data: { message, otp } }
      const otpValue = res?.data?.otp || '';
      setReceivedOtp(otpValue); 
      toast.success('OTP sent successfully!');
    } catch (err) {
      console.error('[OTP] Send Error:', err);
      toast.error(err.message || 'Failed to send OTP');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpForm.otp) return toast.error('Please enter the OTP');
    setLoading(true);
    try {
      const type = otpForm.identifier.includes('@') ? 'email' : 'phone';
      const res = await authAPI.verifyOtp({ ...otpForm, type });
      console.log('[OTP] Verify Response:', res);
      
      const user = res?.data?.user;
      const token = res?.data?.token;
      
      if (!user || !token) {
        toast.error('Verification failed - unexpected response');
        setLoading(false);
        return;
      }
      
      setAuth(user, token);
      toast.success('Login successful!');
      
      console.log('[OTP] Verification success, role:', user.role);

      try {
        if (user.role === 'super_admin') router.push('/admin/dashboard');
        else if (user.role === 'seller') router.push('/seller/dashboard');
        else if (user.role === 'delivery_partner') router.push('/delivery/dashboard');
        else router.push('/');
        
        setTimeout(() => setLoading(false), 500);
      } catch (routerErr) {
        console.error('[OTP] Redirection failed:', routerErr);
        window.location.href = '/';
      }
    } catch (err) {
      console.error('[OTP] Verify Error:', err);
      toast.error(err.message || 'Invalid OTP');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 pt-28 md:pt-14">
      <div className="max-w-[750px] w-full bg-white rounded-sm shadow-fk-high overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Flipkart Sidebar */}
        <div className="bg-fk-blue w-full md:w-[40%] p-10 flex flex-col justify-between text-white relative">
          <div>
            <h2 className="text-3xl font-bold mb-4">Login</h2>
            <p className="text-lg opacity-80 leading-relaxed font-medium">Get access to your Orders, Wishlist and Recommendations</p>
          </div>
          <div className="mt-20">
            <img src="https://img.freepik.com/free-vector/tablet-login-concept-illustration_114360-7863.jpg" className="w-full object-contain opacity-80 mix-blend-multiply" alt="login-illustration" />
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-[60%] p-10 py-14 flex flex-col min-h-[450px]">
          
          <div className="flex gap-6 mb-8 border-b border-fk-divider">
            <button 
              onClick={() => { setLoginMethod('email'); setIsOtpSent(false); }}
              className={`pb-2 text-sm font-bold transition-all ${loginMethod === 'email' ? 'text-fk-blue border-b-2 border-fk-blue' : 'text-fk-muted'}`}
            >
              Email & Password
            </button>
            <button 
              onClick={() => setLoginMethod('otp')}
              className={`pb-2 text-sm font-bold transition-all ${loginMethod === 'otp' ? 'text-fk-blue border-b-2 border-fk-blue' : 'text-fk-muted'}`}
            >
              Phone / OTP
            </button>
          </div>

          {loginMethod === 'email' ? (
            <form onSubmit={handleLogin} className="space-y-6 flex-1">
              <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Enter Email" 
                  className="w-full border-b border-fk-divider py-2 outline-none focus:border-fk-blue text-sm transition-all placeholder:text-fk-muted"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                  required
                />
              </div>
              
              <div className="relative group">
                <input 
                  type="password" 
                  placeholder="Enter Password" 
                  className="w-full border-b border-fk-divider py-2 outline-none focus:border-fk-blue text-sm transition-all placeholder:text-fk-muted"
                  value={emailForm.password}
                  onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                  required
                />
                <Link href="/forgot-password" size="sm" className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-bold text-fk-blue">Forgot?</Link>
              </div>

              <p className="text-[10px] text-fk-muted leading-relaxed">
                By continuing, you agree to QuickMart&apos;s <span className="text-fk-blue cursor-pointer">Terms of Use</span> and <span className="text-fk-blue cursor-pointer">Privacy Policy</span>.
              </p>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-fk-primary py-3.5 text-base"
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp} className="space-y-6 flex-1">
               <div className="relative group">
                <input 
                  type="text" 
                  placeholder="Enter Phone Number or Email" 
                  className="w-full border-b border-fk-divider py-2 outline-none focus:border-fk-blue text-sm transition-all placeholder:text-fk-muted"
                  value={otpForm.identifier}
                  onChange={(e) => setOtpForm({ ...otpForm, identifier: e.target.value })}
                  disabled={isOtpSent}
                  required
                />
              </div>

              {isOtpSent && (
                <div className="relative group animate-fk-fade">
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg mb-4 text-center">
                    <p className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-1">Your OTP is</p>
                    <p className="text-2xl font-black text-fk-blue tracking-[0.5em]">{receivedOtp}</p>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Enter 6-digit OTP" 
                    className="w-full border-b border-fk-divider py-2 outline-none focus:border-fk-blue text-sm transition-all placeholder:text-fk-muted font-bold tracking-[0.5em] text-center"
                    value={otpForm.otp}
                    onChange={(e) => setOtpForm({ ...otpForm, otp: e.target.value })}
                    maxLength={6}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setIsOtpSent(false)}
                    className="text-[10px] font-bold text-fk-blue mt-2 hover:underline"
                  >
                    Change Number?
                  </button>
                </div>
              )}

              <p className="text-[10px] text-fk-muted leading-relaxed">
                {isOtpSent ? 'OTP has been sent to your identifier. Please verify to continue.' : 'We will send an OTP to your mobile number or email for secure login.'}
              </p>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-fk-primary py-3.5 text-base"
              >
                {loading ? 'Processing...' : (isOtpSent ? 'Verify & Login' : 'Send OTP')}
              </button>
            </form>
          )}

          <div className="mt-auto pt-10">
            <Link href="/register" className="text-fk-blue text-sm font-bold w-full text-center block hover:underline">New to QuickMart? Create an account</Link>
          </div>

        </div>
      </div>
    </div>
  );
}
