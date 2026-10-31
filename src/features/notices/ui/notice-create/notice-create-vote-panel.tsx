import { AddIcon, CloseIcon, RemoveCircleIcon } from "@umc-product/icons"
import {
  Button,
  Calendar,
  type CalendarRange,
  Checkbox,
  Dimmed,
  Field,
  FieldControl,
  IconButton,
  ScrollFog,
  TextFieldBoxField,
} from "@umc-product/react"
import dayjs from "dayjs"
import {
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"

import { cn } from "@/shared/lib/cn"
import { lockBodyScroll } from "@/shared/lib/lock-body-scroll"

import {
  createInitialNoticeCreateVoteDraft,
  NOTICE_CREATE_VOTE_OPTION_MAX,
  NOTICE_CREATE_VOTE_OPTION_MIN,
  type NoticeCreateVoteDraft,
} from "../../model/notice-create-vote-draft"
import {
  composeVoteTimeValue,
  getVoteDateTimeFieldErrors,
  getVoteOptionFieldError,
  getVoteTitleFieldError,
  isVoteDraftSubmittable,
  isVoteTimeFieldInvalid,
  isVoteTimeValueInvalid,
  normalizeVoteTimeForSubmit,
  parseVoteTimeValue,
} from "../../model/notice-create-vote-validation"

const VOTE_TEXT_FIELD_CLEAR_LABEL = "입력 내용 지우기"
const VOTE_CALENDAR_POPOVER_Z_INDEX = "calc(var(--umc-z-dialog, 1000) + 2)"
const VOTE_CALENDAR_ANCHOR_GAP_PX = 8
const VOTE_CALENDAR_VIEWPORT_PADDING_PX = 16
type VoteDateField = "start" | "end"

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

function VoteTextFieldClearButton({
  ariaLabel,
  onClick,
}: {
  ariaLabel: string
  onClick: () => void
}) {
  return (
    <button
      aria-label={ariaLabel}
      className="umc-text-field-box-field__clear"
      onClick={onClick}
      tabIndex={-1}
      type="button"
    >
      <RemoveCircleIcon size={24} weight="fill" />
    </button>
  )
}

type VoteFilledTextFieldBoxProps = {
  clearAriaLabel?: string
  errorMessage?: string
  invalid?: boolean
  label?: string
  onChange: (value: string) => void
  onClear?: () => void
  placeholder?: string
  required?: boolean
  value: string
}

function VoteFilledTextFieldBox({
  clearAriaLabel = VOTE_TEXT_FIELD_CLEAR_LABEL,
  errorMessage,
  invalid = false,
  label,
  onChange,
  onClear,
  placeholder,
  required,
  value,
}: VoteFilledTextFieldBoxProps) {
  const showClearControl = onClear != null || value.length > 0

  const handleClear = () => {
    if (onClear) {
      onClear()
      return
    }
    onChange("")
  }

  return (
    <Field
      errorMessage={errorMessage}
      invalid={invalid}
      label={label}
      required={required}
    >
      <TextFieldBoxField data-type="text" invalid={invalid} size="lg">
        <FieldControl
          className="umc-text-field-box-field__input"
          onChange={(event) => {
            onChange(event.target.value)
          }}
          placeholder={placeholder}
          required={required}
          value={value}
        />
        {showClearControl ? (
          <VoteTextFieldClearButton
            ariaLabel={clearAriaLabel}
            onClick={handleClear}
          />
        ) : null}
      </TextFieldBoxField>
    </Field>
  )
}

type VoteTimeFieldBoxProps = {
  invalid?: boolean
  onChange: (value: string) => void
  value: string
}

/** Figma 1192:24490 · HH:mm (고정 `:`) 분할 입력 */
function VoteTimeFieldBox({
  invalid = false,
  onChange,
  value,
}: VoteTimeFieldBoxProps) {
  const hoursRef = useRef<HTMLInputElement>(null)
  const minutesRef = useRef<HTMLInputElement>(null)
  const { hours, minutes } = parseVoteTimeValue(value)
  const showPlaceholder = hours.length === 0 && minutes.length === 0
  const showInvalid = invalid || isVoteTimeValueInvalid(value)

  const handleHoursChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextHours = event.target.value.replace(/\D/g, "").slice(0, 2)
    onChange(composeVoteTimeValue(nextHours, minutes))
    if (nextHours.length === 2) {
      minutesRef.current?.focus()
      minutesRef.current?.select()
    }
  }

  const handleMinutesChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextMinutes = event.target.value.replace(/\D/g, "").slice(0, 2)
    onChange(composeVoteTimeValue(hours, nextMinutes))
  }

  const handleHoursKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key === ":" && minutes.length === 0) {
      event.preventDefault()
      minutesRef.current?.focus()
    }
  }

  const handleMinutesKeyDown = (
    event: ReactKeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Backspace" && minutes.length === 0 && hours.length > 0) {
      event.preventDefault()
      hoursRef.current?.focus()
    }
  }

  return (
    <TextFieldBoxField
      className="relative w-[78px] shrink-0 justify-center"
      invalid={showInvalid}
      size="lg"
    >
      {showPlaceholder ? (
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center",
            "text-label-2-medium text-placeholder justify-center",
            "font-variant-numeric tabular-nums",
          )}
        >
          00:00
        </span>
      ) : null}
      <span
        className={cn(
          "relative z-1 inline-grid grid-cols-[2ch_auto_2ch] items-center",
          "justify-items-center whitespace-nowrap tabular-nums",
        )}
      >
        <input
          aria-label="시"
          className={cn(
            "umc-text-field-box-field__input w-full min-w-0 p-0 text-center",
            "font-variant-numeric tabular-nums",
          )}
          inputMode="numeric"
          maxLength={2}
          onChange={handleHoursChange}
          onKeyDown={handleHoursKeyDown}
          ref={hoursRef}
          value={hours}
        />
        <span
          aria-hidden="true"
          className={cn(
            showPlaceholder ? "invisible" : "text-neutral-default-900",
          )}
        >
          :
        </span>
        <input
          aria-label="분"
          className={cn(
            "umc-text-field-box-field__input w-full min-w-0 p-0 text-center",
            "font-variant-numeric tabular-nums",
          )}
          inputMode="numeric"
          maxLength={2}
          onChange={handleMinutesChange}
          onKeyDown={handleMinutesKeyDown}
          ref={minutesRef}
          value={minutes}
        />
      </span>
    </TextFieldBoxField>
  )
}

