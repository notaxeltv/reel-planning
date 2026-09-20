import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useAuth } from './auth'
import { fromRow, toRow, type ReelRow } from './lib/reels'
import { requireSupabase } from './lib/supabase'
import type { Reel, ReelStatus } from './types'

type Access = 'loading' | 'denied' | 'ready'

type Store = {
  reels: Reel[]
  access: Access
  error: string | null
  connected: boolean
  addReel: (reel: Reel) => void
  updateReel: (id: string, patch: Partial<Reel>) => void
  deleteReel: (id: string) => void
  moveReel: (id: string, status: ReelStatus) => void
  reload: () => void
}

const StoreContext = createContext<Store | null>(null)

function upsert(list: Reel[], reel: Reel): Reel[] {
  const index = list.findIndex((item) => item.id === reel.id)
  if (index === -1) return [reel, ...list]
  const next = [...list]
  next[index] = reel
  return next
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const userId = session?.user.id
  const [reels, setReels] = useState<Reel[]>([])
  const [access, setAccess] = useState<Access>('loading')
  const [error, setError] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [nonce, setNonce] = useState(0)

  const reload = useCallback(() => setNonce((value) => value + 1), [])

  useEffect(() => {
    if (!userId) return
    const client = requireSupabase()
    let cancelled = false

    async function load() {
      setAccess('loading')
      setError(null)
      const member = await client.rpc('is_board_member')
      if (cancelled) return
      if (member.error) {
        setAccess('denied')
        setError(member.error.message)
        return
      }
      if (!member.data) {
        setReels([])
        setAccess('denied')
        return
      }

      const { data, error: loadError } = await client
        .from('reels')
        .select('*')
        .order('created_at', { ascending: false })
      if (cancelled) return
      if (loadError) {
        setAccess('denied')
        setError(loadError.message)
        return
      }
      setReels(((data ?? []) as ReelRow[]).map(fromRow))
      setAccess('ready')
    }

    void load()

    const channel = client
      .channel('reel-plan-board')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reels' },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            const id = (payload.old as { id?: string }).id
            if (id) setReels((current) => current.filter((reel) => reel.id !== id))
            return
          }
          const row = payload.new as ReelRow | null
          if (!row?.id) return
          setReels((current) => upsert(current, fromRow(row)))
        },
      )
      .subscribe((status) => {
        setConnected(status === 'SUBSCRIBED')
      })

    return () => {
      cancelled = true
      setConnected(false)
      void client.removeChannel(channel)
    }
  }, [userId, nonce])

  const value = useMemo<Store>(() => {
    const client = requireSupabase()

    const fail = (message: string, restore?: Reel[]) => {
      setError(message)
      if (restore) setReels(restore)
    }

    return {
      reels,
      access,
      error,
      connected,
      reload,
      addReel: (reel) => {
        const snapshot = reels
        setReels([reel, ...reels])
        setError(null)
        void client
          .from('reels')
          .insert(toRow(reel))
          .then(({ error: saveError }) => {
            if (saveError) fail(saveError.message, snapshot)
          })
      },
      updateReel: (id, patch) => {
        const snapshot = reels
        const updatedAt = new Date().toISOString()
        const next = reels.map((reel) =>
          reel.id === id ? { ...reel, ...patch, id, updatedAt } : reel,
        )
        const current = next.find((reel) => reel.id === id)
        setReels(next)
        setError(null)
        if (!current) return
        void client
          .from('reels')
          .update(toRow(current))
          .eq('id', id)
          .then(({ error: saveError }) => {
            if (saveError) fail(saveError.message, snapshot)
          })
      },
      deleteReel: (id) => {
        const snapshot = reels
        setReels(reels.filter((reel) => reel.id !== id))
        setError(null)
        void client
          .from('reels')
          .delete()
          .eq('id', id)
          .then(({ error: saveError }) => {
            if (saveError) fail(saveError.message, snapshot)
          })
      },
      moveReel: (id, status) => {
        const snapshot = reels
        const updatedAt = new Date().toISOString()
        setReels(
          reels.map((reel) => (reel.id === id ? { ...reel, status, updatedAt } : reel)),
        )
        setError(null)
        void client
          .from('reels')
          .update({ status, updated_at: updatedAt })
          .eq('id', id)
          .then(({ error: saveError }) => {
            if (saveError) fail(saveError.message, snapshot)
          })
      },
    }
  }, [access, connected, error, reels, reload])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore deve stare dentro StoreProvider')
  return ctx
}
