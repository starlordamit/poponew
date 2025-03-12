-- Fix permissions access for users_management table

-- Make sure users_management table has RLS enabled
ALTER TABLE users_management ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read their own data
DROP POLICY IF EXISTS "Users can read their own data" ON users_management;
CREATE POLICY "Users can read their own data"
  ON users_management
  FOR SELECT
  USING (auth.uid() = id);

-- Create policy to allow admins to read all data
DROP POLICY IF EXISTS "Admins can read all data" ON users_management;
CREATE POLICY "Admins can read all data"
  ON users_management
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create policy to allow admins to insert data
DROP POLICY IF EXISTS "Admins can insert data" ON users_management;
CREATE POLICY "Admins can insert data"
  ON users_management
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create policy to allow admins to update data
DROP POLICY IF EXISTS "Admins can update data" ON users_management;
CREATE POLICY "Admins can update data"
  ON users_management
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Create policy to allow admins to delete data
DROP POLICY IF EXISTS "Admins can delete data" ON users_management;
CREATE POLICY "Admins can delete data"
  ON users_management
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND role = 'admin'
    )
  );
