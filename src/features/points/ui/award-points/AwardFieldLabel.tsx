type AwardFieldLabelProps = {
  children: string
}

export function AwardFieldLabel({ children }: AwardFieldLabelProps) {
  return (
    <p className="text-label-4-medium text-neutral-medium-600 flex items-center gap-px px-1">
      <span>{children}</span>
      <span className="text-error">*</span>
    </p>
  )
}
