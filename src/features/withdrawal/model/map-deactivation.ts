import dayjs from "dayjs"

import {
  deactivationReasonLabel,
  isVoluntaryReason,
} from "./deactivation-reason-labels"

import type { PartTagPart } from "@umc-product/react"

import type { MemberPart } from "@/entities/member"

import type {
  DeactivationDetail,
  DeactivationListItem,
  DeactivationListStatus,
  DeactivationListType,
  DeactivationReasonCode,
  ExportDeactivationColumn,
  ExportDeactivationType,
} from "../api/deactivations"
import type {
  WithdrawalMember,
  WithdrawalReasonType,
  WithdrawalStatus,
} from "./types"
import type { WithdrawalDetail } from "./withdrawal-detail"
import type {
  WithdrawalExportColumnValue,
  WithdrawalExportTypeValue,
} from "./withdrawal-export"

const PART_TAG: Partial<Record<MemberPart, PartTagPart>> = {
  PLAN: "pm",
  DESIGN: "design",
  WEB: "web-pe",
  WEB_PRODUCT_ENGINEER: "web-pe",
  ANDROID: "mobile-pe",
  IOS: "mobile-pe",
  MOBILE_PRODUCT_ENGINEER: "mobile-pe",
  NODEJS: "web-pe",
  SPRINGBOOT: "web-pe",
  ADMIN: "pm",
}

const PART_LABEL: Partial<Record<MemberPart, string>> = {
  PLAN: "Plan",
  DESIGN: "Design",
  WEB: "Web",
  WEB_PRODUCT_ENGINEER: "Web",
  ANDROID: "Mobile",
  IOS: "Mobile",
  MOBILE_PRODUCT_ENGINEER: "Mobile",
  NODEJS: "Web",
  SPRINGBOOT: "Web",
  ADMIN: "Plan",
}

const PART_QUERY: Partial<Record<string, MemberPart>> = {
  pm: "PLAN",
  design: "DESIGN",
  "web-pe": "WEB_PRODUCT_ENGINEER",
  "mobile-pe": "MOBILE_PRODUCT_ENGINEER",
}

const EXPORT_TYPE_MAP: Record<
  WithdrawalExportTypeValue,
  ExportDeactivationType
> = {
  voluntary: "VOLUNTARY",
  "penalty-20": "POINT_THRESHOLD",
  "event-noshow": "EVENT_NO_SHOW",
  "low-participation": "LOW_PROJECT_PARTICIPATION",
}

const EXPORT_COLUMN_MAP: Record<
  WithdrawalExportColumnValue,
  ExportDeactivationColumn
> = {
  org: "ORGANIZATION",
  reason: "REASON",
  date: "REGISTERED_DATE",
  role: "REGISTRAR_ROLE",
  memo: "MEMO",
  personal: "NAME",
}

export function toDeactivationListStatus(
  status: string | null,
): DeactivationListStatus | undefined {
  if (status === "pending") {
    return "PENDING"
  }
  if (status === "withdrawn") {
    return "REGISTERED"
  }
  return undefined
}

export function toDeactivationListType(
  reasonType: string | null,
): DeactivationListType | undefined {
  if (reasonType === "voluntary") {
    return "VOLUNTARY"
  }
  if (reasonType === "involuntary") {
    return "INVOLUNTARY"
  }
  return undefined
}

export function toDeactivationPart(
  part: string | null,
): MemberPart | undefined {
  if (part == null) {
    return undefined
  }
  return PART_QUERY[part]
}

export function toWithdrawalStatus(
  status: DeactivationListStatus | null | undefined,
): WithdrawalStatus {
  return status === "REGISTERED" ? "withdrawn" : "pending"
}

export function toReasonType(
  reason: DeactivationReasonCode | null | undefined,
): WithdrawalReasonType {
  if (reason == null) {
    return "involuntary"
  }
  return isVoluntaryReason(reason) ? "voluntary" : "involuntary"
}

export function toPartTagPart(
  part: MemberPart | null | undefined,
): PartTagPart {
  if (part == null) {
    return "pm"
  }
  return PART_TAG[part] ?? "pm"
}

