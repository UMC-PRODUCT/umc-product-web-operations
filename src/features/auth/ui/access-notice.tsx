export function ForbiddenNotice() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <p role="alert">이 작업을 수행할 권한이 없습니다.</p>
    </div>
  )
}

export function OperatorOnlyNotice({
  onBack,
  onRelogin,
}: {
  onBack?: () => void
  onRelogin?: () => void
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <p role="alert">운영진 계정만 로그인할 수 있습니다.</p>
      {(onRelogin || onBack) && (
        <div className="flex flex-col items-center gap-2">
          {onRelogin ? (
            <button
              className="underline underline-offset-2"
              onClick={onRelogin}
              type="button"
            >
              다시 로그인
            </button>
          ) : null}
          {onBack ? (
            <button
              className="underline underline-offset-2"
              onClick={onBack}
              type="button"
            >
              이전으로 돌아가기
            </button>
          ) : null}
        </div>
      )}
    </div>
  )
}
