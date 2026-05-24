import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Building2, CreditCard, Home, TrendingUp, DollarSign,
  AlertTriangle, ClipboardList, Download, UserPlus, ShieldAlert
} from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/endpoints';
import { AdminDashboardData, Payment } from '../../types';
import { Card, StatusBadge, EmptyState } from '../../components/ui/Table';
import { useThemeStore } from '../../store/themeStore';
import { KPISkeleton } from '../../components/ui/Skeleton';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const kpiConfig = [
  { key: 'totalOwners', label: 'Owners', icon: Users },
  { key: 'totalTenants', label: 'Tenants', icon: UserPlus },
  { key: 'totalProperties', label: 'Properties', icon: Building2 },
  { key: 'totalRooms', label: 'Total Rooms', icon: Home },
  { key: 'totalTransactions', label: 'Transactions', icon: CreditCard },
  { key: 'totalRevenue', label: 'Revenue', icon: DollarSign, prefix: '₹', format: true },
  { key: 'totalLeads', label: 'Total Leads', icon: ClipboardList },
  { key: 'overdueAccounts', label: 'Overdue', icon: AlertTriangle, danger: true },
  { key: 'pendingVerifications', label: 'Pending Verif.', icon: AlertTriangle, danger: true },
  { key: 'vacancyCount', label: 'Vacancies', icon: Home },
];

export default function AdminDashboard() {
  const { theme } = useThemeStore();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getDashboard().then((res) => {
      if (res.data.success && res.data.data) setData(res.data.data!);
    }).catch(() => toast.error('Failed to load admin dashboard')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6"><KPISkeleton /></div>;
  if (!data) return (
    <EmptyState icon={<ShieldAlert className="w-8 h-8" />} title="Failed to load dashboard"
      description="Could not fetch dashboard data. Please try again later." />
  );

  const { kpis } = data;
  const recentPayments: Payment[] = data.recentPayments || [];

  const handleExport = async () => {
    try {
      const res = await adminApi.exportCsv('payments');
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'platform-payments.csv'; a.click();
      toast.success('Payments exported');
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Global platform overview</p>
        </div>
        <button onClick={handleExport} className="btn-secondary text-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Data
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {kpiConfig.map((kpi, i) => {
          const value = (kpis as any)[kpi.key];
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className={`kpi-card ${kpi.danger && value > 0 ? 'ring-1 ring-red-200 dark:ring-red-900' : ''}`}>
              <div className="flex items-start justify-between mb-2">
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{kpi.label}</p>
                <Icon className={`w-3.5 h-3.5 ${kpi.danger && value > 0 ? 'text-red-400' : 'text-primary-400'}`} />
              </div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {kpi.prefix || ''}{kpi.format ? value?.toLocaleString() : value}
              </p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Platform Revenue</h3>
          <div className="h-64">
            {data.revenueChart && data.revenueChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} tickFormatter={(v) => new Date(v).toLocaleString('default', { month: 'short' })} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ borderRadius: '12px', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#e2e8f0' : '#1e293b', border: '1px solid ' + (theme === 'dark' ? '#334155' : '#e5e7eb') }} />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 text-center py-20">No revenue data available</p>}
          </div>
        </Card>

        {/* Recent Payments */}
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Payments</h3>
          <div className="space-y-2">
            {recentPayments.length === 0 ? (
              <p className="text-sm text-gray-400 py-8 text-center">No recent payments</p>
            ) : recentPayments.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{p.tenant_name}</p>
                  <p className="text-xs text-gray-500">{p.property_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">₹{p.amount.toLocaleString()}</p>
                  <StatusBadge status={p.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
