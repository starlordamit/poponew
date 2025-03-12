-- Add agency fees columns to transactions table
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS agency_fees_rate NUMERIC,
ADD COLUMN IF NOT EXISTS agency_fees_amount NUMERIC;

-- Update realtime publication
alter publication supabase_realtime add table transactions;