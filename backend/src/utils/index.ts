import { Response } from 'express';
import { pool } from '../config/database';
import { config } from '../config';
import { v4 as uuidv4 } from 'uuid';

export const generateInvoiceNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const rand = Math.floor(Math.random() * 9999) + 1;
  return `INV-${year}-${String(rand).padStart(4, '0')}`;
};

export const generateTempPassword = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let password = '';
  for (let i = 0; i < 10; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password + '@1A';
};

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });

    await transporter.sendMail({
      from: `"Domicilo" <${config.smtp.from}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error('Email send failed:', err);
  }
};

export const sendSMS = async (to: string, message: string) => {
  try {
    if (config.twilio.accountSid) {
      const twilio = require('twilio');
      const client = twilio(config.twilio.accountSid, config.twilio.authToken);
      await client.messages.create({
        body: message,
        from: config.twilio.phoneNumber,
        to,
      });
    } else {
      console.log(`[SMS to ${to}]: ${message}`);
    }
  } catch (err) {
    console.error('SMS send failed:', err);
  }
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  channel: string
) => {
  try {
    await pool.query(
      `INSERT INTO notifications (user_id, title, message, channel) VALUES ($1, $2, $3, $4)`,
      [userId, title, message, channel]
    );
  } catch (err) {
    console.error('Notification creation failed:', err);
  }
};

export const sendTenantOnboarding = async (
  email: string,
  phone: string,
  name: string,
  tempPassword: string,
  propertyName: string,
  userId?: string
) => {
  const frontendUrl = config.frontendUrl;
  const loginLink = `${frontendUrl}/login`;

  const smsMessage = `Welcome to Domicilo, ${name}! Your tenant account for ${propertyName} has been created. Login: ${loginLink} | Temporary Password: ${tempPassword}`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e3a5f 0%, #2d7fc1 100%); padding: 40px; border-radius: 12px;">
      <div style="background: white; border-radius: 8px; padding: 32px;">
        <h1 style="color: #1e3a5f; margin: 0 0 20px; font-size: 24px;">Welcome to Domicilo, ${name}! 🏠</h1>
        <p style="color: #555; font-size: 16px; line-height: 1.6;">Your tenant account for <strong>${propertyName}</strong> has been created successfully.</p>
        <div style="background: #f0f7ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <p style="margin: 0 0 10px; color: #333;"><strong>Temporary Password:</strong></p>
          <p style="font-size: 18px; font-weight: bold; color: #1e3a5f; letter-spacing: 2px; text-align: center; margin: 0;">${tempPassword}</p>
        </div>
        <p style="color: #555; font-size: 14px;">Please log in and change your password immediately.</p>
        <a href="${loginLink}" style="display: inline-block; background: #1e3a5f; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">Login to Domicilo</a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">If you didn't expect this email, please ignore it.</p>
      </div>
    </div>
  `;

  if (email) {
    await sendEmail(email, 'Welcome to Domicilo - Your Account is Ready!', emailHtml);
  }
  await sendSMS(phone, smsMessage);
  if (userId) {
    await createNotification(
      userId,
      'Welcome to Domicilo!',
      `Your tenant account at ${propertyName} has been created. Please login and change your password.`,
      'onboarding'
    );
  }
};
