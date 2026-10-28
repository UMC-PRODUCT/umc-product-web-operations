import { cn } from "@/shared/lib/cn"

import { ProfileAvatar } from "./ProfileAvatar"

export type ProfileDropdownGisuOption = {
  value: string
  label: string
  year?: string
}

export type ProfileDropdownProps = {
  id?: string
  name: string
  schoolName: string
  roleLabel: string
  profileImageUrl?: string | null
  gisuOptions: readonly ProfileDropdownGisuOption[]
  selectedGisuId: string | null
  onSelectGisu: (gisuId: string) => void
  onLogout: () => void
  className?: string
}

/**
 * Figma `프로필 드롭다운` (4958:40801)
 * 하단 액션은 로그아웃만 노출한다.
 */
export function ProfileDropdown({
  id,
  name,
  schoolName,
  roleLabel,
  profileImageUrl = null,
  gisuOptions,
  selectedGisuId,
  onSelectGisu,
  onLogout,
  className,
}: ProfileDropdownProps) {
  return (
    <div
      className={cn(
        "relative flex w-[202px] items-start rounded-[6px] bg-white px-[12px] pt-[18px] pb-[14px]",
        "shadow-[0_4px_16px_rgba(64,68,67,0.16)]",
        className,
      )}
      id={id}
      role="menu"
    >
      <div className="relative flex w-[178px] shrink-0 flex-col items-start gap-[12px]">
        <div className="relative flex shrink-0 flex-col items-start gap-[10px]">
          <div className="relative flex shrink-0 items-center px-[10px]">
            <ProfileAvatar alt="" imageUrl={profileImageUrl} size={46} />
          </div>

          <div className="relative flex shrink-0 items-start gap-[16px] px-[10px]">
            <div className="relative flex shrink-0 flex-col items-start gap-[4px] leading-[1.5] whitespace-nowrap">
              <p className="relative shrink-0 text-[16px] font-semibold tracking-[-0.16px] text-[#161919]">
                {name}
              </p>
              <p className="relative shrink-0 text-[12px] font-medium text-[#6f7878]">
                {schoolName}
              </p>
            </div>
            <span className="relative flex shrink-0 items-center justify-center rounded-[6px] bg-[#e1f4f1] px-[8px] py-[3px] shadow-[0_4px_16px_rgba(236,238,238,0.52)]">
              <span className="relative shrink-0 text-center text-[14px] leading-[1.45] font-medium whitespace-nowrap text-[#0b6b64]">
                {roleLabel}
              </span>
            </span>
          </div>
        </div>

        <div className="relative flex w-full shrink-0 flex-col items-start gap-[8px]">
          <Divider />
          <div className="relative flex w-full shrink-0 flex-col items-start gap-[2px] px-[10px]">
            <div className="relative flex shrink-0 items-center justify-center px-[6px] py-[2px]">
              <span className="relative shrink-0 text-[11px] leading-[1.6] font-medium tracking-[-0.22px] whitespace-nowrap text-[#9ca3a3]">
                기수 변경
              </span>
            </div>

            <div className="relative flex w-full shrink-0 flex-col items-start gap-[2px] overflow-hidden rounded-[10px] border border-solid border-[#f6f7f7] bg-white p-[2px]">
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

        <Divider />

        <div className="relative flex shrink-0 flex-col items-start px-[6px]">
          <button
            className="relative flex shrink-0 cursor-pointer items-center justify-center rounded-[6px] px-[4px] py-[2px] text-[14px] leading-[1.5] font-medium tracking-[-0.14px] whitespace-nowrap text-[#db3939] transition-colors hover:bg-[#fef2f1] active:bg-[#fee2e2]"
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
      className="relative h-0 w-[177px] shrink-0 border-t border-[#f6f7f7]"
    />
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
        className="relative flex h-[26px] w-full shrink-0 flex-col items-start justify-center rounded-[8px] bg-[#f4fbfa] py-[4px] pr-[8px] pl-[6px]"
        onClick={onSelect}
        role="menuitemradio"
        type="button"
      >
        <span className="relative flex w-full shrink-0 items-center justify-between">
          <span className="relative flex size-[16px] shrink-0 items-center justify-center">
            <GisuCheckIcon />
          </span>
          <span className="relative flex min-w-0 flex-1 items-center justify-between pl-[2px] leading-[0] whitespace-nowrap">
            <span className="relative shrink-0 text-[12px] leading-[1.5] font-medium text-[#0b6b64]">
              {label}
            </span>
            {year ? (
              <span className="relative shrink-0 text-right text-[9px] leading-[1.6] font-medium tracking-[-0.18px] text-[#0e8179]">
                {year}
              </span>
            ) : null}
          </span>
        </span>
      </button>
    )
  }

  return (
    <button
      aria-checked={false}
      className="relative flex h-[26px] w-full shrink-0 flex-col items-start justify-center rounded-[8px] bg-white py-[4px] pr-[8px] pl-[12px]"
      onClick={onSelect}
      role="menuitemradio"
      type="button"
    >
      <span className="relative flex w-full shrink-0 items-center justify-between leading-[0] whitespace-nowrap">
        <span className="relative shrink-0 text-[12px] leading-[1.5] font-normal text-[#656b6b]">
          {label}
        </span>
        {year ? (
          <span className="relative shrink-0 text-right text-[9px] leading-[1.6] font-medium tracking-[-0.18px] text-[#d3d8d8]">
            {year}
          </span>
        ) : null}
      </span>
    </button>
  )
}

function GisuCheckIcon() {
  return (
    <svg
      aria-hidden
      fill="none"
      height={7.5}
      viewBox="0 0 9.5 7.5"
      width={9.5}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0.75 3.51924L3.55 6.75001L8.75 0.750012"
        stroke="#0E8179"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}
