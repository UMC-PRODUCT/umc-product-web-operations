import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { Button, Dialog, Tag, useToast } from "@umc-product/react"
import { useEffect, useRef, useState } from "react"

import { getServerErrorMessage } from "@/shared/api/server-error"

import { deleteNoticeById } from "../model/delete-notice"
import { isNoticeNetworkError } from "../model/notice-api-error"
import { syncNoticeViewCountInListCaches } from "../model/notice-list-query"
import { parseNoticeListAudience } from "../model/notice-list-route-search"
import { NOTICE_DELETE_FAILURE_TOAST_MESSAGE } from "../model/notice-outcomes"
import { NoticeDetailBody } from "./notice-detail-body"
import { NoticeDetailImageGallery } from "./notice-detail-image-gallery"
import { NoticeDetailImageLoadInlineToast } from "./notice-detail-image-load-inline-toast"
import { NoticeDetailLinkCard } from "./notice-detail-link-card"
import { NoticeDetailLoadingContents } from "./notice-detail-loading-contents"
import { NoticeDetailMetaRow } from "./notice-detail-meta-row"
import { NoticeDetailVoteCard } from "./notice-detail-vote-card"
import { NoticeDialogDimmed } from "./notice-dialog-dimmed"
import {
  captureNoticeDialogFocus,
  restoreNoticeDialogFocus,
} from "./notice-dialog-focus"
import { showNoticeErrorToast } from "./show-notice-error-toast"
import { useNoticeDetailImageLoadFlow } from "./use-notice-detail-image-load-flow"
import { useNoticeDetailImageRegisterSuccessToast } from "./use-notice-detail-image-register-success-toast"

import type { DeleteNoticeOutcome } from "../model/mock-delete-notice"
import type {
  NoticeDetail,
  NoticeImageLoadState,
} from "../model/notice-detail.types"
import type { NoticeAudience } from "../model/types"

function buildNoticeListReturnSearch(input: {
  audience: NoticeAudience
  deleteOutcome?: "success"
}) {
  return {
    audience: input.audience,
    ...(input.deleteOutcome ? { deleteOutcome: input.deleteOutcome } : {}),
  }
}

type NoticeDetailPageProps = {
  canManageNotice?: boolean
  /** TODO: API 연동 시 제거. 삭제 결과 시뮬레이션용 */
  deleteOutcome?: DeleteNoticeOutcome
  listAudience?: NoticeAudience
  notice: NoticeDetail
  /** TODO: API 연동 시 제거. mock loading → success 자동 전환 끔 */
  imageLoadPause?: boolean
  /** TODO: API 연동 시 제거. DS Toast 시뮬레이션 */
  imageLoadState?: NoticeImageLoadState
}

/**
 * Figma Contents Area (516:12422) + 상세 콘텐츠 카드 (516:12424 / 580:14261)
 * — 브레드크럼·gap 32는 AdminContentsArea, 아래는 카드·목록으로 버튼
 */
