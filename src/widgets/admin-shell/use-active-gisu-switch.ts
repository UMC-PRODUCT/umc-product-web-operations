import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useState } from "react"

import { activateActiveGisu, adminSessionQueryKey } from "@/features/auth"

import type { SelectedGisuContextValue } from "@/shared/model/selected-gisu"

export function useActiveGisuSwitch(selectedGisu: SelectedGisuContextValue) {
  const queryClient = useQueryClient()
  const [isSwitching, setIsSwitching] = useState(false)

  const changeGeneration = useCallback(
    (gisuId: string) => {
      const parsed = Number(gisuId)
      if (!Number.isFinite(parsed)) {
        return
      }

      const previousValue = selectedGisu.selectedValue
      selectedGisu.setGisuId(gisuId)
      setIsSwitching(true)

      void (async () => {
        try {
          await activateActiveGisu(parsed)
          await queryClient.invalidateQueries({
            queryKey: adminSessionQueryKey,
          })
          await queryClient.invalidateQueries({ queryKey: ["gisu", "list"] })
          await queryClient.invalidateQueries({ queryKey: ["notices"] })
        } catch {
          if (previousValue != null) {
            selectedGisu.setGisuId(previousValue)
          }
        } finally {
          setIsSwitching(false)
        }
      })()
    },
    [queryClient, selectedGisu],
  )

  return {
    changeGeneration,
    isGenerationSwitcherDisabled: selectedGisu.isPending || isSwitching,
  }
}
