import { useNavigate } from "@tanstack/react-router"
import { CheckCircleIcon, WarningIcon } from "@umc-product/icons"
import { Button, TextArea, TextFieldBox } from "@umc-product/react"
import { useState } from "react"

import { mockCreateNotice } from "../model/mock-create-notice"

import type { CreateNoticeOutcome } from "../model/mock-create-notice"

type NoticeCreatePageProps = {
  /** TODO: API 연동 시 제거. 등록 결과 시뮬레이션용 */
  createOutcome?: CreateNoticeOutcome
}

type SubmitBanner = "network_error" | "forbidden" | null

export function NoticeCreatePage({ createOutcome }: NoticeCreatePageProps) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [banner, setBanner] = useState<SubmitBanner>(null)

  const handleSubmit = async () => {
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setBanner(null)

    const outcome = await mockCreateNotice(createOutcome ?? "success")
    setIsSubmitting(false)

    if (outcome === "success") {
      void navigate({
        to: "/notices",
        search: { publishOutcome: "success" },
      })
      return
    }

    setBanner(outcome)
  }

  return (
    <section className="flex max-w-[720px] flex-col gap-(--umc-spacing-gap-24)">
      <div className="flex flex-col gap-(--umc-spacing-gap-12)">
        <TextFieldBox label="제목" placeholder="공지 제목을 입력해 주세요" />
        <TextArea label="본문" placeholder="공지 내용을 입력해 주세요" />
      </div>

      {banner === "network_error" ? (
        <div
          className="flex min-h-11 w-full items-center gap-(--umc-spacing-gap-8) rounded-(--umc-radius-14) bg-[var(--umc-toast-error-bg,#fed7d7)] py-(--umc-spacing-padding-12) pr-(--umc-spacing-padding-16) pl-[14px] shadow-[0_4px_16px_rgba(64,68,67,0.16)]"
          role="alert"
        >
          <CheckCircleIcon
            aria-hidden
            className="shrink-0 text-[var(--umc-color-icon-error,#dc3d3d)]"
            size={24}
            weight="fill"
          />
          <p className="text-label-3-medium min-w-0 flex-1 text-[var(--umc-color-red-700,#a60303)]">
            공지를 등록하지 못했어요. 다시 시도해 주세요
          </p>
        </div>
      ) : null}

      {banner === "forbidden" ? (
        <div
          className="flex min-h-11 w-full items-center gap-(--umc-spacing-gap-8) rounded-(--umc-radius-14) bg-[rgba(63,65,65,0.8)] py-(--umc-spacing-padding-12) pr-(--umc-spacing-padding-16) pl-[14px] shadow-[0_4px_16px_rgba(64,68,67,0.16)]"
          role="status"
        >
          <WarningIcon
            aria-hidden
            className="shrink-0 text-[var(--umc-color-icon-warning,#f59e0b)]"
            size={24}
            weight="fill"
          />
          <p className="text-label-3-medium min-w-0 flex-1 text-white">
            공지 등록 권한이 없어요
          </p>
        </div>
      ) : null}

      <div className="flex items-center justify-end gap-(--umc-spacing-gap-12)">
        <Button
          color="neutral"
          disabled={isSubmitting}
          onClick={() => {
            void navigate({ to: "/notices" })
          }}
          size="xs"
          type="button"
          variant="weak"
        >
          취소
        </Button>
        <Button
          color="primary"
          disabled={isSubmitting}
          onClick={() => {
            void handleSubmit()
          }}
          size="xs"
          type="button"
          variant="fill"
        >
          {isSubmitting ? "등록 중..." : "등록하기"}
        </Button>
      </div>
    </section>
  )
}
