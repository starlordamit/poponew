import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Instagram,
  Twitter,
  Youtube,
  Users,
  ExternalLink,
  Edit,
  Phone,
  Mail,
  Link as LinkIcon,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { supabase } from "@/lib/supabase";
import { Influencer } from "@/types/schema";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import BankAccountsList from "./BankAccountsList";
import TransactionHistory from "@/components/finances/TransactionHistory";

const InfluencerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    influencers,
    campaigns,
    campaignInfluencers,
    loadingInfluencers,
    loadingCampaigns,
    loadingCampaignInfluencers,
    updateInfluencer,
    refetchInfluencers,
  } = useData();

  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [relatedInfluencers, setRelatedInfluencers] = useState<Influencer[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLinkProfileOpen, setIsLinkProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Influencer[]>([]);
  const [selectedInfluencerId, setSelectedInfluencerId] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    social_platform: "instagram",
    social_handle: "",
    content_category: "",
    profile_picture: "",
    linked_profiles: "",
    genre: "",
    location: "",
    languages: "",
    is_exclusive: false,
    is_bank_verified: false,
  });

  useEffect(() => {
    if (influencers.length > 0 && id) {
      const foundInfluencer = influencers.find((inf) => inf.id === id);
      if (foundInfluencer) {
        setInfluencer(foundInfluencer);
        setFormData({
          name: foundInfluencer.name,
          email: foundInfluencer.email || "",
          phone: foundInfluencer.phone || "",
          social_platform: foundInfluencer.social_platform || "instagram",
          social_handle: foundInfluencer.social_handle || "",
          content_category: foundInfluencer.content_category || "",
          profile_picture: foundInfluencer.profile_picture || "",
          linked_profiles: foundInfluencer.linked_profiles || "",
          genre: foundInfluencer.genre || "",
          location: foundInfluencer.location || "",
          languages: foundInfluencer.languages || "",
          is_exclusive: foundInfluencer.is_exclusive || false,
          is_bank_verified: foundInfluencer.is_bank_verified || false,
        });

        // Find related influencers if linked_profiles exists
        if (foundInfluencer.linked_profiles) {
          const linkedIds = foundInfluencer.linked_profiles.split(",");
          const related = influencers.filter(
            (inf) => linkedIds.includes(inf.id) && inf.id !== id,
          );
          setRelatedInfluencers(related);
        } else {
          setRelatedInfluencers([]);
        }

        // Initialize search results as empty
        setSearchResults([]);
      }
      setLoading(false);
    }
  }, [influencers, id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // Update linked profiles' exclusive status when this profile's status changes
  useEffect(() => {
    const updateLinkedProfilesExclusivity = async () => {
      if (!influencer || relatedInfluencers.length === 0) return;

      // Only proceed if the exclusive status has changed
      if (influencer.is_exclusive !== formData.is_exclusive) {
        // Update all linked profiles to match this profile's exclusive status
        for (const related of relatedInfluencers) {
          if (related.is_exclusive !== formData.is_exclusive) {
            await updateInfluencer(related.id, {
              is_exclusive: formData.is_exclusive,
            });
          }
        }

        // Refresh the data
        toast({
          title: "Linked profiles updated",
          description: `All linked profiles are now marked as ${formData.is_exclusive ? "exclusive" : "non-exclusive"}`,
        });
        await refetchInfluencers();
      }
    };

    if (isEditOpen) {
      updateLinkedProfilesExclusivity();
    }
  }, [formData.is_exclusive, influencer, relatedInfluencers, isEditOpen]);

  const handleSearchInfluencers = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    // Get linked IDs to exclude from search
    const linkedIds = influencer?.linked_profiles
      ? influencer.linked_profiles.split(",")
      : [];

    // Filter influencers based on search query
    const results = influencers.filter(
      (inf) =>
        inf.id !== id &&
        !linkedIds.includes(inf.id) &&
        (inf.name.toLowerCase().includes(query.toLowerCase()) ||
          (inf.social_handle &&
            inf.social_handle.toLowerCase().includes(query.toLowerCase()))),
    );

    setSearchResults(results);
  };

  const handleUpdateInfluencer = async () => {
    if (!influencer) return;

    try {
      const result = await updateInfluencer(influencer.id, {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        social_platform: formData.social_platform || null,
        social_handle: formData.social_handle || null,
        content_category: formData.content_category || null,
        profile_picture: formData.profile_picture || null,
        linked_profiles: formData.linked_profiles || null,
        genre: formData.genre || null,
        location: formData.location || null,
        languages: formData.languages || null,
        is_exclusive: formData.is_exclusive,
        is_bank_verified: formData.is_bank_verified,
      });

      if (result) {
        toast({
          title: "Profile updated",
          description: `${formData.name}'s profile has been updated successfully.`,
        });
        setIsEditOpen(false);
        await refetchInfluencers();
      }
    } catch (error) {
      console.error("Error updating influencer:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLinkProfile = async () => {
    if (!influencer || !selectedInfluencerId) return;

    try {
      // Get the selected influencer
      const selectedInfluencer = influencers.find(
        (inf) => inf.id === selectedInfluencerId,
      );
      if (!selectedInfluencer) {
        throw new Error("Selected influencer not found");
      }

      // Update current influencer's linked_profiles
      const currentLinkedIds = influencer.linked_profiles
        ? influencer.linked_profiles.split(",")
        : [];

      if (!currentLinkedIds.includes(selectedInfluencerId)) {
        currentLinkedIds.push(selectedInfluencerId);
      }

      const updatedCurrentLinked = currentLinkedIds.join(",");

      // Update selected influencer's linked_profiles
      const selectedLinkedIds = selectedInfluencer.linked_profiles
        ? selectedInfluencer.linked_profiles.split(",")
        : [];

      if (!selectedLinkedIds.includes(influencer.id)) {
        selectedLinkedIds.push(influencer.id);
      }

      const updatedSelectedLinked = selectedLinkedIds.join(",");

      // Determine exclusive status to apply to both profiles
      const shouldBeExclusive =
        influencer.is_exclusive || selectedInfluencer.is_exclusive;

      // Update both influencers
      const result1 = await updateInfluencer(influencer.id, {
        linked_profiles: updatedCurrentLinked,
        is_exclusive: shouldBeExclusive,
      });

      const result2 = await updateInfluencer(selectedInfluencerId, {
        linked_profiles: updatedSelectedLinked,
        is_exclusive: shouldBeExclusive,
      });

      // Fetch bank accounts from both profiles to link them
      const { data: currentBankAccounts } = await supabase
        .from("influencer_bank_accounts")
        .select("*")
        .eq("influencer_id", influencer.id);

      const { data: selectedBankAccounts } = await supabase
        .from("influencer_bank_accounts")
        .select("*")
        .eq("influencer_id", selectedInfluencerId);

      // Create shared account links instead of duplicating accounts
      if (currentBankAccounts && currentBankAccounts.length > 0) {
        // Share current profile's accounts with the selected profile
        for (const account of currentBankAccounts) {
          await supabase
            .from("influencer_shared_accounts")
            .insert({
              bank_account_id: account.id,
              influencer_id: selectedInfluencerId,
            })
            .select();
        }
      }

      if (selectedBankAccounts && selectedBankAccounts.length > 0) {
        // Share selected profile's accounts with the current profile
        for (const account of selectedBankAccounts) {
          await supabase
            .from("influencer_shared_accounts")
            .insert({
              bank_account_id: account.id,
              influencer_id: influencer.id,
            })
            .select();
        }
      }

      if (result1 && result2) {
        toast({
          title: "Profiles linked",
          description: `${influencer.name} and ${selectedInfluencer.name} have been linked successfully. Bank accounts and exclusive status have been shared.`,
        });
        setIsLinkProfileOpen(false);
        setSelectedInfluencerId("");
        setSearchQuery("");
        setSearchResults([]);
        await refetchInfluencers();
      }
    } catch (error) {
      console.error("Error linking profiles:", error);
      toast({
        title: "Error",
        description: "Failed to link profiles. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUnlinkProfile = async (profileId: string) => {
    if (!influencer) return;

    try {
      // Get the profile to unlink
      const profileToUnlink = influencers.find((inf) => inf.id === profileId);
      if (!profileToUnlink) {
        throw new Error("Profile to unlink not found");
      }

      // Remove from current influencer's linked_profiles
      const currentLinkedIds = influencer.linked_profiles
        ? influencer.linked_profiles.split(",")
        : [];

      const updatedCurrentLinked = currentLinkedIds
        .filter((id) => id !== profileId)
        .join(",");

      // Remove from the other profile's linked_profiles
      const otherLinkedIds = profileToUnlink.linked_profiles
        ? profileToUnlink.linked_profiles.split(",")
        : [];

      const updatedOtherLinked = otherLinkedIds
        .filter((id) => id !== influencer.id)
        .join(",");

      // Remove shared bank accounts between the profiles
      // 1. Get bank accounts owned by current influencer
      const { data: currentAccounts } = await supabase
        .from("influencer_bank_accounts")
        .select("id")
        .eq("influencer_id", influencer.id);

      // 2. Get bank accounts owned by profile to unlink
      const { data: otherAccounts } = await supabase
        .from("influencer_bank_accounts")
        .select("id")
        .eq("influencer_id", profileId);

      // 3. Remove shared accounts from other profile that are owned by current influencer
      if (currentAccounts && currentAccounts.length > 0) {
        const currentAccountIds = currentAccounts.map((acc) => acc.id);
        await supabase
          .from("influencer_shared_accounts")
          .delete()
          .eq("influencer_id", profileId)
          .in("bank_account_id", currentAccountIds);
      }

      // 4. Remove shared accounts from current profile that are owned by other influencer
      if (otherAccounts && otherAccounts.length > 0) {
        const otherAccountIds = otherAccounts.map((acc) => acc.id);
        await supabase
          .from("influencer_shared_accounts")
          .delete()
          .eq("influencer_id", influencer.id)
          .in("bank_account_id", otherAccountIds);
      }

      // Update both influencers
      const result1 = await updateInfluencer(influencer.id, {
        linked_profiles: updatedCurrentLinked,
      });

      const result2 = await updateInfluencer(profileId, {
        linked_profiles: updatedOtherLinked,
      });

      if (result1 && result2) {
        toast({
          title: "Profiles unlinked",
          description: `${influencer.name} and ${profileToUnlink.name} have been unlinked successfully. Shared bank accounts have been removed.`,
        });
        await refetchInfluencers();
      }
    } catch (error) {
      console.error("Error unlinking profiles:", error);
      toast({
        title: "Error",
        description: "Failed to unlink profiles. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="h-5 w-5" />;
      case "twitter":
        return <Twitter className="h-5 w-5" />;
      case "youtube":
        return <Youtube className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  // Calculate active campaigns for this influencer
  const getActiveCampaigns = () => {
    if (!influencer) return [];

    const campaignIds = campaignInfluencers
      .filter((ci) => ci.influencer_id === influencer.id)
      .map((ci) => ci.campaign_id);

    return campaigns.filter(
      (c) => campaignIds.includes(c.id) && c.status === "active",
    );
  };

  const activeCampaigns = getActiveCampaigns();

  if (
    loading ||
    loadingInfluencers ||
    loadingCampaigns ||
    loadingCampaignInfluencers
  ) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="text-center py-10">
        <p>Influencer not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/influencers")}
        >
          Back to Influencers
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Edit Profile Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update the influencer's profile information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                name="name"
                placeholder="Influencer name"
                className="col-span-3"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-email" className="text-right">
                Email
              </Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                placeholder="email@example.com"
                className="col-span-3"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-phone" className="text-right">
                Phone
              </Label>
              <Input
                id="edit-phone"
                name="phone"
                placeholder="+1 (555) 123-4567"
                className="col-span-3"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-social_platform" className="text-right">
                Platform
              </Label>
              <Select
                value={formData.social_platform}
                onValueChange={(value) =>
                  handleSelectChange("social_platform", value)
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-social_handle" className="text-right">
                Handle
              </Label>
              <Input
                id="edit-social_handle"
                name="social_handle"
                placeholder="@username"
                className="col-span-3"
                value={formData.social_handle}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-content_category" className="text-right">
                Category
              </Label>
              <Input
                id="edit-content_category"
                name="content_category"
                placeholder="e.g. Fashion, Beauty, Tech"
                className="col-span-3"
                value={formData.content_category}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-profile_picture" className="text-right">
                Profile Image
              </Label>
              <Input
                id="edit-profile_picture"
                name="profile_picture"
                placeholder="https://example.com/image.jpg"
                className="col-span-3"
                value={formData.profile_picture}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-genre" className="text-right">
                Genre
              </Label>
              <Input
                id="edit-genre"
                name="genre"
                placeholder="e.g. Comedy, Lifestyle, Gaming"
                className="col-span-3"
                value={formData.genre}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-location" className="text-right">
                Location
              </Label>
              <Input
                id="edit-location"
                name="location"
                placeholder="e.g. Mumbai, India"
                className="col-span-3"
                value={formData.location}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-languages" className="text-right">
                Languages
              </Label>
              <Input
                id="edit-languages"
                name="languages"
                placeholder="e.g. English, Hindi, Tamil"
                className="col-span-3"
                value={formData.languages}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-is_exclusive" className="text-right">
                Exclusive Creator
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="edit-is_exclusive"
                  checked={formData.is_exclusive}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("is_exclusive", checked)
                  }
                />
                <Label htmlFor="edit-is_exclusive">
                  {formData.is_exclusive ? "Yes" : "No"}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateInfluencer}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Profile Dialog */}
      <Dialog open={isLinkProfileOpen} onOpenChange={setIsLinkProfileOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Another Profile</DialogTitle>
            <DialogDescription>
              Search and link this profile with another influencer profile to
              share details.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="search-profile" className="text-right">
                Search Profiles
              </Label>
              <div className="col-span-3 relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-profile"
                  placeholder="Search by name or handle"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => handleSearchInfluencers(e.target.value)}
                />
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="border rounded-md p-2 max-h-[200px] overflow-y-auto">
                {searchResults.map((inf) => (
                  <div
                    key={inf.id}
                    className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer"
                    onClick={() => setSelectedInfluencerId(inf.id)}
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={inf.profile_picture} alt={inf.name} />
                        <AvatarFallback>{inf.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{inf.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {inf.social_handle}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        selectedInfluencerId === inf.id
                          ? "bg-primary text-primary-foreground"
                          : ""
                      }
                    >
                      {selectedInfluencerId === inf.id ? "Selected" : "Select"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && (
              <div className="text-center py-2 text-muted-foreground">
                No matching profiles found
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsLinkProfileOpen(false);
                setSearchQuery("");
                setSearchResults([]);
                setSelectedInfluencerId("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleLinkProfile}
              disabled={!selectedInfluencerId}
            >
              Link Profiles
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={influencer.profile_picture}
              alt={influencer.name}
            />
            <AvatarFallback>{influencer.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{influencer.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              {influencer.social_platform && (
                <Badge variant="outline" className="flex items-center gap-1">
                  {getSocialIcon(influencer.social_platform)}
                  {influencer.social_handle}
                </Badge>
              )}
              {influencer.content_category && (
                <Badge variant="outline">{influencer.content_category}</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setIsLinkProfileOpen(true)}>
            <LinkIcon className="mr-2 h-4 w-4" /> Link Profile
          </Button>
          <Button onClick={() => setIsEditOpen(true)}>
            <Edit className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {influencer.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{influencer.email}</span>
                </div>
              )}
              {influencer.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{influencer.phone}</span>
                </div>
              )}
              {influencer.social_handle && (
                <div className="flex items-center">
                  {getSocialIcon(influencer.social_platform || "instagram")}
                  <span className="ml-2">{influencer.social_handle}</span>
                </div>
              )}
              {influencer.is_exclusive && (
                <div className="mt-2">
                  <Badge className="bg-purple-500 text-white">
                    Exclusive Creator
                  </Badge>
                </div>
              )}
              {influencer.genre && (
                <div className="mt-3">
                  <p className="text-sm font-medium">Genre</p>
                  <p className="text-sm text-muted-foreground">
                    {influencer.genre}
                  </p>
                </div>
              )}
              {influencer.location && (
                <div className="mt-3">
                  <p className="text-sm font-medium">Location</p>
                  <p className="text-sm text-muted-foreground">
                    {influencer.location}
                  </p>
                </div>
              )}
              {influencer.languages && (
                <div className="mt-3">
                  <p className="text-sm font-medium">Languages</p>
                  <p className="text-sm text-muted-foreground">
                    {influencer.languages}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Active Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeCampaigns.length === 0 ? (
              <p className="text-muted-foreground">No active campaigns</p>
            ) : (
              <div className="space-y-2">
                {activeCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between"
                  >
                    <span>{campaign.name}</span>
                    <Badge variant="outline" className="bg-green-50">
                      Active
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Linked Profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            {relatedInfluencers.length === 0 ? (
              <p className="text-muted-foreground">No linked profiles</p>
            ) : (
              <div className="space-y-2">
                {relatedInfluencers.map((related) => (
                  <div
                    key={related.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage
                          src={related.profile_picture}
                          alt={related.name}
                        />
                        <AvatarFallback>
                          {related.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{related.name}</span>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/influencer/${related.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleUnlinkProfile(related.id)}
                      >
                        Unlink
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="bank_accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bank_accounts">Bank Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="bank_accounts" className="space-y-4">
          {influencer && <BankAccountsList influencerId={influencer.id} />}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {influencer && <TransactionHistory influencerId={influencer.id} />}
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign History</CardTitle>
              <CardDescription>
                All campaigns this influencer has participated in.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activeCampaigns.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  This influencer hasn't participated in any campaigns yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {/* Campaign list would go here */}
                  <p className="text-center text-muted-foreground py-8">
                    Campaign details will be displayed here.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Library</CardTitle>
              <CardDescription>
                Content created by this influencer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Content library will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>
                Performance metrics and analytics.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">
                Analytics will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InfluencerDetail;
