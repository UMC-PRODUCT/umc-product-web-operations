import type { NoticePart } from "../api/notice-api.types"

export const NOTICE_PART_LABELS: Record<NoticePart, string> = {
  PLAN: "Plan",
  DESIGN: "Design",
  WEB: "Web",
  ANDROID: "Android",
  IOS: "iOS",
  NODEJS: "Node.js",
  SPRINGBOOT: "SpringBoot",
  ADMIN: "Admin",
  WEB_PRODUCT_ENGINEER: "Web PE",
  MOBILE_PRODUCT_ENGINEER: "Mobile PE",
}

export const NOTICE_PART_SELECT_OPTIONS: {
  label: string
  value: NoticePart
}[] = (Object.entries(NOTICE_PART_LABELS) as [NoticePart, string][]).map(
  ([value, label]) => ({ value, label }),
)
