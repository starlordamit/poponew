-- Create a function to sync bank accounts when profiles are linked
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
  IF OLD.linked_profiles = NEW.linked_profiles THEN
    RETURN NEW;
  END IF;
  
  -- Parse the old and new linked_profiles strings into arrays
  old_linked_ids := string_to_array(COALESCE(OLD.linked_profiles, ''), ',');
  new_linked_ids := string_to_array(COALESCE(NEW.linked_profiles, ''), ',');
  
  -- Find newly added linked profiles
  SELECT array_agg(id) INTO added_ids
  FROM unnest(new_linked_ids) AS id
  WHERE id <> ALL(old_linked_ids);
  
  -- If there are new links, sync bank accounts
  IF array_length(added_ids, 1) > 0 THEN
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

-- Create trigger to run the function when linked_profiles is updated
DROP TRIGGER IF EXISTS trigger_sync_bank_accounts ON influencers;
CREATE TRIGGER trigger_sync_bank_accounts
AFTER UPDATE OF linked_profiles ON influencers
FOR EACH ROW
EXECUTE FUNCTION sync_bank_accounts_on_profile_link();

-- Create a function to sync exclusive status between linked profiles
CREATE OR REPLACE FUNCTION sync_exclusive_status()
RETURNS TRIGGER AS $$
DECLARE
  linked_id TEXT;
  linked_ids TEXT[];
BEGIN
  -- Skip if exclusive status didn't change
  IF OLD.is_exclusive = NEW.is_exclusive THEN
    RETURN NEW;
  END IF;
  
  -- Only sync if setting to exclusive (TRUE)
  IF NEW.is_exclusive = TRUE THEN
    -- Parse the linked_profiles string into an array
    linked_ids := string_to_array(COALESCE(NEW.linked_profiles, ''), ',');
    
    -- Update all linked profiles to be exclusive
    IF array_length(linked_ids, 1) > 0 THEN
      FOREACH linked_id IN ARRAY linked_ids
      LOOP
        UPDATE influencers SET is_exclusive = TRUE 
        WHERE id = linked_id AND is_exclusive = FALSE;
      END LOOP;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run the function when is_exclusive is updated
DROP TRIGGER IF EXISTS trigger_sync_exclusive_status ON influencers;
CREATE TRIGGER trigger_sync_exclusive_status
AFTER UPDATE OF is_exclusive ON influencers
FOR EACH ROW
EXECUTE FUNCTION sync_exclusive_status();
