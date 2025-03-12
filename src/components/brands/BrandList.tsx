import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  PlusCircle,
  Search,
  Building2,
  ExternalLink,
  Edit,
  Trash2,
  Loader2,
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
import { Brand } from "@/types/schema";
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
import { useToast } from "@/components/ui/use-toast";

const BrandList = () => {
  const { toast } = useToast();
  const {
    brands,
    campaigns,
    campaignInfluencers,
    loadingBrands,
    loadingCampaigns,
    loadingCampaignInfluencers,
    addBrand,
    updateBrand,
    deleteBrand,
    refetchBrands,
  } = useData();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [isEditBrandOpen, setIsEditBrandOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    description: "",
    website: "",
    logo_url: "",
  });

  useEffect(() => {
    if (brands) {
      setFilteredBrands(brands);
    }
  }, [brands]);

  useEffect(() => {
    if (selectedBrand && isEditBrandOpen) {
      setFormData({
        name: selectedBrand.name,
        industry: selectedBrand.industry || "",
        description: selectedBrand.description || "",
        website: selectedBrand.website || "",
        logo_url: selectedBrand.logo_url || "",
      });
    }
  }, [selectedBrand, isEditBrandOpen]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredBrands(brands);
    } else {
      const filtered = brands.filter(
        (brand) =>
          brand.name.toLowerCase().includes(query) ||
          (brand.industry && brand.industry.toLowerCase().includes(query)),
      );
      setFilteredBrands(filtered);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddBrand = async () => {
    if (!formData.name) {
      toast({
        title: "Validation Error",
        description: "Brand name is required.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Prepare the brand data
      const brandData = {
        name: formData.name,
        industry: formData.industry || null,
        description: formData.description || null,
        website: formData.website || null,
        logo_url:
          formData.logo_url ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${formData.name}`,
      };

      console.log("Adding brand with data:", brandData);

      const result = await addBrand(brandData);

      if (result) {
        toast({
          title: "Brand added",
          description: `${formData.name} has been added successfully.`,
        });
        setIsAddBrandOpen(false);
        setFormData({
          name: "",
          industry: "",
          description: "",
          website: "",
          logo_url: "",
        });
        // Refresh the brands list
        await refetchBrands();
      } else {
        throw new Error("Failed to add brand - no result returned");
      }
    } catch (error) {
      console.error("Error adding brand:", error);
      toast({
        title: "Error",
        description: "Failed to add brand. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditBrand = async () => {
    if (!selectedBrand) return;

    try {
      const result = await updateBrand(selectedBrand.id, {
        name: formData.name,
        industry: formData.industry,
        description: formData.description,
        website: formData.website,
        logo_url: formData.logo_url,
      });

      if (result) {
        toast({
          title: "Brand updated",
          description: `${formData.name} has been updated successfully.`,
        });
        setIsEditBrandOpen(false);
        setSelectedBrand(null);
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

  const handleDeleteBrand = async () => {
    if (!selectedBrand) return;

    try {
      const success = await deleteBrand(selectedBrand.id);

      if (success) {
        toast({
          title: "Brand deleted",
          description: `${selectedBrand.name} has been deleted successfully.`,
        });
        setIsDeleteConfirmOpen(false);
        setSelectedBrand(null);
      }
    } catch (error) {
      console.error("Error deleting brand:", error);
      toast({
        title: "Error",
        description: "Failed to delete brand. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Calculate campaign and influencer counts
  const getBrandStats = (brandId: string) => {
    // Count active campaigns for this brand
    const activeCampaigns = campaigns.filter(
      (c) => c.brand_id === brandId && c.status === "active",
    ).length;

    // Count influencers assigned to this brand's campaigns
    const brandCampaignIds = campaigns
      .filter((c) => c.brand_id === brandId)
      .map((c) => c.id);
    const assignedInfluencers = new Set();
    campaignInfluencers.forEach((ci) => {
      if (brandCampaignIds.includes(ci.campaign_id)) {
        assignedInfluencers.add(ci.influencer_id);
      }
    });

    return {
      activeCampaigns: activeCampaigns || 0,
      totalInfluencers: assignedInfluencers.size || 0,
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Brands</h1>
        <Dialog open={isAddBrandOpen} onOpenChange={setIsAddBrandOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Brand</DialogTitle>
              <DialogDescription>
                Create a new brand to manage in your campaigns.
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
                  placeholder="Brand name"
                  className="col-span-3"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="industry" className="text-right">
                  Industry
                </Label>
                <Input
                  id="industry"
                  name="industry"
                  placeholder="e.g. Fashion, Technology"
                  className="col-span-3"
                  value={formData.industry}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="website" className="text-right">
                  Website
                </Label>
                <Input
                  id="website"
                  name="website"
                  placeholder="https://example.com"
                  className="col-span-3"
                  value={formData.website}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="logo_url" className="text-right">
                  Logo URL
                </Label>
                <Input
                  id="logo_url"
                  name="logo_url"
                  placeholder="https://example.com/logo.png"
                  className="col-span-3"
                  value={formData.logo_url}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <textarea
                  id="description"
                  name="description"
                  placeholder="Brief description of the brand"
                  className="col-span-3 flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddBrandOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddBrand}>Create Brand</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Brand Dialog */}
        <Dialog open={isEditBrandOpen} onOpenChange={setIsEditBrandOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Brand</DialogTitle>
              <DialogDescription>
                Update the brand information.
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
                  placeholder="Brand name"
                  className="col-span-3"
                  value={formData.name}
                  onChange={handleInputChange}
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
                  value={formData.industry}
                  onChange={handleInputChange}
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
                  value={formData.website}
                  onChange={handleInputChange}
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
                  value={formData.logo_url}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Input
                  id="edit-description"
                  name="description"
                  placeholder="Brief description of the brand"
                  className="col-span-3"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditBrandOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleEditBrand}>Save Changes</Button>
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
                Are you sure you want to delete {selectedBrand?.name}? This
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
              <Button variant="destructive" onClick={handleDeleteBrand}>
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
            placeholder="Search brands..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      {loadingBrands || loadingCampaigns || loadingCampaignInfluencers ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">
            No brands found. Add your first brand to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBrands.map((brand) => {
            const stats = getBrandStats(brand.id);
            return (
              <Card key={brand.id} className="overflow-hidden">
                <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={brand.logo_url} alt={brand.name} />
                      <AvatarFallback>{brand.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{brand.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {brand.industry}
                      </Badge>
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
                          setSelectedBrand(brand);
                          setIsEditBrandOpen(true);
                        }}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      {brand.website && (
                        <DropdownMenuItem
                          onClick={() => window.open(brand.website, "_blank")}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" /> View Website
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedBrand(brand);
                          setIsDeleteConfirmOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-muted p-2 rounded-md text-center">
                      <p className="text-sm font-medium">
                        {stats.activeCampaigns}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Active Campaigns
                      </p>
                    </div>
                    <div className="bg-muted p-2 rounded-md text-center">
                      <p className="text-sm font-medium">
                        {stats.totalInfluencers}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Influencers
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        (window.location.href = `/brand/${brand.id}`)
                      }
                    >
                      <Building2 className="mr-2 h-4 w-4" /> View Details
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

export default BrandList;
