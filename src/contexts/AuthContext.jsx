import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId) {
    // Timeout de 5s: se a query ao Supabase demorar demais, retorna null
    // em vez de travar o boot do app indefinidamente.
    const PROFILE_TIMEOUT_MS = 5000

    const profilePromise = supabase
      .from('profiles')
      .select('role, nome, numero_ordem')
      .eq('id', userId)
      .single()

    try {
      const result = await Promise.race([
        profilePromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('fetchProfile timeout')), PROFILE_TIMEOUT_MS)
        ),
      ])

      if (result.error) {
        console.error('AuthContext: erro ao buscar perfil', result.error.message)
        return null
      }
      return result.data
    } catch (err) {
      console.warn('AuthContext: fetchProfile falhou ou excedeu timeout', err.message)
      return null
    }
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
      .catch((err) => {
        // Se getSession falhou, o token no localStorage provavelmente está
        // corrompido ou expirado sem possibilidade de refresh. Limpar tokens
        // para que o próximo carregamento comece limpo (sem necessidade de
        // o usuário limpar cache manualmente).
        console.warn('AuthContext: getSession falhou, limpando tokens corrompidos.', err?.message)
        try {
          const keysToRemove = []
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key && key.startsWith('sb-') && key.endsWith('-auth-token')) {
              keysToRemove.push(key)
            }
          }
          keysToRemove.forEach(k => localStorage.removeItem(k))
        } catch {
          // localStorage pode estar indisponível (modo privado, cheio, etc.)
        }

        if (!initialised) {
          initialised = true
          setLoading(false)
        }
      })

    // Caminho 3 (safety net): se nenhum dos caminhos anteriores resolveu em 8s,
    // forçar loading=false para desbloquear a UI. O usuário será redirecionado
    // para /login (sem session) em vez de ficar preso na tela preta.
    const SAFETY_TIMEOUT_MS = 8000
    const safetyTimer = setTimeout(() => {
      if (!initialised) {
        initialised = true
        console.warn('AuthContext: timeout de segurança atingido (' + SAFETY_TIMEOUT_MS + 'ms). Desbloqueando UI.')
        setSession(null)
        setProfile(null)
        setLoading(false)
      }
    }, SAFETY_TIMEOUT_MS)

    return () => {
      subscription.unsubscribe()
      clearTimeout(safetyTimer)
    }
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
