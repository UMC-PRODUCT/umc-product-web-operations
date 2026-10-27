export type GisuSummary = {
  endAt?: string
  generation: number
  gisu?: number
  gisuId: number
  isActive: boolean
  startAt?: string
}

export type GisuPageResponse = {
  content: GisuSummary[]
  hasNext: boolean
  hasPrevious: boolean
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export type ListGisusParams = {
  page?: number
  size?: number
  sort?: string[]
}
