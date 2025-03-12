-- Add financial and exclusive fields to influencers table
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS bank_details TEXT;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS pan_number TEXT;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS gst_number TEXT;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS is_exclusive BOOLEAN DEFAULT false;
