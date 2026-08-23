'use client';

import { useState } from 'react';
import { Award, Plus, Search, Trash2, Edit3, CheckCircle2, X } from 'lucide-react';
import { toast } from 'react-toastify';

const INITIAL_BRANDS = [
  { id: 1, name: 'Elementor', slug: 'elementor', totalProducts: 14, status: 'Active', logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop' },
  { id: 2, name: 'WooCommerce', slug: 'woocommerce', totalProducts: 28, status: 'Active', logo: 'https://images.unsplash.com/photo-1556742049-0a670f4a4591?w=100&auto=format&fit=crop' },
  { id: 3, name: 'Astra', slug: 'astra', totalProducts: 8, status: 'Active', logo: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=100&auto=format&fit=crop' },
  { id: 4, name: 'Rank Math', slug: 'rank-math', totalProducts: 5, status: 'Active', logo: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&auto=format&fit=crop' },
  { id: 5, name: 'Crocoblock', slug: 'crocoblock', totalProducts: 12, status: 'Active', logo: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop' },
];

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState(INITIAL_BRANDS);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: '', slug: '', logo: '' });

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) || b.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddBrand = (e) => {
    e.preventDefault();
    if (!newBrand.name.trim()) {
      toast.error('Brand name is required');
      return;
    }
    const slug = newBrand.slug || newBrand.name.toLowerCase().replace(/\s+/g, '-');
    const created = {
      id: Date.now(),
      name: newBrand.name,
      slug,
      totalProducts: 0,
      status: 'Active',
      logo: newBrand.logo || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop',
    };
    setBrands([created, ...brands]);
    setNewBrand({ name: '', slug: '', logo: '' });
    setModalOpen(false);
    toast.success('Brand added successfully!');
  };

  const handleDelete = (id) => {
    setBrands(brands.filter((b) => b.id !== id));
    toast.success('Brand removed');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Brands Management</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Manage all product brands and manufacturers</p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer w-max"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Brand</span>
        </button>
      </div>

      {/* Search & Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
            />
          </div>
          <span className="text-xs font-extrabold text-slate-500">Total Brands: {filteredBrands.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Brand</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Products</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBrands.map((brand) => (
                <tr key={brand.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                    <img src={brand.logo} alt={brand.name} className="w-8 h-8 rounded-lg object-cover border border-slate-200" />
                    <span>{brand.name}</span>
                  </td>
                  <td className="p-4 text-slate-500 font-mono text-[11px]">{brand.slug}</td>
                  <td className="p-4 font-black text-indigo-600">{brand.totalProducts} items</td>
                  <td className="p-4">
                    <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-extrabold text-[10px] border border-emerald-200 inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {brand.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(brand.id)}
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">Add New Brand</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddBrand} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elementor"
                  value={newBrand.name}
                  onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Slug (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. elementor"
                  value={newBrand.slug}
                  onChange={(e) => setNewBrand({ ...newBrand, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Logo URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={newBrand.logo}
                  onChange={(e) => setNewBrand({ ...newBrand, logo: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold">
                  Save Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
