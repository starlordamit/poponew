-- Create a function to automatically make the first user an admin
CREATE OR REPLACE FUNCTION make_first_user_admin()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing users
  SELECT COUNT(*) INTO user_count FROM user_roles;
  
  -- If this is the first user, make them an admin
  IF user_count = 0 THEN
    INSERT INTO user_roles (user_id, role, permissions)
    VALUES (
      NEW.id, 
      'admin',
      ARRAY[
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
      ]
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to run the function when a new user is created
DROP TRIGGER IF EXISTS make_first_user_admin_trigger ON auth.users;
CREATE TRIGGER make_first_user_admin_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION make_first_user_admin();
