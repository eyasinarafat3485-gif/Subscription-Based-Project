'use client';

import { useState } from 'react';
import { PlusCircle, Link as LinkIcon, Image as ImageIcon, Layers, Plus, Trash2, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminAddProductPage() {
  // Default offer ends 2 days from now
  const defaultOfferEnd = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().slice(0, 16);

  const [form, setForm] = useState({
    title: '',
    category: 'Plugins',
    version: 'v1.0.0',
    price: '299',
    regularPrice: '598',
    image: '',
    downloadUrl: '',
    demoUrl: '',
    description: '',
    featuresText: '1 Year FREE Access & Updates\n24/7 Priority Customer Support\n100% Virus & Malware Free\nUnlimited Website Usage\nInstant Download\nLicense GPL',
    isOffer: false,
    isPopular: true,
    offerEndsAt: defaultOfferEnd,
  });

  const [bundleItems, setBundleItems] = useState([
    { name: 'Elementor Pro', version: 'v4.2.1' },
    { name: 'WoodMart Theme', version: 'v8.5.7' },
    { name: 'CartFlows Pro', version: 'v3.1.2' },
  ]);

  const [loading, setLoading] = useState(false);

  const isBundlePackage = form.category === 'Offer' || form.isOffer;

  const handleAddBundleItem = () => {
    setBundleItems([...bundleItems, { name: '', version: '' }]);
  };

  const handleRemoveBundleItem = (index) => {
    setBundleItems(bundleItems.filter((_, i) => i !== index));
  };

  const handleBundleItemChange = (index, field, value) => {
    const updated = [...bundleItems];
    updated[index][field] = value;
    setBundleItems(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const features = form.featuresText
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean);

      const validBundleItems = isBundlePackage
        ? bundleItems.filter((item) => item.name.trim() !== '')
        : [];

      const payload = {
        title: form.title,
        category: form.category,
        version: form.version,
        price: Number(form.price) || 299,
        regularPrice: Number(form.regularPrice) || 598,
        image: form.image,
        downloadUrl: form.downloadUrl,
        demoUrl: form.demoUrl,
        description: form.description,
        features,
        bundleItems: validBundleItems,
        isOffer: form.isOffer,
        isPopular: form.isPopular,
        offerEndsAt: form.isOffer ? form.offerEndsAt : null,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || `"${form.title}" successfully added to database!`);
        setForm({
          title: '',
          category: 'Plugins',
          version: 'v1.0.0',
          price: '299',
          regularPrice: '598',
          image: '',
          downloadUrl: '',
          demoUrl: '',
          description: '',
          featuresText: '1 Year FREE Access & Updates\n24/7 Priority Customer Support\n100% Virus & Malware Free\nUnlimited Website Usage\nInstant Download\nLicense GPL',
          isOffer: false,
          isPopular: true,
          offerEndsAt: defaultOfferEnd,
        });
        setBundleItems([
          { name: '', version: '' }
        ]);
      } else {
        toast.error(data.error || 'Failed to add product');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server connection error!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Add Product</h1>
        <p className="text-slate-500 text-xs mt-1">
          Upload new WordPress plugins, GPL themes or mega bundle packages to the live MongoDB `products` collection.
        </p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Product Title *</label>
              <input
                type="text"
                placeholder="e.g. Elementor Pro / Professional WordPress Bundle"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
              >
                <option value="Plugins">WordPress Plugins (Plugins)</option>
                <option value="Themes">GPL Themes (Themes)</option>
                <option value="eCommerce Theme">eCommerce Theme</option>
                <option value="SEO">SEO Plugins</option>
                <option value="Page Builders">Page Builders</option>
                <option value="Offer">Mega Offer / Bundle (Offer!)</option>
              </select>
            </div>
          </div>

          {/* Version, Price & Regular Price */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Version *</label>
              <input
                type="text"
                placeholder="e.g. v4.2.1"
                value={form.version}
                onChange={(e) => setForm({ ...form, version: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Offer Price (৳) *</label>
              <input
                type="number"
                placeholder="299"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Regular Price (৳)</label>
              <input
                type="number"
                placeholder="598"
                value={form.regularPrice}
                onChange={(e) => setForm({ ...form, regularPrice: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
              />
            </div>
          </div>

          {/* Product Image URL */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Product Image URL</label>
            <div className="relative">
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
              />
              <ImageIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            </div>
          </div>

          {/* Direct ZIP Link & Demo URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Direct ZIP Link *</label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://drive.google.com/uc?export=download&id=..."
                  value={form.downloadUrl}
                  onChange={(e) => setForm({ ...form, downloadUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
                  required
                />
                <LinkIcon className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Live Demo URL</label>
              <input
                type="url"
                placeholder="https://example.com/demo"
                value={form.demoUrl}
                onChange={(e) => setForm({ ...form, demoUrl: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Product Description</label>
            <textarea
              rows={3}
              placeholder="Write the product details and description here..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
            />
          </div>

          {/* Features Checklist */}
          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Features List (Enter one feature per line)</label>
            <textarea
              rows={4}
              value={form.featuresText}
              onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium font-mono text-[11px]"
            />
          </div>

          {/* Checkboxes */}
          <div className="flex flex-wrap items-center gap-6 pt-1">
            <label className="flex items-center gap-2 text-slate-700 font-bold select-none cursor-pointer">
              <input
                type="checkbox"
                checked={form.isOffer}
                onChange={(e) => setForm({ ...form, isOffer: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-100 border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>Special Mega Offer Product (Offer!)</span>
            </label>

            <label className="flex items-center gap-2 text-slate-700 font-bold select-none cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPopular}
                onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                className="w-4 h-4 rounded bg-slate-100 border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>Popular & Featured Product (Popular)</span>
            </label>
          </div>

          {/* Offer Expiry Date & Time Selection */}
          {form.isOffer && (
            <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200 space-y-2">
              <label className="block text-blue-900 font-bold flex items-center gap-1.5 text-xs">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Set mega offer expiry date and time *</span>
              </label>
              <input
                type="datetime-local"
                value={form.offerEndsAt}
                onChange={(e) => setForm({ ...form, offerEndsAt: e.target.value })}
                className="w-full sm:w-auto bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-slate-800 focus:outline-none focus:border-blue-500 font-medium text-xs shadow-2xs"
                required
              />
              <p className="text-[11px] text-blue-700 font-medium">
                * Once the offer expires, the offer price (৳{form.price}) and timer will automatically stop, and the regular price (৳{form.regularPrice}) will be shown as the main price.
              </p>
            </div>
          )}

          {/* Dynamic Bundle Sub-Items Builder (Shows ONLY when Category is 'Offer' or 'isOffer' is checked) */}
          {isBundlePackage && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 space-y-4 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <h3 className="text-xs font-bold text-amber-900">
                    What is included in this bundle (Mega Package Included Items)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddBundleItem}
                  className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1 transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {bundleItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-amber-200/80 shadow-2xs">
                    <span className="text-[10px] font-black text-amber-700 bg-amber-100 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Plugin/Theme name (e.g. Elementor Pro)"
                        value={item.name}
                        onChange={(e) => handleBundleItemChange(idx, 'name', e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-amber-500 text-xs font-medium"
                      />
                      <input
                        type="text"
                        placeholder="Version (e.g. v4.2.1)"
                        value={item.version}
                        onChange={(e) => handleBundleItemChange(idx, 'version', e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-amber-500 text-xs font-medium font-mono"
                      />
                    </div>
                    {bundleItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveBundleItem(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{loading ? 'Adding to database...' : 'Publish Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
