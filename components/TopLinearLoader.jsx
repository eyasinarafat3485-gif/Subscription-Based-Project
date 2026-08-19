'use client';

import { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

function TopLinearLoaderContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(100);
    const timer = setTimeout(() => {
      setLoading(false);
      setProgress(0);
    }, 250);
    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    const attachedAnchors = new WeakSet();

    const handleAnchorClick = (e) => {
      const targetUrl = e.currentTarget.getAttribute('href');
      if (
        targetUrl &&
        !targetUrl.startsWith('javascript:') &&
        !targetUrl.startsWith('#') &&
        !targetUrl.includes('mailto:') &&
        !targetUrl.includes('tel:')
      ) {
        setLoading(true);
        setProgress(35);
        setTimeout(() => setProgress(75), 150);
      }
    };

    const handleMutation = () => {
      const anchors = document.querySelectorAll('a[href]');
      anchors.forEach((a) => {
        if (!attachedAnchors.has(a)) {
          attachedAnchors.add(a);
          a.addEventListener('click', handleAnchorClick);
        }
      });
    };

    const timer = setTimeout(handleMutation, 0);
    const observer = new MutationObserver(handleMutation);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  if (!loading && progress === 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-1 bg-transparent overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-500 shadow-[0_0_10px_#3b82f6] transition-all duration-300 ease-out"
        style={{ width: `${progress}%`, opacity: progress === 100 ? 0 : 1 }}
      />
    </div>
  );
}

export default function TopLinearLoader() {
  return (
    <Suspense fallback={null}>
      <TopLinearLoaderContent />
    </Suspense>
  );
}
