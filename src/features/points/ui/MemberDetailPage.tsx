import { useNavigate } from "@tanstack/react-router"
import { CheckCircleIcon } from "@umc-product/icons"
import { useToast } from "@umc-product/react"
import { useEffect, useMemo, useState } from "react"

import { canDeletePointHistory } from "../model/admin-role"
import { mockAwardPoint } from "../model/mock-award-point"
import { MOCK_MEMBERS } from "../model/mock-members"
import { getMockPointHistory } from "../model/mock-point-history"
import {
  formatAwardToastMessage,
  formatDeleteToastMessage,
} from "../model/point-history"
import { AwardPointsModal } from "./AwardPointsModal"
import { DeletePointHistoryDialog } from "./DeletePointHistoryDialog"
import { MemberDetailNetworkError } from "./MemberDetailNetworkError"
import { MemberDetailPermissionDenied } from "./MemberDetailPermissionDenied"
import { MemberProfileCard } from "./MemberProfileCard"
import { PointHistoryEmpty } from "./PointHistoryEmpty"
import { PointHistoryTable } from "./PointHistoryTable"

import type { AdminRole } from "../model/admin-role"
import type { AwardPointOutcome } from "../model/mock-award-point"
import type { DeletePointHistoryOutcome } from "../model/mock-delete-point-history"
import type {
  MemberPointSummary,
  PointHistoryItem,
} from "../model/point-history"
import type { PointAwardTab } from "../model/point-types"

type MemberDetailPageProps = {
  memberId: string
  /** TODO: 인증/권한 컨텍스트 연동 시 교체 */
  viewerRole?: AdminRole
  /** TODO: API 연동 시 실제 에러/권한 상태로 교체 */
  isError?: boolean
  isForbidden?: boolean
  /** TODO: API 연동 시 제거. 삭제 결과 시뮬레이션용 */
  deleteOutcome?: DeletePointHistoryOutcome
  /** TODO: API 연동 시 제거. 부여 결과 시뮬레이션용 */
  awardOutcome?: AwardPointOutcome
  onRetry?: () => void
}

type PendingAward = {
  tab: PointAwardTab
  typeLabel: string
  score: number
  reason: string
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
  isForbidden = false,
  deleteOutcome = "success",
  awardOutcome = "success",
  onRetry,
}: MemberDetailPageProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const member = useMemo(
    () => MOCK_MEMBERS.find((item) => item.id === memberId),
    [memberId],
  )
  const [history, setHistory] = useState<PointHistoryItem[]>(() =>
    getMockPointHistory(memberId),
  )
  const [awardOpen, setAwardOpen] = useState(false)
  const [awardTab, setAwardTab] = useState<PointAwardTab>("reward")
  const [deleteTarget, setDeleteTarget] = useState<PointHistoryItem | null>(
    null,
  )
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    setHistory(getMockPointHistory(memberId))
  }, [memberId])

  const summary = useMemo(() => buildSummary(history), [history])
  const canDelete = canDeletePointHistory(viewerRole)

  const openAwardModal = (tab: PointAwardTab) => {
    setAwardTab(tab)
    setAwardOpen(true)
  }

  const applyAward = (payload: PendingAward) => {
    const kind = payload.score < 0 ? "penalty" : "reward"
    const nextItem: PointHistoryItem = {
      id: `local-${Date.now()}`,
      kind,
      typeLabel: payload.typeLabel,
      reason: payload.reason,
      score: payload.score,
      occurredAt: formatNow(),
    }
    setHistory((prev) => [nextItem, ...prev])
    setAwardOpen(false)
    toast.show({
      message: formatAwardToastMessage(payload.typeLabel, payload.score),
      color: "primary",
      icon: <CheckCircleIcon aria-hidden size={24} weight="fill" />,
    })
  }

  const removeHistoryItem = (historyId: string) => {
    const previousTotal = summary.total
    const target = history.find((item) => item.id === historyId)
    const nextTotal = target ? previousTotal - target.score : previousTotal
    setHistory((prev) => prev.filter((item) => item.id !== historyId))
    return { previousTotal, nextTotal }
  }

  const handleAwardSubmit = async (payload: PendingAward) => {
    const outcome = await mockAwardPoint(awardOutcome)
    if (outcome === "success") {
      applyAward(payload)
    }
    return outcome
  }

  if (isForbidden) {
    return (
      <MemberDetailPermissionDenied
        onGoToList={() => {
          void navigate({ to: "/activity/points" })
        }}
      />
    )
  }

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
        onGrantOther={() => openAwardModal("other")}
        onGrantPenalty={() => openAwardModal("penalty")}
        onGrantReward={() => openAwardModal("reward")}
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
              const target = history.find((item) => item.id === historyId)
              if (!target) {
                return
              }
              setDeleteTarget(target)
              setDeleteOpen(true)
            }}
          />
        )}
      </div>

      <AwardPointsModal
        initialTab={awardTab}
        member={member}
        onOpenChange={setAwardOpen}
        onSubmit={handleAwardSubmit}
        open={awardOpen}
      />

      <DeletePointHistoryDialog
        item={deleteTarget}
        member={member}
        onAlreadyDeleted={(historyId) => {
          removeHistoryItem(historyId)
        }}
        onDeleted={(historyId) => {
          const { previousTotal, nextTotal } = removeHistoryItem(historyId)
          toast.show({
            message: formatDeleteToastMessage(previousTotal, nextTotal),
            color: "primary",
            icon: <CheckCircleIcon aria-hidden size={24} weight="fill" />,
          })
        }}
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) {
            setDeleteTarget(null)
          }
        }}
        open={deleteOpen}
        simulateOutcome={deleteOutcome}
      />
    </section>
  )
}

function formatNow(): string {
  const now = new Date()
  const yyyy = now.getFullYear()
  const mm = String(now.getMonth() + 1).padStart(2, "0")
  const dd = String(now.getDate()).padStart(2, "0")
  const hh = String(now.getHours()).padStart(2, "0")
  const mi = String(now.getMinutes()).padStart(2, "0")
  return `${yyyy}.${mm}.${dd} ${hh}:${mi}`
}
