-- Domicilo Database Schema
-- PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE user_role AS ENUM ('admin', 'owner', 'tenant');
CREATE TYPE room_type AS ENUM ('1RK', '1BHK', '2BHK', '3BHK', '4BHK');
CREATE TYPE occupancy_status AS ENUM ('vacant', 'occupied', 'maintenance');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_type AS ENUM ('rent', 'water', 'electricity', 'maintenance', 'other');
CREATE TYPE enquiry_status AS ENUM ('new', 'contacted', 'approved', 'rejected', 'converted');
CREATE TYPE notification_type AS ENUM ('email', 'sms', 'in_app');
CREATE TYPE notification_channel AS ENUM ('onboarding', 'payment_success', 'payment_failure', 'due_reminder', 'overdue_alert', 'enquiry_submission', 'lead_update');

-- Users table (admin, owner, tenant)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'tenant',
  is_active BOOLEAN DEFAULT true,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- Properties table
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  pincode VARCHAR(10),
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  images TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_number VARCHAR(50) NOT NULL,
  room_type room_type NOT NULL,
  rent DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2) DEFAULT 0,
  status occupancy_status DEFAULT 'vacant',
  floor_number INTEGER,
  square_feet INTEGER,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(property_id, room_number)
);

-- Tenants (linked to users)
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  lease_start DATE NOT NULL,
  lease_end DATE,
  rent_amount DECIMAL(10,2) NOT NULL,
  security_deposit DECIMAL(10,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enquiries / Leads
CREATE TABLE enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  room_type room_type NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  preferred_move_in DATE,
  message TEXT,
  status enquiry_status DEFAULT 'new',
  owner_id UUID REFERENCES users(id),
  converted_tenant_id UUID REFERENCES tenants(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  payment_type payment_type NOT NULL,
  status payment_status DEFAULT 'pending',
  razorpay_order_id VARCHAR(255),
  razorpay_payment_id VARCHAR(255),
  invoice_number VARCHAR(50) UNIQUE,
  due_date DATE NOT NULL,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fines
CREATE TABLE fines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT,
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  channel notification_channel NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Refresh tokens for JWT
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_active ON properties(is_active);
CREATE INDEX idx_rooms_property ON rooms(property_id);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_rooms_type ON rooms(room_type);
CREATE INDEX idx_tenants_user ON tenants(user_id);
CREATE INDEX idx_tenants_owner ON tenants(owner_id);
CREATE INDEX idx_tenants_property ON tenants(property_id);
CREATE INDEX idx_tenants_active ON tenants(is_active);
CREATE INDEX idx_enquiries_property ON enquiries(property_id);
CREATE INDEX idx_enquiries_owner ON enquiries(owner_id);
CREATE INDEX idx_enquiries_status ON enquiries(status);
CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_owner ON payments(owner_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_due ON payments(due_date);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
