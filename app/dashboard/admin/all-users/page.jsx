'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, Trash2, AlertTriangle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { getPaginationRange } from '@/lib/pagination';

export default function AdminAllUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  // Professional Delete Confirmation Modal State
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    userId: null,
    userName: '',
  });

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/users?page=${page}&limit=10&search=${encodeURIComponent(search)}&role=${roleFilter}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.users) {
          setUsers(data.users);
          setCurrentPage(data.page || page);
          setTotalPages(data.totalPages || 1);
          setTotalUsers(data.totalUsers || 0);
        }
      } else {
        toast.error('Failed to load user data');
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      toast.error('Server connection error!');
    } finally {
      setLoading(false);
    }
  };

  // Fetch when roleFilter changes or pagination changes
  useEffect(() => {
    fetchUsers(1);
  }, [roleFilter]);

  // Handle Search Input Submission (Enter or Click)
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchUsers(newPage);
    }
  };

  const handleRoleSelect = async (userId, newRole) => {
    try {
      setUpdatingId(userId);
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || `User role updated to ${newRole.toUpperCase()}`);
        setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      } else {
        toast.error(data.error || 'Failed to update role');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server connection error!');
    } finally {
      setUpdatingId(null);
    }
  };

  const openDeleteModal = (userId, userName) => {
    setDeleteModal({
      isOpen: true,
      userId,
      userName: userName || 'User',
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      userId: null,
      userName: '',
    });
  };

  const confirmDeleteUser = async () => {
    const { userId, userName } = deleteModal;
    if (!userId) return;

    try {
      setDeletingId(userId);
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || `"${userName}" has been deleted from database`);
        // Refresh the current page of users
        fetchUsers(currentPage);
        closeDeleteModal();
      } else {
        toast.error(data.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error(err);
      toast.error('Server connection error!');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">All Users</h1>
          <p className="text-slate-500 text-xs mt-1">Manage all admin, user, and guest members in the MongoDB database</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Type username or email and press enter..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition shadow-xs font-medium"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-bold shadow-xs cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
            <option value="guest">Guest</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-white border border-slate-200 p-6 overflow-hidden shadow-xs relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-bold">NAME</th>
                <th className="pb-3 font-bold">EMAIL</th>
                <th className="pb-3 font-bold">ROLE</th>
                <th className="pb-3 font-bold">DOWNLOADS</th>
                <th className="pb-3 font-bold">JOINING DATE</th>
                <th className="pb-3 font-bold text-right pr-2">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
                    <span>Fetching user list from MongoDB database...</span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                    No user data found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition">
                    
                    {/* Name & Dynamic Avatar Display */}
                    <td className="py-3.5 font-bold text-slate-900 flex items-center gap-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        style={{ display: user.image ? 'none' : 'flex' }}
                        className={`w-8 h-8 rounded-full font-black text-xs flex items-center justify-center shrink-0 border ${
                          user.role === 'admin'
                            ? 'bg-purple-100 text-purple-700 border-purple-200'
                            : user.role === 'guest'
                            ? 'bg-amber-100 text-amber-700 border-amber-200'
                            : 'bg-blue-100 text-blue-700 border-blue-200'
                        }`}
                      >
                        {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="truncate max-w-[150px] sm:max-w-none">{user.name}</span>
                    </td>

                    {/* Email */}
                    <td className="py-3.5 text-slate-600 font-mono">{user.email}</td>

                    {/* Role Tag */}
                    <td className="py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                          user.role === 'admin'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : user.role === 'guest'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {user.role ? user.role.toUpperCase() : 'USER'}
                      </span>
                    </td>

                    {/* Downloads */}
                    <td className="py-3.5 text-slate-800 font-bold">{user.downloads}</td>

                    {/* Joined Date */}
                    <td className="py-3.5 text-slate-500">{user.joined}</td>

                    {/* Actions: Role Select Dropdown & Delete Button */}
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Role Select Dropdown */}
                        <select
                          value={user.role || 'user'}
                          onChange={(e) => handleRoleSelect(user.id, e.target.value)}
                          disabled={updatingId === user.id}
                          className={`px-3 py-1.5 rounded-xl font-extrabold text-xs border focus:outline-none transition cursor-pointer shadow-2xs ${
                            user.role === 'admin'
                              ? 'bg-purple-50 text-purple-700 border-purple-200 focus:border-purple-500'
                              : user.role === 'guest'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 focus:border-amber-500'
                              : 'bg-blue-50 text-blue-700 border-blue-200 focus:border-blue-500'
                          }`}
                        >
                          <option value="user" className="bg-white text-slate-800 font-bold">User (USER)</option>
                          <option value="guest" className="bg-white text-slate-800 font-bold">Guest (GUEST)</option>
                          <option value="admin" className="bg-white text-slate-800 font-bold">Admin (ADMIN)</option>
                        </select>

                        {/* Delete Trigger Button */}
                        <button
                          onClick={() => openDeleteModal(user.id, user.name)}
                          disabled={deletingId === user.id}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition cursor-pointer disabled:opacity-50"
                          title="Delete user from database"
                        >
                          {deletingId === user.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {!loading && users.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 mt-6 border-t border-slate-100 text-xs font-semibold text-slate-600">
            <div>
              Showing <span className="font-bold text-slate-900">{Math.min(totalUsers, (currentPage - 1) * 10 + 1)}</span> to{' '}
              <span className="font-bold text-slate-900">{Math.min(totalUsers, currentPage * 10)}</span> of{' '}
              <span className="font-bold text-slate-900">{totalUsers}</span> users
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPaginationRange(currentPage, totalPages).map((item, index) => {
                if (item === '...') {
                  return (
                    <span key={`dots-${index}`} className="px-2 py-1 text-slate-400 font-bold text-xs">
                      ...
                    </span>
                  );
                }
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handlePageChange(item)}
                    className={`px-3 py-1.5 rounded-xl transition cursor-pointer border ${
                      currentPage === item
                        ? 'bg-blue-600 border-blue-600 text-white font-extrabold'
                        : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Professional Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-slate-100 shadow-2xl relative transition-all transform scale-100">
            
            {/* Close Button */}
            <button
              onClick={closeDeleteModal}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Warning Icon & Header */}
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200 shadow-xs">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 leading-tight">Confirm User Deletion</h3>
                <p className="text-slate-500 text-xs mt-0.5">Permanent database deletion action</p>
              </div>
            </div>

            {/* Modal Body Message */}
            <div className="p-4 rounded-2xl bg-red-50/80 border border-red-100 text-xs text-slate-700 leading-relaxed font-medium space-y-1">
              <p>
                Are you sure you want to permanently delete <span className="font-black text-slate-900">"{deleteModal.userName}"</span> from the database?
              </p>
              <p className="text-red-600 text-[11px] font-bold">
                ⚠️ Once this action is completed, all account data and access for this user will be permanently deleted!
              </p>
            </div>

            {/* Modal Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDeleteUser}
                disabled={deletingId === deleteModal.userId}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-red-500/20 transition cursor-pointer disabled:opacity-50"
              >
                {deletingId === deleteModal.userId ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Permanently Delete</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
