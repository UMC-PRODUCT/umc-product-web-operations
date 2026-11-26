import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { AddIcon } from "@umc-product/icons"
import { Button, Pagination, useToast } from "@umc-product/react"
import dayjs from "dayjs"
import { useEffect, useMemo, useState } from "react"

import { useSelectedGisu } from "@/entities/gisu"
import {
  gisuOrganizationQueryOptions,
  toOrganizationLists,
} from "@/entities/organization"
import { isForbiddenError, isNotFoundError } from "@/shared/lib/http-status"
import { useDebouncedValue } from "@/shared/lib/use-debounced-value"

import {
  DEACTIVATION_LIST_PAGE_SIZE,
  exportDeactivationsCsv,
  getDeactivationDetail,
  listDeactivations,
} from "../api/deactivations"
import { deactivationKeys } from "../model/deactivation-keys"
import {
  downloadCsvBlob,
  resolveExportFilename,
  toDeactivationListStatus,
  toDeactivationListType,
  toDeactivationPart,
  toExportColumns,
  toExportTypes,
  toWithdrawalDetail,
  toWithdrawalMember,
} from "../model/map-deactivation"
import { MOCK_WITHDRAWALS } from "../model/mock-withdrawals"
import {
  DEFAULT_FILTER_EXPORT_COLUMNS,
  type WithdrawalExportFieldAccess,
} from "../model/withdrawal-export"
import {
  showWithdrawalExportFailureToast,
  showWithdrawalExportSuccessToast,
} from "./show-withdrawal-export-toast"
import { useWithdrawalRegisterSuccessToast } from "./use-withdrawal-register-success-toast"
import {
  WithdrawalCsvExportDialog,
  type WithdrawalCsvExportMode,
} from "./withdrawal-csv-export-dialog"
import { WithdrawalDetailErrorDialog } from "./withdrawal-detail-error-dialog"
import { WithdrawalDetailPanel } from "./withdrawal-detail-panel"
import { WithdrawalExportPanel } from "./withdrawal-export-panel"
import { WithdrawalTable } from "./withdrawal-table"
import { WithdrawalToolbar } from "./withdrawal-toolbar"

import type { WithdrawalMember } from "../model/types"
import type { WithdrawalDetail } from "../model/withdrawal-detail"

const PART_FILTER_OPTIONS = [
  { value: "web-pe", label: "Web/PE" },
  { value: "design", label: "Design" },
  { value: "pm", label: "Plan" },
  { value: "mobile-pe", label: "Mobile/PE" },
] as const

const SEARCH_DEBOUNCE_MS = 300

export type WithdrawalListMock =
  | "loading"
  | "error"
  | "empty"
  | "detail-loading"
  | "detail-error"
  | "export-error"

type WithdrawalPageProps = {
  /** URL `?mock=` — 조회 상태 UI 확인용 (개발 모드 전용) */
  mock?: WithdrawalListMock
  /** 역할별 내보내기 Panel 기간·학교 필드 권한 */
  exportFieldAccess: WithdrawalExportFieldAccess
}

function toTotalPages(value: unknown) {
  if (typeof value !== "number" && typeof value !== "string") {
    return 0
  }
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0
}

function formatDateParam(date: Date): string {
  return dayjs(date).format("YYYY-MM-DD")
}

