import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Receipt, Download, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Transaction {
  id: string;
  timestamp: string;
  amount: number;
  reference: string;
  bank_account?: {
    bank_name: string;
    account_number: string;
  };
  tds_rate?: number;
  tds_amount?: number;
  agency_fees_rate?: number;
  agency_fees_amount?: number;
  total_amount?: number;
  net_amount?: number;
  status: string;
  video_id?: string;
  influencer_id: string;
}

interface TransactionHistoryProps {
  influencerId?: string;
  videoId?: string;
  showTitle?: boolean;
}

const TransactionHistory = ({
  influencerId,
  videoId,
  showTitle = true,
}: TransactionHistoryProps) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState<
    Transaction[]
  >([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        // First try to fetch from the transactions table
        let query = supabase
          .from("transactions")
          .select("*")
          .order("created_at", { ascending: false });

        // Apply filters if provided
        if (videoId) {
          query = query.eq("video_id", videoId);
        }

        if (influencerId) {
          query = query.eq("influencer_id", influencerId);
        }

        const { data: transactionData, error: transactionError } = await query;

        if (transactionError) throw transactionError;

        // Map database transactions to our Transaction interface
        const dbTransactions: Transaction[] = transactionData
          ? transactionData.map((item: any) => ({
              id: item.id,
              timestamp: item.created_at,
              amount: item.amount || 0,
              reference: item.reference || "N/A",
              bank_account: {
                bank_name: item.bank_name,
                account_number: item.account_number,
              },
              tds_rate: item.tds_rate,
              tds_amount: item.tds_amount,
              agency_fees_rate: item.agency_fees_rate,
              agency_fees_amount: item.agency_fees_amount,
              total_amount: item.total_amount,
              net_amount: item.amount,
              status: item.status,
              video_id: item.video_id,
              influencer_id: item.influencer_id,
            }))
          : [];

        // If no transactions found in the transactions table or the table is empty,
        // fall back to extracting from campaign_videos edit_history
        if (dbTransactions.length === 0) {
          // Fallback to extracting from edit_history
          const { data: videos, error } = await supabase
            .from("campaign_videos")
            .select("*")
            .eq("payment_status", "paid")
            .order("updated_at", { ascending: false });

          if (error) throw error;

          // Filter by video_id if provided
          let filteredVideos = videos;
          if (videoId) {
            filteredVideos = videos.filter((video) => video.id === videoId);
          }

          // Filter by influencer_id if provided
          if (influencerId) {
            filteredVideos = filteredVideos.filter(
              (video) => video.profile_id === influencerId,
            );
          }

          // Extract transactions from edit_history
          const extractedTransactions: Transaction[] = [];

          filteredVideos.forEach((video) => {
            if (video.edit_history && Array.isArray(video.edit_history)) {
              video.edit_history.forEach((entry: any) => {
                if (entry.action === "payment_processed" && entry.timestamp) {
                  extractedTransactions.push({
                    id: `${video.id}-${entry.timestamp}`,
                    timestamp: entry.timestamp,
                    amount: entry.amount || 0,
                    reference: entry.reference || "N/A",
                    bank_account: entry.bank_account,
                    tds_rate: entry.tds_rate,
                    tds_amount: entry.tds_amount,
                    agency_fees_rate: entry.agency_fees_rate,
                    agency_fees_amount: entry.agency_fees_amount,
                    total_amount: entry.total_amount,
                    net_amount: entry.amount,
                    status: "completed",
                    video_id: video.id,
                    influencer_id: video.profile_id,
                  });
                }
              });
            }
          });

          setTransactions(extractedTransactions);
          setFilteredTransactions(extractedTransactions);
        } else {
          // Use the transactions from the database
          setTransactions(dbTransactions);
          setFilteredTransactions(dbTransactions);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [influencerId, videoId]);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredTransactions(transactions);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = transactions.filter(
      (transaction) =>
        transaction.reference.toLowerCase().includes(query) ||
        transaction.bank_account?.bank_name.toLowerCase().includes(query) ||
        transaction.bank_account?.account_number.toLowerCase().includes(query),
    );

    setFilteredTransactions(filtered);
  }, [searchQuery, transactions]);

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Calculate total payments for a video (including TDS)
  const calculateTotalPayments = (videoId: string) => {
    return transactions
      .filter((t) => t.video_id === videoId)
      .reduce((sum, t) => sum + (t.amount || 0) + (t.tds_amount || 0), 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="h-5 w-5 mr-2" />
            Transaction History
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        {transactions.length > 0 ? (
          <>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by reference or bank..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" /> Export
              </Button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="p-3 border rounded-md bg-muted/10"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">
                        ₹{transaction.amount.toFixed(2)}
                        <Badge className="ml-2 bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(transaction.timestamp)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Ref: {transaction.reference}
                      </div>
                      {transaction.bank_account && (
                        <div className="text-xs text-muted-foreground flex items-center justify-end">
                          <CreditCard className="h-3 w-3 mr-1" />
                          {transaction.bank_account.bank_name} -{" "}
                          {transaction.bank_account.account_number.slice(-4)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground mt-2 border-t pt-2">
                    <div className="grid grid-cols-2 gap-1">
                      <div>Total Amount:</div>
                      <div className="text-right">
                        ₹{transaction.total_amount?.toFixed(2)}
                      </div>
                      <div>TDS ({transaction.tds_rate}%):</div>
                      <div className="text-right">
                        ₹{transaction.tds_amount?.toFixed(2)}
                      </div>
                      {transaction.agency_fees_rate > 0 && (
                        <>
                          <div>
                            Agency Fees ({transaction.agency_fees_rate}%):
                          </div>
                          <div className="text-right">
                            ₹{transaction.agency_fees_amount?.toFixed(2)}
                          </div>
                        </>
                      )}
                      <div className="font-medium">Net Amount:</div>
                      <div className="text-right font-medium">
                        ₹{transaction.net_amount?.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No transaction history found
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;
