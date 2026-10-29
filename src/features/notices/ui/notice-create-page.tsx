import "./notice-create-publish-dialog.css"

import { useQuery } from "@tanstack/react-query"
import { useBlocker, useNavigate } from "@tanstack/react-router"
import { Dialog, useToast } from "@umc-product/react"
import { useEffect, useMemo, useRef, useState } from "react"

import { fetchActiveGisuOrganization } from "../api/gisu-organization.api"
import { buildNoticeCreateSummary } from "../model/build-notice-create-summary"
import { isNoticeCreateFormDirty } from "../model/notice-create-dirty"
import {
  INITIAL_NOTICE_CREATE_FORM,
  type NoticeCreateFormState,
} from "../model/notice-create-form"
import { noticeListOrganizationQueryOptions } from "../model/notice-list-organization-query"
import {
  NOTICE_CREATE_FORBIDDEN_TOAST_MESSAGE,
  NOTICE_CREATE_IMAGE_UPLOAD_FAILURE_TOAST_MESSAGE,
  NOTICE_CREATE_PUBLISH_NETWORK_ERROR_MESSAGE,
} from "../model/notice-outcomes"
import { submitNoticeCreate } from "../model/submit-notice-create"
import { NoticeCreateFormFields } from "./notice-create/notice-create-form-fields"
import { NoticeCreatePublishDialogErrorToast } from "./notice-create/notice-create-publish-dialog-error-toast"
import { NoticeCreateSummaryPanel } from "./notice-create/notice-create-summary-panel"
import { NoticeDialogDimmed } from "./notice-dialog-dimmed"
import {
  captureNoticeDialogFocus,
  restoreNoticeDialogFocus,
} from "./notice-dialog-focus"
import {
  showNoticeErrorToast,
  showNoticeWarningToast,
} from "./show-notice-error-toast"

import type { NoticeOperatorSession } from "../model/notice-session"

type NoticeCreatePageProps = {
  session: NoticeOperatorSession
}

