ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS permissions jsonb DEFAULT '[]'::jsonb;

-- Skip adding to realtime since it's already a member
-- alter publication supabase_realtime add table user_roles;
