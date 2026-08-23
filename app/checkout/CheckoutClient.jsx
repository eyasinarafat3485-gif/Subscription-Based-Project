'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  CreditCard,
  ShieldCheck,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Tag,
  Loader2,
  ArrowLeft,
  Download
} from 'lucide-react';
import ConfirmDownloadModal from '@/components/ConfirmDownloadModal';

const PLAN_DETAILS = {
  basic: {
    id: 'basic',
    title: 'Basic Membership Plan',
    price: 499,
    regularPrice: 899,
    billing: 'Monthly',
    downloads: '5 Downloads per Day',
  },
  standard: {
    id: 'standard',
    title: 'Standard Membership Plan',
    price: 999,
    regularPrice: 2199,
    billing: 'Yearly',
    downloads: '10 Downloads per Day',
  },
  premium: {
    id: 'premium',
    title: 'Premium Membership Plan',
    price: 1999,
    regularPrice: 5199,
    billing: 'Lifetime',
    downloads: '20 Downloads per Day',
  },
};

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();

  const planParam = searchParams.get('plan') || 'standard';
  const productParam = searchParams.get('product');

  useEffect(() => {
    document.title = 'Checkout | Developers Club';
  }, []);


  const [selectedProduct, setSelectedProduct] = useState(null);

  const plan = selectedProduct
    ? {
      id: selectedProduct.slug || 'custom-item',
      title: selectedProduct.title,
      price: Number(selectedProduct.price) || 499,
      regularPrice: Number(selectedProduct.regularPrice) || 899,
      billing: 'Single Purchase / Access',
      downloads: 'Instant Product Download',
    }
    : (PLAN_DETAILS[planParam] || PLAN_DETAILS.standard);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    senderAccount: '',
    transactionId: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('nagad');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [showCouponInput, setShowCouponInput] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);

  const [errors, setErrors] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!productParam) return;
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${encodeURIComponent(productParam)}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.product) {
            setSelectedProduct(data.product);
          }
        }
      } catch (err) {
        console.error('Failed to fetch product for checkout:', err);
      }
    };
    fetchProduct();
  }, [productParam]);

  const [userMembership, setUserMembership] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setFormData((prev) => ({
              ...prev,
              name: data.user.name || '',
              email: data.user.email || '',
            }));
            if (data.user.membership && (data.user.membership.status === 'active' || !data.user.membership.status)) {
              setUserMembership(data.user.membership);
            }
          }
        }
      } catch (err) { }
    };

    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    if (couponCode.trim().toUpperCase() === 'DEVCLUB10' || couponCode.trim().toUpperCase() === 'OFFER2026') {
      const discountAmount = Math.round(plan.price * 0.1);
      setDiscount(discountAmount);
      setCouponApplied(true);
    } else {
      alert('Invalid Coupon Code! Try DEVCLUB10');
    }
  };

  const validateForm = () => {
    const errs = [];
    const fields = {};

    if (!session?.user && !formData.name?.trim()) {
      errs.push('Full Name is a required field.');
      fields.name = 'Full Name is required.';
    }
    if (!session?.user && !formData.email?.trim()) {
      errs.push('Email Address is a required field.');
      fields.email = 'Email Address is required.';
    }
    if (!formData.phone?.trim()) {
      errs.push('Billing Phone is a required field.');
      fields.phone = 'Billing Phone is required.';
    }
    if (!formData.senderAccount?.trim()) {
      errs.push('Sender Account Number is required.');
      fields.senderAccount = 'Sender Account Number is required.';
    }
    if (!formData.transactionId?.trim()) {
      errs.push('Transaction ID is required.');
      fields.transactionId = 'Transaction ID is required.';
    }
    if (!agreedTerms) {
      errs.push('You must accept the terms and conditions to place your order.');
      fields.terms = 'You must accept the terms and conditions.';
    }

    setErrors(errs);
    setFieldErrors(fields);
    return errs.length === 0;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    try {
      setSubmitting(true);

      const finalPrice = Math.max(0, plan.price - discount);

      const payload = {
        isVisitor: !session?.user,
        type: selectedProduct ? 'product' : 'membership',
        productId: selectedProduct?._id || selectedProduct?.id || selectedProduct?.slug || null,
        productTitle: selectedProduct?.title || null,
        productSlug: selectedProduct?.slug || null,
        productImage: selectedProduct?.image || selectedProduct?.thumbnail || selectedProduct?.featuredImage || selectedProduct?.coverImage || null,
        price: finalPrice,
        planId: selectedProduct ? null : plan.id,
        planTitle: selectedProduct ? null : plan.title,
        planPrice: finalPrice,
        billingName: session?.user ? (formData.name || session.user.name || '') : formData.name,
        billingPhone: formData.phone,
        billingEmail: session?.user ? (formData.email || session.user.email || '') : formData.email,
        password: formData.password || 'secured',
        paymentMethod,
        senderAccount: formData.senderAccount,
        transactionId: formData.transactionId,
        couponCode: couponApplied ? couponCode : null,
      };

      const res = await fetch('/api/checkout/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmitSuccess(true);
        if (data.membership) {
          localStorage.setItem('user_membership', JSON.stringify(data.membership));
        }

        setTimeout(() => {
          router.push('/membership');
        }, 1500);
      } else {
        setErrors([data.error || 'Failed to place order. Please try again.']);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      console.error('Submit order error:', err);
      setErrors(['Network error occurred while submitting order.']);
    } finally {
      setSubmitting(false);
    }
  };

  const finalTotal = Math.max(0, plan.price - discount);

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white flex flex-col justify-between">
      <div>
        <Header />

        <main className="py-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">

          {/* Top Banner Notice */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Pay Now
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Instant Auto Access - After Payment!
              </p>
            </div>
          </div>

          {/* Top Error Alert Banner */}
          {errors.length > 0 && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl space-y-1 animate-shake">
              <div className="flex items-center gap-2 text-red-700 font-extrabold text-xs">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Please fix the following validation errors:</span>
              </div>
              <ul className="list-disc list-inside text-xs text-red-600 font-medium space-y-0.5 pl-5">
                {errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Success Banner */}
          {submitSuccess && (
            <div className="bg-indigo-50 border border-indigo-300 p-5 rounded-2xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-indigo-600 mx-auto animate-bounce" />
              <h3 className="text-lg font-black text-indigo-900">Payment Successful!</h3>
              <p className="text-xs text-indigo-700 font-semibold">
                Your membership plan has been activated. Redirecting to your membership dashboard...
              </p>
            </div>
          )}

          {/* Active Membership Banner for Direct Download */}
          {userMembership && productParam && (
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-200">
                    ACTIVE MEMBERSHIP UNLOCKED
                  </span>
                  <h3 className="text-base font-black text-white leading-tight">
                    You Have Active Membership!
                  </h3>
                  <p className="text-xs text-emerald-100 font-medium mt-0.5">
                    No payment required! Download this product for FREE with your active plan.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(true)}
                className="px-5 py-3 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-black text-xs shadow-md transition flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Confirm & Download Free</span>
              </button>
            </div>
          )}

          {/* Already have an account notice bar */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 text-xs font-semibold text-slate-600 shadow-2xs">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-extrabold underline">
              Click here to login
            </Link>
          </div>

          {/* Main 2-Column Form Layout */}
          <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

            {/* Left Column: Billing Details */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
              <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center justify-between">
                <span>Billing Details</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                  {session?.user ? 'Account Verified' : 'Guest Checkout'}
                </span>
              </h2>

              {session?.user ? (
                <>
                  <div className="space-y-1">
                    <label className="block text-xs font-extrabold text-slate-700">
                      Name <span className="text-slate-400 font-semibold">(Verified)</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || session.user.name || ''}
                      readOnly
                      tabIndex={-1}
                      className="w-full px-4 py-3 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed select-none focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-extrabold text-slate-700">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter Phone Number (e.g. 017XXXXXXXX)"
                      autoFocus
                      className={`w-full px-4 py-3 bg-white border rounded-xl text-xs font-bold text-slate-900 focus:outline-none transition ${fieldErrors.phone
                        ? 'border-indigo-600 ring-1 ring-indigo-500'
                        : 'border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500'
                        }`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-[11px] font-extrabold text-red-600 mt-1">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-extrabold text-slate-700">
                      Email Address <span className="text-slate-400 font-semibold">(Verified)</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || session.user.email || ''}
                      readOnly
                      tabIndex={-1}
                      className="w-full px-4 py-3 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed select-none focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-extrabold text-slate-700">
                      Account Password <span className="text-slate-400 font-semibold">(Auto Secured)</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      value="••••••••••••"
                      readOnly
                      tabIndex={-1}
                      className="w-full px-4 py-3 bg-slate-100/90 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 cursor-not-allowed select-none focus:outline-none"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="block text-xs font-extrabold text-slate-700">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter Full Name"
                      className={`w-full px-4 py-3 bg-white border rounded-xl text-xs font-bold text-slate-900 focus:outline-none transition ${fieldErrors.name
                        ? 'border-indigo-600 ring-1 ring-indigo-500'
                        : 'border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500'
                        }`}
                    />
                    {fieldErrors.name && (
                      <p className="text-[11px] font-extrabold text-red-600 mt-1">{fieldErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-extrabold text-slate-700">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter Email Address (e.g. user@gmail.com)"
                      className={`w-full px-4 py-3 bg-white border rounded-xl text-xs font-bold text-slate-900 focus:outline-none transition ${fieldErrors.email
                        ? 'border-indigo-600 ring-1 ring-indigo-500'
                        : 'border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500'
                        }`}
                    />
                    {fieldErrors.email && (
                      <p className="text-[11px] font-extrabold text-red-600 mt-1">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-extrabold text-slate-700">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter Phone Number (e.g. 017XXXXXXXX)"
                      className={`w-full px-4 py-3 bg-white border rounded-xl text-xs font-bold text-slate-900 focus:outline-none transition ${fieldErrors.phone
                        ? 'border-indigo-600 ring-1 ring-indigo-500'
                        : 'border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-500'
                        }`}
                    />
                    {fieldErrors.phone && (
                      <p className="text-[11px] font-extrabold text-red-600 mt-1">{fieldErrors.phone}</p>
                    )}
                  </div>
                </>
              )}

            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5 space-y-5">

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <h2 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                  Your Order
                </h2>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between font-extrabold text-slate-700 border-b border-slate-100 pb-2">
                    <span>Product</span>
                    <span>Subtotal</span>
                  </div>

                  <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-2.5">
                    <span>{plan.title} × 1</span>
                    <span className="font-extrabold">৳ {plan.price}</span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-500 font-medium pl-2">
                    <div className="flex justify-between">
                      <span>Professional WordPress Bundle → Elementor Pro × 1</span>
                      <span className="text-slate-400">Included</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Professional WordPress Bundle → WoodMart Theme × 1</span>
                      <span className="text-slate-400">Included</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Professional WordPress Bundle → Rank Math SEO Pro × 1</span>
                      <span className="text-slate-400">Included</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between font-bold text-slate-700 border-t border-slate-100 pt-3">
                    <span>Subtotal</span>
                    <span className="font-extrabold text-slate-900">৳ {plan.price}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between font-bold text-indigo-600">
                      <span>Coupon Discount</span>
                      <span>- ৳ {discount}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between font-black text-sm text-slate-900 border-t-2 border-slate-200 pt-3">
                    <span>Total</span>
                    <span className="text-lg font-black text-indigo-600">৳ {finalTotal}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
                <button
                  type="button"
                  onClick={() => setShowCouponInput(!showCouponInput)}
                  className="text-xs font-extrabold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Have a coupon? Click here to enter coupon code</span>
                </button>

                {showCouponInput && (
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-bold uppercase focus:outline-none focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="bkash"
                      checked={paymentMethod === 'bkash'}
                      onChange={() => setPaymentMethod('bkash')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-800">bKash - Auto Payment Gateway</span>
                  </label>

                  <div className={`rounded-xl border transition-all ${paymentMethod === 'nagad' ? 'border-indigo-500 bg-indigo-50/20' : 'border-slate-200'}`}>
                    <label className="flex items-center gap-3 p-3 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="nagad"
                        checked={paymentMethod === 'nagad'}
                        onChange={() => setPaymentMethod('nagad')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-extrabold text-slate-900">nagad</span>
                    </label>

                    {paymentMethod === 'nagad' && (
                      <div className="p-4 pt-0 space-y-3 text-xs text-slate-700 border-t border-indigo-100/80">
                        <p className="text-[11px] leading-relaxed text-slate-600 font-medium bg-white p-3 rounded-xl border border-slate-100">
                          অর্ডারটি সফলভাবে সম্পন্ন করতে এই <strong className="text-slate-900 font-black">01964-820004</strong> একটি পার্সোনাল বিকাশ/নগদ নম্বর থেকে সেন্ডমানি করে, আপনার মোবাইল নম্বর এবং ট্রানজেকশন আইডিটি নিচের ফর্মে জমা দিন। পেমেন্টটি সঠিক হলে সাথে সাথেই ডাউনলোড একসেস পাবেন। প্রয়োজনে: 01964-820004 যোগাযোগ করুন।
                        </p>

                        <div className="space-y-1 font-bold text-slate-900">
                          <p className="text-indigo-700">You need to send us: <strong className="text-base font-black">৳ {finalTotal}</strong></p>
                          <p className="text-[11px] text-slate-500">Account Type: <span className="text-slate-800">Personal</span></p>
                          <p className="text-[11px] text-slate-500">Account Number: <span className="text-slate-900 font-mono">01964-820004</span></p>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-extrabold text-slate-700">
                            Your Nagad Account Number
                          </label>
                          <input
                            type="text"
                            name="senderAccount"
                            value={formData.senderAccount}
                            onChange={handleChange}
                            placeholder="013XXXXXXXX"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
                          />
                          {fieldErrors.senderAccount && (
                            <p className="text-[10px] font-bold text-red-600">{fieldErrors.senderAccount}</p>
                          )}
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-extrabold text-slate-700">
                            Your Nagad Transaction ID
                          </label>
                          <input
                            type="text"
                            name="transactionId"
                            value={formData.transactionId}
                            onChange={handleChange}
                            placeholder="2M7AS"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold uppercase text-slate-900 focus:outline-none focus:border-indigo-600"
                          />
                          {fieldErrors.transactionId && (
                            <p className="text-[10px] font-bold text-red-600">{fieldErrors.transactionId}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <label className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="rocket"
                      checked={paymentMethod === 'rocket'}
                      onChange={() => setPaymentMethod('rocket')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-bold text-slate-800">rocket</span>
                  </label>

                </div>

                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                    Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our privacy policy.
                  </p>

                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-[11px] font-bold text-slate-700">
                      I have read and agree to the website{' '}
                      <a href="/terms" className="text-indigo-600 underline">terms and conditions</a> <span className="text-red-500">*</span>
                    </span>
                  </label>
                  {fieldErrors.terms && (
                    <p className="text-[10px] font-bold text-red-600">{fieldErrors.terms}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <span>Place order</span>
                  )}
                </button>

              </div>

            </div>

          </form>

        </main>

        <ConfirmDownloadModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          product={selectedProduct}
          userMembership={userMembership}
        />
      </div>

      <Footer />
    </div>
  );
}

export default function CheckoutClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
