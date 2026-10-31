const KST = "Asia/Seoul"

function toDate(value: string): Date | null {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatParts(date: Date, withTime: boolean) {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: KST,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    ...(withTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }
      : {}),
  }

  const parts = new Intl.DateTimeFormat("ko-KR", options).formatToParts(date)
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ""

  const year = read("year")
  const month = read("month")
  const day = read("day")

  if (!withTime) {
    return `${year.slice(-2)}/${month}/${day}`
  }

  const hour = read("hour")
  const minute = read("minute")
  return `${year}.${month}.${day} ${hour}:${minute}`
}

export function formatNoticeListDate(iso: string): string {
  const date = toDate(iso)
  if (!date) {
    return iso
  }
  return formatParts(date, false)
}

export function formatNoticeDetailDateTime(iso: string): string {
  const date = toDate(iso)
  if (!date) {
    return iso
  }
  return formatParts(date, true)
}

export function formatNoticeVotePeriod(
  startsAt: string,
  endsAtExclusive: string,
): string {
  const start = toDate(startsAt)
  const end = toDate(endsAtExclusive)
  if (!start || !end) {
    return `${startsAt} ~ ${endsAtExclusive}`
  }

  const startLabel = formatParts(start, true).replace(
    /^(\d{4})\./,
    (_, year: string) => `${year.slice(-2)}/`,
  )
  const endLabel = formatParts(end, true).replace(
    /^(\d{4})\./,
    (_, year: string) => `${year.slice(-2)}/`,
  )
  return `${startLabel} ~ ${endLabel}`
}
