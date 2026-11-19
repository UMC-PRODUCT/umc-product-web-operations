import { renderNoticeDetailBodyLine } from "./notice-detail-body-inline"

type NoticeDetailBodyProps = {
  body: string
}

function splitNoticeBodyLines(body: string): string[] {
  const normalized = body
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
  return normalized.split("\n")
}

function renderNoticeDetailBodyEmptyLine(lineKey: string) {
  return (
    <p
      aria-hidden
      className="text-body-1-medium text-neutral-default-900 m-0 min-h-[1.4em] leading-[1.4]"
      key={lineKey}
    >
      {"\u00A0"}
    </p>
  )
}

export function NoticeDetailBody({ body }: NoticeDetailBodyProps) {
  const lines = splitNoticeBodyLines(body)

  return (
    <div className="flex w-full flex-col gap-(--umc-spacing-gap-8) pb-(--umc-spacing-padding-20)">
      {lines.map((line, index) => {
        const lineKey = `${index}-${line.length}`

        if (line.trim().length === 0) {
          return renderNoticeDetailBodyEmptyLine(lineKey)
        }

        return renderNoticeDetailBodyLine(line, lineKey)
      })}
    </div>
  )
}
