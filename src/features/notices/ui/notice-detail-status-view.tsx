import { useNavigate } from "@tanstack/react-router"
import { Button } from "@umc-product/react"

import { FullPageError } from "@/shared/ui/full-page-error"

export type NoticeDetailStatusVariant = "forbidden" | "deleted"

const STATUS_COPY: Record<
  NoticeDetailStatusVariant,
  { title: string; description: string }
> = {
  forbidden: {
    title: "볼 수 없는 공지예요",
    description: "올바른 링크인지, 계정 권한이 맞는지 확인이 필요해요",
  },
  deleted: {
    title: "공지를 찾을 수 없어요",
    description: "이미 삭제되었거나 주소가 잘못되었을 수 있어요",
  },
}

type NoticeDetailStatusViewProps = {
  variant: NoticeDetailStatusVariant
}

export function NoticeDetailStatusView({
  variant,
}: NoticeDetailStatusViewProps) {
  const navigate = useNavigate()
  const { description, title } = STATUS_COPY[variant]

  return (
    <FullPageError
      actions={
        <Button
          color="white"
          onClick={() => {
            void navigate({ to: "/notices" })
          }}
          size="xs"
          type="button"
          variant="fill"
        >
          목록으로
        </Button>
      }
      body={description}
      placement="content"
      role="status"
      title={title}
    />
  )
}
