import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"

import type { NoticeCreateVoteDraft } from "./notice-create-vote-draft"

dayjs.extend(customParseFormat)

export const VOTE_TITLE_REQUIRED_ERROR = "제목을 입력해주세요"
export const VOTE_OPTION_CONTENT_ERROR = "항목의 내용을 입력해주세요"
export const VOTE_END_AFTER_START_ERROR = "종료일은 시작일 이후로 선택해주세요"
export const VOTE_DATETIME_REQUIRED_ERROR =
  "투표 시작일·종료일과 시간을 입력해주세요"
export const VOTE_SUBMIT_INVALID_ERROR =
  "투표 정보를 확인한 뒤 다시 시도해주세요"
export const VOTE_TIME_FORMAT_ERROR = "시간을 올바르게 입력해주세요"

export type VoteDateTimeFieldErrors = {
  endDate?: string
}

const VOTE_TIME_PATTERN = /^\d{2}:\d{2}$/

export function parseVoteTimeValue(value: string): {
  hours: string
  minutes: string
} {
  const trimmed = value.trim()
  if (trimmed.length === 0) {
    return { hours: "", minutes: "" }
  }
  const [hoursPart = "", minutesPart = ""] = trimmed.split(":", 2)
  return {
    hours: hoursPart.replace(/\D/g, "").slice(0, 2),
    minutes: minutesPart.replace(/\D/g, "").slice(0, 2),
  }
}

export function composeVoteTimeValue(hours: string, minutes: string): string {
  if (hours.length === 0 && minutes.length === 0) {
    return ""
  }
  if (minutes.length === 0) {
    return hours
  }
  return `${hours}:${minutes}`
}

function clampVoteTimeParts(hours: string, minutes: string): string {
  const normalizedHours = hours.padStart(2, "0").slice(-2)
  const normalizedMinutes = minutes.padStart(2, "0").slice(-2)
  const hourNumber = Number.parseInt(normalizedHours, 10)
  const minuteNumber = Number.parseInt(normalizedMinutes, 10)
  const clampedHours = Number.isNaN(hourNumber)
    ? 0
    : Math.min(24, Math.max(0, hourNumber))
  const clampedMinutes = Number.isNaN(minuteNumber)
    ? 0
    : Math.min(60, Math.max(0, minuteNumber))
  return `${String(clampedHours).padStart(2, "0")}:${String(clampedMinutes).padStart(2, "0")}`
}

/** 등록·검증용 — 시·분 한 자릿수는 앞에 0을 붙여 HH:mm으로 해석 */
export function normalizeVoteTimeForSubmit(value: string): string {
  const { hours, minutes } = parseVoteTimeValue(value)
  if (hours.length === 0 && minutes.length === 0) {
    return ""
  }
  if (hours.length === 0) {
    return ""
  }
  const normalizedMinutes = minutes.length === 0 ? "00" : minutes
  return clampVoteTimeParts(hours, normalizedMinutes)
}

export function normalizeVoteTimeValue(value: string): string {
  const { hours, minutes } = parseVoteTimeValue(value)
  if (hours.length === 0 && minutes.length === 0) {
    return ""
  }
  if (minutes.length === 0 || hours.length === 0) {
    return composeVoteTimeValue(hours, minutes)
  }

  return clampVoteTimeParts(hours, minutes)
}

function isVoteHourInRange(hours: string): boolean {
  if (hours.length === 0) {
    return true
  }
  const hourNumber = Number.parseInt(hours, 10)
  return !Number.isNaN(hourNumber) && hourNumber >= 0 && hourNumber <= 24
}

function isVoteMinuteInRange(minutes: string): boolean {
  if (minutes.length === 0) {
    return true
  }
  const minuteNumber = Number.parseInt(minutes, 10)
  return !Number.isNaN(minuteNumber) && minuteNumber >= 0 && minuteNumber <= 60
}

/** 시·분 범위 위반 (입력 중 즉시 invalid UI) */
export function isVoteTimeValueInvalid(value: string): boolean {
  const { hours, minutes } = parseVoteTimeValue(value)
  if (hours.length === 0 && minutes.length === 0) {
    return false
  }
  if (!isVoteHourInRange(hours) || !isVoteMinuteInRange(minutes)) {
    return true
  }
  if (hours.length > 0 && minutes.length > 0) {
    const hourNumber = Number.parseInt(hours, 10)
    const minuteNumber = Number.parseInt(minutes, 10)
    if (hourNumber === 24 && minuteNumber > 0) {
      return true
    }
  }
  return false
}

