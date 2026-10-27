import type { PartTagPart, RoleTagColor } from "@umc-product/react"

export type MemberRegion = "seoul" | "gyeonggi" | "chungcheong"

export type MemberSchool = "cau" | "snu" | "yonsei"

export type MemberPartFilter = PartTagPart

export type MemberStatus = "active"

export type PointsMember = {
  id: string
  name: string
  nickname: string
  school: MemberSchool
  schoolLabel: string
  region: MemberRegion
  part: PartTagPart
  generation: string
  role: RoleTagColor
  roleLabel: string
  status: MemberStatus
  /** 상벌점 API 경로에 쓰는 챌린저 id. 목록 검색 결과에서 채운다. */
  challengerId?: number | null
  /** 프로필에 보일 지부명. 없으면 region 라벨을 쓴다. */
  regionLabel?: string
  /** 프로필에 보일 파트명. 없으면 파트 태그 라벨을 쓴다. */
  partLabel?: string
}
