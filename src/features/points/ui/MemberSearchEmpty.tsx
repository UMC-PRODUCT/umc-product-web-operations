import { SearchIcon } from "@umc-product/icons"

import { EmptyState } from "@/shared/ui/empty-state"

type MemberSearchEmptyProps = {
  query: string
}

export function MemberSearchEmpty({ query }: MemberSearchEmptyProps) {
  const trimmedQuery = query.trim()
  const title = trimmedQuery
    ? `'${trimmedQuery}' 님을 찾을 수 없어요`
    : "조건에 맞는 구성원을 찾을 수 없어요"

  return (
    <EmptyState
      description="이름이나 닉네임을 올바르게 입력했는지 확인해 보세요"
      icon={<SearchIcon aria-hidden className="text-icon-disabled" size={44} />}
      textGap={6}
      title={title}
    />
  )
}
