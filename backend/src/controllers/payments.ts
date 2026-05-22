import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { config } from '../config';
import { AuthRequest } from '../types';
import { generateInvoiceNumber } from '../utils';

const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: config.razorpay.keyId,
  key_secret: config.razorpay.keySecret,
});

export const createPaymentOrder = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId, propertyId, amount, paymentType } = req.body;

    const receipt = generateInvoiceNumber();
    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt,
      notes: { tenantId, propertyId, paymentType },
    });

    const paymentId = uuidv4();
    await pool.query(
      `INSERT INTO payments (id, tenant_id, property_id, owner_id, amount, payment_type, status, razorpay_order_id, invoice_number, due_date) 
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8, $9)`,
      [paymentId, tenantId, propertyId, req.user!.id, amount, paymentType, razorpayOrder.id, receipt, new Date()]
    );

    return res.json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        receipt,
        key: config.razorpay.keyId,
      },
    });
  } catch (err) {
    console.error('Create payment order error:', err);
    return res.status(500).json({ success: false, error: 'Payment initiation failed.' });
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', config.razorpay.keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      return res.status(400).json({ success: false, error: 'Payment verification failed.' });
    }

    const result = await pool.query(
      `UPDATE payments SET status = 'completed', razorpay_payment_id = $1, paid_at = NOW(), updated_at = NOW() 
       WHERE razorpay_order_id = $2 RETURNING *`,
      [razorpayPaymentId, razorpayOrderId]
    );

    if (result.rows.length > 0) {
      const payment = result.rows[0];
      const { sendEmail, sendSMS, createNotification } = require('../utils');

      const tenantResult = await pool.query(
        `SELECT u.full_name, u.email, u.phone FROM tenants t JOIN users u ON t.user_id = u.id WHERE t.id = $1`,
        [payment.tenant_id]
      );

      if (tenantResult.rows.length > 0) {
        const tenant = tenantResult.rows[0];
        if (tenant.email) {
          await sendEmail(
            tenant.email,
            'Payment Successful - Domicilo',
            `<p>Dear ${tenant.full_name},</p><p>Your payment of Rs.${payment.amount} has been received successfully.</p><p>Invoice: ${payment.invoice_number}</p>`
          );
        }
        await sendSMS(tenant.phone, `Payment of Rs.${payment.amount} for ${payment.payment_type} at Domicilo is successful. Invoice: ${payment.invoice_number}`);
      }
    }

    return res.json({ success: true, message: 'Payment verified successfully.' });
  } catch (err) {
    console.error('Verify payment error:', err);
    return res.status(500).json({ success: false, error: 'Payment verification failed.' });
  }
};

