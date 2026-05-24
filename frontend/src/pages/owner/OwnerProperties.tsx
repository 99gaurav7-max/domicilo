import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2, Building2, MapPin, Home, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ownerApi } from '../../services/endpoints';
import { Property } from '../../types';
import { TableContainer, Card, StatusBadge, EmptyState, SearchInput } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { indianStatesCities } from '../../data/indianStatesCities';

export default function OwnerProperties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProperties = () => {
    setLoading(true);
    ownerApi.getProperties({ page, limit: 10, search }).then((res) => {
      if (res.data.success) {
        setProperties(res.data.data!);
        setPagination(res.data.pagination!);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProperties(); }, [page, search]);

  const [form, setForm] = useState({
    name: '', description: '', location: '', city: '', state: '', pincode: '',
    amenities: [] as string[], images: [] as string[],
  });

  const formCities = form.state ? indianStatesCities[form.state] || [] : [];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.location || !form.city || !form.state) {
      toast.error('Please fill in required fields');
      return;
    }
    setSaving(true);
    try {
      await ownerApi.createProperty(form);
      toast.success('Property created successfully');
      setShowCreate(false);
      setForm({ name: '', description: '', location: '', city: '', state: '', pincode: '', amenities: [], images: [] });
      fetchProperties();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create property');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await ownerApi.deleteProperty(deleteId);
      toast.success('Property deleted');
      setDeleteId(null);
      fetchProperties();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const availableAmenities = ['WiFi', 'Parking', 'Gym', 'Security', 'Power Backup', 'Lift', 'Swimming Pool', 'Garden', 'Rain Water Harvesting', 'Club House', 'Spa'];

  const toggleAmenity = (a: string) => {
    setForm((f) => ({
      ...f,
      amenities: f.amenities.includes(a) ? f.amenities.filter((x) => x !== a) : [...f.amenities, a],
    }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Properties</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your rental properties</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Property
        </button>
      </div>

      <TableContainer
        searchable
        searchPlaceholder="Search properties..."
        onSearch={(q) => { setSearch(q); setPage(1); }}
      >
        {loading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : properties.length === 0 ? (
          <EmptyState icon={<Building2 className="w-8 h-8" />} title="No properties yet"
            description="Add your first property to start managing rentals."
            action={<button onClick={() => setShowCreate(true)} className="btn-primary text-sm">Add Property</button>} />
        ) : (
          <>
            <thead>
              <tr className="sticky-table-header">
                <th>Property</th>
                <th>Location</th>
                <th>Rooms</th>
                <th>Vacant</th>
                <th>Tenants</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium text-gray-900 dark:text-white">{p.name}</td>
                  <td className="text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {p.city}</span>
                  </td>
                  <td>{p.rooms?.length || 0}</td>
                  <td><StatusBadge status={p.vacant_rooms! > 0 ? `${p.vacant_rooms} vacant` : 'full'} /></td>
                  <td>{p.tenant_count || 0}</td>
                  <td><StatusBadge status={p.is_active ? 'active' : 'inactive'} /></td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(`/properties/${p.id}`)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400" title="View Details"><Eye className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteId(p.id); }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </>
        )}
      </TableContainer>
      {pagination.totalPages > 1 && <Pagination {...pagination} onPageChange={setPage} />}

      {/* Create Property Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Add New Property" size="xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Property Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State *</label>
              <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value, city: '' })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100">
                <option value="" className="text-gray-900 dark:text-gray-100">Select State</option>
                {Object.keys(indianStatesCities).sort((a,b)=>a.localeCompare(b)).map((s) => <option key={s} value={s} className="text-gray-900 dark:text-gray-100">{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City *</label>
              <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100"
                disabled={!form.state}>
                <option value="" className="text-gray-900 dark:text-gray-100">Select City</option>
                {formCities.map((c) => <option key={c} value={c} className="text-gray-900 dark:text-gray-100">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode</label>
              <input type="text" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {availableAmenities.map((a) => (
                  <button key={a} type="button" onClick={() => toggleAmenity(a)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      form.amenities.includes(a)
                        ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-300 text-primary-700 dark:text-primary-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    }`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm text-gray-700 dark:text-gray-300">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary text-sm">{saving ? 'Creating...' : 'Create Property'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Delete Property" message="Are you sure you want to delete this property? This action cannot be undone."
        confirmText="Delete" variant="danger" />
    </div>
  );
}
