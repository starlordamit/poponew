-- Drop all user management tables and functions with CASCADE

-- Drop user_roles table with CASCADE to remove dependent objects
DROP TABLE IF EXISTS user_roles CASCADE;

-- Drop invitations table with CASCADE
DROP TABLE IF EXISTS invitations CASCADE;

-- Remove any triggers related to user management
DROP TRIGGER IF EXISTS set_first_user_as_admin ON auth.users;

-- Remove any functions related to user management
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.generate_invitation_token();
