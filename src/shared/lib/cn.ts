import { shadowUtilities, textStyleUtilities } from "@umc-product/design-tokens"
import { type ClassValue, clsx } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [...textStyleUtilities],
      shadow: [...shadowUtilities],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
