import { useEffect, useRef, useState } from 'react'

const POPOVER_WIDTH = 200

export default function VcTooltip({ label, lines, children }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const triggerRef = useRef(null)
  const popoverRef = useRef(null)

  function handleToggle(e) {
    e.stopPropagation()
    if (open) {
      setOpen(false)
      return
    }
    const r = triggerRef.current.getBoundingClientRect()
    const gap = 6
    const top = r.bottom + gap
    const idealLeft = r.left + r.width / 2 - POPOVER_WIDTH / 2
    const left = Math.max(8, Math.min(idealLeft, window.innerWidth - POPOVER_WIDTH - 8))
    setPos({ top, left })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return

    function handleOutside(e) {
      if (popoverRef.current?.contains(e.target) || triggerRef.current?.contains(e.target)) return
      setOpen(false)
    }

    function handleScroll() {
      setOpen(false)
    }

    document.addEventListener('pointerdown', handleOutside)
    document.addEventListener('scroll', handleScroll, true)
    return () => {
      document.removeEventListener('pointerdown', handleOutside)
      document.removeEventListener('scroll', handleScroll, true)
    }
  }, [open])

  return (
    <>
      <span
        ref={triggerRef}
        onClick={handleToggle}
        className="vc-tooltip-trigger"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleToggle(e)
        }}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {children}
      </span>
      {open && (
        <div
          ref={popoverRef}
          className="vc-tooltip-popover"
          style={{ top: pos.top, left: pos.left, width: POPOVER_WIDTH }}
          role="tooltip"
        >
          <div className="vc-tooltip-label">{label}</div>
          {lines.map((line, i) => (
            <div key={i} className="vc-tooltip-line">{line}</div>
          ))}
        </div>
      )}
    </>
  )
}
