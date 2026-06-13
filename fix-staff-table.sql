-- Copy this into your Supabase SQL Editor and click RUN

-- 1. Add missing columns to the staff table
ALTER TABLE public.staff 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'Receptionist',
ADD COLUMN IF NOT EXISTS shift TEXT DEFAULT 'Morning',
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- 2. Force the schema cache to refresh so PostgREST sees the new columns
NOTIFY pgrst, 'reload schema';
