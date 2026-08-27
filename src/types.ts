export type SchedulerView = 'day' | 'week' | 'month' | 'resource-timeline'

export interface DateRange { start: string; end: string }
export interface SchedulerResource { id: string; title: string; group?: string; meta?: Readonly<Record<string, unknown>> }
export interface SchedulerEvent {
  id: string
  title: string
  start: string
  end: string
  resourceId?: string
  allDay?: boolean
  disabled?: boolean
  meta?: Readonly<Record<string, unknown>>
}

export interface DateAdapter {
  parse(value: string): Date
  toISO(value: Date): string
  addMinutes(value: Date, amount: number): Date
  /** Adds calendar days. Pass the scheduler timezone when calendar boundaries matter. */
  addDays(value: Date, amount: number, timeZone?: string): Date
  /** Adds calendar months. Pass the scheduler timezone when calendar boundaries matter. */
  addMonths(value: Date, amount: number, timeZone?: string): Date
  startOfDay(value: Date, timeZone: string): Date
  startOfWeek(value: Date, weekStartsOn: number, timeZone: string): Date
  startOfMonth(value: Date, timeZone: string): Date
  format(value: Date, options: Intl.DateTimeFormatOptions, locale: string, timeZone: string): string
}

export type SchedulerChange =
  | { type: 'create'; event: SchedulerEvent }
  | { type: 'update' | 'move' | 'resize'; event: SchedulerEvent; previous: SchedulerEvent }
  | { type: 'remove'; event: SchedulerEvent }

export interface SchedulerOptions {
  dateAdapter?: DateAdapter
  initialView?: SchedulerView
  anchorDate?: string
  visibleRange?: DateRange
  events?: readonly SchedulerEvent[]
  resources?: readonly SchedulerResource[]
  locale?: string
  timeZone?: string
  weekStartsOn?: number
  slotMinutes?: number
  onEventsChange?: (events: readonly SchedulerEvent[], change: SchedulerChange) => void
}

export interface SchedulerState {
  view: SchedulerView
  anchorDate: string
  visibleRange: DateRange
  events: readonly SchedulerEvent[]
  resources: readonly SchedulerResource[]
  locale: string
  timeZone: string
  weekStartsOn: number
  slotMinutes: number
  announcement: string
}

export interface MoveEventPatch { start: string; resourceId?: string }
export interface ResizeEventPatch { start?: string; end?: string }

export interface Scheduler {
  getState(): SchedulerState
  subscribe(listener: (state: SchedulerState) => void): () => void
  setView(view: SchedulerView): void
  setAnchorDate(date: string): void
  setVisibleRange(range: DateRange): void
  setEvents(events: readonly SchedulerEvent[]): void
  setResources(resources: readonly SchedulerResource[]): void
  createEvent(event: SchedulerEvent): void
  updateEvent(id: string, patch: Partial<Omit<SchedulerEvent, 'id'>>): void
  moveEvent(id: string, patch: MoveEventPatch): void
  resizeEvent(id: string, patch: ResizeEventPatch): void
  removeEvent(id: string): void
  navigate(direction: -1 | 1 | 'today'): void
  announce(message: string): void
}

export interface PositionedEvent extends SchedulerEvent {
  top: number
  height: number
  column: number
  columnCount: number
}

export interface TimelineItem extends SchedulerEvent { left: number; width: number; clippedStart: boolean; clippedEnd: boolean }
export interface TimelineRow { resource: SchedulerResource; events: readonly TimelineItem[] }
export interface TimelineModel { range: DateRange; slots: readonly { start: string; end: string; label: string }[]; rows: readonly TimelineRow[] }

export interface MonthDay { date: string; dayNumber: number; outside: boolean; today: boolean; events: readonly SchedulerEvent[] }
export interface MonthModel { key: string; label: string; weeks: readonly (readonly MonthDay[])[] }

export interface PointerPreview { start: string; end: string; resourceId?: string }
export type PointerMode = 'create' | 'move' | 'resize-start' | 'resize-end'
