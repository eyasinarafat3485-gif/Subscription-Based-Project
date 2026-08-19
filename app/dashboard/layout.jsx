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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (pathname.includes('/admin')) {
      document.title = 'Admin Dashboard | Developers Club';
    } else if (pathname.includes('/guest')) {
      document.title = 'Guest Dashboard | Developers Club';
    } else if (pathname.includes('/user')) {
      document.title = 'User Dashboard | Developers Club';
    } else {
      document.title = 'Dashboard | Developers Club';
    }
  }, [pathname]);

  useEffect(() => {
    if (isPending) return;

    // 1. Check if user is logged in
    if (!session?.user) {
      toast.error('Please login first to access the dashboard!');
      router.replace('/login');
      return;
    }

    const fetchRoleAndValidate = async () => {
      let userRole = session?.user?.role;

      // Fallback: try fetching role from API if not set in session
      if (!userRole) {
        try {
          const res = await fetch('/api/user/profile');
          if (res.ok) {
            const data = await res.json();
            if (data?.user?.role) {
              userRole = data.user.role;
            }
          }
        } catch (err) { }
      }

      userRole = userRole || 'user';

      // 2. Protection & Routing for Guest Role (Guest can ONLY access /dashboard/guest)
      if (userRole === 'guest') {
        const hasCelebrated = sessionStorage.getItem('guest_celebrated');
        if (!hasCelebrated) {
          toast.success(`🎉 Congratulations, ${session.user.name || 'User'}! Your Guest Membership is now ACTIVE!`, {
            autoClose: 5000,
          });
          sessionStorage.setItem('guest_celebrated', 'true');
        }

        if (pathname.startsWith('/dashboard/admin')) {
          toast.error('Access denied! You do not have permission to access the admin dashboard.');
          router.replace('/dashboard/guest');
          return;
        }
        if (pathname.startsWith('/dashboard/user')) {
          router.replace('/dashboard/guest');
          return;
        }
      }

      // 3. Protection for PRO User Role (User can ONLY access /dashboard/user)
      if (userRole === 'user') {
        if (pathname.startsWith('/dashboard/admin')) {
          toast.error('Access denied! You do not have permission to access the admin dashboard.');
          router.replace('/dashboard/user');
          return;
        }
        if (pathname.startsWith('/dashboard/guest')) {
          toast.error('Pro members are not permitted to access the guest dashboard.');
          router.replace('/dashboard/user');
          return;
        }
      }

      // 4. Protection for Admin Role (Admin can ONLY access /dashboard/admin)
      if (userRole === 'admin') {
        if (pathname.startsWith('/dashboard/user') || pathname.startsWith('/dashboard/guest')) {
          toast.info('Redirecting to the admin panel...');
          router.replace('/dashboard/admin');
          return;
        }
      }

      setAuthorized(true);
    };

    fetchRoleAndValidate();
  }, [pathname, session, isPending, router]);

  const isLoading = !mounted || isPending || !authorized;

  return (
    <div className="fixed inset-0 h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 flex font-sans z-50">
      {/* Sidebar Navigation */}
      <DashboardSidebar />

      {/* Main Right Area: Top Header + Scrollable Content */}
      <div className="flex-1 h-full flex flex-col min-w-0 overflow-hidden bg-slate-50 relative">
        {/* Professional Top Dashboard Header */}
        <DashboardHeader />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>

          {/* Smooth Non-Destructive Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-slate-50/90 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-slate-600 z-40 transition-opacity duration-200">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <p className="text-sm font-bold">Verifying security role permissions...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
