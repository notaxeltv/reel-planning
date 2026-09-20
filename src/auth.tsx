import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { authMessage } from './lib/reels'
import { isSupabaseConfigured, supabase } from './lib/supabase'

type Auth = {
  configured: boolean
  loading: boolean
  session: Session | null
  email: string | null
  signIn: (email: string, password: string) => Promise<string | null>
  signUp: (email: string, password: string) => Promise<string | null>
  signOut: () => Promise<void>
}

const AuthContext = createContext<Auth | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setLoading(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
    })

    return () => {
      active = false
      data.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<Auth>(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      session,
      email: session?.user.email ?? null,
      signIn: async (email, password) => {
        if (!supabase) return 'Supabase non è configurato.'
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return error ? authMessage(error.message) : null
      },
      signUp: async (email, password) => {
        if (!supabase) return 'Supabase non è configurato.'
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) return authMessage(error.message)
        if (!data.session) {
          return 'Account creato. Se non entri subito, disattiva “Confirm email” in Supabase Auth e riprova ad accedere.'
        }
        return null
      },
      signOut: async () => {
        await supabase?.auth.signOut()
      },
    }),
    [loading, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): Auth {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve stare dentro AuthProvider')
  return ctx
}
