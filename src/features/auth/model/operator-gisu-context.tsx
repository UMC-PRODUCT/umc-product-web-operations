import { useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { activateActiveGisu } from "../api/gisu-command.api"
import { adminSessionQueryKey, adminSessionQueryOptions } from "../api/session"
import { gisuListQueryKey, gisuListQueryOptions } from "./gisu-list-query"

import type { GisuSummary } from "../api/gisu-api.types"

type OperatorGisuContextValue = {
  gisuOptions: { value: string; label: string }[]
  isLoading: boolean
  isSwitching: boolean
  selectedGisuId: number | null
  switchActiveGisu: (gisuId: number) => Promise<void>
}

const OperatorGisuContext = createContext<OperatorGisuContextValue | null>(null)

function resolveDefaultGisuId(
  gisus: GisuSummary[],
  sessionGisuId: number | null,
): number | null {
  if (gisus.length === 0) {
    return sessionGisuId
  }

  if (
    sessionGisuId != null &&
    gisus.some((gisu) => gisu.gisuId === sessionGisuId)
  ) {
    return sessionGisuId
  }

  const active = gisus.find((gisu) => gisu.isActive)
  if (active) {
    return active.gisuId
  }

  return gisus[0]?.gisuId ?? null
}

export function OperatorGisuProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const sessionQuery = useQuery(adminSessionQueryOptions())
  const gisuListQuery = useQuery(gisuListQueryOptions())
  const [selectedGisuId, setSelectedGisuIdState] = useState<number | null>(null)
  const [isSwitching, setIsSwitching] = useState(false)

  const gisus = useMemo(() => gisuListQuery.data ?? [], [gisuListQuery.data])
  const sessionGisuId = sessionQuery.data?.gisuId ?? null

  useEffect(() => {
    if (gisuListQuery.isPending || sessionQuery.isPending || isSwitching) {
      return
    }

    setSelectedGisuIdState((current) => {
      if (current != null && gisus.some((gisu) => gisu.gisuId === current)) {
        return current
      }
      return resolveDefaultGisuId(gisus, sessionGisuId)
    })
  }, [
    gisus,
    gisuListQuery.isPending,
    isSwitching,
    sessionGisuId,
    sessionQuery.isPending,
  ])

  const switchActiveGisu = useCallback(
    async (gisuId: number) => {
      if (!Number.isFinite(gisuId)) {
        return
      }

      if (gisuId === selectedGisuId && sessionGisuId === gisuId) {
        return
      }

      const previousGisuId = selectedGisuId ?? sessionGisuId
      setSelectedGisuIdState(gisuId)
      setIsSwitching(true)

      try {
        await activateActiveGisu(gisuId)
        await queryClient.invalidateQueries({ queryKey: adminSessionQueryKey })
        await queryClient.invalidateQueries({ queryKey: gisuListQueryKey })
        await queryClient.invalidateQueries({ queryKey: ["notices"] })
      } catch (error) {
        setSelectedGisuIdState(previousGisuId)
        throw error
      } finally {
        setIsSwitching(false)
      }
    },
    [queryClient, selectedGisuId, sessionGisuId],
  )

  const gisuOptions = useMemo(
    () =>
      gisus.map((gisu) => ({
        value: String(gisu.gisuId),
        label: `${gisu.generation}기`,
      })),
    [gisus],
  )

  const value = useMemo(
    (): OperatorGisuContextValue => ({
      gisuOptions,
      isLoading: gisuListQuery.isPending || sessionQuery.isPending,
      isSwitching,
      selectedGisuId,
      switchActiveGisu,
    }),
    [
      gisuListQuery.isPending,
      gisuOptions,
      isSwitching,
      selectedGisuId,
      sessionQuery.isPending,
      switchActiveGisu,
    ],
  )

  return (
    <OperatorGisuContext.Provider value={value}>
      {children}
    </OperatorGisuContext.Provider>
  )
}

export function useOperatorGisu() {
  const context = useContext(OperatorGisuContext)
  if (!context) {
    throw new Error("useOperatorGisu must be used within OperatorGisuProvider")
  }
  return context
}
