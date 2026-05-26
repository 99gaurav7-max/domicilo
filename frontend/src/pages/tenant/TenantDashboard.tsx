import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Home, CreditCard, DollarSign, Clock, AlertTriangle, Bell,
  FileText, MapPin, CheckCircle, XCircle, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { tenantApi } from '../../services/endpoints';
import { TenantDashboardData } from '../../types';
import { Card, StatusBadge, EmptyState } from '../../components/ui/Table';
import { KPISkeleton, TableSkeleton } from '../../components/ui/Skeleton';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function TenantDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<TenantDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tenantApi.getDashboard().then((res) => {
      if (res.data.success) setData(res.data.data!);
    }).catch(() => toast.error('Failed to load dashboard')).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Loader2 className="w-5 h-5 text-royal-500 animate-spin" />
        <span className="text-sm text-gray-500 dark:text-gray-400 font-display">Loading dashboard...</span>
      </div>
      <KPISkeleton />
    </motion.div>
  );

  if (!data) return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <EmptyState icon={<Home className="w-8 h-8" />} title="No tenant data found" description="Contact your property owner for assistance." />
    </motion.div>
  );

  const { tenant, property, room, finances, payments } = data;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Welcome, {tenant.fullName}!</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Your rental dashboard</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="kpi-card relative overflow-hidden before:absolute before:top-0 before:left-4 before:right-4 before:h-[3px] before:bg-gradient-to-r before:from-gold-400 before:to-royal-500 before:rounded-full"
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide font-display">Monthly Rent</p>
            <DollarSign className="w-4 h-4 text-royal-400" />
          </div>
          <p className="text-xl font-bold gradient-text">₹{tenant.rentAmount.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className={`kpi-card relative overflow-hidden before:absolute before:top-0 before:left-4 before:right-4 before:h-[3px] before:bg-gradient-to-r before:from-gold-400 before:to-royal-500 before:rounded-full ${finances.totalDue > 0 ? 'ring-1 ring-amber-200 dark:ring-amber-900' : ''}`}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide font-display">Total Due</p>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-bold gradient-text">₹{finances.totalDue.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={`kpi-card relative overflow-hidden before:absolute before:top-0 before:left-4 before:right-4 before:h-[3px] before:bg-gradient-to-r before:from-gold-400 before:to-royal-500 before:rounded-full ${finances.overdueAmount > 0 ? 'ring-1 ring-red-200 dark:ring-red-900' : ''}`}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide font-display">Overdue</p>
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-xl font-bold gradient-text">₹{finances.overdueAmount.toLocaleString()}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`kpi-card relative overflow-hidden before:absolute before:top-0 before:left-4 before:right-4 before:h-[3px] before:bg-gradient-to-r before:from-gold-400 before:to-royal-500 before:rounded-full ${finances.unpaidFines > 0 ? 'ring-1 ring-red-200 dark:ring-red-900' : ''}`}
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide font-display">Unpaid Fines</p>
            <AlertTriangle className="w-4 h-4 text-orange-400" />
          </div>
          <p className="text-xl font-bold gradient-text">₹{finances.unpaidFines.toLocaleString()}</p>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Property Details */}
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 font-display">Your Property</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 ring-1 ring-royal-500/20">
                <img src={property.images?.[0] || ''} alt={property.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{property.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3 text-royal-500" /> {property.location}, {property.city}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="p-2 rounded-lg bg-white/40 dark:bg-white/5">
                <p className="text-xs text-gray-500 dark:text-gray-400">Room</p>
                <p className="font-medium text-gray-900 dark:text-white">{room.number} ({room.type})</p>
              </div>
              <div className="p-2 rounded-lg bg-white/40 dark:bg-white/5">
                <p className="text-xs text-gray-500 dark:text-gray-400">Rent</p>
                <p className="font-medium text-gray-900 dark:text-white">₹{room.rent.toLocaleString()}/mo</p>
              </div>
              <div className="p-2 rounded-lg bg-white/40 dark:bg-white/5">
                <p className="text-xs text-gray-500 dark:text-gray-400">Lease Start</p>
                <p className="font-medium text-gray-900 dark:text-white">{new Date(tenant.leaseStart).toLocaleDateString()}</p>
              </div>
              <div className="p-2 rounded-lg bg-white/40 dark:bg-white/5">
                <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                <StatusBadge status={room.status} />
              </div>
            </div>
          </div>
        </Card>

        {/* Recent Payments */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 font-display">Payment History</h3>
          {payments.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">No payments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20 dark:border-white/10">
                    <th className="text-left py-2 text-xs text-gray-500 dark:text-gray-400 font-medium font-display">Invoice</th>
                    <th className="text-left py-2 text-xs text-gray-500 dark:text-gray-400 font-medium font-display">Type</th>
                    <th className="text-left py-2 text-xs text-gray-500 dark:text-gray-400 font-medium font-display">Amount</th>
                    <th className="text-left py-2 text-xs text-gray-500 dark:text-gray-400 font-medium font-display">Date</th>
                    <th className="text-left py-2 text-xs text-gray-500 dark:text-gray-400 font-medium font-display">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.slice(0, 5).map((p) => (
                    <tr key={p.id} className="border-b border-white/10 dark:border-white/5 hover:bg-white/20 dark:hover:bg-white/5 transition-colors">
                      <td className="py-2.5 text-xs font-mono text-gray-500 dark:text-gray-400">{p.invoice_number}</td>
                      <td className="py-2.5 capitalize text-gray-900 dark:text-gray-100">{p.payment_type}</td>
                      <td className="py-2.5 font-medium gradient-text">₹{p.amount.toLocaleString()}</td>
                      <td className="py-2.5 text-gray-500 dark:text-gray-400">{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '-'}</td>
                      <td className="py-2.5"><StatusBadge status={p.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {payments.length > 5 && (
            <button onClick={() => navigate('/tenant/payments')} className="rounded-2xl bg-gradient-to-r from-royal-600 to-royal-800 text-white text-sm px-4 py-2 mt-3 hover:shadow-lg hover:shadow-royal-500/25 transition-all duration-300">
              View all payments
            </button>
          )}
        </Card>
      </div>

      {/* Notifications */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white font-display">Recent Notifications</h3>
          <Bell className="w-4 h-4 text-royal-400" />
        </div>
        {data.notifications.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet.</p>
        ) : (
          <div className="space-y-2">
            {data.notifications.slice(0, 5).map((n) => (
              <div key={n.id} className={`p-3 rounded-xl text-sm ${n.is_read ? 'bg-white/30 dark:bg-white/5' : 'bg-royal-500/10 dark:bg-royal-500/20'} backdrop-blur-sm border border-white/20 dark:border-white/5`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{n.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                  </div>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
