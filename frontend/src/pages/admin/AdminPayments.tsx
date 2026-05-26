import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import { adminApi } from '../../services/endpoints';
import { Payment } from '../../types';
import { TableContainer, StatusBadge, EmptyState, Select } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/Skeleton';

export default function AdminPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const fetchPayments = () => {
    setLoading(true);
    adminApi.getPayments({ page, limit: 10, status }).then((res) => {
      if (res.data.success) {
        setPayments(res.data.data!);
        setPagination(res.data.pagination!);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, [page, status]);

  const handleExport = async () => {
    try {
      const res = await adminApi.getPayments({ limit: 10000 });
      if (res.data.data) {
        const csv = Papa.unparse(res.data.data.map((p: any) => ({
          Invoice: p.invoice_number,
          Tenant: p.tenant_name,
          Property: p.property_name,
          Amount: p.amount,
          Type: p.payment_type,
          Status: p.status,
          Date: p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '',
          DueDate: p.due_date ? new Date(p.due_date).toLocaleDateString() : '',
        })));
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'all-payments.csv'; a.click();
        toast.success('Payments exported');
      }
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">All Payments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Platform-wide transaction overview — rent, water, electricity, maintenance, and other payments from all properties</p>
        </div>
        <button onClick={handleExport} className="rounded-2xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 text-sm flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 transition-all">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <TableContainer
        filters={
          <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Completed' },
              { value: 'failed', label: 'Failed' },
            ]}
            placeholder="All Status" />
        }
      >
        {loading ? (
          <TableSkeleton rows={5} cols={7} />
        ) : payments.length === 0 ? (
          <EmptyState icon={<CreditCard className="w-8 h-8" />} title="No payments" description="No transactions in the system yet." />
        ) : (
          <>
            <thead>
              <tr className="sticky-table-header">
                <th>Invoice</th>
                <th>Tenant</th>
                <th>Property</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Due Date</th>
                <th>Paid Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td className="text-xs font-mono text-gray-500 dark:text-gray-400">{p.invoice_number}</td>
                  <td className="font-medium text-gray-900 dark:text-white">{p.tenant_name}</td>
                  <td className="text-sm text-gray-600 dark:text-gray-400">{p.property_name}</td>
                  <td className="font-medium gradient-text">₹{p.amount.toLocaleString()}</td>
                  <td><StatusBadge status={p.payment_type} /></td>
                  <td className="text-sm text-gray-500 dark:text-gray-400">{p.due_date ? new Date(p.due_date).toLocaleDateString() : '-'}</td>
                  <td className="text-sm text-gray-500 dark:text-gray-400">{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '-'}</td>
                  <td><StatusBadge status={p.status} /></td>
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
