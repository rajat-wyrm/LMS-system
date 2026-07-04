import React, { useState } from 'react';
import { MdSearch, MdDelete, MdBlock, MdCheckCircle, MdPerson } from 'react-icons/md';

// Dummy user data
const initialUsers = [
  { id: 1, name: 'Alex Johnson', email: 'alex.j@example.com', role: 'Student', status: 'Active', joinedDate: '2026-05-15', xp: 4500 },
  { id: 2, name: 'Sarah Williams', email: 'sarah.w@example.com', role: 'Student', status: 'Active', joinedDate: '2026-05-18', xp: 3200 },
  { id: 3, name: 'Michael Chen', email: 'm.chen@example.com', role: 'Instructor', status: 'Active', joinedDate: '2026-01-10', xp: 12000 },
  { id: 4, name: 'Emily Davis', email: 'emily.d@example.com', role: 'Student', status: 'Blocked', joinedDate: '2026-04-22', xp: 850 },
  { id: 5, name: 'David Wilson', email: 'david.w@example.com', role: 'Student', status: 'Active', joinedDate: '2026-05-28', xp: 120 },
  { id: 6, name: 'Jessica Taylor', email: 'j.taylor@example.com', role: 'Instructor', status: 'Active', joinedDate: '2025-11-05', xp: 18500 },
  { id: 7, name: 'Robert Brown', email: 'rbrown@example.com', role: 'Student', status: 'Active', joinedDate: '2026-03-14', xp: 5600 },
  { id: 8, name: 'Sophia Martinez', email: 'smartinez@example.com', role: 'Student', status: 'Blocked', joinedDate: '2026-02-19', xp: 2100 },
];

const Users = () => {
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const handleToggleBlock = (id) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        return { ...user, status: user.status === 'Active' ? 'Blocked' : 'Active' };
      }
      return user;
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Page Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-cyan to-accent-blue">
            User Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage platform users, roles, and access.</p>
        </div>

        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MdSearch className="text-gray-400 group-focus-within:text-accent-cyan transition-colors" size={20} />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2.5 border border-white/10 rounded-xl bg-background-secondary/50 text-gray-300 placeholder-gray-500 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#FF6B35] focus-visible:outline-offset-2 transition-all sm:text-sm backdrop-blur-md"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── Desktop table (md+) ── */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/10 relative z-10 shadow-2xl">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="py-4 px-6 font-semibold text-sm text-gray-300">User</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-300">Role</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-300">Status</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-300">Joined</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-300">XP</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center border border-white/10">
                          <MdPerson className="text-gray-300" size={20} />
                        </div>
                        <div>
                          <div className="font-semibold text-white group-hover:text-accent-cyan transition-colors">{user.name}</div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        user.role === 'Instructor'
                          ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/20 shadow-[0_0_10px_rgba(139,92,246,0.2)]'
                          : 'bg-white/5 text-gray-300 border-white/10'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`flex items-center gap-1.5 text-sm font-medium ${
                        user.status === 'Active' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {user.status === 'Active' ? <MdCheckCircle size={16} /> : <MdBlock size={16} />}
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-400">{user.joinedDate}</td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-bold text-accent-orange drop-shadow-[0_0_5px_rgba(249,115,22,0.3)]">
                        {user.xp.toLocaleString()} XP
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleBlock(user.id)}
                          className={`p-2 rounded-lg transition-all ${
                            user.status === 'Active'
                              ? 'text-yellow-500 hover:bg-yellow-500/10 hover:shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                              : 'text-green-400 hover:bg-green-400/10 hover:shadow-[0_0_10px_rgba(74,222,128,0.2)]'
                          }`}
                          title={user.status === 'Active' ? 'Block User' : 'Unblock User'}
                        >
                          {user.status === 'Active' ? <MdBlock size={20} /> : <MdCheckCircle size={20} />}
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-all hover:shadow-[0_0_10px_rgba(248,113,113,0.2)]"
                          title="Delete User"
                        >
                          <MdDelete size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <MdSearch size={48} className="opacity-20" />
                      <p>No users found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ── Mobile card layout (below md) ── */}
        <div className="md:hidden divide-y divide-white/5">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div key={user.id} className="p-4 hover:bg-white/5 transition-colors">
                {/* Card header: avatar + name/email */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-purple/20 to-accent-blue/20 flex items-center justify-center border border-white/10 shrink-0">
                      <MdPerson className="text-gray-300" size={20} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-white text-sm truncate">{user.name}</div>
                      <div className="text-xs text-gray-400 truncate">{user.email}</div>
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleToggleBlock(user.id)}
                      className={`p-2 rounded-lg transition-all ${
                        user.status === 'Active'
                          ? 'text-yellow-500 hover:bg-yellow-500/10'
                          : 'text-green-400 hover:bg-green-400/10'
                      }`}
                      title={user.status === 'Active' ? 'Block User' : 'Unblock User'}
                    >
                      {user.status === 'Active' ? <MdBlock size={18} /> : <MdCheckCircle size={18} />}
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-all"
                      title="Delete User"
                    >
                      <MdDelete size={18} />
                    </button>
                  </div>
                </div>

                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    user.role === 'Instructor'
                      ? 'bg-accent-purple/10 text-accent-purple border-accent-purple/20'
                      : 'bg-white/5 text-gray-300 border-white/10'
                  }`}>
                    {user.role}
                  </span>
                  <span className={`flex items-center gap-1 text-xs font-medium ${
                    user.status === 'Active' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {user.status === 'Active' ? <MdCheckCircle size={13} /> : <MdBlock size={13} />}
                    {user.status}
                  </span>
                  <span className="text-xs font-bold text-accent-orange ml-auto">
                    {user.xp.toLocaleString()} XP
                  </span>
                </div>

                {/* Joined date */}
                <div className="text-xs text-gray-500">Joined {user.joinedDate}</div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center text-gray-500">
              <div className="flex flex-col items-center justify-center gap-2">
                <MdSearch size={40} className="opacity-20" />
                <p className="text-sm">No users found matching your search.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Users;
