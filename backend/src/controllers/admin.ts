import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../types';

export const getAdminDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const [totalOwners, totalTenants, totalProperties, totalRooms, totalPayments, totalRevenue, pendingVerifications, overdueAccounts, leads] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM users WHERE role = 'owner'`),
      pool.query(`SELECT COUNT(*) FROM users WHERE role = 'tenant'`),
      pool.query(`SELECT COUNT(*) FROM properties`),
      pool.query(`SELECT COUNT(*) FROM rooms`),
      pool.query(`SELECT COUNT(*) FROM payments`),
      pool.query(`SELECT COALESCE(SUM(amount), 0) as revenue FROM payments WHERE status = 'completed'`),
      pool.query(`SELECT COUNT(*) FROM users WHERE is_active = false`),
      pool.query(`SELECT COUNT(*) FROM payments WHERE status = 'pending' AND due_date < NOW()`),
      pool.query(`SELECT COUNT(*) FROM enquiries`),
    ]);

    const vacantRooms = await pool.query(`SELECT COUNT(*) FROM rooms WHERE status = 'vacant'`);

    const recentPayments = await pool.query(
      `SELECT p.*, u.full_name as tenant_name, prop.name as property_name 
       FROM payments p JOIN tenants t ON p.tenant_id = t.id JOIN users u ON t.user_id = u.id 
       JOIN properties prop ON p.property_id = prop.id ORDER BY p.created_at DESC LIMIT 10`
    );

    const revenueOverTime = await pool.query(
      `SELECT DATE_TRUNC('month', paid_at) as month, SUM(amount) as revenue 
       FROM payments WHERE status = 'completed' AND paid_at >= NOW() - INTERVAL '12 months'
       GROUP BY month ORDER BY month`
    );

    return res.json({
      success: true,
      data: {
        kpis: {
          totalOwners: parseInt(totalOwners.rows[0].count, 10),
          totalTenants: parseInt(totalTenants.rows[0].count, 10),
          totalProperties: parseInt(totalProperties.rows[0].count, 10),
          totalRooms: parseInt(totalRooms.rows[0].count, 10),
          totalTransactions: parseInt(totalPayments.rows[0].count, 10),
          totalRevenue: parseFloat(totalRevenue.rows[0].revenue),
          pendingVerifications: parseInt(pendingVerifications.rows[0].count, 10),
          overdueAccounts: parseInt(overdueAccounts.rows[0].count, 10),
          totalLeads: parseInt(leads.rows[0].count, 10),
          vacancyCount: parseInt(vacantRooms.rows[0].count, 10),
        },
        recentPayments: recentPayments.rows,
        revenueChart: revenueOverTime.rows,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const getAdminUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, role, search, isActive, dateFrom, dateTo } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const params: any[] = [];
    let paramIndex = 1;
    let whereClause = 'WHERE 1=1';

    if (role) {
      whereClause += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }
    if (search) {
      whereClause += ` AND (full_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex} OR phone ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (isActive === 'true' || isActive === 'false') {
      whereClause += ` AND is_active = $${paramIndex}`;
      params.push(isActive === 'true');
      paramIndex++;
    }
    if (dateFrom) {
      whereClause += ` AND created_at >= $${paramIndex}`;
      params.push(dateFrom);
      paramIndex++;
    }
    if (dateTo) {
      whereClause += ` AND created_at <= $${paramIndex}`;
      params.push(dateTo);
      paramIndex++;
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM users ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      `SELECT id, email, phone, full_name, role, is_active, created_at, last_login 
       FROM users ${whereClause} ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, Number(limit), offset]
    );

    return res.json({
      success: true,
      data: result.rows,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, isActive, role } = req.body;

    // Prevent admins from being modified by another admin
    const target = await pool.query(`SELECT role FROM users WHERE id = $1`, [id]);
    if (target.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    // Block role changes entirely — users cannot change their role after signup
    if (role && role !== target.rows[0].role) {
      return res.status(400).json({ success: false, error: 'Role cannot be changed after signup.' });
    }

    await pool.query(
      `UPDATE users SET full_name = COALESCE($1, full_name), email = COALESCE($2, email), phone = COALESCE($3, phone), is_active = COALESCE($4, is_active), updated_at = NOW() WHERE id = $5`,
      [fullName, email, phone, isActive, id]
    );

    return res.json({ success: true, message: 'User updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const bulkUpdateUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { ids, updates } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, error: 'No user IDs provided.' });
    }
    if (updates.isActive !== undefined) {
      await pool.query(
        `UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = ANY($2::uuid[])`,
        [updates.isActive, ids]
      );
    }
    return res.json({ success: true, message: `${ids.length} user(s) updated.` });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Prevent deleting the last admin
    const target = await pool.query(`SELECT role FROM users WHERE id = $1`, [id]);
    if (target.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    if (target.rows[0].role === 'admin') {
      const adminCount = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'admin'`);
      if (parseInt(adminCount.rows[0].count, 10) <= 1) {
        return res.status(400).json({ success: false, error: 'Cannot delete the last admin account.' });
      }
    }

    await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
    return res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const getAdminProperties = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 12, search, city, state, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const params: any[] = [];
    let paramIndex = 1;
    let whereClause = 'WHERE 1=1';

    if (search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.location ILIKE $${paramIndex} OR p.city ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (city) {
      whereClause += ` AND p.city ILIKE $${paramIndex}`;
      params.push(`%${city}%`);
      paramIndex++;
    }
    if (state) {
      whereClause += ` AND p.state ILIKE $${paramIndex}`;
      params.push(`%${state}%`);
      paramIndex++;
    }
    if (status === 'active' || status === 'inactive') {
      whereClause += ` AND p.is_active = $${paramIndex}`;
      params.push(status === 'active');
      paramIndex++;
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM properties p ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      `SELECT p.*, 
        u.full_name as owner_name, u.phone as owner_phone,
        (SELECT COUNT(*) FROM rooms r WHERE r.property_id = p.id) as total_rooms,
        (SELECT COUNT(*) FROM rooms r WHERE r.property_id = p.id AND r.status = 'vacant') as vacant_rooms
       FROM properties p
       JOIN users u ON p.owner_id = u.id
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
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const getAdminAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userGrowth = await pool.query(
      `SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as count
       FROM users GROUP BY month ORDER BY month ASC LIMIT 12`
    );

    const revenueByMonth = await pool.query(
      `SELECT DATE_TRUNC('month', paid_at) as month, SUM(amount) as revenue
       FROM payments WHERE status = 'completed' AND paid_at >= NOW() - INTERVAL '12 months'
       GROUP BY month ORDER BY month`
    );

    const propertyGrowth = await pool.query(
      `SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as count
       FROM properties GROUP BY month ORDER BY month ASC LIMIT 12`
    );

    const conversion = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM enquiries) as total_enquiries,
        (SELECT COUNT(*) FROM enquiries WHERE status = 'converted') as converted_enquiries,
        (SELECT COUNT(*) FROM tenants) as total_tenants`
    );

    const revenueBreakdown = await pool.query(
      `SELECT payment_type, COUNT(*) as count, SUM(amount) as total
       FROM payments WHERE status = 'completed' GROUP BY payment_type`
    );

    const userDistribution = await pool.query(
      `SELECT role, COUNT(*) as count FROM users GROUP BY role`
    );

    return res.json({ success: true, data: {
      userGrowth: userGrowth.rows,
      revenueByMonth: revenueByMonth.rows,
      propertyGrowth: propertyGrowth.rows,
      conversion: conversion.rows[0],
      revenueBreakdown: revenueBreakdown.rows,
      userDistribution: userDistribution.rows,
    }});
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const exportCsv = async (req: AuthRequest, res: Response) => {
  try {
    const { type } = req.query;

    let query = '';
    let filename = 'export';

    if (type === 'payments') {
      query = `SELECT p.id, p.amount, p.payment_type, p.status, p.invoice_number, p.due_date, p.paid_at, u.full_name as tenant_name, prop.name as property_name 
               FROM payments p JOIN tenants t ON p.tenant_id = t.id JOIN users u ON t.user_id = u.id 
               JOIN properties prop ON p.property_id = prop.id ORDER BY p.created_at DESC`;
      filename = 'payments-export';
    } else if (type === 'tenants') {
      query = `SELECT t.id, u.full_name, u.email, u.phone, p.name as property_name, r.room_number, r.room_type, t.rent_amount, t.lease_start, t.is_active 
               FROM tenants t JOIN users u ON t.user_id = u.id JOIN properties p ON t.property_id = p.id 
               JOIN rooms r ON t.room_id = r.id ORDER BY t.created_at DESC`;
      filename = 'tenants-export';
    } else if (type === 'properties') {
      query = `SELECT p.id, p.name, p.location, p.city, p.state, p.is_active, u.full_name as owner_name 
               FROM properties p JOIN users u ON p.owner_id = u.id ORDER BY p.created_at DESC`;
      filename = 'properties-export';
    } else {
      return res.status(400).json({ success: false, error: 'Invalid export type.' });
    }

    const result = await pool.query(query);
    const { createObjectCsvStringifier } = require('csv-writer');

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No data to export.' });
    }

    const header = Object.keys(result.rows[0]).map(key => ({ id: key, title: key.replace(/_/g, ' ').toUpperCase() }));
    const csvStringifier = createObjectCsvStringifier({ header });
    const csvContent = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(result.rows);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
    return res.send(csvContent);
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Export failed.' });
  }
};
