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

    const existing = await pool.query(
      `SELECT id FROM users WHERE email = $1 OR phone = $2`,
      [email, phone]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'User with this email or phone already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = uuidv4();
    const userRole = role || 'tenant';

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

      const { sendEmail } = require('../utils');
      await sendEmail(
        email,
        'Password Reset - Domicilo',
        `<p>Hi ${user.full_name},</p><p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`
      );
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
