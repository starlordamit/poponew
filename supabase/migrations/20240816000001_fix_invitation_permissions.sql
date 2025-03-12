-- Allow any authenticated user to create invitations
DROP POLICY IF EXISTS "Super admins can create invitations" ON invitations;
CREATE POLICY "Any authenticated user can create invitations"
ON invitations FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow any authenticated user to view invitations
DROP POLICY IF EXISTS "Super admins can view all invitations" ON invitations;
CREATE POLICY "Any authenticated user can view invitations"
ON invitations FOR SELECT
TO authenticated
USING (true);

-- Allow any authenticated user to update invitations
DROP POLICY IF EXISTS "Any authenticated user can update invitations" ON invitations;
CREATE POLICY "Any authenticated user can update invitations"
ON invitations FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Make sure RLS is enabled on the invitations table
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
