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
import {
  isNoticeSuperAdminContext,
  type NoticeAdminAccessContext,
} from "../model/notice-admin-access-context"
import {
  isNoticeCentralAdminStaffChipRestricted,
  isNoticeCentralLeadStaffChipRestricted,
  isNoticeCentralUnrestrictedCreateContext,
} from "../model/notice-central-create-access"
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
import {
  readNoticeCreatePublishProgress,
  writeNoticeCreatePublishProgress,
} from "../model/notice-create-publish-progress-storage"
import { noticeListOrganizationQueryOptions } from "../model/notice-list-organization-query"
import {
  NOTICE_CREATE_FORBIDDEN_TOAST_MESSAGE,
  NOTICE_CREATE_IMAGE_UPLOAD_FAILURE_TOAST_MESSAGE,
  NOTICE_PUBLISH_TOAST_MESSAGE,
} from "../model/notice-outcomes"
import {
  isNoticeSchoolExecutiveContext,
  resolveNoticeSchoolExecutiveLock,
} from "../model/notice-school-executive-access"
import {
  isNoticeSchoolStaffChallengerOnlyContext,
  isNoticeSchoolStaffContext,
  resolveNoticeSchoolStaffLock,
} from "../model/notice-school-staff-access"
import {
  submitNoticeCreate,
  type SubmitNoticeCreateProgress,
} from "../model/submit-notice-create"
import { NoticeCreateFormFields } from "./notice-create/notice-create-form-fields"
import { NoticeCreateSummaryPanel } from "./notice-create/notice-create-summary-panel"
import { NoticeCreateVotePanel } from "./notice-create/notice-create-vote-panel"
import { NoticeVoteDeleteDialog } from "./notice-create/notice-vote-delete-dialog"
import {
  captureNoticeDialogFocus,
  restoreNoticeDialogFocus,
} from "./notice-dialog-focus"
import {
  showNoticeCreateForbiddenToast,
  showNoticeCreatePublishFailureToast,
  showNoticeErrorToast,
  showNoticeImageUploadFailureToast,
} from "./show-notice-error-toast"
import { showNoticePrimarySuccessToast } from "./show-notice-primary-success-toast"
import { useNoticeLeaveConfirm } from "./use-notice-leave-confirm"
import { useNoticeVoteDraft } from "./use-notice-vote-draft"

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

  useEffect(() => {
    const stored = readNoticeCreatePublishProgress()
    if (stored != null) {
      submitProgressRef.current = stored
    }
  }, [])

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

  const noticeCreateSuperAdmin = useMemo(
    () => isNoticeSuperAdminContext(adminSession),
    [adminSession],
  )

  const chapterPresidentChallengerOnly = useMemo(
    () =>
      noticeCreateSuperAdmin
        ? false
        : isNoticeChapterPresidentChallengerContext(adminSession),
    [adminSession, noticeCreateSuperAdmin],
  )

  const schoolStaffChallengerOnly = useMemo(
    () =>
      noticeCreateSuperAdmin
        ? false
        : isNoticeSchoolStaffChallengerOnlyContext(adminSession),
    [adminSession, noticeCreateSuperAdmin],
  )

  const centralUnrestrictedCreate = useMemo(
    () => isNoticeCentralUnrestrictedCreateContext(adminSession),
    [adminSession],
  )

  const centralLeadStaffChipRestricted = useMemo(
    () =>
      noticeCreateSuperAdmin
        ? false
        : isNoticeCentralLeadStaffChipRestricted(adminSession),
    [adminSession, noticeCreateSuperAdmin],
  )

  const centralAdminStaffChipRestricted = useMemo(
    () =>
      noticeCreateSuperAdmin
        ? false
        : isNoticeCentralAdminStaffChipRestricted(adminSession),
    [adminSession, noticeCreateSuperAdmin],
  )

  const chapterPresidentLockResult = useMemo(() => {
    if (noticeCreateSuperAdmin) {
      return { status: "not-applicable" as const }
    }

    return resolveNoticeChapterPresidentChallengerLock(
      adminSession,
      organizationLists,
    )
  }, [adminSession, noticeCreateSuperAdmin, organizationLists])

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
    if (
      chapterPresidentCreateLock != null ||
      session.gisuId == null ||
      schoolStaffChallengerOnly ||
      !isNoticeSchoolExecutiveContext(adminSession)
    ) {
      return null
    }

    return (
      resolveNoticeSchoolExecutiveLock(adminSession, organizationLists)
        ?.schoolId ?? null
    )
  }, [
    adminSession,
    chapterPresidentCreateLock,
    organizationLists,
    schoolStaffChallengerOnly,
    session.gisuId,
  ])

  const schoolStaffLockedSchoolId = useMemo(() => {
    if (
      !schoolStaffChallengerOnly ||
      chapterPresidentCreateLock != null ||
      session.gisuId == null
    ) {
      return null
    }

    return (
      resolveNoticeSchoolStaffLock(adminSession, organizationLists)?.schoolId ??
      null
    )
  }, [
    adminSession,
    chapterPresidentCreateLock,
    organizationLists,
    schoolStaffChallengerOnly,
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

  const schoolStaffCreateLock = useMemo(() => {
    if (schoolStaffLockedSchoolId == null || session.gisuId == null) {
      return null
    }

    return {
      schoolId: schoolStaffLockedSchoolId,
      targetGisuId: session.gisuId,
    }
  }, [schoolStaffLockedSchoolId, session.gisuId])

  const schoolStaffPartsRequired = useMemo(
    () => !noticeCreateSuperAdmin && isNoticeSchoolStaffContext(adminSession),
    [adminSession, noticeCreateSuperAdmin],
  )

  useEffect(() => {
    setForm((current) =>
      normalizeNoticeCreateForm(current, {
        centralAdminStaffChipRestricted,
        centralLeadStaffChipRestricted,
        chapterPresidentChallengerOnly,
        chapterPresidentCreateLock,
        contextGeneration,
        schoolExecutiveCreateLock,
        schoolStaffChallengerOnly,
        schoolStaffCreateLock,
        noticeCreateSuperAdmin,
        sessionGisuId: session.gisuId,
      }),
    )
  }, [
    centralAdminStaffChipRestricted,
    centralLeadStaffChipRestricted,
    chapterPresidentChallengerOnly,
    noticeCreateSuperAdmin,
    chapterPresidentLockedChapterId,
    contextGeneration,
    schoolExecutiveLockedSchoolId,
    schoolStaffChallengerOnly,
    schoolStaffCreateLock,
    schoolStaffLockedSchoolId,
    session.gisuId,
    chapterPresidentCreateLock,
    schoolExecutiveCreateLock,
  ])

  useEffect(() => {
    if (
      chapterPresidentCreateLock != null ||
      schoolExecutiveCreateLock != null ||
      schoolStaffCreateLock != null
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
    schoolStaffCreateLock,
    schoolStaffLockedSchoolId,
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

  const sessionGisuLabel = useMemo(() => {
    if (session.gisuId == null) {
      return null
    }
    return (
      organization.gisuOptions.find(
        (option) => option.value === String(session.gisuId),
      )?.label ?? null
    )
  }, [organization.gisuOptions, session.gisuId])

  const summaryLabels = useMemo(() => {
    const gisuLabel =
      form.targetGisuId != null
        ? (organization.gisuOptions.find(
            (option) => option.value === String(form.targetGisuId),
          )?.label ?? null)
        : null

    const chapterName =
      organization.chapters.find((chapter) => chapter.id === form.chapterId)
        ?.name ?? null

    const schoolName =
      organization.schools.find((school) => school.schoolId === form.schoolId)
        ?.schoolName ?? null

    return {
      chapterName,
      chapterPresidentChallengerActive:
        chapterPresidentCreateLock != null && form.challengerEnabled,
      gisuLabel,
      schoolName,
      sessionGisuId: session.gisuId,
    }
  }, [
    chapterPresidentCreateLock,
    form.challengerEnabled,
    form.chapterId,
    form.gisuMode,
    form.schoolId,
    form.targetGisuId,
    organization,
    session.gisuId,
    sessionGisuLabel,
  ])

  const summary = buildNoticeCreateSummary(form, summaryLabels)
  const recipientSummaryLine = summary.recipientLine

  const normalizeContext = useMemo(
    () => ({
      centralAdminStaffChipRestricted,
      centralLeadStaffChipRestricted,
      chapterPresidentChallengerOnly,
      chapterPresidentCreateLock,
      contextGeneration,
      schoolExecutiveCreateLock,
      schoolStaffChallengerOnly,
      schoolStaffCreateLock,
      noticeCreateSuperAdmin,
      sessionGisuId: session.gisuId,
    }),
    [
      centralAdminStaffChipRestricted,
      centralLeadStaffChipRestricted,
      chapterPresidentChallengerOnly,
      chapterPresidentCreateLock,
      contextGeneration,
      noticeCreateSuperAdmin,
      schoolExecutiveCreateLock,
      schoolStaffChallengerOnly,
      schoolStaffCreateLock,
      session.gisuId,
    ],
  )

  const patchForm = (patch: Partial<NoticeCreateFormState>) => {
    // 입력이 바뀌면 이전 실패 시도의 진행 상황은 더 이상 유효하지 않다
    submitProgressRef.current = null
    setForm((current) =>
      normalizeNoticeCreateForm({ ...current, ...patch }, normalizeContext),
    )
    if ("title" in patch || "content" in patch) {
      setShowRequiredFieldErrors(false)
    }
  }

  const navigateToListWithPublishFailureToast = async (
    progress?: SubmitNoticeCreateProgress | null,
  ) => {
    if (progress != null) {
      submitProgressRef.current = progress
    }
    writeNoticeCreatePublishProgress(submitProgressRef.current)

    setPublishDialogOpen(false)
    restoreNoticeDialogFocus(publishDialogFocusStore)
    publishDialogFocusStore.current = null

    allowLeave()
    await navigate({
      to: "/notices",
      search: {},
    })

    showNoticeCreatePublishFailureToast(toast, () => {
      void navigate({ to: "/notices/new" })
    })
  }

  const submitMutation = useMutation({
    mutationFn: submitNoticeCreate,
    onSuccess: async (outcome, variables) => {
      if (outcome.kind === "success") {
        submitProgressRef.current = null
        writeNoticeCreatePublishProgress(null)
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
        if (outcome.progress != null) {
          submitProgressRef.current = outcome.progress
          writeNoticeCreatePublishProgress(outcome.progress)
        }
        allowLeave()
        await navigate({
          to: "/notices",
          search: {},
        })
        showNoticeCreateForbiddenToast(
          toast,
          NOTICE_CREATE_FORBIDDEN_TOAST_MESSAGE,
        )
        return
      }

      if (outcome.kind === "server_error" || outcome.kind === "network_error") {
        await navigateToListWithPublishFailureToast(outcome.progress)
        return
      }
    },
    onError: async () => {
      await navigateToListWithPublishFailureToast(submitProgressRef.current)
    },
  })
  const isSubmitting = submitMutation.isPending

  const dismissPublishDialog = () => {
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
    captureNoticeDialogFocus(publishDialogFocusStore)
    setPublishDialogOpen(true)
  }

  const handlePublishConfirm = () => {
    if (isSubmitting) {
      return
    }

    setPublishDialogOpen(false)
    restoreNoticeDialogFocus(publishDialogFocusStore)
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
          centralAdminStaffChipRestricted={centralAdminStaffChipRestricted}
          centralLeadStaffChipRestricted={centralLeadStaffChipRestricted}
          centralUnrestrictedCreate={centralUnrestrictedCreate}
          chapterPresidentChallengerOnly={chapterPresidentChallengerOnly}
          chapterPresidentCreateLock={chapterPresidentCreateLock}
          form={form}
          schoolExecutiveCreateLock={schoolExecutiveCreateLock}
          schoolStaffChallengerOnly={schoolStaffChallengerOnly}
          schoolStaffCreateLock={schoolStaffCreateLock}
          schoolStaffPartsRequired={schoolStaffPartsRequired}
          noticeCreateSuperAdmin={noticeCreateSuperAdmin}
          isOrganizationLoading={
            organizationQuery.isLoading || gisuListQuery.isLoading
          }
          onChange={patchForm}
          partOptions={partOptions}
          sessionGisuId={session.gisuId}
          sessionGisuLabel={sessionGisuLabel}
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
          recipientSummaryLine={recipientSummaryLine}
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
          recipientLine={summary.recipientLine}
          staffScopeLabel={summary.staffScopeLabel}
        />
      </div>

      <Dialog
        cancelLabel="돌아가기"
        className="notice-create-publish-dialog"
        color="brand"
        confirmLabel="게시하기"
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
          if (!open) {
            restoreNoticeDialogFocus(publishDialogFocusStore)
          }
          setPublishDialogOpen(open)
        }}
        open={publishDialogOpen}
        title="공지를 올릴까요?"
      />

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
