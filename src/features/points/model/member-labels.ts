const PART_LABELS: Record<string, string> = {
  pm: "PM",
  design: "Design",
  "web-pe": "Web",
  "mobile-pe": "Mobile",
}

export function getPartLabel(part: string): string {
  return PART_LABELS[part] ?? part
}
