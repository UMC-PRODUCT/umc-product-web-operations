import { ErrorPageContainer } from "@umc-product/react"

import type { ReactNode } from "react"

type FullPageErrorProps = {
  title: ReactNode
  body?: ReactNode
  /** 동작 버튼 (DS Button 등) */
  actions?: ReactNode
}

/**
 * 전체 화면 오류·안내 (Figma Web/Error Page Container).
 * DS 컨테이너에는 페이지 배경이 없어 앱이 화면 가운데에 놓는다.
 */
export function FullPageError({ title, body, actions }: FullPageErrorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <ErrorPageContainer
        actions={actions}
        body={body}
        role="alert"
        title={title}
      />
    </div>
  )
}
