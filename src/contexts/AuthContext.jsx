import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function fetchProfile(userId) {
    const { data, error } = await supabase
      .from('profiles')
      .select('role, display_name')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('AuthContext: erro ao buscar perfil', error.message)
      return null
    }
    return data
  }

  useEffect(() => {
    // Recover existing session on mount
    supabase.auth.getSession().then(async ({ data: { session: existingSession } }) => {
      setSession(existingSession)
      if (existingSession?.user) {
        const prof = await fetchProfile(existingSession.user.id)
        setProfile(prof)
      }
      setLoading(false)
    })

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession)
        if (newSession?.user) {
          const prof = await fetchProfile(newSession.user.id)
          setProfile(prof)
        } else {
          setProfile(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  const value = {
    session,
    profile,
    loading,
    signIn,
    signOut,
    role: profile?.role ?? null,
    displayName: profile?.display_name ?? null,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
