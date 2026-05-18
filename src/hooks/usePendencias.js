import { useCallback, useEffect, useState } from 'react'
import { fetchRelatorioPendencias, DATA_INICIO_TURMA } from '../services/pendenciasService'

/**
 * Hook que carrega o relatório de pendências da turma (read-only).
 * Aceita `dataInicio` para casos especiais; padrão = DATA_INICIO_TURMA.
 */
export default function usePendencias({ dataInicio = DATA_INICIO_TURMA, autoLoad = true } = {}) {
  const [linhas, setLinhas] = useState([])
  const [estatisticas, setEstatisticas] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { linhas: l, estatisticas: e } = await fetchRelatorioPendencias({ dataInicio })
      setLinhas(l)
      setEstatisticas(e)
    } catch (err) {
      setError(err.message || 'Erro ao carregar relatório de pendências.')
    } finally {
      setLoading(false)
    }
  }, [dataInicio])

  useEffect(() => {
    if (autoLoad) load()
  }, [autoLoad, load])

  return { linhas, estatisticas, loading, error, reload: load }
}
