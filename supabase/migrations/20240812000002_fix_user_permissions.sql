-- Fix user permissions by using a simpler approach

-- Make sure permissions column exists
ALTER TABLE IF EXISTS user_roles ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '[]'::jsonb;

-- Create a function to safely insert sample user roles
CREATE OR REPLACE FUNCTION insert_sample_user_role(user_id_param UUID, role_param TEXT, permissions_param JSONB)
RETURNS VOID AS $$
BEGIN
  -- Check if user_id exists in the table
  IF EXISTS (SELECT 1 FROM user_roles WHERE user_id = user_id_param) THEN
    -- Update existing record
    UPDATE user_roles 
    SET role = role_param, permissions = permissions_param
    WHERE user_id = user_id_param;
  ELSE
    -- Try to insert new record
    BEGIN
      INSERT INTO user_roles (user_id, role, permissions)
      VALUES (user_id_param, role_param, permissions_param);
    EXCEPTION WHEN OTHERS THEN
      -- Log error but continue
      RAISE NOTICE 'Could not insert role for user %: %', user_id_param, SQLERRM;
    END;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Call function for each sample user
SELECT insert_sample_user_role(
  '00000000-0000-0000-0000-000000000001'::UUID,
  'admin',
  '["manage_brands", "manage_influencers", "manage_campaigns", "manage_finances", "view_finances", "process_payments", "view_brand_price", "edit_deliverables", "view_analytics", "admin_settings", "user_management"]'::jsonb
);

SELECT insert_sample_user_role(
  '00000000-0000-0000-0000-000000000002'::UUID,
  'manager',
  '["manage_brands", "manage_influencers", "manage_campaigns", "manage_finances", "view_finances", "process_payments", "view_brand_price", "edit_deliverables", "view_analytics", "admin_settings"]'::jsonb
);

SELECT insert_sample_user_role(
  '00000000-0000-0000-0000-000000000003'::UUID,
  'operation_manager',
  '["manage_influencers", "manage_campaigns", "edit_deliverables", "view_finances", "view_analytics"]'::jsonb
);

SELECT insert_sample_user_role(
  '00000000-0000-0000-0000-000000000004'::UUID,
  'finance',
  '["view_finances", "manage_finances", "process_payments", "view_brand_price", "view_analytics"]'::jsonb
);

SELECT insert_sample_user_role(
  '00000000-0000-0000-0000-000000000005'::UUID,
  'intern',
  '["manage_influencers", "edit_deliverables"]'::jsonb
);

-- Drop the function when done
DROP FUNCTION IF EXISTS insert_sample_user_role;
