import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PlusCircle,
  Search,
  Users,
  Instagram,
  Twitter,
  Youtube,
  Edit,
  Trash2,
  Loader2,
  Phone,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useData } from "@/context/DataContext";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const getSocialIcon = (platform: string) => {
  switch (platform) {
    case "instagram":
      return <Instagram className="h-4 w-4" />;
    case "twitter":
      return <Twitter className="h-4 w-4" />;
    case "youtube":
      return <Youtube className="h-4 w-4" />;
    case "tiktok":
      return <Users className="h-4 w-4" />; // Using Users as placeholder for TikTok
    default:
      return <Users className="h-4 w-4" />;
  }
};

const InfluencerList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    influencers,
    campaigns,
    campaignInfluencers,
    loadingInfluencers,
    loadingCampaigns,
    loadingCampaignInfluencers,
    addInfluencer,
    updateInfluencer,
    deleteInfluencer,
    refetchInfluencers,
  } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [filteredInfluencers, setFilteredInfluencers] = useState<Influencer[]>(
    [],
  );
  const [isAddInfluencerOpen, setIsAddInfluencerOpen] = useState(false);
  const [isEditInfluencerOpen, setIsEditInfluencerOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] =
    useState<Influencer | null>(null);

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
  });

  useEffect(() => {
    if (influencers) {
      setFilteredInfluencers(influencers);
    }
  }, [influencers]);

  useEffect(() => {
    if (selectedInfluencer && isEditInfluencerOpen) {
      setFormData({
        name: selectedInfluencer.name,
        email: selectedInfluencer.email || "",
        phone: selectedInfluencer.phone || "",
        social_platform: selectedInfluencer.social_platform || "instagram",
        social_handle: selectedInfluencer.social_handle || "",
        content_category: selectedInfluencer.content_category || "",
        profile_picture: selectedInfluencer.profile_picture || "",
        linked_profiles: selectedInfluencer.linked_profiles || "",
      });
    }
  }, [selectedInfluencer, isEditInfluencerOpen]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredInfluencers(influencers);
    } else {
      const filtered = influencers.filter(
        (influencer) =>
          influencer.name.toLowerCase().includes(query) ||
          (influencer.social_handle &&
            influencer.social_handle.toLowerCase().includes(query)) ||
          (influencer.content_category &&
            influencer.content_category.toLowerCase().includes(query)),
      );
      setFilteredInfluencers(filtered);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddInfluencer = async () => {
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Influencer name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare the influencer data
      const influencerData = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        social_platform: formData.social_platform || null,
        social_handle: formData.social_handle || null,
        content_category: formData.content_category || null,
        profile_picture:
          formData.profile_picture ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`,
        linked_profiles: formData.linked_profiles || null,
      };

      const result = await addInfluencer(influencerData);

      if (result) {
        toast({
          title: "Influencer added",
          description: `${formData.name} has been added successfully.`,
        });
        setIsAddInfluencerOpen(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          social_platform: "instagram",
          social_handle: "",
          content_category: "",
          profile_picture: "",
          linked_profiles: "",
        });
        // Refresh the influencers list
        await refetchInfluencers();
      } else {
        throw new Error("Failed to add influencer - no result returned");
      }
    } catch (error) {
      console.error("Error adding influencer:", error);
      toast({
        title: "Error",
        description: "Failed to add influencer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditInfluencer = async () => {
    if (!selectedInfluencer) return;

    try {
      const influencerData = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.phone || null,
        social_platform: formData.social_platform || null,
        social_handle: formData.social_handle || null,
        content_category: formData.content_category || null,
        profile_picture: formData.profile_picture || null,
        linked_profiles: formData.linked_profiles || null,
      };

      const result = await updateInfluencer(
        selectedInfluencer.id,
        influencerData,
      );

      if (result) {
        toast({
          title: "Influencer updated",
          description: `${formData.name} has been updated successfully.`,
        });
        setIsEditInfluencerOpen(false);
        setSelectedInfluencer(null);
        await refetchInfluencers();
      }
    } catch (error) {
      console.error("Error updating influencer:", error);
      toast({
        title: "Error",
        description: "Failed to update influencer. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInfluencer = async () => {
    if (!selectedInfluencer) return;

    try {
      const success = await deleteInfluencer(selectedInfluencer.id);

      if (success) {
        toast({
          title: "Influencer deleted",
          description: `${selectedInfluencer.name} has been deleted successfully.`,
        });
        setIsDeleteConfirmOpen(false);
        setSelectedInfluencer(null);
        await refetchInfluencers();
      }
    } catch (error) {
      console.error("Error deleting influencer:", error);
      toast({
        title: "Error",
        description: "Failed to delete influencer. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate active campaigns for each influencer
  const getActiveCampaignsCount = (influencerId: string) => {
    const campaignIds = campaignInfluencers
      .filter((ci) => ci.influencer_id === influencerId)
      .map((ci) => ci.campaign_id);

    const activeCampaigns = campaigns.filter(
      (c) => campaignIds.includes(c.id) && c.status === "active",
    ).length;

    return activeCampaigns;
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Influencers</h1>
        <Dialog
          open={isAddInfluencerOpen}
          onOpenChange={setIsAddInfluencerOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Influencer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Influencer</DialogTitle>
              <DialogDescription>
                Create a new influencer profile to manage in your campaigns.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Influencer name"
                  className="col-span-3"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  className="col-span-3"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+1 (555) 123-4567"
                  className="col-span-3"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="social_platform" className="text-right">
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
                <Label htmlFor="social_handle" className="text-right">
                  Handle
                </Label>
                <Input
                  id="social_handle"
                  name="social_handle"
                  placeholder="@username"
                  className="col-span-3"
                  value={formData.social_handle}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="content_category" className="text-right">
                  Category
                </Label>
                <Input
                  id="content_category"
                  name="content_category"
                  placeholder="e.g. Fashion, Beauty, Tech"
                  className="col-span-3"
                  value={formData.content_category}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="profile_picture" className="text-right">
                  Profile Image
                </Label>
                <Input
                  id="profile_picture"
                  name="profile_picture"
                  placeholder="https://example.com/image.jpg"
                  className="col-span-3"
                  value={formData.profile_picture}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddInfluencerOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddInfluencer}>Create Influencer</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Influencer Dialog */}
        <Dialog
          open={isEditInfluencerOpen}
          onOpenChange={setIsEditInfluencerOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Influencer</DialogTitle>
              <DialogDescription>
                Update the influencer information.
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
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditInfluencerOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditInfluencer}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={isDeleteConfirmOpen}
          onOpenChange={setIsDeleteConfirmOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedInfluencer?.name}? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteInfluencer}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search influencers..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      {loadingInfluencers || loadingCampaigns || loadingCampaignInfluencers ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredInfluencers.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">
            No influencers found. Add your first influencer to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredInfluencers.map((influencer) => {
            const activeCampaigns = getActiveCampaignsCount(influencer.id);
            return (
              <Card key={influencer.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={influencer.profile_picture}
                        alt={influencer.name}
                      />
                      <AvatarFallback>
                        {influencer.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {influencer.name}
                      </CardTitle>
                      <div className="flex items-center mt-1">
                        {getSocialIcon(influencer.social_platform)}
                        <span className="text-sm text-muted-foreground ml-1">
                          {influencer.social_handle}
                        </span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4"
                        >
                          <circle cx="12" cy="12" r="1" />
                          <circle cx="12" cy="5" r="1" />
                          <circle cx="12" cy="19" r="1" />
                        </svg>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedInfluencer(influencer);
                          setIsEditInfluencerOpen(true);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Users className="mr-2 h-4 w-4" /> Assign to Campaign
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedInfluencer(influencer);
                          setIsDeleteConfirmOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex justify-between mt-2">
                    <Badge variant="outline" className="bg-muted">
                      {influencer.content_category || "Uncategorized"}
                    </Badge>
                    <Badge variant="outline" className="bg-muted">
                      {activeCampaigns} active campaigns
                    </Badge>
                  </div>
                  <div className="mt-4">
                    {influencer.phone && (
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <Phone className="h-3 w-3 mr-1" />
                        {influencer.phone}
                      </div>
                    )}
                    {influencer.email && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="h-3 w-3 mr-1" />
                        {influencer.email}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/influencer/${influencer.id}`)}
                    >
                      <Users className="mr-2 h-4 w-4" /> View Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default InfluencerList;
