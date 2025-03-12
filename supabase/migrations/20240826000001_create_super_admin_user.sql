-- Create a super admin user
-- This will create a user with admin role and super admin privileges

-- First, create the user in auth.users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at)
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"],"role":"admin"}'::jsonb,
  '{"name":"Super Admin","role":"admin"}'::jsonb,
  now()
)
ON CONFLICT (email) DO NOTHING;

-- Get the user ID
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@example.com';
  
  -- Create entry in public.users (required for foreign key constraints)
  INSERT INTO public.users (id, created_at)
  VALUES (admin_user_id, now())
  ON CONFLICT (id) DO NOTHING;
  
  -- Add admin role with super admin privileges
  INSERT INTO user_roles (user_id, role, is_super_admin, permissions)
  VALUES (
    admin_user_id,
    'admin',
    true,
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
    ]::text[]
  )
  ON CONFLICT (user_id) DO UPDATE SET
    role = 'admin',
    is_super_admin = true,
    permissions = ARRAY[
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
    ]::text[];
  
  -- Add to users_management table
  INSERT INTO users_management (id, email, name, role, status, permissions)
  VALUES (
    admin_user_id,
    'admin@example.com',
    'Super Admin',
    'admin',
    'active',
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
    ]::text[]
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    status = 'active',
    permissions = ARRAY[
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
    ]::text[];
  
END $$;