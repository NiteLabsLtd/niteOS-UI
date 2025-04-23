export interface VideoFile {
  id: number
  name: string
  type: "motion" | "alpha"
  thumbnail?: string
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
