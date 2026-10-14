import { Link } from "@tanstack/react-router"

import type { LinkComponentProps } from "@umc-product/react"

/** Design System LinkProvider용 TanStack Router 어댑터 */
export function RouterLink({ href, ...rest }: LinkComponentProps) {
  return <Link to={href} {...rest} />
}
