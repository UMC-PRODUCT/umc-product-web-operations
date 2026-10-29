import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useBlocker, useNavigate, useRouter } from "@tanstack/react-router"
import { Dialog, useToast } from "@umc-product/react"
import { useEffect, useMemo, useRef, useState } from "react"

import { buildNoticeCreateSummary } from "../model/build-notice-create-summary"
import { noticeCreateGisuListQueryOptions } from "../model/notice-create-gisu-query"
import {
  resolveNoticeCreateContextGisuId,
  resolveNoticeCreatePartOptions,
} from "../model/notice-create-part-options"
import { noticeListOrganizationQueryOptions } from "../model/notice-list-organization-query"
import {
  NOTICE_CREATE_FORBIDDEN_TOAST_MESSAGE,
  NOTICE_CREATE_IMAGE_UPLOAD_FAILURE_TOAST_MESSAGE,
  NOTICE_CREATE_PUBLISH_NETWORK_ERROR_MESSAGE,
  NOTICE_EDIT_SUCCESS_TOAST_MESSAGE,
} from "../model/notice-outcomes"
import {
  isNoticeEditFormDirty,
  submitNoticeEdit,
} from "../model/submit-notice-edit"
import { NoticeCreateFormFields } from "./notice-create/notice-create-form-fields"
import { NoticeDialogDimmed } from "./notice-dialog-dimmed"
import {
  captureNoticeDialogFocus,
  restoreNoticeDialogFocus,
} from "./notice-dialog-focus"
import { NoticeEditSummaryPanel } from "./notice-edit/notice-edit-summary-panel"
import {
  showNoticeErrorToast,
  showNoticeWarningToast,
} from "./show-notice-error-toast"
import { showNoticePrimarySuccessToast } from "./show-notice-primary-success-toast"

import type { NoticeCreateFormState } from "../model/notice-create-form"

type NoticeEditPageProps = {
  initialForm: NoticeCreateFormState
  listAudience?: "challenger" | "staff"
  noticeId: number
}

