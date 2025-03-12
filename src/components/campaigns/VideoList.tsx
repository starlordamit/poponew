import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import VideoPreview from "./VideoPreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  MoreHorizontal,
  Video,
  Calendar,
  DollarSign,
  Loader2,
  AlertCircle,
  ExternalLink,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  Mail,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";
import { CampaignVideo } from "@/types/schema";
import { useData } from "@/context/DataContext";
import { useNavigate } from "react-router-dom";

const VideoList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { influencers, brands } = useData();

  const [videos, setVideos] = useState<CampaignVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVideos, setFilteredVideos] = useState<CampaignVideo[]>([]);

  // Fetch videos
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("campaign_videos")
        .select("*")
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data as CampaignVideo[]);
      setFilteredVideos(data as CampaignVideo[]);
    } catch (err) {
      console.error("Error fetching videos:", err);
      setError("Failed to load videos. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredVideos(videos);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = videos.filter((video) => {
      // Get influencer name
      const influencer = influencers.find((inf) => inf.id === video.profile_id);
      const influencerName = influencer?.name?.toLowerCase() || "";

      // Get brand name
      const brand = brands.find((b) => b.id === video.brand_id);
      const brandName = brand?.name?.toLowerCase() || "";

      return (
        influencerName.includes(query) ||
        brandName.includes(query) ||
        video.video_url.toLowerCase().includes(query) ||
        video.status.toLowerCase().includes(query)
      );
    });

    setFilteredVideos(filtered);
  }, [searchQuery, videos, influencers, brands]);

  // Get influencer name by ID
  const getInfluencerName = (profileId: string) => {
    const influencer = influencers.find((inf) => inf.id === profileId);
    return influencer?.name || "Unknown Influencer";
  };

  // Get brand name by ID
  const getBrandName = (brandId?: string) => {
    if (!brandId) return "No Brand";
    const brand = brands.find((b) => b.id === brandId);
    return brand?.name || "Unknown Brand";
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
  const handleDeleteVideo = async (videoId: string) => {
    try {
      const { error } = await supabase
        .from("campaign_videos")
        .update({ is_deleted: true })
        .eq("id", videoId);

      if (error) throw error;

      toast({
        title: "Video removed",
        description: "The video has been removed successfully.",
      });

      // Refresh the videos list
      fetchVideos();
    } catch (err) {
      console.error("Error deleting video:", err);
      toast({
        title: "Error",
        description: "Failed to remove the video. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 text-center">
        <div>
          <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-muted-foreground">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {filteredVideos.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-muted/20">
          <p className="text-muted-foreground">
            No videos found. Add your first video to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {video.video_url ? (
                  <div className="absolute inset-0">
                    <VideoPreview url={video.video_url} />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium">
                      {getInfluencerName(video.profile_id)}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {getBrandName(video.brand_id)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={getStatusBadgeColor(video.status)}>
                      {video.status}
                    </Badge>
                    {video.creator_price && (
                      <Badge
                        variant="outline"
                        className={
                          video.payment_status === "paid"
                            ? "bg-green-50 text-green-700"
                            : video.payment_status === "partial"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-yellow-50 text-yellow-700"
                        }
                      >
                        {video.payment_status === "paid"
                          ? "Paid"
                          : video.payment_status === "partial"
                            ? "Partially Paid"
                            : "Payment Pending"}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Deliverables Section */}
                {video.deliverables && (
                  <div className="mt-3 border-t pt-2">
                    <h4 className="text-xs font-medium mb-1 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1 text-muted-foreground" />
                      Deliverables
                    </h4>
                    <div className="max-h-20 overflow-y-auto">
                      {(() => {
                        try {
                          let deliverableItems = [];
                          if (typeof video.deliverables === "string") {
                            deliverableItems = JSON.parse(video.deliverables);
                          } else if (Array.isArray(video.deliverables)) {
                            deliverableItems = video.deliverables;
                          }

                          if (
                            Array.isArray(deliverableItems) &&
                            deliverableItems.length > 0
                          ) {
                            return (
                              <div className="space-y-1">
                                {deliverableItems.map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="flex justify-between items-center text-xs"
                                  >
                                    <span className="flex items-center">
                                      {item.type} ({item.quantity}x)
                                      {item.completed && (
                                        <CheckCircle className="h-3 w-3 ml-1 text-green-500" />
                                      )}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={
                                        item.completed
                                          ? "bg-green-50 text-green-700 text-[10px] py-0 px-1"
                                          : "text-[10px] py-0 px-1"
                                      }
                                    >
                                      {item.completed ? "Done" : "Pending"}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            );
                          }
                        } catch (e) {}
                        return (
                          <p className="text-xs text-muted-foreground">
                            Deliverables available
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>{formatDate(video.live_date)}</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                    <span>
                      {video.creator_price
                        ? `₹${video.creator_price}`
                        : "No price"}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mr-2"
                    onClick={() => navigate(`/video/${video.id}`)}
                  >
                    View Details
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => navigate(`/video/${video.id}/edit`)}
                      >
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      {video.video_url && (
                        <DropdownMenuItem
                          onClick={() => window.open(video.video_url, "_blank")}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Video
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteVideo(video.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoList;
