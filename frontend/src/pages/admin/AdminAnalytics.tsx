import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Building2, Home, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminApi } from '../../services/endpoints';
import { Card, EmptyState } from '../../components/ui/Table';
import { useThemeStore } from '../../store/themeStore';
import { KPISkeleton } from '../../components/ui/Skeleton';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminAnalytics() {
  const { theme } = useThemeStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAnalytics().then((res) => {
      if (res.data.success && res.data.data) setData(res.data.data);
    }).catch(() => toast.error('Failed to load analytics')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="space-y-6"><KPISkeleton /></div>;
  if (!data) return (
    <EmptyState icon={<TrendingUp className="w-8 h-8" />} title="Failed to load analytics"
      description="Could not fetch analytics data. Please try again later." />
  );

  const tooltipStyle = {
    borderRadius: '12px',
    background: theme === 'dark' ? '#1e293b' : '#fff',
    color: theme === 'dark' ? '#e2e8f0' : '#1e293b',
    border: '1px solid ' + (theme === 'dark' ? '#334155' : '#e5e7eb'),
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-display">Platform Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">User growth, revenue trends, and conversion metrics</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 font-display">
            <Users className="w-4 h-4 text-royal-500" /> User Registrations
          </h3>
          <div className="h-72">
            {data.userGrowth?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }}
                    tickFormatter={(v) => new Date(v).toLocaleString('default', { month: 'short', year: '2-digit' })} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} name="New Users" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-20">No user growth data</p>}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 font-display">
            <DollarSign className="w-4 h-4 text-royal-500" /> Platform Revenue
          </h3>
          <div className="h-72">
            {data.revenueByMonth?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }}
                    tickFormatter={(v) => new Date(v).toLocaleString('default', { month: 'short', year: '2-digit' })} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-20">No revenue data</p>}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 font-display">
            <Building2 className="w-4 h-4 text-royal-500" /> Property Growth
          </h3>
          <div className="h-72">
            {data.propertyGrowth?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.propertyGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }}
                    tickFormatter={(v) => new Date(v).toLocaleString('default', { month: 'short', year: '2-digit' })} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="New Properties" />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-20">No property growth data</p>}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 font-display">
            <DollarSign className="w-4 h-4 text-royal-500" /> Revenue by Type
          </h3>
          <div className="h-72">
            {data.revenueBreakdown?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.revenueBreakdown} dataKey="total" nameKey="payment_type"
                    cx="50%" cy="50%" outerRadius={80} label={({ payment_type }: any) => payment_type}>
                    {data.revenueBreakdown.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-20">No revenue breakdown</p>}
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {data.revenueBreakdown?.map((item: any, i: number) => (
              <span key={item.payment_type} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {item.payment_type}: ₹{Number(item.total).toLocaleString()}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 font-display">
            <TrendingUp className="w-4 h-4 text-royal-500" /> Conversion Metrics
          </h3>
          {data.conversion ? (
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 rounded-xl bg-royal-50 dark:bg-royal-900/20">
                <p className="text-2xl font-bold text-royal-600">{data.conversion.total_enquiries}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Enquiries</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-green-50 dark:bg-green-900/20">
                <p className="text-2xl font-bold text-green-600">{data.conversion.converted_enquiries}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Converted</p>
              </div>
              <div className="text-center p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20">
                <p className="text-2xl font-bold text-purple-600">{data.conversion.total_tenants}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Tenants</p>
              </div>
            </div>
          ) : <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">No conversion data</p>}
        </Card>

        <Card>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2 font-display">
            <Users className="w-4 h-4 text-royal-500" /> User Distribution by Role
          </h3>
          <div className="h-64">
            {data.userDistribution?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.userDistribution} dataKey="count" nameKey="role"
                    cx="50%" cy="50%" outerRadius={80} label={({ role }: any) => role}>
                    {data.userDistribution.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-20">No user data</p>}
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {data.userDistribution?.map((item: any, i: number) => (
              <span key={item.role} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {item.role}: {item.count}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
