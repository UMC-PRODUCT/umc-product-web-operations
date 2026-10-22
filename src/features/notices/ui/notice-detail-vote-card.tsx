import { Button, Checkbox, ProgressBar, Tag } from "@umc-product/react"

import type { NoticePoll } from "../model/notice-detail.types"

type NoticeDetailVoteCardProps = {
  poll: NoticePoll
}

function formatVoteCount(count: number) {
  return `${count}명`
}

export function NoticeDetailVoteCard({ poll }: NoticeDetailVoteCardProps) {
  return (
    <article className="border-neutral-disabled flex w-[440px] max-w-full flex-col gap-(--umc-spacing-gap-20) rounded-(--umc-radius-8) border bg-white p-(--umc-spacing-padding-32)">
      <div className="flex w-full flex-col gap-(--umc-spacing-gap-10)">
        <div className="flex w-full items-center">
          {poll.status === "in_progress" ? (
            <Tag color="success" size="sm" variant="weak">
              진행중
            </Tag>
          ) : (
            <Tag color="neutral" size="sm" variant="weak">
              종료
            </Tag>
          )}
        </div>
        <div className="flex flex-col gap-(--umc-spacing-gap-4)">
          <h2 className="text-title-4-semibold text-neutral-default-900">
            {poll.title}
          </h2>
          <div className="flex items-start gap-(--umc-spacing-gap-12)">
            <p className="text-body-3-medium text-placeholder shrink-0">기한</p>
            <p className="text-body-3-regular text-neutral-default-900">
              {poll.periodLabel}
            </p>
          </div>
          <p className="text-body-3-medium text-placeholder">
            {poll.settingsLabel}
          </p>
        </div>
      </div>

      <hr className="border-neutral-disabled m-0 w-full border-0 border-t" />

      <ul className="flex w-full list-none flex-col gap-(--umc-spacing-gap-16) p-0">
        {poll.options.map((option) => (
          <li
            className="flex w-full flex-col gap-(--umc-spacing-gap-6)"
            key={option.id}
          >
            <div className="flex w-full items-center justify-between gap-(--umc-spacing-gap-8)">
              <div className="flex min-h-6 min-w-0 items-center gap-(--umc-spacing-gap-4)">
                {option.isSelected ? (
                  <Checkbox
                    aria-hidden
                    checked
                    className="pointer-events-none shrink-0"
                    color="brand"
                    size="md"
                    invalid={false}
                    disabled={false}
                    defaultChecked
                  />
                ) : null}
                <span className="text-label-4-medium text-neutral-default-900">
                  {option.label}
                </span>
              </div>
              <span className="text-caption-1-regular text-placeholder shrink-0">
                {formatVoteCount(option.voteCount)}
              </span>
            </div>
            <ProgressBar
              aria-label={`${option.label} ${option.progressPercent}%`}
              color={option.isSelected ? "brand" : "neutral"}
              max={100}
              size="lg"
              value={option.progressPercent}
            />
          </li>
        ))}
      </ul>

      <Button
        className="w-fit"
        size="xs"
        color="white"
        variant="fill"
        disabled={false}
        isLoading={false}
      >
        다시 투표하기
      </Button>

      <p className="text-caption-1-regular text-placeholder">
        {poll.participantCount}명 참여
      </p>
    </article>
  )
}