export function isValidVoteTime(time: string): boolean {
  const trimmed = time.trim()
  if (trimmed.length === 0) {
    return false
  }
  const normalized = normalizeVoteTimeForSubmit(trimmed)
  if (normalized.length === 0 || !VOTE_TIME_PATTERN.test(normalized)) {
    return false
  }
  const { hours, minutes } = parseVoteTimeValue(normalized)
  if (!isVoteHourInRange(hours) || !isVoteMinuteInRange(minutes)) {
    return false
  }
  const hourNumber = Number.parseInt(hours, 10)
  const minuteNumber = Number.parseInt(minutes, 10)
  if (hourNumber === 24 && minuteNumber > 0) {
    return false
  }
  return dayjs(normalized, "HH:mm", true).isValid() || normalized === "24:00"
}

function combineVoteDateTime(date: Date, time: string): dayjs.Dayjs {
  const datePart = dayjs(date).format("YYYY-MM-DD")
  const timePart = time.trim() || "00:00"
  const parsed = dayjs(`${datePart} ${timePart}`, "YYYY-MM-DD HH:mm", true)
  if (parsed.isValid()) {
    return parsed
  }
  return dayjs(date).startOf("day")
}

export function getComparableVoteDateTime(
  date: Date | null,
  time: string,
): dayjs.Dayjs | null {
  if (date == null) {
    return null
  }
  const trimmedTime = time.trim()
  if (trimmedTime.length > 0 && !isValidVoteTime(trimmedTime)) {
    return null
  }
  const timePart =
    trimmedTime.length > 0 ? normalizeVoteTimeForSubmit(trimmedTime) : "00:00"
  return combineVoteDateTime(date, timePart)
}

export function getVoteTimeFieldError(
  time: string,
  showErrors: boolean,
): string | undefined {
  if (!showErrors) {
    return undefined
  }
  const trimmed = time.trim()
  if (trimmed.length === 0) {
    return undefined
  }
  if (!isValidVoteTime(trimmed)) {
    return VOTE_TIME_FORMAT_ERROR
  }
  return undefined
}

function hasInvalidVoteTime(time: string): boolean {
  const trimmed = time.trim()
  if (trimmed.length === 0) {
    return false
  }
  return isVoteTimeValueInvalid(trimmed) || !isValidVoteTime(trimmed)
}

export function isVoteTimeFieldInvalid(
  time: string,
  showValidationErrors: boolean,
): boolean {
  if (isVoteTimeValueInvalid(time)) {
    return true
  }
  const trimmed = time.trim()
  if (trimmed.length === 0 || !showValidationErrors) {
    return false
  }
  return !isValidVoteTime(trimmed)
}

export function getVoteDateTimeFieldErrors(
  draft: Pick<
    NoticeCreateVoteDraft,
    "endDate" | "endTime" | "startDate" | "startTime"
  >,
): VoteDateTimeFieldErrors {
  const start = getComparableVoteDateTime(draft.startDate, draft.startTime)
  const end = getComparableVoteDateTime(draft.endDate, draft.endTime)

  if (start != null && end != null && !start.isBefore(end)) {
    return { endDate: VOTE_END_AFTER_START_ERROR }
  }

  return {}
}

export function getVoteTitleFieldError(
  title: string,
  showErrors: boolean,
): string | undefined {
  if (!showErrors) {
    return undefined
  }
  if (title.trim().length === 0) {
    return VOTE_TITLE_REQUIRED_ERROR
  }
  return undefined
}

export function getVoteOptionFieldError(
  option: string,
  showErrors: boolean,
): string | undefined {
  if (!showErrors) {
    return undefined
  }
  if (option.trim().length === 0) {
    return VOTE_OPTION_CONTENT_ERROR
  }
  return undefined
}

export function hasEmptyVoteOption(options: readonly string[]): boolean {
  return options.some((option) => option.trim().length === 0)
}

export function isVoteDraftSubmittable(draft: NoticeCreateVoteDraft): boolean {
  if (draft.title.trim().length === 0) {
    return false
  }
  if (hasEmptyVoteOption(draft.options)) {
    return false
  }
  const dateTimeErrors = getVoteDateTimeFieldErrors(draft)
  if (dateTimeErrors.endDate != null) {
    return false
  }
  return (
    !hasInvalidVoteTime(draft.startTime) && !hasInvalidVoteTime(draft.endTime)
  )
}
