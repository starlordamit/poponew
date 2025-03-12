import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Plus, Minus } from "lucide-react";

export interface DeliverableItem {
  id: string;
  type: string;
  quantity: number;
  notes: string;
  completed?: boolean;
}

interface DeliverablesFormProps {
  platform: string;
  deliverables: DeliverableItem[];
  onChange: (deliverables: DeliverableItem[]) => void;
}

const DeliverablesForm = ({
  platform,
  deliverables,
  onChange,
}: DeliverablesFormProps) => {
  // Get platform-specific deliverable types
  const getDeliverableTypes = () => {
    switch (platform.toLowerCase()) {
      case "instagram":
        return ["Post", "Reel", "Story", "Carousel", "IGTV"];
      case "youtube":
        return ["Video", "Short", "Live", "Community Post"];
      case "tiktok":
        return ["Video", "Live", "Duet", "Stitch"];
      case "twitter":
        return ["Tweet", "Thread", "Space", "Video"];
      default:
        return ["Post", "Video", "Story", "Live"];
    }
  };

  const deliverableTypes = getDeliverableTypes();

  const addDeliverable = (type: string) => {
    const newDeliverable = {
      id: Date.now().toString(),
      type,
      quantity: 1,
      notes: "",
      completed: false,
    };
    onChange([...deliverables, newDeliverable]);
  };

  const removeDeliverable = (id: string) => {
    onChange(deliverables.filter((item) => item.id !== id));
  };

  const updateDeliverable = (id: string, field: string, value: any) => {
    const updatedDeliverables = deliverables.map((item) =>
      item.id === id ? { ...item, [field]: value } : item,
    );

    onChange(updatedDeliverables);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {deliverableTypes.map((type) => (
          <Button
            key={type}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addDeliverable(type)}
          >
            <Plus className="mr-1 h-3 w-3" /> {type}
          </Button>
        ))}
      </div>

      {deliverables.length > 0 ? (
        <div className="space-y-3 mt-4">
          {deliverables.map((deliverable) => (
            <div
              key={deliverable.id}
              className="p-3 border rounded-md bg-muted/10"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="font-medium">{deliverable.type}</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive"
                  onClick={() => removeDeliverable(deliverable.id)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label
                    htmlFor={`quantity-${deliverable.id}`}
                    className="text-xs"
                  >
                    Quantity
                  </Label>
                  <Input
                    id={`quantity-${deliverable.id}`}
                    type="number"
                    min="1"
                    value={deliverable.quantity}
                    onChange={(e) =>
                      updateDeliverable(
                        deliverable.id,
                        "quantity",
                        parseInt(e.target.value) || 1,
                      )
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={`completed-${deliverable.id}`}
                      className="text-xs"
                    >
                      Completed
                    </Label>
                    <Switch
                      id={`completed-${deliverable.id}`}
                      checked={deliverable.completed || false}
                      onCheckedChange={(checked) =>
                        updateDeliverable(deliverable.id, "completed", checked)
                      }
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label
                    htmlFor={`notes-${deliverable.id}`}
                    className="text-xs"
                  >
                    Notes
                  </Label>
                  <Textarea
                    id={`notes-${deliverable.id}`}
                    value={deliverable.notes}
                    onChange={(e) =>
                      updateDeliverable(deliverable.id, "notes", e.target.value)
                    }
                    placeholder="Add specific requirements or details"
                    className="mt-1 min-h-[80px]"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground">
          Click on a deliverable type above to add it to the campaign
        </div>
      )}
    </div>
  );
};

export default DeliverablesForm;
