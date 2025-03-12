import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import VideoList from "./VideoList";
import { Button } from "@/components/ui/button";
import { PlusCircle, Video } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const CampaignList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Check for success message in location state
  useEffect(() => {
    if (location.state?.success) {
      toast({
        title: location.state.title || "Success",
        description:
          location.state.message || "Operation completed successfully",
      });

      // Clear the state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, toast]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          <Video className="h-5 w-5 mr-2 inline-block" />
          Videos
        </h1>
        <Button onClick={() => navigate("/video/new")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Video
        </Button>
      </div>

      <VideoList />
    </div>
  );
};

export default CampaignList;
