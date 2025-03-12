-- Grant additional permissions for users_management table

-- Make sure all authenticated users can view the users_management table
CREATE POLICY "Authenticated users can view all users"
  ON users_management
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Make sure the admin_settings permission is checked
CREATE POLICY "Users with admin_settings permission can manage users"
  ON users_management
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid()
      AND permissions::jsonb ? 'admin_settings'
    )
  );
