import { RemoveCircleIcon } from "@umc-product/icons"
import {
  BottomSheetActions,
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
  /** 필터 조건에 맞는 예상 건수 (목/API) */
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
        className="w-full gap-(--umc-spacing-gap-6)"
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
 * Figma 2547:50414 / 50445 / 50478 / 2541:44063 / 2541:44813
 * — 탈부 기록 내보내기 Panel.
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
  const [consentAttempted, setConsentAttempted] = useState(false)
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
    setConsentAttempted(false)
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

  const calendarRanges = useMemo<CalendarRange[]>(() => {
    const today = dayjs().startOf("day").toDate()
    return [{ start: new Date(2020, 0, 1), end: today }]
  }, [])

  const personalSelected = isPersonalColumnSelected(form.columns)
  const periodReady = !fieldAccess.periodSelectable || hasExportPeriod(form)
  const consentInvalid =
    personalSelected && !form.personalConsent && consentAttempted

  const exportLabel =
    periodReady && exportCount > 0
      ? `${exportCount}건ㆍCSV 내보내기`
      : "CSV 내보내기"

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
    if (value === "personal") {
      setConsentAttempted(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleExport = async () => {
    if (!periodReady) {
      return
    }
    if (personalSelected && !form.personalConsent) {
      setConsentAttempted(true)
      return
    }
    if (
      fieldAccess.periodSelectable &&
      (form.startDate == null || form.endDate == null)
    ) {
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
        <BottomSheetActions
          layout="emphasis"
          primary={{
            label: submitting ? "내보내는 중..." : exportLabel,
            onClick: () => {
              void handleExport()
            },
          }}
          secondary={{
            label: "돌아가기",
            onClick: handleClose,
          }}
        />
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
              label="시작"
              lockedValue="전체"
              onChange={(next) => {
                setForm((prev) => ({ ...prev, startDate: next }))
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
              label="종료"
              lockedValue="전체"
              onChange={(next) => {
                setForm((prev) => ({ ...prev, endDate: next }))
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
                "items-end gap-(--umc-spacing-gap-8) rounded-(--umc-radius-14)",
                "border px-(--umc-spacing-padding-16) py-(--umc-spacing-padding-12)",
              )}
            >
              <FieldLabel required>필수 동의</FieldLabel>
              <p className="text-label-3-medium text-neutral-strong-800 w-full">
                이름 · 닉네임이 들어간 파일이에요.
                <br />
                공유 드라이브에만 두고 다음 기수 리크루팅이 끝나면 지워 주세요
              </p>
              <Checkbox
                checked={form.personalConsent}
                color="brand"
                labelPlacement="start"
                onCheckedChange={(checked) => {
                  setForm((prev) => ({ ...prev, personalConsent: checked }))
                  if (checked) {
                    setConsentAttempted(false)
                  }
                }}
                size="md"
              >
                <span className="text-label-4-medium text-neutral-strong-800">
                  확인했어요
                </span>
              </Checkbox>
            </div>
            {consentInvalid ? (
              <p className="text-body-3-regular text-error px-1">
                필수 동의를 확인해 주세요
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </Panel>
  )
}
