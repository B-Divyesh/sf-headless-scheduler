import type { DateAdapter } from './types'

const copy = (date: Date) => new Date(date.getTime())

export const nativeDateAdapter: DateAdapter = {
  parse(value) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) throw new RangeError(`Invalid ISO date: ${value}`)
    return date
  },
  toISO: value => value.toISOString(),
  addMinutes(value, amount) { return new Date(value.getTime() + amount * 60_000) },
  addDays(value, amount) { const next = copy(value); next.setUTCDate(next.getUTCDate() + amount); return next },
  addMonths(value, amount) { const next = copy(value); next.setUTCMonth(next.getUTCMonth() + amount); return next },
  startOfDay(value) { return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate())) },
  startOfWeek(value, weekStartsOn, timeZone) {
    const day = this.startOfDay(value, timeZone)
    return this.addDays(day, -((day.getUTCDay() - weekStartsOn + 7) % 7))
  },
  startOfMonth(value) { return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), 1)) },
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

/** DateAdapter backed by native Temporal or @js-temporal/polyfill. */
export function createTemporalAdapter(Temporal: TemporalLike): DateAdapter {
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
    addDays(value, amount) { return new Date(zoned(value, 'UTC').add({ days: amount }).toInstant().toString()) },
    addMonths(value, amount) { return new Date(zoned(value, 'UTC').add({ months: amount }).toInstant().toString()) }
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
