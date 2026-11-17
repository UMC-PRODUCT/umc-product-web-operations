import type { StaticDataRouteOption } from "@tanstack/react-router"

/**
 * AdminShell 본문 영역 레이아웃
 * - `default`: PageHeader + `<main>`
 * - `compose`: 공지 작성·수정 (옅은 배경 + 세로 flex)
 * - `contents-area`: Figma Contents Area (공지 상세)
 */
export type AdminShellLayout = "compose" | "contents-area" | "default"

declare module "@tanstack/react-router" {
  interface StaticDataRouteOption {
    /** feature 페이지가 자체 제목을 그리는 경우 PageHeader 제목 블록을 숨긴다 */
    hideTitleBlock?: boolean
    shellLayout?: AdminShellLayout
  }
}

export type AdminShellStaticData = {
  hideTitleBlock: boolean
  shellLayout: AdminShellLayout
}

/** 부모 → 자식 순서로 병합하며, 하위 라우트가 상위 값을 덮어쓴다 */
export function resolveAdminShellStaticData(
  matchStaticData: readonly (StaticDataRouteOption | undefined)[],
): AdminShellStaticData {
  const resolved: AdminShellStaticData = {
    hideTitleBlock: false,
    shellLayout: "default",
  }

  for (const staticData of matchStaticData) {
    if (staticData?.hideTitleBlock != null) {
      resolved.hideTitleBlock = staticData.hideTitleBlock
    }
    if (staticData?.shellLayout != null) {
      resolved.shellLayout = staticData.shellLayout
    }
  }

  return resolved
}
