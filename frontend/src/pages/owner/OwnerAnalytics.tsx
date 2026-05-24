import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { ownerApi } from '../../services/endpoints';
import { Card, Select } from '../../components/ui/Table';
import { KPISkeleton } from '../../components/ui/Skeleton';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useThemeStore } from '../../store/themeStore';

export default function OwnerAnalytics() {
  const { theme } = useThemeStore();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('30');

  useEffect(() => {
    setLoading(true);
    const endDate = new Date().toISOString();
    const startDate = new Date(Date.now() - Number(timeframe) * 24 * 60 * 60 * 1000).toISOString();
    ownerApi.getChartData({ startDate, endDate }).then((res) => {
      if (res.data.success) setData(res.data.data || []);
    }).catch(() => toast.error('Failed to load analytics')).finally(() => setLoading(false));
  }, [timeframe]);

  const handleExport = () => {
    try {
      const csv = [
        ['Date', 'Total', 'Rent', 'Electricity', 'Water', 'Maintenance'].join(','),
        ...data.map((d: any) => [d.date, d.total, d.rent, d.electricity, d.water, d.maintenance].join(',')),
      ].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'revenue-analytics.csv'; a.click();
      toast.success('Analytics exported');
    } catch {
      toast.error('Export failed');
    }
  };

  const totals = data.reduce((acc: any, d: any) => ({
    total: acc.total + Number(d.total || 0),
    rent: acc.rent + Number(d.rent || 0),
    electricity: acc.electricity + Number(d.electricity || 0),
    water: acc.water + Number(d.water || 0),
    maintenance: acc.maintenance + Number(d.maintenance || 0),
  }), { total: 0, rent: 0, electricity: 0, water: 0, maintenance: 0 });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Detailed revenue breakdown</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onChange={(v) => setTimeframe(v)}
            options={[
              { value: '7', label: 'Last 7 days' },
              { value: '30', label: 'Last 30 days' },
              { value: '90', label: 'Last 90 days' },
              { value: '365', label: 'Last year' },
            ]} />
          <button onClick={handleExport} className="btn-secondary text-sm flex items-center gap-2">
            <Download className="w-4 h-4" /> CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Revenue', value: totals.total, icon: DollarSign, color: 'text-blue-500' },
          { label: 'Rent', value: totals.rent, icon: TrendingUp, color: 'text-green-500' },
          { label: 'Electricity', value: totals.electricity, icon: BarChart3, color: 'text-amber-500' },
          { label: 'Water', value: totals.water, icon: BarChart3, color: 'text-cyan-500' },
          { label: 'Maintenance', value: totals.maintenance, icon: BarChart3, color: 'text-purple-500' },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="kpi-card">
            <div className="flex items-start justify-between mb-2">
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wide">{item.label}</p>
              <item.icon className={`w-3.5 h-3.5 ${item.color}`} />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">₹{item.value.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Revenue Breakdown</h3>
        <div className="h-80">
          {loading ? (
            <div className="skeleton h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => new Date(v).toLocaleDateString()} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ borderRadius: '12px', background: theme === 'dark' ? '#1e293b' : '#fff', color: theme === 'dark' ? '#e2e8f0' : '#1e293b', border: '1px solid ' + (theme === 'dark' ? '#334155' : '#e5e7eb') }} />
                <Legend />
                <Bar dataKey="rent" name="Rent" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="electricity" name="Electricity" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="water" name="Water" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="maintenance" name="Maintenance" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>
    </div>
  );
}
