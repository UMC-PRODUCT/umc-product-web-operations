import type { MemberRegion } from "./types"

const REGION_LABELS: Record<MemberRegion, string> = {
  seoul: "서울 지부",
  gyeonggi: "경기 지부",
  chungcheong: "충청 지부",
}

const PART_LABELS: Record<string, string> = {
  pm: "PM",
  design: "Design",
  "web-pe": "Web",
  "mobile-pe": "Mobile",
}

export function getRegionLabel(region: MemberRegion): string {
  return REGION_LABELS[region]
}

export function getPartLabel(part: string): string {
  return PART_LABELS[part] ?? part
}
