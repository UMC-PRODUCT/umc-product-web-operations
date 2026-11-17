import { Button } from "@umc-product/react"

import { FullPageError } from "@/shared/ui/full-page-error"

type MemberDetailPermissionDeniedProps = {
  onGoToList?: () => void
}

export function MemberDetailPermissionDenied({
  onGoToList,
}: MemberDetailPermissionDeniedProps) {
  return (
    <FullPageError
      actions={
        <Button
          color="white"
          onClick={onGoToList}
          size="xs"
          type="button"
          variant="fill"
        >
          구성원 목록으로
        </Button>
      }
      body="본인 학교의 구성원만 조회할 수 있어요"
      placement="content"
      role="status"
      title="이 구성원은 볼 수 없어요"
    />
  )
}
