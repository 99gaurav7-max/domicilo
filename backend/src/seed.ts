import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'domicilo',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding database...');
    const hash = await bcrypt.hash('Domicilo@123', 10);

    // Check if already seeded
    const existing = await client.query(`SELECT id FROM users LIMIT 1`);
    if (existing.rows.length > 0) {
      console.log('Database already has data. Skipping seed.');
      return;
    }

    // Admin
    await client.query(
      `INSERT INTO users (id, email, phone, full_name, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6)`,
      ['a0000000-0000-0000-0000-000000000001', 'admin@domicilo.com', '+919999999999', 'Admin User', hash, 'admin']
    );

    // Owners
    await client.query(
      `INSERT INTO users (id, email, phone, full_name, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6)`,
      ['o0000000-0000-0000-0000-000000000001', 'rahul@example.com', '+919876543201', 'Rahul Sharma', hash, 'owner']
    );
    await client.query(
      `INSERT INTO users (id, email, phone, full_name, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6)`,
      ['o0000000-0000-0000-0000-000000000002', 'priya@example.com', '+919876543202', 'Priya Patel', hash, 'owner']
    );

    // Properties
    await client.query(
      `INSERT INTO properties (id, owner_id, name, description, location, city, state, pincode, images, amenities) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      ['p0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000001', 'Sunrise Apartments', 'Premium living spaces in the heart of the city.', 'MG Road, Near City Center', 'Mumbai', 'Maharashtra', '400001', ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'], ['WiFi', 'Parking', 'Gym', 'Security', 'Power Backup', 'Lift']]
    );
    await client.query(
      `INSERT INTO properties (id, owner_id, name, description, location, city, state, pincode, images, amenities) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      ['p0000000-0000-0000-0000-000000000002', 'o0000000-0000-0000-0000-000000000001', 'Green Valley Residency', 'Eco-friendly living surrounded by nature.', 'Green Valley Road, Sector 5', 'Bangalore', 'Karnataka', '560001', ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800'], ['Garden', 'Parking', 'Security', 'Rain Water Harvesting']]
    );
    await client.query(
      `INSERT INTO properties (id, owner_id, name, description, location, city, state, pincode, images, amenities) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      ['p0000000-0000-0000-0000-000000000003', 'o0000000-0000-0000-0000-000000000002', 'Lakeview Heights', 'Luxury apartments with breathtaking lake views.', 'Lake Road, Hill Colony', 'Pune', 'Maharashtra', '411001', ['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'], ['Swimming Pool', 'Gym', 'Spa', 'Security', 'Club House']]
    );

    // Rooms
    const rooms = [
      ['r0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', '101', '1BHK', 15000, 30000, 'vacant', 1, 450],
      ['r0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000001', '102', '1BHK', 15000, 30000, 'occupied', 1, 450],
      ['r0000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000001', '201', '2BHK', 25000, 50000, 'vacant', 2, 750],
      ['r0000000-0000-0000-0000-000000000004', 'p0000000-0000-0000-0000-000000000002', 'A1', '1RK', 8000, 16000, 'vacant', 1, 250],
      ['r0000000-0000-0000-0000-000000000005', 'p0000000-0000-0000-0000-000000000002', 'A2', '1RK', 8500, 17000, 'vacant', 1, 250],
      ['r0000000-0000-0000-0000-000000000006', 'p0000000-0000-0000-0000-000000000002', 'B1', '1BHK', 12000, 24000, 'occupied', 2, 400],
      ['r0000000-0000-0000-0000-000000000007', 'p0000000-0000-0000-0000-000000000003', '301', '2BHK', 35000, 70000, 'vacant', 3, 850],
      ['r0000000-0000-0000-0000-000000000008', 'p0000000-0000-0000-0000-000000000003', '302', '3BHK', 50000, 100000, 'vacant', 3, 1200],
      ['r0000000-0000-0000-0000-000000000009', 'p0000000-0000-0000-0000-000000000003', 'Penthouse', '3BHK', 75000, 150000, 'vacant', 5, 2000],
    ];
    for (const r of rooms) {
      await client.query(
        `INSERT INTO rooms (id, property_id, room_number, room_type, rent, security_deposit, status, floor_number, square_feet) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        r
      );
    }

    // Tenant user
    await client.query(
      `INSERT INTO users (id, email, phone, full_name, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6)`,
      ['t0000000-0000-0000-0000-000000000001', 'vikram@example.com', '+919876543210', 'Vikram Singh', hash, 'tenant']
    );

    // Tenant record
    await client.query(
      `INSERT INTO tenants (id, user_id, owner_id, room_id, property_id, lease_start, rent_amount, security_deposit) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      ['tn0000000-0000-0000-0000-000000000001', 't0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000001', 'r0000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000001', '2025-01-01', 15000, 30000]
    );

    // Payments
    await client.query(
      `INSERT INTO payments (id, tenant_id, property_id, owner_id, amount, payment_type, status, razorpay_payment_id, invoice_number, due_date, paid_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      ['pay0000000-0000-0000-0000-000000000001', 'tn0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000001', 15000, 'rent', 'completed', 'pay_JK7d9f8sdf7', 'INV-2025-001', '2025-01-05', '2025-01-05T10:30:00Z']
    );
    await client.query(
      `INSERT INTO payments (id, tenant_id, property_id, owner_id, amount, payment_type, status, razorpay_payment_id, invoice_number, due_date, paid_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      ['pay0000000-0000-0000-0000-000000000002', 'tn0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000001', 15000, 'rent', 'completed', 'pay_JK8d9f8sdf8', 'INV-2025-002', '2025-02-05', '2025-02-05T09:15:00Z']
    );
    await client.query(
      `INSERT INTO payments (id, tenant_id, property_id, owner_id, amount, payment_type, status, invoice_number, due_date) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      ['pay0000000-0000-0000-0000-000000000003', 'tn0000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'o0000000-0000-0000-0000-000000000001', 15000, 'rent', 'pending', 'INV-2025-003', '2025-03-05']
    );

    // Notifications
    await client.query(
      `INSERT INTO notifications (user_id, title, message, channel) VALUES ($1, $2, $3, $4)`,
      ['t0000000-0000-0000-0000-000000000001', 'Welcome to Domicilo!', 'Your tenant account has been created successfully.', 'onboarding']
    );
    await client.query(
      `INSERT INTO notifications (user_id, title, message, channel) VALUES ($1, $2, $3, $4)`,
      ['t0000000-0000-0000-0000-000000000001', 'Payment Successful', 'Your rent payment of Rs.15,000 has been received.', 'payment_success']
    );

    console.log('✅ Database seeded successfully!');
    console.log('Demo accounts:');
    console.log('  Admin:  admin@domicilo.com / Domicilo@123');
    console.log('  Owner:  rahul@example.com / Domicilo@123');
    console.log('  Tenant: vikram@example.com / Domicilo@123');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();
