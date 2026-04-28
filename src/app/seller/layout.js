'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiGrid, FiPackage, FiShoppingCart, FiDollarSign, FiUser, FiLogOut, FiMenu, FiSettings } from 'react-icons/fi';
import useAuthStore from '@/store/authStore';
import { useState } from 'react';

const links = [
  { href: '/seller/dashboard', label: 'Dashboard', icon: <FiGrid /> },
  { href: '/seller/products', label: 'Products', icon: <FiPackage /> },
  { href: '/seller/orders', label: 'Orders', icon: <FiShoppingCart /> },
  { href: '/seller/earnings', label: 'Earnings', icon: <FiDollarSign /> },
  { href: '/seller/settings', label: 'Store Settings', icon: <FiSettings /> },
];

export default function SellerLayout({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen bg-dark-50 -mt-16 pt-0">
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-dark-100 z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-dark-100">
          <Link href="/seller/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center text-white"><FiPackage /></div>
            <span className="text-lg font-bold text-dark-900">Seller Panel</span>
          </Link>
        </div>

        <nav className="p-4 space-y-1">
          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setSidebarOpen(false)}
              className={pathname === l.href ? 'sidebar-link-active' : 'sidebar-link'}>
              {l.icon} {l.label}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-dark-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">{user?.name?.[0]}</div>
            <div><p className="text-sm font-semibold text-dark-800">{user?.name}</p><p className="text-xs text-dark-500">Seller</p></div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-2 text-red-500 hover:bg-red-50 rounded-lg text-sm font-medium transition-all"><FiLogOut /> Logout</button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

      <main className="flex-1 min-w-0">
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-dark-100 px-6 py-4 flex items-center justify-between lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-dark-100"><FiMenu size={20} /></button>
          <span className="font-bold text-dark-800">Seller</span>
          <div></div>
        </div>
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
