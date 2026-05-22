import { Router } from 'express';
import { createProperty, updateProperty, deleteProperty } from '../controllers/properties';
import { getOwnerProperties, getOwnerTenants, createTenant, updateRoom, bulkUpdateRooms, applyFine } from '../controllers/owner';
import { getOwnerDashboard, getOwnerChartData, createPaymentOrder, verifyPayment, getPayments, getTenantDashboard } from '../controllers/payments';
import { getOwnerLeads, updateLeadStatus, getNotifications, markNotificationRead, markAllNotificationsRead } from '../controllers/leads';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All owner routes require authentication and owner role
router.use(authenticate, authorize('owner'));

// Dashboard
router.get('/dashboard', getOwnerDashboard);
router.get('/chart-data', getOwnerChartData);

// Properties
router.get('/properties', getOwnerProperties);
router.post('/properties', createProperty);
router.put('/properties/:id', updateProperty);
router.delete('/properties/:id', deleteProperty);

// Rooms
router.put('/rooms/:id', updateRoom);
router.post('/rooms/bulk-update', bulkUpdateRooms);

// Tenants
router.get('/tenants', getOwnerTenants);
router.post('/tenants', createTenant);
router.post('/fines', applyFine);

// Payments
router.post('/payments/create-order', createPaymentOrder);
router.post('/payments/verify', verifyPayment);
router.get('/payments', getPayments);

// Leads
router.get('/leads', getOwnerLeads);
router.put('/leads/:id/status', updateLeadStatus);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);

export default router;
