import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { getRouteApi, useNavigate } from "@tanstack/react-router"
import { CheckCircleIcon } from "@umc-product/icons"
import { useToast } from "@umc-product/react"
import { useMemo, useState } from "react"

import {
  deleteChallengerPoint,
  fetchChallenger,
  grantChallengerPoint,
} from "../api/challenger-points"
import { canDeletePointHistory } from "../model/can-delete-point-history"
import { challengerKeys } from "../model/challenger-keys"
import {
  getHttpStatus,
  isForbiddenError,
  isNetworkError,
} from "../model/http-status"
import {
  challengerPointList,
  toDetailMember,
  toGrantPointBody,
  toPointHistoryItem,
} from "../model/map-point-history"
import {
  buildSummary,
  formatAwardToastMessage,
  formatDeleteToastMessage,
} from "../model/point-history"
import { AwardPointsModal } from "./AwardPointsModal"
import { DeletePointHistoryDialog } from "./DeletePointHistoryDialog"
import { MemberDetailNetworkError } from "./MemberDetailNetworkError"
import { MemberDetailPermissionDenied } from "./MemberDetailPermissionDenied"
import { MemberDetailSkeleton } from "./MemberDetailSkeleton"
import { MemberProfileCard } from "./MemberProfileCard"
import { PointHistoryEmpty } from "./PointHistoryEmpty"
import { PointHistoryTable } from "./PointHistoryTable"

import type { PointType } from "../api/challenger-points"
import type { PointHistoryItem } from "../model/point-history"
import type { PointAwardTab } from "../model/point-types"

type MemberDetailPageProps = {
  /** URL 경로의 챌린저 id. 유효하지 않으면 null */
  challengerId: number | null
  /** 쿼리로 에러/권한 화면을 열 때 사용한다. (개발 모드 전용) */
  isError?: boolean
  isForbidden?: boolean
  onRetry?: () => void
}

type PendingAward = {
  tab: PointAwardTab
  pointType?: PointType
  typeLabel: string
  score: number
  reason: string
}

const adminRouteApi = getRouteApi("/_admin")

export function MemberDetailPage({
  challengerId,
  isError = false,
  isForbidden = false,
  onRetry,
}: MemberDetailPageProps) {
  const { session } = adminRouteApi.useRouteContext()
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const canDelete = canDeletePointHistory(session)
  const [awardOpen, setAwardOpen] = useState(false)
  const [awardTab, setAwardTab] = useState<PointAwardTab>("reward")
  const [deleteTarget, setDeleteTarget] = useState<PointHistoryItem | null>(
    null,
  )
  const [deleteOpen, setDeleteOpen] = useState(false)

  const challengerQuery = useQuery({
    queryKey:
      challengerId != null
        ? challengerKeys.detail(challengerId)
        : challengerKeys.missing(),
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
      challengerQuery.data ? toDetailMember(challengerQuery.data) : undefined,
    [challengerQuery.data],
  )

  const forbidden = isForbidden || isForbiddenError(challengerQuery.error)
  const loadFailed =
    isError ||
    (challengerQuery.isError && !isForbiddenError(challengerQuery.error))

  const refreshHistory = async () => {
    if (challengerId == null) {
      return
    }
    await queryClient.fetchQuery({
      queryKey: challengerKeys.detail(challengerId),
      queryFn: () => fetchChallenger(challengerId),
      staleTime: 0,
    })
  }

  const openAwardModal = (tab: PointAwardTab) => {
    setAwardTab(tab)
    setAwardOpen(true)
  }

  const awardMutation = useMutation({
    mutationFn: async (payload: PendingAward) => {
      if (challengerId == null) {
        throw new Error("MISSING_CHALLENGER")
      }
      const updated = await grantChallengerPoint(
        challengerId,
        toGrantPointBody(payload),
      )
      return { updated, payload }
    },
    onSuccess: async ({ updated, payload }) => {
      if (challengerId != null) {
        queryClient.setQueryData(challengerKeys.detail(challengerId), updated)
      }
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
    },
  })

  const deletePointMutation = useMutation({
    mutationFn: (historyId: string) => deleteChallengerPoint(Number(historyId)),
  })

  const handleAwardSubmit = async (payload: PendingAward) => {
    try {
      await awardMutation.mutateAsync(payload)
      return "success" as const
    } catch (error) {
      if (error instanceof Error && error.message === "MISSING_CHALLENGER") {
        return "server_error" as const
      }
      if (isForbiddenError(error)) {
        return "forbidden" as const
      }
      // 무응답만 network_error, HTTP 4xx·5xx 응답은 server_error
      return isNetworkError(error)
        ? ("network_error" as const)
        : ("server_error" as const)
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

  if (challengerId == null) {
    return (
      <section className="flex flex-col gap-(--umc-spacing-gap-20)">
        <p className="text-body-3-regular text-neutral-medium-600">
          구성원을 찾을 수 없어요
        </p>
      </section>
    )
  }

  if (challengerQuery.isPending || !member) {
    return <MemberDetailSkeleton />
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
            canDelete={canDelete}
            items={history}
            onDelete={
              canDelete
                ? (historyId) => {
                    const target = history.find((item) => item.id === historyId)
                    if (!target) {
                      return
                    }
                    setDeleteTarget(target)
                    setDeleteOpen(true)
                  }
                : undefined
            }
          />
        )}
      </div>

      <AwardPointsModal
        initialTab={awardTab}
        isSubmitting={awardMutation.isPending}
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
        onConfirm={async (historyId) => {
          try {
            await deletePointMutation.mutateAsync(historyId)
            return "success"
          } catch (error) {
            const status = getHttpStatus(error)
            if (status === 404) {
              return "already_deleted"
            }
            if (status === 403) {
              return "forbidden"
            }
            return isNetworkError(error) ? "network_error" : "server_error"
          }
        }}
        onDeleted={async () => {
          const previousTotal = summary.total
          try {
            await refreshHistory()
          } catch {
            // 삭제 API는 성공했으므로 토스트는 유지하고, 이력 재조회 실패는 네트워크 오류로 돌리지 않는다.
          }
          const next = queryClient.getQueryData<
            Awaited<ReturnType<typeof fetchChallenger>>
          >(
            challengerId != null
              ? challengerKeys.detail(challengerId)
              : challengerKeys.missing(),
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
        onOpenChange={(open) => {
          setDeleteOpen(open)
          if (!open) {
            setDeleteTarget(null)
          }
        }}
        open={deleteOpen}
      />
    </section>
  )
}
