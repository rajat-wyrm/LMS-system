import { useEffect, useState } from 'react';
import { MdBlock, MdCheckCircle, MdDelete, MdPerson, MdRefresh, MdSearch } from 'react-icons/md';
import { apiRequest, clearAdminAuth } from '../../../utils/api';

const STATUS_STYLES = {
  approved: {
    label: 'Approved',
    icon: MdCheckCircle,
    className: 'text-green-400',
  },
  pending: {
    label: 'Pending',
    icon: MdRefresh,
    className: 'text-amber-400',
  },
  rejected: {
    label: 'Rejected',
    icon: MdBlock,
    className: 'text-red-400',
  },
  suspended: {
    label: 'Blocked',
    icon: MdBlock,
    className: 'text-red-400',
  },
};

const ROLE_LABELS = {
  user: 'Student',
  instructor: 'Instructor',
  admin: 'Admin',
};

const formatDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString();
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [busyUserId, setBusyUserId] = useState(null);

  const loadUsers = async ({ silent = false } = {}) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError('');

    try {
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const result = await apiRequest(`/v1/admin/users${query}`);
      setUsers(result.data || []);
    } catch (requestError) {
      if (requestError.status === 401 || requestError.status === 403) {
        clearAdminAuth();
      }
      setError(requestError.message || 'Unable to load users.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers({ silent: users.length > 0 });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) {
      return;
    }

    setBusyUserId(user.id);
    setError('');

    try {
      await apiRequest(`/v1/admin/users/${user.id}`, { method: 'DELETE' });
      setUsers((current) => current.filter((entry) => entry.id !== user.id));
    } catch (requestError) {
      setError(requestError.message || 'Unable to delete user.');
    } finally {
      setBusyUserId(null);
    }
  };

  const handleToggleBlock = async (user) => {
    const nextStatus = user.status === 'suspended' ? 'approved' : 'suspended';

    setBusyUserId(user.id);
    setError('');

    try {
      const result = await apiRequest(`/v1/admin/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus }),
      });

      setUsers((current) =>
        current.map((entry) => (entry.id === user.id ? result.data : entry)),
      );
    } catch (requestError) {
      setError(requestError.message || 'Unable to update user.');
    } finally {
      setBusyUserId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const roleLabel = ROLE_LABELS[user.role] || user.role;
    return (
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roleLabel.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-cyan to-accent-blue">
            User Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">Manage real platform users, roles, and access.</p>
        </div>

        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MdSearch className="text-gray-400 group-focus-within:text-accent-cyan transition-colors" size={20} />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-12 py-2.5 border border-white/10 rounded-xl bg-background-secondary/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-accent-cyan focus:border-accent-cyan focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all sm:text-sm backdrop-blur-md"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          {isRefreshing && (
            <MdRefresh className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 animate-spin" size={18} />
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="glass-card rounded-2xl overflow-hidden border border-white/10 relative z-10 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="py-4 px-6 font-semibold text-sm text-gray-300">User</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-300">Role</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-300">Status</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-300">Joined</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const statusConfig = STATUS_STYLES[user.status] || STATUS_STYLES.pending;
                  const StatusIcon = statusConfig.icon;
                  const isBusy = busyUserId === user.id;
                  const isBlocked = user.status === 'suspended';

                  return (
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
                        <span className="px-3 py-1 rounded-full text-xs font-medium border bg-white/5 text-gray-300 border-white/10">
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`flex items-center gap-1.5 text-sm font-medium ${statusConfig.className}`}>
                          <StatusIcon size={16} />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-400">{formatDate(user.createdAt)}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleBlock(user)}
                            disabled={isBusy}
                            className={`p-2 rounded-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                              isBlocked
                                ? 'text-green-400 hover:bg-green-400/10 hover:shadow-[0_0_10px_rgba(74,222,128,0.2)]'
                                : 'text-yellow-500 hover:bg-yellow-500/10 hover:shadow-[0_0_10px_rgba(234,179,8,0.2)]'
                            }`}
                            title={isBlocked ? 'Unblock User' : 'Block User'}
                          >
                            {isBlocked ? <MdCheckCircle size={20} /> : <MdBlock size={20} />}
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={isBusy}
                            className="p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-all hover:shadow-[0_0_10px_rgba(248,113,113,0.2)] disabled:opacity-60 disabled:cursor-not-allowed"
                            title="Delete User"
                          >
                            <MdDelete size={20} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-gray-500">
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
