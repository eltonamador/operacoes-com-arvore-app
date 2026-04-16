/**
 * Seed script — Importação retroativa das notas de escadas (CFSD-26)
 *
 * Uso:
 *   node scripts/seed-escadas.js --dry-run   (default — apenas log, não grava)
 *   node scripts/seed-escadas.js --execute    (grava no Supabase)
 *
 * Pré-requisito: arquivo .env na raiz do projeto com
 *   VITE_SUPABASE_URL=...
 *   VITE_SUPABASE_ANON_KEY=...
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

// ---------- Paths ----------
const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ---------- .env ----------
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

// ---------- CSV parser ----------
function parseCSV(filePath) {
  const raw = readFileSync(filePath, 'utf-8')
  const lines = raw.split('\n').filter(l => l.trim())

  // Skip header
  const records = []
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(';')
    if (parts.length < 2) continue

    const numero_ordem = parts[0].trim()
    // Brazilian decimal: "9,60" → 9.60
    const nota_final = parseFloat(parts[1].trim().replace(',', '.'))

    if (!numero_ordem || isNaN(nota_final)) {
      console.warn(`  [SKIP] Linha ${i + 1}: parse inválido → "${lines[i]}"`)
      continue
    }

    records.push({ numero_ordem, nota_final })
  }
  return records
}

// ---------- Students lookup ----------
function loadStudents() {
  const studentsPath = resolve(ROOT, 'src', 'modules', 'shared', 'data', 'students.json')
  const data = JSON.parse(readFileSync(studentsPath, 'utf-8'))
  const map = new Map()
  for (const s of data.students) {
    map.set(String(s.numero), { nome: s.nome, pelotao: s.pelotao || null })
  }
  return map
}

// ---------- Constants ----------
const MODULE_ID = 'escadas'
const NOTA_MINIMA = 7.0

// ---------- Main ----------
async function main() {
  const args = process.argv.slice(2)
  const execute = args.includes('--execute')
  const csvArg = args.find(a => a.endsWith('.csv'))
  const csvPath = csvArg
    ? resolve(csvArg)
    : resolve(ROOT, '..', '..', 'Notas_Geral', 'notas_de_escadas_CSV_correto.csv')

  console.log('='.repeat(60))
  console.log(`  SEED ESCADAS — ${execute ? '⚡ EXECUÇÃO REAL' : '🔍 DRY-RUN (nada será gravado)'}`)
  console.log('='.repeat(60))
  console.log(`  CSV:       ${csvPath}`)
  console.log(`  module_id: ${MODULE_ID}`)
  console.log()

  // 1. Env + Supabase
  const env = loadEnv()
  const supabaseUrl = env.VITE_SUPABASE_URL
  const supabaseKey = env.VITE_SUPABASE_ANON_KEY
  if (!supabaseUrl || !supabaseKey) {
    console.error('ERRO: VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY ausente no .env')
    process.exit(1)
  }
  const supabase = createClient(supabaseUrl, supabaseKey)

  // 2. Parse CSV
  const records = parseCSV(csvPath)
  console.log(`  CSV parseado: ${records.length} registros`)

  // 3. Load students
  const studentsMap = loadStudents()
  console.log(`  Students.json: ${studentsMap.size} alunos`)
  console.log()

  // 4. Check existing records in Supabase
  console.log('  Verificando registros existentes no Supabase...')
  const { data: existing, error: fetchErr } = await supabase
    .from('avaliacoes')
    .select('id, numero_ordem')
    .eq('module_id', MODULE_ID)

  if (fetchErr) {
    console.error('ERRO ao consultar Supabase:', fetchErr.message)
    process.exit(1)
  }

  const existingMap = new Map((existing || []).map(r => [String(r.numero_ordem), r.id]))
  console.log(`  Registros existentes (${MODULE_ID}): ${existingMap.size}`)
  console.log()

  // 5. Process records
  let inserted = 0
  let duplicates = 0
  let errors = 0
  let notFound = 0

  for (const rec of records) {
    const numOrdem = String(rec.numero_ordem)
    const student = studentsMap.get(numOrdem)

    if (!student) {
      notFound++
      console.warn(`  [NOT FOUND] Nº ${numOrdem} não encontrado em students.json — usando fallback`)
    }

    const existingId = existingMap.get(numOrdem)

    const resultado = rec.nota_final >= NOTA_MINIMA ? 'APROVADO' : 'REPROVADO'

    const row = {
      nome_aluno: student?.nome || `Aluno Nº${numOrdem}`,
      numero_ordem: numOrdem,
      pelotao: student?.pelotao || null,
      avaliador: 'Importação retroativa',
      data_avaliacao: null,
      nota_final: rec.nota_final,
      penalidades: null,
      observacoes: 'Nota lançada retroativamente via importação de planilha',
      itens_avaliados: {
        resultado,
        importacao_retroativa: true,
      },
      module_id: MODULE_ID,
    }

    if (existingId) {
      duplicates++ // vamos reutilizar a contagem 'duplicates' como 'atualizados'
      if (execute) {
        const { error: updateErr } = await supabase
          .from('avaliacoes')
          .update(row)
          .eq('id', existingId)

        if (updateErr) {
          errors++
          console.error(`  [ERROR UPDATE] Nº ${numOrdem}: ${updateErr.message}`)
        } else {
          console.log(`  [UPDATE] Nº ${numOrdem} — ${row.nome_aluno} — atualizado para ${rec.nota_final} — ${resultado}`)
        }
      } else {
        console.log(`  [DRY-RUN UPDATE] Nº ${numOrdem} — ${row.nome_aluno} — atualizar para ${rec.nota_final} — ${resultado}`)
      }
    } else {
      if (execute) {
        const { error: insertErr } = await supabase
          .from('avaliacoes')
          .insert([row])

        if (insertErr) {
          errors++
          console.error(`  [ERROR INSERT] Nº ${numOrdem}: ${insertErr.message}`)
        } else {
          inserted++
          console.log(`  [INSERT] Nº ${numOrdem} — ${row.nome_aluno} — ${rec.nota_final} — ${resultado}`)
        }
      } else {
        inserted++
        console.log(`  [DRY-RUN INSERT] Nº ${numOrdem} — ${row.nome_aluno} — ${rec.nota_final} — ${resultado}`)
      }
    }
  }

  // 6. Summary
  console.log()
  console.log('='.repeat(60))
  console.log('  RESUMO')
  console.log('='.repeat(60))
  console.log(`  Total no CSV:     ${records.length}`)
  console.log(`  ${execute ? 'Inseridos' : 'A inserir'}:     ${inserted}`)
  console.log(`  ${execute ? 'Atualizados' : 'A atualizar'}:   ${duplicates}`)
  console.log(`  Erros:            ${errors}`)
  console.log(`  Não encontrados:  ${notFound} (usaram fallback "Aluno NºX")`)
  console.log()

  if (!execute && (inserted > 0 || duplicates > 0)) {
    console.log('  ⚠  Modo dry-run — nenhum registro foi gravado/atualizado.')
    console.log('  Para gravar, execute: node scripts/seed-escadas.js --execute')
  } else if (execute && (inserted > 0 || duplicates > 0)) {
    console.log('  ✅ Importação concluída com sucesso.')
  } else if (execute && inserted === 0 && duplicates === 0) {
    console.log('  ℹ️  Nenhum registro encontrado no CSV.')
  }
  console.log()
}

main().catch(err => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
