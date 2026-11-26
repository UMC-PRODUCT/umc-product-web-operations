import {
  parseNoticeBodyLine,
  renderNoticeDetailBlockquoteGroup,
  renderNoticeDetailBodyLine,
} from "./notice-detail-body-inline"

import type { ReactNode } from "react"

type NoticeDetailBodyProps = {
  body: string
}

export function splitNoticeBodyLines(body: string): string[] {
  const normalized = body
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
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
  const nodes: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index] ?? ""
    const lineKey = `${index}-${line.length}`

    if (line.trim().length === 0) {
      nodes.push(renderNoticeDetailBodyEmptyLine(lineKey))
      index += 1
      continue
    }

    const parsed = parseNoticeBodyLine(line)
    if (parsed.kind === "blockquote") {
      const groupContents: string[] = [parsed.content]
      index += 1
      while (index < lines.length) {
        const nextLine = lines[index] ?? ""
        if (nextLine.trim().length === 0) {
          break
        }
        const nextParsed = parseNoticeBodyLine(nextLine)
        if (nextParsed.kind !== "blockquote") {
          break
        }
        groupContents.push(nextParsed.content)
        index += 1
      }
      nodes.push(renderNoticeDetailBlockquoteGroup(groupContents, lineKey))
      continue
    }

    nodes.push(renderNoticeDetailBodyLine(line, lineKey))
    index += 1
  }

  return (
    <div className="flex w-full flex-col gap-(--umc-spacing-gap-8) pb-(--umc-spacing-padding-20)">
      {nodes}
    </div>
  )
}
