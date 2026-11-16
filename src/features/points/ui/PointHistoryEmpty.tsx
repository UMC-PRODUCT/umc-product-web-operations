import { SearchIcon } from "@umc-product/icons"

import { EmptyState } from "@/shared/ui/empty-state"

export function PointHistoryEmpty() {
  return (
    <EmptyState
      description="오른쪽 상단 버튼을 눌러 상점이나 벌점을 부여할 수 있어요"
      icon={<SearchIcon aria-hidden className="text-icon-disabled" size={44} />}
      textGap={6}
      title="아직 상벌점 이력이 없어요"
    />
  )
}
