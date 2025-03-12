-- Create users_management table to store all authenticated users
CREATE TABLE IF NOT EXISTS users_management (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'user',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  permissions JSONB DEFAULT '[]'::jsonb
);

-- Create trigger to automatically add users to users_management when created in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users_management (id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    COALESCE(NEW.raw_app_meta_data->>'role', COALESCE(NEW.raw_user_meta_data->>'role', 'user'))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create trigger to automatically update users_management when user is updated
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.users_management
  SET 
    email = NEW.email,
    name = COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    role = COALESCE(NEW.raw_app_meta_data->>'role', COALESCE(NEW.raw_user_meta_data->>'role', 'user')),
    updated_at = NOW()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for user updates
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- Enable RLS on users_management
ALTER TABLE users_management ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to see all users
CREATE POLICY "Admins can see all users"
  ON users_management
  FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create policy for users to see their own data
CREATE POLICY "Users can see their own data"
  ON users_management
  FOR SELECT
  USING (auth.uid() = id);

-- Create policy for admins to update users
CREATE POLICY "Admins can update users"
  ON users_management
  FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create policy for users to update their own data
CREATE POLICY "Users can update their own data"
  ON users_management
  FOR UPDATE
  USING (auth.uid() = id);

-- Add realtime support
alter publication supabase_realtime add table users_management;