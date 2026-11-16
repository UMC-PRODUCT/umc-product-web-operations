import { ErrorComponent } from "@tanstack/react-router"
import { UnregisteredOriginError } from "@umc-product/auth-client"

import { FullPageError } from "@/shared/ui/full-page-error"

import type { ErrorComponentProps } from "@tanstack/react-router"

export function RouteError(props: ErrorComponentProps) {
  if (props.error instanceof UnregisteredOriginError) {
    return (
      <FullPageError
        body={`접속한 주소: ${props.error.origin}`}
        title="이 주소에서는 로그인을 사용할 수 없습니다."
      />
    )
  }
  return <ErrorComponent {...props} />
}
