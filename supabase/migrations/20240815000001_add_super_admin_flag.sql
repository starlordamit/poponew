-- Add is_super_admin column to user_roles table
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE;

-- Create a function to make the first user a super admin
CREATE OR REPLACE FUNCTION make_first_user_super_admin()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing users
  SELECT COUNT(*) INTO user_count FROM user_roles;
  
  -- If this is the first user, make them a super admin
  IF user_count = 0 THEN
    NEW.role = 'admin';
    NEW.is_super_admin = TRUE;
    NEW.permissions = ARRAY[
      'manage_brands',
      'manage_influencers',
      'manage_campaigns',
      'manage_finances',
      'view_finances',
      'process_payments',
      'view_brand_price',
      'edit_deliverables',
      'view_analytics',
      'admin_settings',
      'user_management'
    ];
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to run the function when a new user role is inserted
DROP TRIGGER IF EXISTS make_first_user_super_admin_trigger ON user_roles;
CREATE TRIGGER make_first_user_super_admin_trigger
BEFORE INSERT ON user_roles
FOR EACH ROW
EXECUTE FUNCTION make_first_user_super_admin();

-- Update DirectAdminCreator to set is_super_admin flag
CREATE OR REPLACE FUNCTION set_direct_admin_as_super()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'admin' THEN
    NEW.is_super_admin = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_direct_admin_as_super_trigger ON user_roles;
CREATE TRIGGER set_direct_admin_as_super_trigger
BEFORE INSERT ON user_roles
FOR EACH ROW
WHEN (NEW.role = 'admin')
EXECUTE FUNCTION set_direct_admin_as_super();
