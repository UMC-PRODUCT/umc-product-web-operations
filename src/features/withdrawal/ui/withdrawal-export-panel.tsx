import { RemoveCircleIcon } from "@umc-product/icons"
import {
  Button,
  Calendar,
  type CalendarRange,
  Checkbox,
  Panel,
  PanelCloseButton,
  Select,
  TextFieldBoxField,
} from "@umc-product/react"
import dayjs from "dayjs"
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"

import { cn } from "@/shared/lib/cn"

import {
  createInitialWithdrawalExportForm,
  hasExportPeriod,
  isPersonalColumnSelected,
  WITHDRAWAL_EXPORT_COLUMN_OPTIONS,
  WITHDRAWAL_EXPORT_TYPE_OPTIONS,
  type WithdrawalExportColumnValue,
  type WithdrawalExportFieldAccess,
  type WithdrawalExportTypeValue,
} from "../model/withdrawal-export"

type FilterOption = { value: string; label: string }
type DateField = "start" | "end"

type WithdrawalExportPanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  schoolOptions: readonly FilterOption[]
  fieldAccess: WithdrawalExportFieldAccess
  /** 선택 건수 (CTA 라벨) */
  exportCount: number
  /** `false`면 패널을 닫지 않음 (실패 토스트 등) */
  onExport: (input: {
    startDate: Date | null
    endDate: Date | null
    schoolId: string | null
    types: WithdrawalExportTypeValue[]
    columns: WithdrawalExportColumnValue[]
  }) => boolean | void | Promise<boolean | void>
}

const ALL_SCHOOL = "all"
const CALENDAR_Z = "calc(var(--umc-z-dialog, 1000) + 2)"

function formatDateLabel(date: Date | null): string {
  if (date == null) {
    return "YYYY-MM-DD"
  }
  return dayjs(date).format("YYYY-MM-DD")
}

function FieldLabel({
  children,
  required = false,
}: {
  children: string
  required?: boolean
}) {
  return (
    <p className="text-label-4-medium text-neutral-medium-600 flex items-center gap-px px-1">
      <span>{children}</span>
      {required ? <span className="text-error">*</span> : null}
    </p>
  )
}

function DateClearButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      aria-label="날짜 지우기"
      className="umc-text-field-box-field__clear"
      onClick={onClick}
      tabIndex={-1}
      type="button"
    >
      <RemoveCircleIcon size={24} weight="fill" />
    </button>
  )
}

type ExportDateFieldProps = {
  label: string
  date: Date | null
  field: DateField
  openField: DateField | null
  ranges: readonly CalendarRange[]
  disabled?: boolean
  /** disabled일 때 날짜 자리에 표시 (Figma 일반: 「전체」) */
  lockedValue?: string
  isDateDisabled?: (date: Date) => boolean
  onOpen: (field: DateField) => void
  onDismiss: () => void
  onChange: (date: Date) => void
  onClear: () => void
}

