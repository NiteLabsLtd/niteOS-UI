const BE_SERVER = process.env.NEXT_PUBLIC_BE_SERVER || "http://localhost:5000"

/**
 * Get the video stream URL for a given video path
 */
export function getVideoStreamUrl(id: string): string {
  // Remove the base path since the API endpoint already includes it
  return `${BE_SERVER}/api/v1/video/${id}`
}

/**
 * Fetch motion graphics videos from the backend
 */
export async function fetchMotionGraphics(): Promise<any[]> {
  try {
    const response = await fetch(`${BE_SERVER}/api/v1/motion_graphic`)

    if (!response.ok) {
      throw new Error(`Failed to fetch motion graphics: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching motion graphics:", error)
    throw error
  }
}

/**
 * Fetch alpha videos from the backend
 */
export async function fetchAlphaVideos(): Promise<any[]> {
  try {
    const response = await fetch(`${BE_SERVER}/api/v1/alpha`)

    if (!response.ok) {
      throw new Error(`Failed to fetch alpha videos: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching alpha videos:", error)
    throw error
  }
}