export function NoticeEditPage({
  initialForm,
  listAudience,
  noticeId,
}: NoticeEditPageProps) {
  const navigate = useNavigate()
  const router = useRouter()
  const queryClient = useQueryClient()
  const toast = useToast()
  const baselineFormRef = useRef(initialForm)
  const [form, setForm] = useState<NoticeCreateFormState>(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showRequiredFieldErrors, setShowRequiredFieldErrors] = useState(false)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const allowLeaveRef = useRef(false)
  const pendingLeaveToRef = useRef<string | null>(null)
  const leaveDialogFocusStore = useRef<HTMLElement | null>(null)
  const isDirty = useMemo(
    () => isNoticeEditFormDirty(form, baselineFormRef.current),
    [form],
  )

  const blocker = useBlocker({
    enableBeforeUnload: isDirty,
    shouldBlockFn: () => {
      if (allowLeaveRef.current) {
        return false
      }
      return isDirty
    },
    withResolver: true,
  })

  useEffect(() => {
    if (blocker.status === "blocked") {
      captureNoticeDialogFocus(leaveDialogFocusStore)
      setLeaveDialogOpen(true)
    }
  }, [blocker.status])

  const gisuListQuery = useQuery(noticeCreateGisuListQueryOptions())

  const contextGisuId = useMemo(
    () => resolveNoticeCreateContextGisuId(form, null),
    [form],
  )

  const organizationQuery = useQuery(
    noticeListOrganizationQueryOptions(contextGisuId),
  )

  const contextGeneration = useMemo(() => {
    if (contextGisuId == null) {
      return null
    }
    const gisu = gisuListQuery.data?.find(
      (item) => item.gisuId === contextGisuId,
    )
    return gisu?.generation ?? null
  }, [contextGisuId, gisuListQuery.data])

  const partOptions = useMemo(
    () => resolveNoticeCreatePartOptions(contextGeneration),
    [contextGeneration],
  )

  const organization = useMemo(() => {
    const chapters = organizationQuery.data?.chapters ?? []
    const schools = organizationQuery.data?.schools ?? []
    const gisuOptions = (gisuListQuery.data ?? []).map((gisu) => ({
      value: String(gisu.gisuId),
      label: `${gisu.generation}기`,
    }))

    return { chapters, gisuOptions, schools }
  }, [
    gisuListQuery.data,
    organizationQuery.data?.chapters,
    organizationQuery.data?.schools,
  ])

  const summaryLabels = useMemo(() => {
    const gisuLabel =
      organization.gisuOptions.find(
        (option) =>
          form.targetGisuId != null &&
          option.value === String(form.targetGisuId),
      )?.label ?? null

    const chapterName =
      organization.chapters.find((chapter) => chapter.id === form.chapterId)
        ?.name ?? null

    const schoolName =
      organization.schools.find((school) => school.schoolId === form.schoolId)
        ?.schoolName ?? null

    return { chapterName, gisuLabel, schoolName }
  }, [form.chapterId, form.schoolId, form.targetGisuId, organization])

  const summary = buildNoticeCreateSummary(form, summaryLabels)
  const targetSummaryLine = summary.targetLine

  const patchForm = (patch: Partial<NoticeCreateFormState>) => {
    setForm((current) => ({ ...current, ...patch }))
    if ("title" in patch || "content" in patch) {
      setShowRequiredFieldErrors(false)
    }
  }

  const dismissLeaveDialog = () => {
    setLeaveDialogOpen(false)
    pendingLeaveToRef.current = null
    if (blocker.status === "blocked") {
      blocker.reset?.()
    }
    restoreNoticeDialogFocus(leaveDialogFocusStore)
  }

  const confirmLeave = () => {
    setLeaveDialogOpen(false)
    leaveDialogFocusStore.current = null
    allowLeaveRef.current = true
    const pendingTo = pendingLeaveToRef.current
    pendingLeaveToRef.current = null

    if (pendingTo != null) {
      void navigate({
        params: { noticeId: String(noticeId) },
        search: listAudience ? { listAudience } : {},
        to: "/notices/$noticeId",
      })
      return
    }

    blocker.proceed?.()
  }

  const requestLeave = () => {
    if (allowLeaveRef.current || !isDirty) {
      void navigate({
        params: { noticeId: String(noticeId) },
        search: listAudience ? { listAudience } : {},
        to: "/notices/$noticeId",
      })
      return
    }
    captureNoticeDialogFocus(leaveDialogFocusStore)
    pendingLeaveToRef.current = `/notices/${noticeId}`
    setLeaveDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setShowRequiredFieldErrors(true)

    try {
      const outcome = await submitNoticeEdit({ form, noticeId })

      if (outcome.kind === "success") {
        allowLeaveRef.current = true
        showNoticePrimarySuccessToast(toast, NOTICE_EDIT_SUCCESS_TOAST_MESSAGE)
        void queryClient.invalidateQueries({ queryKey: ["notices"] })
        await router.invalidate({
          filter: (match) => match.routeId === "/_admin/notices/$noticeId",
        })
        await navigate({
          params: { noticeId: String(noticeId) },
          search: listAudience ? { listAudience } : {},
          to: "/notices/$noticeId",
        })
        return
      }

      if (outcome.kind === "validation_error") {
        const hasTitleOrContentError =
          !form.title.trim() || !form.content.trim()
        if (!hasTitleOrContentError) {
          showNoticeErrorToast(toast, outcome.message)
        }
        return
      }

      if (outcome.kind === "forbidden") {
        showNoticeWarningToast(toast, NOTICE_CREATE_FORBIDDEN_TOAST_MESSAGE)
        return
      }

      if (outcome.kind === "not_found") {
        await navigate({
          params: { noticeId: String(noticeId) },
          to: "/notices/$noticeId",
        })
        return
      }

      showNoticeErrorToast(toast, NOTICE_CREATE_PUBLISH_NETWORK_ERROR_MESSAGE)
    } catch {
      showNoticeErrorToast(toast, NOTICE_CREATE_PUBLISH_NETWORK_ERROR_MESSAGE)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="bg-background-neutral-weak flex min-h-full w-full flex-col gap-(--umc-spacing-gap-32) pl-(--umc-spacing-padding-12)">
      <div className="flex min-w-0 flex-col gap-(--umc-spacing-gap-12)">
        <h1 className="text-heading-2-semibold text-neutral-default-900">
          공지 수정
        </h1>
      </div>

      <div className="flex w-full items-start gap-(--umc-spacing-gap-24)">
        <NoticeCreateFormFields
          form={form}
          isOrganizationLoading={
            organizationQuery.isLoading || gisuListQuery.isLoading
          }
          mode="edit"
          onChange={patchForm}
          partOptions={partOptions}
          onImageUploadReject={() => {
            showNoticeErrorToast(
              toast,
              NOTICE_CREATE_IMAGE_UPLOAD_FAILURE_TOAST_MESSAGE,
            )
          }}
          organization={organization}
          showRequiredFieldErrors={showRequiredFieldErrors}
          targetSummaryLine={targetSummaryLine}
        />
        <NoticeEditSummaryPanel
          isSubmitting={isSubmitting}
          onCancel={requestLeave}
          onSubmitClick={() => {
            void handleSubmit()
          }}
        />
      </div>

      {leaveDialogOpen ? <NoticeDialogDimmed intensity="medium" /> : null}
      <Dialog
        cancelLabel="계속 수정"
        color="brand"
        confirmLabel="나가기"
        description="지금 나가면 변경된 내용이 모두 사라져요"
        onCancel={dismissLeaveDialog}
        onConfirm={confirmLeave}
        onOpenChange={(open) => {
          if (!open) {
            dismissLeaveDialog()
          }
        }}
        open={leaveDialogOpen}
        title="수정한 내용이 저장되지 않았어요"
      />
    </section>
  )
}
