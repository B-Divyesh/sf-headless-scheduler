import type { DateAdapter } from './types.js'

interface ZonedParts { year: number; month: number; day: number; hour: number; minute: number; second: number }

const zonedFormatterCache = new Map<string, Intl.DateTimeFormat>()

function zonedFormatter(timeZone: string) {
  let formatter = zonedFormatterCache.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US-u-ca-iso8601', {
      timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
    })
    zonedFormatterCache.set(timeZone, formatter)
  }
  return formatter
}

/** Returns Gregorian calendar fields for an instant in an IANA timezone. */
function partsInZone(value: Date, timeZone: string): ZonedParts {
  const fields = Object.fromEntries(zonedFormatter(timeZone).formatToParts(value)
    .filter(part => part.type !== 'literal')
    .map(part => [part.type, Number(part.value)])) as Record<string, number>
  return {
    year: fields.year!, month: fields.month!, day: fields.day!, hour: fields.hour!,
    minute: fields.minute!, second: fields.second!
  }
}

function offsetAt(value: Date, timeZone: string) {
  const parts = partsInZone(value, timeZone)
  return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) - value.getTime()
}

/**
 * Converts a wall-clock calendar value to its instant without relying on the
 * host machine timezone. A second offset lookup handles DST transitions.
 */
function fromZonedParts(parts: ZonedParts, milliseconds: number, timeZone: string) {
  const wallClock = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, milliseconds)
  let instant = wallClock - offsetAt(new Date(wallClock), timeZone)
  instant = wallClock - offsetAt(new Date(instant), timeZone)
  return new Date(instant)
}

function calendarAdd(value: Date, amount: number, timeZone: string, unit: 'days' | 'months') {
  const parts = partsInZone(value, timeZone)
  const wallClock = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, value.getUTCMilliseconds()))
  if (unit === 'days') wallClock.setUTCDate(wallClock.getUTCDate() + amount)
  else wallClock.setUTCMonth(wallClock.getUTCMonth() + amount)
  return fromZonedParts({
    year: wallClock.getUTCFullYear(), month: wallClock.getUTCMonth() + 1, day: wallClock.getUTCDate(),
    hour: wallClock.getUTCHours(), minute: wallClock.getUTCMinutes(), second: wallClock.getUTCSeconds()
  }, wallClock.getUTCMilliseconds(), timeZone)
}

export const nativeDateAdapter: DateAdapter = {
  parse(value) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) throw new RangeError(`Invalid ISO date: ${value}`)
    return date
  },
  toISO: value => value.toISOString(),
  addMinutes(value, amount) { return new Date(value.getTime() + amount * 60_000) },
  addDays(value, amount, timeZone = 'UTC') { return calendarAdd(value, amount, timeZone, 'days') },
  addMonths(value, amount, timeZone = 'UTC') { return calendarAdd(value, amount, timeZone, 'months') },
  startOfDay(value, timeZone = 'UTC') {
    const parts = partsInZone(value, timeZone)
    return fromZonedParts({ ...parts, hour: 0, minute: 0, second: 0 }, 0, timeZone)
  },
  startOfWeek(value, weekStartsOn, timeZone = 'UTC') {
    const day = this.startOfDay(value, timeZone)
    const parts = partsInZone(day, timeZone)
    const weekDay = new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay()
    return this.addDays(day, -((weekDay - weekStartsOn + 7) % 7), timeZone)
  },
  startOfMonth(value, timeZone = 'UTC') {
    const parts = partsInZone(value, timeZone)
    return fromZonedParts({ ...parts, day: 1, hour: 0, minute: 0, second: 0 }, 0, timeZone)
  },
  format(value, options, locale, timeZone) { return new Intl.DateTimeFormat(locale, { ...options, timeZone }).format(value) }
}

interface TemporalLike {
  Instant: { from(value: string): { toZonedDateTimeISO(zone: string): TemporalZoned } }
}
interface TemporalZoned {
  startOfDay(): TemporalZoned
  subtract(duration: Record<string, number>): TemporalZoned
  add(duration: Record<string, number>): TemporalZoned
  with(fields: Record<string, number>): TemporalZoned
  toInstant(): { toString(): string }
  dayOfWeek: number
}

/** DateAdapter backed by native Temporal or @js-temporal/polyfill.
 *
 * `defaultTimeZone` is used for direct calendar additions. Scheduler view
 * calculations pass their configured `timeZone` explicitly.
 */
export function createTemporalAdapter(Temporal: TemporalLike, defaultTimeZone = 'UTC'): DateAdapter {
  const zoned = (value: Date, timeZone: string) => Temporal.Instant.from(value.toISOString()).toZonedDateTimeISO(timeZone)
  return {
    ...nativeDateAdapter,
    startOfDay(value, timeZone) { return new Date(zoned(value, timeZone).startOfDay().toInstant().toString()) },
    startOfWeek(value, weekStartsOn, timeZone) {
      const date = zoned(value, timeZone).startOfDay()
      const jsDay = date.dayOfWeek % 7
      return new Date(date.subtract({ days: (jsDay - weekStartsOn + 7) % 7 }).toInstant().toString())
    },
    startOfMonth(value, timeZone) { return new Date(zoned(value, timeZone).with({ day: 1 }).startOfDay().toInstant().toString()) },
    addDays(value, amount, timeZone) { return new Date(zoned(value, timeZone ?? defaultTimeZone).add({ days: amount }).toInstant().toString()) },
    addMonths(value, amount, timeZone) { return new Date(zoned(value, timeZone ?? defaultTimeZone).add({ months: amount }).toInstant().toString()) }
  }
}

export interface DateFnsFunctions {
  addMinutes(date: Date, amount: number): Date
  addDays?: (date: Date, amount: number) => Date
  addMonths?: (date: Date, amount: number) => Date
  startOfDay(date: Date): Date
  startOfWeek(date: Date, options: { weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6 }): Date
  startOfMonth?: (date: Date) => Date
  format(date: Date, format: string): string
}

/** Uses caller-provided date-fns functions, keeping date-fns out of the core bundle. */
export function createDateFnsAdapter(fn: DateFnsFunctions): DateAdapter {
  return {
    ...nativeDateAdapter,
    addMinutes: fn.addMinutes,
    addDays: fn.addDays ?? nativeDateAdapter.addDays,
    addMonths: fn.addMonths ?? nativeDateAdapter.addMonths,
    startOfDay: value => fn.startOfDay(value),
    startOfWeek: (value, weekStartsOn) => fn.startOfWeek(value, { weekStartsOn: weekStartsOn as 0 | 1 | 2 | 3 | 4 | 5 | 6 }),
    startOfMonth: fn.startOfMonth ? value => fn.startOfMonth!(value) : nativeDateAdapter.startOfMonth,
    format(value, options, locale, timeZone) {
      const token = options.month === 'long' ? 'MMMM yyyy' : options.weekday ? 'EEE d' : options.hour ? 'HH:mm' : 'yyyy-MM-dd'
      return fn.format(value, token) || nativeDateAdapter.format(value, options, locale, timeZone)
    }
  }
}

export function minutesBetween(start: Date, end: Date): number { return (end.getTime() - start.getTime()) / 60_000 }
export function clampDate(value: Date, start: Date, end: Date): Date { return new Date(Math.min(end.getTime(), Math.max(start.getTime(), value.getTime()))) }
