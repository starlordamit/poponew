import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  Building,
  CreditCard,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { InfluencerBankAccount } from "@/types/schema";

interface BankAccountsListProps {
  influencerId: string;
}

const BankAccountsList = ({ influencerId }: BankAccountsListProps) => {
  const { toast } = useToast();
  const [bankAccounts, setBankAccounts] = useState<InfluencerBankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<InfluencerBankAccount | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    account_name: "",
    account_number: "",
    ifsc_code: "",
    bank_name: "",
    branch_name: "",
    pan_number: "",
    gst_number: "",
    is_primary: false,
    is_verified: false,
    is_pan_verified: false,
    is_gst_verified: false,
  });

  // Fetch bank accounts
  useEffect(() => {
    const fetchBankAccounts = async () => {
      if (!influencerId) return;

      setLoading(true);
      try {
        // Get directly owned accounts
        const { data: ownedAccounts, error: ownedError } = await supabase
          .from("influencer_bank_accounts")
          .select("*")
          .eq("influencer_id", influencerId)
          .order("is_primary", { ascending: false });

        if (ownedError) throw ownedError;

        // Get shared accounts
        const { data: sharedData, error: sharedError } = await supabase
          .from("influencer_shared_accounts")
          .select("bank_account_id")
          .eq("influencer_id", influencerId);

        if (sharedError) throw sharedError;

        // If there are shared accounts, fetch their details
        let sharedAccounts: InfluencerBankAccount[] = [];
        if (sharedData && sharedData.length > 0) {
          const sharedIds = sharedData.map((item) => item.bank_account_id);

          const { data: sharedAccountsData, error: accountsError } =
            await supabase
              .from("influencer_bank_accounts")
              .select("*")
              .in("id", sharedIds)
              .order("is_primary", { ascending: false });

          if (accountsError) throw accountsError;

          if (sharedAccountsData) {
            // Mark these accounts as shared
            sharedAccounts = sharedAccountsData.map((account) => ({
              ...account,
              is_shared: true,
            })) as InfluencerBankAccount[];
          }
        }

        // Combine owned and shared accounts
        const allAccounts = [...(ownedAccounts || []), ...sharedAccounts];
        setBankAccounts(allAccounts as InfluencerBankAccount[]);
      } catch (error) {
        console.error("Error fetching bank accounts:", error);
        toast({
          title: "Error",
          description: "Failed to load bank accounts. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBankAccounts();
  }, [influencerId, toast]);

  // Reset form when dialog opens
  useEffect(() => {
    if (isAddAccountOpen) {
      setFormData({
        account_name: "",
        account_number: "",
        ifsc_code: "",
        bank_name: "",
        branch_name: "",
        pan_number: "",
        gst_number: "",
        is_primary: bankAccounts.length === 0, // Make primary if it's the first account
        is_verified: false,
        is_pan_verified: false,
        is_gst_verified: false,
      });
    }
  }, [isAddAccountOpen, bankAccounts.length]);

  // Set form data when editing
  useEffect(() => {
    if (selectedAccount && isEditAccountOpen) {
      setFormData({
        account_name: selectedAccount.account_name || "",
        account_number: selectedAccount.account_number,
        ifsc_code: selectedAccount.ifsc_code,
        bank_name: selectedAccount.bank_name,
        branch_name: selectedAccount.branch_name || "",
        pan_number: selectedAccount.pan_number || "",
        gst_number: selectedAccount.gst_number || "",
        is_primary: selectedAccount.is_primary,
        is_verified: selectedAccount.is_verified,
        is_pan_verified: selectedAccount.is_pan_verified || false,
        is_gst_verified: selectedAccount.is_gst_verified || false,
      });
    }
  }, [selectedAccount, isEditAccountOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleAddAccount = async () => {
    if (
      !formData.account_number ||
      !formData.ifsc_code ||
      !formData.bank_name
    ) {
      toast({
        title: "Validation Error",
        description: "Account number, IFSC code, and bank name are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      // If this account is primary, update any existing primary account
      if (formData.is_primary && bankAccounts.some((acc) => acc.is_primary)) {
        const primaryAccount = bankAccounts.find((acc) => acc.is_primary);
        if (primaryAccount) {
          await supabase
            .from("influencer_bank_accounts")
            .update({ is_primary: false })
            .eq("id", primaryAccount.id);
        }
      }

      // Add new account
      const { data, error } = await supabase
        .from("influencer_bank_accounts")
        .insert([
          {
            influencer_id: influencerId,
            account_name: formData.account_name || null,
            account_number: formData.account_number,
            ifsc_code: formData.ifsc_code,
            bank_name: formData.bank_name,
            branch_name: formData.branch_name || null,
            pan_number: formData.pan_number || null,
            gst_number: formData.gst_number || null,
            is_primary: formData.is_primary,
            is_verified: formData.is_verified,
            is_pan_verified: formData.is_pan_verified,
            is_gst_verified: formData.is_gst_verified,
          },
        ])
        .select();

      if (error) throw error;

      toast({
        title: "Account added",
        description: "Bank account has been added successfully.",
      });

      setIsAddAccountOpen(false);

      // Refresh the list
      const { data: updatedAccounts } = await supabase
        .from("influencer_bank_accounts")
        .select("*")
        .eq("influencer_id", influencerId)
        .order("is_primary", { ascending: false });

      if (updatedAccounts) {
        setBankAccounts(updatedAccounts as InfluencerBankAccount[]);
      }
    } catch (error) {
      console.error("Error adding bank account:", error);
      toast({
        title: "Error",
        description: "Failed to add bank account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateAccount = async () => {
    if (!selectedAccount) return;

    if (
      !formData.account_number ||
      !formData.ifsc_code ||
      !formData.bank_name
    ) {
      toast({
        title: "Validation Error",
        description: "Account number, IFSC code, and bank name are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      // If this account is being set as primary, update any existing primary account
      if (formData.is_primary && !selectedAccount.is_primary) {
        const primaryAccount = bankAccounts.find(
          (acc) => acc.is_primary && acc.id !== selectedAccount.id,
        );
        if (primaryAccount) {
          await supabase
            .from("influencer_bank_accounts")
            .update({ is_primary: false })
            .eq("id", primaryAccount.id);
        }
      }

      // Update the account
      const { data, error } = await supabase
        .from("influencer_bank_accounts")
        .update({
          account_name: formData.account_name || null,
          account_number: formData.account_number,
          ifsc_code: formData.ifsc_code,
          bank_name: formData.bank_name,
          branch_name: formData.branch_name || null,
          pan_number: formData.pan_number || null,
          gst_number: formData.gst_number || null,
          is_primary: formData.is_primary,
          is_verified: formData.is_verified,
          is_pan_verified: formData.is_pan_verified,
          is_gst_verified: formData.is_gst_verified,
        })
        .eq("id", selectedAccount.id)
        .select();

      if (error) throw error;

      toast({
        title: "Account updated",
        description: "Bank account has been updated successfully.",
      });

      setIsEditAccountOpen(false);
      setSelectedAccount(null);

      // Refresh the list
      const { data: updatedAccounts } = await supabase
        .from("influencer_bank_accounts")
        .select("*")
        .eq("influencer_id", influencerId)
        .order("is_primary", { ascending: false });

      if (updatedAccounts) {
        setBankAccounts(updatedAccounts as InfluencerBankAccount[]);
      }
    } catch (error) {
      console.error("Error updating bank account:", error);
      toast({
        title: "Error",
        description: "Failed to update bank account. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (!selectedAccount) return;

    try {
      const { error } = await supabase
        .from("influencer_bank_accounts")
        .delete()
        .eq("id", selectedAccount.id);

      if (error) throw error;

      toast({
        title: "Account deleted",
        description: "Bank account has been deleted successfully.",
      });

      setIsDeleteConfirmOpen(false);
      setSelectedAccount(null);

      // Refresh the list
      const { data: updatedAccounts } = await supabase
        .from("influencer_bank_accounts")
        .select("*")
        .eq("influencer_id", influencerId)
        .order("is_primary", { ascending: false });

      if (updatedAccounts) {
        setBankAccounts(updatedAccounts as InfluencerBankAccount[]);
      }
    } catch (error) {
      console.error("Error deleting bank account:", error);
      toast({
        title: "Error",
        description: "Failed to delete bank account. Please try again.",
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
      {/* Add Bank Account Dialog */}
      <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bank Account</DialogTitle>
            <DialogDescription>
              Add a new bank account for payments.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account_name" className="text-right">
                Account Name
              </Label>
              <Input
                id="account_name"
                name="account_name"
                placeholder="Account holder name"
                className="col-span-3"
                value={formData.account_name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="account_number" className="text-right">
                Account Number*
              </Label>
              <Input
                id="account_number"
                name="account_number"
                placeholder="Account number"
                className="col-span-3"
                value={formData.account_number}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ifsc_code" className="text-right">
                IFSC Code*
              </Label>
              <Input
                id="ifsc_code"
                name="ifsc_code"
                placeholder="IFSC code"
                className="col-span-3"
                value={formData.ifsc_code}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bank_name" className="text-right">
                Bank Name*
              </Label>
              <Input
                id="bank_name"
                name="bank_name"
                placeholder="Bank name"
                className="col-span-3"
                value={formData.bank_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="branch_name" className="text-right">
                Branch Name
              </Label>
              <Input
                id="branch_name"
                name="branch_name"
                placeholder="Branch name"
                className="col-span-3"
                value={formData.branch_name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_primary" className="text-right">
                Primary Account
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="is_primary"
                  checked={formData.is_primary}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("is_primary", checked)
                  }
                />
                <Label htmlFor="is_primary">
                  {formData.is_primary ? "Yes" : "No"}
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pan_number" className="text-right">
                PAN Number
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="pan_number"
                  name="pan_number"
                  placeholder="ABCDE1234F"
                  className="flex-1"
                  value={formData.pan_number}
                  onChange={handleInputChange}
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_pan_verified"
                    checked={formData.is_pan_verified}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("is_pan_verified", checked)
                    }
                  />
                  <Label
                    htmlFor="is_pan_verified"
                    className="text-xs whitespace-nowrap"
                  >
                    Verified
                  </Label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="gst_number" className="text-right">
                GST Number
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="gst_number"
                  name="gst_number"
                  placeholder="22AAAAA0000A1Z5"
                  className="flex-1"
                  value={formData.gst_number}
                  onChange={handleInputChange}
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_gst_verified"
                    checked={formData.is_gst_verified}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("is_gst_verified", checked)
                    }
                  />
                  <Label
                    htmlFor="is_gst_verified"
                    className="text-xs whitespace-nowrap"
                  >
                    Verified
                  </Label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_verified" className="text-right">
                Verified
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="is_verified"
                  checked={formData.is_verified}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("is_verified", checked)
                  }
                />
                <Label htmlFor="is_verified">
                  {formData.is_verified ? "Yes" : "No"}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddAccountOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAddAccount}>Add Account</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bank Account Dialog */}
      <Dialog open={isEditAccountOpen} onOpenChange={setIsEditAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Bank Account</DialogTitle>
            <DialogDescription>
              Update bank account information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_account_name" className="text-right">
                Account Name
              </Label>
              <Input
                id="edit_account_name"
                name="account_name"
                placeholder="Account holder name"
                className="col-span-3"
                value={formData.account_name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_account_number" className="text-right">
                Account Number*
              </Label>
              <Input
                id="edit_account_number"
                name="account_number"
                placeholder="Account number"
                className="col-span-3"
                value={formData.account_number}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_ifsc_code" className="text-right">
                IFSC Code*
              </Label>
              <Input
                id="edit_ifsc_code"
                name="ifsc_code"
                placeholder="IFSC code"
                className="col-span-3"
                value={formData.ifsc_code}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_bank_name" className="text-right">
                Bank Name*
              </Label>
              <Input
                id="edit_bank_name"
                name="bank_name"
                placeholder="Bank name"
                className="col-span-3"
                value={formData.bank_name}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_branch_name" className="text-right">
                Branch Name
              </Label>
              <Input
                id="edit_branch_name"
                name="branch_name"
                placeholder="Branch name"
                className="col-span-3"
                value={formData.branch_name}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_is_primary" className="text-right">
                Primary Account
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="edit_is_primary"
                  checked={formData.is_primary}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("is_primary", checked)
                  }
                />
                <Label htmlFor="edit_is_primary">
                  {formData.is_primary ? "Yes" : "No"}
                </Label>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_pan_number" className="text-right">
                PAN Number
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="edit_pan_number"
                  name="pan_number"
                  placeholder="ABCDE1234F"
                  className="flex-1"
                  value={formData.pan_number}
                  onChange={handleInputChange}
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit_is_pan_verified"
                    checked={formData.is_pan_verified}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("is_pan_verified", checked)
                    }
                  />
                  <Label
                    htmlFor="edit_is_pan_verified"
                    className="text-xs whitespace-nowrap"
                  >
                    Verified
                  </Label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_gst_number" className="text-right">
                GST Number
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="edit_gst_number"
                  name="gst_number"
                  placeholder="22AAAAA0000A1Z5"
                  className="flex-1"
                  value={formData.gst_number}
                  onChange={handleInputChange}
                />
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit_is_gst_verified"
                    checked={formData.is_gst_verified}
                    onCheckedChange={(checked) =>
                      handleSwitchChange("is_gst_verified", checked)
                    }
                  />
                  <Label
                    htmlFor="edit_is_gst_verified"
                    className="text-xs whitespace-nowrap"
                  >
                    Verified
                  </Label>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit_is_verified" className="text-right">
                Verified
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="edit_is_verified"
                  checked={formData.is_verified}
                  onCheckedChange={(checked) =>
                    handleSwitchChange("is_verified", checked)
                  }
                />
                <Label htmlFor="edit_is_verified">
                  {formData.is_verified ? "Yes" : "No"}
                </Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditAccountOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateAccount}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this bank account? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Bank Accounts</h2>
        <Button size="sm" onClick={() => setIsAddAccountOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Bank Account
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {bankAccounts.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-muted-foreground">
                No bank accounts added yet. Add your first bank account to
                receive payments.
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {bankAccounts.map((account) => (
                <div
                  key={account.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {account.account_name || account.bank_name}
                      </span>
                      {account.is_primary && (
                        <Badge className="bg-blue-500 text-white">
                          Primary
                        </Badge>
                      )}
                      {account.is_verified && (
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-800"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" /> Verified
                        </Badge>
                      )}
                      {account.is_shared && (
                        <Badge
                          variant="outline"
                          className="bg-purple-100 text-purple-800"
                        >
                          Shared
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <CreditCard className="h-3 w-3 mr-1" />
                        <span>A/C: {account.account_number}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Building className="h-3 w-3 mr-1" />
                        <span>
                          {account.bank_name} • IFSC: {account.ifsc_code}
                        </span>
                      </div>
                      {account.pan_number && (
                        <div className="flex items-center mt-1">
                          <span className="font-medium text-xs mr-1">PAN:</span>
                          <span>{account.pan_number}</span>
                          {account.is_pan_verified && (
                            <Badge
                              variant="outline"
                              className="ml-1 text-xs bg-green-100 text-green-800"
                            >
                              ✓
                            </Badge>
                          )}
                        </div>
                      )}
                      {account.gst_number && (
                        <div className="flex items-center mt-1">
                          <span className="font-medium text-xs mr-1">GST:</span>
                          <span>{account.gst_number}</span>
                          {account.is_gst_verified && (
                            <Badge
                              variant="outline"
                              className="ml-1 text-xs bg-green-100 text-green-800"
                            >
                              ✓
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {!account.is_shared && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAccount(account);
                            setIsEditAccountOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedAccount(account);
                            setIsDeleteConfirmOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {account.is_shared && (
                      <Button variant="outline" size="sm" disabled>
                        Linked Account
                      </Button>
                    )}
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

export default BankAccountsList;
