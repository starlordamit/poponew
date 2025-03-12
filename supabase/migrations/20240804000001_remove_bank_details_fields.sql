-- Remove the bank_details fields from the influencers table
ALTER TABLE influencers
DROP COLUMN IF EXISTS bank_details,
DROP COLUMN IF EXISTS bank_details_2,
DROP COLUMN IF EXISTS bank_details_3;
