import apiClient from "@/apiClient"
import type { Workshop, CreateWorkshopData, UpdateWorkshopData, ApiResponse } from "@/types/workshop-types"
import type { Event } from "@/types/events-types"

// Add workshop
export async function addWorkshop(eventId: string, data: CreateWorkshopData): Promise<ApiResponse<Workshop>> {
  try {
    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("about", data.about)
    formData.append("registrationFormUrl", data.registrationFormUrl)

    if (data.imageUrl && data.imageUrl.startsWith('data:')) {
      const response = await fetch(data.imageUrl)
      const blob = await response.blob()
      const file = new File([blob], 'workshop-image.jpg', { type: blob.type })
      formData.append("imageUrl", file)
    }

    const response = await apiClient.post(`/registration/addRegistration/${eventId}`, formData)

    return {
      success: true,
      data: response.data,
      message: "Workshop added successfully",
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to add workshop",
    }
  }
}

// Get all workshops
export async function getWorkshops(): Promise<ApiResponse<Workshop[]>> {
  try {
    const response = await apiClient.get("/registration/getRegistration")
    return {
      success: true,
      data: Array.isArray(response.data) ? response.data : [],
      message: "Workshops fetched successfully",
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch workshops",
    }
  }
}

// Update workshop
export async function updateWorkshop(workshopId: string, data: UpdateWorkshopData): Promise<ApiResponse<Workshop>> {
  try {
    const formData = new FormData()
    
    if (data.name) formData.append("name", data.name)
    if (data.about) formData.append("about", data.about)
    // Optional field: send even when empty so it can be cleared
    if (data.registrationFormUrl !== undefined) formData.append("registrationFormUrl", data.registrationFormUrl)

    if (data.imageUrl && data.imageUrl.startsWith('data:')) {
      const response = await fetch(data.imageUrl)
      const blob = await response.blob()
      const file = new File([blob], 'workshop-image.jpg', { type: blob.type })
      formData.append("imageUrl", file)
    }

    const response = await apiClient.post(`/registration/updateRegistration/${workshopId}`, formData)

    return {
      success: true,
      data: response.data.updatedworkshop || response.data,
      message: response.data.message || "Workshop updated successfully",
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update workshop",
    }
  }
}

// Delete workshop
export async function deleteWorkshop(workshopId: string): Promise<ApiResponse<any>> {
  try {
    const response = await apiClient.delete(`/registration/deleteRegistration/${workshopId}`)
    return {
      success: true,
      data: response.data,
      message: response.data.message || "Workshop deleted successfully",
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to delete workshop",
    }
  }
}

// Get events
export async function getEvents(): Promise<ApiResponse<Event[]>> {
  try {
    const response = await apiClient.get("/event/getEvent")
    return {
      success: true,
      data: Array.isArray(response.data) ? response.data : [],
      message: "Events fetched successfully",
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to fetch events",
    }
  }
}

// ---- Children's Corner section title (admin editable) ----
export const DEFAULT_SECTION_TITLE = "CHILDREN'S CORNER"

export async function getSectionTitle(): Promise<ApiResponse<string>> {
  try {
    const response = await apiClient.get("/registration/getSectionTitle")
    return {
      success: true,
      data: response.data?.title || DEFAULT_SECTION_TITLE,
    }
  } catch (error: any) {
    return {
      success: false,
      data: DEFAULT_SECTION_TITLE,
      error: error.response?.data?.message || "Failed to fetch section title",
    }
  }
}

export async function updateSectionTitle(title: string): Promise<ApiResponse<string>> {
  try {
    const response = await apiClient.post("/registration/updateSectionTitle", { title })
    return {
      success: true,
      data: response.data?.title || title,
      message: response.data?.message || "Title updated successfully",
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || "Failed to update title",
    }
  }
}
