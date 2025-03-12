import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus,
  Edit,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  Loader2,
} from "lucide-react";
import { useData } from "@/context/DataContext";
import { BrandPOC } from "@/types/schema";
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
import { Switch } from "@/components/ui/switch";

interface BrandPOCListProps {
  brandId: string;
}

const BrandPOCList = ({ brandId }: BrandPOCListProps) => {
  const { toast } = useToast();
  const { addBrandPOC, updateBrandPOC, deleteBrandPOC, getBrandPOCs } =
    useData();

  const [brandPOCs, setBrandPOCs] = useState<BrandPOC[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddPOCOpen, setIsAddPOCOpen] = useState(false);
  const [isEditPOCOpen, setIsEditPOCOpen] = useState(false);
  const [isDeletePOCOpen, setIsDeletePOCOpen] = useState(false);
  const [selectedPOC, setSelectedPOC] = useState<BrandPOC | null>(null);

  // Form state
  const [pocForm, setPocForm] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    is_primary: false,
  });

  // Load POCs
  useEffect(() => {
    const loadPOCs = async () => {
      if (brandId) {
        setLoading(true);
        const pocs = await getBrandPOCs(brandId);
        setBrandPOCs(pocs);
        setLoading(false);
      }
    };

    loadPOCs();
  }, [brandId, getBrandPOCs]);

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

  const handlePOCInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPocForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePOCPrimaryChange = (checked: boolean) => {
    setPocForm((prev) => ({ ...prev, is_primary: checked }));
  };

  const handleAddPOC = async () => {
    if (!brandId || !pocForm.name) {
      toast({
        title: "Validation Error",
        description: "Contact name is required.",
        variant: "destructive",
      });
      return;
    }

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
        brand_id: brandId,
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
        const updatedPOCs = await getBrandPOCs(brandId);
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
    if (!selectedPOC || !pocForm.name) {
      toast({
        title: "Validation Error",
        description: "Contact name is required.",
        variant: "destructive",
      });
      return;
    }

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
        const updatedPOCs = await getBrandPOCs(brandId);
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
        const updatedPOCs = await getBrandPOCs(brandId);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add POC Dialog */}
      <Dialog open={isAddPOCOpen} onOpenChange={setIsAddPOCOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
            <DialogDescription>
              Add a new point of contact for this brand.
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
                No contacts added yet. Add your first contact to get started.
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
                          <Badge className="ml-2 bg-blue-500">Primary</Badge>
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
    </div>
  );
};

export default BrandPOCList;
