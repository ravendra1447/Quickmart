export default function HelpCenterPage() {
  const faqs = [
    { q: "Where is my order?", a: "You can track your order status in the 'My Orders' section of your profile." },
    { q: "How do I return an item?", a: "Go to your order history, select the item, and click 'Return'. Pack the item with original tags and our courier will pick it up within 24 hours." },
    { q: "What are the refund timelines?", a: "Refunds to credit/debit cards take 3-5 business days. Wallet and UPI refunds are instantaneous after the item is picked up." },
    { q: "Can I change my delivery address?", a: "You can change your delivery address before the order is shipped from the 'My Orders' tracking page." }
  ];

  return (
    <div className="min-h-screen bg-[#f1f3f6] pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Search Header */}
        <div className="bg-white rounded-[40px] p-8 sm:p-12 shadow-sm border border-slate-100 text-center mb-8">
          <h1 className="text-3xl font-black text-dark-900 mb-4">Hello. How can we help you?</h1>
          <div className="max-w-xl mx-auto relative mt-8">
            <input 
              type="text" 
              placeholder="Search for an issue (e.g., 'refund', 'tracking')" 
              className="w-full pl-6 pr-16 py-5 bg-slate-50 border-2 border-slate-100 rounded-full text-dark-900 outline-none focus:bg-white focus:border-[#fb641b] transition-all font-bold"
            />
            <button className="absolute right-2 top-2 bottom-2 aspect-square bg-[#fb641b] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#e65a18] transition-all">
              🔍
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:-translate-y-1 transition-all hover:border-[#fb641b] group">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">📦</div>
            <h3 className="font-black text-dark-900 mb-2">My Orders</h3>
            <p className="text-xs text-dark-500 font-medium leading-relaxed">Track, return, or cancel an order</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:-translate-y-1 transition-all hover:border-[#fb641b] group">
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">💸</div>
            <h3 className="font-black text-dark-900 mb-2">Refunds</h3>
            <p className="text-xs text-dark-500 font-medium leading-relaxed">Check refund status and payment issues</p>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 cursor-pointer hover:-translate-y-1 transition-all hover:border-[#fb641b] group">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">👤</div>
            <h3 className="font-black text-dark-900 mb-2">Account</h3>
            <p className="text-xs text-dark-500 font-medium leading-relaxed">Manage addresses, profile, and settings</p>
          </div>
        </div>

        {/* FAQs */}
        <div className="bg-white rounded-[40px] p-8 sm:p-12 shadow-sm border border-slate-100">
          <h2 className="text-2xl font-black text-dark-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                <h3 className="font-bold text-dark-800 text-sm mb-2">{faq.q}</h3>
                <p className="text-dark-500 text-sm font-medium leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
