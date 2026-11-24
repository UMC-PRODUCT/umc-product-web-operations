import "./notice-create-publish-dialog.css"

import { useMutation, useQuery } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Dialog, useToast } from "@umc-product/react"
import { useEffect, useMemo, useRef, useState } from "react"

import { toOrganizationLists } from "@/entities/organization"

import { buildNoticeCreateSummary } from "../model/build-notice-create-summary"
import {
  normalizeNoticeCreateForm,
  resetNoticeCreateOrganization,
} from "../model/normalize-notice-create-form"
import { isNoticeCentralUnrestrictedCreateContext } from "../model/notice-central-create-access"
import {
  isNoticeChapterPresidentChallengerContext,
  resolveNoticeChapterPresidentChallengerLock,
} from "../model/notice-chapter-president-access"
import { isNoticeCreateFormDirty } from "../model/notice-create-dirty"
import {
  INITIAL_NOTICE_CREATE_FORM,
  type NoticeCreateFormState,
} from "../model/notice-create-form"
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
  NOTICE_PUBLISH_TOAST_MESSAGE,
} from "../model/notice-outcomes"
import { resolveNoticeSchoolExecutiveLock } from "../model/notice-school-executive-access"
import {
  isNoticeSchoolStaffContext,
  resolveNoticeSchoolStaffLock,
} from "../model/notice-school-staff-access"
import {
  submitNoticeCreate,
  type SubmitNoticeCreateProgress,
} from "../model/submit-notice-create"
import { NoticeCreateFormFields } from "./notice-create/notice-create-form-fields"
import { NoticeCreatePublishDialogErrorToast } from "./notice-create/notice-create-publish-dialog-error-toast"
import { NoticeCreateSummaryPanel } from "./notice-create/notice-create-summary-panel"
import { NoticeCreateVotePanel } from "./notice-create/notice-create-vote-panel"
import { NoticeVoteDeleteDialog } from "./notice-create/notice-vote-delete-dialog"
import {
  captureNoticeDialogFocus,
  restoreNoticeDialogFocus,
} from "./notice-dialog-focus"
import {
  showNoticeCreateForbiddenToast,
  showNoticeErrorToast,
  showNoticeImageUploadFailureToast,
} from "./show-notice-error-toast"
import { showNoticePrimarySuccessToast } from "./show-notice-primary-success-toast"
import { useNoticeLeaveConfirm } from "./use-notice-leave-confirm"
import { useNoticeVoteDraft } from "./use-notice-vote-draft"

import type { NoticeAdminAccessContext } from "../model/notice-admin-access-context"
import type { NoticeOperatorSession } from "../model/notice-session"

type NoticeCreatePageProps = {
  adminSession: NoticeAdminAccessContext
  session: NoticeOperatorSession
}

