import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { CheckCircleIcon } from "@umc-product/icons"
import { useToast } from "@umc-product/react"
import { useMemo, useState } from "react"

import {
  deleteChallengerPoint,
  fetchChallenger,
  grantChallengerPoint,
} from "../api/challenger-points"
import { getHttpStatus, isForbiddenError } from "../model/http-status"
import {
  challengerPointList,
  toDetailMember,
  toGrantPointBody,
  toPointHistoryItem,
} from "../model/map-point-history"
import { mockAwardPoint } from "../model/mock-award-point"
import {
  buildSummary,
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

import type { AwardPointOutcome } from "../model/mock-award-point"
import type { DeletePointHistoryOutcome } from "../model/mock-delete-point-history"
import type { PointHistoryItem } from "../model/point-history"
import type { PointAwardTab } from "../model/point-types"

type MemberDetailPageProps = {
  memberId: string
  challengerId?: number
  /** 쿼리로 에러/권한 화면을 열 때 사용한다. */
  isError?: boolean
  isForbidden?: boolean
  /** 쿼리로 삭제 결과를 흉내 낼 때만 전달한다. */
  deleteOutcome?: DeletePointHistoryOutcome
  /** 쿼리로 부여 결과를 흉내 낼 때만 전달한다. */
  awardOutcome?: AwardPointOutcome
  onRetry?: () => void
}

type PendingAward = {
  tab: PointAwardTab
  typeLabel: string
  score: number
  reason: string
}

function challengerQueryKey(challengerId: number) {
  return ["challenger", challengerId] as const
}

export function MemberDetailPage({
  memberId,
  challengerId,
  isError = false,
  isForbidden = false,
  deleteOutcome,
  awardOutcome,
  onRetry,
}: MemberDetailPageProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const [awardOpen, setAwardOpen] = useState(false)
  const [awardTab, setAwardTab] = useState<PointAwardTab>("reward")
  const [deleteTarget, setDeleteTarget] = useState<PointHistoryItem | null>(
    null,
  )
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [requestForbidden, setRequestForbidden] = useState(false)

  const challengerQuery = useQuery({
    queryKey:
      challengerId != null
        ? challengerQueryKey(challengerId)
        : ["challenger", "missing"],
    queryFn: () => fetchChallenger(challengerId as number),
    enabled: challengerId != null && !isError && !isForbidden,
    retry: false,
  })

  const history = useMemo(
    () =>
      challengerQuery.data
        ? challengerPointList(challengerQuery.data).map(toPointHistoryItem)
        : [],
    [challengerQuery.data],
  )
  const summary = useMemo(() => buildSummary(history), [history])
  const member = useMemo(
    () =>
      challengerQuery.data
        ? toDetailMember(challengerQuery.data, memberId)
        : undefined,
    [challengerQuery.data, memberId],
  )

  const forbidden =
    isForbidden || requestForbidden || isForbiddenError(challengerQuery.error)
  const loadFailed =
    isError ||
    (challengerQuery.isError && !isForbiddenError(challengerQuery.error))

  const refreshHistory = async () => {
    if (challengerId == null) {
      return
    }
    await queryClient.fetchQuery({
      queryKey: challengerQueryKey(challengerId),
      queryFn: () => fetchChallenger(challengerId),
      staleTime: 0,
    })
  }

  const openAwardModal = (tab: PointAwardTab) => {
    setAwardTab(tab)
    setAwardOpen(true)
  }

  const handleAwardSubmit = async (payload: PendingAward) => {
    if (awardOutcome) {
      const outcome = await mockAwardPoint(awardOutcome)
      if (outcome === "success") {
        setAwardOpen(false)
        toast.show({
          message: formatAwardToastMessage(payload.typeLabel, payload.score),
          color: "brand",
          icon: <CheckCircleIcon aria-hidden size={24} weight="fill" />,
        })
      }
      return outcome
    }

    if (challengerId == null) {
      return "network_error" as const
    }

    try {
      const updated = await grantChallengerPoint(
        challengerId,
        toGrantPointBody(payload),
      )
      queryClient.setQueryData(challengerQueryKey(challengerId), updated)
      try {
        await refreshHistory()
      } catch {
        // 부여 응답으로 이력을 이미 반영했다.
      }
      setAwardOpen(false)
      toast.show({
        message: formatAwardToastMessage(payload.typeLabel, payload.score),
        color: "brand",
        icon: <CheckCircleIcon aria-hidden size={24} weight="fill" />,
      })
      return "success" as const
    } catch (error) {
      if (isForbiddenError(error)) {
        return "forbidden" as const
      }
      return "network_error" as const
    }
  }

  if (forbidden) {
    return (
      <MemberDetailPermissionDenied
        onGoToList={() => {
          void navigate({ to: "/activity/points" })
        }}
      />
    )
  }

  if (loadFailed) {
    return (
      <MemberDetailNetworkError
        onRetry={() => {
          if (onRetry) {
            onRetry()
            return
          }
          void challengerQuery.refetch()
        }}
      />
    )
  }

  if (challengerQuery.isPending || !member) {
    return challengerId == null ? (
      <section className="flex flex-col gap-(--umc-spacing-gap-20)">
        <p className="text-body-3-regular text-neutral-medium-600">
          구성원을 찾을 수 없어요
        </p>
      </section>
    ) : null
  }

  return (
    <section className="flex flex-col gap-[40px]">
      <MemberProfileCard
        member={member}
        onAwardPoints={() => openAwardModal("reward")}
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
            canDelete
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
        onAlreadyDeleted={() => {
          void refreshHistory()
        }}
        onConfirm={
          deleteOutcome
            ? undefined
            : async (historyId) => {
                try {
                  await deleteChallengerPoint(Number(historyId))
                  return "success"
                } catch (error) {
                  const status = getHttpStatus(error)
                  if (status === 404) {
                    return "already_deleted"
                  }
                  if (status === 403) {
                    return "forbidden"
                  }
                  return "network_error"
                }
              }
        }
        onDeleted={async (historyId) => {
          const previousTotal = summary.total
          if (deleteOutcome) {
            const target = history.find((item) => item.id === historyId)
            const nextTotal = target
              ? previousTotal - target.score
              : previousTotal
            toast.show({
              message: formatDeleteToastMessage(previousTotal, nextTotal),
              color: "brand",
              icon: <CheckCircleIcon aria-hidden size={24} weight="fill" />,
            })
            return
          }
          await refreshHistory()
          const next = queryClient.getQueryData<
            Awaited<ReturnType<typeof fetchChallenger>>
          >(
            challengerId != null
              ? challengerQueryKey(challengerId)
              : ["challenger", "missing"],
          )
          const nextTotal = next
            ? buildSummary(challengerPointList(next).map(toPointHistoryItem))
                .total
            : previousTotal
          toast.show({
            message: formatDeleteToastMessage(previousTotal, nextTotal),
            color: "brand",
            icon: <CheckCircleIcon aria-hidden size={24} weight="fill" />,
          })
        }}
        onForbidden={() => {
          setRequestForbidden(true)
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
