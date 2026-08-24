'use client';

import { useState, useEffect } from 'react';
import { FolderTree, Plus, Search, Trash2, Loader2, X } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', slug: '', description: '' });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories || []);
          if (data.totalProducts) {
            setTotalProductsCount(data.totalProducts);
          } else {
            const sum = (data.categories || []).reduce((acc, c) => acc + (c.count || 0), 0);
            setTotalProductsCount(sum);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || (c.slug && c.slug.toLowerCase().includes(search.toLowerCase()))
  );

  const totalCategorizedItems = categories.reduce((sum, c) => sum + (c.count || 0), 0);
  const displayTotalProducts = totalProductsCount > 0 ? totalProductsCount : totalCategorizedItems;

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCat.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCat.name,
          slug: newCat.slug,
          description: newCat.description,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Category added successfully!');
        setNewCat({ name: '', slug: '', description: '' });
        setModalOpen(false);
        fetchCategories();
      } else {
        toast.error(data.error || 'Failed to add category');
      }
    } catch (err) {
      console.error('Add category error:', err);
      toast.error('Server error when creating category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/categories?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Category removed');
        setCategories((prev) => prev.filter((c) => (c.id !== id && c._id !== id)));
      } else {
        toast.error(data.error || 'Failed to delete category');
      }
    } catch (err) {
      console.error('Delete category error:', err);
      toast.error('Failed to delete category');
    }
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
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Organize product categories and sub-categories dynamically</p>
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

      {/* Top Stat Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-100">
            <FolderTree className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Categories</p>
            <p className="text-xl font-black text-slate-900">{categories.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm shrink-0 border border-blue-100">
            <span className="font-black text-xs">DB</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Catalog Products</p>
            <p className="text-xl font-black text-indigo-600">{displayTotalProducts} Products</p>
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
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
            />
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-2 flex flex-col items-center justify-center">
            <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
            <p className="text-xs font-bold text-slate-500">Loading categories...</p>
          </div>
        ) : (
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
                  <tr key={cat.id || cat.slug} className="hover:bg-slate-50/70 transition">
                    <td className="p-4 font-extrabold text-slate-900 capitalize">{cat.name}</td>
                    <td className="p-4 text-slate-500 font-mono text-[11px]">{cat.slug}</td>
                    <td className="p-4 text-slate-600 max-w-xs truncate">{cat.description}</td>
                    <td className="p-4 font-black text-indigo-600">{cat.count || 0} items</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(cat.id || cat._id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer ml-auto"
                        title="Delete Category"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Category</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
