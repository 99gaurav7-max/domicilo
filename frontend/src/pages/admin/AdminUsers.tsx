import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit3, Trash2, Shield, Download, CheckSquare, Square, UserCheck, UserX, Crown, Filter, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import { adminApi } from '../../services/endpoints';
import { User } from '../../types';
import { TableContainer, StatusBadge, Select, EmptyState } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'owner', label: 'Owner' },
  { value: 'tenant', label: 'Tenant' },
  { value: 'other', label: 'Other' },
];

const statusOptions = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [isActive, setIsActive] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchUsers = () => {
    setLoading(true);
    const params: any = { page, limit: 10, search, role };
    if (isActive) params.isActive = isActive;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    adminApi.getUsers(params).then((res) => {
      if (res.data.success) {
        setUsers(res.data.data!);
        setPagination(res.data.pagination!);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, search, role, isActive, dateFrom, dateTo]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setSaving(true);
    try {
      await adminApi.updateUser(editUser.id, editUser);
      toast.success('User updated');
      setEditUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminApi.deleteUser(deleteId);
      toast.success('User deleted');
      setDeleteId(null);
      fetchUsers();
    } catch { toast.error('Delete failed'); }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map((u) => u.id)));
    }
  };

  const bulkActivate = async (active: boolean) => {
    if (selectedIds.size === 0) { toast.error('No users selected'); return; }
    try {
      await adminApi.bulkUpdateUsers(Array.from(selectedIds), { isActive: active });
      toast.success(`${selectedIds.size} user(s) ${active ? 'activated' : 'deactivated'}`);
      setSelectedIds(new Set());
      fetchUsers();
    } catch { toast.error('Bulk update failed'); }
  };

  const handleExport = async () => {
    try {
      const res = await adminApi.getUsers({ limit: 10000 });
      if (res.data.data) {
        const csv = Papa.unparse(res.data.data.map((u: any) => ({
          Name: u.full_name,
          Email: u.email,
          Phone: u.phone,
          Role: u.role,
          Status: u.is_active ? 'Active' : 'Inactive',
          Joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : '',
          LastLogin: u.last_login ? new Date(u.last_login).toLocaleDateString() : '',
        })));
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'all-users.csv'; a.click();
        toast.success('Users exported');
      }
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-royal-600 to-royal-800 flex items-center justify-center shadow-xl shadow-royal-500/20 border border-royal-400/10">
            <Crown className="w-7 h-7 text-gold-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display tracking-tight">User Management</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Manage all platform users</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-royal-500/10 to-gold-500/5 border border-royal-400/10">
              <span className="text-xs text-royal-400 font-medium mr-1">{selectedIds.size} selected</span>
              <button onClick={() => bulkActivate(true)}
                className="rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 px-3.5 py-2 hover:shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95">
                <UserCheck className="w-3.5 h-3.5" /> Activate
              </button>
              <button onClick={() => bulkActivate(false)}
                className="rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-semibold flex items-center gap-1.5 px-3.5 py-2 hover:shadow-lg hover:shadow-red-500/20 transition-all active:scale-95">
                <UserX className="w-3.5 h-3.5" /> Suspend
              </button>
            </div>
          )}
          <button onClick={handleExport}
            className="rounded-2xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-sm flex items-center gap-2 px-4 py-2.5 text-gray-700 dark:text-gray-300 transition-all active:scale-95">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/20 dark:border-white/5 shadow-xl shadow-black/5 dark:shadow-black/20 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-royal-400" />
          <span className="text-xs font-semibold text-royal-400 uppercase tracking-widest">Filters</span>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[200px] flex-1">
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-1.5">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search users..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50 transition-all" />
            </div>
          </div>
          <div className="min-w-[140px]">
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-1.5">Role</label>
            <Select value={role} onChange={(v) => { setRole(v); setPage(1); }}
              options={roleOptions} placeholder="All Roles" />
          </div>
          <div className="min-w-[140px]">
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-1.5">Status</label>
            <Select value={isActive} onChange={(v) => { setIsActive(v); setPage(1); }}
              options={statusOptions} placeholder="All Status" />
          </div>
          <div className="min-w-[140px]">
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-1.5">From Date</label>
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50 transition-all" />
          </div>
          <div className="min-w-[140px]">
            <label className="block text-[10px] font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-widest mb-1.5">To Date</label>
            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50 transition-all" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/20 dark:border-white/5 shadow-xl shadow-black/5 dark:shadow-black/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            {loading ? (
              <TableSkeleton rows={5} cols={6} />
            ) : users.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={8}>
                    <EmptyState icon={<Shield className="w-8 h-8" />} title="No users found" description="No users match your current filters." />
                  </td>
                </tr>
              </tbody>
            ) : (
              <>
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/5">
                    <th className="w-12 px-4 py-4">
                      <button onClick={toggleSelectAll}
                        className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                          selectedIds.size === users.length
                            ? 'bg-gradient-to-br from-royal-500 to-royal-700 text-white shadow-sm shadow-royal-500/30'
                            : 'border border-gray-300 dark:border-gray-600 hover:border-royal-400'
                        }`}>
                        {selectedIds.size === users.length ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : selectedIds.size > 0 ? (
                          <Square className="w-3.5 h-3.5 text-royal-400" />
                        ) : null}
                      </button>
                    </th>
                    <th className="px-4 py-4 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-widest">Name</th>
                    <th className="px-4 py-4 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-widest">Email</th>
                    <th className="px-4 py-4 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-widest">Phone</th>
                    <th className="px-4 py-4 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-widest">Role</th>
                    <th className="px-4 py-4 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-widest">Status</th>
                    <th className="px-4 py-4 text-left text-[10px] font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-widest">Joined</th>
                    <th className="px-4 py-4 text-right text-[10px] font-semibold text-gray-500 dark:text-gray-500 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {users.map((u) => (
                    <tr key={u.id}
                      className={`transition-all duration-200 ${
                        selectedIds.has(u.id)
                          ? 'bg-gradient-to-r from-royal-500/5 via-royal-500/3 to-transparent'
                          : 'hover:bg-gray-50/50 dark:hover:bg-white/3'
                      }`}>
                      <td className="w-12 px-4 py-4">
                        <button onClick={() => toggleSelect(u.id)}
                          className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                            selectedIds.has(u.id)
                              ? 'bg-gradient-to-br from-royal-500 to-royal-700 text-white shadow-sm shadow-royal-500/30'
                              : 'border border-gray-300 dark:border-gray-600 hover:border-royal-400'
                          }`}>
                          {selectedIds.has(u.id) && <CheckSquare className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{u.fullName}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{u.email}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400 font-mono tracking-tight">{u.phone}</span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                          u.role === 'admin' ? 'bg-gradient-to-r from-royal-500/15 to-royal-600/10 text-royal-600 dark:text-royal-400 border border-royal-500/15' :
                          u.role === 'owner' ? 'bg-gradient-to-r from-gold-500/15 to-gold-600/10 text-amber-700 dark:text-gold-400 border border-gold-500/15' :
                          u.role === 'tenant' ? 'bg-gradient-to-r from-emerald-500/15 to-emerald-600/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/15' :
                          'bg-gradient-to-r from-gray-500/10 to-gray-600/5 text-gray-600 dark:text-gray-400 border border-gray-500/10'
                        }`}>
                          <Shield className="w-3 h-3" /> {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold ${
                          u.isActive
                            ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/15'
                            : 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/15'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}</span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditUser(u)} aria-label="Edit user"
                            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-royal-500/10 text-gray-400 hover:text-royal-500 transition-all active:scale-90">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {u.role !== 'admin' && (
                            <button onClick={() => setDeleteId(u.id)} aria-label="Delete user"
                              className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-red-500/10 text-gray-400 hover:text-red-500 transition-all active:scale-90">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </>
            )}
          </table>
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination {...pagination} onPageChange={setPage} />
        </div>
      )}

      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input type="text" value={editUser.fullName} onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                className="w-full px-3 py-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur-sm text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                className="w-full px-3 py-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur-sm text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input type="tel" value={editUser.phone} onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur-sm text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50" />
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editUser.isActive ?? true}
                  onChange={(e) => setEditUser({ ...editUser, isActive: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600 text-royal-500" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setEditUser(null)} className="rounded-2xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">Cancel</button>
              <button type="submit" disabled={saving} className="rounded-2xl bg-gradient-to-r from-royal-600 to-royal-800 text-white px-4 py-2 text-sm font-medium hover:from-royal-500 hover:to-royal-700 transition-all disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete User" message="This action cannot be undone." confirmText="Delete" variant="danger" />
    </motion.div>
  );
}
