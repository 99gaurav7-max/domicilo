import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../config/database';
import { config } from '../config';
import { AuthRequest } from '../types';

const generateTokens = (user: { id: string; email: string; phone: string; role: string }) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email, phone: user.phone, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn as any }
  );
  const refreshToken = jwt.sign(
    { id: user.id },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiresIn as any }
  );
  return { accessToken, refreshToken };
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query(
      `SELECT id, email, phone, full_name, password_hash, role, is_active FROM users WHERE email = $1 OR phone = $2`,
      [email, email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(403).json({ success: false, error: 'Account is deactivated.' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials.' });
    }

    const tokens = generateTokens(user);
    await pool.query(`UPDATE users SET last_login = NOW() WHERE id = $1`, [user.id]);

    return res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          fullName: user.full_name,
          role: user.role,
        },
        ...tokens,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, phone, fullName, password, role } = req.body;

    const allowedRoles = ['admin', 'owner', 'other'];
    const userRole = allowedRoles.includes(role) ? role : 'other';

    if (userRole === 'admin') {
      const adminCount = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'admin'`);
      if (parseInt(adminCount.rows[0].count, 10) > 0) {
        return res.status(400).json({ success: false, error: 'An admin account already exists. Only one admin is permitted per platform.' });
      }
    }

    const existing = await pool.query(
      `SELECT id FROM users WHERE email = $1 OR phone = $2`,
      [email, phone]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'User with this email or phone already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();

    await pool.query(
      `INSERT INTO users (id, email, phone, full_name, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, email, phone, fullName, passwordHash, userRole]
    );

    return res.status(201).json({ success: true, message: 'Registration successful. Please log in.' });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const changePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.id;

    const result = await pool.query(`SELECT password_hash FROM users WHERE id = $1`, [userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const validPassword = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!validPassword) {
      return res.status(400).json({ success: false, error: 'Current password is incorrect.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [passwordHash, userId]);

    return res.json({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const result = await pool.query(`SELECT id, full_name FROM users WHERE email = $1`, [email]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const resetToken = jwt.sign({ id: user.id, type: 'reset' }, config.jwt.secret, { expiresIn: '1h' });
      const resetLink = `${config.frontendUrl}/reset-password?token=${resetToken}`;

      try {
        const { sendEmail } = require('../utils');
        await sendEmail(
          email,
          'Password Reset - Domicilo',
          `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
            <div style="background:linear-gradient(135deg,#1e3a5f,#1d4ed8);padding:32px;border-radius:12px 12px 0 0;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:24px;">Password Reset</h1>
            </div>
            <div style="background:#fff;padding:32px;border-radius:0 0 12px 12px;border:1px solid #e5e7eb;">
              <p style="color:#374151;font-size:16px;line-height:1.6;">Hi ${user.full_name},</p>
              <p style="color:#374151;font-size:16px;line-height:1.6;">We received a request to reset your Domicilo account password. Click the button below to set a new password:</p>
              <div style="text-align:center;margin:24px 0;">
                <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;">Reset Password</a>
              </div>
              <p style="color:#6b7280;font-size:14px;">This link expires in <strong>1 hour</strong>.</p>
              <p style="color:#9ca3af;font-size:12px;margin-top:24px;">If you didn't request this, please ignore this email.</p>
            </div>
          </div>`
        );
      } catch (emailErr) {
        console.error('Failed to send reset email:', emailErr);
        return res.status(500).json({ success: false, error: 'Failed to send email. Please configure SMTP in environment variables.' });
      }
    }

    return res.json({ success: true, message: 'If the email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;
    const decoded = jwt.verify(token, config.jwt.secret) as any;

    if (decoded.type !== 'reset') {
      return res.status(400).json({ success: false, error: 'Invalid reset token.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [passwordHash, decoded.id]);

    return res.json({ success: true, message: 'Password reset successful.' });
  } catch (err) {
    return res.status(400).json({ success: false, error: 'Invalid or expired token.' });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken: token } = req.body;
    const decoded = jwt.verify(token, config.jwt.refreshSecret) as any;

    const result = await pool.query(
      `SELECT id, email, phone, role FROM users WHERE id = $1 AND is_active = true`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid refresh token.' });
    }

    const tokens = generateTokens(result.rows[0]);
    return res.json({ success: true, ...tokens });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid refresh token.' });
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    // Prevent deleting the last admin
    const target = await pool.query(`SELECT role FROM users WHERE id = $1`, [userId]);
    if (target.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    if (target.rows[0].role === 'admin') {
      const adminCount = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'admin'`);
      if (parseInt(adminCount.rows[0].count, 10) <= 1) {
        return res.status(400).json({ success: false, error: 'Cannot delete the last admin account.' });
      }
    }

    await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);
    return res.json({ success: true, message: 'Account deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const checkAdminExists = async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(`SELECT COUNT(*) FROM users WHERE role = 'admin'`);
    return res.json({ success: true, exists: parseInt(result.rows[0].count, 10) > 0 });
  } catch {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, email, phone, full_name, role, is_active, avatar_url, created_at, last_login FROM users WHERE id = $1`,
      [req.user!.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }
    const user = result.rows[0];
    return res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.full_name,
        role: user.role,
        isActive: user.is_active,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
};
