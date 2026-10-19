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
}
