import { useState, useEffect } from "react";

interface VideoEmbedData {
  videoId: string;
  platform: string;
  loading: boolean;
  error: string | null;
  instagramUrl?: string;
}

export function useVideoEmbed(url: string): VideoEmbedData {
  const [data, setData] = useState<VideoEmbedData>({
    videoId: "",
    platform: "",
    loading: true,
    error: null,
  });

  useEffect(() => {
    const parseVideoUrl = () => {
      if (!url) {
        setData((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        // YouTube URL patterns
        const youtubeRegex =
          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
        const youtubeMatch = url.match(youtubeRegex);

        if (youtubeMatch && youtubeMatch[1]) {
          setData({
            videoId: youtubeMatch[1],
            platform: "youtube",
            loading: false,
            error: null,
          });
          return;
        }

        // Vimeo URL patterns
        const vimeoRegex =
          /(?:vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?))/i;
        const vimeoMatch = url.match(vimeoRegex);

        if (vimeoMatch && vimeoMatch[1]) {
          setData({
            videoId: vimeoMatch[1],
            platform: "vimeo",
            loading: false,
            error: null,
          });
          return;
        }

        // Instagram URL patterns
        const instagramRegex = /(?:instagram\.com\/(?:p|reel)\/([\w-]+))/i;
        const instagramMatch = url.match(instagramRegex);

        if (instagramMatch && instagramMatch[1]) {
          setData({
            videoId: instagramMatch[1],
            platform: "instagram",
            loading: false,
            error: null,
            instagramUrl: url,
          });
          return;
        }

        // If no match found
        setData({
          videoId: "",
          platform: "unknown",
          loading: false,
          error: "Unsupported video URL format",
        });
      } catch (err) {
        console.error("Error parsing video URL:", err);
        setData({
          videoId: "",
          platform: "",
          loading: false,
          error: "Failed to parse video URL",
        });
      }
    };

    parseVideoUrl();
  }, [url]);

  return data;
}
