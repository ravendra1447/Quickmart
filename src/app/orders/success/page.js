'use client';
import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FiCheckCircle, FiPackage, FiArrowRight } from 'react-icons/fi';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams?.get('order');

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-green-50/50 to-white animate-fade-in">
      <div className="text-center max-w-lg glass-card p-10 shadow-2xl shadow-green-200/50 border-green-100">
        <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-8 shadow-lg shadow-green-200 animate-bounce-slow">
          <FiCheckCircle className="text-white" size={48} />
        </div>
        
        <h1 className="text-3xl font-black text-dark-900 mb-3">Order Confirmed! 🎉</h1>
        <p className="text-dark-600 mb-6 px-4">Your order has been placed successfully and is being processed by the seller.</p>
        
        {orderNumber && (
          <div className="bg-dark-50 rounded-2xl p-4 mb-8 inline-block border border-dark-100">
            <p className="text-xs text-dark-400 uppercase font-bold tracking-widest mb-1">Order Number</p>
            <p className="text-xl font-black text-primary-600">{orderNumber}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link href="/orders" className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg">
            <FiPackage size={20} /> Track Your Order
          </Link>
          <Link href="/" className="btn-secondary w-full py-4 flex items-center justify-center gap-2">
            Continue Shopping <FiArrowRight />
          </Link>
        </div>

        <p className="mt-8 text-xs text-dark-400 font-medium">A confirmation email and SMS with tracking details has been sent.</p>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-20 h-20 rounded-full bg-dark-200 mx-auto mb-6"></div>
          <div className="h-8 bg-dark-200 rounded w-64 mx-auto"></div>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
