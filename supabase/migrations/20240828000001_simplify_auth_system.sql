-- Drop all user management related tables
DROP TABLE IF EXISTS user_roles;
DROP TABLE IF EXISTS users_management;
DROP TABLE IF EXISTS invite_codes;
DROP TABLE IF EXISTS invitations;

-- Remove any views related to user management
DROP VIEW IF EXISTS user_roles_view;
DROP VIEW IF EXISTS auth_users;

-- Remove any functions related to user management
DROP FUNCTION IF EXISTS get_user_role;

-- Disable RLS on all tables to simplify access
ALTER TABLE brands DISABLE ROW LEVEL SECURITY;
ALTER TABLE influencers DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_videos DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_bank_accounts DISABLE ROW LEVEL SECURITY;
ALTER TABLE brand_pocs DISABLE ROW LEVEL SECURITY;
ALTER TABLE direct_assignments DISABLE ROW LEVEL SECURITY;
