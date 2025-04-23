"use client"

import { useState, useEffect } from "react"
import VideoPreview from "./video-preview"
import MainPreview from "./main-preview"
import InteractionProperties from "./interaction-properties"
import Timeline from "./timeline"
import VideoLibrary from "./video-library"
import type { VideoFile, TimelineItem, InteractionPropertySettings } from "@/types/video"

// Timeline constants
const TIMELINE_DURATION_MINUTES = 60
const TIMELINE_DURATION_SECONDS = TIMELINE_DURATION_MINUTES * 60
const DEFAULT_VIDEO_DURATION = 600 // 10 minutes
const DEFAULT_INTERACTION_DURATION = 1200 // 20 minutes

export default function VideoEditor() {
  const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null)
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([])
  const [selectedTimelineItem, setSelectedTimelineItem] = useState<TimelineItem | null>(null)
  const [bpm, setBpm] = useState(138)
  const [blendingMode, setBlendingMode] = useState("Addition")
  const [falloffMode, setFalloffMode] = useState("None")
  const [freqMode, setFreqMode] = useState("None")
  const [draggedVideoType, setDraggedVideoType] = useState<"motion" | "alpha" | null>(null)

  useEffect(() => {
    // Listen for the custom videodragstart event
    const handleVideoDragStart = (e: CustomEvent) => {
      setDraggedVideoType(e.detail.videoType)
    }

    // Add event listener
    window.addEventListener("videodragstart" as any, handleVideoDragStart as EventListener)

    // Clean up
    return () => {
      window.removeEventListener("videodragstart" as any, handleVideoDragStart as EventListener)
    }
  }, [])

  // Get items for each track
  const motion1Videos = timelineItems.filter((item) => item.track === "motion1")
  const motion2Videos = timelineItems.filter((item) => item.track === "motion2")
  const alphaVideos = timelineItems.filter((item) => item.track === "alpha")
  const interactionItems = timelineItems.filter((item) => item.track === "interaction")

  const handleVideoSelect = (video: VideoFile) => {
    setSelectedVideo(video)
  }

  const handleAddToTimeline = (video: VideoFile, track: "motion1" | "motion2" | "alpha", position: number) => {
    // Create a new timeline item
    const newItem: TimelineItem = {
      id: `${video.id}-${Date.now()}`,
      video,
      track,
      position,
      duration: DEFAULT_VIDEO_DURATION, // Default duration in seconds (10 minutes)
    }

    // Check for overlaps
    const hasOverlap = timelineItems.some(
      (item) =>
        item.track === track &&
        ((position >= item.position && position < item.position + item.duration) ||
          (position + DEFAULT_VIDEO_DURATION > item.position &&
            position + DEFAULT_VIDEO_DURATION <= item.position + item.duration) ||
          (position <= item.position && position + DEFAULT_VIDEO_DURATION >= item.position + item.duration)),
    )

    if (hasOverlap) {
      alert("Cannot add item: Overlapping with existing item in the same track")
      return
    }

    setTimelineItems((prev) => [...prev, newItem])
    setSelectedVideo(video)
    setSelectedTimelineItem(newItem)
  }

  const handleAddInteractionToTimeline = () => {
    // Get all interaction items
    const existingInteractions = timelineItems.filter((item) => item.track === "interaction")

    // Determine position for the new interaction
    let position = 0

    if (existingInteractions.length > 0) {
      // Find the last interaction (by position + duration)
      const lastInteraction = existingInteractions.reduce((latest, current) => {
        const latestEnd = latest.position + latest.duration
        const currentEnd = current.position + current.duration
        return currentEnd > latestEnd ? current : latest
      }, existingInteractions[0])

      // Position the new interaction 1 minute after the last one
      position = lastInteraction.position + lastInteraction.duration + 60

      // Make sure we don't go beyond the timeline
      position = Math.min(position, TIMELINE_DURATION_SECONDS - DEFAULT_INTERACTION_DURATION)
    }

    // Create a new interaction property item
    const newItem: TimelineItem = {
      id: `interaction-${Date.now()}`,
      track: "interaction",
      position,
      duration: DEFAULT_INTERACTION_DURATION, // Default duration in seconds (20 minutes)
      interactionSettings: {
        bpm,
        blendingMode,
        falloffMode,
        freqMode,
      },
    }

    // Check for overlaps
    const hasOverlap = timelineItems.some(
      (item) =>
        item.track === "interaction" &&
        ((position >= item.position && position < item.position + item.duration) ||
          (position + DEFAULT_INTERACTION_DURATION > item.position &&
            position + DEFAULT_INTERACTION_DURATION <= item.position + item.duration) ||
          (position <= item.position && position + DEFAULT_INTERACTION_DURATION >= item.position + item.duration)),
    )

    if (hasOverlap) {
      alert("Cannot add interaction: Overlapping with existing interaction in the timeline")
      return
    }

    setTimelineItems((prev) => [...prev, newItem])
    setSelectedTimelineItem(newItem)
  }

  const handleSelectTimelineItem = (item: TimelineItem) => {
    setSelectedTimelineItem(item)

    // If it's a video item, set the selected video
    if (item.video) {
      setSelectedVideo(item.video)
    } else {
      // Clear selected video if it's not a video item
      setSelectedVideo(null)
    }

    // If it's an interaction item, update the interaction properties
    if (item.track === "interaction" && item.interactionSettings) {
      setBpm(item.interactionSettings.bpm)
      setBlendingMode(item.interactionSettings.blendingMode)
      setFalloffMode(item.interactionSettings.falloffMode)
      setFreqMode(item.interactionSettings.freqMode)
    }
  }

  const handleDeleteTimelineItem = (itemId: string) => {
    setTimelineItems((prev) => prev.filter((item) => item.id !== itemId))
    if (selectedTimelineItem?.id === itemId) {
      setSelectedTimelineItem(null)
    }
  }

  const handleMoveTimelineItem = (itemId: string, newPosition: number) => {
    // Find the item to move
    const itemToMove = timelineItems.find((item) => item.id === itemId)
    if (!itemToMove) return false

    // Check for overlaps with other items in the same track
    const hasOverlap = timelineItems.some(
      (item) =>
        item.id !== itemId &&
        item.track === itemToMove.track &&
        ((newPosition >= item.position && newPosition < item.position + item.duration) ||
          (newPosition + itemToMove.duration > item.position &&
            newPosition + itemToMove.duration <= item.position + item.duration) ||
          (newPosition <= item.position && newPosition + itemToMove.duration >= item.position + item.duration)),
    )

    if (hasOverlap) {
      return false // Indicate that the move failed
    }

    // Update the item's position
    setTimelineItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, position: newPosition } : item)))
    return true // Indicate that the move succeeded
  }

  const handleResizeTimelineItem = (itemId: string, newPosition: number, newDuration: number) => {
    // Find the item to resize
    const itemToResize = timelineItems.find((item) => item.id === itemId)
    if (!itemToResize) return false

    // Check for overlaps with other items in the same track
    const hasOverlap = timelineItems.some(
      (item) =>
        item.id !== itemId &&
        item.track === itemToResize.track &&
        ((newPosition >= item.position && newPosition < item.position + item.duration) ||
          (newPosition + newDuration > item.position && newPosition + newDuration <= item.position + item.duration) ||
          (newPosition <= item.position && newPosition + newDuration >= item.position + item.duration)),
    )

    if (hasOverlap) {
      return false // Indicate that the resize failed
    }

    // Update the item's position and duration
    setTimelineItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, position: newPosition, duration: newDuration } : item)),
    )
    return true // Indicate that the resize succeeded
  }

  const handleUpdateInteractionSettings = () => {
    // Update the selected interaction item with current settings
    if (selectedTimelineItem && selectedTimelineItem.track === "interaction") {
      const updatedSettings: InteractionPropertySettings = {
        bpm,
        blendingMode,
        falloffMode,
        freqMode,
      }

      setTimelineItems((prev) =>
        prev.map((item) =>
          item.id === selectedTimelineItem.id ? { ...item, interactionSettings: updatedSettings } : item,
        ),
      )
    }
  }

  // Update interaction settings when they change
  useEffect(() => {
    handleUpdateInteractionSettings()
  }, [bpm, blendingMode, falloffMode, freqMode])

  return (
    <div className="flex flex-col h-screen">
      {/* Top panels - reduced to 80% of original height */}
      <div className="flex h-[40vh]">
        {/* Left panel - Video Preview */}
        <div className="w-1/4 border-r border-gray-800 p-2">
          <VideoPreview video={selectedVideo} />
        </div>
        {/* Center panel - Main Preview */}
        <div className="w-1/2 border-r border-gray-800 p-2">
          <MainPreview
            motion1Videos={motion1Videos}
            motion2Videos={motion2Videos}
            alphaVideos={alphaVideos}
            interactionItems={interactionItems}
            blendingMode={blendingMode}
          />
        </div>
        {/* Right panel - Interaction Properties */}
        <div className="w-1/4 p-2">
          <InteractionProperties
            selectedVideo={selectedVideo}
            selectedTimelineItem={selectedTimelineItem}
            bpm={bpm}
            setBpm={setBpm}
            blendingMode={blendingMode}
            setBlendingMode={setBlendingMode}
            falloffMode={falloffMode}
            setFalloffMode={setFalloffMode}
            freqMode={freqMode}
            setFreqMode={setFreqMode}
          />
        </div>
      </div>

      {/* Timeline */}
      <div className="h-48 border-t border-gray-800">
        <Timeline
          timelineItems={timelineItems}
          selectedItemId={selectedTimelineItem?.id}
          onAddItem={handleAddToTimeline}
          onAddInteraction={handleAddInteractionToTimeline}
          onSelectItem={handleSelectTimelineItem}
          onDeleteItem={handleDeleteTimelineItem}
          onMoveItem={handleMoveTimelineItem}
          onResizeItem={handleResizeTimelineItem}
          draggedVideoType={draggedVideoType}
          onDragEnd={() => setDraggedVideoType(null)}
        />
      </div>

      {/* Added spacing between timeline and bottom panel */}
      <div className="h-8 bg-black"></div>

      {/* Video Library - with added border for better separation */}
      <div className="h-64 border-t-2 border-gray-700 flex">
        <VideoLibrary type="motion" onSelect={handleVideoSelect} />
        <VideoLibrary type="alpha" onSelect={handleVideoSelect} />
      </div>
    </div>
  )
}
