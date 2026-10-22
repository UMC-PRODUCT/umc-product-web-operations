import { useNavigate } from "@tanstack/react-router"
import { EyeInvisibleIcon, TrashIcon } from "@umc-product/icons"
import { Button } from "@umc-product/react"

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
  const StatusIcon = variant === "deleted" ? TrashIcon : EyeInvisibleIcon

  return (
    <div
      className="flex w-full flex-col items-center gap-(--umc-spacing-gap-16) pt-[80px] pb-[40px]"
      role="status"
    >
      <StatusIcon aria-hidden className="text-icon-disabled" size={48} />
      <div className="flex w-full flex-col items-center gap-(--umc-spacing-gap-8) text-center">
        <p className="text-title-4-semibold text-neutral-strong-800 w-full">
          {title}
        </p>
        <p className="text-body-3-regular text-neutral-medium-600 w-full">
          {description}
        </p>
      </div>
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
    </div>
  )
}
