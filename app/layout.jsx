import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import FloatingContact from '@/components/FloatingContact';

export const metadata = {
  title: 'Developers Club - বাংলাদেশের WordPress Developer Platform',
  description: 'প্রিমিয়াম প্লাগইন, থিম, টেমপ্লেট, রিসোর্স এবং বাংলা ডকুমেন্টেশন - সবকিছু এক জায়গায়।',
  keywords: ['wordpress', 'plugins', 'gpl themes', 'bangladesh developers', 'elementor pro', 'wp rocket'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="bn" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans bg-white text-slate-900 selection:bg-blue-600 selection:text-white" suppressHydrationWarning>
        {children}
        <FloatingContact />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      </body>
    </html>
  );
}
