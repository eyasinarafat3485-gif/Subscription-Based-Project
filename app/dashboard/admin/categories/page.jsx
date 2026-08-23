'use client';

import { useState } from 'react';
import { FolderTree, Plus, Search, Trash2, CheckCircle2, X } from 'lucide-react';
import { toast } from 'react-toastify';

const INITIAL_CATEGORIES = [
  { id: 1, name: 'Plugins', slug: 'plugin', count: 142, description: 'WordPress functional plugins & add-ons' },
  { id: 2, name: 'Themes', slug: 'theme', count: 86, description: 'Premium WordPress themes & templates' },
  { id: 3, name: 'SEO Tools', slug: 'seo', count: 24, description: 'SEO optimization plugins & rank boosters' },
  { id: 4, name: 'Templates', slug: 'templates', count: 52, description: 'Readymade website layout kits' },
  { id: 5, name: 'WooCommerce', slug: 'woocommerce', count: 48, description: 'E-commerce extensions & payment gateways' },
];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', slug: '', description: '' });

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) {
      toast.error('Category name is required');
      return;
    }
    const slug = newCat.slug || newCat.name.toLowerCase().replace(/\s+/g, '-');
    const created = {
      id: Date.now(),
      name: newCat.name,
      slug,
      count: 0,
      description: newCat.description || 'Custom category',
    };
    setCategories([created, ...categories]);
    setNewCat({ name: '', slug: '', description: '' });
    setModalOpen(false);
    toast.success('Category added successfully!');
  };

  const handleDelete = (id) => {
    setCategories(categories.filter((c) => c.id !== id));
    toast.success('Category removed');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Categories Management</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Organize product categories and sub-categories</p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer w-max"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Search & Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
            />
          </div>
          <span className="text-xs font-extrabold text-slate-500">Total: {filteredCategories.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Category</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Description</th>
                <th className="p-4">Product Count</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-4 font-extrabold text-slate-900">{cat.name}</td>
                  <td className="p-4 text-slate-500 font-mono text-[11px]">{cat.slug}</td>
                  <td className="p-4 text-slate-600 max-w-xs truncate">{cat.description}</td>
                  <td className="p-4 font-black text-indigo-600">{cat.count} items</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(cat.id)}
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
              <h3 className="text-base font-black text-slate-900">Add New Category</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Elementor Addons"
                  value={newCat.name}
                  onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Slug (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. elementor-addons"
                  value={newCat.slug}
                  onChange={(e) => setNewCat({ ...newCat, slug: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  placeholder="Enter short description..."
                  value={newCat.description}
                  onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                  rows={3}
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
