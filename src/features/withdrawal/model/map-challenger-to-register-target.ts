import { isRoleType, usesLegacyPartLabel } from "@/entities/member"

import { formatWithdrawalGenerationLabel } from "./format-withdrawal-member-meta"
import {
  getWithdrawalPartLabel,
  WITHDRAWAL_EMPTY_PART_LABEL,
} from "./member-part-label"
import {
  type WithdrawalRegisterMemberStatus,
  withdrawalRegisterMemberStatusLabel,
  type WithdrawalRegisterProfileMember,
} from "./withdrawal-profile-member"

import type { PartTagPart } from "@umc-product/react"

import type { MemberPart } from "@/entities/member"

import type { ChallengerInfoForWithdrawal } from "../api/challenger-info.api"
import type {
  ChallengerSearchItem,
  ChallengerSearchStatus,
} from "../api/challenger-search.api"
import type { WithdrawalMember } from "./types"

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

const PART_LABEL: Record<MemberPart, string> = {
  PLAN: "PM",
  DESIGN: "Design",
  WEB: "Web",
  WEB_PRODUCT_ENGINEER: "Web PE",
  ANDROID: "Android",
  IOS: "iOS",
  MOBILE_PRODUCT_ENGINEER: "Mobile PE",
  NODEJS: "Node.js",
  SPRINGBOOT: "Spring",
  ADMIN: "Admin",
}

function mapChallengerStatus(
  status: ChallengerSearchStatus | null | undefined,
): WithdrawalRegisterMemberStatus {
  switch (status) {
    case "GRADUATED":
      return "graduated"
    case "EXPELLED":
      return "expelled"
    case "WITHDRAWN":
      return "withdrawn"
    case "ACTIVE":
    default:
      return "active"
  }
}

function resolvePartTag(
  part: MemberPart | null | undefined,
  generation: number | null,
): PartTagPart {
  if (!part) {
    return "pm"
  }
  if (
    generation != null &&
    usesLegacyPartLabel(generation) &&
    part in PART_TAG
  ) {
    return PART_TAG[part] ?? "pm"
  }
  return PART_TAG[part] ?? "pm"
}

function resolvePartLabel(
  part: MemberPart | null | undefined,
  generation: number | null,
): string {
  if (!part) {
    return WITHDRAWAL_EMPTY_PART_LABEL
  }
  if (generation != null && usesLegacyPartLabel(generation)) {
    return PART_LABEL[part]
  }
  return getWithdrawalPartLabel(resolvePartTag(part, generation))
}

function resolveRoleLabel(item: ChallengerSearchItem): string {
  if (item.isAdminInActiveGisu !== true) {
    return "챌린저"
  }
  const roles = item.roleTypes?.filter(isRoleType) ?? []
  if (roles.length === 0) {
    return "챌린저"
  }
  return "운영진"
}

function normalizeGeneration(
  raw: number | string | null | undefined,
): number | null {
  if (raw == null) {
    return null
  }
  const parsed = typeof raw === "string" ? Number(raw) : raw
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null
  }
  return Math.trunc(parsed)
}

export type WithdrawalRegisterTarget = WithdrawalRegisterProfileMember & {
  challengerId: number
  memberId: number
}

function buildProfileBase(input: {
  memberId: number
  challengerId: number
  name: string
  nickname: string
  schoolLabel: string
  regionLabel: string
  part: PartTagPart
  partLabel?: string
  generationNumber: number | null
  status: WithdrawalRegisterMemberStatus
  roleLabel: string
}): WithdrawalRegisterTarget {
  return {
    id: String(input.memberId),
    memberId: input.memberId,
    challengerId: input.challengerId,
    name: input.name,
    nickname: input.nickname,
    schoolLabel: input.schoolLabel,
    regionLabel: input.regionLabel,
    part: input.part,
    partLabel: input.partLabel ?? getWithdrawalPartLabel(input.part),
    generation:
      input.generationNumber != null
        ? formatWithdrawalGenerationLabel(input.generationNumber)
        : "",
    generationNumber: input.generationNumber ?? 0,
    status: input.status,
    roleLabel: input.roleLabel,
  }
}

export function mapChallengerSearchItemToRegisterTarget(
  item: ChallengerSearchItem,
): WithdrawalRegisterTarget | null {
  const memberId = item.memberId
  const challengerId = item.challengerId
  if (memberId == null || challengerId == null) {
    return null
  }
  const generationNumber = normalizeGeneration(item.generation)
  const part = item.part ?? null
  const partTag = resolvePartTag(part, generationNumber)

  return buildProfileBase({
    memberId,
    challengerId,
    name: item.name?.trim() ?? "",
    nickname: item.nickname?.trim() ?? "",
    schoolLabel: item.schoolName?.trim() ?? "",
    regionLabel: "",
    part: partTag,
    partLabel: resolvePartLabel(part, generationNumber),
    generationNumber,
    status: mapChallengerStatus(item.challengerStatus),
    roleLabel: resolveRoleLabel(item),
  })
}

export function mapChallengerInfoToRegisterTarget(
  info: ChallengerInfoForWithdrawal,
): WithdrawalRegisterTarget | null {
  const memberId = info.memberId
  if (memberId == null) {
    return null
  }
  const generationNumber = normalizeGeneration(info.generation ?? info.gisu)
  const part = info.part ?? null
  const partTag = resolvePartTag(part, generationNumber)

  return buildProfileBase({
    memberId,
    challengerId: info.challengerId,
    name: info.name?.trim() ?? "",
    nickname: info.nickname?.trim() ?? "",
    schoolLabel: info.schoolName?.trim() ?? "",
    regionLabel: info.chapterName?.trim() ?? "",
    part: partTag,
    partLabel: resolvePartLabel(part, generationNumber),
    generationNumber,
    status: mapChallengerStatus(info.challengerStatus),
    roleLabel: "챌린저",
  })
}

/** 목록·검색 드롭다운용 — 검색 행과 동일 필드 */
export function mapRegisterTargetToWithdrawalMember(
  target: WithdrawalRegisterTarget,
): WithdrawalMember {
  return {
    id: target.id,
    name: target.name,
    nickname: target.nickname,
    chapterLabel: target.regionLabel,
    generationNumber: target.generationNumber,
    schoolLabel: target.schoolLabel,
    part: target.part,
    partLabel: target.partLabel,
    reasonType: "voluntary",
    reasonLabel: "",
    status: "pending",
    withdrawnAtLabel: null,
    challengerId: target.challengerId,
  }
}

export function withdrawalRegisterTargetStatusLabel(
  target: WithdrawalRegisterTarget,
): string {
  return withdrawalRegisterMemberStatusLabel(target.status)
}
