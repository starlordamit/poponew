-- Fix transactions table created_at column to have a default value
ALTER TABLE transactions 
ALTER COLUMN created_at SET DEFAULT now();

-- Make sure all required columns exist and have appropriate types
DO $$ 
BEGIN
  -- Check if columns exist and add them if they don't
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'status') THEN
    ALTER TABLE transactions ADD COLUMN status TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'payment_method') THEN
    ALTER TABLE transactions ADD COLUMN payment_method TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'notes') THEN
    ALTER TABLE transactions ADD COLUMN notes TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'transactions' AND column_name = 'reference') THEN
    ALTER TABLE transactions ADD COLUMN reference TEXT;
  END IF;
  
  -- Make sure numeric columns have the right type
  ALTER TABLE transactions 
    ALTER COLUMN amount TYPE NUMERIC USING amount::NUMERIC,
    ALTER COLUMN total_amount TYPE NUMERIC USING total_amount::NUMERIC,
    ALTER COLUMN tds_rate TYPE NUMERIC USING tds_rate::NUMERIC,
    ALTER COLUMN tds_amount TYPE NUMERIC USING tds_amount::NUMERIC,
    ALTER COLUMN agency_fees_rate TYPE NUMERIC USING agency_fees_rate::NUMERIC,
    ALTER COLUMN agency_fees_amount TYPE NUMERIC USING agency_fees_amount::NUMERIC;
    
EXCEPTION WHEN OTHERS THEN
  -- Ignore errors if columns don't exist or can't be converted
  RAISE NOTICE 'Error adjusting column types: %', SQLERRM;
END $$;