import React, { useEffect, useRef } from "react";
import { useVideoEmbed } from "@/hooks/useVideoEmbed";
import { Loader2, AlertCircle, Video, Instagram } from "lucide-react";

interface VideoPreviewProps {
  url: string;
}

const VideoPreview = ({ url }: VideoPreviewProps) => {
  const { videoId, platform, loading, error, instagramUrl } =
    useVideoEmbed(url);
  const instagramRef = useRef<HTMLDivElement>(null);

  // Load Instagram embed script when needed
  useEffect(() => {
    if (platform === "instagram" && instagramRef.current) {
      // Check if script already exists
      const existingScript = document.getElementById("instagram-embed-script");

      if (!existingScript) {
        const script = document.createElement("script");
        script.id = "instagram-embed-script";
        script.src = "//www.instagram.com/embed.js";
        script.async = true;
        document.body.appendChild(script);

        script.onload = () => {
          // @ts-ignore - Instagram embed API
          if (window.instgrm) {
            // @ts-ignore - Instagram embed API
            window.instgrm.Embeds.process();
          }
        };
      } else {
        // If script already exists, just process the embeds
        // @ts-ignore - Instagram embed API
        if (window.instgrm) {
          // @ts-ignore - Instagram embed API
          window.instgrm.Embeds.process();
        }
      }
    }
  }, [platform, videoId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || platform === "unknown") {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 text-center">
        <AlertCircle className="h-8 w-8 text-destructive mb-2" />
        <p className="text-sm text-muted-foreground">
          Unsupported video format
        </p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:underline mt-2"
        >
          Open video in new tab
        </a>
      </div>
    );
  }

  if (platform === "youtube" && videoId) {
    return (
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}`}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    );
  }

  if (platform === "vimeo" && videoId) {
    return (
      <iframe
        className="w-full h-full"
        src={`https://player.vimeo.com/video/${videoId}`}
        title="Vimeo video player"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      ></iframe>
    );
  }

  if (platform === "instagram" && videoId) {
    return (
      <div
        ref={instagramRef}
        className="w-full h-full flex items-center justify-center overflow-auto"
      >
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={instagramUrl}
          data-instgrm-version="14"
          style={{
            background: "#FFF",
            border: "0",
            borderRadius: "3px",
            boxShadow:
              "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
            margin: "1px",
            maxWidth: "540px",
            minWidth: "326px",
            padding: "0",
            width: "99.375%",
          }}
        >
          <div style={{ padding: "16px" }}>
            <a
              href={instagramUrl}
              style={{
                background: "#FFFFFF",
                lineHeight: "0",
                padding: "0 0",
                textAlign: "center",
                textDecoration: "none",
                width: "100%",
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#F4F4F4",
                    borderRadius: "50%",
                    flexGrow: 0,
                    height: "40px",
                    marginRight: "14px",
                    width: "40px",
                  }}
                ></div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#F4F4F4",
                      borderRadius: "4px",
                      flexGrow: 0,
                      height: "14px",
                      marginBottom: "6px",
                      width: "100px",
                    }}
                  ></div>
                  <div
                    style={{
                      backgroundColor: "#F4F4F4",
                      borderRadius: "4px",
                      flexGrow: 0,
                      height: "14px",
                      width: "60px",
                    }}
                  ></div>
                </div>
              </div>
              <div style={{ padding: "19% 0" }}></div>
              <div
                style={{
                  display: "block",
                  height: "50px",
                  margin: "0 auto 12px",
                  width: "50px",
                }}
              >
                <Instagram className="h-12 w-12" />
              </div>
              <div style={{ paddingTop: "8px" }}>
                <div
                  style={{
                    color: "#3897f0",
                    fontFamily: "Arial,sans-serif",
                    fontSize: "14px",
                    fontStyle: "normal",
                    fontWeight: "550",
                    lineHeight: "18px",
                  }}
                >
                  View this post on Instagram
                </div>
              </div>
            </a>
          </div>
        </blockquote>
      </div>
    );
  }

  // Final fallback
  return (
    <div className="flex flex-col items-center justify-center h-full bg-black/10">
      <Video className="h-16 w-16 text-muted-foreground mb-2" />
      <p className="text-sm text-muted-foreground">Video not available yet</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-blue-500 hover:underline mt-2"
      >
        Open original URL
      </a>
    </div>
  );
};

export default VideoPreview;
