export function generateCollectiveSignatureSheet(evaluations) {
  if (!evaluations || evaluations.length === 0) {
    alert('Nenhuma avaliação registrada para gerar a ficha.')
    return
  }

  // Ordena por número de ordem
  const sorted = [...evaluations].sort((a, b) => {
    const ordemA = parseInt(a.studentData?.ordem || '0')
    const ordemB = parseInt(b.studentData?.ordem || '0')
    return ordemA - ordemB
  })

  const now = new Date()
  const dataEmissao = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
  const horaEmissao = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })

  // Gera rows da tabela
  const tableRows = sorted
    .map(
      (e, idx) => `
    <tr class="signature-row">
      <td class="col-item">${String(idx + 1).padStart(2, '0')}</td>
      <td class="col-numero">${e.studentData?.ordem || '—'}</td>
      <td class="col-nome">${e.studentData?.nome || '—'}</td>
      <td class="col-nota">${e.finalScore?.toFixed(2)?.replace('.', ',') || '—'}</td>
      <td class="col-assinatura">&nbsp;</td>
    </tr>
  `
    )
    .join('')

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ficha Coletiva de Visto - CBMAP CFSD 2026</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: white;
      color: #000;
    }

    body {
      padding: 0;
    }

    .page {
      width: 210mm;
      height: 297mm;
      padding: 15mm;
      margin: 0 auto;
      background: white;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      page-break-after: always;
      page-break-inside: avoid;
    }

    .page:last-child {
      page-break-after: avoid;
    }

    /* ─── Cabeçalho ─── */
    .header {
      text-align: center;
      border-bottom: 3px solid #1a1a1a;
      padding-bottom: 10mm;
      margin-bottom: 8mm;
    }

    .header-org {
      font-size: 11pt;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #1a1a1a;
    }

    .header-title {
      font-size: 16pt;
      font-weight: 900;
      margin-top: 4mm;
      color: #000;
      line-height: 1.2;
    }

    .header-subtitle {
      font-size: 12pt;
      font-weight: 700;
      margin-top: 2mm;
      color: #333;
    }

    .header-meta {
      font-size: 9pt;
      color: #666;
      margin-top: 4mm;
    }

    /* ─── Tabela ─── */
    .table-container {
      margin-top: 6mm;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10pt;
    }

    thead {
      background: #1a1a1a;
      color: #fff;
      text-align: left;
    }

    thead th {
      padding: 4mm 2mm;
      border: 1px solid #000;
      font-weight: 700;
      text-transform: uppercase;
      font-size: 9pt;
      letter-spacing: 0.5px;
    }

    tbody td {
      padding: 5mm 2mm;
      border: 1px solid #000;
      vertical-align: top;
    }

    .signature-row {
      height: 18mm;
    }

    .signature-row td {
      vertical-align: middle;
    }

    .col-item {
      width: 7%;
      text-align: center;
      font-weight: 700;
      color: #666;
    }

    .col-numero {
      width: 7%;
      text-align: center;
      font-weight: 700;
    }

    .col-nome {
      width: 42%;
      text-align: left;
    }

    .col-nota {
      width: 13%;
      text-align: center;
      font-weight: 600;
    }

    .col-assinatura {
      width: 31%;
      vertical-align: bottom;
      padding-bottom: 2mm;
    }

    /* ─── Rodapé ─── */
    .footer {
      margin-top: 8mm;
      padding-top: 4mm;
      border-top: 1px solid #999;
      font-size: 8pt;
      color: #666;
      text-align: center;
    }

    /* ─── Impressão ─── */
    @media print {
      body {
        margin: 0;
        padding: 0;
        background: white;
      }

      .page {
        width: 100%;
        height: 100%;
        padding: 15mm;
        margin: 0;
        box-shadow: none;
        page-break-after: always;
      }

      .page:last-child {
        page-break-after: avoid;
      }

      .signature-row {
        page-break-inside: avoid;
      }

      table {
        page-break-inside: avoid;
      }

      thead {
        display: table-header-group;
      }

      tfoot {
        display: table-footer-group;
      }
    }

    @page {
      size: A4;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-org">
        🪚🌲 Corpo de Bombeiros Militar do Amapá – CBMAP
      </div>
      <div class="header-title">
        Ficha Coletiva de Visto de Avaliação
      </div>
      <div class="header-subtitle">
        CFSD 2026 – Salvamento Terrestre
      </div>
      <div class="header-subtitle" style="font-weight: 400; margin-top: 3mm;">
        Operações de Corte de Árvore com Motosserra
      </div>
      <div class="header-meta">
        Emitido em ${dataEmissao} às ${horaEmissao}
      </div>
    </div>

    <div class="table-container">
      <table>
        <thead>
          <tr>
            <th class="col-item">Item</th>
            <th class="col-numero">Nº</th>
            <th class="col-nome">Nome do Aluno</th>
            <th class="col-nota">Nota Final</th>
            <th class="col-assinatura">Assinatura</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </div>

    <div class="footer">
      Total de avaliados: ${sorted.length} alunos &nbsp; | &nbsp;
      Documento de visto para avaliação prática
    </div>
  </div>

  <script>
    // Auto-print ao abrir (opcional)
    // window.print();
  </script>
</body>
</html>
  `

  // Abre em nova aba
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')

  // Limpa a URL após um tempo (navegadores modernos já fazem isso)
  setTimeout(() => URL.revokeObjectURL(url), 10000)

  return win
}