export function NoticeCreatePage({ session }: NoticeCreatePageProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState<NoticeCreateFormState>(
    INITIAL_NOTICE_CREATE_FORM,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showRequiredFieldErrors, setShowRequiredFieldErrors] = useState(false)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const allowLeaveRef = useRef(false)
  const pendingLeaveToRef = useRef<string | null>(null)
  const leaveDialogFocusStore = useRef<HTMLElement | null>(null)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  const [publishNetworkError, setPublishNetworkError] = useState(false)
  const publishDialogFocusStore = useRef<HTMLElement | null>(null)

  const isDirty = useMemo(() => isNoticeCreateFormDirty(form), [form])

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

  const organizationQuery = useQuery(
    noticeListOrganizationQueryOptions(session.gisuId),
  )

  const activeGisuQuery = useQuery({
    queryKey: ["notices", "create", "gisu", session.gisuId],
    queryFn: () =>
      session.gisuId == null
        ? Promise.resolve(null)
        : fetchActiveGisuOrganization(session.gisuId),
    enabled: session.gisuId != null,
    staleTime: 60_000,
  })

  useEffect(() => {
    if (session.gisuId == null) {
      return
    }
    setForm((current) => {
      if (current.gisuMode !== "specific" || current.targetGisuId != null) {
        return current
      }
      return { ...current, targetGisuId: session.gisuId }
    })
  }, [session.gisuId])

  const organization = useMemo(() => {
    const chapters = organizationQuery.data?.chapters ?? []
    const schools = organizationQuery.data?.schools ?? []
    const generation = activeGisuQuery.data?.generation
    const gisuOptions =
      session.gisuId != null && generation != null
        ? [
            {
              value: String(session.gisuId),
              label: `${generation}기`,
            },
          ]
        : []

    return { chapters, gisuOptions, schools }
  }, [
    activeGisuQuery.data?.generation,
    organizationQuery.data?.chapters,
    organizationQuery.data?.schools,
    session.gisuId,
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
      void navigate({ to: pendingTo })
      return
    }

    blocker.proceed?.()
  }

  const requestLeave = (to = "/notices") => {
    if (allowLeaveRef.current || !isDirty) {
      void navigate({ to })
      return
    }
    captureNoticeDialogFocus(leaveDialogFocusStore)
    pendingLeaveToRef.current = to
    setLeaveDialogOpen(true)
  }

  const dismissPublishDialog = () => {
    if (isSubmitting) {
      return
    }
    setPublishNetworkError(false)
    setPublishDialogOpen(false)
    restoreNoticeDialogFocus(publishDialogFocusStore)
  }

  const openPublishDialog = () => {
    if (isSubmitting) {
      return
    }
    setPublishNetworkError(false)
    captureNoticeDialogFocus(publishDialogFocusStore)
    setPublishDialogOpen(true)
  }

  const handlePublishConfirm = async () => {
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setPublishNetworkError(false)
    setShowRequiredFieldErrors(true)

    const outcome = await submitNoticeCreate({ form, session })
    setIsSubmitting(false)

    if (outcome.kind === "success") {
      publishDialogFocusStore.current = null
      setPublishDialogOpen(false)
      allowLeaveRef.current = true
      void navigate({
        to: "/notices",
        search: { publishOutcome: "success" },
      })
      return
    }

    if (outcome.kind === "validation_error") {
      setPublishDialogOpen(false)
      restoreNoticeDialogFocus(publishDialogFocusStore)
      const hasTitleOrContentError = !form.title.trim() || !form.content.trim()
      if (!hasTitleOrContentError) {
        showNoticeErrorToast(toast, outcome.message)
      }
      return
    }

    if (outcome.kind === "forbidden") {
      setPublishDialogOpen(false)
      restoreNoticeDialogFocus(publishDialogFocusStore)
      showNoticeWarningToast(toast, NOTICE_CREATE_FORBIDDEN_TOAST_MESSAGE)
      return
    }

    setPublishNetworkError(true)
  }

  return (
    <section className="bg-background-neutral-weak flex min-h-full w-full flex-col gap-(--umc-spacing-gap-32) pl-(--umc-spacing-padding-12)">
      <div className="flex min-w-0 flex-col gap-(--umc-spacing-gap-12)">
        <h1 className="text-heading-2-semibold text-neutral-default-900">
          공지 작성
        </h1>
        <p className="text-body-3-regular text-neutral-medium-600">
          공지 대상과 내용을 설정하고 게시해요
        </p>
      </div>

      <div className="flex w-full items-start gap-(--umc-spacing-gap-24)">
        <NoticeCreateFormFields
          form={form}
          isOrganizationLoading={
            organizationQuery.isLoading || activeGisuQuery.isLoading
          }
          onChange={patchForm}
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
        <NoticeCreateSummaryPanel
          audienceTags={summary.audienceTags}
          isSubmitting={isSubmitting}
          onCancel={() => {
            requestLeave("/notices")
          }}
          onPublishClick={openPublishDialog}
          showMustRead={form.mustRead}
          showNotification={form.sendNotification}
          staffScopeLabel={summary.staffScopeLabel}
          targetLine={summary.targetLine}
        />
      </div>

      {publishDialogOpen || isSubmitting ? (
        <NoticeDialogDimmed intensity="medium" />
      ) : null}
      <Dialog
        cancelLabel="돌아가기"
        className={
          isSubmitting ? "notice-create-publish-dialog--submitting" : undefined
        }
        color="brand"
        confirmLabel={isSubmitting ? "게시 중..." : "게시하기"}
        description={
          <>
            등록하면 챌린저 앱에 바로 보이고, 이미 전송된 푸시 알림은 <br />
            되돌릴 수 없어요
          </>
        }
        onCancel={dismissPublishDialog}
        onConfirm={() => {
          void handlePublishConfirm()
        }}
        onOpenChange={(open) => {
          if (isSubmitting) {
            return
          }
          if (!open) {
            setPublishNetworkError(false)
            restoreNoticeDialogFocus(publishDialogFocusStore)
          }
          setPublishDialogOpen(open)
        }}
        open={publishDialogOpen || isSubmitting}
        title="공지를 올릴까요?"
      >
        {publishNetworkError ? (
          <NoticeCreatePublishDialogErrorToast
            message={NOTICE_CREATE_PUBLISH_NETWORK_ERROR_MESSAGE}
          />
        ) : null}
      </Dialog>

      {leaveDialogOpen ? <NoticeDialogDimmed intensity="medium" /> : null}
      <Dialog
        cancelLabel="계속 작성"
        color="brand"
        confirmLabel="나가기"
        description="지금 나가면 작성했던 내용이 모두 사라져요"
        onCancel={dismissLeaveDialog}
        onConfirm={confirmLeave}
        onOpenChange={(open) => {
          if (!open) {
            dismissLeaveDialog()
          }
        }}
        open={leaveDialogOpen}
        title="작성 중인 내용이 있어요"
      />
    </section>
  )
}
