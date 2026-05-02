-- ==========================================
-- HOTEL MANAGEMENT SYSTEM - DATABASE SETUP
-- ==========================================

-- 1. Create Roles and Permissions Tables
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  can_manage_staff BOOLEAN DEFAULT false,
  can_edit_bookings BOOLEAN DEFAULT false,
  can_view_reports BOOLEAN DEFAULT false,
  can_manage_rooms BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Default Roles
INSERT INTO roles (name, description) VALUES
  ('Manager', 'Full system access including reports and staff management'),
  ('Receptionist', 'Can manage bookings, guests, and payments'),
  ('Housekeeping', 'Can view and update room statuses')
ON CONFLICT (name) DO NOTHING;

-- 2. Create Staff Table (Links to Supabase Auth)
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to Supabase Auth
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  role_id UUID REFERENCES roles(id),
  shift TEXT DEFAULT 'Morning',
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Rooms Table for Bulk & Single Rooms
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_number TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL, -- e.g., 'Hal Qol', 'Qol Double', 'Qol Qoyska', 'Qol VIP'
  status TEXT DEFAULT 'Available',
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Create open policies for now (so the front-end can read/write freely until fully locked down)
CREATE POLICY "Allow public read access to roles" ON roles FOR SELECT USING (true);
CREATE POLICY "Allow public read access to permissions" ON permissions FOR SELECT USING (true);
CREATE POLICY "Allow public read access to staff" ON staff FOR SELECT USING (true);
CREATE POLICY "Allow public read access to rooms" ON rooms FOR SELECT USING (true);

-- Allow authenticated users to insert/update data
CREATE POLICY "Allow auth insert to staff" ON staff FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow auth insert to rooms" ON rooms FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow auth update to rooms" ON rooms FOR UPDATE USING (auth.role() = 'authenticated');
