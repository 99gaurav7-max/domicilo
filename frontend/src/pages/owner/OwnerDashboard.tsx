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

  if (loading) return <div className="space-y-6"><KPISkeleton /></div>;
  if (!data) return (
    <EmptyState icon={<ShieldAlert className="w-8 h-8" />} title="Failed to load dashboard"
      description="Could not fetch dashboard data. Please try again later." />
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Owner Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Overview of your rental business</p>
        </div>
        <button onClick={handleExport} className="btn-secondary text-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpiConfig.map((kpi, i) => {
          const value = (kpis as any)[kpi.key];
          const Icon = kpi.icon;
          return (
            <motion.div key={kpi.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`kpi-card ${kpi.danger && value > 0 ? 'ring-1 ring-red-200 dark:ring-red-900' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{kpi.label}</p>
                <Icon className={`w-4 h-4 ${kpi.danger && value > 0 ? 'text-red-400' : 'text-primary-400'}`} />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {kpi.prefix || ''}{value != null ? (kpi.format ? value.toLocaleString() : value) : 0}{kpi.suffix || ''}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Revenue Over Time</h3>
            <select value={timeframe} onChange={(e) => setTimeframe(e.target.value)}
              className="text-xs border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 bg-transparent text-gray-700 dark:text-gray-300">
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
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#e2e8f0' : '#1e293b' }} />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 text-center py-20">No revenue data available</p>}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
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
                  className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all text-left">
                  <Icon className="w-5 h-5 text-primary-500 mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</p>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
