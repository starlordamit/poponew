import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VideoPreview from "./VideoPreview";
import PaymentProcessingForm from "./PaymentProcessingForm";
import PaymentSlip from "./PaymentSlip";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  DollarSign,
  Link as LinkIcon,
  FileText,
  Edit,
  ExternalLink,
  Clock,
  User,
  Building,
  Video,
  Trash2,
  AlertCircle,
  CreditCard,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  History,
  Eye,
  EyeOff,
  Shield,
  Mail,
  Receipt,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { CampaignVideo, Influencer, Brand, Campaign } from "@/types/schema";
import { useData } from "@/context/DataContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import TransactionHistory from "@/components/finances/TransactionHistory";

const CampaignVideoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { influencers, brands, campaigns } = useData();

  const [loading, setLoading] = useState(true);
  const [video, setVideo] = useState<CampaignVideo | null>(null);
  const [influencer, setInfluencer] = useState<Influencer | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [activeFinancialTab, setActiveFinancialTab] = useState("creator");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [totalPaidAmount, setTotalPaidAmount] = useState<number>(0);
  const [transactions, setTransactions] = useState<any[]>([]);

  // Mock user role - in a real app, this would come from auth context
  const userRole = "admin"; // Options: admin, brand_manager, finance

  // Fetch video data
  useEffect(() => {
    const fetchVideo = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("campaign_videos")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        setVideo(data as CampaignVideo);

        // Find related entities
        const relatedInfluencer = influencers.find(
          (inf) => inf.id === data.profile_id,
        );
        setInfluencer(relatedInfluencer || null);

        if (data.brand_id) {
          const relatedBrand = brands.find((b) => b.id === data.brand_id);
          setBrand(relatedBrand || null);
        }

        if (data.campaign) {
          const relatedCampaign = campaigns.find((c) => c.id === data.campaign);
          setCampaign(relatedCampaign || null);
        }

        // Fetch total paid amount
        fetchTotalPaidAmount(data.id);
      } catch (err) {
        console.error("Error fetching video:", err);
        toast({
          title: "Error",
          description: "Failed to load video data. Please try again.",
          variant: "destructive",
        });
        navigate("/campaigns");
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [id, navigate, toast, influencers, brands, campaigns]);

  // Fetch total paid amount from transactions
  const fetchTotalPaidAmount = async (videoId: string) => {
    try {
      console.log("Fetching transactions for video ID:", videoId);
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("video_id", videoId);

      if (error) throw error;

      console.log("Transactions data received:", data);

      if (!data || data.length === 0) {
        console.log("No transactions found for this video");
        setTotalPaidAmount(0);
        setTransactions([]);
        return;
      }

      // Sum up total amounts (this is the base amount before deductions)
      const total = data.reduce((total, transaction) => {
        return total + (transaction.total_amount || 0);
      }, 0);

      console.log("Total paid amount calculated:", total);
      setTotalPaidAmount(total);

      // Store transactions in state for display
      setTransactions(data);
    } catch (err) {
      console.error("Error calculating total paid amount:", err);
      setTotalPaidAmount(0);
      setTransactions([]);
    }
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not scheduled";
    return new Date(dateString).toLocaleDateString();
  };

  // Get status badge color
  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return "bg-gray-200 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "live":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Handle video deletion (soft delete)
  const handleDeleteVideo = async () => {
    if (!video) return;

    try {
      const { error } = await supabase
        .from("campaign_videos")
        .update({ is_deleted: true })
        .eq("id", video.id);

      if (error) throw error;

      toast({
        title: "Video deleted",
        description: "The video has been successfully deleted.",
      });

      navigate("/campaigns");
    } catch (err) {
      console.error("Error deleting video:", err);
      toast({
        title: "Error",
        description: "Failed to delete the video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  // Calculate total payable amount (creator price + reimbursements)
  const calculateTotalPayable = () => {
    if (!video) return 0;

    const creatorPrice = video.creator_price || 0;
    const reimbursements = video.additional_links?.reimbursements
      ? video.additional_links.reimbursements.reduce(
          (sum, item) => sum + (parseFloat(item.amount) || 0),
          0,
        )
      : 0;

    return creatorPrice + reimbursements;
  };

  // Calculate total paid amount from transactions
  const calculateTotalPaid = async () => {
    if (!video?.id) return 0;

    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("amount, tds_amount, agency_fees_amount")
        .eq("video_id", video.id);

      if (error) throw error;

      if (!data || data.length === 0) return 0;

      // Sum up total amounts (this is the base amount before deductions)
      return data.reduce((total, transaction) => {
        return total + (transaction.total_amount || 0);
      }, 0);
    } catch (err) {
      console.error("Error calculating total paid amount:", err);
      return 0;
    }
  };

  // Handle payment processing
  const handleProcessPayment = async (paymentData: any) => {
    if (!video) return;

    try {
      // Calculate total payable amount
      const totalPayable = calculateTotalPayable();

      // Calculate total amount already paid
      const totalPaid = await calculateTotalPaid();

      // Add current payment amount (including TDS and agency fees)
      const currentPaymentTotal = paymentData.total_amount;
      const newTotalPaid = totalPaid + currentPaymentTotal;

      // Determine payment status based on whether total paid >= total payable
      const paymentStatus = newTotalPaid >= totalPayable ? "paid" : "partial";

      console.log("Payment calculation:", {
        totalPayable,
        totalPaid,
        currentPaymentTotal,
        newTotalPaid,
        paymentStatus,
      });

      // Update the payment status and add payment details to history
      const { error } = await supabase
        .from("campaign_videos")
        .update({
          payment_status: paymentStatus,
          // If all deliverables are completed and payment is complete, update status to "completed"
          status:
            isAllDeliverablesCompleted() && paymentStatus === "paid"
              ? "completed"
              : video.status,
          // Add payment details to edit history
          edit_history: [
            ...(video.edit_history || []),
            {
              timestamp: new Date().toISOString(),
              user_id: (await supabase.auth.getUser()).data.user?.id,
              action: "payment_processed",
              payment_details: paymentData,
              amount: paymentData.net_amount,
              total_amount: paymentData.total_amount,
              tds_amount: paymentData.tds_amount,
              tds_rate: paymentData.tds_rate,
              agency_fees_amount: paymentData.agency_fees_amount,
              agency_fees_rate: paymentData.agency_fees_rate,
              reference: paymentData.reference,
              transaction_id: paymentData.transaction_id,
              is_full_payment: newTotalPaid >= totalPayable,
              total_payable: totalPayable,
              total_paid_before: totalPaid,
              total_paid_after: newTotalPaid,
              bank_account: {
                bank_name: paymentData.bank_name,
                account_number: paymentData.account_number,
              },
            },
          ],
        })
        .eq("id", video.id);

      if (error) throw error;

      toast({
        title: "Payment processed",
        description: `Payment of ₹${paymentData.net_amount.toFixed(2)} has been processed successfully.`,
      });

      // Refresh video data
      const { data } = await supabase
        .from("campaign_videos")
        .select("*")
        .eq("id", video.id)
        .single();

      setVideo(data as CampaignVideo);

      // Update total paid amount
      setTotalPaidAmount(newTotalPaid);

      // Refresh transactions
      fetchTotalPaidAmount(video.id);
    } catch (err) {
      console.error("Error processing payment:", err);
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPaymentDialogOpen(false);
    }
  };

  // Check if all deliverables are completed
  const isAllDeliverablesCompleted = () => {
    if (!video?.deliverables) return false;

    try {
      let deliverableItems = [];
      if (typeof video.deliverables === "string") {
        deliverableItems = JSON.parse(video.deliverables);
      } else if (Array.isArray(video.deliverables)) {
        deliverableItems = video.deliverables;
      }

      return (
        deliverableItems.length > 0 &&
        deliverableItems.every((d) => d.completed)
      );
    } catch (e) {
      console.error("Error checking deliverables completion:", e);
      return false;
    }
  };

  // Check if user has permission for certain actions
  const hasEditPermission = () => {
    return userRole === "admin" || userRole === "brand_manager";
  };

  const hasDeletePermission = () => {
    return userRole === "admin";
  };

  const hasPaymentPermission = () => {
    return userRole === "admin" || userRole === "finance";
  };

  // Calculate reimbursement total
  const calculateReimbursementTotal = () => {
    if (!video?.additional_links?.reimbursements) return 0;

    return video.additional_links.reimbursements.reduce(
      (sum, item) => sum + (parseFloat(item.amount) || 0),
      0,
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="text-center py-10">
        <p>Video not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/campaigns")}
        >
          Back to Videos
        </Button>
      </div>
    );
  }

  // Calculate financial values
  const creatorPrice = video.creator_price || 0;
  const reimbursementTotal = calculateReimbursementTotal();
  const totalPayable = creatorPrice + reimbursementTotal;
  const brandPrice = video.brand_price || 0;
  const margin = brandPrice - totalPayable;
  const marginPercentage = brandPrice > 0 ? (margin / brandPrice) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this video? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteVideo}>
              Delete Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Payment Processing Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Process payment for {influencer?.name}'s video content.
            </DialogDescription>
          </DialogHeader>
          {influencer && (
            <PaymentProcessingForm
              influencerId={influencer.id}
              totalAmount={video.creator_price || 0}
              onSuccess={handleProcessPayment}
              onCancel={() => setIsPaymentDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/campaigns")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Video Details</h1>
          {userRole === "admin" && (
            <Badge className="ml-2 bg-purple-100 text-purple-800">
              <Shield className="h-3 w-3 mr-1" /> Admin View
            </Badge>
          )}
        </div>
        <div className="flex space-x-2">
          {video.video_url && (
            <Button
              variant="outline"
              onClick={() => window.open(video.video_url, "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" /> Open Video
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <MoreHorizontal className="mr-2 h-4 w-4" /> Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Video Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {hasEditPermission() && (
                <DropdownMenuItem onClick={() => navigate(`/video/${id}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" /> Edit Video
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => setIsHistoryVisible(!isHistoryVisible)}
              >
                <History className="h-4 w-4 mr-2" />
                {isHistoryVisible ? "Hide Edit History" : "View Edit History"}
              </DropdownMenuItem>
              {hasPaymentPermission() && video.creator_price && (
                <DropdownMenuItem onClick={() => setIsPaymentDialogOpen(true)}>
                  <CreditCard className="h-4 w-4 mr-2" /> Process Payment
                </DropdownMenuItem>
              )}
              {hasDeletePermission() && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Video
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {/* Status Banner */}
      <div
        className={`p-4 rounded-lg ${getStatusBadgeColor(video.status)} flex justify-between items-center`}
      >
        <div className="flex items-center">
          {video.status.toLowerCase() === "approved" ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : video.status.toLowerCase() === "rejected" ? (
            <XCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          <span className="font-medium">
            Status:{" "}
            {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
          </span>
        </div>
        {hasEditPermission() && (
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate(`/video/${id}/edit`)}
          >
            Change Status
          </Button>
        )}
      </div>
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Video Preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Video Preview</CardTitle>
              {video.video_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(video.video_url, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" /> Open Original
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted relative rounded-md overflow-hidden">
                {video.video_url ? (
                  <VideoPreview url={video.video_url} />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Confirmation Email Details - Shown directly on the video card */}
              {video.status === "approved" && (
                <div className="mt-4 p-3 border rounded-md bg-green-50">
                  <div className="flex items-center text-green-800 font-medium mb-2">
                    <Mail className="h-4 w-4 mr-2" />
                    Confirmation Sent
                  </div>
                  <p className="text-sm text-green-700">
                    Confirmation email was sent to {influencer?.name} on{" "}
                    {formatDate(video.updated_at)}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tabs for different sections */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="deliverables">Deliverables</TabsTrigger>
              <TabsTrigger value="links">Additional Links</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Video Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Live Date</p>
                      <p className="font-medium flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formatDate(video.live_date)}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="font-medium flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formatDate(video.created_at)}
                      </p>
                    </div>
                  </div>

                  {/* Edit History */}
                  {isHistoryVisible &&
                    video.edit_history &&
                    Array.isArray(video.edit_history) &&
                    video.edit_history.length > 0 && (
                      <>
                        <Separator className="my-4" />
                        <div>
                          <h3 className="font-medium mb-2 flex items-center">
                            <History className="h-4 w-4 mr-2" /> Edit History
                          </h3>
                          <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {video.edit_history.map(
                              (entry: any, index: number) => (
                                <div
                                  key={index}
                                  className="text-sm p-2 border rounded-md bg-muted/20"
                                >
                                  <div className="flex justify-between">
                                    <span className="font-medium">
                                      {entry.action || "Updated"}
                                    </span>
                                    <span className="text-muted-foreground">
                                      {new Date(
                                        entry.timestamp,
                                      ).toLocaleString()}
                                    </span>
                                  </div>
                                  {entry.previous_data && (
                                    <div className="mt-1 text-xs text-muted-foreground">
                                      {Object.entries(entry.previous_data).map(
                                        ([key, value]: [string, any]) => (
                                          <div key={key}>
                                            {key}: {value?.toString() || "none"}
                                          </div>
                                        ),
                                      )}
                                    </div>
                                  )}
                                  {entry.payment_details && (
                                    <div className="mt-1 text-xs space-y-1">
                                      <div className="font-medium">
                                        Payment Details:
                                      </div>
                                      <div>
                                        Total Amount: ₹
                                        {entry.total_amount?.toFixed(2)}
                                      </div>
                                      {entry.tds_rate > 0 && (
                                        <>
                                          <div>TDS Rate: {entry.tds_rate}%</div>
                                          <div>
                                            TDS Amount: ₹
                                            {entry.tds_amount?.toFixed(2)}
                                          </div>
                                        </>
                                      )}
                                      {entry.agency_fees_rate > 0 && (
                                        <>
                                          <div>
                                            Agency Fees Rate:{" "}
                                            {entry.agency_fees_rate}%
                                          </div>
                                          <div>
                                            Agency Fees: ₹
                                            {entry.agency_fees_amount?.toFixed(
                                              2,
                                            )}
                                          </div>
                                        </>
                                      )}
                                      <div>
                                        Net Amount: ₹{entry.amount?.toFixed(2)}
                                      </div>
                                      {entry.reference && (
                                        <div>Reference: {entry.reference}</div>
                                      )}
                                      {entry.bank_account && (
                                        <div>
                                          Bank: {entry.bank_account.bank_name} -{" "}
                                          {entry.bank_account.account_number}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {entry.amount && !entry.payment_details && (
                                    <div className="mt-1 text-xs">
                                      Amount: ₹{entry.amount}
                                    </div>
                                  )}
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      </>
                    )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="deliverables" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Deliverables</CardTitle>
                </CardHeader>
                <CardContent>
                  {video.deliverables ? (
                    <div className="space-y-4">
                      {(() => {
                        let deliverableItems = [];
                        try {
                          if (typeof video.deliverables === "string") {
                            deliverableItems = JSON.parse(video.deliverables);
                          } else if (Array.isArray(video.deliverables)) {
                            deliverableItems = video.deliverables;
                          }
                        } catch (e) {
                          console.error("Error parsing deliverables:", e);
                          return (
                            <div className="whitespace-pre-wrap">
                              {typeof video.deliverables === "string"
                                ? video.deliverables
                                : JSON.stringify(video.deliverables, null, 2)}
                            </div>
                          );
                        }

                        if (
                          Array.isArray(deliverableItems) &&
                          deliverableItems.length > 0
                        ) {
                          // Check if all deliverables are completed
                          const allCompleted = deliverableItems.every(
                            (d) => d.completed,
                          );

                          return (
                            <>
                              {allCompleted && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
                                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                                  <span className="text-green-800">
                                    All deliverables have been completed
                                  </span>
                                </div>
                              )}
                              {deliverableItems.map((deliverable, index) => (
                                <div
                                  key={deliverable.id || index}
                                  className="p-3 border rounded-md bg-muted/10"
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="font-medium flex items-center">
                                      {deliverable.type}
                                      {deliverable.completed && (
                                        <Badge className="ml-2 bg-green-100 text-green-800">
                                          <CheckCircle className="h-3 w-3 mr-1" />{" "}
                                          Completed
                                        </Badge>
                                      )}
                                    </div>
                                    <Badge variant="outline">
                                      {deliverable.quantity}x
                                    </Badge>
                                  </div>
                                  {deliverable.notes && (
                                    <div className="text-sm text-muted-foreground mt-2">
                                      {deliverable.notes}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </>
                          );
                        } else {
                          return (
                            <div className="whitespace-pre-wrap">
                              {typeof video.deliverables === "string"
                                ? video.deliverables
                                : JSON.stringify(video.deliverables, null, 2)}
                            </div>
                          );
                        }
                      })()}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No deliverables specified
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="links" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Additional Links</CardTitle>
                </CardHeader>
                <CardContent>
                  {video.additional_links ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(video.additional_links)
                        .filter(([key]) => key !== "reimbursements")
                        .map(([platform, url]) => (
                          <a
                            key={platform}
                            href={url as string}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center p-3 border rounded-md hover:bg-muted transition-colors"
                          >
                            <LinkIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="font-medium capitalize">
                              {platform}
                            </span>
                            <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                          </a>
                        ))}
                      {Object.keys(video.additional_links).filter(
                        (key) => key !== "reimbursements",
                      ).length === 0 && (
                        <p className="text-muted-foreground col-span-2">
                          No additional links available
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No additional links available
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="mt-4">
              <TransactionHistory videoId={video.id} showTitle={false} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* Financial Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Details</CardTitle>
              {hasPaymentPermission() && (
                <CardDescription>
                  Manage payment information for this video
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Financial Toggle */}
                <div className="flex justify-center">
                  <div
                    className="inline-flex rounded-md shadow-sm"
                    role="group"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFinancialTab("creator")}
                      className={`px-4 py-2 text-sm font-medium rounded-l-lg ${activeFinancialTab === "creator" ? "bg-primary text-white" : "bg-white text-gray-900 hover:bg-gray-100 border border-gray-200"}`}
                    >
                      <User className="h-4 w-4 mr-2 inline" /> Creator
                      Financials
                    </button>
                    {(userRole === "admin" || userRole === "brand_manager") && (
                      <button
                        type="button"
                        onClick={() => setActiveFinancialTab("brand")}
                        className={`px-4 py-2 text-sm font-medium rounded-r-lg ${activeFinancialTab === "brand" ? "bg-primary text-white" : "bg-white text-gray-900 hover:bg-gray-100 border border-gray-200"}`}
                      >
                        <Building className="h-4 w-4 mr-2 inline" /> Brand
                        Financials
                      </button>
                    )}
                  </div>
                </div>

                {/* Creator Section */}
                {activeFinancialTab === "creator" && (
                  <div className="space-y-3 border rounded-md p-4">
                    <h3 className="font-semibold flex items-center">
                      <User className="h-4 w-4 mr-2" /> Creator Financials
                    </h3>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Creator Price</span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium">
                          {creatorPrice
                            ? `₹${creatorPrice.toFixed(2)}`
                            : "Not set"}
                        </span>
                      </div>
                    </div>

                    {/* Reimbursements */}
                    {video.additional_links?.reimbursements && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Reimbursements</span>
                        </div>
                        <span className="font-medium">
                          ₹{reimbursementTotal.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* Reimbursement Details */}
                    {video.additional_links?.reimbursements && (
                      <div className="mt-1 text-xs text-muted-foreground bg-muted/10 p-2 rounded">
                        {video.additional_links.reimbursements.map(
                          (item, index) => (
                            <div
                              key={item.id || index}
                              className="flex justify-between py-1"
                            >
                              <span>{item.description}</span>
                              <span>₹{parseFloat(item.amount).toFixed(2)}</span>
                            </div>
                          ),
                        )}
                      </div>
                    )}

                    {/* Total Payable Amount (Creator Price + Reimbursements) */}
                    {creatorPrice > 0 && (
                      <div className="flex items-center justify-between pt-2 border-t mt-2 font-medium">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Total Payable</span>
                        </div>
                        <span>₹{totalPayable.toFixed(2)}</span>
                      </div>
                    )}

                    {/* Transaction Summary */}
                    <div className="bg-muted/10 p-3 rounded-md mt-2">
                      <h4 className="text-sm font-medium mb-2">
                        Payment Summary
                      </h4>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between font-medium">
                          <span>Total Paid:</span>
                          <span>
                            ₹{totalPaidAmount.toFixed(2)} / ₹
                            {totalPayable.toFixed(2)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 mb-2">
                          <div
                            className="bg-primary h-1.5 rounded-full"
                            style={{
                              width: `${Math.min(100, (totalPaidAmount / totalPayable) * 100)}%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-sm font-medium pt-1">
                          <span>Payment Status:</span>
                          <Badge
                            className={
                              totalPaidAmount >= totalPayable
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }
                          >
                            {totalPaidAmount >= totalPayable
                              ? "Fully Paid"
                              : "Partially Paid"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Payment Button */}
                    {hasPaymentPermission() && creatorPrice > 0 && (
                      <div className="pt-2 mt-2">
                        <Button
                          onClick={() => setIsPaymentDialogOpen(true)}
                          disabled={totalPaidAmount >= totalPayable}
                          className="w-full"
                        >
                          {totalPaidAmount >= totalPayable ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" /> Payment
                              Completed
                            </>
                          ) : totalPaidAmount > 0 ? (
                            <>
                              <CreditCard className="mr-2 h-4 w-4" /> Complete
                              Payment
                            </>
                          ) : (
                            <>
                              <CreditCard className="mr-2 h-4 w-4" /> Process
                              Payment
                            </>
                          )}
                        </Button>

                        {/* Payment Slip Download Button */}
                        {transactions.length > 0 && (
                          <PaymentSlip
                            influencerName={influencer?.name || "Creator"}
                            videoUrl={video.video_url}
                            creatorPrice={creatorPrice}
                            reimbursementTotal={reimbursementTotal}
                            totalPayable={totalPayable}
                            totalPaidAmount={totalPaidAmount}
                            transactions={transactions}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Brand Section - Only visible to admin and brand_manager */}
                {activeFinancialTab === "brand" &&
                  (userRole === "admin" || userRole === "brand_manager") && (
                    <div className="space-y-3 border rounded-md p-4">
                      <h3 className="font-semibold flex items-center">
                        <Building className="h-4 w-4 mr-2" /> Brand Financials
                      </h3>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>Brand Price</span>
                        </div>
                        <span className="font-medium">
                          {brandPrice ? `₹${brandPrice.toFixed(2)}` : "Not set"}
                        </span>
                      </div>

                      {brandPrice > 0 && creatorPrice > 0 && (
                        <>
                          <div className="flex items-center justify-between pt-2 border-t mt-2">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>Creator Cost</span>
                            </div>
                            <span className="font-medium text-destructive">
                              -₹{totalPayable.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t mt-2 font-medium">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>Margin</span>
                            </div>
                            <span
                              className={
                                margin > 0
                                  ? "text-green-600"
                                  : "text-destructive"
                              }
                            >
                              ₹{margin.toFixed(2)}
                            </span>
                          </div>

                          <div className="bg-muted/10 p-3 rounded-md mt-2">
                            <h4 className="text-sm font-medium mb-2">
                              Margin Analysis
                            </h4>
                            <div className="text-xs space-y-1">
                              <div className="flex justify-between">
                                <span>Margin Percentage:</span>
                                <span
                                  className={
                                    margin > 0
                                      ? "text-green-600 font-medium"
                                      : "text-destructive font-medium"
                                  }
                                >
                                  {marginPercentage.toFixed(2)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1 mb-2">
                                <div
                                  className={`h-1.5 rounded-full ${margin > 0 ? "bg-green-500" : "bg-red-500"}`}
                                  style={{
                                    width: `${Math.min(100, Math.max(0, marginPercentage))}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                {/* Only show transactions in creator tab */}
                {activeFinancialTab === "creator" &&
                  transactions.length > 0 && (
                    <div className="border rounded-md p-4 mt-4">
                      <h4 className="text-sm font-medium mb-3 flex items-center">
                        <Receipt className="h-4 w-4 mr-2" /> Completed
                        Transactions
                      </h4>
                      <div className="max-h-[300px] overflow-y-auto">
                        <div className="space-y-3">
                          {transactions.map((transaction) => (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between p-2 border-b"
                            >
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                                <div>
                                  <div className="font-medium text-sm">
                                    {transaction.reference}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(
                                      transaction.created_at ||
                                        transaction.timestamp,
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">
                                  ₹
                                  {transaction.total_amount?.toFixed(2) ||
                                    "0.00"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {transaction.tds_amount > 0 && (
                                    <span>
                                      TDS: ₹{transaction.tds_amount.toFixed(2)}
                                    </span>
                                  )}
                                  {transaction.agency_fees_amount > 0 && (
                                    <span className="ml-2">
                                      Agency: ₹
                                      {transaction.agency_fees_amount.toFixed(
                                        2,
                                      )}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}

                          <div className="flex items-center justify-between pt-2 mt-2 font-medium border-t">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span>Total Paid</span>
                            </div>
                            <span>₹{totalPaidAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </CardContent>
          </Card>

          {/* Relationships Card */}
          <Card>
            <CardHeader>
              <CardTitle>Relationships</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {influencer && (
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage
                      src={influencer.profile_picture}
                      alt={influencer.name}
                    />
                    <AvatarFallback>{influencer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{influencer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {influencer.social_handle || "Influencer"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/influencer/${influencer.id}`)}
                  >
                    View Profile
                  </Button>
                </div>
              )}

              {brand && (
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={brand.logo_url} alt={brand.name} />
                    <AvatarFallback>{brand.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{brand.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {brand.industry || "Brand"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/brand/${brand.id}`)}
                  >
                    View Brand
                  </Button>
                </div>
              )}

              {campaign && (
                <div className="flex items-center">
                  <div className="h-10 w-10 mr-3 flex items-center justify-center bg-muted rounded-full">
                    <Video className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{campaign.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {campaign.status || "Campaign"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/campaign/${campaign.id}`)}
                  >
                    View Campaign
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CampaignVideoDetail;
