import { Tag, TextButton } from "@umc-product/react"

import { cn } from "@/shared/lib/cn"

import { NoticeListForbidden } from "./notice-list-forbidden"
import { NoticeListNetworkError } from "./notice-list-network-error"
import {
  NoticeListTableEmpty,
  type NoticeListTableEmptyProps,
} from "./notice-list-table-empty"

import type { Notice, NoticeAudience } from "../model/types"

type NoticeListTableProps = {
  audience: NoticeAudience
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
    headerClass: "w-[80px] shrink-0 px-(--umc-spacing-padding-24) text-left",
    bodyClass: "w-[80px] shrink-0 px-(--umc-spacing-padding-20)",
  },
  {
    id: "title",
    header: "제목",
    headerClass: "min-w-[110px] flex-1 px-(--umc-spacing-padding-20)",
    bodyClass: "min-w-[110px] flex-1 px-(--umc-spacing-padding-20)",
  },
  {
    id: "target",
    header: "대상 (기수 · 지부 · 학교 · 파트)",
    headerClass:
      "w-[230px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
    bodyClass:
      "w-[230px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
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

const NOTICE_LIST_TARGET_COLUMN_HEADER: Record<NoticeAudience, string> = {
  challenger: "대상 (기수 · 지부 · 학교 · 파트)",
  staff: "대상 (기수 · 직책 · 학교 · 파트)",
}

function resolveNoticeListColumns(audience: NoticeAudience): NoticeColumn[] {
  return COLUMNS.map((column) =>
    column.id === "target"
      ? { ...column, header: NOTICE_LIST_TARGET_COLUMN_HEADER[audience] }
      : column,
  )
}

const TITLE_TEXT_CLASS =
  "text-body-2-regular text-(--color-text-default) truncate"
const BODY_TEXT_CLASS = "text-body-2-regular text-neutral-medium-600 truncate"

const TABLE_HEADER_ROW_CLASS =
  "box-border flex h-[40px] items-center rounded-t-(--umc-radius-12) px-(--umc-spacing-padding-10) py-(--umc-spacing-padding-6)"
const TABLE_BODY_ROW_CLASS =
  "box-border flex h-[58px] items-center px-(--umc-spacing-padding-10) py-(--umc-spacing-padding-12)"

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

function TableHeader({ columns }: { columns: NoticeColumn[] }) {
  return (
    <div
      className={cn(
        "bg-fill-primary-weaker-hover-pressed text-body-3-medium text-brand-strong-800",
        TABLE_HEADER_ROW_CLASS,
      )}
      role="row"
    >
      <div className="flex h-full w-full items-center">
        {columns.map((column) => (
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

function SkeletonRow({
  columns,
  isLast,
}: {
  columns: NoticeColumn[]
  isLast: boolean
}) {
  return (
    <div
      className={cn(
        TABLE_BODY_ROW_CLASS,
        isLast && "rounded-b-(--umc-radius-12)",
      )}
      role="row"
    >
      {columns.map((column) => (
        <div
          className={cn("flex h-full items-center", column.bodyClass)}
          key={column.id}
          role="cell"
        >
          {column.id === "required" ? (
            <Bone className="h-6 w-[41px] shrink-0 shadow-(--umc-shadow-drop-neutral-3)" />
          ) : column.id === "createdAt" ? (
            <Bone className="h-[23px] w-[61px] shrink-0" />
          ) : (
            <Bone className="h-[23px] min-w-0 flex-1" />
          )}
        </div>
      ))}
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
          className={cn("max-w-full", TITLE_TEXT_CLASS)}
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
        <span className={TITLE_TEXT_CLASS}>{notice.title}</span>
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
  audience,
  emptyState = null,
  isError = false,
  isForbidden = false,
  isLoading = false,
  notices = [],
  onOpenNotice,
  onRetry,
}: NoticeListTableProps) {
  const columns = resolveNoticeListColumns(audience)

  if (isLoading) {
    return (
      <div
        aria-busy
        className="w-full overflow-hidden rounded-(--umc-radius-12)"
      >
        <TableHeader columns={columns} />

        <div
          className="border-neutral-disabled divide-y divide-(--umc-color-border-neutral-disabled) rounded-b-(--umc-radius-12) border-r border-b border-l bg-white"
          role="rowgroup"
        >
          {Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => (
            <SkeletonRow
              columns={columns}
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
      <TableHeader columns={columns} />

      <div
        className="border-neutral-disabled divide-y divide-(--umc-color-border-neutral-disabled) rounded-b-(--umc-radius-12) border-r border-b border-l bg-white"
        role="rowgroup"
      >
        {notices.map((notice, index) => {
          const isLast = index === notices.length - 1

          return (
            <div
              className={cn(
                TABLE_BODY_ROW_CLASS,
                isLast && "rounded-b-(--umc-radius-12)",
              )}
              key={notice.id}
              role="row"
            >
              {columns.map((column) => (
                <div
                  className={cn(
                    "flex h-full items-center",
                    column.bodyClass,
                    column.id !== "required" &&
                      column.id !== "title" &&
                      BODY_TEXT_CLASS,
                    column.id === "title" && TITLE_TEXT_CLASS,
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
