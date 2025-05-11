"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { VideoFile } from "@/types/video"
import { Search, AlertCircle, Loader2 } from "lucide-react"
import { fetchMotionGraphics, fetchAlphaVideos } from "@/services/api"

interface VideoLibraryProps {
  type: "motion" | "alpha"
  onSelect: (video: VideoFile) => void
}

export default function VideoLibrary({ type, onSelect }: VideoLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [videos, setVideos] = useState<VideoFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch videos from the API when the component mounts
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        setError(null)

        let fetchedVideos: any[]

        if (type === "motion") {
          fetchedVideos = await fetchMotionGraphics()
        } else {
          fetchedVideos = await fetchAlphaVideos()
        }

        // Transform the API response to match our VideoFile type
        const transformedVideos: VideoFile[] = fetchedVideos.map((video, index) => ({
          id: index + 1, // Generate an ID if not provided by the API
          name: video.name || extractFilename(video.path),
          type: type,
          path: video.path,
          // Use a placeholder thumbnail if not provided by the API
          thumbnail: video.thumbnail || "/placeholder.svg?height=100&width=100",
        }))

        setVideos(transformedVideos)
      } catch (err) {
        console.error(`Error fetching ${type} videos:`, err)
        setError(`Failed to load ${type} videos. Please try again later.`)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [type])

  // Extract filename from path
  const extractFilename = (path: string): string => {
    if (!path) return "Unknown"
    const parts = path.split("/")
    return parts[parts.length - 1]
  }

  const filteredVideos = videos.filter((video) => video.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleDragStart = (e: React.DragEvent, video: VideoFile) => {
    // Set the drag data
    e.dataTransfer.setData("application/json", JSON.stringify({ video }))

    // Dispatch a custom event to notify the Timeline component about the type of video being dragged
    const event = new CustomEvent("videodragstart", {
      detail: { videoType: video.type },
      bubbles: true,
    })
    e.currentTarget.dispatchEvent(event)
  }

  return (
    <div className="w-1/2 p-4">
      <h2 className="text-lg font-medium mb-3">{type === "motion" ? "Motion Graphics" : "Alpha"}</h2>
      <div className="relative mb-3">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder={`Search ${type === "motion" ? "motion" : "alpha"} files...`}
          className="w-full bg-gray-800 border border-gray-700 rounded pl-8 py-2 text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-2 max-h-[calc(100%-5rem)] overflow-y-auto pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="bg-red-900/20 border border-red-800 rounded-md p-3 text-center">
            <AlertCircle className="h-5 w-5 mx-auto mb-2 text-red-500" />
            <p className="text-sm text-red-300">{error}</p>
            <button
              className="mt-2 px-3 py-1 bg-red-800 hover:bg-red-700 rounded text-xs"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? "No matching files found" : "No files available"}
          </div>
        ) : (
          filteredVideos.map((video) => (
            <div
              key={video.id}
              className={`w-full py-2 px-3 text-left rounded cursor-grab ${
                type === "motion"
                  ? "bg-purple-900/50 hover:bg-purple-800/50"
                  : "bg-orange-900/50 hover:bg-orange-800/50"
              }`}
              onClick={() => onSelect(video)}
              draggable
              onDragStart={(e) => handleDragStart(e, video)}
            >
              {video.name}
              {video.path && <div className="text-xs text-gray-400 truncate mt-1">{video.path}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