function ExportDateField({
  label,
  date,
  field,
  openField,
  ranges,
  disabled = false,
  lockedValue,
  isDateDisabled,
  onOpen,
  onDismiss,
  onChange,
  onClear,
}: ExportDateFieldProps) {
  const anchorRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{
    left: number
    top: number
  } | null>(null)
  const isOpen = !disabled && openField === field
  const hasDate = date != null
  const displayValue = disabled
    ? (lockedValue ?? "전체")
    : formatDateLabel(date)
  // disabled면 TextFieldBoxField `color` 상속 (DS text-disabled)
  const valueTone = disabled
    ? "text-inherit"
    : hasDate
      ? "text-neutral-default-900"
      : "text-placeholder"
  const labelTone = disabled
    ? "text-inherit"
    : hasDate
      ? "text-neutral-default-900"
      : "text-placeholder"

  useLayoutEffect(() => {
    if (!isOpen) {
      setPosition(null)
      return
    }
    const update = () => {
      const anchor = anchorRef.current
      if (anchor == null) {
        return
      }
      const rect = anchor.getBoundingClientRect()
      setPosition({
        left: Math.min(rect.left, window.innerWidth - 320),
        top: rect.bottom + 8,
      })
    }
    update()
    window.addEventListener("resize", update)
    document.addEventListener("scroll", update, true)
    return () => {
      window.removeEventListener("resize", update)
      document.removeEventListener("scroll", update, true)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      return
    }
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        anchorRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return
      }
      onDismiss()
    }
    document.addEventListener("mousedown", handlePointerDown)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
    }
  }, [isOpen, onDismiss])

  const calendar =
    isOpen && typeof document !== "undefined"
      ? createPortal(
          <div
            className={cn(
              "fixed w-fit max-w-[calc(100vw-32px)] shrink-0",
              position == null && "invisible",
            )}
            ref={popoverRef}
            style={{
              left: position?.left ?? 0,
              top: position?.top ?? 0,
              zIndex: CALENDAR_Z,
            }}
          >
            <Calendar
              className="max-w-none shadow-(--umc-shadow-drop-neutral-2)"
              isDateDisabled={isDateDisabled}
              markedDates={[]}
              onValueChange={(next) => {
                onChange(next)
                onDismiss()
              }}
              ranges={ranges}
              value={date}
            />
          </div>,
          document.body,
        )
      : null

  return (
    <div className="relative min-w-0 flex-1" ref={anchorRef}>
      <TextFieldBoxField
        className={cn(
          "w-full gap-(--umc-spacing-gap-6)",
          // 캘린더는 portal이라 focus-within이 풀림 → 열린 동안 typing 스타일 유지
          isOpen &&
            "[--umc-text-field-box-field-bg:var(--umc-text-field-box-field-typing-bg)] [--umc-text-field-box-field-border-color:var(--umc-color-border-primary-strong-500)]",
        )}
        data-type={hasDate && !disabled ? "text" : undefined}
        disabled={disabled}
        size="lg"
      >
        <button
          className={cn(
            "text-label-2-medium flex min-w-0 flex-1 items-center",
            "gap-(--umc-spacing-gap-6) border-0 bg-transparent p-0",
            disabled && "cursor-default",
          )}
          // DS TextFieldBox: focus-within + [data-filled] 일 때 typing 배경
          data-filled={isOpen || hasDate ? "" : undefined}
          disabled={disabled}
          onClick={() => {
            if (disabled) {
              return
            }
            onOpen(field)
          }}
          type="button"
        >
          <span className={cn("shrink-0", labelTone)}>{label}</span>
          <span className={cn("min-w-0 truncate", valueTone)}>
            {displayValue}
          </span>
        </button>
        {hasDate && !disabled ? <DateClearButton onClick={onClear} /> : null}
      </TextFieldBoxField>
      {calendar}
    </div>
  )
}

/**
 * Figma 2547:50414 등 — 역할별 기간·학교 + 유형·열.
 * 중앙: 기간·학교 / 회장단: 기간만·학교 고정 / 일반: 전체 고정
 */
