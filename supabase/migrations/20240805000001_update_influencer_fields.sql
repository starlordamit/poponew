-- Add new fields to influencers table
ALTER TABLE influencers
ADD COLUMN IF NOT EXISTS genre TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS languages TEXT;

-- Add PAN and GST fields to bank accounts table
ALTER TABLE influencer_bank_accounts
ADD COLUMN IF NOT EXISTS pan_number TEXT,
ADD COLUMN IF NOT EXISTS gst_number TEXT,
ADD COLUMN IF NOT EXISTS is_pan_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS is_gst_verified BOOLEAN DEFAULT FALSE;
