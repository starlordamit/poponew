-- Create campaign videos table
CREATE TABLE IF NOT EXISTS campaign_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES influencers(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  additional_links JSONB,
  brand_price DECIMAL(10, 2),
  creator_price DECIMAL(10, 2),
  live_date TIMESTAMP WITH TIME ZONE,
  deliverables TEXT,
  brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
  brand_poc UUID REFERENCES brand_pocs(id) ON DELETE SET NULL,
  campaign UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  created_by UUID,
  updated_by UUID,
  edit_history JSONB,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_campaign_videos_profile_id ON campaign_videos(profile_id);
CREATE INDEX IF NOT EXISTS idx_campaign_videos_brand_id ON campaign_videos(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaign_videos_campaign ON campaign_videos(campaign);
CREATE INDEX IF NOT EXISTS idx_campaign_videos_status ON campaign_videos(status);

-- Enable row-level security
ALTER TABLE campaign_videos ENABLE ROW LEVEL SECURITY;

-- Create policy for full access
CREATE POLICY "Users can perform all operations on campaign_videos"
ON campaign_videos
FOR ALL
TO authenticated
USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE campaign_videos;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_campaign_videos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update the updated_at timestamp
CREATE TRIGGER update_campaign_videos_updated_at
BEFORE UPDATE ON campaign_videos
FOR EACH ROW
EXECUTE FUNCTION update_campaign_videos_updated_at();
