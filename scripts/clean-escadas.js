import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

function loadEnv() {
  const envPath = resolve(ROOT, '.env')
  const lines = readFileSync(envPath, 'utf-8').split('\n')
  const env = {}
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1)
  }
  return env
}

const MODULE_ID = 'escadas'

async function main() {
  const env = loadEnv()
  const supabaseUrl = env.VITE_SUPABASE_URL
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY
  const supabase = createClient(supabaseUrl, supabaseKey)

  console.log('Buscando todos os registros de escadas...')
  const { data: getAll, error: e1 } = await supabase
    .from('avaliacoes')
    .select('id, numero_ordem, created_at')
    .eq('module_id', MODULE_ID)
    .order('created_at', { ascending: false }) // os mais recentes primeiro

  if (e1) {
    console.error('Erro na busca inicial:', e1)
    return
  }

  console.log(`Encontrados ${getAll.length} registros totais de escadas.`)

  const groups = {}
  for (const row of getAll) {
    if (!groups[row.numero_ordem]) {
      groups[row.numero_ordem] = []
    }
    groups[row.numero_ordem].push(row)
  }

  const idsToDelete = []

  // para cada aluno, manter o primeiro (mais recente) e deletar o restante
  for (const [numero, rows] of Object.entries(groups)) {
    if (rows.length > 1) {
      // Pula o primeiro (index 0)
      for (let i = 1; i < rows.length; i++) {
        idsToDelete.push(rows[i].id)
      }
    }
  }

  console.log(`Identificados ${idsToDelete.length} registros duplicados antigos para excluir.`)

  if (idsToDelete.length > 0) {
    // Delete in chunks
    const chunkSize = 200
    for (let i = 0; i < idsToDelete.length; i += chunkSize) {
      const chunk = idsToDelete.slice(i, i + chunkSize)
      const { error: delErr } = await supabase
        .from('avaliacoes')
        .delete()
        .in('id', chunk)
      
      if (delErr) {
        console.error('Erro ao deletar chunk:', delErr)
      } else {
        console.log(`Deletados ${chunk.length} IDs com sucesso.`)
      }
    }
    console.log('Finalizado com sucesso.')
  } else {
    console.log('Nenhuma duplicidade encontrada.')
  }
}

main()
