import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, CreditCard, Building } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { InfluencerBankAccount } from "@/types/schema";

interface PaymentFormProps {
  influencerId: string;
  amount: number;
  onSuccess?: () => void;
}

const PaymentForm = ({ influencerId, amount, onSuccess }: PaymentFormProps) => {
  const { toast } = useToast();
  const [bankAccounts, setBankAccounts] = useState<InfluencerBankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedAccount, setSelectedAccount] =
    useState<InfluencerBankAccount | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

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

        // Auto-select primary account if available
        const primaryAccount = allAccounts.find((acc) => acc.is_primary);
        if (primaryAccount) {
          setSelectedAccountId(primaryAccount.id);
          setSelectedAccount(primaryAccount);
        } else if (allAccounts.length > 0) {
          setSelectedAccountId(allAccounts[0].id);
          setSelectedAccount(allAccounts[0]);
        }
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

  // Update selected account when selection changes
  useEffect(() => {
    const account = bankAccounts.find((acc) => acc.id === selectedAccountId);
    setSelectedAccount(account || null);
  }, [selectedAccountId, bankAccounts]);

  const handleAccountChange = (accountId: string) => {
    setSelectedAccountId(accountId);
  };

  const handleProcessPayment = async () => {
    if (!selectedAccount) {
      toast({
        title: "No account selected",
        description: "Please select a bank account to process the payment.",
        variant: "destructive",
      });
      return;
    }

    setProcessingPayment(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Here you would integrate with your actual payment processing system
      // For now, we'll just show a success message

      toast({
        title: "Payment processed",
        description: `Payment of ₹${amount.toFixed(2)} has been initiated to account ${selectedAccount.account_number}.`,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment failed",
        description:
          "There was an error processing the payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (bankAccounts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            No bank accounts found for this influencer. Please add a bank
            account before processing payments.
          </p>
          <Button variant="outline" disabled>
            Process Payment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Process Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="payment-amount">Payment Amount</Label>
          <Input id="payment-amount" value={`₹${amount.toFixed(2)}`} disabled />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bank-account">Select Bank Account</Label>
          <Select value={selectedAccountId} onValueChange={handleAccountChange}>
            <SelectTrigger id="bank-account">
              <SelectValue placeholder="Select a bank account" />
            </SelectTrigger>
            <SelectContent>
              {bankAccounts.map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.bank_name} - {account.account_number}
                  {account.is_primary ? " (Primary)" : ""}
                  {account.is_shared ? " (Shared)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedAccount && (
          <div className="border rounded-md p-4 mt-4 bg-muted/20">
            <h3 className="font-medium mb-2">Selected Account Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  <span className="font-medium">Account Number:</span>{" "}
                  {selectedAccount.account_number}
                </span>
              </div>
              <div className="flex items-center">
                <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  <span className="font-medium">Bank:</span>{" "}
                  {selectedAccount.bank_name}
                </span>
              </div>
              <div>
                <span className="font-medium">IFSC:</span>{" "}
                {selectedAccount.ifsc_code}
              </div>
              {selectedAccount.account_name && (
                <div>
                  <span className="font-medium">Account Name:</span>{" "}
                  {selectedAccount.account_name}
                </div>
              )}
              {selectedAccount.branch_name && (
                <div>
                  <span className="font-medium">Branch:</span>{" "}
                  {selectedAccount.branch_name}
                </div>
              )}
            </div>
          </div>
        )}

        <Button
          className="w-full mt-4"
          onClick={handleProcessPayment}
          disabled={processingPayment || !selectedAccount}
        >
          {processingPayment ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Process Payment"
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
