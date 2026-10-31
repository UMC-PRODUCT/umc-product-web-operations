import { EditIcon, TrashIcon } from "@umc-product/icons"
import { Button } from "@umc-product/react"

import { cn } from "@/shared/lib/cn"

import { NoticeDetailVoteCard } from "../notice-detail-vote-card"

import type { NoticePoll } from "../../model/notice-detail.types"

const NOTICE_FORM_VOTE_LABEL_WIDTH_CLASS = "w-[60px]"
const NOTICE_FORM_VOTE_CARD_INDENT_CLASS = "pl-[68px]"

type NoticeFormVoteAttachSectionProps = {
  mode: "create" | "edit"
  noticeId: string
  onDeleteClick: () => void
  onEditClick?: () => void
  poll: NoticePoll
}

/** Figma 1221:13714 (작성) · 1221:15240 (수정) — 투표 행 + 첨부 카드 */
export function NoticeFormVoteAttachSection({
  mode,
  noticeId,
  onDeleteClick,
  onEditClick,
  poll,
}: NoticeFormVoteAttachSectionProps) {
  return (
    <div className="flex w-full flex-col gap-(--umc-spacing-gap-8)">
      <div className="flex w-full items-center gap-(--umc-spacing-gap-8)">
        <p
          className={cn(
            "text-body-1-regular text-neutral-strong-800 shrink-0",
            NOTICE_FORM_VOTE_LABEL_WIDTH_CLASS,
          )}
        >
          투표
        </p>
        {mode === "create" ? (
          <>
            <Button
              className="rounded-(--umc-radius-12) pr-(--umc-spacing-padding-16) pl-[14px]"
              color="neutral"
              leadingIcon={<TrashIcon aria-hidden size={14} weight="regular" />}
              onClick={onDeleteClick}
              size="sm"
              type="button"
              variant="weak"
            >
              삭제
            </Button>
            <Button
              className="rounded-(--umc-radius-12) pr-(--umc-spacing-padding-16) pl-[14px]"
              color="neutral"
              leadingIcon={<EditIcon aria-hidden size={14} weight="regular" />}
              onClick={onEditClick}
              size="sm"
              type="button"
              variant="weak"
            >
              수정
            </Button>
          </>
        ) : (
          <Button
            className={cn(
              "rounded-(--umc-radius-14)",
              "pr-(--umc-spacing-padding-16) pl-[14px]",
            )}
            color="red"
            leadingIcon={
              <TrashIcon aria-hidden className="text-icon-error" size={16} />
            }
            onClick={onDeleteClick}
            size="md"
            type="button"
            variant="weak"
          >
            투표 삭제
          </Button>
        )}
      </div>
      <div className={NOTICE_FORM_VOTE_CARD_INDENT_CLASS}>
        <NoticeDetailVoteCard
          interaction="preview"
          layout="attached"
          noticeId={noticeId}
          poll={poll}
        />
      </div>
    </div>
  )
}
