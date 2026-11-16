import { EyeInvisibleIcon } from "@umc-product/icons"

import { EmptyState } from "@/shared/ui/empty-state"

export function NoticeListForbidden() {
  return (
    <EmptyState
      description="다른 범위를 선택하거나 대상 설정을 확인해 보세요"
      icon={
        <EyeInvisibleIcon
          aria-hidden
          className="text-icon-disabled"
          size={48}
        />
      }
      title="볼 수 없는 공지예요"
    />
  )
}
