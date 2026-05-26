import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Phone, Mail, Home, AlertTriangle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ownerApi, propertyApi } from '../../services/endpoints';
import { Tenant, Property, Room } from '../../types';
import { TableContainer, StatusBadge, EmptyState, Select } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';

export default function OwnerTenants() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [showCreate, setShowCreate] = useState(false);
  const [showFine, setShowFine] = useState<Tenant | null>(null);
  const [saving, setSaving] = useState(false);

  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [rooms, setRooms] = useState<Room[]>([]);

  const [form, setForm] = useState({
    fullName: '', phone: '', email: '', propertyId: '', roomId: '',
    rentAmount: 0, securityDeposit: 0, leaseStart: '',
  });

  const [fineForm, setFineForm] = useState({ amount: 0, reason: '', percentage: 0 });

  const fetchTenants = () => {
    setLoading(true);
    ownerApi.getTenants({ page, limit: 10, search, status }).then((res) => {
      if (res.data.success) {
        setTenants(res.data.data!);
        setPagination(res.data.pagination!);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchTenants(); }, [page, search, status]);

  useEffect(() => {
    if (showCreate) {
      ownerApi.getProperties({ limit: 50 }).then((res) => {
        if (res.data.success) setProperties(res.data.data!);
      });
    }
  }, [showCreate]);

  useEffect(() => {
    if (form.propertyId) {
      propertyApi.getById(form.propertyId).then((res) => {
        if (res.data.success) setRooms(res.data.data?.rooms?.filter(r => r.status === 'vacant') || []);
      });
    }
  }, [form.propertyId]);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.propertyId || !form.roomId || !form.rentAmount) {
      toast.error('Please fill in required fields');
      return;
    }
    setSaving(true);
    try {
      await ownerApi.createTenant(form);
      toast.success('Tenant created successfully');
      setShowCreate(false);
      setForm({ fullName: '', phone: '', email: '', propertyId: '', roomId: '', rentAmount: 0, securityDeposit: 0, leaseStart: '' });
      fetchTenants();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create tenant');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyFine = async () => {
    if (!showFine || !fineForm.amount) { toast.error('Enter fine amount'); return; }
    try {
      await ownerApi.applyFine(showFine.id, fineForm.amount, fineForm.reason || 'Fine applied');
      toast.success('Fine applied successfully');
      setShowFine(null);
      setFineForm({ amount: 0, reason: '', percentage: 0 });
    } catch {
      toast.error('Failed to apply fine');
    }
  };

  const calcFinePreview = (rent: number, percent: number) => {
    return Math.round(rent * (percent / 100));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Tenants</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your tenants</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="rounded-2xl bg-gradient-to-r from-royal-600 to-royal-800 text-white hover:shadow-xl hover:shadow-royal-500/20 px-4 py-2 text-sm flex items-center gap-2">
          <UserPlus className="w-4 h-4" /> Add Tenant
        </button>
      </div>

      <div className="rounded-2xl bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/30 dark:border-white/5 shadow-xl overflow-hidden">
        <TableContainer
          searchable searchPlaceholder="Search tenants..."
          onSearch={(q) => { setSearch(q); setPage(1); }}
          filters={
            <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              placeholder="All Status" />
          }
        >
          {loading ? (
            <TableSkeleton rows={5} cols={7} />
          ) : tenants.length === 0 ? (
            <EmptyState icon={<Home className="w-8 h-8" />} title="No tenants yet"
              description="Add tenants to start managing their rentals."
              action={<button onClick={() => setShowCreate(true)} className="rounded-2xl bg-gradient-to-r from-royal-600 to-royal-800 text-white hover:shadow-xl hover:shadow-royal-500/20 px-4 py-2 text-sm">Add Tenant</button>} />
          ) : (
            <>
              <thead>
                <tr className="sticky-table-header">
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Property</th>
                  <th>Room</th>
                  <th>Rent</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id}>
                    <td className="font-medium text-gray-900 dark:text-white">{t.full_name}</td>
                    <td>
                      <div className="flex flex-col text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {t.phone}</span>
                        {t.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {t.email}</span>}
                      </div>
                    </td>
                    <td className="text-sm text-gray-500 dark:text-gray-400">{t.property_name}</td>
                    <td><span className="text-sm text-gray-700 dark:text-gray-300">{t.room_number} ({t.room_type})</span></td>
                    <td className="font-medium text-royal-400">₹{(t.rent_amount || t.room_rent || 0).toLocaleString()}</td>
                    <td>
                      {(t.due_amount || 0) > 0 ? (
                        <span className="text-amber-600 dark:text-amber-400 font-medium">₹{(t.due_amount || 0).toLocaleString()}</span>
                      ) : (
                        <span className="text-green-600 dark:text-green-400 text-xs">No dues</span>
                      )}
                      {(t.overdue_amount || 0) > 0 && (
                        <span className="block text-xs text-red-500 dark:text-red-400">Overdue: ₹{t.overdue_amount?.toLocaleString()}</span>
                      )}
                    </td>
                    <td><StatusBadge status={t.is_active ? 'active' : 'inactive'} /></td>
                    <td className="text-right">
                      {t.is_active ? (
                        <button onClick={() => { setShowFine(t); setFineForm({ amount: Math.round((t.rent_amount || t.room_rent || 0) * 0.1), reason: 'Late fee', percentage: 10 }); }}
                          className="px-2 py-1 text-xs rounded-2xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 transition-colors">
                          Charge Fine
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">Inactive</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </>
          )}
        </TableContainer>
      </div>
      {pagination.totalPages > 1 && <Pagination {...pagination} onPageChange={setPage} />}

      {/* Create Tenant Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add New Tenant" size="xl">
        <form onSubmit={handleCreateTenant} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
              <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full rounded-2xl bg-white/70 dark:bg-black/30 backdrop-blur-sm border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-2xl bg-white/70 dark:bg-black/30 backdrop-blur-sm border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-2xl bg-white/70 dark:bg-black/30 backdrop-blur-sm border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property *</label>
              <select value={form.propertyId} onChange={(e) => setForm({ ...form, propertyId: e.target.value, roomId: '' })}
                className="w-full rounded-2xl bg-white/70 dark:bg-black/30 backdrop-blur-sm border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50 px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                <option value="">Select Property</option>
                {properties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room *</label>
              <select value={form.roomId} onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                className="w-full rounded-2xl bg-white/70 dark:bg-black/30 backdrop-blur-sm border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50 px-3 py-2 text-sm text-gray-900 dark:text-gray-100">
                <option value="">Select Room</option>
                {rooms.map((r) => <option key={r.id} value={r.id}>{r.room_number} - {r.room_type} (₹{r.rent.toLocaleString()})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Rent Amount *</label>
              <input type="number" value={form.rentAmount || ''} onChange={(e) => setForm({ ...form, rentAmount: Number(e.target.value) })}
                className="w-full rounded-2xl bg-white/70 dark:bg-black/30 backdrop-blur-sm border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Security Deposit</label>
              <input type="number" value={form.securityDeposit || ''} onChange={(e) => setForm({ ...form, securityDeposit: Number(e.target.value) })}
                className="w-full rounded-2xl bg-white/70 dark:bg-black/30 backdrop-blur-sm border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lease Start</label>
              <input type="date" value={form.leaseStart} onChange={(e) => setForm({ ...form, leaseStart: e.target.value })}
                className="w-full rounded-2xl bg-white/70 dark:bg-black/30 backdrop-blur-sm border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="rounded-2xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 px-4 py-2 text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="rounded-2xl bg-gradient-to-r from-royal-600 to-royal-800 text-white hover:shadow-xl hover:shadow-royal-500/20 px-4 py-2 text-sm disabled:opacity-50">{saving ? 'Creating...' : 'Create Tenant'}</button>
          </div>
        </form>
      </Modal>

      {/* Fine Modal */}
      <Modal isOpen={!!showFine} onClose={() => setShowFine(null)} title="Charge Fine" size="md">
        {showFine && (
          <div className="space-y-4">
            <div className="p-3 rounded-2xl bg-gray-50 dark:bg-gray-900/50">
              <p className="text-sm text-gray-500 dark:text-gray-400">Tenant: <span className="font-medium text-gray-900 dark:text-white">{showFine.full_name}</span></p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Rent: <span className="font-medium">₹{(showFine.rent_amount || showFine.room_rent || 0).toLocaleString()}</span></p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fine Percentage (of rent)</label>
              <input type="number" value={fineForm.percentage} onChange={(e) => {
                const pct = Number(e.target.value);
                const rent = showFine.rent_amount || showFine.room_rent || 0;
                setFineForm({ ...fineForm, percentage: pct, amount: calcFinePreview(rent, pct) });
              }}
                className="w-full rounded-2xl bg-white/70 dark:bg-black/30 backdrop-blur-sm border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fine Amount *</label>
              <input type="number" value={fineForm.amount} onChange={(e) => setFineForm({ ...fineForm, amount: Number(e.target.value) })}
                className="w-full rounded-2xl bg-white/70 dark:bg-black/30 backdrop-blur-sm border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason</label>
              <input type="text" value={fineForm.reason} onChange={(e) => setFineForm({ ...fineForm, reason: e.target.value })}
                className="w-full rounded-2xl bg-white/70 dark:bg-black/30 backdrop-blur-sm border border-gray-200 dark:border-white/10 focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50 px-3 py-2 text-sm text-gray-900 dark:text-gray-100" placeholder="Late payment fee" />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowFine(null)} className="rounded-2xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 px-4 py-2 text-sm">Cancel</button>
              <button onClick={handleApplyFine} className="rounded-2xl bg-gradient-to-r from-royal-600 to-royal-800 text-white hover:shadow-xl hover:shadow-royal-500/20 px-4 py-2 text-sm">Apply Fine</button>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
