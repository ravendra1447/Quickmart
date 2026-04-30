'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FiGrid, FiUsers, FiTag, FiPackage, FiShoppingCart, FiSettings, FiLogOut, FiMenu, FiX, FiImage, FiPercent, FiTruck } from 'react-icons/fi';
import useAuthStore from '@/store/authStore';
import { useState } from 'react';

const links = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <FiGrid /> },
  { href: '/admin/sellers', label: 'Sellers', icon: <FiUsers /> },
  { href: '/admin/categories', label: 'Categories', icon: <FiTag /> },
  { href: '/admin/products', label: 'Products', icon: <FiPackage /> },
  { href: '/admin/orders', label: 'Orders', icon: <FiShoppingCart /> },
  { href: '/admin/banners', label: 'Banners', icon: <FiImage /> },
  { href: '/admin/coupons', label: 'Coupons', icon: <FiPercent /> },
  { href: '/admin/delivery', label: 'Delivery', icon: <FiTruck /> },

  { href: '/admin/subscriptions', label: 'Subscriptions', icon: <FiTag /> },

  { href: '/admin/settings', label: 'Settings', icon: <FiSettings /> },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen bg-dark-50 -mt-16 pt-0">
      {/* Sidebar */}

      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-dark-100 z-50 transform transition-transform duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 border-b border-dark-100 shrink-0">

          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white"><FiGrid /></div>
            <span className="text-lg font-bold text-dark-900">Admin Panel</span>
          </Link>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto flex-1 custom-scrollbar">

          {links.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setSidebarOpen(false)}
              className={pathname === l.href ? 'sidebar-link-active' : 'sidebar-link'}>
              {l.icon} {l.label}
            </Link>
          ))}
        </nav>


        <div className="p-4 border-t border-dark-100 shrink-0 bg-white">
          <div className="flex items-center gap-3 mb-4 p-2 bg-dark-50 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold shrink-0">{user?.name?.[0]}</div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-dark-800 truncate">{user?.name}</p>
              <p className="text-[10px] font-black text-dark-400 uppercase tracking-widest">Super Admin</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 py-3 text-red-500 hover:bg-red-50 rounded-xl text-sm font-bold transition-all border border-transparent hover:border-red-100">
            <FiLogOut /> Logout
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

      <main className="flex-1 min-w-0">
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-dark-100 px-6 py-4 flex items-center justify-between lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-dark-100"><FiMenu size={20} /></button>
          <span className="font-bold text-dark-800">Admin</span>
          <div></div>
        </div>
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
