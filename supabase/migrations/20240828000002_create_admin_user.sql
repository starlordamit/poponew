-- Create a default admin user for easy access
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@example.com',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  '{"provider":"email"}',
  '{"name":"Admin User"}',
  now(),
  now()
)
ON CONFLICT (email) DO NOTHING;
