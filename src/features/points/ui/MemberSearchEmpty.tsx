import { SearchIcon } from "@umc-product/icons"

type MemberSearchEmptyProps = {
  query: string
}

export function MemberSearchEmpty({ query }: MemberSearchEmptyProps) {
  const trimmedQuery = query.trim()
  const title = trimmedQuery
    ? `'${trimmedQuery}' 님을 찾을 수 없어요`
    : "조건에 맞는 구성원을 찾을 수 없어요"

  return (
    <div
      className="flex w-full flex-col items-center gap-(--umc-spacing-gap-16) py-[40px] pr-(--umc-spacing-padding-20)"
      role="status"
    >
      <SearchIcon aria-hidden className="text-icon-disabled" size={44} />
      <div className="flex w-full flex-col items-center gap-(--umc-spacing-gap-6) text-center">
        <p className="text-title-4-semibold text-neutral-strong-800 w-full">
          {title}
        </p>
        <p className="text-body-3-regular text-neutral-medium-600 w-full">
          이름이나 닉네임을 올바르게 입력했는지 확인해 보세요
        </p>
      </div>
    </div>
  )
}
