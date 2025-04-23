"use client"

import type React from "react"

import { useState } from "react"
import type { VideoFile } from "@/types/video"
import { Search } from "lucide-react"

interface VideoLibraryProps {
  type: "motion" | "alpha"
  onSelect: (video: VideoFile) => void
}

export default function VideoLibrary({ type, onSelect }: VideoLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Mock data
  const motionVideos: VideoFile[] = [
    { id: 1, name: "Air.mp4", type: "motion", thumbnail: "/placeholder.svg?height=100&width=100" },
    { id: 2, name: "Bets.mp4", type: "motion", thumbnail: "/placeholder.svg?height=100&width=100" },
    { id: 3, name: "lives.mp4", type: "motion", thumbnail: "/placeholder.svg?height=100&width=100" },
    { id: 4, name: "Jess.mp4", type: "motion", thumbnail: "/placeholder.svg?height=100&width=100" },
  ]

  const alphaVideos: VideoFile[] = [
    { id: 5, name: "Alpha1.mp4", type: "alpha", thumbnail: "/placeholder.svg?height=100&width=100" },
    { id: 6, name: "Alpha2.mp4", type: "alpha", thumbnail: "/placeholder.svg?height=100&width=100" },
    { id: 7, name: "AlphaEffect.mp4", type: "alpha", thumbnail: "/placeholder.svg?height=100&width=100" },
    { id: 8, name: "Transparent.mp4", type: "alpha", thumbnail: "/placeholder.svg?height=100&width=100" },
  ]

  const videos = type === "motion" ? motionVideos : alphaVideos
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
      {" "}
      {/* Increased padding from p-2 to p-4 */}
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
        {filteredVideos.map((video) => (
          <div
            key={video.id}
            className={`w-full py-2 px-3 text-left rounded cursor-grab ${
              type === "motion" ? "bg-purple-900/50 hover:bg-purple-800/50" : "bg-orange-900/50 hover:bg-orange-800/50"
            }`}
            onClick={() => onSelect(video)}
            draggable
            onDragStart={(e) => handleDragStart(e, video)}
          >
            {video.name}
          </div>
        ))}
      </div>
    </div>
  )
}
