'use client';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import Link from 'next/link';
import { FiHome, FiMapPin, FiCheckCircle, FiLogOut } from 'react-icons/fi';

export default function DeliveryLayout({ children }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'delivery_partner') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== 'delivery_partner') return null;

  const navItems = [
    { name: 'Dashboard', path: '/delivery/dashboard', icon: <FiHome /> },
  ];

  return (
    <div className="min-h-screen bg-[#f1f3f6] flex flex-col md:flex-row">
      {/* Sidebar for Desktop, Bottom Nav for Mobile */}
      <aside className="w-full md:w-64 bg-white shadow-fk border-r border-slate-100 flex flex-col md:h-screen md:sticky top-0 z-40 order-last md:order-first fixed bottom-0 left-0">
        <div className="p-6 hidden md:flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#fb641b] flex items-center justify-center">
            <FiMapPin className="text-white" size={18} />
          </div>
          <span className="text-xl font-black text-dark-900 tracking-tight">Partner Panel</span>
        </div>
        
        <nav className="flex-1 py-2 md:py-6 px-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}
              className={`flex-1 md:flex-none flex flex-col md:flex-row items-center gap-1 md:gap-3 px-2 md:px-4 py-3 rounded-xl transition-all ${
                pathname === item.path 
                  ? 'bg-orange-50 text-[#fb641b] font-black shadow-sm' 
                  : 'text-dark-600 hover:bg-slate-50 font-bold'
              }`}>
              <span className={pathname === item.path ? 'text-[#fb641b]' : 'text-dark-400'}>{item.icon}</span>
              <span className="text-[10px] md:text-sm">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 hidden md:block border-t border-slate-100">
          <div className="flex items-center gap-3 mb-4 p-2 bg-slate-50 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-orange-100 text-[#fb641b] flex items-center justify-center font-black">
              {user.name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-black text-dark-900 leading-tight">{user.name}</p>
              <p className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">Delivery Partner</p>
            </div>
          </div>
          <button onClick={() => { logout(); router.push('/login'); }} 
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl font-bold transition-all text-sm">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
