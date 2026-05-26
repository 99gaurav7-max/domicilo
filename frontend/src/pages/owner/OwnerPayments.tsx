import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import { ownerApi } from '../../services/endpoints';
import { Payment } from '../../types';
import { TableContainer, StatusBadge, EmptyState, Select } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/Skeleton';

export default function OwnerPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [paymentType, setPaymentType] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });

  const fetchPayments = () => {
    setLoading(true);
    ownerApi.getPayments({ page, limit: 10, status, paymentType }).then((res) => {
      if (res.data.success) {
        setPayments(res.data.data!);
        setPagination(res.data.pagination!);
      }
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, [page, status, paymentType]);

  const handleExport = async () => {
    try {
      const res = await ownerApi.getPayments({ limit: 10000 });
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
        a.href = url; a.download = 'payments-export.csv'; a.click();
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
          <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Payments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track all transactions</p>
        </div>
        <button onClick={handleExport} className="rounded-2xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 px-4 py-2 text-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="rounded-2xl bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/30 dark:border-white/5 shadow-xl overflow-hidden">
        <TableContainer
          filters={
            <div className="flex gap-2">
              <Select value={status} onChange={(v) => { setStatus(v); setPage(1); }}
                options={[
                  { value: 'pending', label: 'Pending' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'failed', label: 'Failed' },
                  { value: 'overdue', label: 'Overdue' },
                ]}
                placeholder="All Status" />
              <Select value={paymentType} onChange={(v) => { setPaymentType(v); setPage(1); }}
                options={[
                  { value: 'rent', label: 'Rent' },
                  { value: 'water', label: 'Water' },
                  { value: 'electricity', label: 'Electricity' },
                  { value: 'maintenance', label: 'Maintenance' },
                  { value: 'other', label: 'Other' },
                ]}
                placeholder="All Types" />
            </div>
          }
        >
          {loading ? (
            <TableSkeleton rows={5} cols={7} />
          ) : payments.length === 0 ? (
            <EmptyState icon={<CreditCard className="w-8 h-8" />} title="No payments yet" description="Payments will appear here once tenants start paying." />
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
                    <td className="text-sm text-gray-500 dark:text-gray-400">{p.property_name}</td>
                    <td className="font-medium text-royal-400">₹{p.amount.toLocaleString()}</td>
                    <td><StatusBadge status={p.payment_type} /></td>
                    <td className="text-sm text-gray-500 dark:text-gray-400">{new Date(p.due_date).toLocaleDateString()}</td>
                    <td className="text-sm text-gray-500 dark:text-gray-400">{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '-'}</td>
                    <td><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </>
          )}
        </TableContainer>
      </div>
      {pagination.totalPages > 1 && <Pagination {...pagination} onPageChange={setPage} />}
    </motion.div>
  );
}
