import {
  formatNoticeDetailDateTime,
  formatNoticeListDate,
  formatNoticeVotePeriod,
} from "./format-notice-date"
import { NOTICE_PART_LABELS } from "./notice-part-options"

import type {
  GetNoticeDetailResponse,
  GetNoticeSummaryResponse,
  NoticeAuthorInfo,
  NoticeTargetInfo,
} from "../api/notice-api.types"
import type { NoticeDetail, NoticePoll } from "./notice-detail.types"
import type { Notice, NoticeAudience } from "./types"

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

function formatTargetDisplay(
  targetInfo: NoticeTargetInfo | null | undefined,
): string {
  if (!targetInfo) {
    return "UMC 전체"
  }

  const parts: string[] = []

  if (targetInfo.targetGisuId != null) {
    parts.push(`${targetInfo.targetGisuId}기`)
  } else {
    parts.push("UMC 전체")
  }

  if (targetInfo.targetSchoolId != null) {
    parts.push(`학교 #${targetInfo.targetSchoolId}`)
  }

  if (targetInfo.targetChapterId != null) {
    parts.push(`지부 #${targetInfo.targetChapterId}`)
  }

  const targetParts = targetInfo.targetParts ?? []
  if (targetParts.length > 0) {
    parts.push(
      targetParts.map((part) => NOTICE_PART_LABELS[part] ?? part).join(", "),
    )
  }

  return parts.join(" · ")
}

function resolveAudience(
  targetInfo: NoticeTargetInfo | null | undefined,
): NoticeAudience {
  if (targetInfo?.targetNoticeTab === "CHALLENGER") {
    return "challenger"
  }
  return "staff"
}

function mapVotePoll(
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

  return {
    id: String(vote.voteId),
    options: vote.options.map((option) => ({
      id: String(option.optionId),
      isSelected: selectedIds.has(option.optionId),
      label: option.content,
      progressPercent: Math.round(option.voteRate * 100),
      voteCount: option.voteCount,
    })),
    participantCount: vote.totalParticipants,
    periodLabel: formatNoticeVotePeriod(vote.startsAt, vote.endsAtExclusive),
    settingsLabel: settings.join(" · "),
    status: vote.status === "CLOSED" ? "closed" : "in_progress",
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
    target: formatTargetDisplay(summary.targetInfo),
    title: summary.title,
    views: Number(summary.viewCount) || 0,
    hasImages: summary.hasImages,
    hasLinks: summary.hasLinks,
    hasVote: summary.hasVote,
  }
}

export function mapNoticeDetailResponse(
  detail: GetNoticeDetailResponse,
): NoticeDetail {
  const summary = mapNoticeSummaryToNotice({
    author: detail.author,
    authorMemberId: detail.authorMemberId,
    authorName: detail.author?.name,
    createdAt: detail.createdAt,
    hasImages: detail.images.length > 0,
    hasLinks: detail.links.length > 0,
    hasVote: detail.vote != null,
    id: detail.id,
    mustRead: detail.mustRead,
    targetInfo: detail.targetInfo,
    title: detail.title,
    viewCount: detail.viewCount,
  })

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
    poll: detail.vote ? mapVotePoll(detail.vote) : undefined,
    targetDisplay: formatTargetDisplay(detail.targetInfo),
    updatedAt: formatNoticeDetailDateTime(detail.updatedAt),
  }
}
