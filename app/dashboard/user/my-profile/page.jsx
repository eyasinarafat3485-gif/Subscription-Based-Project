'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth-client';
import { User, Mail, Save, CheckCircle, Camera, Lock, Loader2, Sparkles, Send, Gift, Clock, ShieldCheck, Copy, Check } from 'lucide-react';
import { toast } from 'react-toastify';

export default function UserMyProfilePage() {
  const { data: session } = useSession();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    image: '',
    role: 'user',
    plan: 'PRO Membership (User)',
  });
  const [initialData, setInitialData] = useState({
    name: '',
    image: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Guest Request & Coupon state
  const [guestRequest, setGuestRequest] = useState(null);
  const [requestLoading, setRequestLoading] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponSubmitting, setCouponSubmitting] = useState(false);
  const [copiedCoupon, setCopiedCoupon] = useState(false);

  // 1-Hour Cooldown Timer State (in seconds)
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cooldown countdown timer effect (runs only after a request is rejected or deleted)
  useEffect(() => {
    if (guestRequest && (guestRequest.status === 'REJECTED' || guestRequest.status === 'DELETED')) {
      const reqTime = new Date(
        guestRequest.rejectedAt ||
        guestRequest.deletedAt ||
        guestRequest.updatedAt ||
        guestRequest.requestedAt ||
        guestRequest.createdAt
      ).getTime();
      const oneHourMs = 60 * 60 * 1000;

      const calcRemaining = () => {
        const now = Date.now();
        const diffMs = now - reqTime;
        if (diffMs < oneHourMs) {
          const rem = Math.ceil((oneHourMs - diffMs) / 1000);
          setCooldownSeconds(rem);
        } else {
          setCooldownSeconds(0);
        }
      };

      calcRemaining();
      const timer = setInterval(calcRemaining, 1000);
      return () => clearInterval(timer);
    } else {
      setCooldownSeconds(0);
    }
  }, [guestRequest]);

  const formatCooldownTime = (secs) => {
    if (secs <= 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const fetchProfileAndGuestStatus = async () => {
    try {
      setFetching(true);
      // 1. Fetch Profile
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          const fetchedName = data.user.name || session?.user?.name || '';
          const fetchedImage = data.user.image || session?.user?.image || '';
          const currentRole = data.user.role || 'user';

          setFormData({
            name: fetchedName,
            email: data.user.email || session?.user?.email || '',
            image: fetchedImage,
            role: currentRole,
            plan: currentRole === 'guest' ? 'GUEST (Trial Access)' : currentRole === 'admin' ? 'ADMIN (Full Access)' : 'PRO (Regular User)',
          });
          setInitialData({
            name: fetchedName,
            image: fetchedImage,
          });
        }
      }

      // 2. Fetch Guest Request Status
      const guestRes = await fetch('/api/user/guest-request');
      if (guestRes.ok) {
        const guestData = await guestRes.json();
        if (guestData?.request) {
          setGuestRequest(guestData.request);
          if (guestData.request.couponCode && guestData.request.status === 'COUPON_SENT') {
            setCouponInput(guestData.request.couponCode);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchProfileAndGuestStatus();
  }, [session]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image file size must be under 2MB!');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, image: reader.result }));
        toast.info('Previewing new profile picture, click Save Changes button to confirm');
      };
      reader.readAsDataURL(file);
    }
  };

  const isChanged =
    formData.name !== initialData.name ||
    formData.image !== initialData.image;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isChanged) return;
    try {
      setLoading(true);
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          image: formData.image,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSaved(true);
        setInitialData({
          name: formData.name,
          image: formData.image,
        });
        toast.success(data.message || 'Profile updated successfully!');
        localStorage.setItem('user_profile', JSON.stringify(data.user));
        window.dispatchEvent(new Event('profileUpdated'));
        setTimeout(() => setSaved(false), 3000);
      } else {
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (err) {
      toast.error('Server connection error!');
    } finally {
      setLoading(false);
    }
  };

  // Handler: Request Guest Role from Admin
  const handleRequestGuestRole = async () => {
    if (cooldownSeconds > 0) {
      toast.error(`Please wait ${formatCooldownTime(cooldownSeconds)} before requesting again!`, { autoClose: 3000 });
      return;
    }

    try {
      setRequestLoading(true);
      const res = await fetch('/api/user/guest-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setGuestRequest(data.request);
        toast.success(data.message || 'Guest request submitted to Admin!');
      } else {
        toast.error(data.error || 'Failed to submit request');
      }
    } catch (err) {
      toast.error('Server connection error!');
    } finally {
      setRequestLoading(false);
    }
  };

  // Handler: Submit Coupon Code for Guest Role
  const handleSubmitCoupon = async (e) => {
    e.preventDefault();
    if (!couponInput.trim()) {
      toast.error('Please enter a coupon code!');
      return;
    }

    try {
      setCouponSubmitting(true);
      const res = await fetch('/api/user/guest-request', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: couponInput.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setGuestRequest(data.request);
        toast.info('⏳ Request Pending: Coupon verified! Waiting for Admin final approval.', {
          autoClose: 5000,
        });
      } else {
        toast.error(data.error || 'Failed to verify coupon code');
      }
    } catch (err) {
      toast.error('Server connection error!');
    } finally {
      setCouponSubmitting(false);
    }
  };

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(true);
    toast.success(`Coupon code ${code} copied!`);
    setTimeout(() => setCopiedCoupon(false), 2000);
  };

  const isPageLoading = !mounted || fetching;
  const isGuest = formData.role === 'guest';

  return (
    <div className="space-y-6 max-w-4xl relative">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-slate-500 text-xs mt-1">Manage your account details and request Guest role upgrade.</p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6 relative min-h-[350px]">
        {isPageLoading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-slate-500 z-20 rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-semibold">Loading profile...</p>
          </div>
        )}

        {/* User Card Header */}
        <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
          <div className="relative group shrink-0">
            {formData.image ? (
              <img
                src={formData.image}
                alt={formData.name || 'User'}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-blue-500 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-3xl flex items-center justify-center border-4 border-blue-400 shadow-md">
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md border-2 border-white transition-transform hover:scale-110 cursor-pointer"
              title="Upload photo"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {formData.name || 'User'}
              <span
                className={`px-2.5 py-0.5 rounded-full border text-[10px] font-black uppercase tracking-wider ${
                  isGuest
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-blue-50 text-blue-600 border-blue-200'
                }`}
              >
                {formData.role.toUpperCase()}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{formData.email}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Upload profile picture</span>
            </button>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Your Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
                  required
                />
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5 flex items-center justify-between">
                <span>Email Address</span>
                <span className="text-[10px] text-slate-400 font-normal flex items-center gap-1">
                  <Lock className="w-3 h-3 text-slate-400" />
                  Read-only
                </span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  disabled
                  className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-500 font-medium cursor-not-allowed select-none"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Current Membership Level</label>
            <input
              type="text"
              value={formData.plan}
              disabled
              className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-600 font-bold cursor-not-allowed select-none"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading || !isChanged}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <CheckCircle className="w-4 h-4 text-emerald-300" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{loading ? 'Saving...' : saved ? 'Saved' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* ========================================================================= */}
      {/* PROFESSIONAL ROLE & GUEST MEMBERSHIP UPGRADE REQUEST CARD */}
      {/* ========================================================================= */}
      {!isGuest && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-200">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Guest Role & VIP Access</h3>
                <p className="text-[11px] text-slate-500">Request a single-use coupon from Admin to unlock Guest trial features</p>
              </div>
            </div>

            {/* Current Request Status Badge */}
            {guestRequest && (
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  guestRequest.status === 'REQUESTED'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : guestRequest.status === 'COUPON_SENT'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse'
                    : guestRequest.status === 'COUPON_SUBMITTED'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : guestRequest.status === 'APPROVED'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {guestRequest.status === 'REQUESTED' && 'Waiting for Admin Coupon'}
                {guestRequest.status === 'COUPON_SENT' && 'Coupon Received!'}
                {guestRequest.status === 'COUPON_SUBMITTED' && 'Pending Admin Approval'}
                {guestRequest.status === 'APPROVED' && 'Approved as Guest'}
                {guestRequest.status === 'REJECTED' && 'Request Declined'}
                {guestRequest.status === 'DELETED' && 'Request Cancelled'}
              </span>
            )}
          </div>

          {/* STATE 1: No active request made yet (or previous request was rejected/deleted) */}
          {(!guestRequest || guestRequest.status === 'REJECTED' || guestRequest.status === 'DELETED') && (
            <div className="p-5 rounded-xl bg-white border border-slate-200/80 space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Click the button below to submit a <strong>Guest Access Request</strong> to the Admin. Once submitted, the Admin will generate and send your 1-time VIP Coupon Code directly to your notifications and email.
              </p>

              {/* Single Live 1-Hour Cooldown Timer Notice */}
              {cooldownSeconds > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-3 font-medium">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
                    <span>1-Hour Cooldown Active. You can submit a new request in:</span>
                  </div>
                  <span className="font-mono font-black text-sm text-amber-800 bg-white px-3 py-1 rounded-lg border border-amber-300 shrink-0 shadow-2xs">
                    {formatCooldownTime(cooldownSeconds)}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={handleRequestGuestRole}
                disabled={requestLoading || cooldownSeconds > 0}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-amber-500/20 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {requestLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {cooldownSeconds > 0
                    ? `Please wait (${formatCooldownTime(cooldownSeconds)})`
                    : 'Request Guest Role & Coupon'}
                </span>
              </button>
            </div>
          )}

          {/* STATE 2: Request sent & waiting for Admin coupon */}
          {guestRequest && guestRequest.status === 'REQUESTED' && (
            <div className="p-5 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-3">
              <div className="flex items-center gap-2 text-blue-800 font-bold text-xs">
                <Clock className="w-4 h-4 text-blue-600 animate-spin" />
                <span>Guest Request Sent to Admin</span>
              </div>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Your request has been submitted on <strong>{new Date(guestRequest.requestedAt || guestRequest.createdAt).toLocaleDateString()}</strong>. The Admin will review and send your dynamic coupon code shortly.
              </p>
              <div className="pt-2">
                <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Already received your Coupon Code?</label>
                <form onSubmit={handleSubmitCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter GUEST-XXXXX code"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                    className="flex-1 max-w-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 uppercase focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={couponSubmitting}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition disabled:opacity-50 cursor-pointer"
                  >
                    {couponSubmitting ? 'Verifying...' : 'Submit Coupon'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* STATE 3: Coupon Sent by Admin */}
          {guestRequest && guestRequest.status === 'COUPON_SENT' && (
            <div className="p-5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 space-y-4">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <Gift className="w-4 h-4 text-emerald-600" />
                <span>Admin has sent your 1-Time VIP Coupon!</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Copy the code below or submit it directly to request final Guest role activation:
              </p>

              <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-emerald-200/80 max-w-md">
                <span className="font-mono font-black text-sm text-emerald-700 tracking-widest flex-1">
                  {guestRequest.couponCode}
                </span>
                <button
                  type="button"
                  onClick={() => copyCouponCode(guestRequest.couponCode)}
                  className="px-3 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedCoupon ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCoupon ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <form onSubmit={handleSubmitCoupon} className="pt-1 flex gap-2">
                <input
                  type="hidden"
                  value={guestRequest.couponCode}
                />
                <button
                  type="submit"
                  disabled={couponSubmitting}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {couponSubmitting ? 'Verifying...' : 'Submit Coupon & Apply for Guest Role'}
                </button>
              </form>
            </div>
          )}

          {/* STATE 4: Coupon Submitted -> Pending Admin Final Review */}
          {guestRequest && guestRequest.status === 'COUPON_SUBMITTED' && (
            <div className="p-5 rounded-xl bg-amber-50/80 border border-amber-200 space-y-2.5">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Request Pending Admin Final Approval</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Coupon <strong>{guestRequest.couponCode}</strong> has been verified. Your request has been queued in the Admin notification center. Once the Admin approves your role, you will automatically receive Guest access!
              </p>
            </div>
          )}

          {/* STATE 5: Approved */}
          {guestRequest && guestRequest.status === 'APPROVED' && (
            <div className="p-5 rounded-xl bg-purple-50/80 border border-purple-200 space-y-2">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                <span>Guest Role Approved!</span>
              </div>
              <p className="text-[11px] text-purple-800">
                Congratulations! Your Guest membership is active.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
