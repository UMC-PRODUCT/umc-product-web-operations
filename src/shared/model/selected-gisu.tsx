import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

import {
  activateActiveGisu,
  adminSessionQueryKey,
  adminSessionQueryOptions,
} from "@/features/auth"
import { fetchGisuList } from "@/shared/api/gisu-list"

import type { ReactNode } from "react"

type GisuOption = {
  value: string
  label: string
}

type SelectedGisuContextValue = {
  gisuId: number | null
  generation: number | null
  options: GisuOption[]
  selectedValue: string | null
  setGisuId: (gisuId: string) => void
  isPending: boolean
  isError: boolean
  isSwitching: boolean
}

const SelectedGisuContext = createContext<SelectedGisuContextValue | null>(null)

export function SelectedGisuProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const gisuQuery = useQuery({
    queryKey: ["gisu", "list"],
    queryFn: fetchGisuList,
    retry: false,
    staleTime: 60_000,
  })
  const sessionQuery = useQuery(adminSessionQueryOptions())
  const [overrideId, setOverrideId] = useState<string | null>(null)
  const [isSwitching, setIsSwitching] = useState(false)

  const setGisuId = useCallback(
    (gisuId: string) => {
      const parsed = Number(gisuId)
      if (!Number.isFinite(parsed)) {
        return
      }

      const previousOverrideId = overrideId
      setOverrideId(gisuId)
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
          setOverrideId(previousOverrideId)
        } finally {
          setIsSwitching(false)
        }
      })()
    },
    [overrideId, queryClient],
  )

  const value = useMemo<SelectedGisuContextValue>(() => {
    const items = gisuQuery.data ?? []
    const selected =
      items.find((item) => String(item.gisuId) === overrideId) ??
      items.find((item) => item.isActive) ??
      items[0] ??
      null

    return {
      gisuId: selected?.gisuId ?? null,
      generation: selected?.generation ?? null,
      options: items.map((item) => ({
        value: String(item.gisuId),
        label: `${item.generation}기`,
      })),
      selectedValue: selected == null ? null : String(selected.gisuId),
      setGisuId,
      isPending: gisuQuery.isPending || sessionQuery.isPending,
      isError: gisuQuery.isError,
      isSwitching,
    }
  }, [
    gisuQuery.data,
    gisuQuery.isError,
    gisuQuery.isPending,
    isSwitching,
    overrideId,
    sessionQuery.isPending,
    setGisuId,
  ])

  return (
    <SelectedGisuContext.Provider value={value}>
      {children}
    </SelectedGisuContext.Provider>
  )
}

export function useSelectedGisu() {
  const value = useContext(SelectedGisuContext)
  if (value == null) {
    throw new Error("SelectedGisuProvider가 필요합니다.")
  }
  return value
}
