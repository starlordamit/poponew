-- Create direct assignments table for brand-influencer assignments
CREATE TABLE IF NOT EXISTS direct_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  brand_id UUID NOT NULL REFERENCES brands(id),
  influencer_id UUID NOT NULL REFERENCES influencers(id),
  campaign_id UUID REFERENCES campaigns(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  message TEXT,
  compensation DECIMAL(10, 2),
  response_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Add RLS policies for direct_assignments
ALTER TABLE direct_assignments ENABLE ROW LEVEL SECURITY;

-- Admin can do everything
CREATE POLICY "Admins have full access to direct_assignments"
  ON direct_assignments
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  ));

-- Brand managers can see assignments for their brands
CREATE POLICY "Brand managers can view their brand assignments"
  ON direct_assignments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() 
    AND role = 'brand_manager'
    AND EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = direct_assignments.brand_id
    )
  ));

-- Brand managers can create and update assignments for their brands
CREATE POLICY "Brand managers can create assignments for their brands"
  ON direct_assignments FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() 
    AND role = 'brand_manager'
  ));

CREATE POLICY "Brand managers can update assignments for their brands"
  ON direct_assignments FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() 
    AND role = 'brand_manager'
    AND EXISTS (
      SELECT 1 FROM brands
      WHERE brands.id = direct_assignments.brand_id
    )
  ));

-- Influencer managers can view all assignments
CREATE POLICY "Influencer managers can view all assignments"
  ON direct_assignments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() 
    AND role = 'influencer_manager'
  ));

-- Add realtime support
ALTER PUBLICATION supabase_realtime ADD TABLE direct_assignments;
