import { minutesBetween } from './dates'
import type { DateAdapter, DateRange, MonthModel, PositionedEvent, SchedulerEvent, SchedulerResource, TimelineModel } from './types'

const overlaps = (a: SchedulerEvent, b: SchedulerEvent, adapter: DateAdapter) =>
  adapter.parse(a.start) < adapter.parse(b.end) && adapter.parse(b.start) < adapter.parse(a.end)

/** Assigns stable collision columns to timed events. */
export function layoutOverlaps(events: readonly SchedulerEvent[], range: DateRange, adapter: DateAdapter): PositionedEvent[] {
  const rangeStart = adapter.parse(range.start)
  const rangeEnd = adapter.parse(range.end)
  const total = Math.max(1, minutesBetween(rangeStart, rangeEnd))
  const sorted = [...events].filter(event => overlaps(event, { id: '', title: '', ...range }, adapter)).sort((a, b) => a.start.localeCompare(b.start) || a.end.localeCompare(b.end))
  const active: { event: SchedulerEvent; column: number }[] = []
  const result: PositionedEvent[] = []
  for (const event of sorted) {
    const start = adapter.parse(event.start)
    for (let i = active.length - 1; i >= 0; i--) if (adapter.parse(active[i]!.event.end) <= start) active.splice(i, 1)
    const used = new Set(active.map(item => item.column))
    let column = 0
    while (used.has(column)) column++
    active.push({ event, column })
    const group = events.filter(candidate => overlaps(event, candidate, adapter))
    const columnCount = Math.max(column + 1, group.length)
    const clippedStart = new Date(Math.max(start.getTime(), rangeStart.getTime()))
    const clippedEnd = new Date(Math.min(adapter.parse(event.end).getTime(), rangeEnd.getTime()))
    result.push({ ...event, top: minutesBetween(rangeStart, clippedStart) / total * 100, height: Math.max(0.5, minutesBetween(clippedStart, clippedEnd) / total * 100), column, columnCount })
  }
  return result
}

export function buildResourceTimeline(input: {
  range: DateRange; events: readonly SchedulerEvent[]; resources: readonly SchedulerResource[]; adapter: DateAdapter;
  slotMinutes?: number; locale?: string; timeZone?: string
}): TimelineModel {
  const { range, events, resources, adapter } = input
  const slotMinutes = input.slotMinutes ?? 60
  const locale = input.locale ?? 'en-US'
  const timeZone = input.timeZone ?? 'UTC'
  const start = adapter.parse(range.start)
  const end = adapter.parse(range.end)
  if (end <= start) throw new RangeError('Timeline end must be after its start')
  const total = minutesBetween(start, end)
  const slots = []
  for (let cursor = start; cursor < end; cursor = adapter.addMinutes(cursor, slotMinutes)) {
    const slotEnd = new Date(Math.min(end.getTime(), adapter.addMinutes(cursor, slotMinutes).getTime()))
    slots.push({ start: adapter.toISO(cursor), end: adapter.toISO(slotEnd), label: adapter.format(cursor, { hour: 'numeric', minute: '2-digit' }, locale, timeZone) })
  }
  const rows = resources.map(resource => ({
    resource,
    events: events.filter(event => event.resourceId === resource.id && overlaps(event, { id: '', title: '', ...range }, adapter)).map(event => {
      const eventStart = adapter.parse(event.start)
      const eventEnd = adapter.parse(event.end)
      const visibleStart = new Date(Math.max(start.getTime(), eventStart.getTime()))
      const visibleEnd = new Date(Math.min(end.getTime(), eventEnd.getTime()))
      return { ...event, left: minutesBetween(start, visibleStart) / total * 100, width: Math.max(0.25, minutesBetween(visibleStart, visibleEnd) / total * 100), clippedStart: eventStart < start, clippedEnd: eventEnd > end }
    })
  }))
  return { range, slots, rows }
}

export function buildTimeGrid(input: { range: DateRange; events: readonly SchedulerEvent[]; adapter: DateAdapter }) {
  return layoutOverlaps(input.events.filter(event => !event.allDay), input.range, input.adapter)
}

export function buildMonth(input: {
  month: string; events: readonly SchedulerEvent[]; adapter: DateAdapter; weekStartsOn?: number; locale?: string; timeZone?: string; today?: string
}): MonthModel {
  const { adapter, events } = input
  const locale = input.locale ?? 'en-US'
  const timeZone = input.timeZone ?? 'UTC'
  const monthStart = adapter.startOfMonth(adapter.parse(input.month), timeZone)
  const gridStart = adapter.startOfWeek(monthStart, input.weekStartsOn ?? 1, timeZone)
  const todayKey = (input.today ? adapter.parse(input.today) : new Date()).toISOString().slice(0, 10)
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = adapter.addDays(gridStart, index)
    const next = adapter.addDays(date, 1)
    const key = date.toISOString().slice(0, 10)
    return {
      date: adapter.toISO(date), dayNumber: date.getUTCDate(), outside: date.getUTCMonth() !== monthStart.getUTCMonth(), today: key === todayKey,
      events: events.filter(event => adapter.parse(event.start) < next && adapter.parse(event.end) > date)
    }
  })
  return {
    key: monthStart.toISOString().slice(0, 7),
    label: adapter.format(monthStart, { month: 'long', year: 'numeric' }, locale, timeZone),
    weeks: Array.from({ length: 6 }, (_, index) => days.slice(index * 7, index * 7 + 7))
  }
}

/** Returns an overscanned virtual month window for continuous vertical scrolling. */
export function getContinuousMonthWindow(input: { anchor: string; scrollTop: number; monthHeight: number; count?: number; overscan?: number; adapter: DateAdapter }) {
  if (input.monthHeight <= 0) throw new RangeError('monthHeight must be positive')
  const count = input.count ?? 24
  const overscan = input.overscan ?? 1
  const center = Math.floor(input.scrollTop / input.monthHeight)
  const startIndex = Math.max(-count, center - overscan)
  const endIndex = Math.min(count, center + Math.ceil(800 / input.monthHeight) + overscan)
  const anchor = input.adapter.startOfMonth(input.adapter.parse(input.anchor), 'UTC')
  return Array.from({ length: endIndex - startIndex + 1 }, (_, offset) => {
    const index = startIndex + offset
    return { index, month: input.adapter.toISO(input.adapter.addMonths(anchor, index)), offset: index * input.monthHeight }
  })
}
