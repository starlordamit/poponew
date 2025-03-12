-- Add sample user permissions for all roles

-- First, ensure the user_roles table exists and has the permissions column
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '[]'::jsonb;

-- Check if the role column is already an enum type
DO $$ 
BEGIN
  -- Check if the role column needs to be altered to accept our values
  IF NOT EXISTS (
    SELECT 1 FROM pg_type 
    WHERE typname = 'user_role_enum' AND 
    EXISTS (SELECT 1 FROM pg_enum WHERE enumtypid = pg_type.oid AND enumlabel = 'operation_manager')
  ) THEN
    -- Create a temporary table with the new structure
    CREATE TABLE IF NOT EXISTS temp_user_roles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid REFERENCES auth.users(id),
      role text,
      permissions jsonb DEFAULT '[]'::jsonb,
      created_at timestamp with time zone DEFAULT now(),
      updated_at timestamp with time zone DEFAULT now()
    );
    
    -- Copy existing data if any
    INSERT INTO temp_user_roles (id, user_id, role, permissions, created_at, updated_at)
    SELECT id, user_id, role::text, permissions, created_at, updated_at FROM user_roles;
    
    -- Drop the original table
    DROP TABLE IF EXISTS user_roles;
    
    -- Rename the temporary table
    ALTER TABLE temp_user_roles RENAME TO user_roles;
  END IF;
EXCEPTION
  WHEN others THEN
    RAISE NOTICE 'Error occurred: %', SQLERRM;
END $$;

-- Insert sample users with different roles and permissions
INSERT INTO user_roles (user_id, role, permissions)
VALUES 
  -- Admin user with all permissions
  ('00000000-0000-0000-0000-000000000001', 'admin', 
   '["manage_brands", "manage_influencers", "manage_campaigns", "manage_finances", "view_finances", "process_payments", "view_brand_price", "edit_deliverables", "view_analytics", "admin_settings", "user_management"]'::jsonb)
ON CONFLICT (user_id) DO UPDATE SET 
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions;

-- Manager with all permissions except user management
INSERT INTO user_roles (user_id, role, permissions)
VALUES 
  ('00000000-0000-0000-0000-000000000002', 'manager', 
   '["manage_brands", "manage_influencers", "manage_campaigns", "manage_finances", "view_finances", "process_payments", "view_brand_price", "edit_deliverables", "view_analytics", "admin_settings"]'::jsonb)
ON CONFLICT (user_id) DO UPDATE SET 
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions;

-- Operation manager with limited permissions
INSERT INTO user_roles (user_id, role, permissions)
VALUES 
  ('00000000-0000-0000-0000-000000000003', 'operation_manager', 
   '["manage_influencers", "manage_campaigns", "edit_deliverables", "view_finances", "view_analytics"]'::jsonb)
ON CONFLICT (user_id) DO UPDATE SET 
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions;

-- Finance user with finance-related permissions
INSERT INTO user_roles (user_id, role, permissions)
VALUES 
  ('00000000-0000-0000-0000-000000000004', 'finance', 
   '["view_finances", "manage_finances", "process_payments", "view_brand_price", "view_analytics"]'::jsonb)
ON CONFLICT (user_id) DO UPDATE SET 
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions;

-- Intern with minimal permissions
INSERT INTO user_roles (user_id, role, permissions)
VALUES 
  ('00000000-0000-0000-0000-000000000005', 'intern', 
   '["manage_influencers", "edit_deliverables"]'::jsonb)
ON CONFLICT (user_id) DO UPDATE SET 
  role = EXCLUDED.role,
  permissions = EXCLUDED.permissions;
