-- Fix the bank account sharing trigger to handle UUID comparison correctly
CREATE OR REPLACE FUNCTION sync_bank_accounts_on_profile_link()
RETURNS TRIGGER AS $$
DECLARE
  old_linked_ids TEXT[];
  new_linked_ids TEXT[];
  added_ids TEXT[];
  linked_id UUID;
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
  SELECT array_agg(id::UUID) INTO added_ids
  FROM unnest(new_linked_ids) AS id
  WHERE id <> ALL(old_linked_ids) OR old_linked_ids IS NULL;
  
  -- If there are new links, share bank accounts
  IF added_ids IS NOT NULL AND array_length(added_ids, 1) > 0 THEN
    FOREACH linked_id IN ARRAY added_ids
    LOOP
      -- Share current profile's bank accounts with the linked profile
      FOR bank_account IN 
        SELECT * FROM influencer_bank_accounts WHERE influencer_id = NEW.id
      LOOP
        -- Create a shared account record
        INSERT INTO influencer_shared_accounts (bank_account_id, influencer_id)
        VALUES (bank_account.id, linked_id)
        ON CONFLICT (bank_account_id, influencer_id) DO NOTHING;
      END LOOP;
      
      -- Share linked profile's bank accounts with the current profile
      FOR bank_account IN 
        SELECT * FROM influencer_bank_accounts WHERE influencer_id = linked_id
      LOOP
        -- Create a shared account record
        INSERT INTO influencer_shared_accounts (bank_account_id, influencer_id)
        VALUES (bank_account.id, NEW.id)
        ON CONFLICT (bank_account_id, influencer_id) DO NOTHING;
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
  linked_id UUID;
  influencer_record RECORD;
BEGIN
  -- Get the influencer record to access linked_profiles
  SELECT * INTO influencer_record FROM influencers WHERE id = NEW.influencer_id;
  
  -- If this influencer has linked profiles, share the bank account
  IF influencer_record.linked_profiles IS NOT NULL AND influencer_record.linked_profiles != '' THEN
    linked_ids := string_to_array(influencer_record.linked_profiles, ',');
    
    -- Share this bank account with all linked profiles
    FOREACH linked_id IN ARRAY (SELECT array_agg(id::UUID) FROM unnest(linked_ids) AS id)
    LOOP
      -- Create a shared account record
      INSERT INTO influencer_shared_accounts (bank_account_id, influencer_id)
      VALUES (NEW.id, linked_id)
      ON CONFLICT (bank_account_id, influencer_id) DO NOTHING;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
