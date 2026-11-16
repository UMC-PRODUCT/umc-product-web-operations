import { AddIcon, CloseIcon } from "@umc-product/icons"
import {
  Button,
  type CalendarRange,
  Checkbox,
  Dimmed,
  Field,
  IconButton,
  ScrollFog,
} from "@umc-product/react"
import {
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
  getVoteDateTimeFieldErrors,
  getVoteOptionFieldError,
  getVoteTitleFieldError,
  isVoteDraftSubmittable,
  isVoteTimeFieldInvalid,
  normalizeVoteTimeForSubmit,
} from "../../model/notice-create-vote-validation"
import {
  type VoteDateField,
  VoteDateTimeRow,
} from "./notice-create-vote-date-time-row"
import {
  VOTE_TEXT_FIELD_CLEAR_LABEL,
  VoteFilledTextFieldBox,
} from "./notice-create-vote-fields"

type NoticeCreateVotePanelProps = {
  initialDraft?: NoticeCreateVoteDraft
  onClose: () => void
  onCreate: (draft: NoticeCreateVoteDraft) => void
  open: boolean
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
