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

  // Handle Search
  const filteredUsers = users.filter((user) => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle Delete
  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  // Handle Block/Unblock
  const handleToggleBlock = (id) => {
    setUsers(users.map(user => {
      if (user.id === id) {
        return { ...user, status: user.status === 'Active' ? 'Blocked' : 'Active' };
      }
      return user;
    }));
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 border border-border shadow-sm bg-card/60 backdrop-blur-xl font-body">
      {/* Page Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground tracking-tight">
            User <span className="text-gradient">Management</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-body">Manage platform users, roles, and access.</p>
        </div>
        
        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <MdSearch className="text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-4 py-2.5 border border-border rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all sm:text-sm font-body"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-border relative z-10 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-body">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground font-display">User</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground font-display">Role</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground font-display">Status</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground font-display">Joined</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground font-display">XP</th>
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground font-display text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                          <MdPerson size={20} />
                        </div>
                        <div>
                          <div className="font-semibold font-display text-foreground group-hover:text-primary transition-colors">{user.name}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border font-body ${
                        user.role === 'Instructor' 
                          ? 'bg-secondary/15 text-secondary border-secondary/20 font-semibold' 
                          : 'bg-muted text-muted-foreground border-border'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`flex items-center gap-1.5 text-sm font-medium ${
                        user.status === 'Active' ? 'text-emerald-400' : 'text-destructive'
                      }`}>
                        {user.status === 'Active' ? <MdCheckCircle size={16} /> : <MdBlock size={16} />}
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{user.joinedDate}</td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-bold font-display text-orange-400">
                        {user.xp.toLocaleString()} XP
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggleBlock(user.id)}
                          className={`p-2 rounded-xl transition-all ${
                            user.status === 'Active' 
                              ? 'text-yellow-400 hover:bg-yellow-400/10' 
                              : 'text-emerald-400 hover:bg-emerald-400/10'
                          }`}
                          title={user.status === 'Active' ? 'Block User' : 'Unblock User'}
                        >
                          {user.status === 'Active' ? <MdBlock size={20} /> : <MdCheckCircle size={20} />}
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="p-2 rounded-xl text-destructive hover:bg-destructive/10 transition-all"
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
                  <td colSpan="6" className="py-12 text-center text-muted-foreground">
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
      </div>
    </div>
  );
};

export default Users;
