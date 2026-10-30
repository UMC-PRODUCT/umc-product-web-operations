import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ChevronRightIcon, PersonIcon } from "@umc-product/icons"
import { RoleTag, StatusTag, TextButton } from "@umc-product/react"
import { useMemo } from "react"

import { MemberNetworkError } from "./MemberNetworkError"
import { MemberPartTag } from "./MemberPartTag"
import { MemberPermissionDenied } from "./MemberPermissionDenied"
import { MemberSearchEmpty } from "./MemberSearchEmpty"
import { MemberTableSkeleton } from "./MemberTableSkeleton"

import type { PointsMember } from "../model/types"

type MemberTableProps = {
  isError?: boolean
  isForbidden?: boolean
  isLoading?: boolean
  members: PointsMember[]
  onAssignPoints: (memberId: string) => void
  onRetry?: () => void
  query?: string
}

const columnHelper = createColumnHelper<PointsMember>()

type ColumnMeta = {
  headerClass?: string
  cellClass?: string
}

export function MemberTable({
  isError = false,
  isForbidden = false,
  isLoading = false,
  members,
  onAssignPoints,
  onRetry,
  query = "",
}: MemberTableProps) {
  const columns = useMemo(
    () => [
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
          headerClass: "w-[240px] shrink-0 px-(--umc-spacing-padding-24)",
          cellClass: "w-[240px] shrink-0 px-(--umc-spacing-padding-20)",
        } satisfies ColumnMeta,
      }),
      columnHelper.accessor("schoolLabel", {
        header: "학교",
        cell: (info) => (
          <span className="text-body-2-regular text-neutral-default-900 block truncate">
            {info.getValue()}
          </span>
        ),
        meta: {
          headerClass: "w-[160px] shrink-0 px-(--umc-spacing-padding-20)",
          cellClass: "w-[160px] shrink-0 px-(--umc-spacing-padding-20)",
        } satisfies ColumnMeta,
      }),
      columnHelper.accessor("part", {
        header: "파트",
        cell: ({ row }) => {
          const { part, sourcePart, partLabel, generationNumber } = row.original

          return (
            <MemberPartTag
              generationNumber={generationNumber}
              part={part}
              partLabel={partLabel}
              size="sm"
              sourcePart={sourcePart}
            />
          )
        },
        meta: {
          headerClass:
            "w-[140px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
          cellClass:
            "w-[140px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
        } satisfies ColumnMeta,
      }),
      columnHelper.accessor("generation", {
        header: "기수",
        cell: (info) => (
          <span className="text-body-2-regular text-neutral-default-900 block truncate">
            {info.getValue()}
          </span>
        ),
        meta: {
          headerClass:
            "w-[120px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
          cellClass:
            "w-[120px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
        } satisfies ColumnMeta,
      }),
      columnHelper.display({
        id: "role",
        header: "운영 역할",
        cell: ({ row }) => (
          <RoleTag color={row.original.role} size="sm">
            {row.original.roleLabel}
          </RoleTag>
        ),
        meta: {
          headerClass:
            "w-[150px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-24)",
          cellClass:
            "w-[150px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
        } satisfies ColumnMeta,
      }),
      columnHelper.accessor("status", {
        header: "상태",
        cell: () => <StatusTag color="brand">활동</StatusTag>,
        meta: {
          headerClass:
            "w-[140px] shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
          cellClass:
            "w-[140px] shrink-0 pl-[22px] pr-(--umc-spacing-padding-16)",
        } satisfies ColumnMeta,
      }),
      columnHelper.display({
        id: "action",
        header: "",
        cell: ({ row }) => (
          <TextButton
            color="brand"
            onClick={() => onAssignPoints(row.original.id)}
            size="xs"
            trailingIcon={
              <ChevronRightIcon aria-hidden color="currentColor" size={16} />
            }
            type="button"
          >
            상벌점 상세보기
          </TextButton>
        ),
        meta: {
          headerClass: "shrink-0",
          cellClass:
            "shrink-0 pl-(--umc-spacing-padding-20) pr-(--umc-spacing-padding-16)",
        } satisfies ColumnMeta,
      }),
    ],
    [onAssignPoints],
  )

  const table = useReactTable({
    data: members,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isLoading) {
    return <MemberTableSkeleton />
  }

  if (isForbidden) {
    return <MemberPermissionDenied />
  }

  if (isError) {
    return <MemberNetworkError onRetry={onRetry} />
  }

  if (members.length === 0) {
    return <MemberSearchEmpty query={query} />
  }

  return (
    <div className="w-full [scrollbar-width:none] overflow-x-auto rounded-(--umc-radius-12) [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="min-w-[1158px]">
        <div
          className="bg-fill-primary-medium-100 text-body-3-medium text-neutral-default-900 flex items-center rounded-t-(--umc-radius-12) px-(--umc-spacing-padding-10) py-(--umc-spacing-padding-6)"
          role="row"
        >
          <div className="flex h-7 items-center">
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
                className={`flex items-center px-(--umc-spacing-padding-10) py-(--umc-spacing-padding-12) ${isLast ? "rounded-b-(--umc-radius-12)" : ""}`}
                key={row.id}
                role="row"
              >
                {row.getVisibleCells().map((cell) => {
                  const meta = cell.column.columnDef.meta as
                    ColumnMeta | undefined
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
        </div>
      </div>
    </div>
  )
}
