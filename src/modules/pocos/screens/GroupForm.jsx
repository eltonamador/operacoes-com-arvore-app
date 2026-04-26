import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../../contexts/ThemeContext'
import { GRUPOS_POR_PELOTAO, getGruposDoPelotao } from '../data/groups'
import studentsData from '../../shared/data/students.json'
import instructorsData from '../../shared/data/instructors.json'

/**
 * Tela inicial do módulo Poço — seleção de grupo.
 * Fluxo: Pelotão → Grupo → Integrantes (automático) → Avaliador + Data → Iniciar
 *
 * Props:
 *   state          — estado atual (usePocoGroupState)
 *   updateGroupData — atualiza groupData parcialmente
 *   goTo           — navega entre telas
 *   moduleName     — título exibido no header
 *   moduleEmoji    — emoji do header
 */
export default function GroupForm({
  state,
  updateGroupData,
  goTo,
  moduleName = 'Salvamento em Espaço Confinado — Poço',
  moduleEmoji = '🕳️',
}) {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const todaySP = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' })

  const { groupData } = state
  const instructors = instructorsData?.instructors || []
  const studentsMap = useMemo(() => {
    const map = {}
    for (const s of studentsData?.students || []) map[s.numero] = s
    return map
  }, [])

  // Busca de instrutor
  const [searchInstrutor, setSearchInstrutor] = useState(groupData.avaliador || '')
  const [showInstrutorList, setShowInstrutorList] = useState(false)

  // Adição manual de integrante
  const [showAddForm, setShowAddForm] = useState(false)
  const [extraForm, setExtraForm] = useState({ id: '', nome: '', pin: '' })
  const [extraErro, setExtraErro] = useState('')
  const [extraNomeAuto, setExtraNomeAuto] = useState(false)

  // Remoção com justificativa
  const [removingIdx, setRemovingIdx] = useState(null)
  const [justificativa, setJustificativa] = useState('')
  const [justificativaErro, setJustificativaErro] = useState(false)

  // Sincroniza data padrão na primeira montagem
  useMemo(() => {
    if (!groupData.data) updateGroupData({ data: todaySP })
  }, [])

  const pelotoes = Object.keys(GRUPOS_POR_PELOTAO)

  const gruposDoPelotao = useMemo(
    () => getGruposDoPelotao(groupData.pelotao),
    [groupData.pelotao]
  )

  // Quando muda o pelotão: limpa grupo e integrantes
  function handlePelotaoChange(pelotao) {
    updateGroupData({ pelotao, grupoNum: null, integrantes: [] })
  }

  // Quando muda o grupo: carrega integrantes automaticamente
  function handleGrupoChange(grupoNum) {
    const grupos = getGruposDoPelotao(groupData.pelotao)
    const grupo = grupos.find(g => g.num === Number(grupoNum))
    if (!grupo) return
    const integrantes = grupo.integrantes.map(m => ({
      ...m,
      signed: false,
      signedAt: null,
    }))
    updateGroupData({ grupoNum: Number(grupoNum), integrantes })
  }

  function handleAvaliadorChange(valor) {
    setSearchInstrutor(valor)
    setShowInstrutorList(true)
  }

  function selectInstrutor(instructor) {
    updateGroupData({ avaliador: instructor })
    setSearchInstrutor(instructor)
    setShowInstrutorList(false)
  }

  const filteredInstructors = useMemo(() => {
    return instructors.filter(i =>
      !searchInstrutor || i.toLowerCase().includes(searchInstrutor.toLowerCase())
    )
  }, [searchInstrutor, instructors])

  // Auto-preenche nome ao digitar ID
  function handleExtraIdChange(val) {
    const cleaned = val.replace(/\D/g, '')
    const idNum = parseInt(cleaned, 10)
    const student = !isNaN(idNum) ? studentsMap[idNum] : null
    setExtraNomeAuto(!!student)
    setExtraForm(f => ({ ...f, id: cleaned, nome: student ? student.nome : f.nome }))
    setExtraErro(cleaned && !student ? 'ID não encontrado — preencha o nome manualmente.' : '')
  }

  // Iniciar remoção de integrante
  function startRemove(idx) {
    setRemovingIdx(idx)
    setJustificativa('')
    setJustificativaErro(false)
  }

  // Confirmar remoção com justificativa
  function confirmRemove(idx) {
    if (!justificativa.trim()) {
      setJustificativaErro(true)
      return
    }
    const membro = groupData.integrantes[idx]
    const registro = {
      id: membro.id,
      nome: membro.nome,
      justificativa: justificativa.trim(),
      removidoEm: new Date().toISOString(),
    }
    const history = [...(groupData.removalsHistory || []), registro]
    const next = groupData.integrantes.filter((_, i) => i !== idx)
    updateGroupData({ integrantes: next, removalsHistory: history })
    setRemovingIdx(null)
    setJustificativa('')
    setJustificativaErro(false)
  }

  // Adicionar integrante extra
  function handleAddExtra() {
    setExtraErro('')
    const idNum = extraForm.id.trim()
    const nome = extraForm.nome.trim()
    const pin = extraForm.pin.trim()

    if (!idNum) return setExtraErro('Informe o ID do integrante.')
    if (!nome) return setExtraErro('Informe o nome do integrante.')
    if (!/^\d{4}$/.test(pin)) return setExtraErro('PIN deve ter exatamente 4 dígitos.')
    if (groupData.integrantes.some(m => String(m.id) === idNum)) {
      return setExtraErro('Este ID já está na lista.')
    }

    const novoMembro = {
      id: idNum,       // string livre para extras
      nome,
      pin,
      extra: true,
      signed: false,
      signedAt: null,
    }
    updateGroupData({ integrantes: [...groupData.integrantes, novoMembro] })
    setExtraForm({ id: '', nome: '', pin: '' })
    setExtraNomeAuto(false)
    setShowAddForm(false)
  }

  function removerIntegrante(idx) {
    const next = groupData.integrantes.filter((_, i) => i !== idx)
    updateGroupData({ integrantes: next })
  }

  const isValid =
    Boolean(groupData.pelotao) &&
    Boolean(groupData.grupoNum) &&
    groupData.integrantes.length > 0 &&
    String(groupData.avaliador || '').trim() !== '' &&
    String(groupData.data || '').trim() !== ''

  return (
    <div className="screen-container">
      <header className="header">
        <div className="header-emblem">{moduleEmoji}</div>
        <div className="header-titles">
          <span className="header-org">CBMAP – Corpo de Bombeiros Militar do Amapá</span>
          <span className="header-title">{moduleName}</span>
          <span className="header-subtitle">Ficha de Avaliação Prática – CFSD 2026</span>
        </div>
        <div className="header-spacer" />
        <div className="header-actions">
          <button
            className="btn btn-secondary"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={() => navigate('/avaliador')}
          >
            Voltar ao Portal
          </button>
          <button
            className="btn btn-secondary"
            style={{ fontSize: 13, padding: '10px 18px', minHeight: 44 }}
            onClick={() => goTo('advanced-reports')}
          >
            📊 Relatórios
          </button>
        </div>
        <div className="header-badge">CFSD 2026</div>
      </header>

      <div className="screen-content screen-content--centered">
        <div className="card card--form">
          <div style={{ marginBottom: 28 }}>
            <div className="card-label">Identificação</div>
            <h2 className="card-title">Seleção de Grupo</h2>
            <p className="card-subtitle">
              Selecione o pelotão e o grupo. Os integrantes serão carregados automaticamente.
            </p>
          </div>

          <div className="form-grid">

            {/* Pelotão */}
            <div className="form-group">
              <label className="form-label">Pelotão</label>
              <select
                className="form-input"
                value={groupData.pelotao}
                onChange={e => handlePelotaoChange(e.target.value)}
                style={{ appearance: 'auto', cursor: 'pointer' }}
              >
                <option value="">Selecione o Pelotão</option>
                {pelotoes.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Grupo */}
            <div className="form-group">
              <label className="form-label">Grupo</label>
              <select
                className="form-input"
                value={groupData.grupoNum ?? ''}
                onChange={e => handleGrupoChange(e.target.value)}
                disabled={!groupData.pelotao}
                style={{ appearance: 'auto', cursor: groupData.pelotao ? 'pointer' : 'not-allowed' }}
              >
                <option value="">
                  {groupData.pelotao ? 'Selecione o Grupo' : 'Selecione primeiro o Pelotão'}
                </option>
                {gruposDoPelotao.map(g => (
                  <option key={g.num} value={g.num}>
                    Grupo {g.num} ({g.integrantes.length} integrantes)
                  </option>
                ))}
              </select>
            </div>

            {/* Data */}
            <div className="form-group">
              <label className="form-label">Data da Avaliação</label>
              <input
                className="form-input"
                type="date"
                value={groupData.data || todaySP}
                onChange={e => updateGroupData({ data: e.target.value })}
                style={{ colorScheme: theme === 'dark' ? 'dark' : 'light' }}
              />
            </div>

            {/* Avaliador */}
            <div className="form-group">
              <label className="form-label">Avaliador / Instrutor</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Digite ou selecione o instrutor..."
                  value={showInstrutorList ? searchInstrutor : groupData.avaliador}
                  onChange={e => handleAvaliadorChange(e.target.value)}
                  onFocus={() => setShowInstrutorList(true)}
                  onBlur={() => setTimeout(() => setShowInstrutorList(false), 150)}
                  autoComplete="off"
                />
                {showInstrutorList && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    background: 'var(--dropdown-bg)', border: '1px solid var(--dropdown-border)',
                    borderTop: 'none', borderRadius: '0 0 8px 8px',
                    maxHeight: 240, overflowY: 'auto', zIndex: 20, boxShadow: 'var(--shadow)',
                  }}>
                    {filteredInstructors.length === 0 ? (
                      <div style={{ padding: 12, color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
                        Nenhum instrutor encontrado
                      </div>
                    ) : (
                      filteredInstructors.map(inst => (
                        <button
                          type="button"
                          key={inst}
                          className="dropdown-item"
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => selectInstrutor(inst)}
                        >
                          {inst}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Lista de integrantes */}
          {groupData.integrantes.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12,
              }}>
                <div style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--gold)', fontWeight: 700 }}>
                  Integrantes do Grupo {groupData.grupoNum} — {groupData.integrantes.length} membros
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {groupData.integrantes.map((m, idx) => (
                  <div key={`${m.id}-${idx}`}>
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: removingIdx === idx ? '8px 8px 0 0' : 8,
                      border: m.extra ? '1px solid #cc8800' : '1px solid var(--border)',
                      borderBottom: removingIdx === idx ? 'none' : undefined,
                      background: m.extra ? '#1a1200' : 'var(--bg-card)',
                      gap: 12,
                    }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--gold)', minWidth: 36 }}>
                        {String(m.id).padStart(3, '0')}
                      </span>
                      <span style={{ flex: 1, color: 'var(--text-primary)', fontSize: 14 }}>
                        {m.nome}
                        {m.extra && (
                          <span style={{
                            marginLeft: 8, fontSize: 10, fontWeight: 700, color: '#ffbb44',
                            background: '#2a1a00', border: '1px solid #cc8800',
                            borderRadius: 4, padding: '1px 6px', letterSpacing: 1,
                          }}>
                            EXTRA
                          </span>
                        )}
                      </span>
                      <button
                        type="button"
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: removingIdx === idx ? '#ff6b6b' : 'var(--text-muted)',
                          fontSize: 16, padding: '2px 6px',
                        }}
                        title="Remover integrante"
                        onClick={() => removingIdx === idx ? setRemovingIdx(null) : startRemove(idx)}
                      >
                        ✕
                      </button>
                    </div>
                    {removingIdx === idx && (
                      <div style={{
                        padding: '10px 14px 12px', borderRadius: '0 0 8px 8px',
                        border: '1px solid #cc4444', borderTop: 'none',
                        background: '#1a0a0a',
                      }}>
                        <label style={{ fontSize: 11, fontWeight: 700, color: '#ff9999', display: 'block', marginBottom: 6 }}>
                          Justificativa para remoção (obrigatória)
                        </label>
                        <textarea
                          style={{
                            width: '100%', minHeight: 56, padding: '8px 10px',
                            borderRadius: 6, border: justificativaErro ? '1px solid #ff4444' : '1px solid #993333',
                            background: '#0e0606', color: 'var(--text-primary)', fontSize: 13,
                            resize: 'vertical', boxSizing: 'border-box',
                          }}
                          placeholder="Descreva o motivo da remoção deste integrante..."
                          value={justificativa}
                          onChange={e => { setJustificativa(e.target.value); setJustificativaErro(false) }}
                        />
                        {justificativaErro && (
                          <div style={{ fontSize: 11, color: '#ff6b6b', marginTop: 4 }}>
                            Justificativa obrigatória para confirmar a remoção.
                          </div>
                        )}
                        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                          <button
                            type="button"
                            style={{
                              flex: 1, padding: '8px 12px', borderRadius: 6, cursor: 'pointer',
                              border: '1px solid #cc4444', background: 'rgba(204,0,0,0.15)',
                              color: '#ff9999', fontSize: 12, fontWeight: 700,
                            }}
                            onClick={() => confirmRemove(idx)}
                          >
                            Confirmar Remoção
                          </button>
                          <button
                            type="button"
                            style={{
                              padding: '8px 14px', borderRadius: 6, cursor: 'pointer',
                              border: '1px solid var(--border)', background: 'transparent',
                              color: 'var(--text-muted)', fontSize: 12,
                            }}
                            onClick={() => { setRemovingIdx(null); setJustificativa('') }}
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botão adicionar integrante extra */}
          <div style={{ marginTop: 16 }}>
            {!showAddForm ? (
              <button
                type="button"
                className="btn btn-secondary"
                style={{ fontSize: 13, width: '100%' }}
                onClick={() => setShowAddForm(true)}
                disabled={!groupData.grupoNum}
              >
                + Adicionar integrante fora da lista
              </button>
            ) : (
              <div style={{
                border: '1px solid #cc8800', borderRadius: 10,
                padding: 16, background: '#0e0c00',
              }}>
                <div style={{
                  fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
                  color: '#ffbb44', fontWeight: 700, marginBottom: 14,
                }}>
                  Adicionar Integrante Extra
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <label className="form-label" style={{ fontSize: 11 }}>ID / Nº</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="Ex: 99"
                      value={extraForm.id}
                      onChange={e => handleExtraIdChange(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 11 }}>
                      Nome
                      {extraNomeAuto && (
                        <span style={{ marginLeft: 6, fontSize: 10, color: '#8ddf63', fontWeight: 700 }}>
                          ✓ preenchido
                        </span>
                      )}
                    </label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="Nome do integrante"
                      value={extraForm.nome}
                      onChange={e => { setExtraNomeAuto(false); setExtraForm(f => ({ ...f, nome: e.target.value })) }}
                      style={extraNomeAuto ? { borderColor: '#4a9040' } : {}}
                    />
                  </div>
                  <div>
                    <label className="form-label" style={{ fontSize: 11 }}>PIN (4 dígitos)</label>
                    <input
                      className="form-input"
                      type="password"
                      inputMode="numeric"
                      maxLength={4}
                      placeholder="••••"
                      value={extraForm.pin}
                      onChange={e => setExtraForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '') }))}
                    />
                  </div>
                </div>

                {extraErro && (
                  <div style={{ fontSize: 12, color: '#ff6b6b', marginBottom: 10 }}>{extraErro}</div>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    type="button"
                    className="btn btn-gold"
                    style={{ flex: 1, fontSize: 13 }}
                    onClick={handleAddExtra}
                  >
                    Confirmar
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ fontSize: 13 }}
                    onClick={() => { setShowAddForm(false); setExtraForm({ id: '', nome: '', pin: '' }); setExtraErro(''); setExtraNomeAuto(false) }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="hint-box" style={{ marginTop: 20 }}>
            <strong>ℹ Dica:</strong> Selecione o pelotão e depois o grupo. Os integrantes são
            carregados automaticamente. Ao final, todos assinarão individualmente por PIN.
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={() => goTo('evaluation')}
            disabled={!isValid}
            style={{ width: '100%', marginTop: 20 }}
          >
            Iniciar Avaliação →
          </button>
        </div>
      </div>
    </div>
  )
}
