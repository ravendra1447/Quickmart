export default function AdvertisePage() {
  return (
    <div className="min-h-screen bg-white pt-28 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl font-black text-dark-900 mb-6 tracking-tight">Advertise with <span className="text-[#fb641b]">QuickMart</span></h1>
        <p className="text-lg text-dark-500 mb-12">Reach millions of shoppers every day and grow your brand exponentially.</p>
        
        <div className="grid sm:grid-cols-3 gap-8 mb-16 text-left">
          <div className="p-8 rounded-3xl bg-orange-50 border border-orange-100">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-[#fb641b] text-xl font-black mb-6">1</div>
            <h3 className="text-lg font-black text-dark-900 mb-2">Massive Reach</h3>
            <p className="text-dark-500 text-sm">Target a highly engaged audience actively looking to purchase.</p>
          </div>
          <div className="p-8 rounded-3xl bg-blue-50 border border-blue-100">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 text-xl font-black mb-6">2</div>
            <h3 className="text-lg font-black text-dark-900 mb-2">Smart Targeting</h3>
            <p className="text-dark-500 text-sm">Show your ads only to users searching for products in your category.</p>
          </div>
          <div className="p-8 rounded-3xl bg-green-50 border border-green-100">
            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-green-600 text-xl font-black mb-6">3</div>
            <h3 className="text-lg font-black text-dark-900 mb-2">High ROI</h3>
            <p className="text-dark-500 text-sm">Pay only for clicks or impressions and see a direct impact on your sales.</p>
          </div>
        </div>

        <div className="bg-dark-900 rounded-[40px] p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-black mb-4">Ready to start your campaign?</h2>
          <p className="text-dark-300 mb-8 max-w-xl mx-auto">Get in touch with our marketing team to build a custom advertising plan tailored for your brand.</p>
          <button className="px-8 py-4 bg-[#fb641b] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:bg-[#e65a18] hover:-translate-y-1 transition-all">Contact Sales</button>
        </div>
      </div>
    </div>
  );
}
