import { useNavigate, useRouter } from "@tanstack/react-router"
import { LockIcon, PersonIcon } from "@umc-product/icons"
import { Button } from "@umc-product/react"

import { getSsoClient } from "@/shared/auth/sso-client"
import { cn } from "@/shared/lib/cn"

type RoleCardProps = {
  title: string
  description: string
  rounded: "top" | "bottom"
}

function RoleCard({ title, description, rounded }: RoleCardProps) {
  return (
    <div
      className={cn(
        "bg-fill-neutral-weaker-50 border-neutral-weaker-100 flex w-full flex-col",
        "border px-(--umc-spacing-padding-16) py-(--umc-spacing-padding-12)",
        rounded === "top" && "rounded-t-(--umc-radius-16) border-b-0",
        rounded === "bottom" && "rounded-b-(--umc-radius-16)",
      )}
    >
      <div className="flex w-full items-center gap-(--umc-spacing-gap-12)">
        <span className="bg-fill-neutral-weak-200 flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full">
          <PersonIcon aria-hidden color="currentColor" size={22} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col items-start justify-center">
          <p className="text-label-1-medium text-neutral-default-900 w-full truncate">
            {title}
          </p>
          <p className="text-body-1-regular text-neutral-weak-500 w-full truncate">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Figma 2550:27917 (+ 2550:27966 dimmed 배경)
 * — 탈부 관리 접근 권한 없음 (주소 직접 진입 포함).
 */
export function WithdrawalAccessDenied() {
  const navigate = useNavigate()
  const router = useRouter()

  const handleClose = () => {
    // 이전 화면으로 돌아가며, 이 권한 없음 URL은 히스토리에 남기지 않음
    if (router.history.canGoBack()) {
      router.history.back()
      return
    }
    void navigate({ replace: true, to: "/" })
  }

  const handleSwitchAccount = () => {
    void getSsoClient().logout({
      global: true,
      returnTo: `${window.location.origin}/login`,
    })
  }

  return (
    <div className="bg-fill-neutral-weak-100 flex min-h-[calc(100vh-120px)] w-full items-center justify-center p-(--umc-spacing-padding-24)">
      <div
        className={cn(
          "bg-fill-neutral-default flex w-full max-w-[512px] flex-col",
          "rounded-(--umc-radius-16) shadow-(--umc-shadow-drop-neutral-2)",
        )}
      >
        <div className="flex w-full flex-col gap-10 pb-(--umc-spacing-padding-20)">
          <div className="flex w-full flex-col items-center gap-(--umc-spacing-gap-16) px-(--umc-spacing-padding-32) pt-(--umc-spacing-padding-32)">
            <LockIcon
              aria-hidden
              className="text-neutral-weak-500"
              color="currentColor"
              size={44}
            />
            <div className="flex w-full flex-col gap-(--umc-spacing-gap-12) text-center">
              <h1 className="text-heading-2-semibold text-neutral-default-900">
                접근 권한이 없어요
              </h1>
              <p className="text-body-1-regular text-neutral-medium-600">
                탈부 관리는 중앙 운영진과 학교 회장단만 볼 수 있어요
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-9 px-(--umc-spacing-padding-32) pt-(--umc-spacing-padding-16)">
            <div className="flex w-full flex-col gap-1.5">
              <p className="text-label-4-medium text-neutral-medium-600 px-1">
                탈부 관리가 가능한 역할
              </p>
              <div className="flex w-full flex-col">
                <RoleCard
                  description="전체 학교 탈부 기록 등록 · 열람 · CSV"
                  rounded="top"
                  title="중앙 운영진"
                />
                <RoleCard
                  description="소속 학교 탈부 기록 등록 · 열람 · CSV"
                  rounded="bottom"
                  title="학교 회장단"
                />
              </div>
            </div>
            <p className="text-caption-1-regular text-neutral-weak-500 text-center">
              권한이 필요하면 총괄단에 역할 부여를 요청하세요
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-(--umc-spacing-padding-10) px-(--umc-spacing-padding-16) pt-(--umc-spacing-padding-16) pb-(--umc-spacing-padding-10)">
          <Button
            className="w-full"
            color="brand"
            onClick={handleSwitchAccount}
            size="lg"
            type="button"
            variant="fill"
          >
            다른 계정으로 로그인
          </Button>
          <Button
            className="w-full"
            color="white"
            onClick={handleClose}
            size="md"
            type="button"
            variant="fill"
          >
            닫기
          </Button>
        </div>
      </div>
    </div>
  )
}
