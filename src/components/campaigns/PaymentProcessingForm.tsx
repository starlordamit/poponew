import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  CreditCard,
  Building,
  Calculator,
  Receipt,
  Percent,
  DollarSign,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { InfluencerBankAccount } from "@/types/schema";

interface PaymentProcessingFormProps {
  influencerId: string;
  totalAmount: number;
  onSuccess?: (paymentData: any) => void;
  onCancel?: () => void;
}

const PaymentProcessingForm = ({
  influencerId,
  totalAmount,
  onSuccess,
  onCancel,
}: PaymentProcessingFormProps) => {
  // Get video ID from URL
  const videoId = window.location.pathname.split("/").pop() || "";

  // State to track if this is the final payment for the video
  const [isFullPayment, setIsFullPayment] = useState<boolean>(true);
  const { toast } = useToast();
  const [bankAccounts, setBankAccounts] = useState<InfluencerBankAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedAccount, setSelectedAccount] =
    useState<InfluencerBankAccount | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [tdsRate, setTdsRate] = useState<string>("0");
  const [paymentAmount, setPaymentAmount] = useState<number>(totalAmount);
  const [tdsAmount, setTdsAmount] = useState<number>(0);
  const [netAmount, setNetAmount] = useState<number>(totalAmount);
  const [reference, setReference] = useState<string>("");
  const [applyAgencyFees, setApplyAgencyFees] = useState<boolean>(false);
  const [agencyFeesRate, setAgencyFeesRate] = useState<string>("10");
  const [agencyFeesAmount, setAgencyFeesAmount] = useState<number>(0);

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

  // Calculate TDS, agency fees, and net amount when values change
  useEffect(() => {
    // Calculate TDS
    const tdsRateValue = parseFloat(tdsRate) / 100;
    const tds = paymentAmount * tdsRateValue;
    setTdsAmount(tds);

    // Calculate agency fees if applicable
    let agencyFees = 0;
    if (applyAgencyFees) {
      const agencyRate = parseFloat(agencyFeesRate) / 100;
      agencyFees = paymentAmount * agencyRate;
      setAgencyFeesAmount(agencyFees);
    } else {
      setAgencyFeesAmount(0);
    }

    // Calculate net amount after deductions
    const net = paymentAmount - tds - agencyFees;
    setNetAmount(net);
  }, [tdsRate, paymentAmount, applyAgencyFees, agencyFeesRate]);

  const handleAccountChange = (accountId: string) => {
    setSelectedAccountId(accountId);
  };

  const handleTdsRateChange = (rate: string) => {
    setTdsRate(rate);
  };

  const handleAgencyFeesRateChange = (rate: string) => {
    setAgencyFeesRate(rate);
  };

  const handlePaymentAmountChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setPaymentAmount(value);
    }
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

    if (!reference) {
      toast({
        title: "Reference required",
        description: "Please enter a payment reference or UTR number.",
        variant: "destructive",
      });
      return;
    }

    setProcessingPayment(true);

    try {
      console.log("Inserting transaction with data:", {
        influencer_id: influencerId,
        video_id: videoId,
        bank_account_id: selectedAccount.id,
        amount: netAmount,
        total_amount: paymentAmount,
        tds_rate: parseFloat(tdsRate),
        tds_amount: tdsAmount,
        agency_fees_rate: applyAgencyFees ? parseFloat(agencyFeesRate) : null,
        agency_fees_amount: agencyFeesAmount,
        reference: reference,
      });

      // Create transaction record in the database
      const transactionData = {
        influencer_id: influencerId,
        video_id: videoId,
        bank_account_id: selectedAccount.id,
        amount: netAmount,
        total_amount: paymentAmount,
        tds_rate: parseFloat(tdsRate),
        tds_amount: tdsAmount,
        agency_fees_rate: applyAgencyFees ? parseFloat(agencyFeesRate) : null,
        agency_fees_amount: agencyFeesAmount,
        reference: reference,
        status: "completed",
        payment_method: "bank_transfer",
        bank_name: selectedAccount.bank_name,
        account_number: selectedAccount.account_number,
        notes: "Payment processed through Tempo platform",
      };

      console.log("Transaction data to insert:", transactionData);

      const { data: insertedData, error: transactionError } = await supabase
        .from("transactions")
        .insert([transactionData])
        .select();

      if (transactionError) {
        console.error("Error creating transaction record:", transactionError);
        toast({
          title: "Database Error",
          description: `Failed to save transaction: ${transactionError.message}`,
          variant: "destructive",
        });
        // Don't continue if transaction record fails
        setProcessingPayment(false);
        return;
      }

      console.log("Transaction created successfully:", insertedData);

      // Create payment data object for the parent component
      const paymentData = {
        timestamp: new Date().toISOString(),
        bank_account_id: selectedAccount.id,
        account_number: selectedAccount.account_number,
        bank_name: selectedAccount.bank_name,
        total_amount: paymentAmount,
        tds_rate: parseFloat(tdsRate),
        tds_amount: tdsAmount,
        agency_fees_rate: applyAgencyFees ? parseFloat(agencyFeesRate) : null,
        agency_fees_amount: agencyFeesAmount,
        net_amount: netAmount,
        reference: reference,
        status: "completed",
        transaction_id: insertedData?.[0]?.id || null,
        video_id: videoId,
        is_full_payment: isFullPayment,
      };

      toast({
        title: "Payment processed",
        description: `Payment of ₹${netAmount.toFixed(2)} has been processed to account ${selectedAccount.account_number}.`,
      });

      if (onSuccess) {
        onSuccess(paymentData);
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
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-h-[70vh] overflow-y-auto pr-1">
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Process Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payment-amount">Payment Amount</Label>
            <Input
              id="payment-amount"
              type="number"
              value={paymentAmount}
              onChange={handlePaymentAmountChange}
              className="font-medium"
            />
            <p className="text-xs text-muted-foreground">
              Default: ₹{totalAmount.toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tds-rate">TDS Rate</Label>
            <Select value={tdsRate} onValueChange={handleTdsRateChange}>
              <SelectTrigger id="tds-rate">
                <SelectValue placeholder="Select TDS rate" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No TDS (0%)</SelectItem>
                <SelectItem value="1">1% TDS</SelectItem>
                <SelectItem value="2">2% TDS</SelectItem>
                <SelectItem value="5">5% TDS</SelectItem>
                <SelectItem value="10">10% TDS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="apply-agency-fees" className="cursor-pointer">
                Apply Agency Fees
              </Label>
              <Switch
                id="apply-agency-fees"
                checked={applyAgencyFees}
                onCheckedChange={setApplyAgencyFees}
              />
            </div>

            {applyAgencyFees && (
              <div className="pt-2">
                <Label htmlFor="agency-fees-rate">Agency Fees Rate</Label>
                <Select
                  value={agencyFeesRate}
                  onValueChange={handleAgencyFeesRateChange}
                >
                  <SelectTrigger id="agency-fees-rate">
                    <SelectValue placeholder="Select agency fees rate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5% Agency Fees</SelectItem>
                    <SelectItem value="10">10% Agency Fees</SelectItem>
                    <SelectItem value="15">15% Agency Fees</SelectItem>
                    <SelectItem value="20">20% Agency Fees</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="p-3 border rounded-md bg-muted/10 space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm">Payment Amount</span>
              </div>
              <span className="font-medium">₹{paymentAmount.toFixed(2)}</span>
            </div>

            {tdsRate !== "0" && (
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Percent className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">TDS ({tdsRate}%)</span>
                </div>
                <span className="font-medium text-destructive">
                  -₹{tdsAmount.toFixed(2)}
                </span>
              </div>
            )}

            {applyAgencyFees && (
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Percent className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">
                    Agency Fees ({agencyFeesRate}%)
                  </span>
                </div>
                <span className="font-medium text-destructive">
                  -₹{agencyFeesAmount.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t mt-1">
              <div className="flex items-center">
                <Receipt className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm font-medium">Net Payable</span>
              </div>
              <span className="font-medium">₹{netAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank-account">Select Bank Account</Label>
            <Select
              value={selectedAccountId}
              onValueChange={handleAccountChange}
            >
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

          <div className="space-y-2">
            <Label htmlFor="reference">Payment Reference/UTR</Label>
            <Input
              id="reference"
              placeholder="Enter payment reference or UTR number"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
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
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleProcessPayment}
              disabled={processingPayment || !selectedAccount || !reference}
            >
              {processingPayment ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Process Payment of ₹{netAmount.toFixed(2)}</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentProcessingForm;
