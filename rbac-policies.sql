-- ==========================================
-- ROLE-BASED ACCESS CONTROL (RBAC) POLICIES
-- Run this in Supabase SQL Editor to enforce permissions
-- ==========================================

-- Helper function to get the role of the currently logged-in user
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.staff WHERE user_id = auth.uid() LIMIT 1;
  RETURN COALESCE(user_role, 'Receptionist'); -- Default to lowest access if not found
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 1. EXPENSES TABLE (Only Managers and Admins can view/edit)
DROP POLICY IF EXISTS "auth_all_expenses" ON expenses;

CREATE POLICY "expenses_manager_all" ON expenses
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  public.get_user_role() IN ('Manager', 'Admin')
) WITH CHECK (
  auth.role() = 'authenticated' AND 
  public.get_user_role() IN ('Manager', 'Admin')
);


-- 2. STAFF TABLE (Only Managers/Admins can add or delete staff. Everyone can view.)
DROP POLICY IF EXISTS "auth_all_staff" ON staff;

CREATE POLICY "staff_view_all" ON staff
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "staff_manage" ON staff
FOR ALL USING (
  auth.role() = 'authenticated' AND 
  public.get_user_role() IN ('Manager', 'Admin')
) WITH CHECK (
  auth.role() = 'authenticated' AND 
  public.get_user_role() IN ('Manager', 'Admin')
);


-- 3. HOTELS SETTINGS (Only Managers/Admins can edit. Everyone can view.)
DROP POLICY IF EXISTS "auth_all_hotels" ON hotels;

CREATE POLICY "hotels_view_all" ON hotels
FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "hotels_manage" ON hotels
FOR UPDATE USING (
  auth.role() = 'authenticated' AND 
  public.get_user_role() IN ('Manager', 'Admin')
) WITH CHECK (
  auth.role() = 'authenticated' AND 
  public.get_user_role() IN ('Manager', 'Admin')
);
