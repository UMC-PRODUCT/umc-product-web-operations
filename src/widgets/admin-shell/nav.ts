import type {
  BreadcrumbItem,
  NavItem,
  SideNavigationItem,
} from "@umc-product/react"
import type { ReactNode } from "react"

export type AdminSection = "notices" | "activity" | "recruiting"

export const HEADER_NAV_ITEMS: NavItem[] = [
  { label: "공지", href: "/notices" },
  { label: "활동 관리", href: "/activity" },
]

export function resolveAdminSection(pathname: string): AdminSection {
  if (pathname === "/notices" || pathname.startsWith("/notices/")) {
    return "notices"
  }
  if (pathname === "/activity" || pathname.startsWith("/activity/")) {
    return "activity"
  }
  if (pathname === "/recruiting" || pathname.startsWith("/recruiting/")) {
    return "recruiting"
  }
  return "activity"
}

export function getSideNavTitle(section: AdminSection): string {
  switch (section) {
    case "notices":
      return "공지"
    case "activity":
      return "활동 관리"
    case "recruiting":
      return "리크루팅"
  }
}

export function getSideNavItems(
  section: AdminSection,
  peopleIcon: ReactNode,
): SideNavigationItem[] {
  switch (section) {
    case "notices":
      return [
        { label: "공지 목록", href: "/notices", icon: peopleIcon },
        { label: "공지 작성", href: "/notices/new", icon: peopleIcon },
      ]
    case "activity":
      return [
        {
          label: "상벌점 관리",
          href: "/activity/points",
          icon: peopleIcon,
        },
      ]
    case "recruiting":
      return [{ label: "리크루팅", href: "/recruiting" }]
  }
}

export function getPageBreadcrumbs(
  pathname: string,
  section: AdminSection,
): { breadcrumbs: BreadcrumbItem[]; title: string } {
  switch (section) {
    case "notices":
      if (pathname.startsWith("/notices/new")) {
        return {
          title: "공지작성",
          breadcrumbs: [
            { label: "공지", href: "/notices" },
            { label: "공지 작성" },
          ],
        }
      }
      if (/^\/notices\/[^/]+\/edit$/.test(pathname)) {
        return {
          title: "공지 수정",
          breadcrumbs: [
            { label: "공지", href: "/notices" },
            { label: "공지 목록", href: "/notices" },
            { label: "공지 수정" },
          ],
        }
      }
      if (/^\/notices\/[^/]+$/.test(pathname)) {
        return {
          title: "공지 상세",
          breadcrumbs: [
            { label: "공지", href: "/notices" },
            { label: "공지 목록", href: "/notices" },
            { label: "공지 상세" },
          ],
        }
      }
      return {
        title: "공지목록",
        breadcrumbs: [
          { label: "공지", href: "/notices" },
          { label: "공지 목록" },
        ],
      }
    case "activity":
      return {
        title: "상벌점 관리",
        breadcrumbs: [
          { label: "활동 관리", href: "/activity" },
          { label: "상벌점 관리" },
        ],
      }
    case "recruiting":
      return {
        title: "리크루팅",
        breadcrumbs: [{ label: "리크루팅" }],
      }
  }
}
