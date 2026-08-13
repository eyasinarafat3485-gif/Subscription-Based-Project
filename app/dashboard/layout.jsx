'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (isPending) return;

    const userRole = session?.user?.role || 'user';

    // Protection for Admin Routes
    if (pathname.startsWith('/dashboard/admin') && userRole !== 'admin') {
      toast.error('এডমিন ড্যাশবোর্ডে প্রবেশের অনুমতি নেই!');
      if (userRole === 'guest') {
        router.replace('/dashboard/guest');
      } else {
        router.replace('/dashboard/user');
      }
      return;
    }

    // Protection for User Routes (if admin accesses user route, send to admin)
    if (pathname.startsWith('/dashboard/user') && userRole === 'admin') {
      router.replace('/dashboard/admin');
      return;
    }

    // Protection for Guest Routes (if admin accesses guest route, send to admin)
    if (pathname.startsWith('/dashboard/guest') && userRole === 'admin') {
      router.replace('/dashboard/admin');
      return;
    }

    setAuthorized(true);
  }, [pathname, session, isPending, router]);

  if (isPending || !authorized) {
    return (
      <div className="fixed inset-0 h-screen w-screen bg-slate-50 flex flex-col items-center justify-center gap-3 text-slate-600 font-sans z-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-sm font-bold">নিরাপত্তা ও সিকিউরিটি রোল যাচাই করা হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 flex font-sans z-50">
      {/* Sidebar Navigation */}
      <DashboardSidebar />

      {/* Main Right Area: Top Header + Scrollable Content */}
      <div className="flex-1 h-full flex flex-col min-w-0 overflow-hidden bg-slate-50">
        {/* Professional Top Dashboard Header */}
        <DashboardHeader />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
