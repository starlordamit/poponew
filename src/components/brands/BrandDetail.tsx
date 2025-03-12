import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Building2,
  ExternalLink,
  Edit,
  BarChart3,
  Users,
  Video,
  Plus,
  Trash2,
  Phone,
  Mail,
  Briefcase,
  Loader2,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { Brand, BrandPOC } from "@/types/schema";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

interface BrandDetailProps {
  id: string;
}

const BrandDetail = ({ id }: BrandDetailProps) => {
  const { toast } = useToast();
  const {
    brands,
    loadingBrands,
    updateBrand,
    addBrandPOC,
    updateBrandPOC,
    deleteBrandPOC,
    getBrandPOCs,
  } = useData();

  const [brand, setBrand] = useState<Brand | null>(null);
  const [brandPOCs, setBrandPOCs] = useState<BrandPOC[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditBrandOpen, setIsEditBrandOpen] = useState(false);
  const [isAddPOCOpen, setIsAddPOCOpen] = useState(false);
  const [isEditPOCOpen, setIsEditPOCOpen] = useState(false);
  const [isDeletePOCOpen, setIsDeletePOCOpen] = useState(false);
  const [selectedPOC, setSelectedPOC] = useState<BrandPOC | null>(null);

  // Form states
  const [brandForm, setBrandForm] = useState({
    name: "",
    industry: "",
    description: "",
    website: "",
    logo_url: "",
  });

  const [pocForm, setPocForm] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    is_primary: false,
  });

  // Load brand data
  useEffect(() => {
    if (brands.length > 0 && id) {
      const foundBrand = brands.find((b) => b.id === id);
      if (foundBrand) {
        setBrand(foundBrand);
        setBrandForm({
          name: foundBrand.name,
          industry: foundBrand.industry || "",
          description: foundBrand.description || "",
          website: foundBrand.website || "",
          logo_url: foundBrand.logo_url || "",
        });
      }
    }
  }, [brands, id]);

  // Load POCs
  useEffect(() => {
    const loadPOCs = async () => {
      if (id) {
        setLoading(true);
        const pocs = await getBrandPOCs(id);
        setBrandPOCs(pocs);
        setLoading(false);
      }
    };

    loadPOCs();
  }, [id, getBrandPOCs]);

  // Reset POC form when dialog opens
  useEffect(() => {
    if (isAddPOCOpen) {
      setPocForm({
        name: "",
        email: "",
        phone: "",
        position: "",
        is_primary: false,
      });
    }
  }, [isAddPOCOpen]);

  // Set POC form data when editing
  useEffect(() => {
    if (selectedPOC && isEditPOCOpen) {
      setPocForm({
        name: selectedPOC.name,
        email: selectedPOC.email || "",
        phone: selectedPOC.phone || "",
        position: selectedPOC.position || "",
        is_primary: selectedPOC.is_primary,
      });
    }
  }, [selectedPOC, isEditPOCOpen]);

  const handleBrandInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setBrandForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePOCInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPocForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePOCPrimaryChange = (checked: boolean) => {
    setPocForm((prev) => ({ ...prev, is_primary: checked }));
  };

  const handleUpdateBrand = async () => {
    if (!brand) return;

    try {
      const result = await updateBrand(brand.id, {
        name: brandForm.name,
        industry: brandForm.industry,
        description: brandForm.description,
        website: brandForm.website,
        logo_url: brandForm.logo_url,
      });

      if (result) {
        toast({
          title: "Brand updated",
          description: `${brandForm.name} has been updated successfully.`,
        });
        setIsEditBrandOpen(false);
        setBrand(result);
      }
    } catch (error) {
      console.error("Error updating brand:", error);
      toast({
        title: "Error",
        description: "Failed to update brand. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddPOC = async () => {
    if (!brand) return;

    try {
      // If this is the first POC or marked as primary, ensure it's primary
      const isPrimary = pocForm.is_primary || brandPOCs.length === 0;

      // If this is going to be primary, update any existing primary POC
      if (isPrimary && brandPOCs.some((poc) => poc.is_primary)) {
        const primaryPOC = brandPOCs.find((poc) => poc.is_primary);
        if (primaryPOC) {
          await updateBrandPOC(primaryPOC.id, { is_primary: false });
        }
      }

      const result = await addBrandPOC({
        brand_id: brand.id,
        name: pocForm.name,
        email: pocForm.email,
        phone: pocForm.phone,
        position: pocForm.position,
        is_primary: isPrimary,
      });

      if (result) {
        toast({
          title: "Contact added",
          description: `${pocForm.name} has been added as a contact.`,
        });
        setIsAddPOCOpen(false);

        // Refresh POCs
        const updatedPOCs = await getBrandPOCs(brand.id);
        setBrandPOCs(updatedPOCs);
      }
    } catch (error) {
      console.error("Error adding POC:", error);
      toast({
        title: "Error",
        description: "Failed to add contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePOC = async () => {
    if (!selectedPOC) return;

    try {
      // If this POC is being set as primary, update any existing primary POC
      if (pocForm.is_primary && !selectedPOC.is_primary) {
        const primaryPOC = brandPOCs.find(
          (poc) => poc.is_primary && poc.id !== selectedPOC.id,
        );
        if (primaryPOC) {
          await updateBrandPOC(primaryPOC.id, { is_primary: false });
        }
      }

      const result = await updateBrandPOC(selectedPOC.id, {
        name: pocForm.name,
        email: pocForm.email,
        phone: pocForm.phone,
        position: pocForm.position,
        is_primary: pocForm.is_primary,
      });

      if (result) {
        toast({
          title: "Contact updated",
          description: `${pocForm.name} has been updated successfully.`,
        });
        setIsEditPOCOpen(false);
        setSelectedPOC(null);

        // Refresh POCs
        const updatedPOCs = await getBrandPOCs(brand!.id);
        setBrandPOCs(updatedPOCs);
      }
    } catch (error) {
      console.error("Error updating POC:", error);
      toast({
        title: "Error",
        description: "Failed to update contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePOC = async () => {
    if (!selectedPOC) return;

    try {
      const success = await deleteBrandPOC(selectedPOC.id);

      if (success) {
        toast({
          title: "Contact deleted",
          description: `${selectedPOC.name} has been removed.`,
        });
        setIsDeletePOCOpen(false);
        setSelectedPOC(null);

        // Refresh POCs
        const updatedPOCs = await getBrandPOCs(brand!.id);
        setBrandPOCs(updatedPOCs);
      }
    } catch (error) {
      console.error("Error deleting POC:", error);
      toast({
        title: "Error",
        description: "Failed to delete contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Get real data for campaigns and influencers
  const {
    campaigns,
    influencers,
    campaignInfluencers,
    loadingCampaigns,
    loadingInfluencers,
    loadingCampaignInfluencers,
  } = useData();

  // Calculate metrics
  const getBrandMetrics = () => {
    if (!brand)
      return {
        totalReach: "0",
        engagement: "0%",
        conversionRate: "0%",
        roi: "0%",
      };

    // Get campaigns for this brand
    const brandCampaigns = campaigns.filter((c) => c.brand_id === brand.id);
    const brandCampaignIds = brandCampaigns.map((c) => c.id);

    // Get campaign influencers for these campaigns
    const relevantCampaignInfluencers = campaignInfluencers.filter((ci) =>
      brandCampaignIds.includes(ci.campaign_id),
    );

    // Get unique influencers assigned to this brand's campaigns
    const assignedInfluencerIds = new Set(
      relevantCampaignInfluencers.map((ci) => ci.influencer_id),
    );
    const assignedInfluencers = influencers.filter((inf) =>
      assignedInfluencerIds.has(inf.id),
    );

    // Calculate total reach (sum of follower counts)
    const totalFollowers = assignedInfluencers.reduce(
      (sum, inf) => sum + (inf.follower_count || 0),
      0,
    );
    const totalReach =
      totalFollowers >= 1000000
        ? (totalFollowers / 1000000).toFixed(1) + "M"
        : totalFollowers >= 1000
          ? (totalFollowers / 1000).toFixed(1) + "K"
          : totalFollowers.toString();

    // Calculate average engagement rate
    const avgEngagement =
      assignedInfluencers.length > 0
        ? assignedInfluencers.reduce(
            (sum, inf) => sum + (inf.engagement_rate || 0),
            0,
          ) / assignedInfluencers.length
        : 0;

    // For now, use placeholder values for conversion and ROI
    return {
      totalReach,
      engagement: avgEngagement.toFixed(1) + "%",
      conversionRate: "1.8%", // Placeholder
      roi: "320%", // Placeholder
    };
  };

  // Get brand campaigns
  const getBrandCampaigns = () => {
    if (!brand) return [];

    const brandCampaigns = campaigns.filter((c) => c.brand_id === brand.id);

    return brandCampaigns.map((campaign) => {
      // Count influencers for this campaign
      const campaignInfluencerCount = campaignInfluencers.filter(
        (ci) => ci.campaign_id === campaign.id,
      ).length;

      return {
        id: campaign.id,
        name: campaign.name,
        status: campaign.status,
        influencers: campaignInfluencerCount,
      };
    });
  };

  // Get influencers for this brand's campaigns
  const getBrandInfluencers = () => {
    if (!brand) return [];

    // Get campaigns for this brand
    const brandCampaignIds = campaigns
      .filter((c) => c.brand_id === brand.id)
      .map((c) => c.id);

    // Get influencer IDs assigned to these campaigns
    const assignedInfluencerIds = new Set();
    campaignInfluencers.forEach((ci) => {
      if (brandCampaignIds.includes(ci.campaign_id)) {
        assignedInfluencerIds.add(ci.influencer_id);
      }
    });

    // Get influencer details
    return influencers
      .filter((inf) => assignedInfluencerIds.has(inf.id))
      .map((inf) => ({
        id: inf.id,
        name: inf.name,
        platform: inf.social_platform || "Unknown",
        followers: inf.follower_count
          ? inf.follower_count >= 1000000
            ? (inf.follower_count / 1000000).toFixed(1) + "M"
            : (inf.follower_count / 1000).toFixed(1) + "K"
          : "Unknown",
      }));
  };

  const brandMetrics = getBrandMetrics();
  const brandCampaigns = getBrandCampaigns();
  const brandInfluencers = getBrandInfluencers();

  if (
    loadingBrands ||
    loading ||
    loadingCampaigns ||
    loadingInfluencers ||
    loadingCampaignInfluencers
  ) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="text-center py-10">
        <p>Brand not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Edit Brand Dialog */}
      <Dialog open={isEditBrandOpen} onOpenChange={setIsEditBrandOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Brand</DialogTitle>
            <DialogDescription>Update the brand information.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                name="name"
                placeholder="Brand name"
                className="col-span-3"
                value={brandForm.name}
                onChange={handleBrandInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-industry" className="text-right">
                Industry
              </Label>
              <Input
                id="edit-industry"
                name="industry"
                placeholder="e.g. Fashion, Technology"
                className="col-span-3"
                value={brandForm.industry}
                onChange={handleBrandInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-website" className="text-right">
                Website
              </Label>
              <Input
                id="edit-website"
                name="website"
                placeholder="https://example.com"
                className="col-span-3"
                value={brandForm.website}
                onChange={handleBrandInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-logo_url" className="text-right">
                Logo URL
              </Label>
              <Input
                id="edit-logo_url"
                name="logo_url"
                placeholder="https://example.com/logo.png"
                className="col-span-3"
                value={brandForm.logo_url}
                onChange={handleBrandInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="edit-description"
                name="description"
                placeholder="Brief description of the brand"
                className="col-span-3"
                value={brandForm.description}
                onChange={handleBrandInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditBrandOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateBrand}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add POC Dialog */}
      <Dialog open={isAddPOCOpen} onOpenChange={setIsAddPOCOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>
              Add a new point of contact for {brand.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="poc-name" className="text-right">
                Name
              </Label>
              <Input
                id="poc-name"
                name="name"
                placeholder="Contact name"
                className="col-span-3"
                value={pocForm.name}
                onChange={handlePOCInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="poc-email" className="text-right">
                Email
              </Label>
              <Input
                id="poc-email"
                name="email"
                type="email"
                placeholder="contact@example.com"
                className="col-span-3"
                value={pocForm.email}
                onChange={handlePOCInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="poc-phone" className="text-right">
                Phone
              </Label>
              <Input
                id="poc-phone"
                name="phone"
                placeholder="+1 (555) 123-4567"
                className="col-span-3"
                value={pocForm.phone}
                onChange={handlePOCInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="poc-position" className="text-right">
                Position
              </Label>
              <Input
                id="poc-position"
                name="position"
                placeholder="e.g. Marketing Manager"
                className="col-span-3"
                value={pocForm.position}
                onChange={handlePOCInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="poc-primary" className="text-right">
                Primary Contact
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="poc-primary"
                  checked={pocForm.is_primary}
                  onCheckedChange={handlePOCPrimaryChange}
                />
                <Label htmlFor="poc-primary">
                  {pocForm.is_primary ? "Yes" : "No"}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPOCOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPOC}>Add Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit POC Dialog */}
      <Dialog open={isEditPOCOpen} onOpenChange={setIsEditPOCOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogDescription>
              Update contact information for {selectedPOC?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-poc-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-poc-name"
                name="name"
                placeholder="Contact name"
                className="col-span-3"
                value={pocForm.name}
                onChange={handlePOCInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-poc-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-poc-email"
                name="email"
                type="email"
                placeholder="contact@example.com"
                className="col-span-3"
                value={pocForm.email}
                onChange={handlePOCInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-poc-phone" className="text-right">
                Phone
              </Label>
              <Input
                id="edit-poc-phone"
                name="phone"
                placeholder="+1 (555) 123-4567"
                className="col-span-3"
                value={pocForm.phone}
                onChange={handlePOCInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-poc-position" className="text-right">
                Position
              </Label>
              <Input
                id="edit-poc-position"
                name="position"
                placeholder="e.g. Marketing Manager"
                className="col-span-3"
                value={pocForm.position}
                onChange={handlePOCInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-poc-primary" className="text-right">
                Primary Contact
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="edit-poc-primary"
                  checked={pocForm.is_primary}
                  onCheckedChange={handlePOCPrimaryChange}
                />
                <Label htmlFor="edit-poc-primary">
                  {pocForm.is_primary ? "Yes" : "No"}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditPOCOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePOC}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete POC Confirmation Dialog */}
      <Dialog open={isDeletePOCOpen} onOpenChange={setIsDeletePOCOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedPOC?.name} as a contact?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeletePOCOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePOC}>
              Delete Contact
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={brand.logo_url} alt={brand.name} />
            <AvatarFallback>{brand.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{brand.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              {brand.industry && (
                <Badge variant="outline">{brand.industry}</Badge>
              )}
              {brand.website && (
                <a
                  href={brand.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center"
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Website
                </a>
              )}
            </div>
          </div>
        </div>
        <Button onClick={() => setIsEditBrandOpen(true)}>
          <Edit className="mr-2 h-4 w-4" /> Edit Brand
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <p className="text-gray-700">{brand.description}</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brandMetrics.totalReach}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brandMetrics.engagement}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {brandMetrics.conversionRate}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{brandMetrics.roi}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contacts">
            <Users className="h-4 w-4 mr-2" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="campaigns">
            <Video className="h-4 w-4 mr-2" />
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="influencers">
            <Users className="h-4 w-4 mr-2" />
            Influencers
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Points of Contact</h2>
            <Button size="sm" onClick={() => setIsAddPOCOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Contact
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              {brandPOCs.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">
                    No contacts added yet. Add your first contact to get
                    started.
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {brandPOCs.map((poc) => (
                    <div
                      key={poc.id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>{poc.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center">
                            <p className="font-medium">{poc.name}</p>
                            {poc.is_primary && (
                              <Badge className="ml-2 bg-blue-500">
                                Primary
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center mt-1 text-sm text-muted-foreground">
                            {poc.position && (
                              <span className="flex items-center">
                                <Briefcase className="h-3 w-3 mr-1" />
                                {poc.position}
                              </span>
                            )}
                            {poc.position && (poc.email || poc.phone) && (
                              <span className="mx-2">•</span>
                            )}
                            {poc.email && (
                              <span className="flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {poc.email}
                              </span>
                            )}
                            {poc.email && poc.phone && (
                              <span className="mx-2">•</span>
                            )}
                            {poc.phone && (
                              <span className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {poc.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPOC(poc);
                            setIsEditPOCOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedPOC(poc);
                            setIsDeletePOCOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Campaigns</h2>
            <Button size="sm">
              <Video className="mr-2 h-4 w-4" /> New Campaign
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {brandCampaigns.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-muted-foreground">
                      No campaigns found for this brand.
                    </p>
                  </div>
                ) : (
                  brandCampaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <div className="flex items-center mt-1">
                          <Badge
                            className={`${campaign.status === "active" ? "bg-green-500" : "bg-yellow-500"} text-white mr-2`}
                          >
                            {campaign.status.charAt(0).toUpperCase() +
                              campaign.status.slice(1)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {campaign.influencers} influencers
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="influencers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Influencers</h2>
            <Button size="sm">
              <Users className="mr-2 h-4 w-4" /> Assign Influencer
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {brandInfluencers.length === 0 ? (
                  <div className="p-6 text-center">
                    <p className="text-muted-foreground">
                      No influencers assigned to this brand's campaigns.
                    </p>
                  </div>
                ) : (
                  brandInfluencers.map((influencer) => (
                    <div
                      key={influencer.id}
                      className="p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {influencer.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{influencer.name}</p>
                          <div className="flex items-center mt-1">
                            <span className="text-sm text-muted-foreground">
                              {influencer.platform}
                            </span>
                            <span className="text-sm text-muted-foreground mx-2">
                              •
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {influencer.followers} followers
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Profile
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">
                  Analytics charts will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BrandDetail;
