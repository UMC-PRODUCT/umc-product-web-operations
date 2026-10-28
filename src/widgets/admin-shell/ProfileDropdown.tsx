import { RoleTag } from "@umc-product/react"

import { cn } from "@/shared/lib/cn"

import GisuCheckIcon from "./assets/gisu-check.svg?react"
import { ProfileAvatar } from "./ProfileAvatar"

import type { RoleTagColor } from "@umc-product/react"

export type ProfileDropdownGisuOption = {
  value: string
  label: string
  year?: string
}

export type ProfileDropdownProps = {
  id?: string
  /** 실명 */
  name: string
  /** 닉네임. 없으면 이름만 표시 */
  nickname?: string | null
  schoolName: string
  roleLabel: string
  roleColor?: RoleTagColor
  profileImageUrl?: string | null
  gisuOptions: readonly ProfileDropdownGisuOption[]
  selectedGisuId: string | null
  onSelectGisu: (gisuId: string) => void
  onLogout: () => void
  onAccountSettings?: () => void
  className?: string
}

/**
 * Figma `Web/Header/Profile Menu` (5641:88469 외 변형)
 *
 * 뼈대:
 * [padding 12/16, radius 10, Neutral Neutral_1]
 *   column gap-12
 *     profile: avatar → (닉네임/이름 + 학교) + RoleTag
 *     gisu: Divider → label → menu list
 *     Divider
 *     actions: 계정 설정 / 로그아웃
 */
export function ProfileDropdown({
  id,
  name,
  nickname = null,
  schoolName,
  roleLabel,
  roleColor = "challenger-super-admin",
  profileImageUrl = null,
  gisuOptions,
  selectedGisuId,
  onSelectGisu,
  onLogout,
  onAccountSettings,
  className,
}: ProfileDropdownProps) {
  const trimmedNickname = nickname?.trim() || null
  const hasGisuOptions = gisuOptions.length > 0
  const gisuSectionLabel = gisuOptions.length <= 1 ? "기수" : "기수 변경"

  return (
    <div
      className={cn(
        "relative flex w-max min-w-[191px] items-start rounded-[10px] bg-white px-3 py-4",
        "shadow-[0_4px_16px_0_#40444329]",
        className,
      )}
      id={id}
      role="menu"
    >
      <div className="relative flex w-full min-w-[167px] shrink-0 flex-col items-start gap-3">
        <div className="relative flex w-full shrink-0 flex-col items-start gap-2.5">
          <div className="relative flex shrink-0 items-center px-2.5">
            <ProfileAvatar alt="" imageUrl={profileImageUrl} size={46} />
          </div>

          <div className="relative flex w-full shrink-0 items-start gap-4 px-2.5">
            <div className="relative flex min-w-0 shrink-0 flex-col items-start gap-0.5 whitespace-nowrap">
              <div className="relative flex shrink-0 items-start gap-px text-[16px] leading-[1.45] tracking-[-0.16px] text-[#0f1010]">
                {trimmedNickname ? (
                  <>
                    <span className="font-semibold">{trimmedNickname}</span>
                    <span className="font-medium">/</span>
                    <span className="font-semibold">{name}</span>
                  </>
                ) : (
                  <span className="font-semibold">{name}</span>
                )}
              </div>
              <p className="relative shrink-0 text-[12px] leading-[1.3] font-medium text-[#7e7f7f]">
                {schoolName}
              </p>
            </div>

            <RoleTag className="shrink-0" color={roleColor} size="md">
              {roleLabel}
            </RoleTag>
          </div>
        </div>

        {hasGisuOptions ? (
          <div className="relative flex w-full shrink-0 flex-col items-start gap-2">
            <Divider />
            <div className="relative flex w-full shrink-0 flex-col items-start gap-0.5">
              <div className="relative flex shrink-0 items-center justify-center px-1 py-0.5">
                <span className="relative shrink-0 text-[12px] leading-[1.5] font-medium tracking-[-0.24px] whitespace-nowrap text-[#adadad]">
                  {gisuSectionLabel}
                </span>
              </div>

              <div className="relative flex w-full shrink-0 flex-col items-start rounded-[10px] border border-solid border-[#fbfcfc] bg-white p-0.5">
                {gisuOptions.map((option) => (
                  <GisuListItem
                    key={option.value}
                    label={option.label}
                    onSelect={() => {
                      onSelectGisu(option.value)
                    }}
                    selected={option.value === selectedGisuId}
                    year={option.year}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <Divider />

        <div className="relative flex shrink-0 flex-col items-start gap-2.5 px-1.5">
          <button
            className="relative flex h-[18px] w-16 shrink-0 cursor-pointer items-center text-[14px] leading-[1.35] font-medium whitespace-nowrap text-[#3f4141] transition-colors hover:text-[#0f1010]"
            onClick={onAccountSettings}
            role="menuitem"
            type="button"
          >
            계정 설정
          </button>
          <button
            className="relative flex h-[18px] w-16 shrink-0 cursor-pointer items-center text-[14px] leading-[1.35] font-medium whitespace-nowrap text-[#dc3d3d] transition-colors hover:text-[#a60303]"
            onClick={onLogout}
            role="menuitem"
            type="button"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  )
}

function Divider() {
  return (
    <div
      aria-hidden
      className="relative flex h-[0.5px] w-full shrink-0 flex-col items-start"
    >
      <div className="h-full min-h-[0.5px] w-full rounded-full bg-[#f7f8f8]" />
    </div>
  )
}

function GisuListItem({
  label,
  year,
  selected,
  onSelect,
}: {
  label: string
  year?: string
  selected: boolean
  onSelect: () => void
}) {
  if (selected) {
    return (
      <button
        aria-checked
        className="relative flex w-full shrink-0 items-center justify-between rounded-lg bg-[#f4fbfa] px-2 py-1 shadow-[inset_1px_1px_2px_0_rgba(211,216,216,0.1)]"
        onClick={onSelect}
        role="menuitemradio"
        type="button"
      >
        <span className="relative flex shrink-0 items-center gap-[3px]">
          <GisuCheckIcon aria-hidden className="size-4 shrink-0" />
          <span className="relative shrink-0 text-[14px] leading-[1.5] font-medium whitespace-nowrap text-[#02746c]">
            {label}
          </span>
        </span>
        {year ? (
          <span className="relative shrink-0 text-right text-[10px] leading-[1.5] font-medium whitespace-nowrap text-[#008a80]">
            {year}
          </span>
        ) : null}
      </button>
    )
  }

  return (
    <button
      aria-checked={false}
      className="relative flex w-full shrink-0 items-center justify-between rounded-lg bg-white py-1 pr-2 pl-3 transition-colors hover:bg-[#fbfcfc] hover:shadow-[inset_-1px_-1px_1px_0_rgba(255,255,255,0.25),inset_1px_1px_2px_0_rgba(211,216,216,0.15)]"
      onClick={onSelect}
      role="menuitemradio"
      type="button"
    >
      <span className="relative shrink-0 text-left text-[14px] leading-[1.5] font-normal whitespace-nowrap text-[#0f1010]">
        {label}
      </span>
      {year ? (
        <span className="relative shrink-0 text-right text-[10px] leading-[1.5] font-medium whitespace-nowrap text-[#adadad]">
          {year}
        </span>
      ) : null}
    </button>
  )
}
