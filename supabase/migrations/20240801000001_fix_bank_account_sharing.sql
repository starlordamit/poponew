-- Fix the bank account sharing trigger to handle edge cases
CREATE OR REPLACE FUNCTION sync_bank_accounts_on_profile_link()
RETURNS TRIGGER AS $$
DECLARE
  old_linked_ids TEXT[];
  new_linked_ids TEXT[];
  added_ids TEXT[];
  linked_id TEXT;
  bank_account RECORD;
BEGIN
  -- Skip if linked_profiles didn't change
  IF OLD.linked_profiles IS NOT DISTINCT FROM NEW.linked_profiles THEN
    RETURN NEW;
  END IF;
  
  -- Parse the old and new linked_profiles strings into arrays
  old_linked_ids := string_to_array(COALESCE(OLD.linked_profiles, ''), ',');
  new_linked_ids := string_to_array(COALESCE(NEW.linked_profiles, ''), ',');
  
  -- Find newly added linked profiles
  SELECT array_agg(id) INTO added_ids
  FROM unnest(new_linked_ids) AS id
  WHERE id <> ALL(old_linked_ids) OR old_linked_ids IS NULL;
  
  -- If there are new links, sync bank accounts
  IF added_ids IS NOT NULL AND array_length(added_ids, 1) > 0 THEN
    FOREACH linked_id IN ARRAY added_ids
    LOOP
      -- Share current profile's bank accounts with the linked profile
      FOR bank_account IN 
        SELECT * FROM influencer_bank_accounts WHERE influencer_id = NEW.id
      LOOP
        -- Check if this account already exists for the linked profile
        IF NOT EXISTS (
          SELECT 1 FROM influencer_bank_accounts 
          WHERE influencer_id = linked_id 
          AND account_number = bank_account.account_number 
          AND ifsc_code = bank_account.ifsc_code
        ) THEN
          -- Insert the bank account for the linked profile
          INSERT INTO influencer_bank_accounts (
            influencer_id, account_name, account_number, ifsc_code, 
            bank_name, branch_name, is_primary, is_verified
          ) VALUES (
            linked_id, bank_account.account_name, bank_account.account_number, 
            bank_account.ifsc_code, bank_account.bank_name, bank_account.branch_name, 
            FALSE, bank_account.is_verified
          );
        END IF;
      END LOOP;
      
      -- Share linked profile's bank accounts with the current profile
      FOR bank_account IN 
        SELECT * FROM influencer_bank_accounts WHERE influencer_id = linked_id
      LOOP
        -- Check if this account already exists for the current profile
        IF NOT EXISTS (
          SELECT 1 FROM influencer_bank_accounts 
          WHERE influencer_id = NEW.id 
          AND account_number = bank_account.account_number 
          AND ifsc_code = bank_account.ifsc_code
        ) THEN
          -- Insert the bank account for the current profile
          INSERT INTO influencer_bank_accounts (
            influencer_id, account_name, account_number, ifsc_code, 
            bank_name, branch_name, is_primary, is_verified
          ) VALUES (
            NEW.id, bank_account.account_name, bank_account.account_number, 
            bank_account.ifsc_code, bank_account.bank_name, bank_account.branch_name, 
            FALSE, bank_account.is_verified
          );
        END IF;
      END LOOP;
      
      -- Update exclusive status if needed
      IF NEW.is_exclusive = TRUE THEN
        UPDATE influencers SET is_exclusive = TRUE WHERE id = linked_id AND is_exclusive = FALSE;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a function to handle bank account sharing when a new account is added
CREATE OR REPLACE FUNCTION share_bank_account_with_linked_profiles()
RETURNS TRIGGER AS $$
DECLARE
  linked_ids TEXT[];
  linked_id TEXT;
  influencer_record RECORD;
BEGIN
  -- Get the influencer record to access linked_profiles
  SELECT * INTO influencer_record FROM influencers WHERE id = NEW.influencer_id;
  
  -- If this influencer has linked profiles, share the bank account
  IF influencer_record.linked_profiles IS NOT NULL AND influencer_record.linked_profiles != '' THEN
    linked_ids := string_to_array(influencer_record.linked_profiles, ',');
    
    -- Share this bank account with all linked profiles
    FOREACH linked_id IN ARRAY linked_ids
    LOOP
      -- Check if this account already exists for the linked profile
      IF NOT EXISTS (
        SELECT 1 FROM influencer_bank_accounts 
        WHERE influencer_id = linked_id 
        AND account_number = NEW.account_number 
        AND ifsc_code = NEW.ifsc_code
      ) THEN
        -- Insert the bank account for the linked profile
        INSERT INTO influencer_bank_accounts (
          influencer_id, account_name, account_number, ifsc_code, 
          bank_name, branch_name, is_primary, is_verified
        ) VALUES (
          linked_id, NEW.account_name, NEW.account_number, 
          NEW.ifsc_code, NEW.bank_name, NEW.branch_name, 
          FALSE, NEW.is_verified
        );
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run when a new bank account is added
DROP TRIGGER IF EXISTS trigger_share_bank_account ON influencer_bank_accounts;
CREATE TRIGGER trigger_share_bank_account
AFTER INSERT ON influencer_bank_accounts
FOR EACH ROW
EXECUTE FUNCTION share_bank_account_with_linked_profiles();
