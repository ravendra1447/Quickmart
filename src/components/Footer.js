'use client';
import Link from 'next/link';
import { FiFacebook, FiTwitter, FiYoutube, FiShoppingBag, FiStar, FiHelpCircle, FiGift } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const footerSections = [
    {
      title: 'ABOUT',
      links: ['Contact Us', 'About Us', 'Careers', 'QuickMart Stories', 'Press', 'QuickMart Wholesale', 'Cleartrip', 'Corporate Information']
    },
    {
      title: 'HELP',
      links: ['Payments', 'Shipping', 'Cancellation & Returns', 'FAQ', 'Report Infringement']
    },
    {
      title: 'CONSUMER POLICY',
      links: ['Cancellation & Returns', 'Terms Of Use', 'Security', 'Privacy', 'Sitemap', 'Grievance Redressal', 'EPR Compliance']
    },
    {
      title: 'SOCIAL',
      links: ['Facebook', 'Twitter', 'YouTube']
    }
  ];

  return (
    <footer className="bg-[#212121] text-white pt-12 pb-6 mt-20">
      <div className="max-w-[1248px] mx-auto px-4">
        
        {/* Top Section: Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 pb-10 border-b border-white/10">
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-[#878787] text-[10px] font-bold mb-4 uppercase">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link}>
                    <Link href="#" className="text-white text-xs font-bold hover:underline">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Mail & Office (Flipkart Style) */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 lg:border-l lg:border-white/10 lg:pl-8">
            <div>
              <h3 className="text-[#878787] text-[10px] font-bold mb-4 uppercase">Mail Us:</h3>
              <p className="text-xs font-bold leading-relaxed">
                QuickMart Internet Private Limited,<br />
                Buildings Alyssa, Begonia &<br />
                Clove Embassy Tech Village,<br />
                Outer Ring Road, Devarabeesanahalli Village,<br />
                Bengaluru, 560103, Karnataka, India
              </p>
            </div>
            <div>
              <h3 className="text-[#878787] text-[10px] font-bold mb-4 uppercase">Registered Office:</h3>
              <p className="text-xs font-bold leading-relaxed">
                QuickMart Internet Private Limited,<br />
                Buildings Alyssa, Begonia &<br />
                Clove Embassy Tech Village,<br />
                Outer Ring Road, Devarabeesanahalli Village,<br />
                Bengaluru, 560103, Karnataka, India<br />
                CIN : U51109KA2012PTC066107<br />
                Telephone: 044-45614700
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Extras */}
        <div className="pt-6 flex flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-8">
            <Link href="/register" className="flex items-center gap-2 text-xs font-bold text-white hover:text-fk-yellow transition-colors">
              <FiShoppingBag className="text-fk-yellow" /> Become a Seller
            </Link>
            <Link href="#" className="flex items-center gap-2 text-xs font-bold text-white hover:text-fk-yellow transition-colors">
              <FiStar className="text-fk-yellow" /> Advertise
            </Link>
            <Link href="#" className="flex items-center gap-2 text-xs font-bold text-white hover:text-fk-yellow transition-colors">
              <FiGift className="text-fk-yellow" /> Gift Cards
            </Link>
            <Link href="#" className="flex items-center gap-2 text-xs font-bold text-white hover:text-fk-yellow transition-colors">
              <FiHelpCircle className="text-fk-yellow" /> Help Center
            </Link>
          </div>

          <div className="text-xs font-bold text-white">
            © 2007-{currentYear} QuickMart.com
          </div>

          <div className="flex items-center gap-4">
             <img src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/payment-method-c454b1.svg" alt="payments" className="h-4" />
          </div>
        </div>

      </div>
    </footer>
  );
}
