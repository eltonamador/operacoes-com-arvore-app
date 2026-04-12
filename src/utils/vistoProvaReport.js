import { fetchAvaliacoesByDataAndModulo } from '../services/avaliacoesService'

export async function generateVistoProvaReport(pelotao, data, avaliador) {
  let evaluations
  try {
    evaluations = await fetchAvaliacoesByDataAndModulo(data, 'motosserra')
  } catch {
    alert('Erro ao buscar dados do banco de dados.')
    return
  }

  if (evaluations.length === 0) {
    alert('Nenhuma avaliação encontrada no banco de dados para esta data.')
    return
  }

  // Filtrar por pelotão se especificado
  const filtered = pelotao
    ? evaluations.filter(e => e.studentData?.pelotao === pelotao)
    : evaluations

  if (filtered.length === 0) {
    alert('Nenhuma avaliação encontrada para este pelotão.')
    return
  }

  const TZ = 'America/Sao_Paulo'

  function formatDate(dateStr) {
    if (!dateStr) {
      return new Date().toLocaleDateString('pt-BR', { timeZone: TZ })
    }
    const [y, m, d] = String(dateStr).split('-')
    return `${d}/${m}/${y}`
  }

  const approved = filtered.filter(e => e.isPassing).length
  const failed = filtered.length - approved
  const avgScore = filtered.length > 0
    ? (filtered.reduce((sum, e) => sum + e.finalScore, 0) / filtered.length).toFixed(2).replace('.', ',')
    : '0,00'

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Visto de Prova - CBMAP</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 12mm 10mm;
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background: white;
          color: #1a1a1a;
          font-size: 11px;
          line-height: 1.4;
        }

        .page {
          max-width: 190mm;
          margin: 0 auto;
        }

        /* ─── HEADER ─── */
        .header {
          display: flex;
          align-items: center;
          gap: 16px;
          padding-bottom: 10px;
          border-bottom: 3px solid #1a1a1a;
          margin-bottom: 14px;
        }

        .header-shield {
          width: 70px;
          height: 70px;
          flex-shrink: 0;
        }

        .header-shield img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .header-text {
          flex: 1;
        }

        .header-text h1 {
          font-size: 15px;
          font-weight: 800;
          color: #1a1a1a;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .header-text p {
          font-size: 10px;
          color: #555;
          margin-top: 2px;
        }

        .header-text .doc-title {
          font-size: 13px;
          font-weight: 700;
          color: #1a1a1a;
          margin-top: 4px;
          letter-spacing: 0.5px;
        }

        /* ─── INFO BAR ─── */
        .info-bar {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 0;
          background: #f7f7f7;
          border: 1px solid #ddd;
          border-radius: 6px;
          margin-bottom: 12px;
          overflow: hidden;
        }

        .info-cell {
          padding: 8px 12px;
          border-right: 1px solid #ddd;
        }

        .info-cell:last-child {
          border-right: none;
        }

        .info-cell .label {
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #888;
          margin-bottom: 2px;
        }

        .info-cell .value {
          font-size: 12px;
          font-weight: 700;
          color: #1a1a1a;
        }

        /* ─── STATS ─── */
        .stats-row {
          display: flex;
          gap: 10px;
          margin-bottom: 12px;
        }

        .stat-box {
          flex: 1;
          text-align: center;
          padding: 6px 8px;
          border-radius: 5px;
          border: 1px solid #ddd;
        }

        .stat-box .stat-num {
          font-size: 16px;
          font-weight: 800;
        }

        .stat-box .stat-lbl {
          font-size: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: #666;
          margin-top: 1px;
        }

        .stat-total { background: #f0f4ff; border-color: #c0d0ff; }
        .stat-total .stat-num { color: #2255aa; }

        .stat-approved { background: #f0faf0; border-color: #b0e0b0; }
        .stat-approved .stat-num { color: #228822; }

        .stat-failed { background: #fef0f0; border-color: #e0b0b0; }
        .stat-failed .stat-num { color: #CC0000; }

        .stat-avg { background: #fffbf0; border-color: #e0d0a0; }
        .stat-avg .stat-num { color: #886600; }

        /* ─── TABLE ─── */
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 11px;
        }

        thead th {
          background: #1a1a1a;
          color: white;
          padding: 7px 8px;
          text-align: left;
          font-size: 9px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        thead th:first-child {
          border-radius: 4px 0 0 0;
        }

        thead th:last-child {
          border-radius: 0 4px 0 0;
        }

        tbody td {
          padding: 6px 8px;
          border-bottom: 1px solid #e0e0e0;
          vertical-align: middle;
        }

        tbody tr:nth-child(even) {
          background: #fafafa;
        }

        .col-num {
          text-align: center;
          width: 7%;
          font-weight: 700;
          color: #555;
        }

        .col-nome {
          width: 43%;
          font-weight: 500;
        }

        .col-nota {
          text-align: center;
          width: 10%;
          font-weight: 800;
        }

        .nota-ok { color: #228822; }
        .nota-fail { color: #CC0000; }

        .col-status {
          text-align: center;
          width: 14%;
        }

        .badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .badge-ok {
          background: #e6f5e6;
          color: #228822;
          border: 1px solid #b0d8b0;
        }

        .badge-fail {
          background: #fde8e8;
          color: #CC0000;
          border: 1px solid #e0b0b0;
        }

        .col-assinatura {
          width: 26%;
          min-height: 32px;
        }

        .assinatura-line {
          border-bottom: 1px solid #999;
          height: 28px;
        }

        /* ─── FOOTER ─── */
        .footer {
          margin-top: 16px;
          padding-top: 10px;
          border-top: 2px solid #1a1a1a;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .footer-left {
          font-size: 9px;
          color: #888;
        }

        .footer-signatures {
          display: flex;
          gap: 40px;
        }

        .footer-sig {
          text-align: center;
          min-width: 140px;
        }

        .footer-sig .sig-line {
          border-top: 1px solid #333;
          padding-top: 4px;
          font-size: 9px;
          color: #555;
          font-weight: 600;
        }

        .footer-sig .sig-space {
          height: 36px;
        }

        @media print {
          body { padding: 0; margin: 0; }
          .page { max-width: none; }
          table { page-break-inside: auto; }
          thead { display: table-header-group; }
          tr { page-break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="page">
        <div class="header">
          <div class="header-shield">
            <img src="${window.location.origin}/loboApp.png" alt="Salvamento Terrestre"/>
          </div>
          <div class="header-text">
            <h1>Corpo de Bombeiros Militar do Amapá</h1>
            <p>Operações de Corte de Árvore com Motosserra — CFSD 2026</p>
            <div class="doc-title">Visto de Prova das Avaliações</div>
          </div>
        </div>

        <div class="info-bar">
          <div class="info-cell">
            <div class="label">Pelotão</div>
            <div class="value">${pelotao || 'TODOS'}</div>
          </div>
          <div class="info-cell">
            <div class="label">Data da Avaliação</div>
            <div class="value">${formatDate(data)}</div>
          </div>
          <div class="info-cell">
            <div class="label">Avaliador</div>
            <div class="value">${avaliador || '—'}</div>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-box stat-total">
            <div class="stat-num">${filtered.length}</div>
            <div class="stat-lbl">Total</div>
          </div>
          <div class="stat-box stat-approved">
            <div class="stat-num">${approved}</div>
            <div class="stat-lbl">Aprovados</div>
          </div>
          <div class="stat-box stat-failed">
            <div class="stat-num">${failed}</div>
            <div class="stat-lbl">Reprovados</div>
          </div>
          <div class="stat-box stat-avg">
            <div class="stat-num">${avgScore}</div>
            <div class="stat-lbl">Média</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th class="col-num">Nº</th>
              <th class="col-nome">Aluno</th>
              <th class="col-nota">Nota</th>
              <th class="col-status">Resultado</th>
              <th class="col-assinatura">Assinatura</th>
            </tr>
          </thead>
          <tbody>
            ${filtered
              .map(
                item => `
              <tr>
                <td class="col-num">${item.studentData?.ordem || '—'}</td>
                <td class="col-nome">${item.studentData?.nome || '—'}</td>
                <td class="col-nota ${item.isPassing ? 'nota-ok' : 'nota-fail'}">${item.finalScore.toFixed(2).replace('.', ',')}</td>
                <td class="col-status">
                  <span class="badge ${item.isPassing ? 'badge-ok' : 'badge-fail'}">
                    ${item.isPassing ? 'APROVADO' : 'REPROVADO'}
                  </span>
                </td>
                <td class="col-assinatura"><div class="assinatura-line"></div></td>
              </tr>
            `,
              )
              .join('')}
          </tbody>
        </table>

        <div class="footer">
          <div class="footer-left">
            Gerado em: ${new Date().toLocaleString('pt-BR', { timeZone: TZ })}
          </div>
          <div class="footer-signatures">
            <div class="footer-sig">
              <div class="sig-space"></div>
              <div class="sig-line">${avaliador || 'Avaliador'}</div>
            </div>
            <div class="footer-sig">
              <div class="sig-space"></div>
              <div class="sig-line">Comandante do Pelotão</div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const window_ref = window.open(url, '_blank')
  if (window_ref) {
    window_ref.onload = () => {
      setTimeout(() => {
        window_ref.print()
        URL.revokeObjectURL(url)
      }, 300)
    }
  }
}
