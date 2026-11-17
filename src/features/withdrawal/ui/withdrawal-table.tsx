import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronRightIcon, PersonIcon } from "@umc-product/icons"
import { Checkbox, PartTag, StatusTag, TextButton } from "@umc-product/react"
import { useMemo } from "react"

import { DataTableBody, DataTableShell } from "@/shared/ui/data-table-shell"

import {
  withdrawalReasonTypeLabel,
  withdrawalStatusLabel,
} from "../model/mock-withdrawals"

import type { WithdrawalMember } from "../model/types"

type WithdrawalTableProps = {
  members: WithdrawalMember[]
  selectedIds: ReadonlySet<string>
  onSelectedIdsChange: (ids: Set<string>) => void
  onRegister: (memberId: string) => void
  onViewDetail: (memberId: string) => void
}

type ColumnMeta = {
  headerClass?: string
  cellClass?: string
}

const columnHelper = createColumnHelper<WithdrawalMember>()

function statusTagColor(
  status: WithdrawalMember["status"],
): "neutral" | "error" {
  return status === "pending" ? "neutral" : "error"
}

export function WithdrawalTable({
  members,
  selectedIds,
  onSelectedIdsChange,
  onRegister,
  onViewDetail,
}: WithdrawalTableProps) {
  const allSelected =
    members.length > 0 && members.every((member) => selectedIds.has(member.id))

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: () => (
          <Checkbox
            aria-label="전체 선택"
            checked={allSelected}
            onCheckedChange={(checked) => {
              if (checked) {
                onSelectedIdsChange(new Set(members.map((member) => member.id)))
                return
              }
              onSelectedIdsChange(new Set())
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={`${row.original.name} 선택`}
            checked={selectedIds.has(row.original.id)}
            onCheckedChange={(checked) => {
              const next = new Set(selectedIds)
              if (checked) {
                next.add(row.original.id)
              } else {
                next.delete(row.original.id)
              }
              onSelectedIdsChange(next)
            }}
          />
        ),
        meta: {
          headerClass: "shrink-0",
          cellClass: "shrink-0",
        } satisfies ColumnMeta,
      }),
      columnHelper.display({
        id: "member",
        header: "구성원",
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-(--umc-spacing-gap-10)">
            <span
              aria-hidden
              className="bg-fill-neutral-weak-75 text-icon-neutral-weak-400 flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-full"
            >
              <PersonIcon size={14} />
            </span>
            <span className="text-body-2-regular text-neutral-default-900 truncate">
              {row.original.name} / {row.original.nickname}
            </span>
          </div>
        ),
        meta: {
          headerClass:
            "w-[240px] min-w-[240px] max-w-[240px] shrink-0 overflow-hidden pl-(--umc-spacing-padding-8) pr-(--umc-spacing-padding-24)",
          cellClass:
            "w-[240px] min-w-[240px] max-w-[240px] shrink-0 overflow-hidden pl-(--umc-spacing-padding-8) pr-(--umc-spacing-padding-20)",
        } satisfies ColumnMeta,
      }),
      columnHelper.accessor("schoolLabel", {
        header: "학교",
        cell: (info) => (
          <span className="text-body-2-regular text-neutral-default-900 block min-w-0 truncate">
            {info.getValue()}
          </span>
        ),
        meta: {
          headerClass:
            "w-[140px] min-w-[140px] max-w-[140px] shrink-0 overflow-hidden px-(--umc-spacing-padding-20)",
          cellClass:
            "w-[140px] min-w-[140px] max-w-[140px] shrink-0 overflow-hidden px-(--umc-spacing-padding-20)",
        } satisfies ColumnMeta,
      }),
      columnHelper.accessor("part", {
        header: "파트",
        cell: ({ row }) => <PartTag part={row.original.part} size="sm" />,
        meta: {
          headerClass:
            "w-[120px] min-w-[120px] max-w-[120px] shrink-0 overflow-hidden pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
          cellClass:
            "w-[120px] min-w-[120px] max-w-[120px] shrink-0 overflow-hidden pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
        } satisfies ColumnMeta,
      }),
      columnHelper.display({
        id: "reason",
        header: "유형 · 사유",
        cell: ({ row }) => (
          <span className="text-body-2-regular text-neutral-default-900 block min-w-0 truncate">
            {withdrawalReasonTypeLabel(row.original.reasonType)} ·{" "}
            {row.original.reasonLabel}
          </span>
        ),
        meta: {
          headerClass:
            "w-[280px] min-w-[280px] max-w-[280px] shrink-0 overflow-hidden pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-24)",
          cellClass:
            "w-[280px] min-w-[280px] max-w-[280px] shrink-0 overflow-hidden pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
        } satisfies ColumnMeta,
      }),
      columnHelper.display({
        id: "status",
        header: "탈부 현황",
        cell: ({ row }) => (
          <div className="flex min-w-0 items-center gap-(--umc-spacing-gap-6)">
            <StatusTag color={statusTagColor(row.original.status)}>
              {withdrawalStatusLabel(row.original.status)}
            </StatusTag>
            {row.original.withdrawnAtLabel ? (
              <span className="text-body-2-regular text-neutral-medium-600 truncate">
                {row.original.withdrawnAtLabel}
              </span>
            ) : null}
          </div>
        ),
        meta: {
          headerClass:
            "w-[180px] min-w-[180px] max-w-[180px] shrink-0 overflow-hidden pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
          cellClass:
            "w-[180px] min-w-[180px] max-w-[180px] shrink-0 overflow-hidden pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
        } satisfies ColumnMeta,
      }),
      columnHelper.display({
        id: "action",
        header: "",
        cell: ({ row }) => {
          // Figma 2222:20074: 등록 전 → 상세보기, 탈부 → 탈부 등록하기
          if (row.original.status === "withdrawn") {
            return (
              <TextButton
                color="brand"
                onClick={() => onRegister(row.original.id)}
                size="xs"
                trailingIcon={
                  <ChevronRightIcon
                    aria-hidden
                    color="currentColor"
                    size={16}
                  />
                }
                type="button"
              >
                탈부 등록하기
              </TextButton>
            )
          }
          return (
            <TextButton
              color="neutral"
              onClick={() => onViewDetail(row.original.id)}
              size="xs"
              type="button"
              variant="underline"
            >
              상세보기
            </TextButton>
          )
        },
        meta: {
          headerClass: "min-w-[140px] flex-1 shrink-0",
          cellClass:
            "min-w-[140px] flex-1 shrink-0 pl-[30px] pr-(--umc-spacing-padding-20)",
        } satisfies ColumnMeta,
      }),
    ],
    [
      allSelected,
      members,
      onRegister,
      onSelectedIdsChange,
      onViewDetail,
      selectedIds,
    ],
  )

  const table = useReactTable({
    data: members,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="w-full min-w-0 overflow-x-auto rounded-(--umc-radius-12)">
      <DataTableShell className="min-w-[1158px]">
        <div
          className="bg-fill-primary-medium-100 text-body-3-medium text-brand-strong-800 flex w-full items-center rounded-t-(--umc-radius-12) px-(--umc-spacing-padding-10) py-(--umc-spacing-padding-6)"
          role="row"
        >
          <div className="flex h-7 w-full items-center">
            {table.getHeaderGroups().map((headerGroup) =>
              headerGroup.headers.map((header) => {
                const meta: ColumnMeta | undefined =
                  header.column.columnDef.meta
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
        <DataTableBody>
          {table.getRowModel().rows.map((row, index, rows) => {
            const isLast = index === rows.length - 1
            return (
              <div
                className={`flex w-full items-center px-(--umc-spacing-padding-10) py-(--umc-spacing-padding-12) ${isLast ? "rounded-b-(--umc-radius-12)" : ""}`}
                key={row.id}
                role="row"
              >
                {row.getVisibleCells().map((cell) => {
                  const meta: ColumnMeta | undefined =
                    cell.column.columnDef.meta
                  return (
                    <div
                      className={`flex items-center ${meta?.cellClass ?? ""}`}
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
        </DataTableBody>
      </DataTableShell>
    </div>
  )
}
