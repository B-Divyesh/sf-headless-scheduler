import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { buildResourceTimeline } from './layout'
import { createScheduler } from './store'
import { nativeDateAdapter } from './dates'
import type { Scheduler, SchedulerOptions, SchedulerState, TimelineModel } from './types'

export function useScheduler(options: SchedulerOptions): { scheduler: Scheduler; state: SchedulerState } {
  const scheduler = useMemo(() => createScheduler(options), [])
  const [state, setState] = useState(scheduler.getState())
  useEffect(() => scheduler.subscribe(setState), [scheduler])
  useEffect(() => { if (options.events) scheduler.setEvents(options.events) }, [scheduler, options.events])
  useEffect(() => { if (options.resources) scheduler.setResources(options.resources) }, [scheduler, options.resources])
  return { scheduler, state }
}

export interface HeadlessSchedulerRender { scheduler: Scheduler; state: SchedulerState; timeline: TimelineModel }
export interface HeadlessSchedulerProps { options: SchedulerOptions; children(value: HeadlessSchedulerRender): ReactNode }

export function HeadlessScheduler({ options, children }: HeadlessSchedulerProps) {
  const { scheduler, state } = useScheduler(options)
  const timeline = buildResourceTimeline({ range: state.visibleRange, events: state.events, resources: state.resources, adapter: options.dateAdapter ?? nativeDateAdapter, slotMinutes: state.slotMinutes, locale: state.locale, timeZone: state.timeZone })
  return children({ scheduler, state, timeline })
}
