import { nativeDateAdapter } from './dates.js'
import type { DateRange, MoveEventPatch, ResizeEventPatch, Scheduler, SchedulerChange, SchedulerEvent, SchedulerOptions, SchedulerState, SchedulerView } from './types.js'

const duration = (event: SchedulerEvent) => new Date(event.end).getTime() - new Date(event.start).getTime()
const validRange = (range: DateRange) => new Date(range.end) > new Date(range.start)
const isoInstant = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/

function assertISOInstant(value: string, field: string) {
  if (!isoInstant.test(value) || !Number.isFinite(new Date(value).getTime())) {
    throw new RangeError(`${field} must be an ISO date-time with Z or an offset`)
  }
}

function assertEvent(event: SchedulerEvent, events: readonly SchedulerEvent[], ignoreId?: string) {
  if (!event.id.trim() || !event.title.trim()) throw new TypeError('Events require a non-empty id and title')
  assertISOInstant(event.start, `Event ${event.id} start`)
  assertISOInstant(event.end, `Event ${event.id} end`)
  if (events.some(item => item.id === event.id && item.id !== ignoreId)) throw new TypeError(`Duplicate event id: ${event.id}`)
  if (!(new Date(event.end) > new Date(event.start))) throw new RangeError(`Event ${event.id} must end after it starts`)
}

function defaultRange(anchor: Date, view: SchedulerView, adapter = nativeDateAdapter, timeZone = 'UTC', weekStartsOn = 1): DateRange {
  const dayStart = adapter.startOfDay(anchor, timeZone)
  const start = view === 'month'
    ? adapter.startOfWeek(adapter.startOfMonth(anchor, timeZone), weekStartsOn, timeZone)
    : view === 'week' ? adapter.startOfWeek(dayStart, weekStartsOn, timeZone) : dayStart
  const days = view === 'week' ? 7 : view === 'month' ? 42 : 1
  return { start: adapter.toISO(start), end: adapter.toISO(adapter.addDays(start, days, timeZone)) }
}

export function createScheduler(options: SchedulerOptions = {}): Scheduler {
  const adapter = options.dateAdapter ?? nativeDateAdapter
  const anchor = adapter.parse(options.anchorDate ?? new Date().toISOString())
  const initialView = options.initialView ?? 'week'
  const timeZone = options.timeZone ?? 'UTC'
  const weekStartsOn = options.weekStartsOn ?? 1
  const slotMinutes = options.slotMinutes ?? 30
  if (!Number.isFinite(slotMinutes) || slotMinutes <= 0) throw new RangeError('slotMinutes must be a positive finite number')
  const initialRange = options.visibleRange ?? defaultRange(anchor, initialView, adapter, timeZone, weekStartsOn)
  if (!validRange(initialRange)) throw new RangeError('visibleRange.end must be after visibleRange.start')
  const initialEvents = [...(options.events ?? [])]
  const initialIds = new Set<string>()
  initialEvents.forEach(event => {
    if (initialIds.has(event.id)) throw new TypeError(`Duplicate event id: ${event.id}`)
    initialIds.add(event.id)
    assertEvent(event, [], event.id)
  })
  let state: SchedulerState = Object.freeze({
    view: initialView, anchorDate: adapter.toISO(anchor), visibleRange: { ...initialRange }, events: Object.freeze(initialEvents),
    resources: Object.freeze([...(options.resources ?? [])]), locale: options.locale ?? 'en-US', timeZone,
    weekStartsOn, slotMinutes, announcement: ''
  })
  const listeners = new Set<(value: SchedulerState) => void>()
  const publish = (patch: Partial<SchedulerState>) => { state = Object.freeze({ ...state, ...patch }); listeners.forEach(listener => listener(state)) }
  const changed = (events: SchedulerEvent[], change: SchedulerChange) => { publish({ events: Object.freeze(events) }); options.onEventsChange?.(state.events, change) }
  const find = (id: string) => {
    const event = state.events.find(item => item.id === id)
    if (!event) throw new RangeError(`Unknown event: ${id}`)
    return event
  }
  const replace = (previous: SchedulerEvent, event: SchedulerEvent, type: 'update' | 'move' | 'resize') => {
    assertEvent(event, state.events, previous.id)
    changed(state.events.map(item => item.id === previous.id ? event : item), { type, event, previous })
  }
  return {
    getState: () => state,
    subscribe(listener) { listeners.add(listener); listener(state); return () => listeners.delete(listener) },
    setView(view) { publish({ view, visibleRange: defaultRange(adapter.parse(state.anchorDate), view, adapter, state.timeZone, state.weekStartsOn) }) },
    setAnchorDate(date) { const next = adapter.parse(date); publish({ anchorDate: adapter.toISO(next), visibleRange: defaultRange(next, state.view, adapter, state.timeZone, state.weekStartsOn) }) },
    setVisibleRange(range) { if (!validRange(range)) throw new RangeError('visibleRange.end must be after visibleRange.start'); publish({ visibleRange: { ...range } }) },
    setEvents(events) {
      const next = [...events]
      const ids = new Set<string>()
      next.forEach(event => { if (ids.has(event.id)) throw new TypeError(`Duplicate event id: ${event.id}`); ids.add(event.id); assertEvent(event, [], event.id) })
      publish({ events: Object.freeze(next) })
    },
    setResources(resources) { publish({ resources: Object.freeze([...resources]) }) },
    createEvent(event) { assertEvent(event, state.events); changed([...state.events, { ...event }], { type: 'create', event }) },
    updateEvent(id, patch) { const previous = find(id); replace(previous, { ...previous, ...patch }, 'update') },
    moveEvent(id, patch: MoveEventPatch) {
      const previous = find(id)
      assertISOInstant(patch.start, `Event ${id} start`)
      const start = adapter.parse(patch.start)
      const next: SchedulerEvent = { ...previous, start: adapter.toISO(start), end: adapter.toISO(new Date(start.getTime() + duration(previous))) }
      if (patch.resourceId !== undefined) next.resourceId = patch.resourceId
      replace(previous, next, 'move')
    },
    resizeEvent(id, patch: ResizeEventPatch) { const previous = find(id); replace(previous, { ...previous, ...patch }, 'resize') },
    removeEvent(id) { const event = find(id); changed(state.events.filter(item => item.id !== id), { type: 'remove', event }) },
    navigate(direction) {
      const current = adapter.parse(state.anchorDate)
      const next = direction === 'today' ? new Date() : state.view === 'month' ? adapter.addMonths(current, direction, state.timeZone) : adapter.addDays(current, direction * (state.view === 'week' ? 7 : 1), state.timeZone)
      publish({ anchorDate: adapter.toISO(next), visibleRange: defaultRange(next, state.view, adapter, state.timeZone, state.weekStartsOn) })
    },
    announce(message) { publish({ announcement: message }) }
  }
}
