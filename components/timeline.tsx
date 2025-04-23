"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import type { VideoFile, TimelineItem } from "@/types/video"
import { Play, Trash2, Move, PlusCircle } from "lucide-react"

interface TimelineProps {
  timelineItems: TimelineItem[]
  selectedItemId: string | undefined
  onAddItem: (video: VideoFile, track: "motion1" | "motion2" | "alpha", position: number) => void
  onAddInteraction: () => void
  onSelectItem: (item: TimelineItem) => void
  onDeleteItem: (itemId: string) => void
  onMoveItem: (itemId: string, newPosition: number) => boolean
  onResizeItem: (itemId: string, newPosition: number, newDuration: number) => boolean
  draggedVideoType: "motion" | "alpha" | null
  onDragEnd: () => void
}

// Timeline constants
const TIMELINE_DURATION_MINUTES = 60
const TIMELINE_DURATION_SECONDS = TIMELINE_DURATION_MINUTES * 60

export default function Timeline({
  timelineItems,
  selectedItemId,
  onAddItem,
  onAddInteraction,
  onSelectItem,
  onDeleteItem,
  onMoveItem,
  onResizeItem,
  draggedVideoType,
  onDragEnd,
}: TimelineProps) {
  // Create time markers every 5 minutes (0, 5, 10, ..., 60)
  const timeMarkers = Array.from({ length: 13 }, (_, i) => i * 5)

  const [draggedOver, setDraggedOver] = useState<"motion1" | "motion2" | "alpha" | "interaction" | null>(null)
  const [interactionMode, setInteractionMode] = useState<"none" | "move" | "resize-left" | "resize-right">("none")
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartPosition, setDragStartPosition] = useState(0)
  const [dragStartDuration, setDragStartDuration] = useState(0)
  const timelineRef = useRef<HTMLDivElement>(null)

  // Get items for each track
  const motion1Items = timelineItems.filter((item) => item.track === "motion1")
  const motion2Items = timelineItems.filter((item) => item.track === "motion2")
  const alphaItems = timelineItems.filter((item) => item.track === "alpha")
  const interactionItems = timelineItems.filter((item) => item.track === "interaction")

  // Get the selected item
  const selectedItem = timelineItems.find((item) => item.id === selectedItemId)

  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  // Handle timeline track drag events
  const handleDragOver = (e: React.DragEvent, track: "motion1" | "motion2" | "alpha" | "interaction") => {
    e.preventDefault()
    setDraggedOver(track)
  }

  const handleDragLeave = () => {
    setDraggedOver(null)
  }

  const handleDrop = (e: React.DragEvent, track: "motion1" | "motion2" | "alpha") => {
    e.preventDefault()
    setDraggedOver(null)

    // Get the video data from the drag event
    const videoData = JSON.parse(e.dataTransfer.getData("application/json"))
    const video = videoData.video as VideoFile

    // Check if this is a valid drop
    if ((track === "motion1" || track === "motion2") && video.type === "alpha") {
      onDragEnd()
      return // Invalid: alpha video on motion track
    }

    if (track === "alpha" && video.type === "motion") {
      onDragEnd()
      return // Invalid: motion video on alpha track
    }

    // Calculate position based on drop location
    const trackElement = e.currentTarget as HTMLElement
    const trackRect = trackElement.getBoundingClientRect()
    const dropPositionX = e.clientX - trackRect.left
    const trackWidth = trackRect.width

    // Convert to a position in seconds (using the 60-minute timeline)
    const position = Math.floor((dropPositionX / trackWidth) * TIMELINE_DURATION_SECONDS)

    // Add the item to the timeline
    onAddItem(video, track, position)

    onDragEnd()
  }

  // Handle timeline item interactions
  const handleItemMouseDown = (
    e: React.MouseEvent,
    item: TimelineItem,
    mode: "move" | "resize-left" | "resize-right",
  ) => {
    e.stopPropagation()
    e.preventDefault() // Prevent text selection during drag

    // Select the item if it's not already selected
    if (item.id !== selectedItemId) {
      onSelectItem(item)
    }

    // Set up for dragging
    setInteractionMode(mode)
    setDragStartX(e.clientX)
    setDragStartPosition(item.position)
    setDragStartDuration(item.duration)

    // Add global mouse event listeners
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (interactionMode === "none" || !selectedItemId || !timelineRef.current) return

    const selectedItem = timelineItems.find((item) => item.id === selectedItemId)
    if (!selectedItem) return

    const timelineRect = timelineRef.current.getBoundingClientRect()
    const trackWidth = timelineRect.width
    const pixelsPerSecond = trackWidth / TIMELINE_DURATION_SECONDS

    // Calculate delta in seconds
    const deltaX = e.clientX - dragStartX
    const deltaSeconds = Math.round(deltaX / pixelsPerSecond)

    if (interactionMode === "move") {
      // Calculate new position
      let newPosition = Math.max(0, dragStartPosition + deltaSeconds)
      newPosition = Math.min(newPosition, TIMELINE_DURATION_SECONDS - selectedItem.duration) // Don't go past the end

      // Try to move the item
      onMoveItem(selectedItemId, newPosition)
    } else if (interactionMode === "resize-left") {
      // Calculate new position and duration
      const maxLeftMove = dragStartPosition + dragStartDuration - 1 // Ensure minimum duration of 1
      const newPosition = Math.max(0, Math.min(maxLeftMove, dragStartPosition + deltaSeconds))
      const newDuration = dragStartDuration - (newPosition - dragStartPosition)

      // Try to resize the item
      onResizeItem(selectedItemId, newPosition, newDuration)
    } else if (interactionMode === "resize-right") {
      // Calculate new duration
      const newDuration = Math.max(1, dragStartDuration + deltaSeconds) // Minimum duration of 1
      const maxDuration = TIMELINE_DURATION_SECONDS - dragStartPosition // Don't go past the end
      const clampedDuration = Math.min(newDuration, maxDuration)

      // Try to resize the item
      onResizeItem(selectedItemId, dragStartPosition, clampedDuration)
    }
  }

  const handleMouseUp = () => {
    setInteractionMode("none")
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
  }

  // Clean up event listeners
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [interactionMode, selectedItemId, dragStartX, dragStartPosition, dragStartDuration])

  const getTrackHighlightClass = (track: "motion1" | "motion2" | "alpha" | "interaction") => {
    if (!draggedVideoType || track === "interaction") return ""

    // If this track is being hovered over
    if (draggedOver === track) {
      return "ring-2 ring-blue-500"
    }

    // Highlighting based on dragged video type
    if (draggedVideoType === "motion") {
      if (track === "motion1" || track === "motion2") {
        return "bg-green-900/20" // Valid drop target
      } else {
        return "bg-red-900/20" // Invalid drop target
      }
    } else if (draggedVideoType === "alpha") {
      if (track === "alpha") {
        return "bg-green-900/20" // Valid drop target
      } else {
        return "bg-red-900/20" // Invalid drop target
      }
    }

    return ""
  }

  // Render a timeline item with resize handles
  const renderTimelineItem = (item: TimelineItem) => {
    const isSelected = item.id === selectedItemId

    // Determine color based on track type
    let itemColor = "bg-purple-700" // Default for motion
    if (item.track === "alpha") {
      itemColor = "bg-orange-700"
    } else if (item.track === "interaction") {
      itemColor = "bg-cyan-700"
    }

    const selectedClass = isSelected ? "ring-2 ring-white" : ""

    // Calculate position and width as percentages of the total timeline
    const positionPercent = (item.position / TIMELINE_DURATION_SECONDS) * 100
    const widthPercent = (item.duration / TIMELINE_DURATION_SECONDS) * 100

    return (
      <div
        key={item.id}
        className={`absolute h-full ${itemColor} rounded ${selectedClass} group`}
        style={{
          left: `${positionPercent}%`,
          width: `${widthPercent}%`,
        }}
        onClick={(e) => {
          e.stopPropagation()
          onSelectItem(item)
        }}
      >
        {/* Left resize handle */}
        <div
          className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 z-10"
          onMouseDown={(e) => handleItemMouseDown(e, item, "resize-left")}
        />

        {/* Item content */}
        <div
          className="h-full px-3 truncate text-xs flex items-center justify-between cursor-move"
          onMouseDown={(e) => handleItemMouseDown(e, item, "move")}
        >
          {item.track === "interaction" ? (
            <div className="flex items-center space-x-2">
              <span className="truncate">
                {item.interactionSettings?.blendingMode} | BPM: {item.interactionSettings?.bpm}
              </span>
            </div>
          ) : (
            <span className="truncate">{item.video?.name}</span>
          )}

          {/* Delete button - only visible when selected */}
          {isSelected && (
            <button
              className="p-0.5 bg-red-600 rounded hover:bg-red-500 flex items-center justify-center"
              onClick={(e) => {
                e.stopPropagation()
                onDeleteItem(item.id)
              }}
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>

        {/* Right resize handle */}
        <div
          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/30 z-10"
          onMouseDown={(e) => handleItemMouseDown(e, item, "resize-right")}
        />
      </div>
    )
  }

  return (
    <div className="h-full p-2" ref={timelineRef}>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-sm font-medium">Timeline</h2>
        <div className="flex items-center gap-2">
          <button
            className="bg-cyan-800 hover:bg-cyan-700 px-3 py-1 rounded flex items-center"
            onClick={onAddInteraction}
          >
            <PlusCircle size={16} className="mr-1" />
            <span>Add Interaction</span>
          </button>

          {selectedItemId && (
            <div className="text-xs bg-gray-800 px-2 py-1 rounded flex items-center gap-1">
              <Move size={12} />
              <span>Drag to move, edges to resize</span>
            </div>
          )}
          <button className="bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded flex items-center">
            <Play size={16} className="mr-1" />
            <span>Play</span>
          </button>
        </div>
      </div>

      <div className="relative h-[calc(100%-2rem)]">
        {/* Time markers */}
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          {timeMarkers.map((marker) => (
            <div key={marker} className="flex flex-col items-center">
              <span>{marker}m</span>
              {marker % 15 === 0 && marker > 0 && <span className="text-[10px] text-gray-400">{marker / 15}Q</span>}
            </div>
          ))}
        </div>

        {/* Timeline tracks */}
        <div className="space-y-1">
          <div className="flex items-center">
            <div className="w-20 text-xs">Motion 1</div>
            <div
              className={`flex-1 h-8 bg-gray-900 relative transition-colors ${getTrackHighlightClass("motion1")}`}
              onDragOver={(e) => handleDragOver(e, "motion1")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "motion1")}
            >
              {motion1Items.map((item) => renderTimelineItem(item))}
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-20 text-xs">Motion 2</div>
            <div
              className={`flex-1 h-8 bg-gray-900 relative transition-colors ${getTrackHighlightClass("motion2")}`}
              onDragOver={(e) => handleDragOver(e, "motion2")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "motion2")}
            >
              {motion2Items.map((item) => renderTimelineItem(item))}
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-20 text-xs">Alpha</div>
            <div
              className={`flex-1 h-8 bg-gray-900 relative transition-colors ${getTrackHighlightClass("alpha")}`}
              onDragOver={(e) => handleDragOver(e, "alpha")}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, "alpha")}
            >
              {alphaItems.map((item) => renderTimelineItem(item))}
            </div>
          </div>

          <div className="flex items-center">
            <div className="w-20 text-xs flex items-center">
              <span>Interaction</span>
            </div>
            <div className="flex-1 h-8 bg-gray-900 relative transition-colors">
              {interactionItems.map((item) => renderTimelineItem(item))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
