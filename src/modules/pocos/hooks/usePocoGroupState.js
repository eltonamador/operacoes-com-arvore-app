import { useState } from 'react'

/**
 * Hook de estado para avaliação em grupo — módulo Poços.
 *
 * Modelo: 1 grupo → 1 avaliação → 1 nota final → N assinaturas individuais por PIN.
 *
 * groupData.integrantes: [{ id, nome, extra?, pin?, signed, signedAt }]
 *   - id: número de ordem (chave principal)
 *   - extra: true quando adicionado manualmente fora da lista oficial
 *   - pin: presente somente quando extra:true (digitado no formulário)
 *   - signed/signedAt: preenchidos durante a etapa de assinatura
 */

const initialGroupData = {
  pelotao: '',
  grupoNum: null,
  integrantes: [],
  avaliador: '',
  data: '',
}

const initialState = {
  groupData: initialGroupData,
  checkedItems: new Set(),
  itemQuantities: {},   // { [itemId]: number } — só para itens perUnit
  criticalErrors: false,
  observations: '',
  customError: { description: '', discount: '' },
  currentSignerIndex: 0,
  screen: 'form',
}

export function usePocoGroupState() {
  const [state, setState] = useState(initialState)

  function updateGroupData(partial) {
    setState(s => ({ ...s, groupData: { ...s.groupData, ...partial } }))
  }

  function toggleItem(id) {
    setState(s => {
      const next = new Set(s.checkedItems)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { ...s, checkedItems: next }
    })
  }

  function setCriticalErrors(val) {
    setState(s => ({ ...s, criticalErrors: val }))
  }

  function setObservations(val) {
    setState(s => ({ ...s, observations: val }))
  }

  function setCustomError(val) {
    setState(s => ({ ...s, customError: val }))
  }

  /**
   * Define a quantidade de um item "por unidade".
   * qty <= 0  → desmarca o item e remove a entrada.
   * qty > 0   → marca o item e registra a quantidade.
   */
  function setItemQuantity(id, qty) {
    setState(s => {
      const quantities = { ...s.itemQuantities }
      const checkedItems = new Set(s.checkedItems)
      if (qty <= 0) {
        delete quantities[id]
        checkedItems.delete(id)
      } else {
        quantities[id] = qty
        checkedItems.add(id)
      }
      return { ...s, itemQuantities: quantities, checkedItems }
    })
  }

  /**
   * Registra a assinatura do integrante no índice `index` e avança o cursor.
   * Quando todos assinaram (cursor >= integrantes.length) navega para 'summary'.
   */
  function confirmMemberSignature(index) {
    setState(s => {
      const integrantes = s.groupData.integrantes.map((m, i) =>
        i === index
          ? { ...m, signed: true, signedAt: new Date().toISOString() }
          : m
      )
      const nextIndex = index + 1
      const allSigned = nextIndex >= integrantes.length

      return {
        ...s,
        groupData: { ...s.groupData, integrantes },
        currentSignerIndex: nextIndex,
        screen: allSigned ? 'summary' : s.screen,
      }
    })
  }

  function goTo(screen) {
    setState(s => ({ ...s, screen }))
  }

  function reset() {
    setState(initialState)
  }

  return {
    state,
    updateGroupData,
    toggleItem,
    setCriticalErrors,
    setObservations,
    setCustomError,
    setItemQuantity,
    confirmMemberSignature,
    goTo,
    reset,
  }
}
