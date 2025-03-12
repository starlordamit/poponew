-- Create user roles table for access control
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL,
  permissions JSONB DEFAULT '[]',
  is_super_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own roles
CREATE POLICY "Users can view their own roles"
ON user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Allow admins to view all roles
CREATE POLICY "Admins can view all roles"
ON user_roles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to create/update roles
CREATE POLICY "Admins can create roles"
ON user_roles FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Admins can update roles"
ON user_roles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create function to set default role for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role, permissions)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 
        '["manage_brands","manage_influencers","manage_campaigns","manage_finances","view_finances","process_payments","view_brand_price","edit_deliverables","view_analytics","admin_settings"]'
      WHEN NEW.raw_user_meta_data->>'role' = 'brand_manager' THEN 
        '["manage_brands","manage_campaigns","view_finances","view_brand_price","view_analytics"]'
      WHEN NEW.raw_user_meta_data->>'role' = 'influencer_manager' THEN 
        '["manage_influencers","manage_campaigns","edit_deliverables"]'
      WHEN NEW.raw_user_meta_data->>'role' = 'finance' THEN 
        '["view_finances","manage_finances","process_payments","view_brand_price"]'
      ELSE '[]'
    END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to set default role for new users
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
