import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { supabase } from "@/lib/supabase";
import {
  Brand,
  BrandPOC,
  Campaign,
  Influencer,
  CampaignInfluencer,
  UserRole,
} from "@/types/schema";
import { useAuth } from "../../supabase/auth";

interface DataContextType {
  brands: Brand[];
  brandPOCs: BrandPOC[];
  campaigns: Campaign[];
  influencers: Influencer[];
  campaignInfluencers: CampaignInfluencer[];
  userRoles: UserRole[];
  loadingBrands: boolean;
  loadingBrandPOCs: boolean;
  loadingCampaigns: boolean;
  loadingInfluencers: boolean;
  loadingCampaignInfluencers: boolean;
  loadingUserRoles: boolean;
  refetchBrands: () => Promise<void>;
  refetchBrandPOCs: () => Promise<void>;
  refetchCampaigns: () => Promise<void>;
  refetchInfluencers: () => Promise<void>;
  refetchCampaignInfluencers: () => Promise<void>;
  refetchUserRoles: () => Promise<void>;
  addBrand: (
    brand: Omit<Brand, "id" | "created_at" | "updated_at">,
  ) => Promise<Brand | null>;
  updateBrand: (id: string, brand: Partial<Brand>) => Promise<Brand | null>;
  deleteBrand: (id: string) => Promise<boolean>;
  addBrandPOC: (
    brandPOC: Omit<BrandPOC, "id" | "created_at" | "updated_at">,
  ) => Promise<BrandPOC | null>;
  updateBrandPOC: (
    id: string,
    brandPOC: Partial<BrandPOC>,
  ) => Promise<BrandPOC | null>;
  deleteBrandPOC: (id: string) => Promise<boolean>;
  getBrandPOCs: (brandId: string) => Promise<BrandPOC[]>;
  addCampaign: (
    campaign: Omit<Campaign, "id" | "created_at" | "updated_at">,
  ) => Promise<Campaign | null>;
  updateCampaign: (
    id: string,
    campaign: Partial<Campaign>,
  ) => Promise<Campaign | null>;
  deleteCampaign: (id: string) => Promise<boolean>;
  addInfluencer: (
    influencer: Omit<Influencer, "id" | "created_at" | "updated_at">,
  ) => Promise<Influencer | null>;
  updateInfluencer: (
    id: string,
    influencer: Partial<Influencer>,
  ) => Promise<Influencer | null>;
  deleteInfluencer: (id: string) => Promise<boolean>;
  addCampaignInfluencer: (
    campaignInfluencer: Omit<
      CampaignInfluencer,
      "id" | "created_at" | "updated_at"
    >,
  ) => Promise<CampaignInfluencer | null>;
  updateCampaignInfluencer: (
    id: string,
    campaignInfluencer: Partial<CampaignInfluencer>,
  ) => Promise<CampaignInfluencer | null>;
  deleteCampaignInfluencer: (id: string) => Promise<boolean>;
  addUserRole: (
    userRole: Omit<UserRole, "id" | "created_at" | "updated_at">,
  ) => Promise<UserRole | null>;
  updateUserRole: (
    id: string,
    userRole: Partial<UserRole>,
  ) => Promise<UserRole | null>;
  deleteUserRole: (id: string) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandPOCs, setBrandPOCs] = useState<BrandPOC[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [campaignInfluencers, setCampaignInfluencers] = useState<
    CampaignInfluencer[]
  >([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);

  const [loadingBrands, setLoadingBrands] = useState(true);
  const [loadingBrandPOCs, setLoadingBrandPOCs] = useState(true);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);
  const [loadingInfluencers, setLoadingInfluencers] = useState(true);
  const [loadingCampaignInfluencers, setLoadingCampaignInfluencers] =
    useState(true);
  const [loadingUserRoles, setLoadingUserRoles] = useState(true);

  // Fetch initial data
  useEffect(() => {
    if (user) {
      fetchBrands();
      fetchBrandPOCs();
      fetchCampaigns();
      fetchInfluencers();
      fetchCampaignInfluencers();
      fetchUserRoles();
    }
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const brandsSubscription = supabase
      .channel("brands-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "brands" },
        () => {
          fetchBrands();
        },
      )
      .subscribe();

    const brandPOCsSubscription = supabase
      .channel("brand_pocs-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "brand_pocs" },
        () => {
          fetchBrandPOCs();
        },
      )
      .subscribe();

    const campaignsSubscription = supabase
      .channel("campaigns-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "campaigns" },
        () => {
          fetchCampaigns();
        },
      )
      .subscribe();

    const influencersSubscription = supabase
      .channel("influencers-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "influencers" },
        () => {
          fetchInfluencers();
        },
      )
      .subscribe();

    const campaignInfluencersSubscription = supabase
      .channel("campaign_influencers-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "campaign_influencers" },
        () => {
          fetchCampaignInfluencers();
        },
      )
      .subscribe();

    const userRolesSubscription = supabase
      .channel("user_roles-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_roles" },
        () => {
          fetchUserRoles();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(brandsSubscription);
      supabase.removeChannel(brandPOCsSubscription);
      supabase.removeChannel(campaignsSubscription);
      supabase.removeChannel(influencersSubscription);
      supabase.removeChannel(campaignInfluencersSubscription);
      supabase.removeChannel(userRolesSubscription);
    };
  }, [user]);

  // Fetch functions
  const fetchBrands = async () => {
    if (!user) return;
    setLoadingBrands(true);
    try {
      const { data, error } = await supabase.from("brands").select("*");
      if (error) throw error;
      setBrands(data as Brand[]);
    } catch (error) {
      console.error("Error fetching brands:", error);
    } finally {
      setLoadingBrands(false);
    }
  };

  const fetchBrandPOCs = async () => {
    if (!user) return;
    setLoadingBrandPOCs(true);
    try {
      const { data, error } = await supabase.from("brand_pocs").select("*");
      if (error) throw error;
      setBrandPOCs(data as BrandPOC[]);
    } catch (error) {
      console.error("Error fetching brand POCs:", error);
    } finally {
      setLoadingBrandPOCs(false);
    }
  };

  const fetchCampaigns = async () => {
    if (!user) return;
    setLoadingCampaigns(true);
    try {
      const { data, error } = await supabase.from("campaigns").select("*");
      if (error) throw error;
      setCampaigns(data as Campaign[]);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const fetchInfluencers = async () => {
    if (!user) return;
    setLoadingInfluencers(true);
    try {
      const { data, error } = await supabase.from("influencers").select("*");
      if (error) throw error;
      setInfluencers(data as Influencer[]);
    } catch (error) {
      console.error("Error fetching influencers:", error);
    } finally {
      setLoadingInfluencers(false);
    }
  };

  const fetchCampaignInfluencers = async () => {
    if (!user) return;
    setLoadingCampaignInfluencers(true);
    try {
      const { data, error } = await supabase
        .from("campaign_influencers")
        .select("*");
      if (error) throw error;
      setCampaignInfluencers(data as CampaignInfluencer[]);
    } catch (error) {
      console.error("Error fetching campaign influencers:", error);
    } finally {
      setLoadingCampaignInfluencers(false);
    }
  };

  const fetchUserRoles = async () => {
    if (!user) return;
    setLoadingUserRoles(true);
    try {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      setUserRoles(data as UserRole[]);
    } catch (error) {
      console.error("Error fetching user roles:", error);
    } finally {
      setLoadingUserRoles(false);
    }
  };

  // CRUD operations for brands
  const addBrand = async (
    brand: Omit<Brand, "id" | "created_at" | "updated_at">,
  ): Promise<Brand | null> => {
    try {
      console.log("Sending brand data to Supabase:", brand);

      // Make sure all fields are properly formatted for the database
      const brandData = {
        name: brand.name,
        industry: brand.industry || null,
        description: brand.description || null,
        website: brand.website || null,
        logo_url: brand.logo_url || null,
      };

      const { data, error } = await supabase
        .from("brands")
        .insert([brandData])
        .select()
        .single();

      if (error) {
        console.error("Supabase error adding brand:", error);
        throw error;
      }

      console.log("Brand added successfully:", data);
      return data as Brand;
    } catch (error) {
      console.error("Error adding brand:", error);
      return null;
    }
  };

  const updateBrand = async (
    id: string,
    brand: Partial<Brand>,
  ): Promise<Brand | null> => {
    try {
      const { data, error } = await supabase
        .from("brands")
        .update(brand)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Brand;
    } catch (error) {
      console.error("Error updating brand:", error);
      return null;
    }
  };

  const deleteBrand = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("brands").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting brand:", error);
      return false;
    }
  };

  // CRUD operations for brand POCs
  const addBrandPOC = async (
    brandPOC: Omit<BrandPOC, "id" | "created_at" | "updated_at">,
  ): Promise<BrandPOC | null> => {
    try {
      const { data, error } = await supabase
        .from("brand_pocs")
        .insert([brandPOC])
        .select()
        .single();

      if (error) throw error;
      return data as BrandPOC;
    } catch (error) {
      console.error("Error adding brand POC:", error);
      return null;
    }
  };

  const updateBrandPOC = async (
    id: string,
    brandPOC: Partial<BrandPOC>,
  ): Promise<BrandPOC | null> => {
    try {
      const { data, error } = await supabase
        .from("brand_pocs")
        .update(brandPOC)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as BrandPOC;
    } catch (error) {
      console.error("Error updating brand POC:", error);
      return null;
    }
  };

  const deleteBrandPOC = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("brand_pocs").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting brand POC:", error);
      return false;
    }
  };

  const getBrandPOCs = async (brandId: string): Promise<BrandPOC[]> => {
    try {
      const { data, error } = await supabase
        .from("brand_pocs")
        .select("*")
        .eq("brand_id", brandId);

      if (error) throw error;
      return data as BrandPOC[];
    } catch (error) {
      console.error("Error fetching brand POCs:", error);
      return [];
    }
  };

  // CRUD operations for campaigns
  const addCampaign = async (
    campaign: Omit<Campaign, "id" | "created_at" | "updated_at">,
  ): Promise<Campaign | null> => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .insert([campaign])
        .select()
        .single();

      if (error) throw error;
      return data as Campaign;
    } catch (error) {
      console.error("Error adding campaign:", error);
      return null;
    }
  };

  const updateCampaign = async (
    id: string,
    campaign: Partial<Campaign>,
  ): Promise<Campaign | null> => {
    try {
      const { data, error } = await supabase
        .from("campaigns")
        .update(campaign)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Campaign;
    } catch (error) {
      console.error("Error updating campaign:", error);
      return null;
    }
  };

  const deleteCampaign = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("campaigns").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting campaign:", error);
      return false;
    }
  };

  // CRUD operations for influencers
  const addInfluencer = async (
    influencer: Omit<Influencer, "id" | "created_at" | "updated_at">,
  ): Promise<Influencer | null> => {
    try {
      const { data, error } = await supabase
        .from("influencers")
        .insert([influencer])
        .select()
        .single();

      if (error) throw error;
      return data as Influencer;
    } catch (error) {
      console.error("Error adding influencer:", error);
      return null;
    }
  };

  const updateInfluencer = async (
    id: string,
    influencer: Partial<Influencer>,
  ): Promise<Influencer | null> => {
    try {
      const { data, error } = await supabase
        .from("influencers")
        .update(influencer)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as Influencer;
    } catch (error) {
      console.error("Error updating influencer:", error);
      return null;
    }
  };

  const deleteInfluencer = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("influencers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting influencer:", error);
      return false;
    }
  };

  // CRUD operations for campaign influencers
  const addCampaignInfluencer = async (
    campaignInfluencer: Omit<
      CampaignInfluencer,
      "id" | "created_at" | "updated_at"
    >,
  ): Promise<CampaignInfluencer | null> => {
    try {
      const { data, error } = await supabase
        .from("campaign_influencers")
        .insert([campaignInfluencer])
        .select()
        .single();

      if (error) throw error;
      return data as CampaignInfluencer;
    } catch (error) {
      console.error("Error adding campaign influencer:", error);
      return null;
    }
  };

  const updateCampaignInfluencer = async (
    id: string,
    campaignInfluencer: Partial<CampaignInfluencer>,
  ): Promise<CampaignInfluencer | null> => {
    try {
      const { data, error } = await supabase
        .from("campaign_influencers")
        .update(campaignInfluencer)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as CampaignInfluencer;
    } catch (error) {
      console.error("Error updating campaign influencer:", error);
      return null;
    }
  };

  const deleteCampaignInfluencer = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("campaign_influencers")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting campaign influencer:", error);
      return false;
    }
  };

  // CRUD operations for user roles
  const addUserRole = async (
    userRole: Omit<UserRole, "id" | "created_at" | "updated_at">,
  ): Promise<UserRole | null> => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .insert([userRole])
        .select()
        .single();

      if (error) throw error;
      return data as UserRole;
    } catch (error) {
      console.error("Error adding user role:", error);
      return null;
    }
  };

  const updateUserRole = async (
    id: string,
    userRole: Partial<UserRole>,
  ): Promise<UserRole | null> => {
    try {
      const { data, error } = await supabase
        .from("user_roles")
        .update(userRole)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as UserRole;
    } catch (error) {
      console.error("Error updating user role:", error);
      return null;
    }
  };

  const deleteUserRole = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase.from("user_roles").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error deleting user role:", error);
      return false;
    }
  };

  const value = {
    brands,
    brandPOCs,
    campaigns,
    influencers,
    campaignInfluencers,
    userRoles,
    loadingBrands,
    loadingBrandPOCs,
    loadingCampaigns,
    loadingInfluencers,
    loadingCampaignInfluencers,
    loadingUserRoles,
    refetchBrands: fetchBrands,
    refetchBrandPOCs: fetchBrandPOCs,
    refetchCampaigns: fetchCampaigns,
    refetchInfluencers: fetchInfluencers,
    refetchCampaignInfluencers: fetchCampaignInfluencers,
    refetchUserRoles: fetchUserRoles,
    addBrand,
    updateBrand,
    deleteBrand,
    addBrandPOC,
    updateBrandPOC,
    deleteBrandPOC,
    getBrandPOCs,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    addInfluencer,
    updateInfluencer,
    deleteInfluencer,
    addCampaignInfluencer,
    updateCampaignInfluencer,
    deleteCampaignInfluencer,
    addUserRole,
    updateUserRole,
    deleteUserRole,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export default DataProvider;
