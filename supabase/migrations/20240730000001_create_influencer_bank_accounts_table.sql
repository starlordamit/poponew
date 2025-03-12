-- Create influencer_bank_accounts table for storing multiple bank accounts
CREATE TABLE IF NOT EXISTS influencer_bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  account_name TEXT,
  account_number TEXT NOT NULL,
  ifsc_code TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  branch_name TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups by influencer_id
CREATE INDEX IF NOT EXISTS idx_influencer_bank_accounts_influencer_id ON influencer_bank_accounts(influencer_id);

-- Enable row-level security
ALTER TABLE influencer_bank_accounts ENABLE ROW LEVEL SECURITY;

-- Create policy for full access
CREATE POLICY "Users can perform all operations on influencer_bank_accounts"
ON influencer_bank_accounts
FOR ALL
TO authenticated
USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE influencer_bank_accounts;
