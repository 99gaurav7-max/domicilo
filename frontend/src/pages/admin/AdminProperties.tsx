import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import { adminApi } from '../../services/endpoints';
import { Property } from '../../types';
import { TableContainer, StatusBadge, Select, EmptyState } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/Skeleton';

export default function AdminProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [city, setCity] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const fetchProperties = () => {
    setLoading(true);
    adminApi.getProperties({ page, limit: 10, search, status, city }).then((res) => {
      if (res.data.success) {
        setProperties(res.data.data!);
        setPagination(res.data.pagination!);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchProperties(); }, [page, search, status, city]);

  const handleExport = async () => {
    try {
      const res = await adminApi.getProperties({ limit: 10000 });
      if (res.data.data) {
        const csv = Papa.unparse(res.data.data.map((p: any) => ({
          Name: p.name,
          Owner: p.owner_name,
          Location: p.location,
          City: p.city,
          State: p.state,
          Status: p.is_active ? 'Active' : 'Inactive',
          Rooms: p.total_rooms || 0,
          Vacant: p.vacant_rooms || 0,
          Created: new Date(p.created_at).toLocaleDateString(),
        })));
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'all-properties.csv'; a.click();
        toast.success('Properties exported');
      }
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Properties</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">View all platform properties (read-only)</p>
        </div>
        <button onClick={handleExport} className="rounded-2xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-sm flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 transition-all">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <TableContainer
        searchable searchPlaceholder="Search properties..."
        onSearch={(q) => { setSearch(q); setPage(1); }}
        filters={
          <div className="flex flex-wrap items-center gap-3">
            <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              placeholder="All Status" />
            <input type="text" value={city} onChange={(e) => { setCity(e.target.value); setPage(1); }}
              placeholder="City..." className="px-3 py-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur-sm text-sm w-32 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-royal-500/30 focus:border-royal-500/50" />
          </div>
        }
      >
        {loading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : properties.length === 0 ? (
          <EmptyState icon={<Building2 className="w-8 h-8" />} title="No properties" description="No properties found matching your criteria." />
        ) : (
          <>
            <thead>
              <tr className="sticky-table-header">
                <th>Name</th>
                <th>Owner</th>
                <th>Location</th>
                <th>City</th>
                <th>Rooms</th>
                <th>Vacant</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium text-gray-900 dark:text-white">{p.name}</td>
                  <td className="text-sm text-gray-500 dark:text-gray-400">{p.owner_name}</td>
                  <td className="text-sm text-gray-500 dark:text-gray-400">{p.location}</td>
                  <td className="text-sm text-gray-500 dark:text-gray-400">{p.city}</td>
                  <td className="text-sm text-gray-900 dark:text-gray-100">{(p as any).total_rooms || '-'}</td>
                  <td className="text-sm text-gray-900 dark:text-gray-100">{(p as any).vacant_rooms ?? '-'}</td>
                  <td><StatusBadge status={p.is_active ? 'active' : 'inactive'} /></td>
                  <td className="text-sm text-gray-500 dark:text-gray-400">{p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </>
        )}
      </TableContainer>
      {pagination.totalPages > 1 && <Pagination {...pagination} onPageChange={setPage} />}
    </motion.div>
  );
}