export function NoticeDetailPage({
  canManageNotice = false,
  deleteOutcome,
  imageLoadPause,
  listAudience,
  notice,
  imageLoadState,
}: NoticeDetailPageProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const toast = useToast()
  const returnAudience = parseNoticeListAudience(listAudience)

  useEffect(() => {
    syncNoticeViewCountInListCaches(queryClient, notice.id, notice.views)
  }, [notice.id, notice.views, queryClient])
  const { startLoadImages } = useNoticeDetailImageLoadFlow({
    imageLoadPause,
    imageLoadState,
    noticeId: notice.id,
  })

  useNoticeDetailImageRegisterSuccessToast({ imageLoadState })

  const showImageLoadInlineToast =
    imageLoadState === "pending" || imageLoadState === "loading"

  const createdMeta = `${notice.authorDisplay} · ${notice.createdAt}`
  const isImageLoading = imageLoadState === "loading"
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteDialogFocusStore = useRef<HTMLElement | null>(null)

  return (
    <div className="flex w-full flex-col gap-(--umc-spacing-gap-32)">
      {showImageLoadInlineToast ? (
        <NoticeDetailImageLoadInlineToast
          onLoadImages={startLoadImages}
          state={imageLoadState}
        />
      ) : null}
      <article
        aria-busy={isImageLoading ? true : undefined}
        className="border-neutral-disabled flex w-full flex-col items-start gap-(--umc-spacing-gap-24) rounded-(--umc-radius-14) border bg-white p-(--umc-spacing-padding-40)"
      >
        {isImageLoading ? (
          <NoticeDetailLoadingContents showRequiredTag={notice.required} />
        ) : (
          <>
            <div className="flex w-full items-start gap-(--umc-spacing-gap-20)">
              <div className="flex min-w-0 flex-1 flex-col gap-(--umc-spacing-gap-8)">
                {notice.required ? (
                  <Tag
                    className="w-fit px-[7px]"
                    color="error"
                    size="md"
                    variant="weak"
                  >
                    필독
                  </Tag>
                ) : null}
                <h1 className="text-heading-4-semibold text-neutral-default-900">
                  {notice.title}
                </h1>
                <NoticeDetailMetaRow
                  items={[
                    {
                      label: "대상",
                      showDividerAfter: true,
                      value: notice.targetDisplay,
                    },
                    {
                      label: "작성",
                      showDividerAfter: true,
                      value: createdMeta,
                    },
                    {
                      label: "수정",
                      value: notice.updatedAt,
                    },
                  ]}
                />
              </div>
              {canManageNotice ? (
                <div className="flex shrink-0 items-start gap-(--umc-spacing-gap-12)">
                  <Button
                    color="white"
                    size="sm"
                    type="button"
                    variant="fill"
                    disabled={false}
                    isLoading={false}
                    onClick={() => {
                      void navigate({
                        params: { noticeId: notice.id },
                        search: { listAudience: returnAudience },
                        to: "/notices/$noticeId/edit",
                      })
                    }}
                  >
                    수정
                  </Button>
                  <Button
                    color="white"
                    size="sm"
                    type="button"
                    variant="fill"
                    disabled={false}
                    isLoading={false}
                    onClick={() => {
                      captureNoticeDialogFocus(deleteDialogFocusStore)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    삭제
                  </Button>
                </div>
              ) : null}
            </div>

            <hr className="border-neutral-disabled m-0 w-full shrink-0 border-0 border-t" />

            <NoticeDetailBody body={notice.body} />

            <NoticeDetailImageGallery images={notice.images} variant="scroll" />

            {notice.link ? <NoticeDetailLinkCard link={notice.link} /> : null}

            {notice.poll != null ? (
              <NoticeDetailVoteCard
                canManagePoll={canManageNotice}
                noticeId={notice.id}
                poll={notice.poll}
              />
            ) : null}
          </>
        )}
      </article>

      <Button
        className="w-fit shrink-0"
        color="white"
        onClick={() => {
          void navigate({
            search: buildNoticeListReturnSearch({ audience: returnAudience }),
            to: "/notices",
          })
        }}
        size="xs"
        type="button"
        variant="fill"
        disabled={false}
        isLoading={false}
      >
        목록으로
      </Button>
      {isDeleteDialogOpen ? <NoticeDialogDimmed intensity="medium" /> : null}
      <Dialog
        title="이 공지를 삭제할까요?"
        description="삭제하면 챌린저 앱에서도 사라지고 되돌릴 수 없어요"
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (isDeleting && !open) {
            return
          }
          setIsDeleteDialogOpen(open)
          if (!open) {
            restoreNoticeDialogFocus(deleteDialogFocusStore)
          }
        }}
        confirmLabel="삭제하기"
        cancelLabel="돌아가기"
        color="brand"
        onConfirm={async () => {
          if (isDeleting) {
            return
          }

          setIsDeleting(true)
          try {
            if (deleteOutcome === "network_error") {
              showNoticeErrorToast(toast, NOTICE_DELETE_FAILURE_TOAST_MESSAGE)
              return
            }

            await deleteNoticeById(Number(notice.id))
            deleteDialogFocusStore.current = null
            setIsDeleteDialogOpen(false)
            void navigate({
              search: buildNoticeListReturnSearch({
                audience: returnAudience,
                deleteOutcome: "success",
              }),
              to: "/notices",
            })
          } catch (error) {
            if (isNoticeNetworkError(error)) {
              showNoticeErrorToast(toast, NOTICE_DELETE_FAILURE_TOAST_MESSAGE)
              return
            }
            showNoticeErrorToast(
              toast,
              getServerErrorMessage(error) ??
                NOTICE_DELETE_FAILURE_TOAST_MESSAGE,
            )
          } finally {
            setIsDeleting(false)
          }
        }}
      />
    </div>
  )
}
