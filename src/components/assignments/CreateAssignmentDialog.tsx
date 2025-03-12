import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useData } from "@/context/DataContext";
import SearchableSelect from "../campaigns/SearchableSelect";

interface CreateAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAssignmentCreated: (assignment: any) => void;
}

const CreateAssignmentDialog = ({
  open,
  onOpenChange,
  onAssignmentCreated,
}: CreateAssignmentDialogProps) => {
  const { toast } = useToast();
  const { brands, influencers, campaigns } = useData();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    brand_id: "",
    influencer_id: "",
    campaign_id: "",
    message: "",
    compensation: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.brand_id || !formData.influencer_id) {
        toast({
          title: "Validation Error",
          description: "Brand and influencer are required fields.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Prepare data for submission
      const assignmentData = {
        brand_id: formData.brand_id,
        influencer_id: formData.influencer_id,
        campaign_id: formData.campaign_id || null,
        message: formData.message || null,
        compensation: formData.compensation
          ? parseFloat(formData.compensation)
          : null,
        status: "pending",
        created_by: (await supabase.auth.getUser()).data.user?.id,
      };

      // Create new assignment
      const { data, error } = await supabase
        .from("direct_assignments")
        .insert([assignmentData])
        .select()
        .single();

      if (error) throw error;

      // Call the callback with the new assignment
      onAssignmentCreated(data);

      // Close the dialog and reset form
      onOpenChange(false);
      setFormData({
        brand_id: "",
        influencer_id: "",
        campaign_id: "",
        message: "",
        compensation: "",
      });
    } catch (err) {
      console.error("Error creating assignment:", err);
      toast({
        title: "Error",
        description: "Failed to create assignment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
          <DialogDescription>
            Assign an influencer to a brand or campaign.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Brand Selection */}
            <div className="space-y-2">
              <Label htmlFor="brand_id">Brand*</Label>
              <SearchableSelect
                options={brands.map((brand) => ({
                  value: brand.id,
                  label: brand.name,
                }))}
                value={formData.brand_id}
                onChange={(value) => handleSelectChange("brand_id", value)}
                placeholder="Select a brand"
                emptyMessage="No brands found"
              />
            </div>

            {/* Influencer Selection */}
            <div className="space-y-2">
              <Label htmlFor="influencer_id">Influencer*</Label>
              <SearchableSelect
                options={influencers.map((influencer) => ({
                  value: influencer.id,
                  label: influencer.name,
                }))}
                value={formData.influencer_id}
                onChange={(value) => handleSelectChange("influencer_id", value)}
                placeholder="Select an influencer"
                emptyMessage="No influencers found"
              />
            </div>

            {/* Campaign Selection */}
            <div className="space-y-2">
              <Label htmlFor="campaign_id">Campaign (Optional)</Label>
              <SearchableSelect
                options={[
                  { value: "", label: "No Campaign" },
                  ...campaigns.map((campaign) => ({
                    value: campaign.id,
                    label: campaign.name,
                  })),
                ]}
                value={formData.campaign_id}
                onChange={(value) => handleSelectChange("campaign_id", value)}
                placeholder="Select a campaign"
                emptyMessage="No campaigns found"
              />
            </div>

            {/* Compensation */}
            <div className="space-y-2">
              <Label htmlFor="compensation">Compensation (Optional)</Label>
              <Input
                id="compensation"
                name="compensation"
                type="number"
                placeholder="0.00"
                value={formData.compensation}
                onChange={handleInputChange}
              />
            </div>

            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Enter a message for the influencer"
                value={formData.message}
                onChange={handleInputChange}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                </>
              ) : (
                "Create Assignment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAssignmentDialog;
