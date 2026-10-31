import { ErrorComponent } from "@tanstack/react-router"

import { UnregisteredOriginError } from "@/lib/auth-client"

import type { ErrorComponentProps } from "@tanstack/react-router"

export function RouteError(props: ErrorComponentProps) {
  if (props.error instanceof UnregisteredOriginError) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <p role="alert">
          이 주소({props.error.origin})에서는 로그인을 사용할 수 없습니다.
        </p>
      </div>
    )
  }
  return <ErrorComponent {...props} />
}
