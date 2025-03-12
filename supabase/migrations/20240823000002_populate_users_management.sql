-- Populate users_management table with existing auth users if empty

DO $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Check if users_management table is empty
  SELECT COUNT(*) INTO user_count FROM users_management;
  
  IF user_count = 0 THEN
    -- Insert existing auth users into users_management
    INSERT INTO users_management (id, email, name, role, created_at, updated_at)
    SELECT 
      id, 
      email, 
      COALESCE(raw_user_meta_data->>'name', email), 
      COALESCE(raw_app_meta_data->>'role', COALESCE(raw_user_meta_data->>'role', 'user')),
      created_at,
      created_at
    FROM auth.users
    ON CONFLICT (id) DO NOTHING;
  END IF;
END;
$$;