import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ContactContent from '@/components/ContactContent';

export const metadata = {
  title: 'Contact',
  description: 'আমাদের সাথে সরাসরি যোগাযোগ করুন। যেকোনো তথ্য, অভিযোগ বা টেকনিক্যাল সাপোর্টের জন্য মেসেজ পাঠান বা সরাসরি কল করুন।',
  keywords: ['contact', 'developers club support', 'bengal-it contact', 'যোগাযোগ', 'কাস্টমার সাপোর্ট'],
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Navbar */}
      <Header />

      {/* 2. Contact Content Area */}
      <main>
        <ContactContent />
      </main>

      {/* 3. Footer */}
      <Footer />
    </div>
  );
}
