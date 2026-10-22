import { Tag, TextButton } from "@umc-product/react"

import { cn } from "@/shared/lib/cn"

import { NoticeListForbidden } from "./notice-list-forbidden"
import { NoticeListNetworkError } from "./notice-list-network-error"
import {
  NoticeListTableEmpty,
  type NoticeListTableEmptyProps,
} from "./notice-list-table-empty"

import type { Notice } from "../model/types"

type NoticeListTableProps = {
  emptyState?: NoticeListTableEmptyProps | null
  isError?: boolean
  isForbidden?: boolean
  isLoading?: boolean
  notices?: Notice[]
  onOpenNotice?: (noticeId: string) => void
  onRetry?: () => void
}

type NoticeColumn = {
  bodyClass: string
  headerClass: string
  header: string
  id: string
}

const SKELETON_ROW_COUNT = 7

const COLUMNS: NoticeColumn[] = [
  {
    id: "required",
    header: "필독",
    headerClass: "w-[140px] shrink-0 px-(--umc-spacing-padding-24) text-left",
    bodyClass: "w-[140px] shrink-0 px-(--umc-spacing-padding-20)",
  },
  {
    id: "title",
    header: "제목",
    headerClass: "min-w-[110px] flex-1 px-(--umc-spacing-padding-20) text-left",
    bodyClass:
      "text-neutral-default-900 min-w-[110px] flex-1 px-(--umc-spacing-padding-20)",
  },
  {
    id: "target",
    header: "대상",
    headerClass:
      "w-[160px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
    bodyClass:
      "w-[160px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
  },
  {
    id: "author",
    header: "작성자",
    headerClass:
      "w-[120px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
    bodyClass:
      "w-[120px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
  },
  {
    id: "createdAt",
    header: "작성일",
    headerClass:
      "w-[100px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
    bodyClass:
      "w-[100px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16) text-center tabular-nums",
  },
  {
    id: "views",
    header: "조회",
    headerClass:
      "w-[80px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-24) text-left",
    bodyClass:
      "w-[80px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16) text-center tabular-nums",
  },
]

const BODY_TEXT_CLASS = "text-body-2-regular text-neutral-medium-600 truncate"

function Bone({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "bg-fill-neutral-disabled rounded-(--umc-radius-6)",
        className,
      )}
    />
  )
}

function TableHeader() {
  return (
    <div
      className="bg-fill-primary-weaker-hover-pressed text-body-3-medium text-neutral-default-900 border-neutral-disabled flex items-center rounded-t-(--umc-radius-12) border px-(--umc-spacing-padding-10) py-(--umc-spacing-padding-6)"
      role="row"
    >
      <div className="flex h-7 w-full items-center">
        {COLUMNS.map((column) => (
          <div
            className={column.headerClass}
            key={column.id}
            role="columnheader"
          >
            {column.header}
          </div>
        ))}
      </div>
    </div>
  )
}

function SkeletonRow({ isLast }: { isLast: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center px-(--umc-spacing-padding-10) py-(--umc-spacing-padding-16)",
        isLast && "rounded-b-(--umc-radius-12)",
      )}
      role="row"
    >
      <div className="flex w-[140px] shrink-0 items-center px-(--umc-spacing-padding-24)">
        <Bone className="h-6 w-[41px] shrink-0 shadow-(--umc-shadow-drop-neutral-3)" />
      </div>
      <div className="flex min-w-[110px] flex-1 items-center px-(--umc-spacing-padding-20)">
        <Bone className="h-[23px] min-w-0 flex-1" />
      </div>
      <div className="flex w-[160px] shrink-0 items-center pr-(--umc-spacing-padding-16) pl-(--umc-spacing-padding-20)">
        <Bone className="h-[23px] min-w-0 flex-1" />
      </div>
      <div className="flex w-[120px] shrink-0 items-center pr-(--umc-spacing-padding-16) pl-(--umc-spacing-padding-20)">
        <Bone className="h-[23px] min-w-0 flex-1" />
      </div>
      <div className="flex w-[100px] shrink-0 items-center justify-center pr-(--umc-spacing-padding-16) pl-(--umc-spacing-padding-20)">
        <Bone className="h-[23px] w-[61px] shrink-0" />
      </div>
      <div className="flex w-[80px] shrink-0 items-center pr-(--umc-spacing-padding-16) pl-(--umc-spacing-padding-20)">
        <Bone className="h-[23px] min-w-0 flex-1" />
      </div>
    </div>
  )
}

function renderCell(
  notice: Notice,
  columnId: string,
  onOpenNotice?: (noticeId: string) => void,
) {
  switch (columnId) {
    case "required":
      return notice.required ? (
        <Tag color="error" size="sm" variant="weak">
          필독
        </Tag>
      ) : (
        <span aria-hidden className="block h-[26px]" />
      )
    case "title":
      return onOpenNotice ? (
        <TextButton
          className="max-w-full truncate"
          color="neutral"
          onClick={() => {
            onOpenNotice(notice.id)
          }}
          size="xs"
          type="button"
          variant="plain"
        >
          {notice.title}
        </TextButton>
      ) : (
        notice.title
      )
    case "target":
      return notice.target
    case "author":
      return notice.author
    case "createdAt":
      return notice.createdAt
    case "views":
      return notice.views
    default:
      return null
  }
}

export function NoticeListTable({
  emptyState = null,
  isError = false,
  isForbidden = false,
  isLoading = false,
  notices = [],
  onOpenNotice,
  onRetry,
}: NoticeListTableProps) {
  if (isLoading) {
    return (
      <div
        aria-busy
        className="w-full overflow-hidden rounded-(--umc-radius-12)"
      >
        <TableHeader />

        <div
          className="border-neutral-disabled divide-y divide-(--umc-color-border-neutral-disabled) rounded-b-(--umc-radius-12) border-r border-b border-l bg-white"
          role="rowgroup"
        >
          {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
            <SkeletonRow
              isLast={index === SKELETON_ROW_COUNT - 1}
              key={`notice-skeleton-${index}`}
            />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return <NoticeListNetworkError onRetry={onRetry} />
  }

  if (isForbidden) {
    return <NoticeListForbidden />
  }

  if (emptyState) {
    return <NoticeListTableEmpty {...emptyState} />
  }

  return (
    <div
      aria-busy={false}
      className="w-full overflow-hidden rounded-(--umc-radius-12)"
    >
      <TableHeader />

      <div
        className="border-neutral-disabled divide-y divide-(--umc-color-border-neutral-disabled) rounded-b-(--umc-radius-12) border-r border-b border-l bg-white"
        role="rowgroup"
      >
        {notices.map((notice, index) => {
          const isLast = index === notices.length - 1

          return (
            <div
              className={cn(
                "flex items-center px-(--umc-spacing-padding-10) py-(--umc-spacing-padding-16)",
                isLast && "rounded-b-(--umc-radius-12)",
              )}
              key={notice.id}
              role="row"
            >
              {COLUMNS.map((column) => (
                <div
                  className={cn(
                    "flex items-center",
                    column.bodyClass,
                    column.id !== "required" && BODY_TEXT_CLASS,
                  )}
                  key={column.id}
                  role="cell"
                >
                  {renderCell(notice, column.id, onOpenNotice)}
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}
