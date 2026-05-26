import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { tenantApi, adminApi, ownerApi } from '../services/endpoints';
import { useAuthStore } from '../store/authStore';
import { Notification } from '../types';
import { EmptyState } from '../components/ui/Table';
import { Skeleton } from '../components/ui/Skeleton';

export default function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const notificationApi = user?.role === 'admin' ? adminApi : user?.role === 'owner' ? ownerApi : user?.role === 'tenant' ? tenantApi : null;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      if (!notificationApi) { setLoading(false); return; }
      const res = await notificationApi.getNotifications();
      if (res.data.success) {
        setNotifications(res.data.data || []);
      }
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkAllRead = async () => {
    try {
      if (!notificationApi) return;
      await notificationApi.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      if (!notificationApi) return;
      await notificationApi.markNotificationRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch {}
  };

  const channels: Record<string, string> = {
    onboarding: 'badge-info',
    payment_success: 'badge-success',
    payment_failure: 'badge-danger',
    due_reminder: 'badge-warning',
    overdue_alert: 'badge-danger',
    enquiry_submission: 'badge-info',
    lead_update: 'badge-info',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-display text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Stay updated with your latest alerts</p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button onClick={handleMarkAllRead} className="rounded-2xl border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 px-4 py-2 text-sm flex items-center gap-2">
            <CheckCheck className="w-4 h-4" /> Mark All Read
          </button>
        )}
      </div>

      <div className="rounded-2xl bg-white/60 dark:bg-black/30 backdrop-blur-2xl border border-white/30 dark:border-white/5 shadow-xl p-6">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-lg" />)}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState icon={<Bell className="w-8 h-8" />} title="No notifications" description="You're all caught up!" />
        ) : (
          <div className="space-y-2">
            {notifications.map((n) => (
              <div key={n.id}
                className={`p-4 rounded-2xl cursor-pointer transition-colors ${n.is_read ? 'bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900/30' : 'bg-royal-50 dark:bg-royal-900/20'}`}
                onClick={() => !n.is_read && handleMarkRead(n.id)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-sm font-medium ${n.is_read ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                        {n.title}
                      </p>
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-royal-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{n.message}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${channels[n.channel] || 'badge-info'}`}>
                      {n.channel.replace(/_/g, ' ')}
                    </span>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
