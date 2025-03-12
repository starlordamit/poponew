-- Fix transactions table to ensure all required columns exist
ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS created_by UUID,
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS account_number TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Ensure the transactions table has proper foreign key constraints
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'transactions_influencer_id_fkey'
  ) THEN
    ALTER TABLE transactions
    ADD CONSTRAINT transactions_influencer_id_fkey
    FOREIGN KEY (influencer_id) REFERENCES influencers(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'transactions_video_id_fkey'
  ) THEN
    ALTER TABLE transactions
    ADD CONSTRAINT transactions_video_id_fkey
    FOREIGN KEY (video_id) REFERENCES campaign_videos(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'transactions_bank_account_id_fkey'
  ) THEN
    ALTER TABLE transactions
    ADD CONSTRAINT transactions_bank_account_id_fkey
    FOREIGN KEY (bank_account_id) REFERENCES influencer_bank_accounts(id);
  END IF;
END $$;

-- Remove the realtime publication line that's causing the error
-- The table is already in the publication from a previous migration