-- Add multiple bank accounts and verification fields to influencers table
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS bank_details_2 TEXT;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS bank_details_3 TEXT;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS is_bank_verified BOOLEAN DEFAULT false;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS is_pan_verified BOOLEAN DEFAULT false;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS is_gst_verified BOOLEAN DEFAULT false;
