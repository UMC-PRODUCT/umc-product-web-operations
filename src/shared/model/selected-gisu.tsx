import { useQuery } from "@tanstack/react-query"
import { createContext, useContext, useMemo, useState } from "react"

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
}

const SelectedGisuContext = createContext<SelectedGisuContextValue | null>(null)

export type SelectedGisuProviderProps = {
  children: ReactNode
  /**
   * 프로필·기수 선택에 노출할 기수 ID.
   * - `undefined`: 전체 기수
   * - 배열: 해당 기수만 (참여 이력 필터)
   */
  allowedGisuIds?: readonly number[]
}

export function SelectedGisuProvider({
  children,
  allowedGisuIds,
}: SelectedGisuProviderProps) {
  const gisuQuery = useQuery({
    queryKey: ["gisu", "list"],
    queryFn: fetchGisuList,
    retry: false,
    staleTime: 60_000,
  })
  const [overrideId, setOverrideId] = useState<string | null>(null)

  const allowedIdSet = useMemo(() => {
    if (allowedGisuIds == null) {
      return null
    }
    return new Set(allowedGisuIds)
  }, [allowedGisuIds])

  const value = useMemo<SelectedGisuContextValue>(() => {
    const allItems = gisuQuery.data ?? []
    const items =
      allowedIdSet == null
        ? allItems
        : allItems.filter((item) => allowedIdSet.has(item.gisuId))

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
      setGisuId: setOverrideId,
      isPending: gisuQuery.isPending,
      isError: gisuQuery.isError,
    }
  }, [
    allowedIdSet,
    gisuQuery.data,
    gisuQuery.isError,
    gisuQuery.isPending,
    overrideId,
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

export type { SelectedGisuContextValue }
