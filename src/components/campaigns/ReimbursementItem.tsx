import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Trash2 } from "lucide-react";

export interface Reimbursement {
  id: string;
  description: string;
  amount: string;
}

interface ReimbursementItemProps {
  item: Reimbursement;
  onChange: (id: string, field: string, value: string) => void;
  onRemove: (id: string) => void;
}

const ReimbursementItem = ({
  item,
  onChange,
  onRemove,
}: ReimbursementItemProps) => {
  return (
    <div className="flex items-end gap-2 p-3 border rounded-md bg-muted/10">
      <div className="flex-1 space-y-1">
        <Label htmlFor={`desc-${item.id}`} className="text-xs">
          Description
        </Label>
        <Input
          id={`desc-${item.id}`}
          value={item.description}
          onChange={(e) => onChange(item.id, "description", e.target.value)}
          placeholder="e.g. Travel expenses"
        />
      </div>
      <div className="w-24 space-y-1">
        <Label htmlFor={`amount-${item.id}`} className="text-xs">
          Amount
        </Label>
        <Input
          id={`amount-${item.id}`}
          value={item.amount}
          onChange={(e) => onChange(item.id, "amount", e.target.value)}
          placeholder="0.00"
          type="number"
        />
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive"
        onClick={() => onRemove(item.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ReimbursementItem;
