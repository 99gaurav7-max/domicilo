import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import { tenantApi } from '../../services/endpoints';
import { Payment } from '../../types';
import { TableContainer, StatusBadge, EmptyState } from '../../components/ui/Table';
import { Pagination } from '../../components/ui/Pagination';
import { TableSkeleton } from '../../components/ui/Skeleton';

export default function TenantPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPaid: 0, totalDue: 0, lastPayment: '' });

  useEffect(() => {
    tenantApi.getDashboard().then((res) => {
      if (res.data.success && res.data.data) {
        const d = res.data.data;
        setPayments(d.payments || []);
        setStats({
          totalPaid: d.payments?.filter((p: Payment) => p.status === 'completed').reduce((s: number, p: Payment) => s + p.amount, 0) || 0,
          totalDue: d.finances?.totalDue || 0,
          lastPayment: d.payments?.find((p: Payment) => p.paid_at)?.paid_at || '',
        });
      }
    }).catch(() => toast.error('Failed to load payments')).finally(() => setLoading(false));
  }, []);

  const handleExport = () => {
    const csv = Papa.unparse(payments.map((p) => ({
      Invoice: p.invoice_number,
      Amount: p.amount,
      Type: p.payment_type,
      Status: p.status,
      DueDate: new Date(p.due_date).toLocaleDateString(),
      PaidDate: p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '',
    })));
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'my-payments.csv'; a.click();
    toast.success('Payments exported');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">My Payments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track your payment history</p>
        </div>
        <button onClick={handleExport} className="rounded-2xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 px-4 py-2 text-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/30 dark:border-white/5 shadow-xl p-4">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total Paid</p>
          <p className="text-xl font-bold gradient-text">₹{stats.totalPaid.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className={`rounded-2xl bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/30 dark:border-white/5 shadow-xl p-4 ${stats.totalDue > 0 ? 'ring-1 ring-amber-200' : ''}`}>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total Due</p>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400">₹{stats.totalDue.toLocaleString()}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/30 dark:border-white/5 shadow-xl p-4">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Last Payment</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {stats.lastPayment ? new Date(stats.lastPayment).toLocaleDateString() : 'N/A'}
          </p>
        </motion.div>
      </div>

      {/* Payment Table */}
      <div className="rounded-2xl bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/30 dark:border-white/5 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={4} cols={5} /></div>
        ) : payments.length === 0 ? (
          <div className="p-6"><EmptyState icon={<CreditCard className="w-8 h-8" />} title="No payments yet" description="Your payment history will appear here." /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="sticky-table-header border-b border-gray-100 dark:border-gray-800">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-gray-500">Invoice</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-gray-500">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-gray-500">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-gray-500">Due Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-gray-500">Paid Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 dark:border-gray-900 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-4 py-3 text-xs font-mono text-gray-500 dark:text-gray-400">{p.invoice_number}</td>
                    <td className="px-4 py-3 font-medium text-royal-600 dark:text-royal-400">₹{p.amount.toLocaleString()}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.payment_type} /></td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{new Date(p.due_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
}
