-- Create invitations table for managing user invites
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  role TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for invitations
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Only super admins can create invitations
CREATE POLICY "Super admins can create invitations"
ON invitations FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND is_super_admin = TRUE
  )
);

-- Super admins can view all invitations
CREATE POLICY "Super admins can view all invitations"
ON invitations FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
    AND is_super_admin = TRUE
  )
);

-- Anyone can use their own invitation by token
CREATE POLICY "Anyone can use their own invitation"
ON invitations FOR SELECT
TO anon
USING (used_at IS NULL AND expires_at > now());

-- Create function to generate random token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  result TEXT := '';
  i INTEGER := 0;
  length INTEGER := 32;
BEGIN
  FOR i IN 1..length LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically generate token
CREATE OR REPLACE FUNCTION set_invitation_defaults()
RETURNS TRIGGER AS $$
BEGIN
  NEW.token := generate_invitation_token();
  NEW.expires_at := NOW() + INTERVAL '7 days';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_invitation_defaults_trigger
BEFORE INSERT ON invitations
FOR EACH ROW
EXECUTE FUNCTION set_invitation_defaults();
