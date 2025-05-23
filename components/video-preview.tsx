"use client"

import type { VideoFile } from "@/types/video"
import { useState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"
import { getVideoStreamUrl } from "@/services/api"

interface VideoPreviewProps {
  video: VideoFile | null
}

export default function VideoPreview({ video }: VideoPreviewProps) {
  const [currentTime, setCurrentTime] = useState("00:00:00")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewPath, setPreviewPath] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const loopTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Reset and start video playback
  const resetAndPlayVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play().catch((err) => {
        console.error("Error playing video:", err)
        setError("Could not play video. Check if the format is supported.")
      })
    }
  }

  // Fetch video preview path from backend
  const fetchPreviewPath = async (selectedVideo: VideoFile) => {
    try {
      setIsLoading(true)
      setError(null)
      setPreviewPath(null)

      setPreviewPath(getVideoStreamUrl(selectedVideo.id))
    } catch (err) {
      console.error("Error fetching video preview path:", err)
      setError("Failed to load video preview from backend. Please try again.")
      setIsLoading(false)
    }
  }

  // Fetch preview path when video changes
  useEffect(() => {
    if (video) {
      fetchPreviewPath(video)
    } else {
      setPreviewPath(null)
      setError(null)
      setIsLoading(false)
      setCurrentTime("00:00:00")
    }

    // Clear any existing timeout
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current)
    }
  }, [video])

  // Set up video playback when preview path is available
  useEffect(() => {
    if (previewPath && videoRef.current) {
      // Clear any existing timeout
      if (loopTimeoutRef.current) {
        clearTimeout(loopTimeoutRef.current)
      }

      // Set up event listeners
      const videoElement = videoRef.current

      const handleCanPlay = () => {
        setIsLoading(false)
        resetAndPlayVideo()
      }

      const handleError = () => {
        setIsLoading(false)
        setError("Error loading video. The file may be corrupted or in an unsupported format.")
      }

      const handleTimeUpdate = () => {
        setCurrentTime(formatTime(videoElement.currentTime))
      }

      const handleLoadStart = () => {
        setIsLoading(true)
      }

      // Add event listeners
      videoElement.addEventListener("canplay", handleCanPlay)
      videoElement.addEventListener("error", handleError)
      videoElement.addEventListener("timeupdate", handleTimeUpdate)
      videoElement.addEventListener("loadstart", handleLoadStart)

      // Clean up function
      return () => {
        videoElement.removeEventListener("canplay", handleCanPlay)
        videoElement.removeEventListener("error", handleError)
        videoElement.removeEventListener("timeupdate", handleTimeUpdate)
        videoElement.removeEventListener("loadstart", handleLoadStart)

        if (loopTimeoutRef.current) {
          clearTimeout(loopTimeoutRef.current)
        }
      }
    }
  }, [previewPath])

  // Retry function
  const handleRetry = () => {
    if (video) {
      fetchPreviewPath(video)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="text-sm font-medium mb-1">{video ? video.name : "No video selected"}</div>
      <div className="flex-1 bg-gray-900 relative overflow-hidden">
        {video ? (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white mx-auto mb-2" />
                  <p className="text-white text-sm">Loading video preview...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 z-10">
                <div className="text-center p-4">
                  <p className="text-red-400 mb-2 text-sm">{error}</p>
                  <button
                    className="px-3 py-1 bg-red-800 hover:bg-red-700 rounded text-xs text-white"
                    onClick={handleRetry}
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            {previewPath && (
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                src={previewPath}
                muted
                playsInline
                autoPlay
                loop
                style={{ maxHeight: "calc(100% - 8px)", maxWidth: "calc(100% - 8px)" }}
              />
            )}

            {!previewPath && !isLoading && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-500">Preparing video preview...</span>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-500">Select a video to preview</span>
          </div>
        )}
      </div>
      <div className="text-center text-xl font-mono mt-2">{currentTime}</div>
    </div>
  )
}
