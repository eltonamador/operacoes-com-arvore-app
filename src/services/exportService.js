import * as XLSX from 'xlsx'

/**
 * Exporta dados para CSV
 * @param {Array} data - Array de objetos
 * @param {Array} columns - Array de { key, label } definindo ordem e rótulos
 * @param {string} filename - Nome do arquivo (sem extensão)
 */
export function exportToCSV(data, columns, filename) {
  const header = columns.map((c) => c.label).join(';')
  const body = data.map((row) =>
    columns
      .map((c) => {
        const val = row[c.key]
        const str = val === null || val === undefined ? '' : String(val)
        // Escapar aspas e envolver em aspas se tiver ponto e vírgula ou nova linha
        if (str.includes(';') || str.includes('\n') || str.includes('"')) {
          return `"${str.replace(/"/g, '""')}"`
        }
        return str
      })
      .join(';')
  )
  const BOM = '\uFEFF' // UTF-8 BOM para Excel reconhecer acentos
  const csv = BOM + [header, ...body].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

/**
 * Exporta dados para XLSX (Excel)
 * @param {Array} data - Array de objetos
 * @param {Array} columns - Array de { key, label } definindo ordem e rótulos
 * @param {string} filename - Nome do arquivo (sem extensão)
 */
export function exportToXLSX(data, columns, filename) {
  const { utils, writeFile } = XLSX

  const rows = data.map((row) =>
    columns.reduce((acc, col) => {
      acc[col.label] = row[col.key] ?? ''
      return acc
    }, {})
  )

  const ws = utils.json_to_sheet(rows, { header: columns.map((c) => c.label) })

  // Ajustar largura das colunas
  const wscols = columns.map((c) => ({ wch: Math.max(c.label.length, 10) + 4 }))
  ws['!cols'] = wscols

  const wb = utils.book_new()
  utils.book_append_sheet(wb, ws, 'Dados')

  writeFile(wb, `${filename}.xlsx`)
}
