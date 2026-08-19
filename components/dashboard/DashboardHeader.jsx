'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth-client';
import { ShieldCheck, UserCheck, Award, Bell, Search, Check, Send, Sparkles, Clock, X, Loader2, Copy, Gift, Download } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function DashboardHeader() {
  const { data: session, isPending: isSessionLoading } = useSession();
  const [profileData, setProfileData] = useState(null);
  const [activeSubscription, setActiveSubscription] = useState(null);
  const [isMembershipLoading, setIsMembershipLoading] = useState(true);
  const [subTimeLeft, setSubTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, isLifetime: false, isExpired: false });

  // Notification Center States
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [copiedCode, setCopiedCode] = useState('');
  const notifRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let timer = null;

    const loadProfile = async () => {
      try {
        const stored = localStorage.getItem('user_profile');
        if (stored && isMounted) {
          setProfileData(JSON.parse(stored));
        }
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data?.user && isMounted) {
            setProfileData(data.user);
            localStorage.setItem('user_profile', JSON.stringify(data.user));
            if (data.user.membership && (data.user.membership.status === 'active' || !data.user.membership.status)) {
              setActiveSubscription(data.user.membership);
              localStorage.setItem('user_membership', JSON.stringify(data.user.membership));
            } else {
              setActiveSubscription(null);
              localStorage.removeItem('user_membership');
            }
          }
        } else if (res.status === 401 && isMounted) {
          setProfileData(null);
          setActiveSubscription(null);
          localStorage.removeItem('user_profile');
          localStorage.removeItem('user_membership');
        }
      } catch (err) {
      } finally {
        timer = setTimeout(() => {
          if (isMounted) setIsMembershipLoading(false);
        }, 800);
      }
    };

    if (session?.user) {
      loadProfile();
    } else if (!isSessionLoading) {
      setActiveSubscription(null);
      localStorage.removeItem('user_membership');
      timer = setTimeout(() => {
        if (isMounted) setIsMembershipLoading(false);
      }, 800);
    }

    const handleProfileUpdate = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setProfileData(data.user);
            localStorage.setItem('user_profile', JSON.stringify(data.user));
            if (data.user.membership && data.user.membership.status === 'active') {
              setActiveSubscription(data.user.membership);
              localStorage.setItem('user_membership', JSON.stringify(data.user.membership));
            } else {
              setActiveSubscription(null);
              localStorage.removeItem('user_membership');
            }
          }
        }
      } catch (e) {}
      setIsMembershipLoading(false);
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [session, isSessionLoading]);

  // Live Subscription Timer Countdown for Active Membership
  useEffect(() => {
    if (!activeSubscription) return;

    if (activeSubscription.expiresAt === 'LIFETIME' || activeSubscription.planId === 'premium') {
      setSubTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLifetime: true, isExpired: false });
      return;
    }

    const expiryDateStr = activeSubscription.expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const expiryMs = new Date(expiryDateStr).getTime();

    const updateTimer = () => {
      const nowMs = Date.now();
      const diff = expiryMs - nowMs;

      if (isNaN(expiryMs) || diff <= 0) {
        setSubTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLifetime: false, isExpired: true });
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setSubTimeLeft({ days, hours, minutes, seconds, isLifetime: false, isExpired: false });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [activeSubscription]);

  const userRole = profileData?.role || session?.user?.role || 'user';
  const userName = profileData?.name || session?.user?.name || 'Developers Club User';
  const userEmail = profileData?.email || session?.user?.email || 'user@developersclub.com';
  const userImage = profileData?.image || session?.user?.image;
  const userInitial = userName.charAt(0).toUpperCase();
  const totalDownloads = typeof profileData?.totalDownloads === 'number'
    ? profileData.totalDownloads
    : (Array.isArray(profileData?.collections) ? profileData.collections.length : 0);
  const downloadsToday = profileData?.membership?.downloadsToday ?? activeSubscription?.downloadsToday ?? (totalDownloads > 0 ? totalDownloads : 0);
  const dailyLimit = profileData?.membership?.dailyLimit || activeSubscription?.dailyLimit || 5;

  // Mark notifications as read
  const markNotificationsAsRead = async () => {
    try {
      setUnreadCount(0);
      if (userRole === 'admin') {
        await fetch('/api/admin/guest-requests', { method: 'PATCH' });
      } else {
        await fetch('/api/user/guest-request', { method: 'PATCH' });
      }
    } catch (err) {
      console.error('Failed to mark notifications read:', err);
    }
  };

  // Fetch Notifications depending on role
  const fetchNotifications = async () => {
    try {
      setLoadingNotifs(true);
      if (userRole === 'admin') {
        const res = await fetch('/api/admin/guest-requests');
        if (res.ok) {
          const data = await res.json();
          if (data.requests) {
            setNotifications(data.requests);
            setUnreadCount(data.unreadCount || 0);
          }
        }
      } else {
        const res = await fetch('/api/user/guest-request');
        if (res.ok) {
          const data = await res.json();
          const allReqs = data.requests || (data.request ? [data.request] : []);
          setNotifications(allReqs);
          setUnreadCount(typeof data.unreadCount === 'number' ? data.unreadCount : 0);
        }
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoadingNotifs(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Polling every 15s
    return () => clearInterval(interval);
  }, [userRole]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Admin Handler: Send Dynamic 1-Time Coupon
  const handleAdminSendCoupon = async (requestId, userEmail, userName) => {
    try {
      setActionLoadingId(requestId);
      const res = await fetch('/api/admin/guest-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send-coupon',
          requestId,
          userEmail,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || `Guest coupon generated & sent to ${userName}!`);
        fetchNotifications();
      } else {
        toast.error(data.error || 'Failed to send coupon');
      }
    } catch (err) {
      toast.error('Server connection error!');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Admin Handler: Approve Guest Role
  const handleAdminApproveRole = async (requestId, userEmail, userName) => {
    try {
      setActionLoadingId(requestId);
      const res = await fetch('/api/admin/guest-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'approve',
          requestId,
          userEmail,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(`User "${userName}" role successfully updated to GUEST!`, {
          autoClose: 4000,
        });
        fetchNotifications();
        window.dispatchEvent(new Event('roleUpdated'));
      } else {
        toast.error(data.error || 'Failed to approve guest role');
      }
    } catch (err) {
      toast.error('Server connection error!');
    } finally {
      setActionLoadingId(null);
    }
  };

  const fallbackCopyText = (text) => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    } catch (e) {}
  };

  const copyToClipboard = (text) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).catch(() => fallbackCopyText(text));
      } else {
        fallbackCopyText(text);
      }
    } catch (e) {
      fallbackCopyText(text);
    }
    setCopiedCode(text);
    toast.success(`Coupon code ${text} copied!`);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
      {/* Left: Greeting */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex flex-col">
          <h2 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
            <span suppressHydrationWarning>Welcome, {userName.split(' ')[0]}</span>
            <span className="text-base">👋</span>
          </h2>
          <p className="text-[11px] font-medium text-slate-500">
            {userRole === 'admin'
              ? 'Developers Club System Admin Panel'
              : userRole === 'guest'
                ? 'Guest Free Trial Membership'
                : 'Pro Membership Dashboard'}
          </p>
        </div>
      </div>

      {/* Right: Role Badge, Notifications & Profile Card */}
      <div className="flex items-center gap-3.5 ml-auto relative">
        {/* Role Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200/80">
          {userRole === 'admin' ? (
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
          ) : userRole === 'guest' ? (
            <Award className="w-3.5 h-3.5 text-amber-500" />
          ) : (
            <UserCheck className="w-3.5 h-3.5 text-blue-600" />
          )}
          <span
            className={`text-[10px] font-black uppercase tracking-wider ${
              userRole === 'admin'
                ? 'text-purple-700'
                : userRole === 'guest'
                ? 'text-amber-700'
                : 'text-blue-700'
            }`}
          >
            {userRole ? userRole.toUpperCase() : 'USER'}
          </span>
        </div>

        {/* Dynamic User Daily Download Limit Badge (Only shown if user has active membership) */}
        {activeSubscription && (!subTimeLeft.isExpired || subTimeLeft.isLifetime) && (
          <Link
            href={
              userRole === 'admin'
                ? '/dashboard/admin/my-collections'
                : userRole === 'guest'
                ? '/dashboard/guest/my-collections'
                : '/dashboard/user/my-collections'
            }
            className="hidden sm:flex items-center gap-2.5 px-3 py-1 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-indigo-300 transition cursor-pointer group"
            title={`Daily Downloads: ${downloadsToday} of ${dailyLimit} used today | Total Downloads: ${totalDownloads}`}
          >
            <div className="w-6.5 h-6.5 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div className="flex flex-col justify-center leading-none">
              <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 mb-0.5">
                DAILY LIMIT
              </span>
              <div className="text-xs font-black flex items-center gap-1">
                <span className="text-emerald-600">{downloadsToday}</span>
                <span className="text-slate-300 font-normal">/</span>
                <span className="text-indigo-600">{dailyLimit}</span>
              </div>
            </div>
          </Link>
        )}

        {/* Interactive Notifications Icon Button */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => {
              const nextOpen = !isNotifOpen;
              setIsNotifOpen(nextOpen);
              fetchNotifications();
              if (nextOpen && unreadCount > 0) {
                markNotificationsAsRead();
              }
            }}
            className={`relative p-2 rounded-xl transition cursor-pointer ${
              isNotifOpen
                ? 'bg-blue-50 text-blue-600'
                : 'text-slate-500 hover:text-blue-600 hover:bg-slate-100'
            }`}
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 bg-blue-600 text-white font-extrabold text-[9px] rounded-full ring-2 ring-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* ========================================================================= */}
          {/* NOTIFICATION CENTER DROPDOWN POPOVER */}
          {/* ========================================================================= */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden z-50 animate-fadeIn">
              {/* Header */}
              <div className="p-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-extrabold text-slate-900">
                    {userRole === 'admin' ? 'Admin Guest Requests' : 'Notifications'}
                  </h3>
                </div>
                {unreadCount > 0 ? (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
                    {unreadCount} new
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full">
                    All read
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100">
                {loadingNotifs && notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-1.5 text-blue-600" />
                    <p className="text-xs">Loading notifications...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400">
                    <p className="text-xs font-medium">No new notifications</p>
                  </div>
                ) : userRole === 'admin' ? (
                  // ================= ADMIN VIEW =================
                  notifications.map((req) => (
                    <div key={req._id} className="p-4 hover:bg-slate-50/80 transition space-y-2.5 text-xs">
                      {/* User Info Header: Avatar, Name, Email */}
                      <div className="flex items-start gap-3">
                        {req.userImage ? (
                          <img
                            src={req.userImage}
                            alt={req.userName}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {req.userName ? req.userName.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="font-extrabold text-slate-900 truncate max-w-[140px]">
                              {req.userName}
                            </h4>
                            <span
                              className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                                req.status === 'REQUESTED'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : req.status === 'COUPON_SENT'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : req.status === 'COUPON_SUBMITTED'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {req.status === 'REQUESTED' && 'Coupon Requested'}
                              {req.status === 'COUPON_SENT' && 'Coupon Sent'}
                              {req.status === 'COUPON_SUBMITTED' && 'Pending Approval'}
                              {req.status === 'APPROVED' && 'Guest Active'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">{req.userEmail}</p>
                          
                          {/* Timestamps */}
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                            <span>Account: {req.userCreatedAt ? new Date(req.userCreatedAt).toLocaleDateString() : 'N/A'}</span>
                            <span>•</span>
                            <span>Req: {new Date(req.requestedAt || req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Details & Actions based on status */}
                      {req.status === 'REQUESTED' && (
                        <div className="pt-1 flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleAdminSendCoupon(req._id, req.userEmail, req.userName)}
                            disabled={actionLoadingId === req._id}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1.5 shadow-xs transition cursor-pointer disabled:opacity-50"
                          >
                            {actionLoadingId === req._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            <span>Generate & Send Coupon</span>
                          </button>
                        </div>
                      )}

                      {req.status === 'COUPON_SENT' && (
                        <div className="p-2 rounded-lg bg-purple-50 text-purple-800 text-[11px] flex items-center justify-between">
                          <span>Sent Code: <strong className="font-mono font-bold">{req.couponCode}</strong></span>
                          <span className="text-[10px] text-purple-600">Waiting for user</span>
                        </div>
                      )}

                      {req.status === 'COUPON_SUBMITTED' && (
                        <div className="space-y-2 pt-1">
                          <div className="p-2 rounded-lg bg-amber-50 text-amber-800 text-[11px] flex items-center justify-between">
                            <span>Submitted: <strong className="font-mono font-bold">{req.couponCode}</strong></span>
                            <span className="text-[10px] font-bold text-amber-600">Action Required</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleAdminApproveRole(req._id, req.userEmail, req.userName)}
                            disabled={actionLoadingId === req._id}
                            className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer disabled:opacity-50"
                          >
                            {actionLoadingId === req._id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>Approve Guest Role for {req.userName}</span>
                          </button>
                        </div>
                      )}

                      {req.status === 'APPROVED' && (
                        <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Guest role successfully approved</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  // ================= USER VIEW =================
                  notifications.map((req, idx) => (
                    <div key={idx} className="p-4 hover:bg-slate-50 transition space-y-2 text-xs">
                      {req.status === 'COUPON_SENT' && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-emerald-700 font-bold">
                            <Gift className="w-4 h-4 text-emerald-600" />
                            <span>Admin Sent Your Guest VIP Coupon!</span>
                          </div>
                          <p className="text-[11px] text-slate-600">
                            Use this coupon code on your profile page to apply for Guest access:
                          </p>
                          <div className="flex items-center justify-between p-2.5 bg-slate-100 rounded-xl font-mono font-bold text-blue-700">
                            <span>{req.couponCode}</span>
                            <button
                              onClick={() => copyToClipboard(req.couponCode)}
                              className="px-2 py-1 bg-white hover:bg-slate-200 text-slate-800 text-[10px] font-bold rounded-lg border flex items-center gap-1"
                            >
                              {copiedCode === req.couponCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedCode === req.couponCode ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                          <Link
                            href="/dashboard/user/my-profile"
                            onClick={() => setIsNotifOpen(false)}
                            className="block text-center py-1.5 bg-blue-600 text-white font-bold rounded-xl text-[11px] hover:bg-blue-700 transition"
                          >
                            Go to Profile & Submit
                          </Link>
                        </div>
                      )}

                      {req.status === 'COUPON_SUBMITTED' && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-amber-700 font-bold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Request Pending Admin Review</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Your coupon is verified and submitted. Admin will activate your Guest role shortly.
                          </p>
                        </div>
                      )}

                      {req.status === 'APPROVED' && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-purple-700 font-bold">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>🎉 Congratulations! Guest Role Approved!</span>
                          </div>
                          <p className="text-[11px] text-slate-600">
                            You now have full Guest access to plugins and resources.
                          </p>
                        </div>
                      )}

                      {req.status === 'REJECTED' && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-amber-800 font-bold">
                            <span>❌ Request Declined</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Your Guest Role request was rejected by Admin.
                          </p>
                        </div>
                      )}

                      {req.status === 'DELETED' && (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-red-600 font-bold">
                            <span>🗑️ Request Cancelled</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            Your request was deleted/cancelled by Admin.
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <Link
                  href={
                    userRole === 'admin'
                      ? '/dashboard/admin/all-notifications'
                      : userRole === 'guest'
                      ? '/dashboard/guest/all-notifications'
                      : '/dashboard/user/all-notifications'
                  }
                  onClick={() => setIsNotifOpen(false)}
                  className="text-[11px] font-bold text-blue-600 hover:underline"
                >
                  View All Notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Get Membership CTA Button OR Active Membership Live Countdown Display OR Professional Loading Spinner (Matches Homepage Header) */}
        {isMembershipLoading || isSessionLoading ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs font-medium text-slate-500">
            <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin shrink-0" />
            <span className="text-[11px] font-bold text-slate-400">Checking status...</span>
          </div>
        ) : activeSubscription && (!subTimeLeft.isExpired || subTimeLeft.isLifetime) ? (
          <Link
            href="/membership"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-400 text-slate-800 shadow-2xs transition"
            title="Active Membership Status & Expiration Countdown"
          >
            <Clock className="w-3.5 h-3.5 text-red-500 shrink-0 animate-pulse" />
            <div className="flex items-center gap-1.5 text-xs font-bold whitespace-nowrap">
              <span className="text-slate-800 font-extrabold uppercase tracking-wider text-[11px] truncate max-w-[85px]">
                {(activeSubscription.planId || activeSubscription.planTitle || 'PRO').toUpperCase()}
              </span>
              <span className="text-slate-300 font-normal">•</span>
              {subTimeLeft.isLifetime ? (
                <span className="text-red-500 font-black text-xs">LIFETIME</span>
              ) : (
                <span className="text-red-500 font-bold font-mono text-xs tracking-tight">
                  {subTimeLeft.days}d {String(subTimeLeft.hours).padStart(2, '0')}h {String(subTimeLeft.minutes).padStart(2, '0')}m {String(subTimeLeft.seconds).padStart(2, '0')}s
                </span>
              )}
            </div>
          </Link>
        ) : (
          <Link
            href="/membership"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs shadow-xs transition hover:scale-102 cursor-pointer"
          >
            <Gift className="w-4 h-4 text-indigo-200" />
            <span>Membership</span>
          </Link>
        )}
      </div>
    </header>
  );
}
