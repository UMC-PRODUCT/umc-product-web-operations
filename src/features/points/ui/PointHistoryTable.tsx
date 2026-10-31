import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { PartTag, Tag, TextButton } from "@umc-product/react"
import { useMemo } from "react"

import { cn } from "@/shared/lib/cn"

import { formatPointScore } from "../model/point-history"

import type { PointHistoryItem } from "../model/point-history"

type PointHistoryTableProps = {
  items: PointHistoryItem[]
  canDelete: boolean
  onDelete?: (historyId: string) => void
}

type ColumnMeta = {
  headerClass?: string
  cellClass?: string
}

const columnHelper = createColumnHelper<PointHistoryItem>()

export function PointHistoryTable({
  items,
  canDelete,
  onDelete,
}: PointHistoryTableProps) {
  const columns = useMemo(
    () => [
      columnHelper.accessor("kind", {
        header: "구분",
        cell: (info) => {
          const kind = info.getValue()
          return (
            <Tag
              color={kind === "reward" ? "brand" : "error"}
              size="sm"
              variant="weak"
            >
              {kind === "reward" ? "상점" : "벌점"}
            </Tag>
          )
        },
        meta: {
          headerClass: "w-[100px] shrink-0 px-(--umc-spacing-padding-24)",
          cellClass: "w-[100px] shrink-0 px-(--umc-spacing-padding-20)",
        } satisfies ColumnMeta,
      }),
      columnHelper.accessor("typeLabel", {
        header: "유형",
        cell: (info) => (
          <PartTag part="pm" size="sm">
            {info.getValue()}
          </PartTag>
        ),
        meta: {
          headerClass: "w-[200px] shrink-0 px-(--umc-spacing-padding-20)",
          cellClass: "w-[200px] shrink-0 px-(--umc-spacing-padding-20)",
        } satisfies ColumnMeta,
      }),
      columnHelper.accessor("reason", {
        header: "사유",
        cell: (info) => (
          <span className="text-body-2-regular text-neutral-default-900 block truncate">
            {info.getValue()}
          </span>
        ),
        meta: {
          headerClass:
            "w-[400px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
          cellClass:
            "w-[400px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
        } satisfies ColumnMeta,
      }),
      columnHelper.accessor("score", {
        header: "점수",
        cell: (info) => {
          const score = info.getValue()
          return (
            <span
              className={cn(
                "text-body-1-semibold block truncate",
                score < 0 ? "text-error" : "text-brand-default-600",
              )}
            >
              {formatPointScore(score)}
            </span>
          )
        },
        meta: {
          headerClass:
            "w-[140px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
          cellClass:
            "w-[140px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
        } satisfies ColumnMeta,
      }),
      columnHelper.accessor("occurredAt", {
        header: "일시",
        cell: (info) => (
          <span className="text-body-2-regular text-neutral-weak-500 block truncate">
            {info.getValue()}
          </span>
        ),
        meta: {
          headerClass: "w-[200px] shrink-0 px-(--umc-spacing-padding-24)",
          cellClass: "w-[200px] shrink-0 px-(--umc-spacing-padding-20)",
        } satisfies ColumnMeta,
      }),
      ...(canDelete
        ? [
            columnHelper.display({
              id: "action",
              header: "",
              cell: ({ row }) => (
                <TextButton
                  color="neutral"
                  onClick={() => onDelete?.(row.original.id)}
                  size="xs"
                  type="button"
                  variant="underline"
                >
                  삭제하기
                </TextButton>
              ),
              meta: {
                headerClass: "min-w-0 flex-1",
                cellClass: "min-w-0 flex-1 px-(--umc-spacing-padding-20)",
              } satisfies ColumnMeta,
            }),
          ]
        : []),
    ],
    [canDelete, onDelete],
  )

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="w-full [scrollbar-width:none] overflow-x-auto rounded-(--umc-radius-12) [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="min-w-[1158px]">
        <div
          className="bg-fill-neutral-weak-75 text-body-3-medium text-neutral-default-900 border-neutral-disabled flex items-center rounded-t-(--umc-radius-12) border px-(--umc-spacing-padding-10) py-(--umc-spacing-padding-6)"
          role="row"
        >
          <div className="flex h-7 w-full items-center">
            {table.getHeaderGroups().map((headerGroup) =>
              headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta as
                  ColumnMeta | undefined
                return (
                  <div
                    className={meta?.headerClass ?? ""}
                    key={header.id}
                    role="columnheader"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </div>
                )
              }),
            )}
          </div>
        </div>
        <div
          className="border-neutral-disabled divide-y divide-(--umc-color-border-neutral-disabled) rounded-b-(--umc-radius-12) border-r border-b border-l"
          role="rowgroup"
        >
          {table.getRowModel().rows.map((row, index, rows) => {
            const isLast = index === rows.length - 1
            return (
              <div
                className={cn(
                  "flex items-center px-(--umc-spacing-padding-10) py-(--umc-spacing-padding-16)",
                  isLast && "rounded-b-(--umc-radius-12)",
                )}
                key={row.id}
                role="row"
              >
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as
                    ColumnMeta | undefined
                  return (
                    <div
                      className={cn("flex items-center", meta?.cellClass)}
                      key={cell.id}
                      role="cell"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
