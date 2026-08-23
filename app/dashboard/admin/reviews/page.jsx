'use client';

import { useState } from 'react';
import { Star, Search, Trash2, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';

const INITIAL_REVIEWS = [
  {
    id: 1,
    reviewer: 'Tanvir Hossain',
    email: 'tanvir@gmail.com',
    productTitle: 'Elementor Pro',
    rating: 5,
    comment: 'Super fast installation! Works perfectly on all my client sites.',
    status: 'Approved',
    createdAt: '2026-08-22',
  },
  {
    id: 2,
    reviewer: 'Md Sabit',
    email: 'sabit@gmail.com',
    productTitle: 'WoodMart Theme',
    rating: 5,
    comment: 'Authentic GPL file with zero malware. Highly recommended!',
    status: 'Approved',
    createdAt: '2026-08-21',
  },
  {
    id: 3,
    reviewer: 'Arosh Ahmed',
    email: 'arosh@gmail.com',
    productTitle: 'Rank Math SEO Pro',
    rating: 4,
    comment: 'Great plugin, received latest update files within minutes.',
    status: 'Pending',
    createdAt: '2026-08-20',
  },
];

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [search, setSearch] = useState('');

  const filteredReviews = reviews.filter(
    (r) =>
      r.reviewer.toLowerCase().includes(search.toLowerCase()) ||
      r.productTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id) => {
    setReviews(
      reviews.map((r) => {
        if (r.id === id) {
          const newStatus = r.status === 'Approved' ? 'Pending' : 'Approved';
          toast.info(`Review status updated to ${newStatus}`);
          return { ...r, status: newStatus };
        }
        return r;
      })
    );
  };

  const handleDelete = (id) => {
    setReviews(reviews.filter((r) => r.id !== id));
    toast.success('Review deleted');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Reviews Management</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Moderate customer reviews and product ratings</p>
          </div>
        </div>
      </div>

      {/* Search & Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reviews by user or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
            />
          </div>
          <span className="text-xs font-extrabold text-slate-500">Total Reviews: {filteredReviews.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Product</th>
                <th className="p-4">Rating</th>
                <th className="p-4">Review Comment</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-4 font-bold text-slate-900">
                    <div>{rev.reviewer}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{rev.email}</div>
                  </td>
                  <td className="p-4 font-extrabold text-slate-900">{rev.productTitle}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-slate-700 max-w-xs">{rev.comment}</td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleStatus(rev.id)}
                      className={`px-2.5 py-1 rounded-md font-extrabold text-[10px] border flex items-center gap-1 cursor-pointer transition ${
                        rev.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                      }`}
                    >
                      {rev.status === 'Approved' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {rev.status}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(rev.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