export function WithdrawalPage({
  mock,
  exportFieldAccess,
}: WithdrawalPageProps) {
  useWithdrawalRegisterSuccessToast()
  const navigate = useNavigate()
  const selectedGisu = useSelectedGisu()
  const toast = useToast()
  const [chapterId, setChapterId] = useState<string | null>(null)
  const [schoolId, setSchoolId] = useState<string | null>(null)
  const [part, setPart] = useState<string | null>(null)
  const [reason, setReason] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [csvExportOpen, setCsvExportOpen] = useState(false)
  const [exportPanelOpen, setExportPanelOpen] = useState(false)
  const [exportSubmitting, setExportSubmitting] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailErrorOpen, setDetailErrorOpen] = useState(false)
  const [detailDeactivationId, setDetailDeactivationId] = useState<
    number | null
  >(null)
  const [detail, setDetail] = useState<WithdrawalDetail | null>(null)

  const debouncedQuery = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS)
  const useMock = mock != null

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

  const listParams = useMemo(
    () => ({
      page,
      size: DEACTIVATION_LIST_PAGE_SIZE,
      gisuId: selectedGisu.gisuId ?? undefined,
      chapterId: chapterId == null ? undefined : Number.parseInt(chapterId, 10),
      schoolId: schoolId == null ? undefined : Number.parseInt(schoolId, 10),
      part: toDeactivationPart(part),
      keyword: debouncedQuery || undefined,
      status: toDeactivationListStatus(status),
      type: toDeactivationListType(reason),
    }),
    [
      chapterId,
      debouncedQuery,
      page,
      part,
      reason,
      schoolId,
      selectedGisu.gisuId,
      status,
    ],
  )

  const listQuery = useQuery({
    queryKey: deactivationKeys.list(listParams),
    queryFn: () => listDeactivations(listParams),
    enabled: !useMock && !selectedGisu.isPending && selectedGisu.gisuId != null,
    placeholderData: keepPreviousData,
    retry: false,
  })

  const detailQuery = useQuery({
    queryKey:
      detailDeactivationId == null
        ? deactivationKeys.detail(-1)
        : deactivationKeys.detail(detailDeactivationId),
    queryFn: () => getDeactivationDetail(detailDeactivationId!),
    enabled:
      !useMock &&
      detailOpen &&
      detailDeactivationId != null &&
      mock !== "detail-loading" &&
      mock !== "detail-error",
    retry: false,
  })

  useEffect(() => {
    setPage(0)
    setSelectedIds(new Set())
  }, [
    chapterId,
    schoolId,
    part,
    reason,
    status,
    debouncedQuery,
    selectedGisu.gisuId,
  ])

  const mockMembers = useMemo(() => {
    if (mock === "empty") {
      return [] as WithdrawalMember[]
    }
    const keyword = debouncedQuery.toLowerCase()
    return MOCK_WITHDRAWALS.filter((member) => {
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
  }, [debouncedQuery, mock, part, reason, status])

  const members = useMemo(() => {
    if (useMock) {
      return mockMembers
    }
    return (listQuery.data?.content ?? [])
      .map(toWithdrawalMember)
      .filter((member): member is WithdrawalMember => member != null)
  }, [listQuery.data?.content, mockMembers, useMock])

  const totalPages = useMock ? 1 : toTotalPages(listQuery.data?.totalPages)
  const isForbidden = !useMock && isForbiddenError(listQuery.error)
  const isListError =
    mock === "error" || (!useMock && listQuery.isError && !isForbidden)
  const isListLoading =
    mock === "loading" ||
    (!useMock &&
      (selectedGisu.isPending ||
        (listQuery.isPending && listQuery.data == null)))

  const hasActiveFilters =
    chapterId != null ||
    schoolId != null ||
    part != null ||
    reason != null ||
    status != null ||
    query.trim().length > 0

  useEffect(() => {
    if (useMock) {
      if (mock === "detail-error") {
        setDetail(null)
        setDetailOpen(false)
        setDetailErrorOpen(true)
        return
      }
      if (mock === "detail-loading") {
        setDetail(null)
        return
      }
      return
    }

    if (!detailOpen || detailDeactivationId == null) {
      return
    }

    if (detailQuery.isError) {
      setDetail(null)
      setDetailOpen(false)
      setDetailErrorOpen(true)
      return
    }

    if (detailQuery.data != null) {
      setDetail(toWithdrawalDetail(detailQuery.data))
    }
  }, [
    detailDeactivationId,
    detailOpen,
    detailQuery.data,
    detailQuery.isError,
    mock,
    useMock,
  ])

  const resetFilters = () => {
    setChapterId(null)
    setSchoolId(null)
    setPart(null)
    setReason(null)
    setStatus(null)
    setQuery("")
    setPage(0)
    setSelectedIds(new Set())
  }

  const openWithdrawalDetail = (rowId: string) => {
    const member = members.find((item) => item.id === rowId)
    if (member?.deactivationId == null) {
      return
    }

    setDetailDeactivationId(member.deactivationId)
    setDetailErrorOpen(false)

    if (mock === "detail-error") {
      setDetailOpen(false)
      setDetail(null)
      setDetailErrorOpen(true)
      return
    }

    setDetailOpen(true)
    if (mock === "detail-loading") {
      setDetail(null)
      return
    }

    if (useMock) {
      setDetail(
        toWithdrawalDetail({
          deactivationId: member.deactivationId,
          challenger: {
            challengerId: member.challengerId,
            name: member.name,
            nickname: member.nickname,
            schoolName: member.schoolLabel,
            chapterName: member.chapterLabel,
            generation: member.generationNumber,
          },
          reasonName: member.reasonLabel,
          memo: "",
          images: [],
          links: [],
          histories: [],
        }),
      )
    }
  }

  const selectedDeactivationIds = useMemo(() => {
    return members
      .filter(
        (member) => selectedIds.has(member.id) && member.deactivationId != null,
      )
      .map((member) => member.deactivationId!)
  }, [members, selectedIds])

  const hasSelection = selectedDeactivationIds.length > 0
  /** 미선택 CSV → 전체(필터) 확인 모달. 선택은 Panel에서 열 고른 뒤 내보냄 */
  const csvExportMode: WithdrawalCsvExportMode = "all"
  const exportCountHint = useMock
    ? members.length
    : typeof listQuery.data?.totalElements === "number"
      ? listQuery.data.totalElements
      : members.length
  const csvExportCount = exportCountHint

  const runFilterExport = async () => {
    if (mock === "export-error") {
      showWithdrawalExportFailureToast(toast)
      setCsvExportOpen(false)
      return
    }
    if (useMock) {
      showWithdrawalExportSuccessToast(toast, csvExportCount)
      setCsvExportOpen(false)
      return
    }

    setExportSubmitting(true)
    try {
      const { blob, headers } = await exportDeactivationsCsv({
        gisuId: selectedGisu.gisuId ?? undefined,
        chapterId:
          chapterId == null ? undefined : Number.parseInt(chapterId, 10),
        schoolId: schoolId == null ? undefined : Number.parseInt(schoolId, 10),
        part: toDeactivationPart(part),
        keyword: debouncedQuery || undefined,
        columns: toExportColumns(new Set(DEFAULT_FILTER_EXPORT_COLUMNS)),
      })
      downloadCsvBlob(
        blob,
        resolveExportFilename(
          typeof headers["content-disposition"] === "string"
            ? headers["content-disposition"]
            : undefined,
        ),
      )
      showWithdrawalExportSuccessToast(toast, csvExportCount)
      setCsvExportOpen(false)
    } catch {
      showWithdrawalExportFailureToast(toast)
      setCsvExportOpen(false)
    } finally {
      setExportSubmitting(false)
    }
  }

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
            onClick={() => {
              if (hasSelection) {
                // 역할별 기간·학교 Panel (중앙 / 회장단 / 일반)
                setExportPanelOpen(true)
                return
              }
              // Figma 2235:13734 — 전체(필터) 확인 모달
              setCsvExportOpen(true)
            }}
            size="sm"
            type="button"
            variant="fill"
          >
            {hasSelection
              ? `${selectedDeactivationIds.length}명ㆍCSV 내보내기`
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
          isError={isListError || isForbidden}
          isLoading={isListLoading}
          members={members}
          onRegister={(challengerId) => {
            void navigate({
              to: "/activity/withdrawal/$memberId/register",
              params: { memberId: challengerId },
            })
          }}
          onResetFilters={resetFilters}
          onRetry={() => {
            void listQuery.refetch()
          }}
          onSelectedIdsChange={setSelectedIds}
          onViewDetail={openWithdrawalDetail}
          selectedIds={selectedIds}
        />
        {!useMock && totalPages > 1 && members.length > 0 ? (
          <div className="flex justify-center pt-(--umc-spacing-padding-8)">
            <Pagination
              onPageChange={(next) => {
                setPage(Math.max(0, next - 1))
              }}
              page={page + 1}
              totalPages={totalPages}
            />
          </div>
        ) : null}
      </div>

      <WithdrawalCsvExportDialog
        count={csvExportCount}
        mode={csvExportMode}
        onConfirm={() => {
          if (exportSubmitting) {
            return
          }
          void runFilterExport()
        }}
        onOpenChange={setCsvExportOpen}
        open={csvExportOpen}
      />

      <WithdrawalExportPanel
        exportCount={selectedDeactivationIds.length}
        fieldAccess={exportFieldAccess}
        onExport={async (input) => {
          if (mock === "export-error") {
            showWithdrawalExportFailureToast(toast)
            return false
          }
          if (useMock) {
            showWithdrawalExportSuccessToast(
              toast,
              selectedDeactivationIds.length,
            )
            setSelectedIds(new Set())
            return true
          }
          if (selectedDeactivationIds.length === 0) {
            return false
          }

          try {
            const startDate = input.startDate
              ? formatDateParam(input.startDate)
              : undefined
            const endDate = input.endDate
              ? formatDateParam(input.endDate)
              : undefined
            const schoolIdValue =
              input.schoolId == null
                ? undefined
                : Number.parseInt(input.schoolId, 10)

            const { blob, headers } = await exportDeactivationsCsv({
              gisuId: selectedGisu.gisuId ?? undefined,
              deactivationIds: selectedDeactivationIds,
              schoolId: Number.isFinite(schoolIdValue)
                ? schoolIdValue
                : undefined,
              types: toExportTypes(input.types),
              startDate,
              endDate,
              columns: toExportColumns(new Set(input.columns)),
            })
            downloadCsvBlob(
              blob,
              resolveExportFilename(
                typeof headers["content-disposition"] === "string"
                  ? headers["content-disposition"]
                  : undefined,
              ),
            )
            showWithdrawalExportSuccessToast(
              toast,
              selectedDeactivationIds.length,
            )
            setSelectedIds(new Set())
            return true
          } catch {
            showWithdrawalExportFailureToast(toast)
            return false
          }
        }}
        onOpenChange={setExportPanelOpen}
        open={exportPanelOpen}
        schoolOptions={schoolOptions}
      />

      <WithdrawalDetailPanel
        detail={detail}
        isLoading={
          mock === "detail-loading" ||
          (!useMock && detailOpen && detailQuery.isPending)
        }
        onOpenChange={(open) => {
          setDetailOpen(open)
          if (!open) {
            // 닫힘 애니메이션 동안 detail을 유지해야 스켈레톤으로 깜빡이지 않음
            setDetailDeactivationId(null)
          }
        }}
        open={detailOpen}
      />

      <WithdrawalDetailErrorDialog
        onOpenChange={setDetailErrorOpen}
        onRetry={() => {
          if (detailDeactivationId == null) {
            setDetailErrorOpen(false)
            return
          }
          if (isNotFoundError(detailQuery.error)) {
            setDetailErrorOpen(false)
            return
          }
          setDetailOpen(true)
          void detailQuery.refetch()
        }}
        open={detailErrorOpen}
      />
    </section>
  )
}
