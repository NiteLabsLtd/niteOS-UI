"use client"

import type { TimelineItem } from "@/types/video"
import { useState, useEffect, useRef } from "react"
import { BE_SERVER } from "@/lib/env"

interface MainPreviewProps {
  motion1Videos: TimelineItem[]
  motion2Videos: TimelineItem[]
  alphaVideos: TimelineItem[]
  interactionItems: TimelineItem[]
  blendingMode: string
}

export default function MainPreview({
  motion1Videos,
  motion2Videos,
  alphaVideos,
  interactionItems,
  blendingMode,
}: MainPreviewProps) {
  const [currentTime, setCurrentTime] = useState("00:00:00")
  const motion1Ref = useRef<HTMLVideoElement>(null)
  const motion2Ref = useRef<HTMLVideoElement>(null)
  const alphaRef = useRef<HTMLVideoElement>(null)

  // Get the first video of each type for preview (in a real app, this would be based on playhead position)
  const motion1 = motion1Videos[0]?.video || null
  const motion2 = motion2Videos[0]?.video || null
  const alpha = alphaVideos[0]?.video || null
  const interaction = interactionItems[0] || null

  // Get the active blending mode (from interaction if available, otherwise use the default)
  const activeBlendingMode = interaction?.interactionSettings?.blendingMode || blendingMode

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Construct the video URL
  const getVideoUrl = (videoPath?: string) => {
    if (!videoPath) return ""

    // If the path is already a full URL, use it directly
    if (videoPath.startsWith("http://") || videoPath.startsWith("https://")) {
      return videoPath
    }

    // Otherwise, prepend the backend server URL
    return `${BE_SERVER}${videoPath.startsWith("/") ? "" : "/"}${videoPath}`
  }

  // Reset and play videos
  const resetAndPlayVideos = () => {
    const videos = [motion1Ref.current, motion2Ref.current, alphaRef.current].filter(Boolean)

    videos.forEach((video) => {
      if (video) {
        video.currentTime = 0
        video.play().catch((err) => console.error("Error playing video:", err))
      }
    })
  }

  // Set up video looping for preview
  useEffect(() => {
    const videos = [
      { ref: motion1Ref, video: motion1 },
      { ref: motion2Ref, video: motion2 },
      { ref: alphaRef, video: alpha },
    ]

    // Set up event listeners for each video
    videos.forEach(({ ref, video }) => {
      if (video && ref.current) {
        const videoElement = ref.current

        const handleCanPlay = () => {
          videoElement.play().catch((err) => console.error("Error playing video:", err))
        }

        const handleTimeUpdate = () => {
          if (videoElement.currentTime >= 5) {
            // Reset to beginning after 5 seconds
            videoElement.currentTime = 0
          }

          // Update the time display based on the first video
          if (ref === motion1Ref || (!motion1 && ref === motion2Ref) || (!motion1 && !motion2 && ref === alphaRef)) {
            setCurrentTime(formatTime(videoElement.currentTime))
          }
        }

        // Add event listeners
        videoElement.addEventListener("canplay", handleCanPlay)
        videoElement.addEventListener("timeupdate", handleTimeUpdate)

        // Clean up function
        return () => {
          videoElement.removeEventListener("canplay", handleCanPlay)
          videoElement.removeEventListener("timeupdate", handleTimeUpdate)
        }
      }
    })
  }, [motion1, motion2, alpha])

  return (
    <div className="h-full flex flex-col">
      <div className="text-sm font-medium mb-1">Main Preview</div>
      <div className="flex-1 bg-gray-900 relative overflow-hidden">
        {/* In a real app, this would be a canvas or WebGL rendering of the blended videos */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!motion1 && !motion2 && !alpha ? (
            <span className="text-gray-500">Select videos to preview</span>
          ) : (
            <div className="w-full h-full bg-black relative overflow-hidden">
              {/* Motion 1 Video */}
              {motion1 && (
                <video
                  ref={motion1Ref}
                  className="absolute inset-0 w-full h-full object-contain"
                  src={getVideoUrl(motion1.path)}
                  muted
                  playsInline
                />
              )}

              {/* Motion 2 Video (with blend mode) */}
              {motion2 && (
                <video
                  ref={motion2Ref}
                  className="absolute inset-0 w-full h-full object-contain"
                  src={getVideoUrl(motion2.path)}
                  style={{ mixBlendMode: activeBlendingMode.toLowerCase() }}
                  muted
                  playsInline
                />
              )}

              {/* Alpha Video (for masking) */}
              {alpha && (
                <video
                  ref={alphaRef}
                  className="absolute inset-0 w-full h-full object-contain"
                  src={getVideoUrl(alpha.path)}
                  style={{ opacity: 0.5 }} // In a real app, this would be used as a mask
                  muted
                  playsInline
                />
              )}

              {interaction && (
                <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
                  Blend: {activeBlendingMode} | BPM: {interaction.interactionSettings?.bpm}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="text-center text-2xl font-mono mt-2">{currentTime}</div>
    </div>
  )
}
