import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import FloatingContact from '@/components/FloatingContact';
import TopLinearLoader from '@/components/TopLinearLoader';
import { Outfit, Hind_Siliguri } from 'next/font/google';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
  display: 'swap',
});

const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hind-siliguri',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'Developers Club - WordPress Developer Platform',
    template: '%s | Developers Club',
  },
  description: 'Premium plugins, themes, templates, resources, and documentation - all in one place.',
  keywords: ['wordpress', 'plugins', 'gpl themes', 'developers club', 'elementor pro', 'wp rocket'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`scroll-smooth ${outfit.variable} ${hindSiliguri.variable}`} suppressHydrationWarning>
      <body className="antialiased font-sans bg-white text-slate-900 selection:bg-blue-600 selection:text-white" suppressHydrationWarning>
        <TopLinearLoader />
        {children}
        <FloatingContact />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      </body>
    </html>
  );
}
