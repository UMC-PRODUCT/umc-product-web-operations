import { cn } from "@/shared/lib/cn"

type ProfileAvatarProps = {
  /** 프로필 이미지 URL. null/빈 값이면 Figma 임시 실루엣 */
  imageUrl?: string | null
  /** 원형 지름(px). 헤더 40, 드롭다운 46 */
  size?: 40 | 46
  className?: string
  alt?: string
}

/**
 * Figma `profile` — 원형 teal-grey-200 + 실루엣.
 * - 헤더 40: 실루엣 36 / top 7 (`.primitive/Web/Header/Profile`)
 * - 드롭다운 46: 실루엣 40 / top 8 (`profile`)
 * 이미지가 있으면 cover로 채운다.
 */
export function ProfileAvatar({
  imageUrl,
  size = 46,
  className,
  alt = "",
}: ProfileAvatarProps) {
  const trimmed = imageUrl?.trim() || null
  const silhouetteSize = size === 40 ? 36 : Math.round((40 / 46) * size)
  const silhouetteTop = size === 40 ? 7 : Math.round((8 / 46) * size)

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-full bg-[#e9ecec]",
        className,
      )}
      style={{ width: size, height: size }}
    >
      {trimmed ? (
        <img
          alt={alt}
          className="absolute inset-0 size-full object-cover"
          src={trimmed}
        />
      ) : (
        <div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2"
          style={{
            top: silhouetteTop,
            width: silhouetteSize,
            height: silhouetteSize,
          }}
        >
          <ProfileSilhouette />
        </div>
      )}
    </div>
  )
}

function ProfileSilhouette() {
  return (
    <svg
      aria-hidden
      className="block size-full"
      fill="none"
      viewBox="0 0 40 40"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 20C29.4742 20 33.7987 23.9947 35.8613 27.5146C37.0165 29.5042 37.7409 31.7985 37.9707 34.1953C37.9876 34.3851 37.9961 34.5237 37.9961 34.6104L38 34.6953V35C38 36.3259 37.5539 37.5975 36.7598 38.5352C35.9655 39.4728 34.8879 40 33.7646 40H6.23535C5.11208 40 4.03451 39.4728 3.24023 38.5352C2.44615 37.5975 2 36.3259 2 35V34.6152L2.0293 34.2002C2.25912 31.8034 2.98353 29.5091 4.13867 27.5195C6.20133 23.9946 10.5259 20 20 20ZM19.8906 0C24.8612 0 28.8906 4.02944 28.8906 9C28.8906 13.9706 24.8612 18 19.8906 18C14.9201 18 10.8906 13.9706 10.8906 9C10.8906 4.02944 14.9201 0 19.8906 0Z"
        fill="#656B6B"
      />
    </svg>
  )
}
