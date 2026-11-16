import { ErrorPageContainer } from "@umc-product/react"

import { cn } from "@/shared/lib/cn"

import type { ReactNode } from "react"

type FullPageErrorProps = {
  title: ReactNode
  body?: ReactNode
  /** 동작 버튼 (DS Button 등) */
  actions?: ReactNode
  /**
   * screen: 앱 셸 밖 전체 화면 (로그인 등), content: 앱 셸 본문 영역 안 페이지 단위 화면.
   */
  placement?: "screen" | "content"
  role?: "alert" | "status"
}

/**
 * 페이지 단위 오류·안내 (Figma Web/Error Page Container).
 * DS 컨테이너에는 페이지 배경이 없어 앱이 가운데에 놓는다.
 */
export function FullPageError({
  title,
  body,
  actions,
  placement = "screen",
  role = "alert",
}: FullPageErrorProps) {
  return (
    <div
      className={cn(
        "flex w-full justify-center",
        placement === "screen"
          ? "min-h-screen items-center p-6"
          : "pt-[80px] pb-[40px]",
      )}
    >
      <ErrorPageContainer
        actions={actions}
        body={body}
        role={role}
        title={title}
      />
    </div>
  )
}
