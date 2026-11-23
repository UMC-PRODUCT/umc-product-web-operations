import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { AddIcon } from "@umc-product/icons"
import { Button } from "@umc-product/react"
import { useMemo, useState } from "react"

import { useSelectedGisu } from "@/entities/gisu"
import {
  gisuOrganizationQueryOptions,
  toOrganizationLists,
} from "@/entities/organization"

import { MOCK_WITHDRAWALS } from "../model/mock-withdrawals"
import { useWithdrawalRegisterSuccessToast } from "./use-withdrawal-register-success-toast"
import {
  WithdrawalCsvExportDialog,
  type WithdrawalCsvExportMode,
} from "./withdrawal-csv-export-dialog"
import { WithdrawalTable } from "./withdrawal-table"
import { WithdrawalToolbar } from "./withdrawal-toolbar"

const PART_FILTER_OPTIONS = [
  { value: "web-pe", label: "Web/PE" },
  { value: "design", label: "Design" },
  { value: "pm", label: "Plan" },
  { value: "mobile-pe", label: "Mobile/PE" },
] as const

export type WithdrawalListMock = "loading" | "error" | "empty"

type WithdrawalPageProps = {
  /** URL `?mock=` — 조회 상태 UI 확인용 (개발 모드 전용) */
  mock?: WithdrawalListMock
}

export function WithdrawalPage({ mock }: WithdrawalPageProps) {
  useWithdrawalRegisterSuccessToast()
  const navigate = useNavigate()
  const selectedGisu = useSelectedGisu()
  const [chapterId, setChapterId] = useState<string | null>(null)
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [part, setPart] = useState<string | null>(null)
  const [reason, setReason] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [retryKey, setRetryKey] = useState(0)
  const [csvExportOpen, setCsvExportOpen] = useState(false)

  const organizationQuery = useQuery({
    ...gisuOrganizationQueryOptions(selectedGisu.gisuId),
    enabled: !selectedGisu.isPending && selectedGisu.gisuId != null,
    retry: false,
  })

  const organizationLists = useMemo(
    () => toOrganizationLists(organizationQuery.data),
    [organizationQuery.data],
  )

  const chapterOptions = useMemo(
    () =>
      organizationLists.chapters.map((chapter) => ({
        value: String(chapter.id),
        label: chapter.name,
      })),
    [organizationLists.chapters],
  )

  const schoolOptions = useMemo(() => {
    const chapterNumber =
      chapterId == null ? null : Number.parseInt(chapterId, 10)
    const schools =
      chapterNumber != null && !Number.isNaN(chapterNumber)
        ? (organizationLists.schoolsByChapterId.get(chapterNumber) ?? [])
        : organizationLists.schools
    return schools.map((school) => ({
      value: String(school.schoolId),
      label: school.schoolName,
    }))
  }, [
    chapterId,
    organizationLists.schools,
    organizationLists.schoolsByChapterId,
  ])

  const hasActiveFilters =
    chapterId != null ||
    schoolId != null ||
    part != null ||
    reason != null ||
    status != null ||
    query.trim().length > 0

  const members = useMemo(() => {
    const sourceMembers = mock === "empty" ? [] : MOCK_WITHDRAWALS
    const keyword = query.trim().toLowerCase()
    return sourceMembers.filter((member) => {
      if (part != null && member.part !== part) {
        return false
      }
      if (reason != null && member.reasonType !== reason) {
        return false
      }
      if (status != null && member.status !== status) {
        return false
      }
      if (keyword.length === 0) {
        return true
      }
      return (
        member.name.toLowerCase().includes(keyword) ||
        member.nickname.toLowerCase().includes(keyword)
      )
    })
  }, [mock, part, query, reason, status])

  const resetFilters = () => {
    setChapterId(null)
    setSchoolId(null)
    setPart(null)
    setReason(null)
    setStatus(null)
    setQuery("")
    setSelectedIds(new Set())
  }

  const hasSelection = selectedIds.size > 0
  const csvExportMode: WithdrawalCsvExportMode = "selected"
  const csvExportCount = selectedIds.size

  return (
    <section className="relative flex flex-col gap-(--umc-spacing-gap-32) pl-(--umc-spacing-padding-12)">
      <div className="flex items-start justify-between gap-(--umc-spacing-gap-12)">
        <div className="flex min-w-0 flex-1 flex-col gap-(--umc-spacing-gap-12)">
          <h1 className="text-heading-2-semibold text-neutral-default-900">
            탈부 관리
          </h1>
          <p className="text-body-3-regular text-neutral-medium-600">
            탈부한 구성원 기록을 등록하고 확인해요
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-(--umc-spacing-gap-12)">
          {hasSelection ? (
            <Button
              color="white"
              onClick={() => {
                setSelectedIds(new Set())
              }}
              size="sm"
              type="button"
              variant="fill"
            >
              선택 해제
            </Button>
          ) : (
            <Button
              color="brand"
              leadingIcon={
                <AddIcon aria-hidden color="currentColor" size={14} />
              }
              onClick={() => {
                void navigate({
                  to: "/activity/withdrawal/register",
                })
              }}
              size="sm"
              type="button"
              variant="fill"
            >
              탈부 등록하기
            </Button>
          )}
          <Button
            color={hasSelection ? "neutral" : "white"}
            disabled={!hasSelection}
            onClick={() => {
              setCsvExportOpen(true)
            }}
            size="sm"
            type="button"
            variant="fill"
          >
            {hasSelection
              ? `${selectedIds.size}명ㆍCSV 내보내기`
              : "CSV 내보내기"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-(--umc-spacing-gap-20)">
        <WithdrawalToolbar
          chapterId={chapterId}
          chapterOptions={chapterOptions}
          onChapterChange={(value) => {
            setChapterId(value)
            setSchoolId(null)
          }}
          onPartChange={setPart}
          onQueryChange={setQuery}
          onReasonChange={setReason}
          onSchoolChange={setSchoolId}
          onStatusChange={setStatus}
          part={part}
          partOptions={PART_FILTER_OPTIONS}
          query={query}
          reason={reason}
          schoolId={schoolId}
          schoolOptions={schoolOptions}
          status={status}
        />
        <WithdrawalTable
          hasActiveFilters={hasActiveFilters}
          isError={mock === "error"}
          isLoading={mock === "loading"}
          key={retryKey}
          members={members}
          onRegister={(memberId) => {
            void navigate({
              to: "/activity/withdrawal/$memberId/register",
              params: { memberId },
            })
          }}
          onResetFilters={resetFilters}
          onRetry={() => {
            setRetryKey((value) => value + 1)
          }}
          onSelectedIdsChange={setSelectedIds}
          onViewDetail={() => {
            // TODO: 탈부 상세
          }}
          selectedIds={selectedIds}
        />
      </div>

      <WithdrawalCsvExportDialog
        count={csvExportCount}
        mode={csvExportMode}
        onConfirm={() => {
          // TODO: CSV 다운로드 API 연동
          setCsvExportOpen(false)
        }}
        onOpenChange={setCsvExportOpen}
        open={csvExportOpen}
      />
    </section>
  )
}
