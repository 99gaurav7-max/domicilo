-- Domicilo Seed Data
-- Password for all seeded users: Domicilo@123 (bcrypt hash)

-- Admin account
INSERT INTO users (id, email, phone, full_name, password_hash, role) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'admin@domicilo.com', '+919999999999', 'Admin User', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmGGm7F5mO5o5C5F5C5e', 'admin');

-- Owner accounts
INSERT INTO users (id, email, phone, full_name, password_hash, role) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'rahul@example.com', '+919876543201', 'Rahul Sharma', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmGGm7F5mO5o5C5F5C5e', 'owner'),
  ('b0000000-0000-0000-0000-000000000002', 'priya@example.com', '+919876543202', 'Priya Patel', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmGGm7F5mO5o5C5F5C5e', 'owner');

-- Properties
INSERT INTO properties (id, owner_id, name, description, location, city, state, pincode, images, amenities) VALUES
  ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'Sunrise Apartments', 'Premium living spaces with modern amenities in the heart of the city.', 'MG Road, Near City Center', 'Mumbai', 'Maharashtra', '400001', ARRAY['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'], ARRAY['WiFi', 'Parking', 'Gym', 'Security', 'Power Backup', 'Lift']),
  ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Green Valley Residency', 'Eco-friendly living surrounded by nature with all modern conveniences.', 'Green Valley Road, Sector 5', 'Bangalore', 'Karnataka', '560001', ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800'], ARRAY['Garden', 'Parking', 'Security', 'Rain Water Harvesting']),
  ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 'Lakeview Heights', 'Luxury apartments with breathtaking lake views and premium amenities.', 'Lake Road, Hill Colony', 'Pune', 'Maharashtra', '411001', ARRAY['https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'], ARRAY['Swimming Pool', 'Gym', 'Spa', 'Security', 'Club House']);

-- Rooms
INSERT INTO rooms (id, property_id, room_number, room_type, rent, security_deposit, status, floor_number, square_feet) VALUES
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '101', '1BHK', 15000.00, 30000.00, 'vacant', 1, 450),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', '102', '1BHK', 15000.00, 30000.00, 'occupied', 1, 450),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', '201', '2BHK', 25000.00, 50000.00, 'vacant', 2, 750),
  ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'A1', '1RK', 8000.00, 16000.00, 'vacant', 1, 250),
  ('d0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000002', 'A2', '1RK', 8500.00, 17000.00, 'vacant', 1, 250),
  ('d0000000-0000-0000-0000-000000000006', 'c0000000-0000-0000-0000-000000000002', 'B1', '1BHK', 12000.00, 24000.00, 'occupied', 2, 400),
  ('d0000000-0000-0000-0000-000000000007', 'c0000000-0000-0000-0000-000000000003', '301', '2BHK', 35000.00, 70000.00, 'vacant', 3, 850),
  ('d0000000-0000-0000-0000-000000000008', 'c0000000-0000-0000-0000-000000000003', '302', '3BHK', 50000.00, 100000.00, 'vacant', 3, 1200),
  ('d0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000003', 'Penthouse', '3BHK', 75000.00, 150000.00, 'vacant', 5, 2000);

-- Tenant account
INSERT INTO users (id, email, phone, full_name, password_hash, role) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'vikram@example.com', '+919876543210', 'Vikram Singh', '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGmGGm7F5mO5o5C5F5C5e', 'tenant');

INSERT INTO tenants (id, user_id, owner_id, room_id, property_id, lease_start, rent_amount, security_deposit) VALUES
  ('f0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', '2025-01-01', 15000.00, 30000.00);

-- Sample payments
INSERT INTO payments (id, tenant_id, property_id, owner_id, amount, payment_type, status, razorpay_payment_id, invoice_number, due_date, paid_at) VALUES
  ('f0000000-0000-0000-0000-000000000011', 'f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 15000.00, 'rent', 'completed', 'pay_JK7d9f8sdf7', 'INV-2025-001', '2025-01-05', '2025-01-05T10:30:00Z'),
  ('f0000000-0000-0000-0000-000000000012', 'f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 15000.00, 'rent', 'completed', 'pay_JK8d9f8sdf8', 'INV-2025-002', '2025-02-05', '2025-02-05T09:15:00Z'),
  ('f0000000-0000-0000-0000-000000000013', 'f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 15000.00, 'rent', 'pending', NULL, 'INV-2025-003', '2025-03-05', NULL),
  ('f0000000-0000-0000-0000-000000000014', 'f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001', 2000.00, 'electricity', 'completed', 'pay_JK9d9f8sdf9', 'INV-2025-004', '2025-02-10', '2025-02-10T11:00:00Z');

-- Sample notifications
INSERT INTO notifications (user_id, title, message, channel) VALUES
  ('e0000000-0000-0000-0000-000000000001', 'Welcome to Domicilo!', 'Your tenant account has been created successfully. Welcome aboard!', 'onboarding'),
  ('e0000000-0000-0000-0000-000000000001', 'Payment Successful', 'Your rent payment of Rs.15,000 for January has been received.', 'payment_success'),
  ('e0000000-0000-0000-0000-000000000001', 'Rent Due Reminder', 'Your rent for March is due on 5th March. Please pay on time.', 'due_reminder');
