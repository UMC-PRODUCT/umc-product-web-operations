import type {
  MemberPartFilter,
  MemberRegion,
  MemberSchool,
  PointsMember,
} from "./types"

type FilterMembersParams = {
  members: PointsMember[]
  region: MemberRegion | null
  school: MemberSchool | null
  part: MemberPartFilter | null
  query: string
}

export function filterMembers({
  members,
  region,
  school,
  part,
  query,
}: FilterMembersParams): PointsMember[] {
  const normalizedQuery = query.trim().toLowerCase()

  return members.filter((member) => {
    if (region != null && member.region !== region) return false
    if (school != null && member.school !== school) return false
    if (part != null && member.part !== part) return false
    if (!normalizedQuery) return true

    return (
      member.name.toLowerCase().includes(normalizedQuery) ||
      member.nickname.toLowerCase().includes(normalizedQuery)
    )
  })
}
