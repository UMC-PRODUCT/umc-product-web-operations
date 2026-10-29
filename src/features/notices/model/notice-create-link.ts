export const NOTICE_CREATE_LINK_INVALID_MESSAGE =
  "올바른 주소를 입력해 주세요. 예) https://notion.so/..."

export function normalizeNoticeCreateLinkUrl(raw: string): string {
  const trimmed = raw.trim()
  if (!trimmed) {
    return trimmed
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  return `https://${trimmed}`
}

function isValidIpv4(hostname: string): boolean {
  const octets = hostname.split(".")
  if (octets.length !== 4) {
    return false
  }
  return octets.every((octet) => {
    if (!/^\d{1,3}$/.test(octet)) {
      return false
    }
    const value = Number(octet)
    return value >= 0 && value <= 255
  })
}

function isValidHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase()
  if (lower === "localhost") {
    return true
  }
  if (isValidIpv4(hostname)) {
    return true
  }
  if (!hostname.includes(".")) {
    return false
  }

  const labels = hostname.split(".")
  if (labels.length < 2) {
    return false
  }

  const labelPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i
  return labels.every(
    (label) =>
      label.length > 0 && label.length <= 63 && labelPattern.test(label),
  )
}

function isValidNoticeCreateLinkUrl(normalized: string): boolean {
  try {
    const url = new URL(normalized)
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false
    }
    if (!url.hostname) {
      return false
    }
    if (url.username || url.password) {
      return false
    }
    return isValidHostname(url.hostname)
  } catch {
    return false
  }
}

export function isNoticeCreateLinkUrl(raw: string): boolean {
  const trimmed = raw.trim()
  if (!trimmed || /\s/.test(trimmed) || /^\d+$/.test(trimmed)) {
    return false
  }
  return isValidNoticeCreateLinkUrl(normalizeNoticeCreateLinkUrl(trimmed))
}

export function getNoticeCreateLinkDraftValidation(draft: string): {
  canAdd: boolean
  errorMessage?: string
  normalizedUrl?: string
} {
  const trimmed = draft.trim()
  if (!trimmed) {
    return { canAdd: false }
  }
  if (/\s/.test(trimmed)) {
    return { canAdd: false, errorMessage: NOTICE_CREATE_LINK_INVALID_MESSAGE }
  }
  if (/^\d+$/.test(trimmed)) {
    return { canAdd: false, errorMessage: NOTICE_CREATE_LINK_INVALID_MESSAGE }
  }
  const normalizedUrl = normalizeNoticeCreateLinkUrl(trimmed)
  if (!isValidNoticeCreateLinkUrl(normalizedUrl)) {
    return { canAdd: false, errorMessage: NOTICE_CREATE_LINK_INVALID_MESSAGE }
  }
  return { canAdd: true, normalizedUrl }
}
