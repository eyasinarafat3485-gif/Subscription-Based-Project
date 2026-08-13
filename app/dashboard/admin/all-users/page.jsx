'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { toast } from 'react-toastify';

export default function AdminAllUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const [users, setUsers] = useState([
    { id: 1, name: 'Tanvir Hossain', email: 'tanvir@devclub.com', role: 'admin', status: 'Active', joined: '2026-01-10', downloads: 142 },
    { id: 2, name: 'Rakibul Islam', email: 'rakib@wpbd.com', role: 'user', status: 'Active', joined: '2026-02-14', downloads: 86 },
    { id: 3, name: 'Suhail Ahmed', email: 'suhail@agency.io', role: 'guest', status: 'Active', joined: '2026-03-01', downloads: 12 },
    { id: 4, name: 'Naimur Rahman', email: 'naim@elementor.dev', role: 'user', status: 'Active', joined: '2026-03-12', downloads: 45 },
    { id: 5, name: 'Mahfuz Alam', email: 'mahfuz@bangla.tech', role: 'guest', status: 'Pending', joined: '2026-04-05', downloads: 0 },
    { id: 6, name: 'Sakib Hassan', email: 'sakib@freelance.org', role: 'user', status: 'Active', joined: '2026-04-18', downloads: 29 },
  ]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const toggleUserRole = (id, currentRole) => {
    const nextRole = currentRole === 'admin' ? 'user' : currentRole === 'user' ? 'guest' : 'admin';
    setUsers(users.map(u => u.id === id ? { ...u, role: nextRole } : u));
    toast.success(`ইউজার রোল ${nextRole.toUpperCase()} হিসেবে আপডেট করা হয়েছে`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">অল ইউজার্স (All Users List)</h1>
          <p className="text-slate-500 text-xs mt-1">প্ল্যাটফর্মের সকল এডমিন, ইউজার এবং গেস্ট মেম্বার পরিচালনা করুন</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="ইউজার বা ইমেইল খুঁজুন..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 pl-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition shadow-xs"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full sm:w-auto bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-medium shadow-xs"
          >
            <option value="all">সকল রোল (All Roles)</option>
            <option value="admin">এডমিন (Admin)</option>
            <option value="user">ইউজার (User)</option>
            <option value="guest">গেস্ট (Guest)</option>
          </select>
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-6 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-bold">নাম</th>
                <th className="pb-3 font-bold">ইমেইল</th>
                <th className="pb-3 font-bold">রোল</th>
                <th className="pb-3 font-bold">ডাউনলোড সংখ্যা</th>
                <th className="pb-3 font-bold">যোগদানের তারিখ</th>
                <th className="pb-3 font-bold text-right">একশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 font-bold text-slate-800 flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <span>{user.name}</span>
                  </td>
                  <td className="py-3.5 text-slate-600 font-mono">{user.email}</td>
                  <td className="py-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        user.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : user.role === 'user'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-800 font-bold">{user.downloads} টি</td>
                  <td className="py-3.5 text-slate-500">{user.joined}</td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => toggleUserRole(user.id, user.role)}
                      className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition cursor-pointer"
                    >
                      রোল পরিবর্তন
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
