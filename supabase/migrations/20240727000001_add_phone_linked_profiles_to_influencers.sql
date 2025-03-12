-- Add phone and linked_profiles columns to influencers table
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE influencers ADD COLUMN IF NOT EXISTS linked_profiles TEXT;

-- Enable realtime for influencers table if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'influencers'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE influencers;
  END IF;
END
$$;