export function toWithdrawalMember(
  item: DeactivationListItem,
): WithdrawalMember | null {
  const challengerId = item.challengerId
  if (challengerId == null) {
    return null
  }

  const deactivationId =
    item.deactivationId == null ? null : Number(item.deactivationId)
  const hasDeactivationId =
    deactivationId != null && Number.isFinite(deactivationId)

  return {
    id: hasDeactivationId
      ? String(deactivationId)
      : `challenger:${challengerId}`,
    challengerId,
    deactivationId: hasDeactivationId ? deactivationId : null,
    name: item.name?.trim() || "-",
    nickname: item.nickname?.trim() || "-",
    chapterLabel: "",
    generationNumber: 0,
    schoolLabel: item.schoolName?.trim() || "-",
    part: toPartTagPart(item.part),
    reasonType: toReasonType(item.reason),
    reasonLabel: deactivationReasonLabel(item.reason),
    status: toWithdrawalStatus(item.status),
    withdrawnAtLabel:
      item.status === "REGISTERED" && item.registeredAt
        ? dayjs(item.registeredAt).format("M/D")
        : null,
  }
}

export function toWithdrawalDetail(
  detail: DeactivationDetail,
): WithdrawalDetail {
  const challenger = detail.challenger
  const part = challenger?.part
  const registeredBy = detail.registeredBy
  const registeredAt = detail.registeredAt ? dayjs(detail.registeredAt) : null

  const reasonType = toReasonType(detail.reason)
  const reasonName =
    detail.reasonName?.trim() || deactivationReasonLabel(detail.reason)

  return {
    id: String(detail.deactivationId ?? ""),
    name: challenger?.name?.trim() || "-",
    nickname: challenger?.nickname?.trim() || "-",
    schoolLabel: challenger?.schoolName?.trim() || "-",
    chapterLabel: challenger?.chapterName?.trim() || "-",
    partLabel: (part != null ? PART_LABEL[part] : null) ?? "-",
    generationLabel:
      challenger?.generation != null ? `${challenger.generation}기` : "-",
    typeLabel: reasonType === "voluntary" ? "자진 탈부" : "강제 탈부",
    reasonLabel: detail.reasonDetail?.trim()
      ? `${reasonName} · ${detail.reasonDetail.trim()}`
      : reasonName,
    dateLabel: registeredAt?.isValid()
      ? registeredAt.format("YYYY.MM.DD")
      : "-",
    registeredByLabel: formatRegisteredBy(registeredBy, registeredAt),
    memo: detail.memo?.trim() || "",
    evidenceImages: (detail.images ?? []).map((image, index) => ({
      id: `img-${index}`,
      src: image.imageUrl?.trim() || undefined,
    })),
    evidenceLinks: (detail.links ?? []).map((link, index) => {
      const href = link.trim()
      return {
        id: `link-${index}`,
        urlLabel: href,
        href,
      }
    }),
    progressLogs: (detail.histories ?? []).map((history, index) => {
      const date = history.registeredDate
        ? dayjs(history.registeredDate).format("M/D")
        : "-"
      const generation =
        history.generation != null ? `${history.generation}기` : ""
      const statusLabel =
        history.status === "WITHDRAWN"
          ? "탈부"
          : history.status === "EXPELLED"
            ? "제명"
            : (history.status ?? "")
      return {
        id: `history-${index}`,
        timeLabel: date,
        actionLabel: [generation, statusLabel].filter(Boolean).join(" · "),
      }
    }),
  }
}

function formatRegisteredBy(
  registeredBy: DeactivationDetail["registeredBy"],
  registeredAt: dayjs.Dayjs | null,
): string {
  const name = registeredBy?.name?.trim()
  const nickname = registeredBy?.nickname?.trim()
  const actor =
    name && nickname ? `${name} (${nickname})` : (name ?? nickname ?? "-")
  if (registeredAt?.isValid()) {
    return `${actor} · ${registeredAt.format("M/D HH:mm")}`
  }
  return actor
}

export function toExportTypes(
  types: readonly WithdrawalExportTypeValue[],
): ExportDeactivationType[] {
  return types.map((type) => EXPORT_TYPE_MAP[type])
}

export function toExportColumns(
  columns: ReadonlySet<WithdrawalExportColumnValue>,
): ExportDeactivationColumn[] {
  return [...columns].map((column) => EXPORT_COLUMN_MAP[column])
}

export function downloadCsvBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

export function resolveExportFilename(
  contentDisposition: string | undefined,
): string {
  if (contentDisposition) {
    const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition)
    if (utf8?.[1]) {
      try {
        return decodeURIComponent(utf8[1].trim())
      } catch {
        // fall through
      }
    }
    const plain = /filename="?([^";]+)"?/i.exec(contentDisposition)
    if (plain?.[1]) {
      return plain[1].trim()
    }
  }
  return `withdrawal-export-${dayjs().format("YYYYMMDD")}.csv`
}
