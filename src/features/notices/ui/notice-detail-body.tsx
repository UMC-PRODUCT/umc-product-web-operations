import { renderNoticeDetailBodyLine } from "./notice-detail-body-inline"

type NoticeDetailBodyProps = {
  body: string
}

export function NoticeDetailBody({ body }: NoticeDetailBodyProps) {
  const lines = body.split("\n").filter((line) => line.length > 0)

  return (
    <div className="flex w-full flex-col gap-(--umc-spacing-gap-8) pb-(--umc-spacing-padding-20)">
      {lines.map((line, index) =>
        renderNoticeDetailBodyLine(line, `${index}-${line}`),
      )}
    </div>
  )
}
