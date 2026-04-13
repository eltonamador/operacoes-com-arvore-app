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
    // Flag: garante que o estado inicial só é resolvido uma vez,
    // seja pelo onAuthStateChange ou pelo getSession (o que vier primeiro).
    let initialised = false

    async function resolveInitialState(s) {
      if (initialised) return
      let prof = null
      if (s?.user) {
        try {
          prof = await fetchProfile(s.user.id)
        } catch {
          prof = null
        }
      }
      // Verifica de novo após o await — o outro caminho pode ter chegado primeiro
      if (!initialised) {
        initialised = true
        setSession(s)
        setProfile(prof)
        setLoading(false)
      }
    }

    // Caminho 1: onAuthStateChange — dispara com INITIAL_SESSION na inicialização
    // e com SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED nas trocas subsequentes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!initialised) {
          // Primeira resolução: delegar para resolveInitialState
          await resolveInitialState(newSession)
        } else {
          // Mudanças subsequentes: login, logout, refresh de token
          let prof = null
          if (newSession?.user) {
            try {
              prof = await fetchProfile(newSession.user.id)
            } catch {
              prof = null
            }
          }
          setSession(newSession)
          setProfile(prof)
        }
      }
    )

    // Caminho 2: getSession — fallback caso onAuthStateChange demore ou
    // fetchProfile trave. Também resolve em .then() (não só em .catch()).
    supabase.auth.getSession()
      .then(({ data: { session: s } }) => resolveInitialState(s))
      .catch(() => {
        if (!initialised) {
          initialised = true
          setLoading(false)
        }
      })

    return () => subscription.unsubscribe()
  }, [])

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
