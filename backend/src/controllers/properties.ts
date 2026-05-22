import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { AuthRequest } from '../types';
import bcrypt from 'bcryptjs';
import { generateTempPassword, sendTenantOnboarding } from '../utils';

export const getProperties = async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      city,
      roomType,
      minRent,
      maxRent,
      amenities,
      sort = 'created_at',
      order = 'desc',
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);
    let whereClause = 'WHERE p.is_active = true';
    const params: any[] = [];
    let paramIndex = 1;

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
    if (roomType) {
      whereClause += ` AND EXISTS (SELECT 1 FROM rooms r WHERE r.property_id = p.id AND r.room_type = $${paramIndex})`;
      params.push(roomType);
      paramIndex++;
    }
    if (minRent) {
      whereClause += ` AND EXISTS (SELECT 1 FROM rooms r WHERE r.property_id = p.id AND r.rent >= $${paramIndex})`;
      params.push(Number(minRent));
      paramIndex++;
    }
    if (maxRent) {
      whereClause += ` AND EXISTS (SELECT 1 FROM rooms r WHERE r.property_id = p.id AND r.rent <= $${paramIndex})`;
      params.push(Number(maxRent));
      paramIndex++;
    }
    if (amenities) {
      const amenityList = String(amenities).split(',');
      amenityList.forEach((a) => {
        whereClause += ` AND $${paramIndex} = ANY(p.amenities)`;
        params.push(a.trim());
        paramIndex++;
      });
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM properties p ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    const allowedSorts = ['created_at', 'name', 'city'];
    const sortColumn = allowedSorts.includes(String(sort)) ? String(sort) : 'created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

    const result = await pool.query(
      `SELECT p.*, 
        u.full_name as owner_name, u.phone as owner_phone,
        (SELECT json_agg(json_build_object('id', r.id, 'room_number', r.room_number, 'room_type', r.room_type, 'rent', r.rent, 'status', r.status, 'floor_number', r.floor_number, 'square_feet', r.square_feet)) 
         FROM rooms r WHERE r.property_id = p.id) as rooms,
        (SELECT COUNT(*) FROM rooms r WHERE r.property_id = p.id AND r.status = 'vacant') as vacant_rooms
       FROM properties p
       JOIN users u ON p.owner_id = u.id
       ${whereClause}
       ORDER BY p.${sortColumn} ${sortOrder}
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, Number(limit), offset]
    );

    return res.json({
      success: true,
      data: result.rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (err) {
    console.error('Get properties error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const getPropertyById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.*, 
        u.full_name as owner_name, u.phone as owner_phone, u.email as owner_email,
        (SELECT json_agg(json_build_object('id', r.id, 'room_number', r.room_number, 'room_type', r.room_type, 'rent', r.rent, 'security_deposit', r.security_deposit, 'status', r.status, 'floor_number', r.floor_number, 'square_feet', r.square_feet, 'description', r.description)) 
         FROM rooms r WHERE r.property_id = p.id ORDER BY r.room_number) as rooms
       FROM properties p
       JOIN users u ON p.owner_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Property not found.' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const createProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, location, city, state, pincode, images, amenities, rooms } = req.body;
    const ownerId = req.user!.id;

    const propertyId = uuidv4();
    await pool.query(
      `INSERT INTO properties (id, owner_id, name, description, location, city, state, pincode, images, amenities) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [propertyId, ownerId, name, description, location, city, state, pincode, images || [], amenities || []]
    );

    if (rooms && Array.isArray(rooms)) {
      for (const room of rooms) {
        const roomId = uuidv4();
        await pool.query(
          `INSERT INTO rooms (id, property_id, room_number, room_type, rent, security_deposit, status, floor_number, square_feet, description) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [roomId, propertyId, room.roomNumber, room.roomType, room.rent, room.securityDeposit || 0, room.status || 'vacant', room.floorNumber || null, room.squareFeet || null, room.description || null]
        );
      }
    }

    return res.status(201).json({ success: true, data: { id: propertyId }, message: 'Property created successfully.' });
  } catch (err) {
    console.error('Create property error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const updateProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, location, city, state, pincode, images, amenities, isActive } = req.body;

    const exists = await pool.query(`SELECT owner_id FROM properties WHERE id = $1`, [id]);
    if (exists.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Property not found.' });
    }
    if (req.user!.role !== 'admin' && exists.rows[0].owner_id !== req.user!.id) {
      return res.status(403).json({ success: false, error: 'Forbidden.' });
    }

    await pool.query(
      `UPDATE properties SET name = COALESCE($1, name), description = COALESCE($2, description), location = COALESCE($3, location), city = COALESCE($4, city), state = COALESCE($5, state), pincode = COALESCE($6, pincode), images = COALESCE($7, images), amenities = COALESCE($8, amenities), is_active = COALESCE($9, is_active), updated_at = NOW() WHERE id = $10`,
      [name, description, location, city, state, pincode, images, amenities, isActive, id]
    );

    return res.json({ success: true, message: 'Property updated successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const deleteProperty = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const exists = await pool.query(`SELECT owner_id FROM properties WHERE id = $1`, [id]);
    if (exists.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Property not found.' });
    }
    if (req.user!.role !== 'admin' && exists.rows[0].owner_id !== req.user!.id) {
      return res.status(403).json({ success: false, error: 'Forbidden.' });
    }

    await pool.query(`DELETE FROM properties WHERE id = $1`, [id]);
    return res.json({ success: true, message: 'Property deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const createEnquiry = async (req: Request, res: Response) => {
  try {
    const { propertyId, roomType, name, phone, email, preferredMoveIn, message } = req.body;
    const id = uuidv4();

    const property = await pool.query(`SELECT owner_id, name FROM properties WHERE id = $1`, [propertyId]);
    if (property.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Property not found.' });
    }

    await pool.query(
      `INSERT INTO enquiries (id, property_id, room_type, name, phone, email, preferred_move_in, message, owner_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, propertyId, roomType, name, phone, email, preferredMoveIn, message, property.rows[0].owner_id]
    );

    const { sendEmail, sendSMS, createNotification } = require('../utils');

    if (email) {
      await sendEmail(
        email,
        'Enquiry Received - Domicilo',
        `<p>Dear ${name},</p><p>Thank you for your interest in <strong>${property.rows[0].name}</strong>. We have received your enquiry and the property owner will contact you shortly.</p>`
      );
    }

    await sendSMS(phone, `Hi ${name}, thank you for your enquiry about ${property.rows[0].name} on Domicilo. The owner will get in touch with you soon.`);

    // Notify the owner
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, channel) VALUES ($1, $2, $3, $4)`,
      [property.rows[0].owner_id, 'New Enquiry Received', `${name} is interested in your property "${property.rows[0].name}".`, 'enquiry_submission']
    );

    return res.status(201).json({ success: true, data: { id }, message: 'Enquiry submitted successfully.' });
  } catch (err) {
    console.error('Create enquiry error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};
