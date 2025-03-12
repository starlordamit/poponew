-- Create invite codes table
CREATE TABLE IF NOT EXISTS invite_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) NOT NULL UNIQUE,
  role VARCHAR(50) NOT NULL DEFAULT 'user',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  used_at TIMESTAMP WITH TIME ZONE,
  used_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT TRUE,
  max_uses INTEGER DEFAULT 1,
  current_uses INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage invite codes"
ON invite_codes
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can read active invite codes"
ON invite_codes
FOR SELECT
USING (is_active = TRUE AND (used_at IS NULL OR current_uses < max_uses));

-- Add realtime
alter publication supabase_realtime add table invite_codes;
