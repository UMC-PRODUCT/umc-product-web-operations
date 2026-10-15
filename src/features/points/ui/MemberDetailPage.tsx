import { useEffect, useMemo, useState } from "react"

import { canDeletePointHistory } from "../model/admin-role"
import { MOCK_MEMBERS } from "../model/mock-members"
import { getMockPointHistory } from "../model/mock-point-history"
import { MemberDetailNetworkError } from "./MemberDetailNetworkError"
import { MemberProfileCard } from "./MemberProfileCard"
import { PointHistoryEmpty } from "./PointHistoryEmpty"
import { PointHistoryTable } from "./PointHistoryTable"

import type { AdminRole } from "../model/admin-role"
import type {
  MemberPointSummary,
  PointHistoryItem,
} from "../model/point-history"

type MemberDetailPageProps = {
  memberId: string
  /** TODO: 인증/권한 컨텍스트 연동 시 교체 */
  viewerRole?: AdminRole
  /** TODO: API 연동 시 실제 에러 상태로 교체 */
  isError?: boolean
  onRetry?: () => void
}

function buildSummary(history: PointHistoryItem[]): MemberPointSummary {
  return history.reduce<MemberPointSummary>(
    (acc, item) => {
      if (item.kind === "reward") {
        acc.rewardTotal += item.score
      } else {
        acc.penaltyTotal += item.score
      }
      acc.total += item.score
      return acc
    },
    { total: 0, rewardTotal: 0, penaltyTotal: 0 },
  )
}

export function MemberDetailPage({
  memberId,
  viewerRole = "SUPER_ADMIN",
  isError = false,
  onRetry,
}: MemberDetailPageProps) {
  const member = useMemo(
    () => MOCK_MEMBERS.find((item) => item.id === memberId),
    [memberId],
  )
  const [history, setHistory] = useState<PointHistoryItem[]>(() =>
    getMockPointHistory(memberId),
  )

  useEffect(() => {
    setHistory(getMockPointHistory(memberId))
  }, [memberId])

  const summary = useMemo(() => buildSummary(history), [history])
  const canDelete = canDeletePointHistory(viewerRole)

  if (isError) {
    return <MemberDetailNetworkError onRetry={onRetry} />
  }

  if (!member) {
    return (
      <section className="flex flex-col gap-(--umc-spacing-gap-20)">
        <p className="text-body-3-regular text-neutral-medium-600">
          구성원을 찾을 수 없어요
        </p>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-[40px]">
      <MemberProfileCard
        member={member}
        onGrantOther={() => {
          // 기타 상벌점 부여 플로우는 후속 작업에서 연결
        }}
        onGrantPenalty={() => {
          // 벌점 부여 플로우는 후속 작업에서 연결
        }}
        onGrantReward={() => {
          // 상점 부여 플로우는 후속 작업에서 연결
        }}
        summary={summary}
      />

      <div className="flex flex-col gap-(--umc-spacing-gap-20)">
        <h2 className="text-heading-4-semibold text-neutral-default-900">
          상벌점 이력
        </h2>
        {history.length === 0 ? (
          <PointHistoryEmpty />
        ) : (
          <PointHistoryTable
            canDelete={canDelete}
            items={history}
            onDelete={(historyId) => {
              setHistory((prev) => prev.filter((item) => item.id !== historyId))
            }}
          />
        )}
      </div>
    </section>
  )
}