export function NoticeCreatePage({
  adminSession,
  session,
}: NoticeCreatePageProps) {
  const navigate = useNavigate()
  const toast = useToast()
  const [form, setForm] = useState<NoticeCreateFormState>(
    INITIAL_NOTICE_CREATE_FORM,
  )
  const [showRequiredFieldErrors, setShowRequiredFieldErrors] = useState(false)
  const [publishDialogOpen, setPublishDialogOpen] = useState(false)
  /** 게시 Dialog slot에 표시할 오류 문구 (null이면 없음) */
  const [publishError, setPublishError] = useState<string | null>(null)
  const publishDialogFocusStore = useRef<HTMLElement | null>(null)
  /** 게시 실패 후 재시도 시 완료된 단계(이미지·공지·첨부·투표)를 건너뛰기 위한 진행 상황 */
  const submitProgressRef = useRef<SubmitNoticeCreateProgress | null>(null)
  const {
    clearVoteDraft,
    closeVotePanel,
    openVoteDeleteDialog,
    openVotePanel,
    saveVoteDraft,
    setVoteDeleteDialogOpen,
    voteDeleteDialogOpen,
    voteDraft,
    votePanelOpen,
  } = useNoticeVoteDraft({
    onDraftChange: () => {
      submitProgressRef.current = null
    },
  })

  const isDirty = useMemo(
    () => isNoticeCreateFormDirty(form) || voteDraft != null,
    [form, voteDraft],
  )

  const {
    allowLeave,
    confirmLeave,
    dismissLeaveDialog,
    leaveDialogOpen,
    requestLeave,
  } = useNoticeLeaveConfirm({
    isDirty,
    navigateTo: (to) => {
      void navigate({ to })
    },
  })
  const gisuListQuery = useQuery(noticeCreateGisuListQueryOptions())

  const contextGisuId = useMemo(
    () => resolveNoticeCreateContextGisuId(form, session.gisuId),
    [form, session.gisuId],
  )

  const organizationQuery = useQuery(
    noticeListOrganizationQueryOptions(contextGisuId),
  )

  const organizationLists = useMemo(
    () => toOrganizationLists(organizationQuery.data),
    [organizationQuery.data],
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

  const chapterPresidentChallengerOnly = useMemo(
    () => isNoticeChapterPresidentChallengerContext(adminSession),
    [adminSession],
  )

  const centralUnrestrictedCreate = useMemo(
    () => isNoticeCentralUnrestrictedCreateContext(adminSession),
    [adminSession],
  )

  const chapterPresidentLockResult = useMemo(
    () =>
      resolveNoticeChapterPresidentChallengerLock(
        adminSession,
        organizationLists,
      ),
    [adminSession, organizationLists],
  )

  const chapterPresidentUnresolved =
    chapterPresidentLockResult.status === "unresolved"

  const chapterPresidentLockedChapterId =
    chapterPresidentLockResult.status === "locked"
      ? chapterPresidentLockResult.lock.chapterId
      : null

  const chapterPresidentCreateLock = useMemo(() => {
    if (chapterPresidentLockedChapterId == null || session.gisuId == null) {
      return null
    }

    return {
      chapterId: chapterPresidentLockedChapterId,
      targetGisuId: session.gisuId,
    }
  }, [chapterPresidentLockedChapterId, session.gisuId])

  const schoolExecutiveLockedSchoolId = useMemo(() => {
    if (chapterPresidentCreateLock != null || session.gisuId == null) {
      return null
    }

    const resolved =
      resolveNoticeSchoolExecutiveLock(adminSession, organizationLists) ??
      resolveNoticeSchoolStaffLock(adminSession, organizationLists)
    return resolved?.schoolId ?? null
  }, [
    adminSession,
    chapterPresidentCreateLock,
    organizationLists,
    session.gisuId,
  ])

  const schoolExecutiveCreateLock = useMemo(() => {
    if (schoolExecutiveLockedSchoolId == null || session.gisuId == null) {
      return null
    }

    return {
      schoolId: schoolExecutiveLockedSchoolId,
      targetGisuId: session.gisuId,
    }
  }, [schoolExecutiveLockedSchoolId, session.gisuId])

  const schoolStaffPartsRequired = useMemo(
    () =>
      isNoticeSchoolStaffContext(adminSession) &&
      schoolExecutiveCreateLock != null,
    [adminSession, schoolExecutiveCreateLock],
  )

  useEffect(() => {
    setForm((current) =>
      normalizeNoticeCreateForm(current, {
        chapterPresidentChallengerOnly,
        chapterPresidentCreateLock,
        contextGeneration,
        schoolExecutiveCreateLock,
        sessionGisuId: session.gisuId,
      }),
    )
  }, [
    chapterPresidentChallengerOnly,
    chapterPresidentLockedChapterId,
    contextGeneration,
    schoolExecutiveLockedSchoolId,
    session.gisuId,
    chapterPresidentCreateLock,
    schoolExecutiveCreateLock,
  ])

  useEffect(() => {
    if (
      chapterPresidentCreateLock != null ||
      schoolExecutiveCreateLock != null
    ) {
      return
    }

    setForm(resetNoticeCreateOrganization)
  }, [
    chapterPresidentCreateLock,
    chapterPresidentLockedChapterId,
    contextGisuId,
    schoolExecutiveCreateLock,
    schoolExecutiveLockedSchoolId,
  ])
  const organization = useMemo(() => {
    const gisuOptions = (gisuListQuery.data ?? []).map((gisu) => ({
      value: String(gisu.gisuId),
      label: `${gisu.generation}기`,
    }))

    return {
      chapters: organizationLists.chapters,
      gisuOptions,
      schools: organizationLists.schools,
    }
  }, [gisuListQuery.data, organizationLists])

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
    // 입력이 바뀌면 이전 실패 시도의 진행 상황은 더 이상 유효하지 않다
    submitProgressRef.current = null
    setForm((current) => ({ ...current, ...patch }))
    if ("title" in patch || "content" in patch) {
      setShowRequiredFieldErrors(false)
    }
  }

  const submitMutation = useMutation({
    mutationFn: submitNoticeCreate,
    onSuccess: async (outcome, variables) => {
      if (outcome.kind === "success") {
        submitProgressRef.current = null
        restoreNoticeDialogFocus(publishDialogFocusStore)
        publishDialogFocusStore.current = null
        setPublishDialogOpen(false)
        allowLeave()
        showNoticePrimarySuccessToast(toast, NOTICE_PUBLISH_TOAST_MESSAGE)
        await navigate({
          to: "/notices",
          search: {},
        })
        return
      }

      if (outcome.kind === "validation_error") {
        setPublishDialogOpen(false)
        restoreNoticeDialogFocus(publishDialogFocusStore)
        const hasTitleOrContentError =
          !variables.form.title.trim() || !variables.form.content.trim()
        if (!hasTitleOrContentError) {
          showNoticeErrorToast(toast, outcome.message)
        }
        return
      }

      if (outcome.kind === "forbidden") {
        setPublishDialogOpen(false)
        restoreNoticeDialogFocus(publishDialogFocusStore)
        showNoticeCreateForbiddenToast(
          toast,
          NOTICE_CREATE_FORBIDDEN_TOAST_MESSAGE,
        )
        return
      }

      if (outcome.kind === "server_error") {
        setPublishError(outcome.message)
        return
      }

      setPublishError(NOTICE_CREATE_PUBLISH_NETWORK_ERROR_MESSAGE)
    },
    onError: () => {
      setPublishDialogOpen(false)
      restoreNoticeDialogFocus(publishDialogFocusStore)
      setPublishError(NOTICE_CREATE_PUBLISH_NETWORK_ERROR_MESSAGE)
    },
  })
  const isSubmitting = submitMutation.isPending

  const dismissPublishDialog = () => {
    if (isSubmitting) {
      return
    }
    setPublishError(null)
    setPublishDialogOpen(false)
    restoreNoticeDialogFocus(publishDialogFocusStore)
  }

  const openPublishDialog = () => {
    if (chapterPresidentUnresolved) {
      return
    }
    if (isSubmitting) {
      return
    }
    setPublishError(null)
    captureNoticeDialogFocus(publishDialogFocusStore)
    setPublishDialogOpen(true)
  }

  const handlePublishConfirm = () => {
    if (isSubmitting) {
      return
    }

    setPublishError(null)
    setShowRequiredFieldErrors(true)

    const progress = submitProgressRef.current ?? {}
    submitProgressRef.current = progress

    submitMutation.mutate({
      adminSession,
      form,
      session,
      operationGisuId: contextGisuId,
      targetGeneration: contextGeneration,
      voteDraft,
      progress,
    })
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
        {chapterPresidentUnresolved ? (
          <p className="text-body-3-regular text-status-error-500" role="alert">
            소속 지부를 확인할 수 없습니다. 관리자에게 문의해 주세요.
          </p>
        ) : null}
      </div>

      <div className="flex w-full items-start gap-(--umc-spacing-gap-24)">
        <NoticeCreateFormFields
          centralUnrestrictedCreate={centralUnrestrictedCreate}
          chapterPresidentChallengerOnly={chapterPresidentChallengerOnly}
          chapterPresidentCreateLock={chapterPresidentCreateLock}
          form={form}
          schoolExecutiveCreateLock={schoolExecutiveCreateLock}
          schoolStaffPartsRequired={schoolStaffPartsRequired}
          isOrganizationLoading={
            organizationQuery.isLoading || gisuListQuery.isLoading
          }
          onChange={patchForm}
          partOptions={partOptions}
          onImageUploadReject={() => {
            showNoticeImageUploadFailureToast(
              toast,
              NOTICE_CREATE_IMAGE_UPLOAD_FAILURE_TOAST_MESSAGE,
            )
          }}
          organization={organization}
          onVoteAddClick={openVotePanel}
          onVoteDeleteClick={openVoteDeleteDialog}
          onVoteEditClick={openVotePanel}
          showRequiredFieldErrors={showRequiredFieldErrors}
          targetSummaryLine={targetSummaryLine}
          voteDraft={voteDraft}
        />
        <NoticeCreateSummaryPanel
          audienceTags={summary.audienceTags}
          isSubmitting={isSubmitting || chapterPresidentUnresolved}
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

      <Dialog
        cancelLabel="돌아가기"
        className={
          publishError != null
            ? "notice-create-publish-dialog notice-create-publish-dialog--slot-error"
            : "notice-create-publish-dialog"
        }
        color="brand"
        confirmLabel="게시하기"
        confirmLoading={isSubmitting}
        description={
          <>
            등록하면 챌린저 앱에 바로 보이고, 이미 전송된 푸시 알림은 <br />
            되돌릴 수 없어요
          </>
        }
        onCancel={dismissPublishDialog}
        onConfirm={() => {
          handlePublishConfirm()
        }}
        onOpenChange={(open) => {
          if (isSubmitting) {
            return
          }
          if (!open) {
            setPublishError(null)
            restoreNoticeDialogFocus(publishDialogFocusStore)
          }
          setPublishDialogOpen(open)
        }}
        open={publishDialogOpen || isSubmitting}
        title="공지를 올릴까요?"
      >
        {publishError != null ? (
          <NoticeCreatePublishDialogErrorToast message={publishError} />
        ) : null}
      </Dialog>

      <NoticeCreateVotePanel
        initialDraft={voteDraft ?? undefined}
        onClose={closeVotePanel}
        onCreate={saveVoteDraft}
        open={votePanelOpen}
      />

      <NoticeVoteDeleteDialog
        onConfirm={clearVoteDraft}
        onOpenChange={setVoteDeleteDialogOpen}
        open={voteDeleteDialogOpen}
      />

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
