export function ForbiddenNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <p role="alert">이 작업을 수행할 권한이 없습니다.</p>
    </div>
  )
}

export function OperatorOnlyNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <p role="alert">운영진만 접근할 수 있습니다.</p>
    </div>
  )
}
