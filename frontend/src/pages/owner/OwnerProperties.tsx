import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Building2, MapPin, Home, Eye, GripVertical, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ownerApi } from '../../services/endpoints';
import { Property } from '../../types';
import { TableContainer, Card, StatusBadge, EmptyState, Select } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { Modal, ConfirmDialog } from '../../components/ui/Modal';
import { TableSkeleton } from '../../components/ui/Skeleton';
import { indianStatesCities } from '../../data/indianStatesCities';

const roomTypes = ['1RK', '1BHK', '2BHK', '3BHK', '4BHK', '5BHK', '6BHK', '7BHK', '8BHK', '9BHK', '10BHK'];

export default function OwnerProperties() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchProperties = () => {
    setLoading(true);
    ownerApi.getProperties({ page, limit: 10, search, status: status || undefined }).then((res) => {
      if (res.data.success) {
        setProperties(res.data.data!);
        setPagination(res.data.pagination!);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProperties(); }, [page, search, status]);

  const [form, setForm] = useState({
    name: '', description: '', location: '', city: '', state: '', pincode: '',
    amenities: [] as string[], images: [] as string[],
  });

  const [rooms, setRooms] = useState<{ roomNumber: string; roomType: string; rent: string; securityDeposit: string; floorNumber: string; squareFeet: string }[]>([]);

  const formCities = form.state ? indianStatesCities[form.state] || [] : [];

  const addRoom = () => {
    setRooms([...rooms, { roomNumber: '', roomType: '1BHK', rent: '', securityDeposit: '', floorNumber: '', squareFeet: '' }]);
  };

  const removeRoom = (i: number) => {
    setRooms(rooms.filter((_, idx) => idx !== i));
  };

  const updateRoom = (i: number, field: string, value: string) => {
    setRooms(rooms.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.location || !form.city || !form.state) {
      toast.error('Please fill in required fields');
      return;
    }
    for (let i = 0; i < rooms.length; i++) {
      if (!rooms[i].roomNumber || !rooms[i].roomType || !rooms[i].rent) {
        toast.error(`Room ${i + 1}: Room number, type, and rent are required`);
        return;
      }
    }
    setSaving(true);
    try {
      await ownerApi.createProperty({
        ...form,
        rooms: rooms.map(r => ({
          roomNumber: r.roomNumber,
          roomType: r.roomType,
          rent: Number(r.rent),
          securityDeposit: r.securityDeposit ? Number(r.securityDeposit) : 0,
          floorNumber: r.floorNumber ? Number(r.floorNumber) : null,
          squareFeet: r.squareFeet ? Number(r.squareFeet) : null,
        })),
      });
      toast.success('Property created successfully');
      setShowCreate(false);
      setForm({ name: '', description: '', location: '', city: '', state: '', pincode: '', amenities: [], images: [] });
      setRooms([]);
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
        searchable searchPlaceholder="Search by name, location, city..."
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
        ) : properties.length === 0 ? (
          <EmptyState icon={<Building2 className="w-8 h-8" />} title="No properties yet"
            description="Add your first property to start managing rentals."
            action={<button onClick={() => setShowCreate(true)} className="btn-primary text-sm">Add Property</button>} />
        ) : (
          <>
            <thead>
              <tr className="sticky-table-header">
                <th className="text-left">Property</th>
                <th className="text-left">Location</th>
                <th className="text-center">Rooms</th>
                <th className="text-center">Vacant</th>
                <th className="text-center">Tenants</th>
                <th className="text-center">Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium text-gray-900 dark:text-white">{p.name}</td>
                  <td className="text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3 flex-shrink-0" /> {p.city}, {p.state}</span>
                  </td>
                  <td className="text-center text-gray-700 dark:text-gray-300">{p.rooms?.length || 0}</td>
                  <td className="text-center">
                    <StatusBadge status={p.vacant_rooms! > 0 ? `${p.vacant_rooms} vacant` : 'full'} />
                  </td>
                  <td className="text-center text-gray-700 dark:text-gray-300">{p.tenant_count || 0}</td>
                  <td className="text-center"><StatusBadge status={p.is_active ? 'active' : 'inactive'} /></td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => navigate(`/properties/${p.id}`)} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-royal-50 dark:bg-royal-900/20 text-royal-700 dark:text-royal-300 hover:bg-royal-100 dark:hover:bg-royal-900/40 transition-colors flex items-center gap-1">
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteId(p.id); }} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center gap-1">
                        <Trash2 className="w-3 h-3" /> Delete
                      </button>
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
        <form onSubmit={handleCreate} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
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
                        ? 'bg-royal-50 dark:bg-royal-900/30 border-royal-300 text-royal-700 dark:text-royal-300'
                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                    }`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Rooms Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Rooms</label>
              <button type="button" onClick={addRoom} className="text-xs px-3 py-1.5 rounded-lg bg-royal-50 dark:bg-royal-900/20 text-royal-700 dark:text-royal-300 font-medium hover:bg-royal-100 dark:hover:bg-royal-900/40 transition-colors flex items-center gap-1">
                <Plus className="w-3 h-3" /> Add Room
              </button>
            </div>
            {rooms.length === 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">No rooms added yet. You can add rooms now or later from the property detail page.</p>
            )}
            <div className="space-y-3">
              {rooms.map((room, i) => (
                <div key={i} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Room {i + 1}</span>
                    <button type="button" onClick={() => removeRoom(i)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">Room No. *</label>
                      <input type="text" value={room.roomNumber} onChange={(e) => updateRoom(i, 'roomNumber', e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">Type *</label>
                      <select value={room.roomType} onChange={(e) => updateRoom(i, 'roomType', e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100">
                        {roomTypes.map((t) => <option key={t} value={t} className="text-gray-900 dark:text-gray-100">{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">Rent (₹) *</label>
                      <input type="number" value={room.rent} onChange={(e) => updateRoom(i, 'rent', e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">Deposit (₹)</label>
                      <input type="number" value={room.securityDeposit} onChange={(e) => updateRoom(i, 'securityDeposit', e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">Floor</label>
                      <input type="number" value={room.floorNumber} onChange={(e) => updateRoom(i, 'floorNumber', e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-0.5">Sq.Ft.</label>
                      <input type="number" value={room.squareFeet} onChange={(e) => updateRoom(i, 'squareFeet', e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-gray-900 dark:text-gray-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-white dark:bg-gray-950 py-3 border-t border-gray-100 dark:border-gray-800">
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
