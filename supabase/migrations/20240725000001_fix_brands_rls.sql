-- Enable RLS on brands table
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for authenticated users
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON brands;
CREATE POLICY "Allow all operations for authenticated users"
ON brands
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
