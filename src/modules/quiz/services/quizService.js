import { supabase } from '../../../lib/supabase'

export async function saveQuizAttempt(attempt) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .insert([attempt])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function fetchQuizRanking({ nivel, desde } = {}) {
  let query = supabase
    .from('quiz_attempts')
    .select('*')
    .order('pontuacao', { ascending: false })
    .order('percentual', { ascending: false })
    .order('tempo_total', { ascending: true })

  if (nivel && nivel !== 'misturado') {
    query = query.eq('nivel', nivel)
  }
  if (desde) {
    query = query.gte('created_at', desde)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function fetchQuizAttemptsByAluno(numero_ordem) {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .eq('numero_ordem', numero_ordem)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function fetchAllQuizAttempts() {
  const { data, error } = await supabase
    .from('quiz_attempts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}
