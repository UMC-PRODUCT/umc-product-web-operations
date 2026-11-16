import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useBlocker, useNavigate, useRouter } from "@tanstack/react-router"
import { Dialog, useToast } from "@umc-product/react"
import { useEffect, useMemo, useRef, useState } from "react"

import { buildNoticeCreateSummary } from "../model/build-notice-create-summary"
import { deleteNoticeVoteByNoticeId } from "../model/delete-notice-vote"
import { noticeCreateGisuListQueryOptions } from "../model/notice-create-gisu-query"
import {
  resolveNoticeCreateContextGisuId,
  resolveNoticeCreatePartOptions,
} from "../model/notice-create-part-options"
import { noticeKeys } from "../model/notice-keys"
import { noticeListOrganizationQueryOptions } from "../model/notice-list-organization-query"
import {
  NOTICE_CREATE_FORBIDDEN_TOAST_MESSAGE,
  NOTICE_CREATE_IMAGE_UPLOAD_FAILURE_TOAST_MESSAGE,
  NOTICE_EDIT_DELETED_DIALOG_CONFIRM_LABEL,
  NOTICE_EDIT_DELETED_DIALOG_DESCRIPTION,
  NOTICE_EDIT_DELETED_DIALOG_TITLE,
  NOTICE_EDIT_FAILURE_TOAST_MESSAGE,
  NOTICE_EDIT_SUCCESS_TOAST_MESSAGE,
} from "../model/notice-outcomes"
import {
  isNoticeEditFormDirty,
  submitNoticeEdit,
} from "../model/submit-notice-edit"
import { NoticeCreateFormFields } from "./notice-create/notice-create-form-fields"
import { NoticeCreateVotePanel } from "./notice-create/notice-create-vote-panel"
import { NoticeVoteDeleteDialog } from "./notice-create/notice-vote-delete-dialog"
import { NoticeDialogDimmed } from "./notice-dialog-dimmed"
import {
  captureNoticeDialogFocus,
  restoreNoticeDialogFocus,
} from "./notice-dialog-focus"
import { NoticeEditSummaryPanel } from "./notice-edit/notice-edit-summary-panel"
import {
  showNoticeCreateForbiddenToast,
  showNoticeEditFailureToast,
  showNoticeErrorToast,
  showNoticeImageUploadFailureToast,
} from "./show-notice-error-toast"
import { showNoticePrimarySuccessToast } from "./show-notice-primary-success-toast"

import type { NoticeCreateFormState } from "../model/notice-create-form"
import type { NoticeCreateVoteDraft } from "../model/notice-create-vote-draft"
import type { NoticePoll } from "../model/notice-detail.types"

type NoticeEditPageProps = {
  initialAttachedVotePoll: NoticePoll | null
  initialForm: NoticeCreateFormState
  listAudience?: "challenger" | "staff"
  noticeId: number
}

