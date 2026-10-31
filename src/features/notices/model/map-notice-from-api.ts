import {
  formatNoticeDetailDateTime,
  formatNoticeListDate,
  formatNoticeVotePeriod,
} from "./format-notice-date"
import { NOTICE_CREATE_STAFF_SCOPE_OPTIONS } from "./notice-create-form"
import {
  formatGisuGenerationLabel,
  type GisuGenerationLookup,
} from "./notice-gisu-generation"
import { NOTICE_PART_LABELS } from "./notice-part-options"
import { recomputePollPercents } from "./notice-poll-vote"
import { resolveNoticeVoteUiStatus } from "./resolve-notice-vote-ui-status"

import type {
  GetNoticeDetailResponse,
  GetNoticeSummaryResponse,
  NoticeAuthorInfo,
  NoticeTab,
  NoticeTargetInfo,
} from "../api/notice-api.types"
import type { NoticeDetail, NoticePoll } from "./notice-detail.types"
import type { Notice, NoticeAudience } from "./types"

export type NoticeTargetDisplayContext = {
  chapterNameById?: ReadonlyMap<number, string> | null
  gisuGenerationById?: GisuGenerationLookup | null
  schoolNameById?: ReadonlyMap<number, string> | null
}

function formatScopedOrganizationLabel(
  id: number,
  lookup: ReadonlyMap<number, string> | null | undefined,
  fallbackLabel: string,
): string {
  const name = lookup?.get(id)?.trim()
  return name ? name : `${fallbackLabel} #${id}`
}

function formatAuthorLabel(
  author: NoticeAuthorInfo | null | undefined,
): string {
  if (!author) {
    return ""
  }

  const name = author.name?.trim()
  if (name) {
    return name
  }

  return author.nickname?.trim() ?? ""
}

function formatAuthorDisplay(
  author: NoticeAuthorInfo | null | undefined,
  fallbackName?: string,
): string {
  const baseName = formatAuthorLabel(author) || fallbackName?.trim() || ""
  const roleName = author?.roleName?.trim()
  const organizationName = author?.organizationName?.trim()

  const roleParts = [roleName, organizationName].filter(Boolean)
  if (roleParts.length === 0) {
    return baseName
  }

  if (!baseName) {
    return roleParts.join(" · ")
  }

  return `${baseName} · ${roleParts.join(" · ")}`
}

function formatStaffRecipientLabel(tab: NoticeTab | undefined): string | null {
  if (tab == null || tab === "CHALLENGER") {
    return null
  }

  return (
    NOTICE_CREATE_STAFF_SCOPE_OPTIONS.find((option) => option.value === tab)
      ?.label ?? null
  )
}

function formatTargetGisuLabel(
  targetInfo: NoticeTargetInfo,
  context?: NoticeTargetDisplayContext,
): string {
  if (targetInfo.targetGisuId != null) {
    const gisuId = Number(targetInfo.targetGisuId)
    return Number.isFinite(gisuId)
      ? formatGisuGenerationLabel(gisuId, context?.gisuGenerationById)
      : String(targetInfo.targetGisuId)
  }

  return "전체 기수"
}

function formatTargetSchoolLabel(
  targetInfo: NoticeTargetInfo,
  context?: NoticeTargetDisplayContext,
): string | null {
  if (targetInfo.targetSchoolId == null) {
    return null
  }

  const schoolId = Number(targetInfo.targetSchoolId)
  return Number.isFinite(schoolId)
    ? formatScopedOrganizationLabel(schoolId, context?.schoolNameById, "학교")
    : String(targetInfo.targetSchoolId)
}

function formatTargetChapterLabel(
  targetInfo: NoticeTargetInfo,
  context?: NoticeTargetDisplayContext,
): string | null {
  if (targetInfo.targetChapterId == null) {
    return null
  }

  const chapterId = Number(targetInfo.targetChapterId)
  return Number.isFinite(chapterId)
    ? formatScopedOrganizationLabel(chapterId, context?.chapterNameById, "지부")
    : String(targetInfo.targetChapterId)
}

function formatTargetPartsLabel(targetInfo: NoticeTargetInfo): string | null {
  const targetParts = targetInfo.targetParts ?? []
  if (targetParts.length === 0) {
    return null
  }

  return targetParts.map((part) => NOTICE_PART_LABELS[part] ?? part).join(", ")
}

