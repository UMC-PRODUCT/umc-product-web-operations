export type ApiResponse<T> = {
  success: boolean
  code: string
  message: string
  result: T
}
