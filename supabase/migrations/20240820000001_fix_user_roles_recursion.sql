-- Fix infinite recursion in user_roles policies

-- Drop existing policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can create roles" ON user_roles;
DROP POLICY IF EXISTS "Admins can update roles" ON user_roles;

-- Create new policies that don't cause recursion
CREATE POLICY "Users can view all roles"
ON user_roles FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can create roles"
ON user_roles FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Users can update roles"
ON user_roles FOR UPDATE
TO authenticated
USING (true);
