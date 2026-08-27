import type { PointerMode, PointerPreview, SchedulerEvent } from './types'

export interface PointerInteractionOptions {
  mode: PointerMode
  event?: SchedulerEvent
  start?: string
  end?: string
  resourceId?: string
  pixelsPerMinute: number
  snapMinutes?: number
  onPreview(preview: PointerPreview): void
  onCommit(preview: PointerPreview): void
  onCancel?: () => void
}

const iso = (ms: number) => new Date(ms).toISOString()
const snap = (minutes: number, step: number) => Math.round(minutes / step) * step

/** Pointer Events helper for mouse, pen, and touch with capture and snapping. */
export function createPointerInteraction(options: PointerInteractionOptions) {
  const step = options.snapMinutes ?? 15
  const baseStart = new Date(options.event?.start ?? options.start ?? '').getTime()
  const baseEnd = new Date(options.event?.end ?? options.end ?? '').getTime()
  if (!Number.isFinite(baseStart) || !Number.isFinite(baseEnd) || baseEnd <= baseStart) throw new RangeError('Pointer interaction requires a valid start and end')
  if (!(options.pixelsPerMinute > 0)) throw new RangeError('pixelsPerMinute must be positive')
  let origin = 0
  let activePointer: number | undefined
  const resourceId = options.resourceId ?? options.event?.resourceId
  let preview: PointerPreview = { start: iso(baseStart), end: iso(baseEnd), ...(resourceId ? { resourceId } : {}) }
  const calculate = (clientX: number): PointerPreview => {
    const delta = snap((clientX - origin) / options.pixelsPerMinute, step) * 60_000
    let start = baseStart
    let end = baseEnd
    if (options.mode === 'move') { start += delta; end += delta }
    if (options.mode === 'create' || options.mode === 'resize-end') end = Math.max(start + step * 60_000, baseEnd + delta)
    if (options.mode === 'resize-start') start = Math.min(end - step * 60_000, baseStart + delta)
    return { ...preview, start: iso(start), end: iso(end) }
  }
  return {
    onPointerDown(event: PointerEvent) {
      if (event.button !== 0) return
      origin = event.clientX
      activePointer = event.pointerId
      ;(event.currentTarget as Element | null)?.setPointerCapture?.(event.pointerId)
      event.preventDefault()
    },
    onPointerMove(event: PointerEvent) {
      if (event.pointerId !== activePointer) return
      preview = calculate(event.clientX)
      options.onPreview(preview)
    },
    onPointerUp(event: PointerEvent) {
      if (event.pointerId !== activePointer) return
      preview = calculate(event.clientX)
      activePointer = undefined
      options.onCommit(preview)
    },
    onPointerCancel(event: PointerEvent) { if (event.pointerId === activePointer) { activePointer = undefined; options.onCancel?.() } },
    getPreview: () => preview
  }
}

export interface GridNavigationInput { key: string; index: number; columns: number; count: number; pageSize?: number; rtl?: boolean }
/** Maps ARIA grid keys to a clamped cell index; returns null for unhandled keys. */
export function getGridNavigation(input: GridNavigationInput): number | null {
  const { key, index, columns, count } = input
  const horizontal = input.rtl ? { ArrowLeft: 1, ArrowRight: -1 } : { ArrowLeft: -1, ArrowRight: 1 }
  const delta: Record<string, number> = { ...horizontal, ArrowUp: -columns, ArrowDown: columns, PageUp: -(input.pageSize ?? columns * 4), PageDown: input.pageSize ?? columns * 4 }
  if (key === 'Home') return Math.floor(index / columns) * columns
  if (key === 'End') return Math.min(count - 1, Math.floor(index / columns) * columns + columns - 1)
  if (!(key in delta)) return null
  return Math.max(0, Math.min(count - 1, index + delta[key]!))
}
