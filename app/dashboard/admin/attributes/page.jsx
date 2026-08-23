'use client';

import { useState } from 'react';
import { Sliders, Plus, Search, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';

const INITIAL_ATTRIBUTES = [
  { id: 1, name: 'Version', slug: 'version', terms: 'v1.0.0, v2.5.0, v3.8.1', type: 'Text' },
  { id: 2, name: 'License Type', slug: 'license-type', terms: 'GPL Unlimited, Single Site, Lifetime', type: 'Select' },
  { id: 3, name: 'PHP Compatibility', slug: 'php-compatibility', terms: 'PHP 7.4, PHP 8.0, PHP 8.1, PHP 8.2', type: 'Badge' },
  { id: 4, name: 'WordPress Version', slug: 'wp-version', terms: 'WP 6.0+', type: 'Text' },
];

export default function AdminAttributesPage() {
  const [attributes, setAttributes] = useState(INITIAL_ATTRIBUTES);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [newAttr, setNewAttr] = useState({ name: '', slug: '', terms: '', type: 'Text' });

  const filteredAttributes = attributes.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) || a.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddAttribute = (e) => {
    e.preventDefault();
    if (!newAttr.name.trim()) {
      toast.error('Attribute name is required');
      return;
    }
    const slug = newAttr.slug || newAttr.name.toLowerCase().replace(/\s+/g, '-');
    const created = {
      id: Date.now(),
      name: newAttr.name,
      slug,
      terms: newAttr.terms || 'Default',
      type: newAttr.type || 'Text',
    };
    setAttributes([created, ...attributes]);
    setNewAttr({ name: '', slug: '', terms: '', type: 'Text' });
    setModalOpen(false);
    toast.success('Attribute added successfully!');
  };

  const handleDelete = (id) => {
    setAttributes(attributes.filter((a) => a.id !== id));
    toast.success('Attribute removed');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Attributes Management</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Manage custom product attributes & technical specifications</p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2 cursor-pointer w-max"
        >
          <Plus className="w-4 h-4" />
          <span>Add Attribute</span>
        </button>
      </div>

      {/* Search & Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search attributes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-600"
            />
          </div>
          <span className="text-xs font-extrabold text-slate-500">Total: {filteredAttributes.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-black uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="p-4">Attribute</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Type</th>
                <th className="p-4">Attribute Terms / Values</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttributes.map((attr) => (
                <tr key={attr.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-4 font-extrabold text-slate-900">{attr.name}</td>
                  <td className="p-4 text-slate-500 font-mono text-[11px]">{attr.slug}</td>
                  <td className="p-4">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold">
                      {attr.type}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 font-semibold max-w-md">{attr.terms}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(attr.id)}
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
              <h3 className="text-base font-black text-slate-900">Add New Attribute</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddAttribute} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Attribute Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. License Type"
                  value={newAttr.name}
                  onChange={(e) => setNewAttr({ ...newAttr, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Terms / Values</label>
                <input
                  type="text"
                  placeholder="e.g. GPL Unlimited, Single Site"
                  value={newAttr.terms}
                  onChange={(e) => setNewAttr({ ...newAttr, terms: e.target.value })}
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
                  Save Attribute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
