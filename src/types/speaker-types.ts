export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface SpeakerYear {
  _id: string
  year: number
  label: string
  isActive: boolean
}

export interface Speaker {
  _id: string
  year_ref: string
  name: string
  about: string
  image_url?: string
  order?: number
  createdAt?: string
}

export interface SpeakerYearWithSpeakers extends SpeakerYear {
  speakers: Speaker[]
}

export interface GroupedSpeakersResponse {
  years: SpeakerYearWithSpeakers[]
}

export interface CreateSpeakerYearPayload {
  year: number
  label: string
  isActive: boolean
}

export interface UpdateSpeakerYearPayload {
  label?: string
  isActive?: boolean
}
