import { Button } from "@umc-product/react"

import { FullPageError } from "@/shared/ui/full-page-error"

export function ForbiddenNotice() {
  return <FullPageError title="이 작업을 수행할 권한이 없습니다." />
}

export function OperatorOnlyNotice({
  onBack,
  onRelogin,
}: {
  onBack?: () => void
  onRelogin?: () => void
}) {
  return (
    <FullPageError
      actions={
        onRelogin || onBack ? (
          <>
            {onRelogin ? (
              <Button
                color="brand"
                onClick={onRelogin}
                size="md"
                type="button"
                variant="fill"
              >
                다시 로그인
              </Button>
            ) : null}
            {onBack ? (
              <Button
                color="neutral"
                onClick={onBack}
                size="md"
                type="button"
                variant="weak"
              >
                이전으로 돌아가기
              </Button>
            ) : null}
          </>
        ) : undefined
      }
      title="운영진 계정만 로그인할 수 있습니다."
    />
  )
}
