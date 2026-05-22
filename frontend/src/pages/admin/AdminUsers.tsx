import { useState, useEffect } from 'react';
import { Edit3, Trash2, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/endpoints';
import { User } from '../../types';
import { TableContainer, Card, StatusBadge, SearchInput } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    adminApi.getUsers({ page, limit: 10, search, role }).then((res) => {
      if (res.data.success) {
        setUsers(res.data.data!);
        setPagination(res.data.pagination!);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, search, role]);

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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage all platform users</p>
      </div>

      <TableContainer
        searchable searchPlaceholder="Search users..."
        onSearch={(q) => { setSearch(q); setPage(1); }}
        filters={
          <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
            <option value="tenant">Tenant</option>
          </select>
        }
      >
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : (
          <>
            <thead>
              <tr className="sticky-table-header">
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
                <tr key={u.id}>
                  <td className="font-medium text-gray-900 dark:text-white">{u.fullName}</td>
                  <td className="text-sm text-gray-500">{u.email}</td>
                  <td className="text-sm text-gray-500">{u.phone}</td>
                  <td>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.role === 'admin' ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' :
                      u.role === 'owner' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' :
                      'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    }`}>
                      <Shield className="w-3 h-3" /> {u.role}
                    </span>
                  </td>
                  <td><StatusBadge status={u.isActive ? 'active' : 'inactive'} /></td>
                  <td className="text-sm text-gray-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}</td>
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
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input type="text" value={editUser.fullName} onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={editUser.email} onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input type="tel" value={editUser.phone} onChange={(e) => setEditUser({ ...editUser, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border bg-white dark:bg-gray-800 text-sm" />
            </div>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editUser.isActive ?? true}
                  onChange={(e) => setEditUser({ ...editUser, isActive: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600" />
                <span className="text-sm">Active</span>
              </label>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setEditUser(null)} className="px-4 py-2 rounded-lg border text-sm">Cancel</button>
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