export const getPayments = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, status, paymentType, propertyId, startDate, endDate } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const params: any[] = [];
    let paramIndex = 1;
    let whereClause = '';

    if (req.user!.role === 'owner') {
      whereClause = `WHERE p.owner_id = $${paramIndex}`;
      params.push(req.user!.id);
      paramIndex++;
    } else if (req.user!.role === 'tenant') {
      const tenantResult = await pool.query(`SELECT id FROM tenants WHERE user_id = $1`, [req.user!.id]);
      if (tenantResult.rows.length === 0) {
        return res.json({ success: true, data: [], pagination: { page: 1, limit: 10, total: 0, totalPages: 0 } });
      }
      whereClause = `WHERE p.tenant_id = $${paramIndex}`;
      params.push(tenantResult.rows[0].id);
      paramIndex++;
    }

    if (status) {
      whereClause += ` AND p.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (paymentType) {
      whereClause += ` AND p.payment_type = $${paramIndex}`;
      params.push(paymentType);
      paramIndex++;
    }
    if (propertyId) {
      whereClause += ` AND p.property_id = $${paramIndex}`;
      params.push(propertyId);
      paramIndex++;
    }
    if (startDate) {
      whereClause += ` AND p.created_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      whereClause += ` AND p.created_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM payments p ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      `SELECT p.*, 
        u.full_name as tenant_name, u.phone as tenant_phone,
        prop.name as property_name
       FROM payments p
       JOIN tenants t ON p.tenant_id = t.id
       JOIN users u ON t.user_id = u.id
       JOIN properties prop ON p.property_id = prop.id
       ${whereClause}
       ORDER BY p.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, Number(limit), offset]
    );

    return res.json({
      success: true,
      data: result.rows,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    console.error('Get payments error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const getOwnerDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.user!.id;

    const [properties, tenants, payments, enquiries, vacancies] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM properties WHERE owner_id = $1`, [ownerId]),
      pool.query(`SELECT COUNT(*) FROM tenants WHERE owner_id = $1 AND is_active = true`, [ownerId]),
      pool.query(
        `SELECT COALESCE(SUM(amount), 0) as total_revenue FROM payments WHERE owner_id = $1 AND status = 'completed'`,
        [ownerId]
      ),
      pool.query(`SELECT COUNT(*) FROM enquiries WHERE owner_id = $1 AND status = 'new'`, [ownerId]),
      pool.query(
        `SELECT COUNT(*) FROM rooms r JOIN properties p ON r.property_id = p.id WHERE p.owner_id = $1 AND r.status = 'vacant'`,
        [ownerId]
      ),
    ]);

    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthlyRevenue = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as monthly_revenue FROM payments WHERE owner_id = $1 AND status = 'completed' AND paid_at >= $2`,
      [ownerId, monthStart]
    );

    const pendingDues = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as pending FROM payments WHERE owner_id = $1 AND status = 'pending'`,
      [ownerId]
    );

    const overdue = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as overdue FROM payments WHERE owner_id = $1 AND status = 'pending' AND due_date < NOW()`,
      [ownerId]
    );

    const totalRooms = await pool.query(
      `SELECT COUNT(*) FROM rooms r JOIN properties p ON r.property_id = p.id WHERE p.owner_id = $1`,
      [ownerId]
    );
    const occupancyRate = parseInt(totalRooms.rows[0].count, 10) > 0
      ? Math.round((1 - parseInt(vacancies.rows[0].count, 10) / parseInt(totalRooms.rows[0].count, 10)) * 100)
      : 0;

    const revenueOverTime = await pool.query(
      `SELECT DATE_TRUNC('month', paid_at) as month, SUM(amount) as revenue 
       FROM payments WHERE owner_id = $1 AND status = 'completed' AND paid_at >= NOW() - INTERVAL '12 months'
       GROUP BY month ORDER BY month`,
      [ownerId]
    );

    return res.json({
      success: true,
      data: {
        kpis: {
          totalRevenue: parseFloat(payments.rows[0].total_revenue),
          monthlyRevenue: parseFloat(monthlyRevenue.rows[0].monthly_revenue),
          occupancyRate,
          pendingDues: parseFloat(pendingDues.rows[0].pending),
          overduePayments: parseFloat(overdue.rows[0].overdue),
          totalTenants: parseInt(tenants.rows[0].count, 10),
          totalProperties: parseInt(properties.rows[0].count, 10),
          activeLeads: parseInt(enquiries.rows[0].count, 10),
          vacancyCount: parseInt(vacancies.rows[0].count, 10),
        },
        revenueChart: revenueOverTime.rows,
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const getOwnerChartData = async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId, startDate, endDate } = req.query;
    const ownerId = req.user!.id;

    let whereClause = 'WHERE p.owner_id = $1 AND p.status = $2';
    const params: any[] = [ownerId, 'completed'];
    let paramIndex = 3;

    if (propertyId) {
      whereClause += ` AND p.property_id = $${paramIndex}`;
      params.push(propertyId);
      paramIndex++;
    }
    if (startDate) {
      whereClause += ` AND p.paid_at >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }
    if (endDate) {
      whereClause += ` AND p.paid_at <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    const result = await pool.query(
      `SELECT DATE_TRUNC('day', paid_at) as date, 
        SUM(amount) as total, 
        SUM(CASE WHEN payment_type = 'rent' THEN amount ELSE 0 END) as rent,
        SUM(CASE WHEN payment_type = 'electricity' THEN amount ELSE 0 END) as electricity,
        SUM(CASE WHEN payment_type = 'water' THEN amount ELSE 0 END) as water,
        SUM(CASE WHEN payment_type = 'maintenance' THEN amount ELSE 0 END) as maintenance
       FROM payments ${whereClause}
       GROUP BY date ORDER BY date`,
      params
    );

    return res.json({ success: true, data: result.rows });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const getTenantDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const tenantResult = await pool.query(
      `SELECT t.*, u.full_name, u.email, u.phone,
        p.name as property_name, p.location, p.city, p.images,
        r.room_number, r.room_type, r.rent as room_rent, r.status as room_status
       FROM tenants t
       JOIN users u ON t.user_id = u.id
       JOIN properties p ON t.property_id = p.id
       JOIN rooms r ON t.room_id = r.id
       WHERE t.user_id = $1`,
      [req.user!.id]
    );

    if (tenantResult.rows.length === 0) {
      return res.json({ success: true, data: null, message: 'No tenant profile found.' });
    }

    const tenant = tenantResult.rows[0];

    const payments = await pool.query(
      `SELECT * FROM payments WHERE tenant_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [tenant.id]
    );

    const upcomingDue = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total_due FROM payments WHERE tenant_id = $1 AND status = 'pending'`,
      [tenant.id]
    );

    const overdueAmount = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as overdue FROM payments WHERE tenant_id = $1 AND status = 'pending' AND due_date < NOW()`,
      [tenant.id]
    );

    const fines = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total_fines, COALESCE(SUM(CASE WHEN is_paid THEN 0 ELSE amount END), 0) as unpaid_fines FROM fines WHERE tenant_id = $1`,
      [tenant.id]
    );

    const notifications = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10`,
      [req.user!.id]
    );

    return res.json({
      success: true,
      data: {
        tenant: {
          id: tenant.id,
          fullName: tenant.full_name,
          email: tenant.email,
          phone: tenant.phone,
          leaseStart: tenant.lease_start,
          leaseEnd: tenant.lease_end,
          rentAmount: tenant.rent_amount,
          isActive: tenant.is_active,
        },
        property: {
          name: tenant.property_name,
          location: tenant.location,
          city: tenant.city,
          images: tenant.images,
        },
        room: {
          number: tenant.room_number,
          type: tenant.room_type,
          rent: tenant.room_rent,
          status: tenant.room_status,
        },
        finances: {
          totalDue: parseFloat(upcomingDue.rows[0].total_due),
          overdueAmount: parseFloat(overdueAmount.rows[0].overdue),
          totalFines: parseFloat(fines.rows[0].total_fines),
          unpaidFines: parseFloat(fines.rows[0].unpaid_fines),
        },
        payments: payments.rows,
        notifications: notifications.rows,
      },
    });
  } catch (err) {
    console.error('Tenant dashboard error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};
