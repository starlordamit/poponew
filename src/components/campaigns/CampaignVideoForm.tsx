import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Calendar, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CampaignVideo, Influencer, Brand, Campaign } from "@/types/schema";
import { useData } from "@/context/DataContext";
import SearchableSelect from "./SearchableSelect";
import ReimbursementItem, { Reimbursement } from "./ReimbursementItem";
import DeliverablesForm, { DeliverableItem } from "./DeliverablesForm";

interface CampaignVideoFormProps {
  mode: "create" | "edit";
}

const CampaignVideoForm = ({ mode }: CampaignVideoFormProps) => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { influencers, brands, campaigns } = useData();

  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [video, setVideo] = useState<CampaignVideo | null>(null);
  const [brandPOCs, setBrandPOCs] = useState<any[]>([]);
  const [selectedInfluencer, setSelectedInfluencer] =
    useState<Influencer | null>(null);
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>([]);
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>([]);

  // Form state
  const [showAdvancedLinks, setShowAdvancedLinks] = useState(false);
  const [additionalLinksArray, setAdditionalLinksArray] = useState<
    { platform: string; url: string }[]
  >([]);

  const [formData, setFormData] = useState({
    profile_id: "",
    video_url: "",
    additional_links: "", // Will be converted to JSON
    creator_price: "",
    live_date: "",
    brand_id: "",
    brand_poc: "",
    campaign: "",
    status: "draft",
    platform: "",
  });

  // Check for query parameters (for pre-filling campaign)
  useEffect(() => {
    if (mode === "create") {
      const params = new URLSearchParams(window.location.search);
      const campaignId = params.get("campaign");
      if (campaignId) {
        setFormData((prev) => ({ ...prev, campaign: campaignId }));
      }
    }
  }, [mode]);

  // Initialize additional links array from existing data
  useEffect(() => {
    if (video?.additional_links && typeof video.additional_links === "object") {
      const links: { platform: string; url: string }[] = [];

      Object.entries(video.additional_links).forEach(([key, value]) => {
        // Skip reimbursements as they're handled separately
        if (key !== "reimbursements" && typeof value === "string") {
          links.push({
            platform: key,
            url: value,
          });
        }
      });

      if (links.length > 0) {
        setAdditionalLinksArray(links);
      }
    }
  }, [video]);

  // Fetch video data if in edit mode
  useEffect(() => {
    const fetchVideo = async () => {
      if (mode !== "edit" || !id) {
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching video with ID:", id);
        const { data, error } = await supabase
          .from("campaign_videos")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Supabase error:", error);
          throw error;
        }

        console.log("Video data received:", data);
        setVideo(data as CampaignVideo);

        // Find the influencer
        const influencer = influencers.find(
          (inf) => inf.id === data.profile_id,
        );
        setSelectedInfluencer(influencer || null);

        // Set platform based on influencer
        const platform = influencer?.social_platform || "";

        // Parse deliverables if they exist
        let parsedDeliverables: DeliverableItem[] = [];
        if (data.deliverables) {
          try {
            parsedDeliverables =
              typeof data.deliverables === "string"
                ? JSON.parse(data.deliverables)
                : Array.isArray(data.deliverables)
                  ? data.deliverables
                  : [];
          } catch (e) {
            console.error("Error parsing deliverables:", e);
            // If parsing fails, create a single deliverable with the text
            parsedDeliverables = [
              {
                id: Date.now().toString(),
                type: "Custom",
                quantity: 1,
                notes:
                  typeof data.deliverables === "string"
                    ? data.deliverables
                    : "",
              },
            ];
          }
        }
        setDeliverables(parsedDeliverables);

        // Parse reimbursements if they exist
        let parsedReimbursements: Reimbursement[] = [];
        if (data.additional_links && data.additional_links.reimbursements) {
          try {
            parsedReimbursements = data.additional_links.reimbursements;
          } catch (e) {
            console.error("Error parsing reimbursements:", e);
          }
        }
        setReimbursements(parsedReimbursements);

        // Fetch brand POCs if brand is selected
        if (data.brand_id) {
          fetchBrandPOCs(data.brand_id);
        }

        setFormData({
          profile_id: data.profile_id || "",
          video_url: data.video_url || "",
          additional_links:
            data.additional_links && !data.additional_links.reimbursements
              ? JSON.stringify(data.additional_links)
              : "",
          creator_price: data.creator_price?.toString() || "",
          live_date: data.live_date
            ? new Date(data.live_date).toISOString().split("T")[0]
            : "",
          brand_id: data.brand_id || "",
          brand_poc: data.brand_poc || "",
          campaign: data.campaign || "",
          status: data.status || "draft",
          platform: platform,
        });
      } catch (err) {
        console.error("Error fetching video:", err);
        toast({
          title: "Error",
          description: "Failed to load video data. Please try again.",
          variant: "destructive",
        });
        navigate("/campaigns");
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, mode, navigate, toast, influencers]);

  // Fetch brand POCs when brand is selected
  const fetchBrandPOCs = async (brandId: string) => {
    if (!brandId) {
      setBrandPOCs([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("brand_pocs")
        .select("*")
        .eq("brand_id", brandId);

      if (error) throw error;
      setBrandPOCs(data || []);
    } catch (err) {
      console.error("Error fetching brand POCs:", err);
      setBrandPOCs([]);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Additional actions based on field
    if (name === "brand_id") {
      fetchBrandPOCs(value);
      // Reset brand POC when brand changes
      setFormData((prev) => ({ ...prev, brand_poc: "" }));
    }
  };

  // Handle influencer selection with platform update
  const handleInfluencerSelect = (value: string, influencer?: any) => {
    setFormData((prev) => ({
      ...prev,
      profile_id: value,
      platform: influencer?.social_platform || "",
    }));

    setSelectedInfluencer(influencer || null);
  };

  // Handle reimbursements
  const addReimbursement = () => {
    const newReimbursement = {
      id: Date.now().toString(),
      description: "",
      amount: "",
    };
    setReimbursements([...reimbursements, newReimbursement]);
  };

  const updateReimbursement = (id: string, field: string, value: string) => {
    setReimbursements(
      reimbursements.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const removeReimbursement = (id: string) => {
    setReimbursements(reimbursements.filter((item) => item.id !== id));
  };

  // Calculate total reimbursement amount
  const totalReimbursement = reimbursements.reduce((sum, item) => {
    const amount = parseFloat(item.amount) || 0;
    return sum + amount;
  }, 0);

  // Handle deliverables
  const handleDeliverablesChange = (updatedDeliverables: DeliverableItem[]) => {
    setDeliverables(updatedDeliverables);

    // Check if all deliverables are completed and update status to "live" if needed
    if (
      updatedDeliverables.length > 0 &&
      updatedDeliverables.every((d) => d.completed)
    ) {
      if (formData.status !== "live" && formData.status !== "completed") {
        setFormData((prev) => ({ ...prev, status: "live" }));
        toast({
          title: "Status Updated",
          description:
            "All deliverables are completed. Status changed to Live.",
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate required fields
      if (!formData.profile_id || !formData.video_url) {
        toast({
          title: "Validation Error",
          description: "Influencer and video URL are required fields.",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      // Parse additional links if provided
      let additionalLinks: any = {};

      // First try to use the structured links from the UI
      if (additionalLinksArray.length > 0) {
        additionalLinksArray.forEach((link) => {
          if (link.platform && link.url) {
            additionalLinks[link.platform] = link.url;
          }
        });
      }
      // If advanced editor is used, try to parse that JSON
      else if (formData.additional_links) {
        try {
          additionalLinks = JSON.parse(formData.additional_links);
        } catch (err) {
          toast({
            title: "Validation Error",
            description: "Additional links must be valid JSON.",
            variant: "destructive",
          });
          setSaving(false);
          return;
        }
      }

      // Add reimbursements to additional links
      if (reimbursements.length > 0) {
        additionalLinks.reimbursements = reimbursements;
      }

      // Prepare data for submission
      const videoData = {
        profile_id: formData.profile_id,
        video_url: formData.video_url,
        additional_links: additionalLinks,
        creator_price: formData.creator_price
          ? parseFloat(formData.creator_price)
          : null,
        live_date: formData.live_date || null,
        deliverables:
          deliverables.length > 0 ? JSON.stringify(deliverables) : null,
        brand_id: formData.brand_id || null,
        brand_poc: formData.brand_poc || null,
        campaign: formData.campaign || null,
        status: formData.status,
        is_deleted: false,
      };

      let result;
      if (mode === "create") {
        // Create new video
        result = await supabase
          .from("campaign_videos")
          .insert([
            {
              ...videoData,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();
      } else {
        // Update existing video
        if (!id) throw new Error("Video ID is required for updates");

        // Get current video data for edit history
        const currentVideo = video;

        // Prepare edit history entry
        let editHistory = currentVideo?.edit_history || [];
        if (!Array.isArray(editHistory)) editHistory = [];

        const historyEntry = {
          timestamp: new Date().toISOString(),
          user_id: (await supabase.auth.getUser()).data.user?.id,
          previous_data: {
            video_url: currentVideo?.video_url,
            creator_price: currentVideo?.creator_price,
            status: currentVideo?.status,
          },
        };

        editHistory.push(historyEntry);

        result = await supabase
          .from("campaign_videos")
          .update({
            ...videoData,
            edit_history: editHistory,
            updated_by: (await supabase.auth.getUser()).data.user?.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: mode === "create" ? "Video Created" : "Video Updated",
        description:
          mode === "create"
            ? "Campaign video has been created successfully."
            : "Campaign video has been updated successfully.",
      });

      // Navigate back to the campaign videos list with success message
      navigate("/campaigns", {
        state: {
          success: true,
          title: mode === "create" ? "Video Created" : "Video Updated",
          message:
            mode === "create"
              ? "Campaign video has been created successfully."
              : "Campaign video has been updated successfully.",
        },
      });
    } catch (err) {
      console.error("Error saving video:", err);
      toast({
        title: "Error",
        description: `Failed to ${mode === "create" ? "create" : "update"} campaign video. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/campaigns")}
          className="mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold">
          {mode === "create" ? "Add Video" : "Edit Video"}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Video Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Influencer Selection - Searchable */}
              <div className="space-y-2">
                <Label htmlFor="profile_id">Influencer*</Label>
                <SearchableSelect
                  options={influencers.map((inf) => ({
                    value: inf.id,
                    label: inf.name,
                    social_platform: inf.social_platform,
                  }))}
                  value={formData.profile_id}
                  onChange={handleInfluencerSelect}
                  placeholder="Type to search influencers"
                  emptyMessage="Type at least one letter to search"
                />
                {formData.platform && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Platform: {formData.platform}
                  </div>
                )}
              </div>

              {/* Video URL */}
              <div className="space-y-2">
                <Label htmlFor="video_url">Video URL*</Label>
                <Input
                  id="video_url"
                  name="video_url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.video_url}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Brand Selection - Searchable */}
              <div className="space-y-2">
                <Label htmlFor="brand_id">Brand</Label>
                <SearchableSelect
                  options={[
                    { value: "none", label: "None" },
                    ...brands.map((brand) => ({
                      value: brand.id,
                      label: brand.name,
                    })),
                  ]}
                  value={formData.brand_id}
                  onChange={(value) =>
                    handleSelectChange(
                      "brand_id",
                      value === "none" ? "" : value,
                    )
                  }
                  placeholder="Type to search brands"
                  emptyMessage="Type at least one letter to search"
                />
              </div>

              {/* Brand POC Selection - Only shown when brand is selected */}
              {formData.brand_id && (
                <div className="space-y-2">
                  <Label htmlFor="brand_poc">Brand Contact</Label>
                  <Select
                    value={formData.brand_poc}
                    onValueChange={(value) =>
                      handleSelectChange("brand_poc", value)
                    }
                  >
                    <SelectTrigger id="brand_poc">
                      <SelectValue placeholder="Select a contact" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {brandPOCs.map((poc) => (
                        <SelectItem key={poc.id} value={poc.id}>
                          {poc.name} {poc.is_primary ? "(Primary)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Campaign Selection */}
              <div className="space-y-2">
                <Label htmlFor="campaign">Campaign</Label>
                <Select
                  value={formData.campaign}
                  onValueChange={(value) =>
                    handleSelectChange("campaign", value)
                  }
                >
                  <SelectTrigger id="campaign">
                    <SelectValue placeholder="Select a campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Creator Price */}
              <div className="space-y-2">
                <Label htmlFor="creator_price">Creator Price</Label>
                <Input
                  id="creator_price"
                  name="creator_price"
                  type="number"
                  placeholder="0.00"
                  value={formData.creator_price}
                  onChange={handleInputChange}
                />
              </div>

              {/* Live Date */}
              <div className="space-y-2">
                <Label htmlFor="live_date">Live Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="live_date"
                    name="live_date"
                    type="date"
                    className="pl-10"
                    value={formData.live_date}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="live">Live</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Deliverables - Platform specific */}
            {formData.platform && (
              <div className="space-y-2 border-t pt-4 mt-4">
                <Label className="text-lg font-medium">Deliverables</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Add deliverables based on {formData.platform} platform
                  requirements
                </p>
                <DeliverablesForm
                  platform={formData.platform}
                  deliverables={deliverables}
                  onChange={handleDeliverablesChange}
                />
              </div>
            )}

            {/* Reimbursements */}
            <div className="space-y-2 border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-medium">Reimbursements</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addReimbursement}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Reimbursement
                </Button>
              </div>

              {reimbursements.length > 0 ? (
                <div className="space-y-3 mt-4">
                  {reimbursements.map((item) => (
                    <ReimbursementItem
                      key={item.id}
                      item={item}
                      onChange={updateReimbursement}
                      onRemove={removeReimbursement}
                    />
                  ))}

                  <div className="flex justify-end mt-2 text-sm font-medium">
                    Total Reimbursements: ₹{totalReimbursement.toFixed(2)}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">
                  Add reimbursements for travel, props, or other expenses
                </p>
              )}
            </div>

            {/* Additional Links */}
            <div className="space-y-4 border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-medium">Additional Links</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newLinks = [
                      ...additionalLinksArray,
                      { platform: "", url: "" },
                    ];
                    setAdditionalLinksArray(newLinks);
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" /> Add Link
                </Button>
              </div>

              {additionalLinksArray.length > 0 ? (
                <div className="space-y-3">
                  {additionalLinksArray.map((link, index) => (
                    <div
                      key={index}
                      className="flex items-end gap-2 p-3 border rounded-md bg-muted/10"
                    >
                      <div className="flex-1 space-y-1">
                        <Label
                          htmlFor={`platform-${index}`}
                          className="text-xs"
                        >
                          Platform
                        </Label>
                        <Input
                          id={`platform-${index}`}
                          value={link.platform}
                          onChange={(e) => {
                            const newLinks = [...additionalLinksArray];
                            newLinks[index].platform = e.target.value;
                            setAdditionalLinksArray(newLinks);
                          }}
                          placeholder="e.g. instagram, tiktok"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <Label htmlFor={`url-${index}`} className="text-xs">
                          URL
                        </Label>
                        <Input
                          id={`url-${index}`}
                          value={link.url}
                          onChange={(e) => {
                            const newLinks = [...additionalLinksArray];
                            newLinks[index].url = e.target.value;
                            setAdditionalLinksArray(newLinks);
                          }}
                          placeholder="https://example.com/..."
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          const newLinks = [...additionalLinksArray];
                          newLinks.splice(index, 1);
                          setAdditionalLinksArray(newLinks);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-2">
                  Add links to related content on other platforms
                </p>
              )}

              {/* Advanced JSON editor (hidden by default) */}
              {showAdvancedLinks && (
                <div className="mt-4">
                  <Label htmlFor="additional_links">
                    Advanced: JSON Format
                  </Label>
                  <Textarea
                    id="additional_links"
                    name="additional_links"
                    placeholder='{"instagram": "https://instagram.com/...", "tiktok": "https://tiktok.com/..."'
                    value={formData.additional_links}
                    onChange={handleInputChange}
                    className="min-h-[100px]"
                  />
                </div>
              )}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedLinks(!showAdvancedLinks)}
                className="text-xs"
              >
                {showAdvancedLinks
                  ? "Hide Advanced Editor"
                  : "Show Advanced Editor"}
              </Button>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/campaigns")}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>{mode === "create" ? "Create" : "Update"} Video</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignVideoForm;
