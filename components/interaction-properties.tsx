"use client"

import type { VideoFile, TimelineItem } from "@/types/video"

interface InteractionPropertiesProps {
  selectedVideo: VideoFile | null
  selectedTimelineItem: TimelineItem | null
  bpm: number
  setBpm: (bpm: number) => void
  blendingMode: string
  setBlendingMode: (mode: string) => void
  falloffMode: string
  setFalloffMode: (mode: string) => void
  freqMode: string
  setFreqMode: (mode: string) => void
}

export default function InteractionProperties({
  selectedVideo,
  selectedTimelineItem,
  bpm,
  setBpm,
  blendingMode,
  setBlendingMode,
  falloffMode,
  setFalloffMode,
  freqMode,
  setFreqMode,
}: InteractionPropertiesProps) {
  const blendingModes = ["Addition", "Substract", "Multiply", "Divide"]
  const falloffModes = ["None", "Kick", "Flash"]
  const freqModes = ["None", "Low", "Mid", "High"]
  const timingOptions = [".5 Sec", "1 Sec", "2 Sec"]

  // Check if an interaction is selected
  const isInteractionSelected = selectedTimelineItem?.track === "interaction"

  return (
    <div className="h-full border border-gray-700 rounded-lg p-3 overflow-auto">
      <h2 className="text-lg font-medium mb-2">Interaction Properties</h2>

      {isInteractionSelected ? (
        // Show interaction controls when an interaction is selected
        <>
          <div className="text-sm mb-3">Editing Interaction</div>

          <div className="mb-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-sm">BPM</span>
              <span className="text-sm">{bpm}</span>
            </div>
            <input
              type="range"
              min="60"
              max="200"
              value={bpm}
              onChange={(e) => setBpm(Number.parseInt(e.target.value))}
              className="w-full mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <h3 className="font-medium text-sm mb-1">Falloff</h3>
              <div className="space-y-1">
                {falloffModes.map((mode) => (
                  <button
                    key={mode}
                    className={`w-full py-1 px-2 rounded text-xs ${
                      falloffMode === mode ? "bg-gray-600" : "bg-gray-800 hover:bg-gray-700"
                    }`}
                    onClick={() => setFalloffMode(mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <div className="mt-2">
                {timingOptions.map((option) => (
                  <button key={option} className="w-full py-1 px-2 rounded bg-gray-800 hover:bg-gray-700 mb-1 text-xs">
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-medium text-sm mb-1">Blending</h3>
              <div className="space-y-1">
                {blendingModes.map((mode) => (
                  <button
                    key={mode}
                    className={`w-full py-1 px-2 rounded text-xs ${
                      blendingMode === mode ? "bg-gray-600" : "bg-gray-800 hover:bg-gray-700"
                    }`}
                    onClick={() => setBlendingMode(mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              <h3 className="font-medium text-sm mt-2 mb-1">FREQ</h3>
              <div className="space-y-1">
                {freqModes.map((mode) => (
                  <button
                    key={mode}
                    className={`w-full py-1 px-2 rounded text-xs ${
                      freqMode === mode ? "bg-gray-600" : "bg-gray-800 hover:bg-gray-700"
                    }`}
                    onClick={() => setFreqMode(mode)}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : (
        // Show empty state when no interaction is selected
        <div className="flex flex-col items-center justify-center h-[calc(100%-2rem)] text-gray-500">
          <div className="text-center mb-4">
            <p>No interaction selected</p>
            <p className="text-sm mt-2">Select an interaction from the timeline to edit its properties</p>
          </div>
          <div className="bg-gray-800 p-3 rounded-lg">
            <p className="text-xs">Tip: Add an interaction using the "Add Interaction" button in the timeline</p>
          </div>
        </div>
      )}
    </div>
  )
}
