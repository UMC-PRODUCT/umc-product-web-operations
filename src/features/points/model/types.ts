import type { PartTagPart, RoleTagColor } from "@umc-product/react"

import type { MemberSearchPart } from "../api/member-search"

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
  /** API 원본 파트. 11기 미만 색·라벨 매핑에 사용 */
  sourcePart?: MemberSearchPart | null
  generation: string
  /** 기수 숫자. 11기 미만 레거시 파트 표시 판별용 */
  generationNumber: number | null
  role: RoleTagColor
  roleLabel: string
  status: MemberStatus
  /** 상벌점 API 경로에 쓰는 챌린저 id. 목록 검색 결과에서 채운다. */
  challengerId?: number | null
  /** 프로필에 보일 지부명. 없으면 region 라벨을 쓴다. */
  regionLabel?: string
  /**
   * API 파트 표시명 (Web, Node.js 등).
   * 11기 미만 테이블·프로필에서 그대로 쓴다.
   */
  partLabel?: string
}
