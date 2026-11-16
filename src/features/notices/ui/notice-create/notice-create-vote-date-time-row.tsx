import {
  Calendar,
  type CalendarRange,
  Field,
  TextFieldBoxField,
} from "@umc-product/react"
import dayjs from "dayjs"
import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { cn } from "@/shared/lib/cn"

import {
  VoteTextFieldClearButton,
  VoteTimeFieldBox,
} from "./notice-create-vote-fields"

const VOTE_CALENDAR_POPOVER_Z_INDEX = "calc(var(--umc-z-dialog, 1000) + 2)"
const VOTE_CALENDAR_ANCHOR_GAP_PX = 8
const VOTE_CALENDAR_VIEWPORT_PADDING_PX = 16
export type VoteDateField = "start" | "end"

function computeVoteCalendarPopoverPosition(input: {
  anchorRect: DOMRect
  dateField: VoteDateField
  popoverHeight: number
  popoverWidth: number
}): { left: number; top: number } {
  const { anchorRect, dateField, popoverHeight, popoverWidth } = input
  const gap = VOTE_CALENDAR_ANCHOR_GAP_PX
  const pad = VOTE_CALENDAR_VIEWPORT_PADDING_PX
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let left = anchorRect.left
  if (popoverWidth > 0) {
    left = Math.min(left, viewportWidth - popoverWidth - pad)
    left = Math.max(pad, left)
  }

  const topBelow = anchorRect.bottom + gap
  const topAbove = anchorRect.top - gap - popoverHeight

  let top = dateField === "start" ? topBelow : topAbove

  if (popoverHeight > 0) {
    const maxTop = viewportHeight - popoverHeight - pad

    if (dateField === "start") {
      top = Math.min(topBelow, maxTop)
      top = Math.max(pad, top)
    } else {
      top = Math.max(topAbove, pad)
      top = Math.min(top, maxTop)
    }
  }

  return { left, top }
}

function formatVoteDateLabel(date: Date | null): string {
  if (date == null) {
    return "YYYY-MM-DD"
  }
  return dayjs(date).format("YYYY-MM-DD")
}

type VoteDateTimeRowProps = {
  date: Date | null
  dateErrorMessage?: string
  dateField: VoteDateField
  dateInvalid?: boolean
  label: string
  onClearDate: () => void
  onDateChange: (date: Date) => void
  onDismissCalendar: () => void
  onOpenCalendar: (field: VoteDateField) => void
  onTimeChange: (time: string) => void
  openCalendarField: VoteDateField | null
  ranges: readonly CalendarRange[]
  time: string
  timeInvalid?: boolean
}

export function VoteDateTimeRow({
  date,
  dateErrorMessage,
  dateField,
  dateInvalid = false,
  label,
  onClearDate,
  onDateChange,
  onDismissCalendar,
  onOpenCalendar,
  onTimeChange,
  openCalendarField,
  ranges,
  time,
  timeInvalid = false,
}: VoteDateTimeRowProps) {
  const calendarAnchorRef = useRef<HTMLDivElement>(null)
  const calendarPopoverRef = useRef<HTMLDivElement>(null)
  const calendarResizeObserverRef = useRef<ResizeObserver | null>(null)
  const [calendarFixedPosition, setCalendarFixedPosition] = useState<{
    left: number
    top: number
  } | null>(null)
  const isCalendarOpen = openCalendarField === dateField

  useLayoutEffect(() => {
    if (!isCalendarOpen) {
      setCalendarFixedPosition(null)
      return
    }

    const updatePosition = () => {
      const anchor = calendarAnchorRef.current
      if (anchor == null) {
        return
      }
      const rect = anchor.getBoundingClientRect()
      const popoverRect = calendarPopoverRef.current?.getBoundingClientRect()
      const popoverWidth = popoverRect?.width ?? 0
      const popoverHeight = popoverRect?.height ?? 0

      setCalendarFixedPosition(
        computeVoteCalendarPopoverPosition({
          anchorRect: rect,
          dateField,
          popoverHeight,
          popoverWidth,
        }),
      )

      const popoverElement = calendarPopoverRef.current
      if (popoverElement != null && calendarResizeObserverRef.current == null) {
        calendarResizeObserverRef.current = new ResizeObserver(() => {
          updatePosition()
        })
        calendarResizeObserverRef.current.observe(popoverElement)
      }
    }

    updatePosition()
    const rafId = requestAnimationFrame(updatePosition)
    window.addEventListener("resize", updatePosition)
    document.addEventListener("scroll", updatePosition, true)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener("resize", updatePosition)
      document.removeEventListener("scroll", updatePosition, true)
      calendarResizeObserverRef.current?.disconnect()
      calendarResizeObserverRef.current = null
    }
  }, [dateField, isCalendarOpen])

  useEffect(() => {
    if (!isCalendarOpen) {
      return
    }
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        calendarAnchorRef.current?.contains(target) ||
        calendarPopoverRef.current?.contains(target)
      ) {
        return
      }
      onDismissCalendar()
    }
    document.addEventListener("mousedown", handlePointerDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
    }
  }, [isCalendarOpen, onDismissCalendar])

  const hasDate = date != null

  const calendarPopover = isCalendarOpen
    ? createPortal(
        <div
          className={cn(
            "fixed w-fit max-w-[calc(100vw-32px)] shrink-0",
            calendarFixedPosition == null && "invisible",
          )}
          ref={calendarPopoverRef}
          style={{
            left: calendarFixedPosition?.left ?? 0,
            top: calendarFixedPosition?.top ?? 0,
            zIndex: VOTE_CALENDAR_POPOVER_Z_INDEX,
          }}
        >
          <Calendar
            className={cn("max-w-none shadow-(--umc-shadow-drop-neutral-2)")}
            markedDates={[]}
            onValueChange={onDateChange}
            ranges={ranges}
            value={date}
          />
        </div>,
        document.body,
      )
    : null

  return (
    <div
      className={cn(
        "flex w-fit max-w-full flex-nowrap items-start",
        "gap-(--umc-spacing-gap-8)",
      )}
    >
      <Field
        className={cn(
          "w-fit shrink-0",
          "[&_.umc-field__caption]:whitespace-nowrap",
        )}
        errorMessage={dateErrorMessage}
        invalid={dateInvalid}
        nativeLabel={false}
      >
        <div className="relative w-fit" ref={calendarAnchorRef}>
          <TextFieldBoxField
            className="!w-fit gap-(--umc-spacing-gap-6)"
            data-type={hasDate ? "text" : undefined}
            invalid={dateInvalid}
            size="lg"
          >
            <button
              className={cn(
                "text-label-2-medium flex w-fit items-center",
                "gap-(--umc-spacing-gap-6) border-0 bg-transparent p-0",
              )}
              onClick={() => {
                onOpenCalendar(dateField)
              }}
              type="button"
            >
              <span className="text-placeholder shrink-0">{label}</span>
              <span
                className={cn(
                  "shrink-0 whitespace-nowrap",
                  date == null
                    ? "text-placeholder"
                    : "text-neutral-default-900",
                )}
              >
                {formatVoteDateLabel(date)}
              </span>
            </button>
            {hasDate ? (
              <VoteTextFieldClearButton
                ariaLabel="날짜 지우기"
                onClick={onClearDate}
              />
            ) : null}
          </TextFieldBoxField>
        </div>
      </Field>
      {calendarPopover}
      <VoteTimeFieldBox
        invalid={timeInvalid}
        onChange={onTimeChange}
        value={time}
      />
    </div>
  )
}
