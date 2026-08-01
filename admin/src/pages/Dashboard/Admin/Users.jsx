import { useEffect, useState } from 'react';
import { MdBlock, MdCheckCircle, MdDelete, MdPerson, MdRefresh, MdSearch } from 'react-icons/md';
import { apiRequest, clearAdminAuth } from '../../../utils/api';

const STATUS_STYLES = {
  approved: {
    label: 'Approved',
    icon: MdCheckCircle,
    className: 'text-emerald-400',
  },
  pending: {
    label: 'Pending',
    icon: MdRefresh,
    className: 'text-amber-400',
  },
  rejected: {
    label: 'Rejected',
    icon: MdBlock,
    className: 'text-destructive',
  },
  suspended: {
    label: 'Blocked',
    icon: MdBlock,
    className: 'text-destructive',
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
    <div className="space-y-6 md:space-y-8 animate-fade-in relative z-10 pb-16 min-h-full rounded-2xl p-4 md:p-6 border border-border shadow-sm bg-card/60 backdrop-blur-xl font-body">
      {/* Page Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-foreground tracking-tight">
            User <span className="text-gradient">Management</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1 font-body">Manage real platform users, roles, and access.</p>
        </div>

        <div className="relative w-full md:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <MdSearch className="text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-12 py-2.5 border border-border rounded-xl bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all sm:text-sm font-body"
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          {isRefreshing && (
            <MdRefresh className="absolute right-12 top-1/2 -translate-y-1/2 text-primary animate-spin" size={18} />
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive mb-4">
          {error}
        </div>
      )}

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
                <th className="py-4 px-6 font-bold text-xs uppercase tracking-wider text-muted-foreground font-display text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <MdRefresh size={48} className="opacity-20 animate-spin text-primary" />
                      <p>Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const statusConfig = STATUS_STYLES[user.status] || STATUS_STYLES.pending;
                  const StatusIcon = statusConfig.icon;
                  const isBusy = busyUserId === user.id;
                  const isBlocked = user.status === 'suspended';

                  return (
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
                          user.role === 'instructor' 
                            ? 'bg-secondary/15 text-secondary border-secondary/20 font-semibold' 
                            : 'bg-muted text-muted-foreground border-border'
                        }`}>
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`flex items-center gap-1.5 text-sm font-medium ${statusConfig.className}`}>
                          <StatusIcon size={16} />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-muted-foreground">{formatDate(user.createdAt)}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleBlock(user)}
                            disabled={isBusy}
                            className={`p-2 rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                              isBlocked
                                ? 'text-emerald-400 hover:bg-emerald-400/10'
                                : 'text-yellow-400 hover:bg-yellow-400/10'
                            }`}
                            title={isBlocked ? 'Unblock User' : 'Block User'}
                          >
                            {isBlocked ? <MdCheckCircle size={20} /> : <MdBlock size={20} />}
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            disabled={isBusy}
                            className="p-2 rounded-xl text-destructive hover:bg-destructive/10 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
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
                  <td colSpan="5" className="py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <MdSearch size={48} className="opacity-20 text-muted-foreground" />
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