type NoticeCreateVotePanelProps = {
  initialDraft?: NoticeCreateVoteDraft
  onClose: () => void
  onCreate: (draft: NoticeCreateVoteDraft) => void
  open: boolean
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

function VoteDateTimeRow({
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

/** Figma 1221:18878 · 1192:24437 — 공지 작성 투표 만들기 패널 */
export function NoticeCreateVotePanel({
  initialDraft,
  onClose,
  onCreate,
  open,
}: NoticeCreateVotePanelProps) {
  const titleId = useId()
  const [draft, setDraft] = useState<NoticeCreateVoteDraft>(
    initialDraft ?? createInitialNoticeCreateVoteDraft(),
  )
  const [openCalendarField, setOpenCalendarField] =
    useState<VoteDateField | null>(null)
  const [showValidationErrors, setShowValidationErrors] = useState(false)
  const voteBodyScrollRef = useRef<HTMLDivElement>(null)
  const [showVoteBodyScrollFog, setShowVoteBodyScrollFog] = useState(false)

  const updateVoteBodyScrollFog = useCallback(() => {
    const element = voteBodyScrollRef.current
    if (element == null) {
      setShowVoteBodyScrollFog(false)
      return
    }
    const hasOverflow = element.scrollHeight - element.clientHeight > 1
    const atBottom =
      element.scrollTop + element.clientHeight >= element.scrollHeight - 1
    setShowVoteBodyScrollFog(hasOverflow && !atBottom)
  }, [])

  useEffect(() => {
    if (open) {
      setDraft(initialDraft ?? createInitialNoticeCreateVoteDraft())
      setOpenCalendarField(null)
      setShowValidationErrors(false)
    }
  }, [initialDraft, open])

  useLayoutEffect(() => {
    if (!open) {
      setShowVoteBodyScrollFog(false)
      return
    }
    updateVoteBodyScrollFog()
    const rafId = requestAnimationFrame(updateVoteBodyScrollFog)
    return () => {
      cancelAnimationFrame(rafId)
    }
  }, [draft, open, showValidationErrors, updateVoteBodyScrollFog])

  useEffect(() => {
    if (!open) {
      return
    }
    const element = voteBodyScrollRef.current
    if (element == null) {
      return
    }

    const observer = new ResizeObserver(() => {
      updateVoteBodyScrollFog()
    })
    observer.observe(element)
    element.addEventListener("scroll", updateVoteBodyScrollFog, {
      passive: true,
    })

    return () => {
      observer.disconnect()
      element.removeEventListener("scroll", updateVoteBodyScrollFog)
    }
  }, [open, updateVoteBodyScrollFog])

  useEffect(() => {
    if (!open) {
      return
    }
    const unlock = lockBodyScroll()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        onClose()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      unlock()
    }
  }, [onClose, open])

  const calendarRanges = useMemo((): readonly CalendarRange[] => {
    if (draft.startDate && draft.endDate) {
      const start = draft.startDate
      const end = draft.endDate
      if (end >= start) {
        return [{ end, start }]
      }
    }
    return []
  }, [draft.endDate, draft.startDate])

  const canAddOption = draft.options.length < NOTICE_CREATE_VOTE_OPTION_MAX
  const canRemoveOption = draft.options.length > NOTICE_CREATE_VOTE_OPTION_MIN

  const voteDateTimeErrors = useMemo(
    () => getVoteDateTimeFieldErrors(draft),
    [draft],
  )
  const voteTitleError = getVoteTitleFieldError(
    draft.title,
    showValidationErrors,
  )

  const toggleCalendar = (field: VoteDateField) => {
    setOpenCalendarField((current) => (current === field ? null : field))
  }

  const patchDraft = (patch: Partial<NoticeCreateVoteDraft>) => {
    setDraft((current) => ({ ...current, ...patch }))
  }

  const updateOption = (index: number, value: string) => {
    setDraft((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) =>
        optionIndex === index ? value : option,
      ),
    }))
  }

  const addOption = () => {
    if (!canAddOption) {
      return
    }
    setDraft((current) => ({
      ...current,
      options: [...current.options, ""],
    }))
  }

  const removeOption = (index: number) => {
    if (!canRemoveOption) {
      return
    }
    setDraft((current) => ({
      ...current,
      options: current.options.filter(
        (_, optionIndex) => optionIndex !== index,
      ),
    }))
  }

  if (!open || typeof document === "undefined") {
    return null
  }

  return createPortal(
    <>
      <Dimmed
        className="fixed inset-0 z-[var(--umc-z-dialog,1000)]"
        intensity="medium"
        onClick={onClose}
      />
      <div className="fixed inset-0 z-[calc(var(--umc-z-dialog,1000)+1)] flex items-center justify-center p-(--umc-spacing-padding-32)">
        <div
          aria-labelledby={titleId}
          aria-modal="true"
          className={cn(
            "relative flex max-h-[min(720px,90vh)] w-full max-w-[512px] flex-col",
            "overflow-hidden rounded-(--umc-radius-16) bg-white",
            "pb-(--umc-spacing-padding-20) shadow-(--umc-shadow-drop-neutral-2)",
          )}
          onClick={(event) => {
            event.stopPropagation()
          }}
          role="dialog"
        >
          <div className="flex shrink-0 items-start justify-between pt-(--umc-spacing-padding-32) pr-(--umc-spacing-padding-24) pl-(--umc-spacing-padding-32)">
            <h2
              className="text-heading-2-semibold text-neutral-default-900 px-(--umc-spacing-padding-4)"
              id={titleId}
            >
              투표 만들기
            </h2>
            <IconButton
              aria-label="닫기"
              color="white"
              icon={<CloseIcon aria-hidden size={20} />}
              onClick={onClose}
              size="sm"
              type="button"
              variant="weak"
            />
          </div>

          <div className="relative flex min-h-0 min-w-0 flex-1 flex-col">
            <div
              className={cn(
                "flex min-h-0 flex-1 flex-col gap-(--umc-spacing-gap-12)",
                "overflow-y-auto px-(--umc-spacing-padding-32) py-(--umc-spacing-padding-20)",
              )}
              ref={voteBodyScrollRef}
            >
              <VoteFilledTextFieldBox
                errorMessage={voteTitleError}
                invalid={Boolean(voteTitleError)}
                label="투표 제목"
                onChange={(title) => {
                  patchDraft({ title })
                }}
                placeholder="제목을 입력하세요"
                required
                value={draft.title}
              />

              <div className="flex flex-col">
                <div className="flex flex-col gap-(--umc-spacing-gap-8)">
                  {draft.options.map((option, index) => {
                    const optionError = getVoteOptionFieldError(
                      option,
                      showValidationErrors,
                    )

                    return (
                      <VoteFilledTextFieldBox
                        clearAriaLabel={
                          canRemoveOption
                            ? "항목 삭제"
                            : VOTE_TEXT_FIELD_CLEAR_LABEL
                        }
                        errorMessage={optionError}
                        invalid={Boolean(optionError)}
                        key={`vote-option-${index}`}
                        label={index === 0 ? "항목 (최소 2~5개)" : undefined}
                        onChange={(nextValue) => {
                          updateOption(index, nextValue)
                        }}
                        onClear={
                          canRemoveOption
                            ? () => {
                                removeOption(index)
                              }
                            : undefined
                        }
                        placeholder="항목을 입력하세요"
                        required={index === 0}
                        value={option}
                      />
                    )
                  })}
                  <Button
                    className="w-full"
                    color="neutral"
                    disabled={!canAddOption}
                    leadingIcon={
                      <AddIcon aria-hidden size={14} weight="fill" />
                    }
                    onClick={addOption}
                    size="sm"
                    type="button"
                    variant="weak"
                  >
                    항목 추가
                  </Button>
                </div>
                <Field
                  className="mt-(--umc-spacing-gap-20)"
                  label="투표 일시"
                  required
                >
                  <div className="flex flex-col gap-(--umc-spacing-gap-8)">
                    <VoteDateTimeRow
                      date={draft.startDate}
                      dateField="start"
                      label="시작"
                      onClearDate={() => {
                        patchDraft({ startDate: null })
                        setOpenCalendarField(null)
                      }}
                      onDateChange={(date) => {
                        patchDraft({ startDate: date })
                        setOpenCalendarField(null)
                      }}
                      onDismissCalendar={() => {
                        setOpenCalendarField(null)
                      }}
                      onOpenCalendar={toggleCalendar}
                      onTimeChange={(startTime) => {
                        patchDraft({ startTime })
                      }}
                      openCalendarField={openCalendarField}
                      ranges={calendarRanges}
                      time={draft.startTime}
                      timeInvalid={isVoteTimeFieldInvalid(
                        draft.startTime,
                        showValidationErrors,
                      )}
                    />
                    <VoteDateTimeRow
                      date={draft.endDate}
                      dateErrorMessage={voteDateTimeErrors.endDate}
                      dateField="end"
                      dateInvalid={Boolean(voteDateTimeErrors.endDate)}
                      label="종료"
                      onClearDate={() => {
                        patchDraft({ endDate: null })
                        setOpenCalendarField(null)
                      }}
                      onDateChange={(date) => {
                        patchDraft({ endDate: date })
                        setOpenCalendarField(null)
                      }}
                      onDismissCalendar={() => {
                        setOpenCalendarField(null)
                      }}
                      onOpenCalendar={toggleCalendar}
                      onTimeChange={(endTime) => {
                        patchDraft({ endTime })
                      }}
                      openCalendarField={openCalendarField}
                      ranges={calendarRanges}
                      time={draft.endTime}
                      timeInvalid={isVoteTimeFieldInvalid(
                        draft.endTime,
                        showValidationErrors,
                      )}
                    />
                  </div>
                </Field>
                <div
                  className={cn(
                    "mt-(--umc-spacing-gap-20) flex flex-col",
                    "gap-(--umc-spacing-gap-12)",
                  )}
                >
                  <Checkbox
                    checked={draft.isAnonymous}
                    color={draft.isAnonymous ? "brand" : "neutral"}
                    labelPlacement="end"
                    onCheckedChange={(checked) => {
                      patchDraft({ isAnonymous: checked === true })
                    }}
                    size="md"
                  >
                    익명투표
                  </Checkbox>
                  <Checkbox
                    checked={draft.allowMultiple}
                    color={draft.allowMultiple ? "brand" : "neutral"}
                    labelPlacement="end"
                    onCheckedChange={(checked) => {
                      patchDraft({ allowMultiple: checked === true })
                    }}
                    size="md"
                  >
                    복수선택
                  </Checkbox>
                </div>
              </div>
            </div>
            {showVoteBodyScrollFog ? (
              <ScrollFog
                aria-hidden
                className="pointer-events-none absolute right-0 bottom-0 left-0 h-[74px]"
                side="bottom"
              />
            ) : null}
          </div>

          <div className="grid shrink-0 grid-cols-3 gap-(--umc-spacing-gap-8) px-(--umc-spacing-padding-16) pt-(--umc-spacing-padding-16)">
            <Button
              color="neutral"
              onClick={onClose}
              size="md"
              type="button"
              variant="weak"
            >
              취소
            </Button>
            <Button
              className="col-span-2"
              color="brand"
              onClick={() => {
                setShowValidationErrors(true)
                if (!isVoteDraftSubmittable(draft)) {
                  return
                }
                onCreate({
                  ...draft,
                  endTime: normalizeVoteTimeForSubmit(draft.endTime),
                  startTime: normalizeVoteTimeForSubmit(draft.startTime),
                })
              }}
              size="md"
              type="button"
              variant="fill"
            >
              생성하기
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
