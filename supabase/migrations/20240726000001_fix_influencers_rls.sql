-- Enable RLS on influencers table
ALTER TABLE influencers ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON influencers;
CREATE POLICY "Allow all operations for authenticated users"
ON influencers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Enable realtime for influencers table
alter publication supabase_realtime add table influencers;
