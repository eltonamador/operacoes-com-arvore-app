import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, nome, numero_ordem')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('AuthContext: erro ao buscar perfil', error.message)
      return null
    }
    return data
  }

  useEffect(() => {
    let initialised = false

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        // Fetch profile BEFORE setting state so that session and profile
        // are always updated together in the same render cycle.
        // This prevents ProtectedRoute from seeing session!=null + role==null
        // and incorrectly redirecting to / during the profile fetch window.
        let prof = null
        if (newSession?.user) {
          prof = await fetchProfile(newSession.user.id)
        }

        // React 18 automatic batching ensures these three setState calls
        // produce a single re-render, avoiding the race condition.
        setSession(newSession)
        setProfile(prof)
        if (!initialised) {
          initialised = true
          setLoading(false)
        }
      }
    )

    // Fallback: if onAuthStateChange never fires (edge case / network failure),
    // getSession ensures loading is resolved so the app does not hang forever.
    supabase.auth.getSession().catch(() => {
      if (!initialised) {
        initialised = true
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // useCallback makes signIn and signOut stable references across renders,
  // which is required for useMemo below to work correctly.
  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      signIn,
      signOut,
      role: profile?.role ?? null,
      displayName: profile?.nome ?? null,
      numeroOrdem: profile?.numero_ordem ?? null,
    }),
    [session, profile, loading, signIn, signOut]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
