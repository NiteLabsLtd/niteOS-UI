"use client"

import type { VideoFile } from "@/types/video"
import { useState, useEffect } from "react"

interface VideoPreviewProps {
  video: VideoFile | null
}

export default function VideoPreview({ video }: VideoPreviewProps) {
  const [currentTime, setCurrentTime] = useState("00:00:00")

  useEffect(() => {
    // In a real app, this would sync with actual video playback
    const timer = setInterval(() => {
      // This is just for demonstration - in a real app this would be tied to actual video time
      if (video) {
        // Keep the timer at 00:00:00 for demo purposes
        setCurrentTime("00:00:00")
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [video])

  return (
    <div className="h-full flex flex-col">
      <div className="text-sm font-medium mb-1">{video ? video.name : "No video selected"}</div>
      <div className="flex-1 bg-gray-900 relative overflow-hidden">
        {video ? (
          <>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl">Video preview</span>
            </div>
            {/* In a real app, this would be a video element */}
            <div className="w-full h-full flex items-center justify-center">
              {video.thumbnail && (
                <img
                  src={video.thumbnail || "/placeholder.svg"}
                  alt={video.name}
                  className="max-w-full max-h-full object-contain"
                  style={{ maxHeight: "calc(100% - 8px)", maxWidth: "calc(100% - 8px)" }}
                />
              )}
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-500">Select a video to preview</span>
          </div>
        )}
      </div>
      <div className="text-center text-2xl font-mono mt-2">{currentTime}</div>
    </div>
  )
}
