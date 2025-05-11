const BE_SERVER = process.env.NEXT_PUBLIC_BE_SERVER || "http://localhost:5000"

/**
 * Fetch motion graphics videos from the backend
 */
export async function fetchMotionGraphics(): Promise<any[]> {
  try {
    const response = await fetch(`${BE_SERVER}/v1/motion_graphic`)

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
    const response = await fetch(`${BE_SERVER}/v1/alpha`)

    if (!response.ok) {
      throw new Error(`Failed to fetch alpha videos: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching alpha videos:", error)
    throw error
  }
}
