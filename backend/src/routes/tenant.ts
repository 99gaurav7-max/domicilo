import { Router } from 'express';
import { getTenantDashboard } from '../controllers/payments';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../controllers/leads';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate, authorize('tenant'));

router.get('/dashboard', getTenantDashboard);
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);

export default router;
