import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useThemeStore } from '../../store/themeStore';
import {
  TrendingUp, DollarSign, Home, Users, Clock, AlertTriangle, Building2, ClipboardList,
  BarChart3, Download, ShieldAlert
} from 'lucide-react';
import { ownerApi } from '../../services/endpoints';
import { OwnerDashboardData } from '../../types';
import { KPISkeleton } from '../../components/ui/Skeleton';
import { Card, EmptyState } from '../../components/ui/Table';
import toast from 'react-hot-toast';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const kpiConfig = [
  { key: 'totalRevenue', label: 'Total Revenue', icon: DollarSign, prefix: '₹', format: true },
  { key: 'monthlyRevenue', label: 'Monthly Revenue', icon: TrendingUp, prefix: '₹', format: true },
  { key: 'occupancyRate', label: 'Occupancy Rate', icon: Home, suffix: '%' },
  { key: 'pendingDues', label: 'Pending Dues', icon: Clock, prefix: '₹', format: true, danger: true },
  { key: 'overduePayments', label: 'Overdue', icon: AlertTriangle, prefix: '₹', format: true, danger: true },
  { key: 'totalTenants', label: 'Total Tenants', icon: Users },
  { key: 'totalProperties', label: 'Properties', icon: Building2 },
  { key: 'activeLeads', label: 'Active Leads', icon: ClipboardList },
  { key: 'vacancyCount', label: 'Vacancies', icon: Home },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.06 } },
};

const fadeUpChild = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

export default function OwnerDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<OwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useThemeStore();
  const [timeframe, setTimeframe] = useState('12months');

  useEffect(() => {
    ownerApi.getDashboard().then((res) => {
      if (res.data.success && res.data.data) setData(res.data.data!);
    }).catch(() => toast.error('Failed to load dashboard')).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <KPISkeleton />
    </motion.div>
  );
  if (!data) return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <EmptyState icon={<ShieldAlert className="w-8 h-8" />} title="Failed to load dashboard"
        description="Could not fetch dashboard data. Please try again later." />
    </motion.div>
  );

  const { kpis } = data;

  const handleExport = async () => {
    try {
      const res = await ownerApi.getPayments({ limit: 10000 });
      if (res.data.data) {
        const Papa = (await import('papaparse')).default;
        const csv = Papa.unparse(res.data.data.map((p: any) => ({
          Invoice: p.invoice_number,
          Tenant: p.tenant_name,
          Property: p.property_name,
          Amount: p.amount,
          Type: p.payment_type,
          Status: p.status,
          Date: p.paid_at ? new Date(p.paid_at).toLocaleDateString() : '',
        })));
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = 'revenue-report.csv'; a.click();
        toast.success('Report exported');
      }
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6 animate-fade-in">
      <motion.div variants={fadeUpChild} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Owner Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Overview of your rental business</p>
        </div>
        <button onClick={handleExport}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-royal-600 to-royal-800 text-white text-sm font-medium hover:shadow-lg hover:shadow-royal-500/25 transition-all duration-300">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </motion.div>

      {/* KPI Cards */}
      <motion.div variants={fadeUpChild} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpiConfig.map((kpi, i) => {
          const value = (kpis as any)[kpi.key];
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.5, ease: 'easeOut' as const }}
              className={`kpi-card relative overflow-hidden border-royal-500/20 ${kpi.danger && value > 0 ? 'ring-1 ring-red-200 dark:ring-red-900' : ''}`}>
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-royal-500/40 to-gold-500/40" />
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">{kpi.label}</p>
                <Icon className={`w-4 h-4 ${kpi.danger && value > 0 ? 'text-red-400' : 'text-gold-400'}`} />
              </div>
              <p className="text-xl font-bold gradient-text">
                {kpi.prefix || ''}{value != null ? (kpi.format ? value.toLocaleString() : value) : 0}{kpi.suffix || ''}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Charts */}
      <motion.div variants={fadeUpChild} className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/30 dark:border-white/5 shadow-xl rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white font-display">Revenue Over Time</h3>
            <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}
              className="text-xs border border-gray-200 dark:border-gray-700 rounded-2xl px-3 py-1.5 bg-transparent text-gray-700 dark:text-gray-300">
              <option value="12months" className="text-gray-900 dark:text-gray-100">Last 12 Months</option>
              <option value="6months" className="text-gray-900 dark:text-gray-100">Last 6 Months</option>
              <option value="3months" className="text-gray-900 dark:text-gray-100">Last 3 Months</option>
            </select>
          </div>
          <div className="h-64">
            {data.revenueChart && data.revenueChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={(v) => {
                    const d = new Date(v); return d.toLocaleString('default', { month: 'short' });
                  }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.3)', background: theme === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)', backdropFilter: 'blur(16px)', color: theme === 'dark' ? '#e2e8f0' : '#1e293b' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-20">No revenue data available</p>}
          </div>
        </div>

        <div className="bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/30 dark:border-white/5 shadow-xl rounded-2xl p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white font-display mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add Property', path: '/owner/properties', icon: Building2 },
              { label: 'Add Tenant', path: '/owner/tenants', icon: Users },
              { label: 'View Leads', path: '/owner/leads', icon: ClipboardList },
              { label: 'Transactions', path: '/owner/payments', icon: BarChart3 },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button key={action.label} onClick={() => navigate(action.path)}
                  className="p-4 rounded-2xl border border-white/30 dark:border-white/5 bg-white/40 dark:bg-black/20 backdrop-blur-xl hover:border-royal-500/40 dark:hover:border-royal-500/30 hover:bg-royal-500/5 dark:hover:bg-royal-500/10 transition-all duration-300 text-left">
                  <Icon className="w-5 h-5 text-gold-400 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</p>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
