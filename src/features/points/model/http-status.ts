import { isAxiosError } from "axios"

export function getHttpStatus(error: unknown): number | undefined {
  if (!isAxiosError(error)) {
    return undefined
  }
  return error.response?.status
}

export function isForbiddenError(error: unknown): boolean {
  return getHttpStatus(error) === 403
}
