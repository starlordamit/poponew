import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  PlusCircle,
  MoreHorizontal,
  Video,
  Calendar,
  DollarSign,
  Loader2,
  AlertCircle,
  ExternalLink,
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
import { CampaignVideo, Influencer, Brand, Campaign } from "@/types/schema";
import { useData } from "@/context/DataContext";
import { useNavigate } from "react-router-dom";

const VideoList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { influencers, brands, campaigns } = useData();

  const [videos, setVideos] = useState<CampaignVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVideos, setFilteredVideos] = useState<CampaignVideo[]>([]);

  // Fetch campaign videos
  useEffect(() => {
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
        console.error("Error fetching campaign videos:", err);
        setError("Failed to load campaign videos. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

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

      // Get campaign name
      const campaign = campaigns.find((c) => c.id === video.campaign);
      const campaignName = campaign?.name?.toLowerCase() || "";

      return (
        influencerName.includes(query) ||
        brandName.includes(query) ||
        campaignName.includes(query) ||
        video.video_url.toLowerCase().includes(query) ||
        video.status.toLowerCase().includes(query)
      );
    });

    setFilteredVideos(filtered);
  }, [searchQuery, videos, influencers, brands, campaigns]);

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

  // Get campaign name by ID
  const getCampaignName = (campaignId?: string) => {
    if (!campaignId) return "No Campaign";
    const campaign = campaigns.find((c) => c.id === campaignId);
    return campaign?.name || "Unknown Campaign";
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
        description: "The campaign video has been removed successfully.",
      });

      // Update the local state
      setVideos(videos.filter((video) => video.id !== videoId));
      setFilteredVideos(filteredVideos.filter((video) => video.id !== videoId));
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Videos</h1>
        <Button onClick={() => navigate("/video/new")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Video
        </Button>
      </div>

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
            No campaign videos found. Add your first video to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => (
            <Card key={video.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {video.video_url && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <iframe
                      src={video.video_url}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
                {!video.video_url && (
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
                  <Badge className={getStatusBadgeColor(video.status)}>
                    {video.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
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
                        Edit
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
                        Delete
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
