"use client"

import type { TimelineItem } from "@/types/video"
import { useState, useEffect } from "react"

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

  // Get the first video of each type for preview (in a real app, this would be based on playhead position)
  const motion1 = motion1Videos[0]?.video || null
  const motion2 = motion2Videos[0]?.video || null
  const alpha = alphaVideos[0]?.video || null
  const interaction = interactionItems[0] || null

  // Get the active blending mode (from interaction if available, otherwise use the default)
  const activeBlendingMode = interaction?.interactionSettings?.blendingMode || blendingMode

  useEffect(() => {
    // In a real app, this would sync with actual video playback
    const timer = setInterval(() => {
      // This is just for demonstration - in a real app this would be tied to actual video time
      setCurrentTime("00:00:00")
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="h-full flex flex-col">
      <div className="text-sm font-medium mb-1">Main Preview</div>
      <div className="flex-1 bg-gray-900 relative">
        {/* In a real app, this would be a canvas or WebGL rendering of the blended videos */}
        <div className="absolute inset-0 flex items-center justify-center">
          {!motion1 && !motion2 ? (
            <span className="text-gray-500">Select videos to preview</span>
          ) : (
            <div className="w-full h-full bg-black relative overflow-hidden">
              <div className="absolute inset-0 bg-red-900/30 flex items-center justify-center">
                <div className="w-full h-full bg-[url('/placeholder.svg?height=400&width=600')] bg-center bg-no-repeat opacity-50"></div>
              </div>
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