export function NoticeEditPage({
  initialAttachedVotePoll,
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
  const [showRequiredFieldErrors, setShowRequiredFieldErrors] = useState(false)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [deletedWhileEditingDialogOpen, setDeletedWhileEditingDialogOpen] =
    useState(false)
  const allowLeaveRef = useRef(false)
  const pendingLeaveToRef = useRef<string | null>(null)
  const leaveDialogFocusStore = useRef<HTMLElement | null>(null)
  const deletedDialogFocusStore = useRef<HTMLElement | null>(null)
  const baselineAttachedVotePollRef = useRef(initialAttachedVotePoll)
  const [attachedVotePoll, setAttachedVotePoll] = useState(
    initialAttachedVotePoll,
  )
  const [votePanelOpen, setVotePanelOpen] = useState(false)
  const [voteDraft, setVoteDraft] = useState<NoticeCreateVoteDraft | null>(null)
  const [voteDeleteDialogOpen, setVoteDeleteDialogOpen] = useState(false)
  const voteDeleteTargetRef = useRef<"attached" | "draft">("attached")
  const isDirty = useMemo(
    () =>
      isNoticeEditFormDirty(form, baselineFormRef.current) ||
      attachedVotePoll !== baselineAttachedVotePollRef.current ||
      voteDraft != null,
    [attachedVotePoll, form, voteDraft],
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

  const openDeletedWhileEditingDialog = () => {
    captureNoticeDialogFocus(deletedDialogFocusStore)
    allowLeaveRef.current = true
    setDeletedWhileEditingDialogOpen(true)
  }

  const confirmDeletedWhileEditing = () => {
    deletedDialogFocusStore.current = null
    setDeletedWhileEditingDialogOpen(false)
    void navigate({
      search: listAudience ? { audience: listAudience } : {},
      to: "/notices",
    })
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

  const submitMutation = useMutation({
    mutationFn: submitNoticeEdit,
    onSuccess: async (outcome, variables) => {
      if (outcome.kind === "success") {
        allowLeaveRef.current = true
        showNoticePrimarySuccessToast(toast, NOTICE_EDIT_SUCCESS_TOAST_MESSAGE)
        void queryClient.invalidateQueries({ queryKey: noticeKeys.all })
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
          !variables.form.title.trim() || !variables.form.content.trim()
        if (!hasTitleOrContentError) {
          showNoticeErrorToast(toast, outcome.message)
        }
        return
      }

      if (outcome.kind === "forbidden") {
        showNoticeCreateForbiddenToast(
          toast,
          NOTICE_CREATE_FORBIDDEN_TOAST_MESSAGE,
        )
        return
      }

      if (outcome.kind === "not_found") {
        openDeletedWhileEditingDialog()
        return
      }

      showNoticeEditFailureToast(toast, NOTICE_EDIT_FAILURE_TOAST_MESSAGE)
    },
    onError: () => {
      showNoticeEditFailureToast(toast, NOTICE_EDIT_FAILURE_TOAST_MESSAGE)
    },
  })
  const isSubmitting = submitMutation.isPending

  const deleteVoteMutation = useMutation({
    mutationFn: deleteNoticeVoteByNoticeId,
    onSuccess: async () => {
      setAttachedVotePoll(null)
      baselineAttachedVotePollRef.current = null
      setVoteDeleteDialogOpen(false)
      await queryClient.invalidateQueries({
        queryKey: noticeKeys.detail(noticeId),
      })
    },
    onError: () => {
      showNoticeEditFailureToast(toast, NOTICE_EDIT_FAILURE_TOAST_MESSAGE)
    },
  })
  const isDeletingVote = deleteVoteMutation.isPending

  const handleSubmit = () => {
    if (isSubmitting) {
      return
    }

    setShowRequiredFieldErrors(true)

    submitMutation.mutate({
      form,
      noticeId,
      voteDraft: attachedVotePoll == null ? voteDraft : null,
    })
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
          attachedVoteNoticeId={String(noticeId)}
          attachedVotePoll={attachedVotePoll}
          form={form}
          isOrganizationLoading={
            organizationQuery.isLoading || gisuListQuery.isLoading
          }
          mode="edit"
          onChange={patchForm}
          partOptions={partOptions}
          onImageUploadReject={() => {
            showNoticeImageUploadFailureToast(
              toast,
              NOTICE_CREATE_IMAGE_UPLOAD_FAILURE_TOAST_MESSAGE,
            )
          }}
          onVoteAddClick={() => {
            setVotePanelOpen(true)
          }}
          onVoteDeleteClick={() => {
            voteDeleteTargetRef.current =
              attachedVotePoll != null ? "attached" : "draft"
            setVoteDeleteDialogOpen(true)
          }}
          onVoteEditClick={() => {
            setVotePanelOpen(true)
          }}
          organization={organization}
          showRequiredFieldErrors={showRequiredFieldErrors}
          targetSummaryLine={targetSummaryLine}
          voteDraft={voteDraft}
        />
        <NoticeEditSummaryPanel
          isSubmitting={isSubmitting}
          onCancel={requestLeave}
          onSubmitClick={handleSubmit}
        />
      </div>

      {leaveDialogOpen ||
      deletedWhileEditingDialogOpen ||
      voteDeleteDialogOpen ||
      votePanelOpen ? (
        <NoticeDialogDimmed intensity="medium" />
      ) : null}
      <NoticeCreateVotePanel
        initialDraft={voteDraft ?? undefined}
        onClose={() => {
          setVotePanelOpen(false)
        }}
        onCreate={(draft) => {
          setVoteDraft(draft)
          setVotePanelOpen(false)
        }}
        open={votePanelOpen}
      />
      <NoticeVoteDeleteDialog
        confirmLoading={isDeletingVote}
        onConfirm={() => {
          if (voteDeleteTargetRef.current === "draft") {
            setVoteDraft(null)
            setVoteDeleteDialogOpen(false)
            return
          }
          deleteVoteMutation.mutate(noticeId)
        }}
        onOpenChange={setVoteDeleteDialogOpen}
        open={voteDeleteDialogOpen}
      />
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
      <Dialog
        color="brand"
        confirmLabel={NOTICE_EDIT_DELETED_DIALOG_CONFIRM_LABEL}
        description={NOTICE_EDIT_DELETED_DIALOG_DESCRIPTION}
        onConfirm={confirmDeletedWhileEditing}
        onOpenChange={(open) => {
          if (!open) {
            return
          }
          setDeletedWhileEditingDialogOpen(open)
        }}
        open={deletedWhileEditingDialogOpen}
        title={NOTICE_EDIT_DELETED_DIALOG_TITLE}
      />
    </section>
  )
}
