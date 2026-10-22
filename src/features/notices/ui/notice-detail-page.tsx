import { useNavigate } from "@tanstack/react-router"
import { Button, Tag } from "@umc-product/react"

import { NoticeDetailBody } from "./notice-detail-body"
import { NoticeDetailImageGallery } from "./notice-detail-image-gallery"
import { NoticeDetailImageLoadToast } from "./notice-detail-image-load-toast"
import { NoticeDetailLinkCard } from "./notice-detail-link-card"
import { NoticeDetailMetaRow } from "./notice-detail-meta-row"
import { NoticeDetailVoteCard } from "./notice-detail-vote-card"
import { useNoticeDetailImageLoadFlow } from "./use-notice-detail-image-load-flow"

import type {
  NoticeDetail,
  NoticeImageLoadState,
} from "../model/notice-detail.types"

type NoticeDetailPageProps = {
  notice: NoticeDetail
  /** TODO: API 연동 시 제거. 브레드크럼 ↔ 본문 사이 인라인 토스트 */
  imageLoadState?: NoticeImageLoadState
}

/**
 * Figma Contents Area (516:12422) + 상세 콘텐츠 카드 (516:12424 / 580:14261)
 * — 브레드크럼·gap 32는 AdminContentsArea, 아래는 카드·목록으로 버튼
 */
export function NoticeDetailPage({
  notice,
  imageLoadState,
}: NoticeDetailPageProps) {
  const navigate = useNavigate()
  const { clearImageLoadSearch, startLoadImages } =
    useNoticeDetailImageLoadFlow({
      imageLoadState,
      noticeId: notice.id,
    })

  const createdMeta = `${notice.authorDisplay} · ${notice.createdAt}`

  return (
    <div className="flex w-full flex-col gap-(--umc-spacing-gap-32)">
      {imageLoadState ? (
        <NoticeDetailImageLoadToast
          onDismissSuccess={clearImageLoadSearch}
          onLoadImages={startLoadImages}
          state={imageLoadState}
        />
      ) : null}
      {/**패딩값 -40 만들어지면 32-> 40으로 변경 */}
      <article className="border-neutral-disabled flex w-full flex-col items-start gap-(--umc-spacing-gap-24) rounded-(--umc-radius-14) border bg-white p-(--umc-spacing-padding-32)">
        <div className="flex w-full items-start gap-(--umc-spacing-gap-20)">
          <div className="flex min-w-0 flex-1 flex-col gap-(--umc-spacing-gap-8)">
            {notice.required ? (
              <Tag
                className="w-fit px-[7px]"
                color="error"
                size="md"
                variant="weak"
              >
                필독
              </Tag>
            ) : null}
            <h1 className="text-heading-4-semibold text-neutral-default-900">
              {notice.title}
            </h1>
            <NoticeDetailMetaRow
              items={[
                {
                  label: "대상",
                  showDividerAfter: true,
                  value: notice.targetDisplay,
                },
                {
                  label: "작성",
                  showDividerAfter: true,
                  value: createdMeta,
                },
                {
                  label: "수정",
                  value: notice.updatedAt,
                },
              ]}
            />
          </div>
          <div className="flex shrink-0 items-start gap-(--umc-spacing-gap-12)">
            <Button
              color="white"
              size="sm"
              type="button"
              variant="fill"
              disabled={false}
              isLoading={false}
            >
              수정
            </Button>
            <Button
              color="white"
              size="sm"
              type="button"
              variant="fill"
              disabled={false}
              isLoading={false}
            >
              삭제
            </Button>
          </div>
        </div>

        <hr className="border-neutral-disabled m-0 w-full shrink-0 border-0 border-t" />

        <NoticeDetailBody body={notice.body} />

        <NoticeDetailImageGallery images={notice.images} variant="scroll" />

        {notice.link ? <NoticeDetailLinkCard link={notice.link} /> : null}

        {notice.poll ? <NoticeDetailVoteCard poll={notice.poll} /> : null}
      </article>

      <Button
        className="w-fit shrink-0"
        color="white"
        onClick={() => {
          void navigate({ to: "/notices" })
        }}
        size="xs"
        type="button"
        variant="fill"
        disabled={false}
        isLoading={false}
      >
        목록으로
      </Button>
    </div>
  )
}