export function formatTargetDisplay(
  targetInfo: NoticeTargetInfo | null | undefined,
  context?: NoticeTargetDisplayContext,
): string {
  if (!targetInfo) {
    return "UMC 전체"
  }

  const gisuLabel = formatTargetGisuLabel(targetInfo, context)
  const schoolLabel = formatTargetSchoolLabel(targetInfo, context)
  const partsLabel = formatTargetPartsLabel(targetInfo)

  if (targetInfo.targetNoticeTab !== "CHALLENGER") {
    const staffRecipientLabel = formatStaffRecipientLabel(
      targetInfo.targetNoticeTab,
    )
    return [gisuLabel, staffRecipientLabel, schoolLabel, partsLabel]
      .filter((segment): segment is string => segment != null && segment !== "")
      .join(" · ")
  }

  const chapterLabel = formatTargetChapterLabel(targetInfo, context)
  return [gisuLabel, schoolLabel, chapterLabel, partsLabel]
    .filter((segment): segment is string => segment != null && segment !== "")
    .join(" · ")
}

function resolveAudience(
  targetInfo: NoticeTargetInfo | null | undefined,
): NoticeAudience {
  if (targetInfo?.targetNoticeTab === "CHALLENGER") {
    return "challenger"
  }
  return "staff"
}

export function mapNoticeVoteInfoToPoll(
  vote: NonNullable<GetNoticeDetailResponse["vote"]>,
): NoticePoll {
  const settings: string[] = []
  if (vote.allowMultipleChoice) {
    settings.push("복수선택")
  } else {
    settings.push("단일선택")
  }
  settings.push(vote.isAnonymous ? "익명투표" : "기명투표")

  const selectedIds = new Set(vote.mySelectedOptionIds ?? [])

  const options = recomputePollPercents(
    vote.options.map((option) => ({
      id: String(option.optionId),
      isSelected: selectedIds.has(option.optionId),
      label: option.content,
      progressPercent: 0,
      voteCount: Number(option.voteCount) || 0,
    })),
  )

  return {
    id: String(vote.voteId),
    options,
    participantCount: Number(vote.totalParticipants) || 0,
    periodLabel: formatNoticeVotePeriod(vote.startsAt, vote.endsAtExclusive),
    settingsLabel: settings.join(" · "),
    status: resolveNoticeVoteUiStatus(vote),
    title: vote.title,
  }
}

function linkTitleFromUrl(url: string): string {
  try {
    return new URL(url).hostname
  } catch {
    return url
  }
}

export function mapNoticeSummaryToNotice(
  summary: GetNoticeSummaryResponse,
  context?: NoticeTargetDisplayContext,
): Notice {
  const authorMemberId = summary.authorMemberId ?? summary.author?.memberId

  return {
    id: String(summary.id),
    audience: resolveAudience(summary.targetInfo),
    author:
      formatAuthorLabel(summary.author) || summary.authorName?.trim() || "",
    authorMemberId,
    createdAt: formatNoticeListDate(summary.createdAt),
    required: summary.mustRead,
    target: formatTargetDisplay(summary.targetInfo, context),
    title: summary.title,
    views: Number(summary.viewCount) || 0,
    hasImages: summary.hasImages,
    hasLinks: summary.hasLinks,
    hasVote: summary.hasVote,
  }
}

export function mapNoticeDetailResponse(
  detail: GetNoticeDetailResponse,
  context?: NoticeTargetDisplayContext,
): NoticeDetail {
  const summary = mapNoticeSummaryToNotice(
    {
      author: detail.author,
      authorMemberId: detail.authorMemberId,
      authorName: detail.author?.name,
      createdAt: detail.createdAt,
      hasImages: detail.images.length > 0,
      hasLinks: detail.links.length > 0,
      hasVote: detail.hasVote ?? detail.vote != null,
      id: detail.id,
      mustRead: detail.mustRead,
      targetInfo: detail.targetInfo,
      title: detail.title,
      viewCount: detail.viewCount,
    },
    context,
  )

  const sortedImages = [...detail.images].sort(
    (left, right) => left.displayOrder - right.displayOrder,
  )
  const sortedLinks = [...detail.links].sort(
    (left, right) => left.displayOrder - right.displayOrder,
  )
  const firstLink = sortedLinks[0]

  return {
    ...summary,
    authorDisplay: formatAuthorDisplay(
      detail.author,
      summary.author || undefined,
    ),
    body: detail.content,
    createdAt: formatNoticeDetailDateTime(detail.createdAt),
    images: sortedImages.map((image) => ({
      alt: "",
      id: String(image.id),
      src: image.url,
    })),
    link: firstLink
      ? {
          id: String(firstLink.id),
          title: linkTitleFromUrl(firstLink.url),
          url: firstLink.url,
        }
      : undefined,
    poll: detail.vote ? mapNoticeVoteInfoToPoll(detail.vote) : undefined,
    targetDisplay: formatTargetDisplay(detail.targetInfo, context),
    updatedAt: formatNoticeDetailDateTime(detail.updatedAt),
  }
}
