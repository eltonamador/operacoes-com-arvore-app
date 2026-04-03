export function generateVistoProvaReport(evaluations, pelotao, data, avaliador) {
  if (evaluations.length === 0) {
    alert('Nenhuma avaliação para imprimir.')
    return
  }

  // Filtrar avaliações pelo pelotão (se especificado)
  const filtered = pelotao
    ? evaluations.filter(e => e.studentData?.pelotao === pelotao)
    : evaluations

  if (filtered.length === 0) {
    alert('Nenhuma avaliação encontrada para este pelotão.')
    return
  }

  // Formatar data
  function formatDate(dateStr) {
    if (!dateStr) return new Date().toLocaleDateString('pt-BR')
    const [y, m, d] = String(dateStr).split('-')
    return `${d}/${m}/${y}`
  }

  // Criar HTML para impressão
  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Visto de Prova - CBMAP</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: Arial, sans-serif;
          background: white;
          color: black;
          padding: 20px;
        }

        .container {
          max-width: 210mm;
          margin: 0 auto;
          background: white;
        }

        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #CC0000;
          padding-bottom: 15px;
        }

        .header h1 {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .header p {
          font-size: 12px;
          margin: 2px 0;
          color: #333;
        }

        .title {
          text-align: center;
          font-size: 16px;
          font-weight: bold;
          margin: 20px 0 15px 0;
          text-decoration: underline;
        }

        .info-section {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 30px;
          margin-bottom: 20px;
          font-size: 12px;
        }

        .info-item {
          display: flex;
          flex-direction: column;
        }

        .info-label {
          font-weight: bold;
          font-size: 10px;
          text-transform: uppercase;
          color: #666;
          letter-spacing: 0.5px;
          margin-bottom: 3px;
        }

        .info-value {
          font-size: 13px;
          font-weight: bold;
          color: #000;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          font-size: 12px;
        }

        thead {
          background: #f5f5f5;
          border-bottom: 2px solid #CC0000;
        }

        th {
          padding: 10px;
          text-align: left;
          font-weight: bold;
          font-size: 11px;
          text-transform: uppercase;
          color: #CC0000;
          letter-spacing: 0.5px;
          border: 1px solid #ddd;
        }

        td {
          padding: 10px;
          border: 1px solid #ddd;
          border-bottom: 1px solid #999;
        }

        tbody tr {
          page-break-inside: avoid;
        }

        tbody tr:nth-child(even) {
          background: #f9f9f9;
        }

        tbody tr:hover {
          background: #f0f0f0;
        }

        .num-col {
          text-align: center;
          width: 8%;
          font-weight: bold;
        }

        .nome-col {
          width: 55%;
        }

        .nota-col {
          text-align: center;
          width: 15%;
          font-weight: bold;
          color: #CC0000;
        }

        .assinatura-col {
          text-align: center;
          width: 22%;
          height: 60px;
          vertical-align: bottom;
          padding-bottom: 5px !important;
          border-bottom: 1px solid #000 !important;
          border-top: none !important;
          border-left: none !important;
          border-right: none !important;
        }

        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 10px;
          color: #666;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }

        .timestamp {
          font-size: 9px;
          color: #999;
          margin-top: 10px;
        }

        @media print {
          body {
            padding: 0;
            margin: 0;
          }

          .container {
            margin: 0;
          }

          table {
            page-break-inside: avoid;
          }

          thead {
            display: table-header-group;
          }

          tr {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CBMAP - CORPO DE BOMBEIROS MILITAR DO AMAPÁ</h1>
          <p>Operações de Corte de Árvore com Motosserra - CFSD 2026</p>
        </div>

        <div class="title">Visto de Prova das Avaliações</div>

        <div class="info-section">
          <div class="info-item">
            <div class="info-label">Pelotão</div>
            <div class="info-value">${pelotao || 'TODOS'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Data</div>
            <div class="info-value">${formatDate(data)}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Avaliador</div>
            <div class="info-value">${avaliador || '—'}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th class="num-col">Nº</th>
              <th class="nome-col">Aluno</th>
              <th class="nota-col">Nota</th>
              <th class="assinatura-col">Assinatura</th>
            </tr>
          </thead>
          <tbody>
            ${filtered
              .map(
                item => `
              <tr>
                <td class="num-col">${item.studentData?.ordem || '—'}</td>
                <td class="nome-col">${item.studentData?.nome || '—'}</td>
                <td class="nota-col">${item.finalScore.toFixed(2).replace('.', ',')}</td>
                <td class="assinatura-col"></td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>Total de avaliados: <strong>${filtered.length}</strong></p>
          <div class="timestamp">
            Gerado em: ${new Date().toLocaleString('pt-BR')}
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  // Abrir em nova aba e imprimir
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const window_ref = window.open(url, '_blank')
  window_ref.onload = () => {
    setTimeout(() => {
      window_ref.print()
      URL.revokeObjectURL(url)
    }, 250)
  }
}