export function WithdrawalExportPanel({
  open,
  onOpenChange,
  schoolOptions,
  fieldAccess,
  exportCount,
  onExport,
}: WithdrawalExportPanelProps) {
  const [form, setForm] = useState(createInitialWithdrawalExportForm)
  const [openDateField, setOpenDateField] = useState<DateField | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      return
    }
    const initial = createInitialWithdrawalExportForm()
    if (fieldAccess.lockedSchool != null) {
      initial.schoolId = fieldAccess.lockedSchool.schoolId
    }
    setForm(initial)
    setOpenDateField(null)
    setSubmitting(false)
  }, [open, fieldAccess.lockedSchool])

  const schoolSelectOptions = useMemo(() => {
    if (fieldAccess.lockedSchool != null) {
      return [
        {
          value: fieldAccess.lockedSchool.schoolId,
          label: fieldAccess.lockedSchool.schoolName || "학교",
        },
      ]
    }
    return [{ value: ALL_SCHOOL, label: "전체" }, ...schoolOptions]
  }, [fieldAccess.lockedSchool, schoolOptions])

  /**
   * DS Calendar:
   * - `value` / `onValueChange`: 지금 고르는 날짜
   * - `ranges`: 선택 기간 띠(시작·끝 채움 + 중간 연결). 허용 범위가 아님.
   * 시작만/종료만 있어도 해당 날을 single로 넘겨 선택이 보이게 한다.
   */
  const calendarRanges = useMemo<CalendarRange[]>(() => {
    const start =
      form.startDate == null
        ? null
        : dayjs(form.startDate).startOf("day").toDate()
    const end =
      form.endDate == null ? null : dayjs(form.endDate).startOf("day").toDate()

    if (start != null && end != null) {
      return start <= end ? [{ start, end }] : [{ start: end, end: start }]
    }
    if (start != null) {
      return [{ start, end: start }]
    }
    if (end != null) {
      return [{ start: end, end }]
    }
    return []
  }, [form.endDate, form.startDate])

  const isExportDateDisabled = useMemo(() => {
    const today = dayjs().startOf("day")
    return (date: Date) => dayjs(date).startOf("day").isAfter(today)
  }, [])

  const personalSelected = isPersonalColumnSelected(form.columns)
  const periodReady = !fieldAccess.periodSelectable || hasExportPeriod(form)
  const hasColumns = form.columns.size > 0
  const consentReady = !personalSelected || form.personalConsent
  const canExport = periodReady && hasColumns && consentReady && !submitting

  const exportLabel =
    exportCount > 0 ? `${exportCount}건ㆍCSV 내보내기` : "CSV 내보내기"

  const toggleType = (value: WithdrawalExportTypeValue) => {
    setForm((prev) => {
      const next = new Set(prev.types)
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      return { ...prev, types: next }
    })
  }

  const toggleColumn = (value: WithdrawalExportColumnValue) => {
    setForm((prev) => {
      const next = new Set(prev.columns)
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      const stillPersonal = next.has("personal")
      return {
        ...prev,
        columns: next,
        personalConsent: stillPersonal ? prev.personalConsent : false,
      }
    })
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleExport = async () => {
    if (!canExport) {
      return
    }

    const schoolId = fieldAccess.schoolSelectable
      ? form.schoolId
      : (fieldAccess.lockedSchool?.schoolId ?? null)

    setSubmitting(true)
    try {
      const result = await onExport({
        startDate: fieldAccess.periodSelectable ? form.startDate : null,
        endDate: fieldAccess.periodSelectable ? form.endDate : null,
        schoolId,
        types: [...form.types],
        columns: [...form.columns],
      })
      if (result !== false) {
        onOpenChange(false)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Panel
      actions={
        <div className="umc-bottom-sheet-actions" data-layout="emphasis">
          <Button
            color="neutral"
            onClick={handleClose}
            size="md"
            type="button"
            variant="weak"
          >
            돌아가기
          </Button>
          <Button
            color="brand"
            disabled={!canExport}
            isLoading={submitting}
            onClick={() => {
              void handleExport()
            }}
            size="md"
            type="button"
            variant="fill"
          >
            {submitting ? "내보내는 중..." : exportLabel}
          </Button>
        </div>
      }
      description="기수 · 학교 · 파트 · 시기별 탈부 현황을 CSV로 받아요."
      headSlot={<PanelCloseButton />}
      onOpenChange={onOpenChange}
      open={open}
      title="탈부 기록 내보내기"
    >
      <div className="flex w-full flex-col gap-(--umc-spacing-gap-24) pt-(--umc-spacing-padding-16) pb-(--umc-spacing-padding-16)">
        <div className="flex w-full flex-col gap-1">
          <FieldLabel required>기간</FieldLabel>
          <div className="flex w-full gap-(--umc-spacing-gap-8)">
            <ExportDateField
              date={form.startDate}
              disabled={!fieldAccess.periodSelectable}
              field="start"
              isDateDisabled={isExportDateDisabled}
              label="시작"
              lockedValue="전체"
              onChange={(next) => {
                const startDate = dayjs(next).startOf("day").toDate()
                setForm((prev) => {
                  const end =
                    prev.endDate == null
                      ? null
                      : dayjs(prev.endDate).startOf("day").toDate()
                  // 종료보다 늦은 시작을 고르면 기간을 맞춰 정규화
                  if (end != null && dayjs(startDate).isAfter(dayjs(end))) {
                    return { ...prev, startDate: end, endDate: startDate }
                  }
                  return { ...prev, startDate }
                })
              }}
              onClear={() => {
                setForm((prev) => ({ ...prev, startDate: null }))
              }}
              onDismiss={() => {
                setOpenDateField(null)
              }}
              onOpen={setOpenDateField}
              openField={openDateField}
              ranges={calendarRanges}
            />
            <ExportDateField
              date={form.endDate}
              disabled={!fieldAccess.periodSelectable}
              field="end"
              isDateDisabled={isExportDateDisabled}
              label="종료"
              lockedValue="전체"
              onChange={(next) => {
                const endDate = dayjs(next).startOf("day").toDate()
                setForm((prev) => {
                  const start =
                    prev.startDate == null
                      ? null
                      : dayjs(prev.startDate).startOf("day").toDate()
                  // 시작보다 이른 종료를 고르면 기간을 맞춰 정규화
                  if (start != null && dayjs(endDate).isBefore(dayjs(start))) {
                    return { ...prev, startDate: endDate, endDate: start }
                  }
                  return { ...prev, endDate }
                })
              }}
              onClear={() => {
                setForm((prev) => ({ ...prev, endDate: null }))
              }}
              onDismiss={() => {
                setOpenDateField(null)
              }}
              onOpen={setOpenDateField}
              openField={openDateField}
              ranges={calendarRanges}
            />
          </div>
        </div>

        <div className="flex w-full flex-col gap-(--umc-spacing-gap-4)">
          <FieldLabel>학교</FieldLabel>
          <Select
            aria-label="학교"
            className="w-full"
            disabled={!fieldAccess.schoolSelectable}
            onValueChange={(value) => {
              if (!fieldAccess.schoolSelectable) {
                return
              }
              setForm((prev) => ({
                ...prev,
                schoolId: value === ALL_SCHOOL ? null : value,
              }))
            }}
            options={schoolSelectOptions}
            placeholder="전체"
            size="lg"
            value={fieldAccess.lockedSchool?.schoolId ?? form.schoolId}
          />
        </div>

        <div className="flex w-full flex-col gap-(--umc-spacing-gap-8)">
          <FieldLabel>탈부 유형</FieldLabel>
          <div className="flex flex-col gap-[9px] pl-0.5">
            {WITHDRAWAL_EXPORT_TYPE_OPTIONS.map((option) => (
              <Checkbox
                checked={form.types.has(option.value)}
                color="neutral"
                key={option.value}
                labelPlacement="end"
                onCheckedChange={() => {
                  toggleType(option.value)
                }}
                size="md"
              >
                <span className="text-label-4-medium text-neutral-strong-800">
                  {option.label}
                </span>
              </Checkbox>
            ))}
          </div>
        </div>

        <div className="flex w-full flex-col gap-(--umc-spacing-gap-8)">
          <FieldLabel>포함할 열</FieldLabel>
          <div className="flex flex-col gap-[9px] pl-0.5">
            {WITHDRAWAL_EXPORT_COLUMN_OPTIONS.map((option) => (
              <Checkbox
                checked={form.columns.has(option.value)}
                color="neutral"
                key={option.value}
                labelPlacement="end"
                onCheckedChange={() => {
                  toggleColumn(option.value)
                }}
                size="md"
              >
                <span
                  className={cn(
                    "text-label-4-medium",
                    option.sensitive
                      ? "text-warning"
                      : "text-neutral-strong-800",
                  )}
                >
                  {option.label}
                </span>
              </Checkbox>
            ))}
          </div>
        </div>

        {personalSelected ? (
          <div className="flex w-full flex-col gap-(--umc-spacing-gap-4)">
            <div
              className={cn(
                "bg-fill-neutral-weak-75 border-neutral-disabled flex w-full flex-col",
                "items-start gap-(--umc-spacing-gap-8) rounded-(--umc-radius-14)",
                "border px-(--umc-spacing-padding-16) py-(--umc-spacing-padding-12)",
              )}
            >
              <FieldLabel required>필수 동의</FieldLabel>
              <p className="text-label-3-medium text-neutral-strong-800 w-full">
                이름 · 닉네임이 들어간 파일이에요.
                <br />
                공유 드라이브에만 두고 다음 기수 리크루팅이 끝나면 지워 주세요
              </p>
              <div className="flex w-full justify-end">
                <Checkbox
                  checked={form.personalConsent}
                  color="brand"
                  labelPlacement="start"
                  onCheckedChange={(checked) => {
                    setForm((prev) => ({ ...prev, personalConsent: checked }))
                  }}
                  size="md"
                >
                  <span className="text-label-4-medium text-neutral-strong-800">
                    확인했어요
                  </span>
                </Checkbox>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Panel>
  )
}
