import { PaperclipIcon } from "@umc-product/icons"

import type { NoticeLinkAttachment } from "../model/notice-detail.types"

type NoticeDetailLinkCardProps = {
  link: NoticeLinkAttachment
}

export function NoticeDetailLinkCard({ link }: NoticeDetailLinkCardProps) {
  return (
    <a
      className="border-neutral-disabled flex h-[68px] w-[440px] max-w-full items-center gap-(--umc-spacing-gap-16) rounded-(--umc-radius-8) border bg-white px-(--umc-spacing-padding-16) py-(--umc-spacing-padding-12) no-underline"
      href={link.url}
      rel="noreferrer"
      target="_blank"
    >
      <div className="bg-fill-neutral-disabled flex shrink-0 items-center rounded-(--umc-radius-8) p-(--umc-spacing-padding-12)">
        <PaperclipIcon
          aria-hidden
          className="text-neutral-medium-600"
          size={18}
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center">
        <p className="text-title-4-semibold text-neutral-default-900 w-full truncate">
          {link.title}
        </p>
        <p className="text-caption-1-medium text-placeholder w-full truncate">
          {link.url}
        </p>
      </div>
    </a>
  )
}
