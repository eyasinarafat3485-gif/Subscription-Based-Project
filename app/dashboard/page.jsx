'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';

export default function DashboardIndexPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending) {
      const userRole = session?.user?.role;
      if (userRole === 'admin') {
        router.replace('/dashboard/admin');
      } else if (userRole === 'guest') {
        router.replace('/dashboard/guest');
      } else {
        router.replace('/dashboard/user');
      }
    }
  }, [session, isPending, router]);

  return (
    <div className="h-full w-full flex flex-col items-center justify-center min-h-[60vh] gap-3 text-slate-500">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <p className="text-sm font-semibold">Verifying your account role and redirecting to the dashboard...</p>
    </div>
  );
}
