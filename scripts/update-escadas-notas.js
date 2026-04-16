/**
 * Update script — Atualiza notas de escadas VC-1.1 (CFSD-26)
 *
 * Uso:
 *   node scripts/update-escadas-notas.js              (dry-run — apenas log, não grava)
 *   node scripts/update-escadas-notas.js --execute    (grava no Supabase)
 *
 * Pré-requisito: arquivo .env na raiz do projeto com
 *   VITE_SUPABASE_URL=...
 *   VITE_SUPABASE_ANON_KEY=...
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { createClient } from '@supabase/supabase-js'

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

// ---------- Dados VC-1.1 Escada (Pel, Nº → Nota) ----------
const NOTAS = [
  // 1º Pelotão
  { numero: 1,  nota: 9.6 },
  { numero: 2,  nota: 9.3 },
  { numero: 3,  nota: 9.2 },
  { numero: 4,  nota: 9.6 },
  { numero: 5,  nota: 9.6 },
  { numero: 6,  nota: 9.3 },
  { numero: 7,  nota: 9.0 },
  { numero: 8,  nota: 9.6 },
  { numero: 9,  nota: 9.3 },
  { numero: 10, nota: 7.9 },
  { numero: 11, nota: 9.6 },
  { numero: 12, nota: 7.9 },
  { numero: 13, nota: 7.9 },
  // 14 ausente
  { numero: 15, nota: 9.6 },
  { numero: 16, nota: 9.6 },
  { numero: 17, nota: 9.0 },
  { numero: 18, nota: 9.0 },
  { numero: 19, nota: 9.3 },
  { numero: 20, nota: 7.9 },
  { numero: 21, nota: 9.0 },
  { numero: 22, nota: 9.2 },
  { numero: 23, nota: 9.2 },
  { numero: 24, nota: 9.6 },
  { numero: 25, nota: 9.6 },
  { numero: 26, nota: 9.3 },
  { numero: 27, nota: 9.6 },
  { numero: 28, nota: 9.2 },
  { numero: 29, nota: 9.6 },
  { numero: 30, nota: 9.2 },
  { numero: 31, nota: 7.9 },
  { numero: 32, nota: 9.2 },
  { numero: 33, nota: 7.9 },
  { numero: 34, nota: 9.0 },
  { numero: 35, nota: 9.3 },
  { numero: 36, nota: 9.6 },
  { numero: 37, nota: 9.0 },
  // 2º Pelotão
  { numero: 38, nota: 9.4 },
  { numero: 39, nota: 9.4 },
  { numero: 40, nota: 9.0 },
  { numero: 41, nota: 9.4 },
  { numero: 42, nota: 8.8 },
  { numero: 43, nota: 9.0 },
  { numero: 44, nota: 9.0 },
  { numero: 45, nota: 8.8 },
  { numero: 46, nota: 9.4 },
  { numero: 47, nota: 9.2 },
  { numero: 48, nota: 9.4 },
  { numero: 49, nota: 8.8 },
  { numero: 50, nota: 9.0 },
  { numero: 51, nota: 9.0 },
  { numero: 52, nota: 9.0 },
  { numero: 53, nota: 9.4 },
  { numero: 54, nota: 9.4 },
  { numero: 55, nota: 9.0 },
  { numero: 56, nota: 9.4 },
  { numero: 57, nota: 9.2 },
  { numero: 58, nota: 8.8 },
  { numero: 59, nota: 9.4 },
  { numero: 60, nota: 9.4 },
  { numero: 61, nota: 9.2 },
  { numero: 62, nota: 8.8 },
  { numero: 63, nota: 9.0 },
  { numero: 64, nota: 9.4 },
  { numero: 65, nota: 9.4 },
  { numero: 66, nota: 9.2 },
  { numero: 67, nota: 9.2 },
  { numero: 68, nota: 9.0 },
  { numero: 69, nota: 9.0 },
  { numero: 70, nota: 8.8 },
  { numero: 71, nota: 9.0 },
  { numero: 72, nota: 9.0 },
  // 3º Pelotão
  { numero: 73,  nota: 9.4 },
  { numero: 74,  nota: 9.4 },
  { numero: 75,  nota: 9.6 },
  { numero: 76,  nota: 9.2 },
  { numero: 77,  nota: 9.6 },
  { numero: 78,  nota: 9.2 },
  { numero: 79,  nota: 9.4 },
  { numero: 80,  nota: 9.4 },
  { numero: 81,  nota: 9.4 },
  { numero: 82,  nota: 9.2 },
  { numero: 83,  nota: 9.8 },
  { numero: 84,  nota: 9.4 },
  { numero: 85,  nota: 9.8 },
  { numero: 86,  nota: 9.8 },
  { numero: 87,  nota: 9.8 },
  { numero: 88,  nota: 9.4 },
  { numero: 89,  nota: 9.4 },
  { numero: 90,  nota: 8.0 },
  { numero: 91,  nota: 8.0 },
  { numero: 92,  nota: 8.0 },
  { numero: 93,  nota: 9.2 },
  { numero: 94,  nota: 9.4 },
  { numero: 95,  nota: 9.6 },
  { numero: 96,  nota: 9.2 },
  { numero: 97,  nota: 9.4 },
  { numero: 98,  nota: 9.4 },
  { numero: 99,  nota: 9.8 },
  { numero: 100, nota: 9.6 },
  { numero: 101, nota: 9.6 },
  { numero: 102, nota: 9.4 },
  { numero: 103, nota: 9.4 },
  { numero: 104, nota: 9.2 },
  { numero: 105, nota: 8.0 },
  { numero: 106, nota: 9.6 },
  { numero: 107, nota: 8.0 },
  { numero: 108, nota: 8.0 },
  { numero: 109, nota: 9.8 },
  // 4º Pelotão
  { numero: 110, nota: 8.6 },
  { numero: 111, nota: 9.6 },
  { numero: 112, nota: 8.6 },
  { numero: 113, nota: 9.0 },
  { numero: 114, nota: 9.4 },
  { numero: 115, nota: 9.0 },
  { numero: 116, nota: 9.0 },
  { numero: 117, nota: 9.4 },
  { numero: 118, nota: 9.6 },
  { numero: 119, nota: 8.0 },
  { numero: 120, nota: 9.2 },
  { numero: 121, nota: 9.6 },
  { numero: 122, nota: 8.0 },
  { numero: 123, nota: 9.0 },
  // 124 ausente
  { numero: 125, nota: 9.4 },
  { numero: 126, nota: 8.6 },
  { numero: 127, nota: 8.0 },
  { numero: 128, nota: 8.6 },
  { numero: 129, nota: 9.2 },
  { numero: 130, nota: 9.4 },
  { numero: 131, nota: 8.0 },
  { numero: 132, nota: 9.2 },
  { numero: 133, nota: 9.2 },
  { numero: 134, nota: 9.2 },
  { numero: 135, nota: 9.0 },
  { numero: 136, nota: 9.6 },
  { numero: 137, nota: 9.4 },
  { numero: 138, nota: 9.6 },
  { numero: 139, nota: 9.2 },
  { numero: 140, nota: 8.0 },
  { numero: 141, nota: 8.0 },
  { numero: 142, nota: 9.4 },
  { numero: 143, nota: 8.6 },
  { numero: 144, nota: 9.6 },
  // 5º Pelotão
  { numero: 145, nota: 9.6 },
  { numero: 146, nota: 9.2 },
  { numero: 147, nota: 9.2 },
  { numero: 148, nota: 9.2 },
  { numero: 149, nota: 9.6 },
  { numero: 150, nota: 9.6 },
  { numero: 151, nota: 9.0 },
  { numero: 152, nota: 9.0 },
  { numero: 153, nota: 8.8 },
  { numero: 154, nota: 9.2 },
  { numero: 155, nota: 9.0 },
  { numero: 156, nota: 8.8 },
  { numero: 157, nota: 8.8 },
  { numero: 158, nota: 9.6 },
  { numero: 159, nota: 9.0 },
  { numero: 160, nota: 9.0 },
  { numero: 161, nota: 9.6 },
  { numero: 162, nota: 9.0 },
  { numero: 163, nota: 9.6 },
  { numero: 164, nota: 9.0 },
  { numero: 165, nota: 9.6 },
  { numero: 166, nota: 8.8 },
  { numero: 167, nota: 9.6 },
  { numero: 168, nota: 9.0 },
  { numero: 169, nota: 9.0 },
  { numero: 170, nota: 9.2 },
  { numero: 171, nota: 9.6 },
  { numero: 172, nota: 9.6 },
  { numero: 173, nota: 9.0 },
  { numero: 174, nota: 9.2 },
  // 175 ausente
  { numero: 176, nota: 9.6 },
  { numero: 177, nota: 8.8 },
  { numero: 178, nota: 8.8 },
  { numero: 179, nota: 9.0 },
  { numero: 180, nota: 9.0 },
]

// ---------- Constants ----------
const MODULE_ID = 'escadas'
const NOTA_MINIMA = 7.0

// ---------- Main ----------
async function main() {
  const args = process.argv.slice(2)
  const execute = args.includes('--execute')

  console.log('='.repeat(60))
  console.log(`  UPDATE NOTAS ESCADAS VC-1.1 — ${execute ? '⚡ EXECUÇÃO REAL' : '🔍 DRY-RUN (nada será gravado)'}`)
  console.log('='.repeat(60))
  console.log(`  Total de registros na planilha: ${NOTAS.length}`)
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

  // 2. Load students
  const studentsMap = loadStudents()
  console.log(`  students.json: ${studentsMap.size} alunos`)

  // 3. Check existing records in Supabase
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
  console.log(`  Registros existentes no banco (${MODULE_ID}): ${existingMap.size}`)
  console.log()

  // 4. Process records
  let updated = 0
  let inserted = 0
  let errors = 0
  let notFound = 0

  for (const rec of NOTAS) {
    const numOrdem = String(rec.numero)
    const student = studentsMap.get(numOrdem)

    if (!student) {
      notFound++
      console.warn(`  [NOT FOUND] Nº ${numOrdem} não encontrado em students.json — usando fallback`)
    }

    const resultado = rec.nota >= NOTA_MINIMA ? 'APROVADO' : 'REPROVADO'

    const row = {
      nome_aluno: student?.nome || `Aluno Nº${numOrdem}`,
      numero_ordem: numOrdem,
      pelotao: student?.pelotao || null,
      avaliador: 'Importação retroativa',
      data_avaliacao: '2026-04-15',
      nota_final: rec.nota,
      penalidades: null,
      observacoes: 'Nota VC-1.1 lançada via importação de planilha CFSD-26',
      itens_avaliados: {
        resultado,
        importacao_retroativa: true,
      },
      module_id: MODULE_ID,
    }

    const existingId = existingMap.get(numOrdem)

    if (existingId) {
      if (execute) {
        const { error: updateErr } = await supabase
          .from('avaliacoes')
          .update(row)
          .eq('id', existingId)

        if (updateErr) {
          errors++
          console.error(`  [ERROR] Nº ${numOrdem}: ${updateErr.message}`)
        } else {
          updated++
          console.log(`  [UPDATE] Nº ${numOrdem} — ${row.nome_aluno} — ${rec.nota} — ${resultado}`)
        }
      } else {
        updated++
        console.log(`  [DRY-RUN UPDATE] Nº ${numOrdem} — ${row.nome_aluno} — ${rec.nota} → ${resultado}`)
      }
    } else {
      if (execute) {
        const { error: insertErr } = await supabase
          .from('avaliacoes')
          .insert([row])

        if (insertErr) {
          errors++
          console.error(`  [ERROR] Nº ${numOrdem}: ${insertErr.message}`)
        } else {
          inserted++
          console.log(`  [INSERT] Nº ${numOrdem} — ${row.nome_aluno} — ${rec.nota} — ${resultado}`)
        }
      } else {
        inserted++
        console.log(`  [DRY-RUN INSERT] Nº ${numOrdem} — ${row.nome_aluno} — ${rec.nota} → ${resultado}`)
      }
    }
  }

  // 5. Summary
  console.log()
  console.log('='.repeat(60))
  console.log('  RESUMO')
  console.log('='.repeat(60))
  console.log(`  Total na planilha:       ${NOTAS.length}`)
  console.log(`  ${execute ? 'Atualizados' : 'A atualizar'}:         ${updated}`)
  console.log(`  ${execute ? 'Inseridos'   : 'A inserir'}:           ${inserted}`)
  console.log(`  Erros:                   ${errors}`)
  console.log(`  Não encontrados (json):  ${notFound}`)
  console.log()

  if (!execute) {
    console.log('  ⚠  Modo dry-run — nenhum dado foi alterado.')
    console.log('  Para gravar, execute:')
    console.log('    node scripts/update-escadas-notas.js --execute')
  } else {
    console.log(errors === 0 ? '  ✅ Importação concluída sem erros.' : `  ⚠  Importação concluída com ${errors} erro(s).`)
  }
  console.log()
}

main().catch(err => {
  console.error('Erro fatal:', err)
  process.exit(1)
})
