import type { ApiResponse } from "./api-response"

export function unwrapApiResult<T>(data: unknown): T {
  if (
    data !== null &&
    typeof data === "object" &&
    "success" in data &&
    "result" in data
  ) {
    return (data as ApiResponse<T>).result
  }
  return data as T
}
