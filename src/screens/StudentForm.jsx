import { useState, useMemo, useEffect } from 'react'
import studentsData from '../data/students.json'
import instructorsData from '../data/instructors.json'

export default function StudentForm({ state, updateStudentData, goTo }) {
  // Pré-preencher com data atual se não houver data
  const todaySP = new Date().toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' })

  const initialForm = {
    ...state.studentData,
    data: state.studentData.data || todaySP,
  }

  const [form, setForm] = useState(initialForm)
  const [searchAluno, setSearchAluno] = useState('')
  const [searchInstrutor, setSearchInstrutor] = useState('')
  const [showAlunoList, setShowAlunoList] = useState(false)
  const [showInstrutorList, setShowInstrutorList] = useState(false)

  // Sincronizar form com state quando state muda (ex: após reset)
  useEffect(() => {
    setForm(initialForm)
    setSearchAluno('')
    setSearchInstrutor('')
    setShowAlunoList(false)
    setShowInstrutorList(false)
  }, [state.studentData.nome, state.studentData.ordem, state.studentData.pelotao])

  const students = studentsData?.students || []
  const instructors = instructorsData?.instructors || []

  const pelotoes = [...new Set(students.map(s => s.pelotao).filter(Boolean))].sort()

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchPelotao = !form.pelotao || student.pelotao === form.pelotao
      const matchSearch =
        !searchAluno || student.nome.toLowerCase().includes(searchAluno.toLowerCase())
      return matchPelotao && matchSearch
    })
  }, [form.pelotao, searchAluno, students])

  const filteredInstructors = useMemo(() => {
    return instructors.filter(instructor =>
      !searchInstrutor || instructor.toLowerCase().includes(searchInstrutor.toLowerCase())
    )
  }, [searchInstrutor, instructors])

  function updateForm(next) {
    setForm(next)
    updateStudentData(next)
  }

  function handleChange(e) {
    const { name, value } = e.target

    let next = { ...form, [name]: value }

    if (name === 'pelotao') {
      next = {
        ...next,
        nome: '',
        ordem: '',
      }
      setSearchAluno('')
      setShowAlunoList(false)
    }

    updateForm(next)
  }

  function selectStudent(student) {
    const next = {
      ...form,
      nome: student.nome,
      ordem: String(student.numero),
      pelotao: student.pelotao,
    }

    updateForm(next)
    setSearchAluno(student.nome)
    setShowAlunoList(false)
  }

  function selectInstructor(instructor) {
    const next = { ...form, avaliador: instructor }
    updateForm(next)
    setSearchInstrutor(instructor)
    setShowInstrutorList(false)
  }

  const isValid =
    String(form.nome || '').trim() !== '' &&
    String(form.ordem || '').trim() !== '' &&
    String(form.data || '').trim() !== '' &&
    String(form.pelotao || '').trim() !== '' &&
    String(form.avaliador || '').trim() !== ''

  return (
    <div className="screen-container">
      <header className="header">
        <div className="header-emblem">🔥</div>
        <div className="header-titles">
          <span className="header-org">CBMAP – Corpo de Bombeiros Militar do Amapá</span>
          <span className="header-title">Operações de Corte de Árvore com Motosserra</span>
          <span className="header-subtitle">Ficha de Avaliação Prática – CFSD 2026</span>
        </div>
        <div className="header-spacer" />
        <div className="header-badge">CFSD 2026</div>
      </header>

      <div className="screen-content screen-content--centered">
        <div className="card card--form">
          <div style={{ marginBottom: 28 }}>
            <div className="card-label">Identificação</div>
            <h2 className="card-title">Dados do Aluno e Avaliador</h2>
            <p className="card-subtitle">
              Selecione o aluno e avaliador. Os dados serão preenchidos automaticamente.
            </p>
          </div>

          <div className="form-grid">

            <div className="form-group">
              <label className="form-label">Pelotão</label>
              <select
                className="form-input"
                name="pelotao"
                value={form.pelotao}
                onChange={handleChange}
                style={{ appearance: 'auto', cursor: 'pointer' }}
              >
                <option value="">Selecione um Pelotão</option>
                {pelotoes.map(p => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Data da Avaliação</label>
              <input
                className="form-input"
                type="date"
                name="data"
                value={form.data}
                onChange={handleChange}
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Aluno</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type="text"
                  placeholder={
                    form.pelotao
                      ? 'Digite ou selecione o aluno...'
                      : 'Selecione primeiro um pelotão...'
                  }
                  value={showAlunoList ? searchAluno : form.nome}
                  disabled={!form.pelotao}
                  onChange={e => {
                    setSearchAluno(e.target.value)
                    setShowAlunoList(true)
                  }}
                  onFocus={() => {
                    if (form.pelotao) setShowAlunoList(true)
                  }}
                  onBlur={() => setTimeout(() => setShowAlunoList(false), 150)}
                  autoComplete="off"
                />

                {showAlunoList && form.pelotao && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: '#1a1a1a',
                      border: '1px solid #444',
                      borderTop: 'none',
                      borderRadius: '0 0 8px 8px',
                      maxHeight: 280,
                      overflowY: 'auto',
                      zIndex: 20,
                    }}
                  >
                    {filteredStudents.length === 0 ? (
                      <div
                        style={{
                          padding: 12,
                          color: 'var(--text-muted)',
                          fontSize: 13,
                          textAlign: 'center',
                        }}
                      >
                        Nenhum aluno encontrado
                      </div>
                    ) : (
                      filteredStudents.map(student => (
                        <button
                          type="button"
                          key={student.numero}
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => selectStudent(student)}
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '12px 16px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '1px solid #2a2a2a',
                            color: 'var(--text-primary)',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: 14,
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#2a2a2a'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          <strong>{student.numero}</strong> – {student.nome}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nº</label>
              <input
                className="form-input"
                type="text"
                name="ordem"
                value={form.ordem}
                readOnly
                style={{
                  background: '#161616',
                  cursor: 'not-allowed',
                  color: 'var(--gold)',
                }}
                placeholder="Preenchido automaticamente"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Avaliador / Instrutor</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Digite ou selecione o instrutor..."
                  value={showInstrutorList ? searchInstrutor : form.avaliador}
                  onChange={e => {
                    setSearchInstrutor(e.target.value)
                    setShowInstrutorList(true)
                  }}
                  onFocus={() => setShowInstrutorList(true)}
                  onBlur={() => setTimeout(() => setShowInstrutorList(false), 150)}
                  autoComplete="off"
                />

                {showInstrutorList && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      background: '#1a1a1a',
                      border: '1px solid #444',
                      borderTop: 'none',
                      borderRadius: '0 0 8px 8px',
                      maxHeight: 240,
                      overflowY: 'auto',
                      zIndex: 20,
                    }}
                  >
                    {filteredInstructors.length === 0 ? (
                      <div
                        style={{
                          padding: 12,
                          color: 'var(--text-muted)',
                          fontSize: 13,
                          textAlign: 'center',
                        }}
                      >
                        Nenhum instrutor encontrado
                      </div>
                    ) : (
                      filteredInstructors.map(instructor => (
                        <button
                          type="button"
                          key={instructor}
                          onMouseDown={e => e.preventDefault()}
                          onClick={() => selectInstructor(instructor)}
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '12px 16px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: '1px solid #2a2a2a',
                            color: 'var(--text-primary)',
                            textAlign: 'left',
                            cursor: 'pointer',
                            fontSize: 14,
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#2a2a2a'
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent'
                          }}
                        >
                          {instructor}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="hint-box">
            <strong>ℹ Dica:</strong> Selecione primeiro o pelotão. Depois escolha o aluno. O
            número do aluno (Nº) é preenchido automaticamente.
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={() => goTo('evaluation')}
            disabled={!isValid}
            style={{ width: '100%' }}
          >
            Iniciar Avaliação →
          </button>
        </div>
      </div>
    </div>
  )
}