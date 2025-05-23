export interface VideoFile {
  id: string
  name: string
  type: "motion" | "alpha"
  thumbnail?: string
  path: string // Path in the filesystem
}

export interface InteractionPropertySettings {
  bpm: number
  blendingMode: string
  falloffMode: string
  freqMode: string
}

export interface TimelineItem {
  id: string
  video?: VideoFile
  track: "motion1" | "motion2" | "alpha" | "interaction"
  position: number
  duration: number
  interactionSettings?: InteractionPropertySettings
}
