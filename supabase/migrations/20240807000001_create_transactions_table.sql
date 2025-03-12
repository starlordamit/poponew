-- Create transactions table to store payment records
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id UUID REFERENCES influencers(id),
  video_id UUID REFERENCES campaign_videos(id),
  bank_account_id UUID REFERENCES influencer_bank_accounts(id),
  amount DECIMAL NOT NULL,
  total_amount DECIMAL,
  tds_rate DECIMAL,
  tds_amount DECIMAL,
  reference TEXT,
  status TEXT NOT NULL,
  payment_method TEXT,
  bank_name TEXT,
  account_number TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_transactions_influencer_id ON transactions(influencer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_video_id ON transactions(video_id);

-- Enable realtime for transactions
alter publication supabase_realtime add table transactions;
