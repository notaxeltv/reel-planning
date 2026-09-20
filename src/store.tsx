import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Reel, ReelStatus } from './types'

const STORAGE_KEY = 'reel-plan.reels.v1'

type Store = {
  reels: Reel[]
  addReel: (reel: Reel) => void
  updateReel: (id: string, patch: Partial<Reel>) => void
  deleteReel: (id: string) => void
  moveReel: (id: string, status: ReelStatus) => void
}

const StoreContext = createContext<Store | null>(null)

function persist(reels: Reel[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reels))
}

function isExampleReel(reel: Reel): boolean {
  return reel.id.startsWith('seed-')
}

function loadReels(): Reel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Reel[]
    if (!Array.isArray(parsed)) return []
    const cleaned = parsed.filter((reel) => !isExampleReel(reel))
    if (cleaned.length !== parsed.length) persist(cleaned)
    return cleaned
  } catch {
    return []
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [reels, setReels] = useState<Reel[]>(() => loadReels())

  const value = useMemo<Store>(() => {
    const commit = (next: Reel[]) => {
      setReels(next)
      persist(next)
    }

    return {
      reels,
      addReel: (reel) => commit([reel, ...reels]),
      updateReel: (id, patch) =>
        commit(
          reels.map((reel) =>
            reel.id === id
              ? { ...reel, ...patch, id, updatedAt: new Date().toISOString() }
              : reel,
          ),
        ),
      deleteReel: (id) => commit(reels.filter((reel) => reel.id !== id)),
      moveReel: (id, status) =>
        commit(
          reels.map((reel) =>
            reel.id === id
              ? { ...reel, status, updatedAt: new Date().toISOString() }
              : reel,
          ),
        ),
    }
  }, [reels])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore deve stare dentro StoreProvider')
  return ctx
}
