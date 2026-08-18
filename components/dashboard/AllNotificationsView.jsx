'use client';

import { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Loader2,
  Trash2,
  Check,
  Send,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Gift,
  Clock,
  ShieldCheck,
  Copy,
  XCircle,
  AlertTriangle,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import Link from 'next/link';

export default function AllNotificationsView({ userRole = 'user' }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Pagination states (Per page 10 items)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRequests, setTotalRequests] = useState(0);

  // Specific per-button loading key state (e.g. 'delete-id', 'reject-id')
  const [loadingKey, setLoadingKey] = useState(null);
  const [copiedCode, setCopiedCode] = useState('');

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true);
      if (userRole === 'admin') {
        const res = await fetch(
          `/api/admin/guest-requests?page=${page}&limit=10&status=${statusFilter}&search=${encodeURIComponent(search)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.requests) {
            setRequests(data.requests);
            setCurrentPage(data.page || page);
            setTotalPages(data.totalPages || 1);
            setTotalRequests(data.totalRequests || 0);
          }
        }
      } else {
        const res = await fetch('/api/user/guest-request');
        if (res.ok) {
          const data = await res.json();
          const allReqs = data.requests || (data.request ? [data.request] : []);
          setRequests(allReqs);
          setTotalPages(Math.max(1, Math.ceil(allReqs.length / 10)));
          setTotalRequests(allReqs.length);
        }
      }
    } catch (err) {
      console.error('Fetch notifications error:', err);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Mark notifications as read when opening page
  useEffect(() => {
    const markRead = async () => {
      try {
        if (userRole === 'admin') {
          await fetch('/api/admin/guest-requests', { method: 'PATCH' });
        } else {
          await fetch('/api/user/guest-request', { method: 'PATCH' });
        }
      } catch (e) {}
    };
    markRead();
  }, [userRole]);

  useEffect(() => {
    fetchNotifications(1);
  }, [statusFilter, userRole]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNotifications(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchNotifications(newPage);
    }
  };

  // Admin Handler: Send Dynamic Coupon
  const handleAdminSendCoupon = async (requestId, userEmail, userName) => {
    const key = `send-coupon-${requestId}`;
    try {
      setLoadingKey(key);
      const res = await fetch('/api/admin/guest-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send-coupon', requestId, userEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.info('Coupon sent', { autoClose: 2000 });
        fetchNotifications(currentPage);
      } else {
        toast.error(data.error || 'Failed to send coupon', { autoClose: 2000 });
      }
    } catch (err) {
      toast.error('Server connection error', { autoClose: 2000 });
    } finally {
      setLoadingKey(null);
    }
  };

  // Admin Handler: Approve Role
  const handleAdminApproveRole = async (requestId, userEmail, userName) => {
    const key = `approve-${requestId}`;
    try {
      setLoadingKey(key);
      const res = await fetch('/api/admin/guest-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', requestId, userEmail }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Guest role approved', { autoClose: 2000 });
        fetchNotifications(currentPage);
        window.dispatchEvent(new Event('roleUpdated'));
      } else {
        toast.error(data.error || 'Failed to approve role', { autoClose: 2000 });
      }
    } catch (err) {
      toast.error('Server error', { autoClose: 2000 });
    } finally {
      setLoadingKey(null);
    }
  };

  // Admin Handler: Reject Request (Warning Toast)
  const handleAdminReject = async (requestId, userName) => {
    const key = `reject-${requestId}`;
    try {
      setLoadingKey(key);
      const res = await fetch('/api/admin/guest-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', requestId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.warning('Request rejected', { autoClose: 2000 });
        fetchNotifications(currentPage);
      } else {
        toast.error(data.error || 'Failed to reject request', { autoClose: 2000 });
      }
    } catch (err) {
      toast.error('Server error', { autoClose: 2000 });
    } finally {
      setLoadingKey(null);
    }
  };

  // Admin Handler: Delete Request (Error Toast)
  const handleAdminDelete = async (requestId, userName) => {
    const key = `delete-${requestId}`;
    try {
      setLoadingKey(key);
      const res = await fetch('/api/admin/guest-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', requestId }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.error('Request deleted', { autoClose: 2000 });
        fetchNotifications(currentPage);
      } else {
        toast.error(data.error || 'Failed to delete notification', { autoClose: 2000 });
      }
    } catch (err) {
      toast.error('Server error', { autoClose: 2000 });
    } finally {
      setLoadingKey(null);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Code ${code} copied!`, { autoClose: 2000 });
    setTimeout(() => setCopiedCode(''), 2000);
  };

  // User side pagination slice
  const displayedRequests =
    userRole === 'admin'
      ? requests
      : requests.slice((currentPage - 1) * 10, currentPage * 10);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            <span>All Notifications & Guest Requests</span>
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            {userRole === 'admin'
              ? 'Manage, respond, approve, reject or delete guest role requests'
              : 'Track your guest access requests, coupon codes, and responses'}
          </p>
        </div>

        {/* Filter Controls (Admin Only) */}
        {userRole === 'admin' && (
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-60">
              <input
                type="text"
                placeholder="Search name, email or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 pl-8 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition shadow-2xs font-medium"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </form>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-bold shadow-2xs cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="REQUESTED">Requested (Waiting Coupon)</option>
              <option value="COUPON_SENT">Coupon Sent</option>
              <option value="COUPON_SUBMITTED">Submitted (Pending Approval)</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Notifications Table List Container (Compact Layout) */}
      <div className="rounded-2xl bg-white border border-slate-200 p-5 overflow-hidden shadow-2xs relative space-y-3">
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-xs font-semibold">Loading notification records...</p>
          </div>
        ) : displayedRequests.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <Bell className="w-7 h-7 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold text-slate-700">No Notifications Found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">There are no guest requests matching your filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {displayedRequests.map((req) => (
              <div
                key={req._id}
                className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-slate-50/70 transition px-2.5 rounded-xl text-xs"
              >
                {/* Left: User Avatar & Compact Request Details */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {req.userImage ? (
                    <img
                      src={req.userImage}
                      alt={req.userName}
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {req.userName ? req.userName.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}

                  <div className="space-y-0.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-slate-900">{req.userName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({req.userEmail})</span>
                      
                      {/* Compact Status Tag */}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                          req.status === 'REQUESTED'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : req.status === 'COUPON_SENT'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : req.status === 'COUPON_SUBMITTED'
                            ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                            : req.status === 'APPROVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : req.status === 'REJECTED'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                      >
                        {req.status === 'REQUESTED' && 'Waiting Coupon'}
                        {req.status === 'COUPON_SENT' && 'Coupon Sent'}
                        {req.status === 'COUPON_SUBMITTED' && 'Pending Approval'}
                        {req.status === 'APPROVED' && 'Approved'}
                        {req.status === 'REJECTED' && 'Rejected'}
                        {req.status === 'DELETED' && 'Deleted'}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600">
                      {req.status === 'REQUESTED' && (
                        <span>Requested 1-Time VIP Guest Coupon code for Guest Role upgrade.</span>
                      )}
                      {req.status === 'COUPON_SENT' && (
                        <span>
                          Admin sent Guest Coupon: <strong className="font-mono text-purple-700">{req.couponCode}</strong>
                        </span>
                      )}
                      {req.status === 'COUPON_SUBMITTED' && (
                        <span>
                          Verified coupon <strong className="font-mono text-amber-700">{req.couponCode}</strong> submitted. Awaiting Admin final approval.
                        </span>
                      )}
                      {req.status === 'APPROVED' && (
                        <span>🎉 Guest Role membership is active & approved.</span>
                      )}
                      {req.status === 'REJECTED' && (
                        <span className="text-amber-800">❌ Request Declined: Your Guest Role request was rejected by Admin.</span>
                      )}
                      {req.status === 'DELETED' && (
                        <span className="text-red-600">🗑️ Request Cancelled: Your request was deleted by Admin.</span>
                      )}
                    </p>

                    {/* Metadata Timestamps */}
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium pt-0.5">
                      <span>Account: {req.userCreatedAt ? new Date(req.userCreatedAt).toLocaleDateString() : 'N/A'}</span>
                      <span>•</span>
                      <span>Requested: {new Date(req.requestedAt || req.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions (Isolated Per-Button Loading State) */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {userRole === 'admin' ? (
                    <>
                      {req.status === 'REQUESTED' && (
                        <button
                          type="button"
                          onClick={() => handleAdminSendCoupon(req._id, req.userEmail, req.userName)}
                          disabled={!!loadingKey}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition cursor-pointer disabled:opacity-50"
                        >
                          {loadingKey === `send-coupon-${req._id}` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          <span>Send Coupon</span>
                        </button>
                      )}

                      {req.status === 'COUPON_SUBMITTED' && (
                        <button
                          type="button"
                          onClick={() => handleAdminApproveRole(req._id, req.userEmail, req.userName)}
                          disabled={!!loadingKey}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition cursor-pointer disabled:opacity-50"
                        >
                          {loadingKey === `approve-${req._id}` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                          <span>Approve Guest</span>
                        </button>
                      )}

                      {/* Reject Button */}
                      {req.status !== 'APPROVED' && req.status !== 'REJECTED' && (
                        <button
                          type="button"
                          onClick={() => handleAdminReject(req._id, req.userName)}
                          disabled={!!loadingKey}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs flex items-center gap-1 transition cursor-pointer disabled:opacity-50"
                          title="Reject Guest Request"
                        >
                          {loadingKey === `reject-${req._id}` ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-800" />
                          ) : (
                            <X className="w-3.5 h-3.5" />
                          )}
                          <span>Reject</span>
                        </button>
                      )}

                      {/* Delete Notification Button */}
                      <button
                        type="button"
                        onClick={() => handleAdminDelete(req._id, req.userName)}
                        disabled={!!loadingKey}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition cursor-pointer disabled:opacity-50"
                        title="Delete notification entry"
                      >
                        {loadingKey === `delete-${req._id}` ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </>
                  ) : (
                    // User View Actions
                    req.couponCode && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => copyCode(req.couponCode)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono font-bold text-[11px] rounded-xl flex items-center gap-1 transition cursor-pointer border"
                        >
                          {copiedCode === req.couponCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedCode === req.couponCode ? 'Copied' : req.couponCode}</span>
                        </button>
                        {req.status === 'COUPON_SENT' && (
                          <Link
                            href="/dashboard/user/my-profile"
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition shadow-2xs"
                          >
                            Apply in Profile
                          </Link>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination Controls (Per page 10 items) */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 mt-4 border-t border-slate-100 text-xs font-semibold text-slate-600">
            <div>
              Showing <span className="font-bold text-slate-900">{Math.min(totalRequests, (currentPage - 1) * 10 + 1)}</span> to{' '}
              <span className="font-bold text-slate-900">{Math.min(totalRequests, currentPage * 10)}</span> of{' '}
              <span className="font-bold text-slate-900">{totalRequests}</span> notifications
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => handlePageChange(pageNumber)}
                    className={`px-3 py-1.5 rounded-xl transition cursor-pointer border ${
                      currentPage === pageNumber
                        ? 'bg-blue-600 border-blue-600 text-white font-extrabold'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {pageNumber}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
