import { Router } from 'express';
import { getAdminDashboard, getAdminUsers, updateUser, deleteUser, exportCsv } from '../controllers/admin';
import { getPayments } from '../controllers/payments';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../controllers/leads';
import { getProperties } from '../controllers/properties';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/properties', getProperties);
router.get('/users', getAdminUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/payments', getPayments);
router.get('/notifications', getNotifications);
router.put('/notifications/read-all', markAllNotificationsRead);
router.put('/notifications/:id/read', markNotificationRead);
router.get('/export', exportCsv);

export default router;
