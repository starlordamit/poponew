-- Create a super admin user if none exists
DO $$
BEGIN
    -- Check if there are any admin users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE raw_app_meta_data->>'role' = 'admin') THEN
        -- Create admin user
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'admin@example.com',
            crypt('Admin123!', gen_salt('bf')),
            now(),
            '{"role":"admin"}'::jsonb,
            '{"name":"Super Admin"}'::jsonb,
            now(),
            now()
        )
        ON CONFLICT (email) DO NOTHING;
        
        -- Get the user ID of the admin we just created (or that already exists)
        WITH admin_user AS (
            SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1
        )
        INSERT INTO public.users_management (id, email, name, role, status, permissions, created_at)
        SELECT 
            id, 
            'admin@example.com', 
            'Super Admin', 
            'admin', 
            'active', 
            ARRAY[
                'manage_brands',
                'manage_influencers',
                'manage_campaigns',
                'manage_finances',
                'view_finances',
                'process_payments',
                'view_brand_price',
                'edit_deliverables',
                'view_analytics',
                'admin_settings'
            ]::text[], 
            now()
        FROM admin_user
        ON CONFLICT (id) DO NOTHING;
        
        -- Also add to user_roles table
        WITH admin_user AS (
            SELECT id FROM auth.users WHERE email = 'admin@example.com' LIMIT 1
        )
        INSERT INTO public.user_roles (user_id, role, permissions, is_super_admin, created_at)
        SELECT 
            id, 
            'admin', 
            ARRAY[
                'manage_brands',
                'manage_influencers',
                'manage_campaigns',
                'manage_finances',
                'view_finances',
                'process_payments',
                'view_brand_price',
                'edit_deliverables',
                'view_analytics',
                'admin_settings'
            ]::text[], 
            true, 
            now()
        FROM admin_user
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
END
$$;