import studentsData from '../data/students.json'

const students = studentsData?.students || []

/**
 * Retorna dados canônicos do aluno a partir do numero_ordem.
 * Fonte única de verdade: students.json
 * @param {string|number} numero_ordem
 * @returns {{ nome: string, pelotao: string } | null}
 */
export function getStudentByOrdem(numero_ordem) {
  if (!numero_ordem) return null
  const found = students.find(s => String(s.numero) === String(numero_ordem))
  if (!found) return null
  return { nome: found.nome, pelotao: found.pelotao }
}
