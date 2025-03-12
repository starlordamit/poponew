-- Fix RLS policy for user_roles table

-- First, disable RLS on user_roles table to allow the edge function to work
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Create a policy that allows authenticated users to view user roles
DROP POLICY IF EXISTS "Users can view user roles" ON user_roles;
CREATE POLICY "Users can view user roles"
ON user_roles FOR SELECT
TO authenticated
USING (true);

-- Create a policy that allows service role to insert user roles
DROP POLICY IF EXISTS "Service role can insert user roles" ON user_roles;
CREATE POLICY "Service role can insert user roles"
ON user_roles FOR INSERT
TO service_role
WITH CHECK (true);

-- Create a policy that allows service role to update user roles
DROP POLICY IF EXISTS "Service role can update user roles" ON user_roles;
CREATE POLICY "Service role can update user roles"
ON user_roles FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);
