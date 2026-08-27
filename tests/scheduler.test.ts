import { describe, expect, it, vi } from 'vitest'
import {
  buildMonth, buildResourceTimeline, createPointerInteraction, createScheduler,
  getContinuousMonthWindow, getGridNavigation, layoutOverlaps, nativeDateAdapter,
  type PointerPreview
} from '../src'

const resources = [{ id: 'room-a', title: 'Room A' }, { id: 'room-b', title: 'Room B' }]
const events = [
  { id: 'kickoff', title: 'Kickoff', resourceId: 'room-a', start: '2026-08-27T09:00:00.000Z', end: '2026-08-27T10:30:00.000Z' },
  { id: 'review', title: 'Review', resourceId: 'room-a', start: '2026-08-27T10:00:00.000Z', end: '2026-08-27T11:00:00.000Z' }
]
const range = { start: '2026-08-27T08:00:00.000Z', end: '2026-08-27T18:00:00.000Z' }

describe('createScheduler', () => {
  it('runs the README resource move example and preserves duration', () => {
    const onEventsChange = vi.fn()
    const scheduler = createScheduler({ dateAdapter: nativeDateAdapter, initialView: 'resource-timeline', visibleRange: range, resources, events: [events[0]!], onEventsChange })
    const states: string[] = []
    const unsubscribe = scheduler.subscribe(state => states.push(state.events[0]!.start))
    scheduler.moveEvent('kickoff', { resourceId: 'room-b', start: '2026-08-27T11:00:00Z' })
    expect(scheduler.getState().events[0]).toMatchObject({ resourceId: 'room-b', start: '2026-08-27T11:00:00.000Z', end: '2026-08-27T12:30:00.000Z' })
    expect(onEventsChange).toHaveBeenCalledWith(expect.any(Array), expect.objectContaining({ type: 'move' }))
    expect(states).toHaveLength(2)
    unsubscribe()
  })

  it('validates duplicate ids and invalid ranges', () => {
    expect(() => createScheduler({ events: [events[0]!, events[0]!] })).toThrow('Duplicate event id')
    expect(() => createScheduler({ visibleRange: { start: range.end, end: range.start } })).toThrow('visibleRange.end')
  })

  it('supports create, resize, update, remove and navigation', () => {
    const scheduler = createScheduler({ anchorDate: '2026-08-27T09:00:00Z', initialView: 'week' })
    scheduler.createEvent(events[0]!)
    scheduler.resizeEvent('kickoff', { end: '2026-08-27T11:00:00Z' })
    scheduler.updateEvent('kickoff', { title: 'Planning' })
    scheduler.navigate(1)
    expect(scheduler.getState().anchorDate).toBe('2026-09-03T09:00:00.000Z')
    scheduler.removeEvent('kickoff')
    expect(scheduler.getState().events).toEqual([])
  })
})

describe('view models', () => {
  it('builds resource rows, slots and clipped percentages', () => {
    const timeline = buildResourceTimeline({ range, events, resources, adapter: nativeDateAdapter, slotMinutes: 60 })
    expect(timeline.slots).toHaveLength(10)
    expect(timeline.rows[0]!.events[0]).toMatchObject({ left: 10, width: 15 })
    expect(timeline.rows[1]!.events).toHaveLength(0)
  })

  it('lays overlapping events into columns', () => {
    const laidOut = layoutOverlaps(events, range, nativeDateAdapter)
    expect(laidOut.map(event => event.column)).toEqual([0, 1])
    expect(laidOut.every(event => event.columnCount === 2)).toBe(true)
  })

  it('keeps collision cluster widths consistent for chained overlaps', () => {
    const chained = [
      { id: 'a', title: 'A', start: '2026-08-27T09:00:00Z', end: '2026-08-27T12:00:00Z' },
      { id: 'b', title: 'B', start: '2026-08-27T09:30:00Z', end: '2026-08-27T10:00:00Z' },
      { id: 'c', title: 'C', start: '2026-08-27T10:15:00Z', end: '2026-08-27T11:00:00Z' }
    ]
    expect(layoutOverlaps(chained, range, nativeDateAdapter).map(event => event.columnCount)).toEqual([2, 2, 2])
  })

  it('builds a six-week month and an overscanned virtual window', () => {
    const month = buildMonth({ month: '2026-08-10T00:00:00Z', events, adapter: nativeDateAdapter, today: '2026-08-27T00:00:00Z' })
    expect(month.label).toContain('August')
    expect(month.weeks).toHaveLength(6)
    expect(month.weeks.flat().find(day => day.today)?.events).toHaveLength(2)
    const window = getContinuousMonthWindow({ anchor: '2026-08-01T00:00:00Z', scrollTop: 600, monthHeight: 600, adapter: nativeDateAdapter })
    expect(window.some(item => item.index === 1)).toBe(true)
  })
})

describe('interaction primitives', () => {
  it('snaps a drag and commits it', () => {
    const onCommit = vi.fn()
    const interaction = createPointerInteraction({ mode: 'move', event: events[0]!, pixelsPerMinute: 2, snapMinutes: 15, onPreview: vi.fn(), onCommit })
    const target = { setPointerCapture: vi.fn() }
    interaction.onPointerDown({ button: 0, clientX: 100, pointerId: 2, currentTarget: target, preventDefault: vi.fn() } as unknown as PointerEvent)
    interaction.onPointerUp({ clientX: 163, pointerId: 2 } as PointerEvent)
    expect(onCommit).toHaveBeenCalledWith(expect.objectContaining({ start: '2026-08-27T09:30:00.000Z', end: '2026-08-27T11:00:00.000Z' }))
  })

  it('creates and resizes with a minimum snapped duration', () => {
    const commits: PointerPreview[] = []
    const create = createPointerInteraction({ mode: 'create', start: '2026-08-27T09:00:00Z', end: '2026-08-27T09:15:00Z', pixelsPerMinute: 1, snapMinutes: 15, onPreview: () => undefined, onCommit: value => commits.push(value) })
    create.onPointerDown({ button: 0, clientX: 0, pointerId: 1, currentTarget: null, preventDefault() {} } as unknown as PointerEvent)
    create.onPointerUp({ clientX: 4, pointerId: 1 } as PointerEvent)
    expect(commits[0]!.end).toBe('2026-08-27T09:15:00.000Z')
  })

  it('maps standard ARIA grid keys', () => {
    expect(getGridNavigation({ key: 'ArrowDown', index: 3, columns: 7, count: 42 })).toBe(10)
    expect(getGridNavigation({ key: 'Home', index: 10, columns: 7, count: 42 })).toBe(7)
    expect(getGridNavigation({ key: 'Escape', index: 10, columns: 7, count: 42 })).toBeNull()
  })
})
