export default function GiftCardsPage() {
  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-black text-dark-900 mb-6 tracking-tight">The Perfect <span className="text-[#fb641b]">Gift.</span></h1>
          <p className="text-lg text-dark-500 max-w-2xl mx-auto">Give your loved ones the freedom of choice with a QuickMart Gift Card. Valid for over 1 million products across all categories.</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-12 items-center bg-white rounded-[40px] shadow-2xl overflow-hidden p-8 sm:p-12 border border-slate-100">
          <div className="relative aspect-[1.6] bg-gradient-to-tr from-dark-900 to-[#fb641b] rounded-3xl shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-500">
            <div className="absolute top-6 left-6 text-white font-black italic tracking-tighter text-2xl">QuickMart</div>
            <div className="absolute bottom-6 left-6 text-white/80 font-bold tracking-widest text-sm uppercase">Gift Card</div>
            <div className="absolute bottom-6 right-6 text-white font-black text-2xl">₹5,000</div>
            
            {/* Design accents */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-black/20 rounded-full blur-xl"></div>
          </div>
          
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-dark-900">Buy a Digital Gift Card</h2>
            <p className="text-dark-500 font-medium">Instant delivery via Email or SMS. No hidden fees or expiration dates.</p>
            
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-[10px] font-black text-dark-400 uppercase tracking-widest block mb-2">Select Amount</label>
                <div className="flex gap-3 flex-wrap">
                  {['₹500', '₹1,000', '₹2,500', '₹5,000'].map((amt, i) => (
                    <button key={i} className={`px-5 py-3 rounded-xl font-black text-sm transition-all border-2 ${i === 2 ? 'bg-orange-50 border-[#fb641b] text-[#fb641b]' : 'bg-white border-slate-200 text-dark-600 hover:border-slate-300'}`}>{amt}</button>
                  ))}
                  <button className="px-5 py-3 rounded-xl font-black text-sm bg-white border-2 border-slate-200 text-dark-600 hover:border-slate-300">Custom</button>
                </div>
              </div>
              
              <div className="pt-4">
                <button className="w-full py-4 bg-dark-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-black transition-all">Buy Now</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
