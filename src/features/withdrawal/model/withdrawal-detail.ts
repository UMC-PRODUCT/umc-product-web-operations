import type { WithdrawalMember } from "./types"

export type WithdrawalEvidenceLink = {
  id: string
  urlLabel: string
  href?: string
}

export type WithdrawalEvidenceImage = {
  id: string
  /** 없으면 플레이스홀더 */
  src?: string
}

export type WithdrawalProgressLog = {
  id: string
  timeLabel: string
  actionLabel: string
}

export type WithdrawalDetail = {
  id: string
  name: string
  nickname: string
  schoolLabel: string
  chapterLabel: string
  partLabel: string
  generationLabel: string
  typeLabel: string
  reasonLabel: string
  dateLabel: string
  registeredByLabel: string
  memo: string
  evidenceImages: WithdrawalEvidenceImage[]
  evidenceLinks: WithdrawalEvidenceLink[]
  progressLogs: WithdrawalProgressLog[]
}

const PART_LABEL: Record<WithdrawalMember["part"], string> = {
  pm: "Plan",
  design: "Design",
  "web-pe": "Web",
  "mobile-pe": "Mobile",
}

/** Figma 상세 모달용 목 데이터 (API 연동 전) */
export function toMockWithdrawalDetail(
  member: WithdrawalMember,
): WithdrawalDetail {
  return {
    id: member.id,
    name: member.name,
    nickname: member.nickname,
    schoolLabel: member.schoolLabel,
    chapterLabel: "서울 지부",
    partLabel: PART_LABEL[member.part],
    generationLabel: "11기",
    typeLabel: member.reasonType === "voluntary" ? "자진 탈부" : "강제 탈부",
    reasonLabel: member.reasonLabel,
    dateLabel: "2026.10.22 (11기 8주차)",
    registeredByLabel: "루카 (교내 회장) · 10/22 21:10",
    memo: "본인 요청. 학기 중 병행 어려움, 이의 없음",
    evidenceImages: [
      { id: "img-1" },
      { id: "img-2" },
      { id: "img-3" },
      { id: "img-4" },
      { id: "img-5" },
    ],
    evidenceLinks: [
      {
        id: "link-1",
        urlLabel: "notion.so/umc/11기-숭실-운영회의-1022",
        href: "https://notion.so/umc/11기-숭실-운영회의-1022",
      },
      {
        id: "link-2",
        urlLabel: "docs.google.com/spreadsheets/…/출석부",
        href: "https://docs.google.com/spreadsheets",
      },
    ],
    progressLogs: [
      {
        id: "log-1",
        timeLabel: "10/22 21:10",
        actionLabel: "탈부 등록 · 루카",
      },
      {
        id: "log-2",
        timeLabel: "10/22 21:10",
        actionLabel: "탈부 등록 · 루카",
      },
      {
        id: "log-3",
        timeLabel: "10/22 21:10",
        actionLabel: "탈부 등록 · 루카",
      },
    ],
  }
}
