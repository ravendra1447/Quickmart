import './globals.css';
import { Toaster } from 'react-hot-toast';
import AuthProvider from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatWidget from '@/components/ChatWidget';

export const metadata = {
  title: 'NearbyDukan - Multivendor eCommerce Platform',
  description: 'Shop from multiple trusted sellers. Fresh groceries, daily essentials, and more delivered to your doorstep.',
  keywords: 'ecommerce, multivendor, online shopping, groceries, quick delivery',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen pt-16">
            {children}
          </main>
          <Footer />
          <ChatWidget />
          <Toaster position="top-right" toastOptions={{
            duration: 3000,
            style: { borderRadius: '12px', background: '#1e293b', color: '#f1f5f9', fontSize: '14px' },
          }} />
        </AuthProvider>
      </body>
    </html>
  );
}
