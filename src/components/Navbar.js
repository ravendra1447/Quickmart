'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  FiShoppingCart, FiSearch, FiChevronDown, FiUser, FiPackage, 
  FiLogOut, FiGrid, FiZap, FiHeart, FiGift, FiHeadphones, FiMonitor, FiDownload, FiXCircle, FiMenu, FiX, FiMapPin, FiArrowRight 
} from 'react-icons/fi';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';
import { useState, useEffect } from 'react';
import { productAPI } from '@/lib/api';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const authStore = useAuthStore();
  const cartStore = useCartStore();

  useEffect(() => { 
    setMounted(true); 
    productAPI.getCategories().then(res => setCategories(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => { if (mounted) setUser(authStore.user); }, [mounted, authStore.user]);
  useEffect(() => { if (mounted && authStore.user) cartStore.fetchCart(); }, [mounted, authStore.user, cartStore]);

  const itemCount = mounted ? (cartStore.items?.length || 0) : 0;
  const handleLogout = () => { authStore.logout(); setUser(null); setIsSidebarOpen(false); window.location.href = '/'; };

  if (pathname?.startsWith('/admin') || pathname?.startsWith('/seller') || pathname === '/checkout') return null;

  return (
    <>
      <nav className="bg-fk-blue fixed top-0 left-0 right-0 z-50 shadow-lg">
        <div className="max-w-[1248px] w-full mx-auto px-3 sm:px-4 flex flex-col md:flex-row md:h-14 items-center gap-2 md:gap-6 py-2 md:py-0">
          
          <div className="flex items-center justify-between w-full md:w-auto gap-4">
            {/* Mobile Hamburger */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="text-white md:hidden p-1"
            >
              <FiMenu size={22} />
            </button>

            {/* Logo */}
            <Link href="/" className="flex flex-col items-start leading-[0.8]">
              <span className="text-white font-black italic text-lg md:text-xl tracking-tight">QuickMart</span>
              <span className="text-white/80 font-bold italic text-[9px] md:text-[10px] flex items-center gap-0.5">
                Explore <span className="text-fk-yellow font-black">Quick</span>
                <span className="text-fk-yellow font-black text-[12px] ml-0.5">+</span>
              </span>
            </Link>

            {/* Mobile Actions (Cart & Login) */}
            <div className="flex items-center gap-4 md:hidden">
              <NotificationBell />
              <Link href={user ? "/profile" : "/login"} className="text-white font-bold text-[13px] flex flex-col items-center leading-none">
                <FiUser size={20} />
              </Link>
              <Link href="/cart" className="text-white flex items-center gap-1.5 relative p-1">
                <FiShoppingCart size={22} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-fk-yellow text-[#212121] text-[10px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-fk-blue">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="w-full md:flex-1 relative">
            <input 
              type="text" 
              placeholder="Search for products, brands and more" 
              className="w-full h-9 px-4 pr-10 rounded-sm text-[13px] sm:text-sm outline-none shadow-sm placeholder:text-[#878787]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FiSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-fk-blue font-bold cursor-pointer" size={18} />
          </div>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center gap-10 text-white font-bold text-sm">
            
            <NotificationBell />

            {/* Login Dropdown */}
            <div className="relative group py-4">
              <button className="bg-white text-fk-blue px-10 py-2 rounded-sm font-black text-sm hover:shadow-lg transition-all flex items-center gap-2 border border-slate-100">
                {mounted && user ? user.name?.split(' ')[0] : 'Login'}
                <FiChevronDown className="group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute top-[90%] left-1/2 -translate-x-1/2 w-64 bg-white text-[#212121] shadow-2xl rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pt-1 border border-slate-100 overflow-hidden">
                {!user && (
                  <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-slate-50/50">
                    <span className="text-sm font-bold">New customer?</span>
                    <Link href="/register" className="text-fk-blue font-black text-sm hover:underline">Sign Up</Link>
                  </div>
                )}
                <div className="py-1">
                  <Link href="/profile" className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 text-sm font-bold border-b border-slate-50">
                    <FiUser className="text-fk-blue" size={16} /> My Profile
                  </Link>
                  <Link href="/orders" className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 text-sm font-bold border-b border-slate-50">
                    <FiPackage className="text-fk-blue" size={16} /> Orders
                  </Link>
                  <Link href="/profile?tab=wishlist" className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 text-sm font-bold">
                    <FiHeart className="text-fk-blue" size={16} /> Wishlist
                  </Link>
                  <Link href="/rewards" className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 text-sm font-bold border-t border-slate-50">
                    <FiZap className="text-fk-blue" size={16} /> QuickMart Plus Zone
                  </Link>
                  <Link href="/rewards" className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 text-sm font-bold">
                    <FiGift className="text-fk-blue" size={16} /> Rewards
                  </Link>
                  
                  {user?.role === 'super_admin' && (
                    <Link href="/admin/dashboard" className="flex items-center gap-4 px-4 py-3 hover:bg-blue-50 text-blue-700 text-xs font-black uppercase tracking-widest border-t border-slate-100"><FiGrid /> Admin Dashboard</Link>
                  )}
                  {user?.role === 'seller' && (
                    <Link href="/seller/dashboard" className="flex items-center gap-4 px-4 py-3 hover:bg-orange-50 text-orange-700 text-xs font-black uppercase tracking-widest border-t border-slate-100"><FiPackage /> Seller Panel</Link>
                  )}

                  {user && (
                    <button onClick={handleLogout} className="w-full flex items-center gap-4 px-4 py-3 hover:bg-rose-50 text-sm font-bold text-rose-600 border-t border-slate-100">
                      <FiXCircle /> Logout
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* More Dropdown */}
            <div className="relative group py-4">
              <button className="text-white font-bold text-sm flex items-center gap-1 hover:text-fk-yellow transition-colors">
                More
                <FiChevronDown className="group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute top-[90%] left-1/2 -translate-x-1/2 w-56 bg-white text-[#212121] shadow-2xl rounded-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pt-1 border border-slate-100 overflow-hidden">
                <div className="py-1">
                  <Link href="/notifications/preferences" className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 text-sm font-bold border-b border-slate-50">
                    <FiZap className="text-fk-blue" size={16} /> Notification Preferences
                  </Link>
                  <Link href="/support" className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 text-sm font-bold border-b border-slate-50">
                    <FiHeadphones className="text-fk-blue" size={16} /> 24x7 Customer Care
                  </Link>
                  <Link href="/advertise" className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 text-sm font-bold border-b border-slate-50">
                    <FiArrowRight className="text-fk-blue" size={16} /> Advertise
                  </Link>
                  <Link href="/download-app" className="flex items-center gap-4 px-4 py-3 hover:bg-slate-50 text-sm font-bold">
                    <FiDownload className="text-fk-blue" size={16} /> Download App
                  </Link>
                </div>
              </div>
            </div>

            {/* Cart */}
            <Link href="/cart" className="flex items-center gap-2 relative group hover:text-fk-yellow transition-colors">
              <FiShoppingCart size={20} className="group-hover:scale-110 transition-transform" />
              Cart
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-fk-orange text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-fk-blue shadow-lg">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>

        </div>

        {/* Brand New Location Bar (Flipkart Style) - Now visible on mobile */}
        <div className="bg-[#f0f2f5] border-b border-dark-50 py-1.5">
           <div className="max-w-[1248px] mx-auto px-4 flex items-center gap-2 text-[#212121]">
              <FiMapPin className="text-dark-500" size={14} />
              <span className="text-[10px] sm:text-[11px] font-bold">Deliver to</span>
              <button onClick={() => window.location.href='/checkout'} className="text-[10px] sm:text-[11px] font-black hover:text-fk-blue flex items-center gap-1 transition-colors truncate max-w-[200px]">
                 {user?.addresses?.[0] ? `${user.addresses[0].city} ${user.addresses[0].pincode}` : 'Select delivery location'}
                 <FiChevronDown size={12} className="flex-shrink-0" />
              </button>
           </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Mobile Sidebar Content */}
      <div className={`fixed top-0 left-0 bottom-0 w-[280px] bg-white z-[101] shadow-2xl transition-transform duration-300 transform md:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="bg-fk-blue p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">
              {user ? user.name?.[0]?.toUpperCase() : <FiUser />}
            </div>
            <span className="font-bold text-sm">{user ? `Hello, ${user.name?.split(' ')[0] || 'User'}` : 'Login & Signup'}</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)}><FiX size={20} /></button>
        </div>

        <div className="overflow-y-auto h-full pb-20">
          <div className="py-2 border-b border-slate-100">
            {user ? (
              <>
                <Link href="/profile" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 px-5 py-3 text-sm font-medium hover:bg-slate-50"><FiUser className="text-fk-blue" /> My Profile</Link>
                <Link href="/orders" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 px-5 py-3 text-sm font-medium hover:bg-slate-50"><FiPackage className="text-fk-blue" /> My Orders</Link>
                <Link href="/cart" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 px-5 py-3 text-sm font-medium hover:bg-slate-50"><FiShoppingCart className="text-fk-blue" /> My Cart</Link>
              </>
            ) : (
              <Link href="/login" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 px-5 py-3 text-sm font-bold text-fk-blue hover:bg-blue-50"><FiUser /> Login / Signup</Link>
            )}
          </div>

          {/* Categories Section */}
          <div className="py-4">
            <h3 className="px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Shop by Categories</h3>
            {categories.map(cat => (
              <Link 
                key={cat.id} 
                href={`/products?category=${cat.slug}`}
                onClick={() => setIsSidebarOpen(false)}
                className="flex items-center gap-4 px-5 py-3 text-sm font-medium hover:bg-slate-50"
              >
                <Image src={cat.image_url || 'https://via.placeholder.com/24'} className="w-6 h-6 object-contain" alt={cat.name} width={24} height={24} unoptimized />
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="py-2 border-t border-slate-100">
            <Link href="/support" onClick={() => setIsSidebarOpen(false)} className="flex items-center gap-4 px-5 py-3 text-sm font-medium hover:bg-slate-50"><FiHeadphones className="text-fk-blue" /> Customer Care</Link>
            {user && (
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-5 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50"
              >
                <FiLogOut /> Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
