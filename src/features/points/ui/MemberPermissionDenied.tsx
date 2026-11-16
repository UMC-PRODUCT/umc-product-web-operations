import { EyeInvisibleIcon } from "@umc-product/icons"

import { EmptyState } from "@/shared/ui/empty-state"

export function MemberPermissionDenied() {
  return (
    <EmptyState
      description="다른 학교의 구성원 정보는 조회할 수 없어요"
      icon={
        <EyeInvisibleIcon
          aria-hidden
          className="text-icon-disabled"
          size={48}
        />
      }
      title="내 학교 구성원만 볼 수 있어요"
    />
  )
}
