export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  created_at: string;
  updated_at: string;
}

export interface BrandPOC {
  id: string;
  brand_id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface Influencer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  profile_picture?: string;
  social_platform?: string;
  social_handle?: string;
  follower_count?: number;
  engagement_rate?: number;
  content_category?: string;
  linked_profiles?: string;
  genre?: string;
  location?: string;
  languages?: string;
  is_exclusive?: boolean;
  is_bank_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export interface InfluencerBankAccount {
  id: string;
  influencer_id: string;
  account_name?: string;
  account_number: string;
  ifsc_code: string;
  bank_name: string;
  branch_name?: string;
  pan_number?: string;
  gst_number?: string;
  is_primary: boolean;
  is_verified: boolean;
  is_shared?: boolean;
  is_pan_verified?: boolean;
  is_gst_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export interface InfluencerSharedAccount {
  id: string;
  bank_account_id: string;
  influencer_id: string;
  created_at: string;
}

export interface Campaign {
  id: string;
  brand_id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  status: "draft" | "active" | "paused" | "completed";
  created_at: string;
  updated_at: string;
}

export interface CampaignInfluencer {
  id: string;
  campaign_id: string;
  influencer_id: string;
  status: "pending" | "accepted" | "declined" | "completed";
  payment_amount?: number;
  payment_status: "unpaid" | "processing" | "paid";
  content_url?: string;
  content_approval_status: "pending" | "approved" | "rejected";
  performance_metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    clicks?: number;
    conversions?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: "admin" | "brand_manager" | "finance";
  created_at: string;
  updated_at: string;
}

export interface CampaignVideo {
  id: string;
  profile_id: string;
  video_url: string;
  additional_links?: Record<string, any>;
  brand_price?: number;
  creator_price?: number;
  live_date?: string;
  deliverables?: string;
  brand_id?: string;
  brand_poc?: string;
  campaign?: string;
  status: string;
  created_by?: string;
  updated_by?: string;
  edit_history?: Record<string, any>;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}
