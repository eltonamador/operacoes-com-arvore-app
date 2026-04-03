/**
 * Utilitário para importar dados do Excel
 *
 * INSTRUÇÕES:
 * 1. Se você usar o navegador com um plugin Excel (ex: XLSX.js):
 *    - Instale: npm install xlsx
 *    - Use a função parseExcelFile()
 *
 * 2. Se você preferir copiar/colar manualmente:
 *    - Abra seu Excel
 *    - Selecione: Nome | Número | Pelotão
 *    - Cole no gerador online: https://csvjson.com/csv2json
 *    - Copie o JSON para src/data/students.json
 */

// Exemplo: Se usar a biblioteca XLSX
export async function parseExcelFile(file) {
  try {
    // Você precisaria instalar a biblioteca: npm install xlsx
    // import XLSX from 'xlsx'

    // const reader = new FileReader()
    // reader.onload = (e) => {
    //   const data = new Uint8Array(e.target.result)
    //   const workbook = XLSX.read(data, { type: 'array' })
    //   const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    //   const jsonData = XLSX.utils.sheet_to_json(worksheet)
    //
    //   // Mapear as colunas para o formato esperado
    //   const students = jsonData.map(row => ({
    //     nome: row['Nome do Aluno'] || row['nome'] || '',
    //     numero: String(row['Nº'] || row['numero'] || ''),
    //     pelotao: row['Pelotão'] || row['pelotao'] || ''
    //   }))
    //
    //   console.log('Dados importados:', students)
    //   return students
    // }
    // reader.readAsArrayBuffer(file)
  } catch (error) {
    console.error('Erro ao importar Excel:', error)
  }
}

/**
 * Converter array manual para formato JSON
 * Uso: passeArrayParaJSON([{nome: 'João', numero: '001', pelotao: '1º'}])
 */
export function arrayParaJSON(arrayDados) {
  return {
    students: arrayDados.map(item => ({
      nome: String(item.nome || '').trim(),
      numero: String(item.numero || '').trim(),
      pelotao: String(item.pelotao || '').trim()
    }))
  }
}

/**
 * Validar estrutura dos dados
 */
export function validarDados(studentsArray, instructorsArray) {
  const erros = []

  // Validar alunos
  if (!Array.isArray(studentsArray)) {
    erros.push('❌ students deve ser um array')
  } else {
    studentsArray.forEach((s, idx) => {
      if (!s.nome) erros.push(`❌ Aluno ${idx + 1}: nome vazio`)
      if (!s.numero) erros.push(`❌ Aluno ${idx + 1}: número vazio`)
      if (!s.pelotao) erros.push(`❌ Aluno ${idx + 1}: pelotão vazio`)
    })
  }

  // Validar instrutores
  if (!Array.isArray(instructorsArray)) {
    erros.push('❌ instructors deve ser um array')
  } else {
    instructorsArray.forEach((i, idx) => {
      if (!i || String(i).trim() === '') {
        erros.push(`❌ Instrutor ${idx + 1}: vazio`)
      }
    })
  }

  if (erros.length === 0) {
    console.log('✅ Dados válidos!')
    return true
  } else {
    console.error('Erros encontrados:')
    erros.forEach(err => console.error(err))
    return false
  }
}

/**
 * Gerar JSON para copiar/colar
 */
export function gerarJSON(students, instructors) {
  const json = {
    students: students.map(s => ({
      nome: String(s.nome).trim(),
      numero: String(s.numero).trim(),
      pelotao: String(s.pelotao).trim()
    })),
    instructors: instructors.map(i => String(i).trim())
  }

  return JSON.stringify(json, null, 2)
}
