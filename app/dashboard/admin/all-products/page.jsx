'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  Loader2, 
  Trash2, 
  Edit3, 
  AlertTriangle, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  ExternalLink,
  Layers,
  Calendar,
  DollarSign,
  Upload
} from 'lucide-react';
import { toast } from 'react-toastify';
import { getPaginationRange } from '@/lib/pagination';

export default function AdminAllProductsPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Professional Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    slug: null,
    productTitle: '',
  });

  // Edit Modal State
  const [editModal, setEditModal] = useState({
    isOpen: false,
    originalSlug: null,
    formData: {
      title: '',
      category: 'Plugin',
      version: 'v1.0.0',
      price: 299,
      regularPrice: 598,
      image: '',
      previewImage: '',
      downloadUrl: '',
      demoUrl: '',
      description: '',
      features: '',
      isOffer: false,
      isPopular: false,
      offerEndsAt: '',
      bundleItems: [] // array of { name, version }
    }
  });

  const [savingEdit, setSavingEdit] = useState(false);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/products?page=${page}&limit=10&search=${encodeURIComponent(search)}&category=${categoryFilter}`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.products) {
          setProducts(data.products);
          setCurrentPage(data.page || page);
          setTotalPages(data.totalPages || 1);
          setTotalProducts(data.totalProducts || 0);
        }
      } else {
        toast.error('Failed to load products');
      }
    } catch (err) {
      console.error('Fetch products error:', err);
      toast.error('Server connection error!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [categoryFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProducts(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchProducts(newPage);
    }
  };

  const openDeleteModal = (identifier, productTitle) => {
    // identifier can be _id or slug; backend expects the appropriate key
    setDeleteModal({
      isOpen: true,
      slug: identifier,
      productTitle: productTitle || 'Product',
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      slug: null,
      productTitle: '',
    });
  };

  const confirmDeleteProduct = async () => {
    const { slug } = deleteModal;
    if (!slug) return;

    try {
      setDeletingId(slug);
      const res = await fetch(`/api/products/${slug}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || 'Product deleted successfully!');
        closeDeleteModal();
        // Refresh products list
        const isLastItemOnPage = products.length === 1 && currentPage > 1;
        fetchProducts(isLastItemOnPage ? currentPage - 1 : currentPage);
      } else {
        toast.error(data.error || 'Failed to delete product');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server connection error!');
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (product) => {
    const identifier = product.slug || (product._id ? (typeof product._id === 'object' ? product._id.toString() : String(product._id)) : null);

    // Format offerEndsAt for datetime-local input (YYYY-MM-DDThh:mm)
    let formattedDate = '';
    if (product.offerEndsAt) {
      try {
        const d = new Date(product.offerEndsAt);
        formattedDate = d.toISOString().slice(0, 16);
      } catch (err) {
        console.error('Date parsing error:', err);
      }
    }

    setEditModal({
      isOpen: true,
      originalSlug: identifier,
      formData: {
        title: product.title || '',
        category: product.category || 'Plugin',
        version: product.version || 'v1.0.0',
        price: product.price ?? 0,
        regularPrice: product.regularPrice ?? 0,
        image: product.image || product.imageUrl || product.img || product.productImage || '',
        previewImage: product.previewImage || product.secondImage || product.landingImage || '',
        downloadUrl: product.downloadUrl || '',
        demoUrl: product.demoUrl || '',
        description: product.description || '',
        features: Array.isArray(product.features) ? product.features.join('\n') : (product.features || ''),
        isOffer: !!product.isOffer,
        isPopular: !!product.isPopular,
        offerEndsAt: formattedDate,
        bundleItems: Array.isArray(product.bundleItems) ? [...product.bundleItems] : []
      }
    });
  };

  const closeEditModal = () => {
    setEditModal({
      isOpen: false,
      originalSlug: null,
      formData: {
        title: '',
        category: 'Plugin',
        version: 'v1.0.0',
        price: 299,
        regularPrice: 598,
        image: '',
        downloadUrl: '',
        demoUrl: '',
        description: '',
        features: '',
        isOffer: false,
        isPopular: false,
        offerEndsAt: '',
        bundleItems: []
      }
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditModal(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file size must be less than 5MB!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setEditModal((prev) => ({
          ...prev,
          formData: {
            ...prev.formData,
            image: dataUrl,
          },
        }));
        toast.success('Image uploaded & compressed successfully!');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Bundle item manager logic
  const handleAddBundleItem = () => {
    setEditModal(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        bundleItems: [...prev.formData.bundleItems, { name: '', version: '' }]
      }
    }));
  };

  const handleRemoveBundleItem = (index) => {
    setEditModal(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        bundleItems: prev.formData.bundleItems.filter((_, idx) => idx !== index)
      }
    }));
  };

  const handleBundleItemChange = (index, field, value) => {
    setEditModal(prev => {
      const updated = [...prev.formData.bundleItems];
      updated[index] = { ...updated[index], [field]: value };
      return {
        ...prev,
        formData: {
          ...prev.formData,
          bundleItems: updated
        }
      };
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const { originalSlug, formData } = editModal;
    if (!originalSlug) {
      toast.error('Product ID or slug is missing!');
      return;
    }

    try {
      setSavingEdit(true);

      const featuresArray = typeof formData.features === 'string'
        ? formData.features
            .split('\n')
            .map(f => f.trim())
            .filter(Boolean)
        : (Array.isArray(formData.features) ? formData.features : []);

      const cleanImg = formData.image ? formData.image.trim() : '';

      const payload = {
        ...formData,
        image: cleanImg,
        imageUrl: cleanImg,
        img: cleanImg,
        productImage: cleanImg,
        features: featuresArray,
        price: Number(formData.price),
        regularPrice: Number(formData.regularPrice),
        // Expiry date gets stored only if isOffer is true or category is Offer
        offerEndsAt: (formData.isOffer || formData.category === 'Offer') && formData.offerEndsAt
          ? new Date(formData.offerEndsAt).toISOString()
          : null
      };

      const res = await fetch(`/api/products/${encodeURIComponent(originalSlug)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || 'Product updated successfully!');
        closeEditModal();
        fetchProducts(currentPage);
      } else {
        toast.error(data.error || 'Failed to update product');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server connection error!');
    } finally {
      setSavingEdit(false);
    }
  };

  // Determine if dynamic offerEndsAt time input should be rendered
  const showTimeLimitInput = editModal.formData.isOffer || editModal.formData.category === 'Offer';

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">All Products</h1>
          <p className="text-slate-500 text-xs mt-1">Manage and edit your themes, plugins, and bundle offers.</p>
        </div>
      </div>

      {/* Filter and search controls */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row items-center gap-4 justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80 flex items-center">
          <input
            type="text"
            placeholder="Search products by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <button type="submit" className="hidden" />
        </form>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <span className="text-xs font-bold text-slate-400">Category Filter:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-blue-500 transition cursor-pointer"
          >
            <option value="All">All Categories</option>
            <option value="Plugins">Plugins</option>
            <option value="Themes">Themes</option>
            <option value="Templates">Templates</option>
            <option value="SEO">SEO</option>
            <option value="Page Builders">Page Builders</option>
            <option value="Offer">Offer</option>
          </select>
        </div>
      </div>

      {/* Products table list */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs relative">
        {loading ? (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-slate-500 z-10">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-semibold">Loading products...</p>
          </div>
        ) : null}

        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="p-4 font-bold">Product Title</th>
                <th className="p-4 font-bold">Category</th>
                <th className="p-4 font-bold">Version</th>
                <th className="p-4 font-bold">Price</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center text-slate-400 font-semibold text-sm">
                    No products found matching the criteria.
                  </td>
                </tr>
              ) : (
                products.map((item, index) => (
                  <tr key={item._id ? item._id.toString() : item.slug || index} className="hover:bg-slate-50/50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            !item.image 
                              ? 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=200&auto=format&fit=crop' 
                              : (item.image.startsWith('http') || item.image.startsWith('data:') || item.image.startsWith('/')) 
                                ? item.image 
                                : `/${item.image}`
                          }
                          alt={item.title}
                          loading="lazy"
                          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=200&auto=format&fit=crop'; }}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate max-w-xs">{item.title}</p>
                          <a 
                            href={`/products/${item.slug}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5 mt-0.5"
                          >
                            <span>View details page</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        (item.category || '').toLowerCase().includes('offer') || (item.category || '').toLowerCase().includes('bundle')
                          ? 'bg-red-600 text-white border-red-700 font-extrabold uppercase'
                          : (item.category || '').toLowerCase().includes('theme')
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : (item.category || '').toLowerCase().includes('plugin')
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : (item.category || '').toLowerCase().includes('seo')
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : (item.category || '').toLowerCase().includes('builder')
                                  ? 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                  : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {item.category || 'Plugin'}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-slate-600">{item.version || 'v1.0.0'}</td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">৳{item.price ?? item.salePrice ?? 0}</span>
                        {((item.regularPrice || 0) > (item.price ?? item.salePrice ?? 0)) && (
                          <span className="text-[10px] text-slate-400 line-through">৳{item.regularPrice}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {item.isOffer && (
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-600 text-[9px] font-bold border border-emerald-200">
                            Offer
                          </span>
                        )}
                        {item.isPopular && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-600 text-[9px] font-bold border border-purple-200">
                            Popular
                          </span>
                        )}
                        {!item.isOffer && !item.isPopular && (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white transition cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(item.slug || (item._id ? (typeof item._id === 'object' ? item._id.toString() : String(item._id)) : ''), item.title)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server Side Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Showing page <strong className="text-slate-800">{currentPage}</strong> of <strong className="text-slate-800">{totalPages}</strong> ({totalProducts} total products)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1">
                {getPaginationRange(currentPage, totalPages).map((item, idx) => {
                  if (item === '...') {
                    return (
                      <span key={`dots-${idx}`} className="px-2 py-1 text-slate-400 font-bold text-xs">
                        ...
                      </span>
                    );
                  }
                  return (
                    <button
                      key={item}
                      onClick={() => handlePageChange(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        currentPage === item
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10'
                          : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* -------------------- Edit Modal -------------------- */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative bg-white rounded-2xl border border-slate-200 w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Edit Product</h3>
                <p className="text-[11px] text-slate-500">Edit features, downloads, and pricing structures</p>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Product Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={editModal.formData.title}
                    onChange={handleEditChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Category *</label>
                  <select
                    name="category"
                    value={editModal.formData.category}
                    onChange={handleEditChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium cursor-pointer"
                    required
                  >
                    <option value="Plugins">Plugins</option>
                    <option value="Themes">Themes</option>
                    <option value="Templates">Templates</option>
                    <option value="SEO">SEO</option>
                    <option value="Page Builders">Page Builders</option>
                    <option value="Offer">Offer</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Version *</label>
                  <input
                    type="text"
                    name="version"
                    value={editModal.formData.version}
                    onChange={handleEditChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Offer Price (৳) *</label>
                  <input
                    type="number"
                    name="price"
                    value={editModal.formData.price}
                    onChange={handleEditChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 transition font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Regular Price (৳) *</label>
                  <input
                    type="number"
                    name="regularPrice"
                    value={editModal.formData.regularPrice}
                    onChange={handleEditChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 transition font-bold"
                    required
                  />
                </div>
              </div>

              {/* Product Image Selection & Live Preview */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-800 font-extrabold text-xs">Product Image</label>
                  <span className="text-[10px] text-slate-400 font-semibold">Paste Image URL or Upload File</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  {/* Live Thumbnail Preview */}
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 relative shadow-2xs">
                    {editModal.formData.image ? (
                      <img
                        src={editModal.formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=200&auto=format&fit=crop';
                        }}
                      />
                    ) : (
                      <span className="text-[9px] font-bold text-slate-400 text-center px-1">No Image</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="text"
                      name="image"
                      placeholder="Paste Image URL (e.g. https://...)"
                      value={editModal.formData.image}
                      onChange={handleEditChange}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
                    />

                    <div className="flex items-center gap-2">
                      <label className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer transition flex items-center gap-1.5 whitespace-nowrap">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File from Device</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageFileUpload}
                        />
                      </label>
                      {editModal.formData.image && (
                        <button
                          type="button"
                          onClick={() => setEditModal(prev => ({ ...prev, formData: { ...prev.formData, image: '' } }))}
                          className="text-[11px] text-red-500 hover:underline font-semibold cursor-pointer"
                        >
                          Clear Image
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2nd Image / Landing Page Screenshot (Hover Preview) */}
              <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-indigo-950 font-extrabold text-xs">2nd Image / Landing Page Screenshot (Hover Preview)</label>
                  <span className="text-[10px] text-indigo-600 font-semibold">Optional Landing Page Screenshot</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-white border border-indigo-200 overflow-hidden flex items-center justify-center shrink-0 relative shadow-2xs">
                    {editModal.formData.previewImage ? (
                      <img
                        src={editModal.formData.previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover object-top"
                      />
                    ) : (
                      <span className="text-[9px] font-bold text-indigo-400 text-center px-1">No 2nd Img</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="text"
                      name="previewImage"
                      placeholder="Paste 2nd Image URL (Full Landing Page Screenshot)"
                      value={editModal.formData.previewImage || ''}
                      onChange={handleEditChange}
                      className="w-full bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-500 transition font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Download ZIP URL *</label>
                  <input
                    type="text"
                    name="downloadUrl"
                    value={editModal.formData.downloadUrl}
                    onChange={handleEditChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Live Demo URL</label>
                  <input
                    type="text"
                    name="demoUrl"
                    value={editModal.formData.demoUrl}
                    onChange={handleEditChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={editModal.formData.description}
                  onChange={handleEditChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium resize-y"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Features (One feature per line)</label>
                <textarea
                  name="features"
                  rows="4"
                  value={editModal.formData.features}
                  onChange={handleEditChange}
                  placeholder="e.g. 1 Year FREE Access & Updates&#10;24/7 Priority Customer Support"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium resize-y"
                />
              </div>

              {/* Status toggles */}
              <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="isOffer"
                      checked={editModal.formData.isOffer}
                      onChange={handleEditChange}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="font-bold text-slate-700">Special Offer Product</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="isPopular"
                      checked={editModal.formData.isPopular}
                      onChange={handleEditChange}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                    />
                    <span className="font-bold text-slate-700">Popular Product</span>
                  </label>
                </div>
              </div>

              {/* Dynamic Time Limit Logic for Mega/Offer Products */}
              {showTimeLimitInput && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-[11px]">
                    <Calendar className="w-4 h-4" />
                    <span>Special Offer Expiry Time Limit</span>
                  </div>
                  <p className="text-[10px] text-amber-700">Specify when this special pricing discount expires on the product landing page.</p>
                  <input
                    type="datetime-local"
                    name="offerEndsAt"
                    value={editModal.formData.offerEndsAt}
                    onChange={handleEditChange}
                    className="bg-white border border-amber-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 transition w-full sm:w-64"
                  />
                </div>
              )}

              {/* Bundle items list builder */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Bundle Sub-Items ({editModal.formData.bundleItems.length})</span>
                  <button
                    type="button"
                    onClick={handleAddBundleItem}
                    className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-[10px] border border-blue-200 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                </div>

                {editModal.formData.bundleItems.length === 0 ? (
                  <p className="text-slate-400 italic text-[11px]">No sub-items added to this product.</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto p-1.5 border border-slate-100 rounded-xl bg-slate-50/50">
                    {editModal.formData.bundleItems.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-3xs">
                        <input
                          type="text"
                          placeholder="Item Name (e.g. Elementor Pro)"
                          value={item.name}
                          onChange={(e) => handleBundleItemChange(idx, 'name', e.target.value)}
                          className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium"
                          required
                        />
                        <input
                          type="text"
                          placeholder="Version (e.g. v3.24.0)"
                          value={item.version}
                          onChange={(e) => handleBundleItemChange(idx, 'version', e.target.value)}
                          className="w-28 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveBundleItem(idx)}
                          className="p-1 rounded bg-red-50 hover:bg-red-500 text-red-500 hover:text-white transition cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {savingEdit && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{savingEdit ? 'Saving changes...' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- Professional Delete Modal -------------------- */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-xl overflow-hidden animate-scaleUp">
            {/* Header Warning graphics */}
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center border-2 border-red-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900">Confirm Product Deletion</h3>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  Are you absolutely sure you want to delete <strong className="text-slate-800">{deleteModal.productTitle}</strong>? This action will permanently remove it from the database catalog and cannot be undone.
                </p>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deletingId !== null}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition cursor-pointer text-xs disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteProduct}
                disabled={deletingId !== null}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition flex items-center gap-1.5 shadow-md shadow-red-500/10 cursor-pointer text-xs disabled:opacity-50"
              >
                {deletingId !== null && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{deletingId !== null ? 'Deleting...' : 'Confirm Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
