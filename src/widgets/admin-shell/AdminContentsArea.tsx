import { PageHeader } from "@umc-product/react"

import { cn } from "@/shared/lib/cn"

import type { BreadcrumbItem } from "@umc-product/react"
import type { ReactNode } from "react"

type AdminContentsAreaProps = {
  breadcrumbs: BreadcrumbItem[]
  children: ReactNode
  className?: string
  /** Figma NT-D01 권한 없음·삭제: Contents Area에 Page Header 없음 */
  hidePageHeader?: boolean
  /** Figma Web/Page Header: 브레드크럼만 (제목 블록 숨김) */
  hideTitleBlock?: boolean
  title: ReactNode
}

/**
 * Figma `Contents Area` (516:12422)
 * — margin 48/32/80, 브레드크럼(pl-12) ↔ 본문 gap 32
 */
export function AdminContentsArea({
  breadcrumbs,
  children,
  className,
  hidePageHeader = false,
  hideTitleBlock = false,
  title,
}: AdminContentsAreaProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-1 flex-col overflow-auto px-8 pt-12 pb-20",
        !hidePageHeader && "gap-(--umc-spacing-gap-32)",
        className,
      )}
    >
      {!hidePageHeader ? (
        <PageHeader
          breadcrumbs={breadcrumbs}
          className={cn(
            "pl-(--umc-spacing-padding-12)",
            hideTitleBlock && "[&_.umc-page-header__title-block]:hidden",
          )}
          title={title}
        />
      ) : null}
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
