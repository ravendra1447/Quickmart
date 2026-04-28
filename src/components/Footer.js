'use client';
import Link from 'next/link';
import { FiFacebook, FiTwitter, FiYoutube, FiShoppingBag, FiStar, FiHelpCircle, FiGift, FiTruck } from 'react-icons/fi';

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
        <div className="pt-8 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-6 sm:gap-8">
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 w-full lg:w-auto">
            <Link href="/register" className="flex items-center gap-2 text-xs font-bold text-white hover:text-fk-yellow transition-colors">
              <FiShoppingBag className="text-fk-yellow" /> Become a Seller
            </Link>
            <Link href="/advertise" className="flex items-center gap-2 text-xs font-bold text-white hover:text-fk-yellow transition-colors">
              <FiStar className="text-fk-yellow" /> Advertise
            </Link>
            <Link href="/gift-cards" className="flex items-center gap-2 text-xs font-bold text-white hover:text-fk-yellow transition-colors">
              <FiGift className="text-fk-yellow" /> Gift Cards
            </Link>
            <Link href="/help-center" className="flex items-center gap-2 text-xs font-bold text-white hover:text-fk-yellow transition-colors">
              <FiHelpCircle className="text-fk-yellow" /> Help Center
            </Link>
            <Link href="/delivery/register" className="flex items-center gap-2 text-xs font-bold text-white hover:text-fk-yellow transition-colors">
              <FiTruck className="text-fk-yellow" /> Join as Delivery Partner
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 w-full lg:w-auto">
            <div className="text-xs font-bold text-white text-center">
              © 2007-{currentYear} QuickMart.com
            </div>

            <div className="flex items-center justify-center gap-5 sm:gap-6 bg-white px-6 py-3.5 rounded-2xl shadow-[0_10px_20px_rgba(0,0,0,0.2)]">
               <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-5 sm:h-6 w-auto object-contain" />
               <img src="https://cdn.iconscout.com/icon/free/png-256/visa-3-226460.png" alt="Visa" className="h-5 sm:h-6 w-auto object-contain" />
               <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="Mastercard" className="h-5 sm:h-6 w-auto object-contain" />
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
