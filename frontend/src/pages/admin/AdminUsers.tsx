import { useState, useEffect } from 'react';
import { Edit3, Trash2, Shield, Download, CheckSquare, Square, UserCheck, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import { adminApi } from '../../services/endpoints';
import { User } from '../../types';
import { TableContainer, Card, StatusBadge, SearchInput, Select, EmptyState } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'owner', label: 'Owner' },
  { value: 'tenant', label: 'Tenant' },
  { value: 'other', label: 'Other' },
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage all platform users</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <>
              <button onClick={() => bulkActivate(true)} className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5">
                <UserCheck className="w-3.5 h-3.5" /> Activate ({selectedIds.size})
              </button>
              <button onClick={() => bulkActivate(false)} className="btn-secondary text-xs flex items-center gap-1.5 px-3 py-1.5 text-red-600 border-red-200 hover:bg-red-50">
                <UserX className="w-3.5 h-3.5" /> Deactivate ({selectedIds.size})
              </button>
            </>
          )}
          <button onClick={handleExport} className="btn-secondary text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <TableContainer
        searchable searchPlaceholder="Search users..."
        onSearch={(q) => { setSearch(q); setPage(1); }}
        filters={
          <div className="flex flex-wrap items-center gap-3">
            <Select value={role} onChange={(v) => { setRole(v); setPage(1); }}
              options={roleOptions} placeholder="All Roles" />
            <Select value={isActive} onChange={(v) => { setIsActive(v); setPage(1); }}
              options={[
                { value: 'true', label: 'Active' },
                { value: 'false', label: 'Inactive' },
              ]}
              placeholder="All Status" />
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" title="From date" />
            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" title="To date" />
          </div>
        }
      >
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : users.length === 0 ? (
          <EmptyState icon={<Shield className="w-8 h-8" />} title="No users found" description="No users match your current filters." />
        ) : (
          <>
            <thead>
              <tr className="sticky-table-header">
                <th className="w-10">
                  <button onClick={toggleSelectAll} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                    {selectedIds.size === users.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={selectedIds.has(u.id) ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}>
                  <td>
                    <button onClick={() => toggleSelect(u.id)} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                      {selectedIds.has(u.id) ? <CheckSquare className="w-4 h-4 text-primary-500" /> : <Square className="w-4 h-4 text-gray-400" />}
                    </button>
                  </td>
                  <td className="font-medium text-gray-900 dark:text-white">{u.fullName}</td>
                  <td className="text-sm text-gray-500 dark:text-gray-400">{u.email}</td>
                  <td className="text-sm text-gray-500 dark:text-gray-400">{u.phone}</td>
                  <td>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' :
                      u.role === 'owner' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' :
                      u.role === 'tenant' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' :
                      'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-400'
                    }`}>
                      <Shield className="w-3 h-3" /> {u.role}
                    </span>
                  </td>
                  <td><StatusBadge status={u.isActive ? 'active' : 'inactive'} /></td>
                  <td className="text-sm text-gray-500 dark:text-gray-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setEditUser(u)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {u.role !== 'admin' && (
                        <button onClick={() => setDeleteId(u.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400">
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
      </TableContainer>
      {pagination.totalPages > 1 && <Pagination {...pagination} onPageChange={setPage} />}

      {/* Edit User Modal */}
      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input type="text" value={editUser.fullName} onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input type="tel" value={editUser.phone} onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100" />
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editUser.isActive ?? true}
                  onChange={(e) => setEditUser({ ...editUser, isActive: e.target.checked })}
                  className="rounded border-gray-300 dark:border-gray-600 text-primary-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setEditUser(null)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">Cancel</button>
              <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete User" message="This action cannot be undone." confirmText="Delete" variant="danger" />
    </div>
  );
}
