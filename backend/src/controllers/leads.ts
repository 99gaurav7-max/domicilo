import { Response } from 'express';
import { pool } from '../config/database';
import { AuthRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { generateTempPassword, sendTenantOnboarding } from '../utils';

export const getOwnerLeads = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const ownerId = req.user!.id;
    const params: any[] = [ownerId];
    let paramIndex = 2;
    let whereClause = 'WHERE e.owner_id = $1';

    if (status) {
      whereClause += ` AND e.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    if (search) {
      whereClause += ` AND (e.name ILIKE $${paramIndex} OR e.phone ILIKE $${paramIndex} OR e.email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM enquiries e ${whereClause}`, params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const result = await pool.query(
      `SELECT e.*, p.name as property_name, p.location 
       FROM enquiries e JOIN properties p ON e.property_id = p.id 
       ${whereClause} ORDER BY e.created_at DESC 
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

export const updateLeadStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const lead = await pool.query(
      `SELECT e.*, p.name as property_name FROM enquiries e JOIN properties p ON e.property_id = p.id WHERE e.id = $1`,
      [id]
    );
    if (lead.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Enquiry not found.' });
    }

    await pool.query(
      `UPDATE enquiries SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, id]
    );

    if (status === 'converted') {
      const enquiry = lead.rows[0];

      // Find a vacant room of the requested type
      const roomResult = await pool.query(
        `SELECT id FROM rooms WHERE property_id = $1 AND room_type = $2 AND status = 'vacant' LIMIT 1`,
        [enquiry.property_id, enquiry.room_type]
      );

      if (roomResult.rows.length === 0) {
        return res.status(400).json({ success: false, error: 'No vacant rooms of this type available.' });
      }

      const roomId = roomResult.rows[0].id;
      const tempPassword = generateTempPassword();
      const passwordHash = await bcrypt.hash(tempPassword, 10);

      let userId: string;
      const existingUser = await pool.query(`SELECT id FROM users WHERE phone = $1`, [enquiry.phone]);
      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id;
      } else {
        userId = uuidv4();
        await pool.query(
          `INSERT INTO users (id, email, phone, full_name, password_hash, role) VALUES ($1, $2, $3, $4, $5, 'tenant')`,
          [userId, enquiry.email || null, enquiry.phone, enquiry.name, passwordHash]
        );
      }

      const tenantId = uuidv4();
      await pool.query(
        `INSERT INTO tenants (id, user_id, owner_id, room_id, property_id, lease_start, rent_amount) 
         VALUES ($1, $2, $3, $4, $5, $6, (SELECT rent FROM rooms WHERE id = $4))`,
        [tenantId, userId, req.user!.id, roomId, enquiry.property_id, enquiry.preferred_move_in || new Date()]
      );

      await pool.query(`UPDATE rooms SET status = 'occupied' WHERE id = $1`, [roomId]);
      await pool.query(`UPDATE enquiries SET converted_tenant_id = $1 WHERE id = $2`, [tenantId, id]);

      await sendTenantOnboarding(enquiry.email || '', enquiry.phone, enquiry.name, tempPassword, enquiry.property_name, userId);
    }

    return res.json({ success: true, message: 'Lead status updated.' });
  } catch (err) {
    console.error('Update lead error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user!.id]
    );
    const unreadCount = await pool.query(
      `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
      [req.user!.id]
    );

    return res.json({
      success: true,
      data: result.rows,
      unreadCount: parseInt(unreadCount.rows[0].count, 10),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
      [id, req.user!.id]
    );
    return res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const markAllNotificationsRead = async (req: AuthRequest, res: Response) => {
  try {
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
      [req.user!.id]
    );
    return res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};
