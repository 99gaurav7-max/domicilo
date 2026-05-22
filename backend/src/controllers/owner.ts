import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database';
import { AuthRequest } from '../types';
import { generateTempPassword, sendTenantOnboarding } from '../utils';

export const getOwnerProperties = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const ownerId = req.user!.id;
    const params: any[] = [ownerId];
    let paramIndex = 2;
    let whereClause = 'WHERE p.owner_id = $1';

    if (search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.location ILIKE $${paramIndex} OR p.city ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (status) {
      whereClause += ` AND p.is_active = $${paramIndex}`;
      params.push(status === 'active');
      paramIndex++;
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM properties p ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      `SELECT p.*,
        (SELECT json_agg(json_build_object('id', r.id, 'room_number', r.room_number, 'room_type', r.room_type, 'rent', r.rent, 'status', r.status))
         FROM rooms r WHERE r.property_id = p.id) as rooms,
        (SELECT COUNT(*) FROM rooms r WHERE r.property_id = p.id AND r.status = 'vacant') as vacant_rooms,
        (SELECT COUNT(*) FROM rooms r WHERE r.property_id = p.id AND r.status = 'occupied') as occupied_rooms,
        (SELECT COUNT(*) FROM tenants t WHERE t.property_id = p.id AND t.is_active = true) as tenant_count
       FROM properties p ${whereClause}
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

export const getOwnerTenants = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, search, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const ownerId = req.user!.id;

    let whereClause = 'WHERE t.owner_id = $1';
    const params: any[] = [ownerId];
    let paramIndex = 2;

    if (search) {
      whereClause += ` AND (u.full_name ILIKE $${paramIndex} OR u.phone ILIKE $${paramIndex} OR u.email ILIKE $${paramIndex} OR p.name ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    if (status === 'active') {
      whereClause += ' AND t.is_active = true';
    } else if (status === 'inactive') {
      whereClause += ' AND t.is_active = false';
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM tenants t JOIN users u ON t.user_id = u.id JOIN properties p ON t.property_id = p.id ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      `SELECT t.*, u.full_name, u.email, u.phone, u.last_login,
        p.name as property_name, p.location, p.city,
        r.room_number, r.room_type, r.rent as room_rent,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE tenant_id = t.id AND status = 'pending' AND due_date < NOW()) as overdue_amount,
        (SELECT COALESCE(SUM(amount), 0) FROM payments WHERE tenant_id = t.id AND status = 'pending') as due_amount
       FROM tenants t
       JOIN users u ON t.user_id = u.id
       JOIN properties p ON t.property_id = p.id
       JOIN rooms r ON t.room_id = r.id
       ${whereClause}
       ORDER BY t.created_at DESC
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, Number(limit), offset]
    );

    return res.json({
      success: true,
      data: result.rows,
      pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) },
    });
  } catch (err) {
    console.error('Get owner tenants error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const createTenant = async (req: AuthRequest, res: Response) => {
  try {
    const { fullName, phone, email, propertyId, roomId, rentAmount, securityDeposit, leaseStart } = req.body;
    const ownerId = req.user!.id;

    // Check room
    const roomResult = await pool.query(
      `SELECT r.*, p.name as property_name FROM rooms r JOIN properties p ON r.property_id = p.id WHERE r.id = $1 AND p.owner_id = $2`,
      [roomId, ownerId]
    );
    if (roomResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Room not found or access denied.' });
    }
    if (roomResult.rows[0].status !== 'vacant') {
      return res.status(400).json({ success: false, error: 'Room is not vacant.' });
    }

    // Check if user exists
    let userId: string;
    let userResult = await pool.query(`SELECT id FROM users WHERE phone = $1`, [phone]);

    const tempPassword = generateTempPassword();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    if (userResult.rows.length > 0) {
      userId = userResult.rows[0].id;
      await pool.query(`UPDATE users SET password_hash = $1, role = 'tenant', is_active = true, updated_at = NOW() WHERE id = $2`, [passwordHash, userId]);
    } else {
      userId = uuidv4();
      await pool.query(
        `INSERT INTO users (id, email, phone, full_name, password_hash, role) VALUES ($1, $2, $3, $4, $5, 'tenant')`,
        [userId, email || null, phone, fullName, passwordHash]
      );
    }

    const tenantId = uuidv4();
    await pool.query(
      `INSERT INTO tenants (id, user_id, owner_id, room_id, property_id, lease_start, rent_amount, security_deposit) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [tenantId, userId, ownerId, roomId, propertyId, leaseStart || new Date(), rentAmount, securityDeposit || 0]
    );

    await pool.query(
      `UPDATE rooms SET status = 'occupied' WHERE id = $1`,
      [roomId]
    );

    // Send onboarding
    await sendTenantOnboarding(email || '', phone, fullName, tempPassword, roomResult.rows[0].property_name, userId);

    return res.status(201).json({ success: true, data: { tenantId, tempPassword }, message: 'Tenant created successfully. Onboarding initiated.' });
  } catch (err) {
    console.error('Create tenant error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const updateRoom = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { roomNumber, roomType, rent, status, floorNumber, squareFeet, description } = req.body;

    const exists = await pool.query(
      `SELECT r.id FROM rooms r JOIN properties p ON r.property_id = p.id WHERE r.id = $1 AND p.owner_id = $2`,
      [id, req.user!.id]
    );
    if (exists.rows.length === 0 && req.user!.role !== 'admin') {
      return res.status(404).json({ success: false, error: 'Room not found.' });
    }

    await pool.query(
      `UPDATE rooms SET room_number = COALESCE($1, room_number), room_type = COALESCE($2, room_type), rent = COALESCE($3, rent), status = COALESCE($4, status), floor_number = COALESCE($5, floor_number), square_feet = COALESCE($6, square_feet), description = COALESCE($7, description), updated_at = NOW() WHERE id = $8`,
      [roomNumber, roomType, rent, status, floorNumber, squareFeet, description, id]
    );

    return res.json({ success: true, message: 'Room updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const bulkUpdateRooms = async (req: AuthRequest, res: Response) => {
  try {
    const { roomIds, updates } = req.body;
    if (!roomIds || !Array.isArray(roomIds) || roomIds.length === 0) {
      return res.status(400).json({ success: false, error: 'No rooms selected.' });
    }

    for (const id of roomIds) {
      const { rent, status, roomType } = updates;
      await pool.query(
        `UPDATE rooms SET rent = COALESCE($1, rent), status = COALESCE($2, status), room_type = COALESCE($3, room_type), updated_at = NOW() WHERE id = $4`,
        [rent, status, roomType, id]
      );
    }

    return res.json({ success: true, message: `${roomIds.length} rooms updated successfully.` });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const applyFine = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId, amount, reason } = req.body;
    const id = uuidv4();

    await pool.query(
      `INSERT INTO fines (id, tenant_id, amount, reason) VALUES ($1, $2, $3, $4)`,
      [id, tenantId, amount, reason]
    );

    return res.json({ success: true, data: { id }, message: 'Fine applied successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};
