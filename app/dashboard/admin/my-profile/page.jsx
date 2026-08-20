'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth-client';
import { User, Mail, Save, CheckCircle, Camera, Lock, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminMyProfilePage() {
  const { data: session } = useSession();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    image: '',
    bio: 'WordPress Senior Developer & Developers Club Platform Admin.',
  });
  const [initialData, setInitialData] = useState({
    name: '',
    image: '',
    bio: 'WordPress Senior Developer & Developers Club Platform Admin.',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isSubscribed = true;
    const fetchProfile = async () => {
      try {
        setFetching(true);
        const res = await fetch('/api/user/profile');
        if (res.ok && isSubscribed) {
          const data = await res.json();
          if (data?.user) {
            const fetchedName = data.user.name || session?.user?.name || '';
            const fetchedImage = data.user.image || session?.user?.image || '';
            const fetchedBio = data.user.bio || 'WordPress Senior Developer & Developers Club Platform Admin.';
            setFormData({
              name: fetchedName,
              email: data.user.email || session?.user?.email || '',
              image: fetchedImage,
              bio: fetchedBio,
            });
            setInitialData({
              name: fetchedName,
              image: fetchedImage,
              bio: fetchedBio,
            });
          }
        } else if (session?.user && isSubscribed) {
          const fetchedName = session.user.name || '';
          const fetchedImage = session.user.image || '';
          const fetchedBio = 'WordPress Senior Developer & Developers Club Platform Admin.';
          setFormData((prev) => ({
            ...prev,
            name: fetchedName,
            email: session.user.email || '',
            image: fetchedImage,
          }));
          setInitialData({
            name: fetchedName,
            image: fetchedImage,
            bio: fetchedBio,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isSubscribed) setFetching(false);
      }
    };

    fetchProfile();
    return () => {
      isSubscribed = false;
    };
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
        toast.info('Previewing new profile picture, click the Save Changes button to confirm');
      };
      reader.readAsDataURL(file);
    }
  };

  const isChanged =
    formData.name !== initialData.name ||
    formData.image !== initialData.image ||
    formData.bio !== initialData.bio;

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
          bio: formData.bio,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSaved(true);
        setInitialData({
          name: formData.name,
          image: formData.image,
          bio: formData.bio,
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

  const isPageLoading = !mounted || fetching;

  return (
    <div className="space-y-6 max-w-4xl relative">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-slate-500 text-xs mt-1">Manage and save your admin account details and profile picture.</p>
      </div>

      <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-6 relative min-h-[350px]">
        {isPageLoading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-slate-500 z-20 rounded-2xl">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm font-semibold">Loading profile...</p>
          </div>
        )}

        {/* User Avatar & Header Info */}
        <div className="flex items-center gap-5 pb-6 border-b border-slate-100">
          {/* Avatar with Upload Camera Button */}
          <div className="relative group shrink-0">
            {formData.image ? (
              <img
                src={formData.image}
                alt={formData.name || 'Admin'}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-purple-500 shadow-md"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black text-3xl flex items-center justify-center border-4 border-purple-500 shadow-md">
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'A'}
              </div>
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              className="hidden"
            />

            {/* Camera Upload Trigger */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md border-2 border-white transition-transform hover:scale-110 cursor-pointer"
              title="Upload new image"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              {formData.name || 'Admin User'}
              <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-black">
                ADMIN
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{formData.email}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Change profile picture</span>
            </button>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-700 font-bold mb-1.5">Name</label>
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
                  Read-only (Non-editable)
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
            <label className="block text-slate-700 font-bold mb-1.5">Profile Image URL (Optional)</label>
            <input
              type="text"
              placeholder="https://example.com/avatar.jpg"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1.5">Bio / Description</label>
            <textarea
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-blue-500 transition font-medium"
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
    </div>
  );
}
