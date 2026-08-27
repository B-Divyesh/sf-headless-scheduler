import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  buildMonth, buildResourceTimeline, buildTimeGrid, createPointerInteraction,
  createScheduler, getGridNavigation, nativeDateAdapter,
  type PointerPreview, type Scheduler, type SchedulerEvent, type SchedulerState, type SchedulerView
} from '../../src'
import './styles.css'

const docsRelease = import.meta.env.VITE_DOCS_BUILD_MARKER ?? 'release'

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).then(registration => {
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing
        if (!worker) return
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) dispatchEvent(new Event('headless-scheduler-update'))
        })
      })
    }).catch(() => undefined)
  })
}

const RESOURCES = [
  { id: 'studio', title: 'Studio A', group: 'Rooms' },
  { id: 'lab', title: 'Prototype lab', group: 'Rooms' },
  { id: 'maya', title: 'Maya Chen', group: 'People' },
  { id: 'noah', title: 'Noah Williams', group: 'People' }
]

const INITIAL_EVENTS: SchedulerEvent[] = [
  { id: 'briefing', title: 'Morning briefing', resourceId: 'studio', start: '2026-08-27T08:30:00.000Z', end: '2026-08-27T10:00:00.000Z', meta: { tone: 'red' } },
  { id: 'prototype', title: 'Prototype review', resourceId: 'lab', start: '2026-08-27T10:15:00.000Z', end: '2026-08-27T12:00:00.000Z', meta: { tone: 'blue' } },
  { id: 'research', title: 'Field notes', resourceId: 'maya', start: '2026-08-27T09:30:00.000Z', end: '2026-08-27T11:15:00.000Z', meta: { tone: 'green' } },
  { id: 'handoff', title: 'Design handoff', resourceId: 'noah', start: '2026-08-27T13:00:00.000Z', end: '2026-08-27T15:30:00.000Z', meta: { tone: 'red' } },
  { id: 'planning', title: 'Release planning', resourceId: 'studio', start: '2026-08-29T11:00:00.000Z', end: '2026-08-29T12:00:00.000Z', meta: { tone: 'blue' } }
]

const scheduler = createScheduler({
  anchorDate: '2026-08-27T09:00:00.000Z', initialView: 'resource-timeline', timeZone: 'UTC',
  visibleRange: { start: '2026-08-27T07:00:00.000Z', end: '2026-08-27T17:00:00.000Z' },
  resources: RESOURCES, events: INITIAL_EVENTS, slotMinutes: 60
})

function useSchedulerState(instance: Scheduler) {
  const [state, setState] = useState(instance.getState())
  useEffect(() => instance.subscribe(setState), [instance])
  return state
}

const Icon = ({ name }: { name: 'arrow' | 'github' | 'move' | 'plus' }) => {
  const paths = {
    arrow: 'M5 12h14M13 6l6 6-6 6', github: 'M12 2a10 10 0 0 0-3 19.5c.5.1.7-.2.7-.5v-2c-2.7.6-3.3-1.1-3.3-1.1-.4-1.1-1-1.4-1-1.4-.8-.6.1-.6.1-.6.9.1 1.4 1 1.4 1 .8 1.3 2.2.9 2.8.7.1-.6.3-1 .6-1.3-2.2-.3-4.5-1.1-4.5-4.9 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.5 9.5 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.7.7 1 1.6 1 2.7 0 3.8-2.3 4.6-4.5 4.9.4.3.7 1 .7 2v3c0 .3.2.6.7.5A10 10 0 0 0 12 2Z',
    move: 'M12 2v20m0-20-3 3m3-3 3 3M2 12h20M2 12l3-3m-3 3 3 3m17-3-3-3m3 3-3 3m-7 7-3-3m3 3 3-3',
    plus: 'M12 5v14M5 12h14'
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d={paths[name]} /></svg>
}

function App() {
  const state = useSchedulerState(scheduler)
  const [online, setOnline] = useState(navigator.onLine)
  const [formOpen, setFormOpen] = useState(false)
  const [notice, setNotice] = useState('Tip: drag an event or focus it and use arrow keys.')
  const [preview, setPreview] = useState<{ id: string; value: PointerPreview } | null>(null)
  const [undo, setUndo] = useState<SchedulerEvent | null>(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)
  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    addEventListener('online', update); addEventListener('offline', update)
    return () => { removeEventListener('online', update); removeEventListener('offline', update) }
  }, [])
  useEffect(() => {
    const notify = () => setUpdateAvailable(true)
    addEventListener('headless-scheduler-update', notify)
    return () => removeEventListener('headless-scheduler-update', notify)
  }, [])

  const setView = (view: SchedulerView) => {
    scheduler.setView(view)
    if (view === 'resource-timeline') scheduler.setVisibleRange({ start: '2026-08-27T07:00:00.000Z', end: '2026-08-27T17:00:00.000Z' })
  }
  const remove = (event: SchedulerEvent) => { scheduler.removeEvent(event.id); setUndo(event); setNotice(`${event.title} removed. Undo is available.`) }
  const restore = () => { if (undo) { scheduler.createEvent(undo); setNotice(`${undo.title} restored.`); setUndo(null) } }

  return <>
    <header className="site-header">
      <a className="brand" href="#top"><span className="brand-mark">HS</span><span>headless—scheduler</span></a>
      <nav aria-label="Primary"><a href="#demo">Demo</a><a href="#api">API</a><a href="#install">Install</a><a className="repo-link" href="https://github.com/B-Divyesh/sf-headless-scheduler"><Icon name="github" />GitHub</a></nav>
    </header>
    <main id="main" data-docs-release={docsRelease}>
      {updateAvailable && <div className="update-toast" role="status">Documentation update ready. <button onClick={() => location.reload()}>Reload</button></div>}
      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow"><span>MIT</span> No premium views</p>
          <h1>Your schedule.<br/><em>Your surface.</em></h1>
          <p className="lede">A headless calendar core with resource timelines, continuous months, and pointer interactions—ready for your Tailwind system.</p>
          <div className="hero-actions"><a className="button primary" href="#install">Start building <Icon name="arrow" /></a><a className="button text-button" href="#demo">Try the timeline ↓</a></div>
          <dl className="proof"><div><dt>0</dt><dd>core dependencies</dd></div><div><dt>4</dt><dd>useful views</dd></div><div><dt>MIT</dt><dd>forever</dd></div></dl>
        </div>
        <figure className="hero-art"><img src="/riso-scheduler.webp" width="768" height="512" alt="Risograph collage of event tickets arranged across a resource schedule and a folded month ribbon" fetchPriority="high"/><figcaption>Structure without somebody else’s skin.</figcaption></figure>
      </section>

      <section className="demo-section" id="demo" aria-labelledby="demo-title">
        <div className="section-heading"><div><p className="kicker">The actual library, in motion</p><h2 id="demo-title">Plan across people and places</h2></div><p>Drag events to reschedule. Arrow keys move a focused event by 15 minutes. Every view below comes from the same headless state.</p></div>
        <div className="scheduler-shell">
          <div className="scheduler-topbar">
            <div className="date-controls"><button onClick={() => scheduler.navigate(-1)} aria-label="Previous period">←</button><button onClick={() => scheduler.navigate('today')}>Today</button><button onClick={() => scheduler.navigate(1)} aria-label="Next period">→</button><strong>27 August 2026</strong></div>
            <div className="view-tabs" role="group" aria-label="Calendar view">
              {(['day','week','month','resource-timeline'] as const).map(view => <button key={view} aria-pressed={state.view === view} onClick={() => setView(view)}>{view === 'resource-timeline' ? 'Timeline' : view[0]!.toUpperCase() + view.slice(1)}</button>)}
            </div>
            <button className="add-button" onClick={() => setFormOpen(true)}><Icon name="plus" />Add event</button>
          </div>
          {!online && <div className="offline" role="status"><strong>You’re offline.</strong> The in-memory schedule still works; persistence is yours to connect.</div>}
          <div className="schedule-stage">
            {state.view === 'resource-timeline' && <Timeline state={state} preview={preview} setPreview={setPreview} setNotice={setNotice} remove={remove} />}
            {(state.view === 'day' || state.view === 'week') && <TimeGrid state={state} />}
            {state.view === 'month' && <MonthScroller state={state} />}
          </div>
          <div className="scheduler-status"><span className={online ? 'online' : 'offline-dot'}></span>{online ? 'Ready locally' : 'Offline mode'}<span aria-live="polite">{notice}</span>{undo && <button onClick={restore}>Undo remove</button>}</div>
        </div>
      </section>

      <section className="manifesto" aria-labelledby="why-title">
        <div className="giant-number" aria-hidden="true">04</div><div><p className="kicker">Why another calendar?</p><h2 id="why-title">Because layout is infrastructure, not a licence tier.</h2><p>Resource scheduling should not force your product into a vendor’s visual language—or its premium plan. Headless Scheduler gives you date math, collision geometry, input behavior, and accessible navigation as typed primitives.</p></div>
      </section>

      <section className="feature-grid" aria-label="Capabilities">
        <article><span className="feature-index">01 / Layout</span><h3>Resource timelines</h3><p>Hours or days across any number of people, rooms, tools, or tracks. Clipping and percentages are already calculated.</p><div className="mini-timeline" aria-hidden="true"><i></i><i></i><b></b><b></b></div></article>
        <article><span className="feature-index">02 / Months</span><h3>Keep scrolling</h3><p>Windowed month models make an endless vertical calendar practical without rendering an endless DOM.</p><div className="mini-month" aria-hidden="true">{Array.from({length:21},(_,i)=><i key={i}></i>)}</div></article>
        <article><span className="feature-index">03 / Input</span><h3>Move like you mean it</h3><p>Pointer capture, snapping, resize handles, keyboard intent, and live announcements—without prescribing components.</p><div className="gesture" aria-hidden="true"><Icon name="move"/><span>15 min</span></div></article>
      </section>

      <section className="install" id="install" aria-labelledby="install-title">
        <div><p className="kicker">One package. Bring your stack.</p><h2 id="install-title">Ship the scheduler, not the fight.</h2><p>ESM, CJS, declarations, zero runtime dependencies in the core. React is optional.</p></div>
        <div className="code-panel"><div className="code-label"><span>Terminal</span><button onClick={() => { navigator.clipboard?.writeText('npm install headless-scheduler'); setNotice('Install command copied.') }}>Copy</button></div><pre tabIndex={0}><code><span>$</span> npm install headless-scheduler</code></pre><pre tabIndex={0}><code><span>›</span> import {'{ createScheduler }'} from 'headless-scheduler'</code></pre></div>
      </section>

      <section className="api" id="api" aria-labelledby="api-title"><p className="kicker">Small on purpose</p><h2 id="api-title">Primitives you can hold in your head</h2><div className="api-list"><code>createScheduler(options)</code><code>buildResourceTimeline(input)</code><code>getContinuousMonthWindow(input)</code><code>createPointerInteraction(options)</code><code>getGridNavigation(input)</code></div><a className="button primary" href="https://github.com/B-Divyesh/sf-headless-scheduler#usage">Read the API <Icon name="arrow" /></a></section>
      <section className="closing"><p>Calendar infrastructure,<br/><em>printed your way.</em></p><a href="#install">npm install →</a></section>
    </main>
    <footer><div><span className="brand-mark">HS</span><strong>headless—scheduler</strong></div><p>MIT licensed. No telemetry. No licence wall.</p><nav aria-label="Legal"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="https://github.com/B-Divyesh/sf-headless-scheduler">Source</a></nav></footer>
    {formOpen && <EventDialog onClose={() => setFormOpen(false)} onNotice={setNotice} />}
  </>
}

function Timeline({ state, preview, setPreview, setNotice, remove }: { state: SchedulerState; preview: { id: string; value: PointerPreview } | null; setPreview(value: { id: string; value: PointerPreview } | null): void; setNotice(value: string): void; remove(event: SchedulerEvent): void }) {
  const timeline = useMemo(() => buildResourceTimeline({ range: state.visibleRange, events: state.events, resources: state.resources, adapter: nativeDateAdapter, slotMinutes: 60, locale: state.locale, timeZone: state.timeZone }), [state])
  const interaction = useRef<ReturnType<typeof createPointerInteraction> | null>(null)
  const startDrag = (reactEvent: React.PointerEvent, event: SchedulerEvent, mode: 'move' | 'resize-end') => {
    const width = (reactEvent.currentTarget.closest('.timeline-canvas') as HTMLElement)?.offsetWidth ?? 960
    interaction.current = createPointerInteraction({ mode, event, pixelsPerMinute: width / 600, snapMinutes: 15, onPreview: value => setPreview({ id: event.id, value }), onCommit: value => {
      if (mode === 'move') scheduler.moveEvent(event.id, { start: value.start })
      else scheduler.resizeEvent(event.id, { end: value.end })
      setPreview(null); setNotice(`${event.title} ${mode === 'move' ? 'moved' : 'resized'} to ${new Date(value.start).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}.`)
    } })
    interaction.current.onPointerDown(reactEvent.nativeEvent)
  }
  const keyMove = (keyboard: React.KeyboardEvent, event: SchedulerEvent) => {
    if (!['ArrowLeft','ArrowRight'].includes(keyboard.key)) return
    keyboard.preventDefault()
    const minutes = keyboard.key === 'ArrowRight' ? 15 : -15
    scheduler.moveEvent(event.id, { start: new Date(new Date(event.start).getTime() + minutes * 60_000).toISOString() })
    setNotice(`${event.title} moved ${Math.abs(minutes)} minutes ${minutes > 0 ? 'later' : 'earlier'}.`)
  }
  return <div className="timeline" role="region" aria-label="Resource schedule for 27 August 2026" onPointerMove={e => interaction.current?.onPointerMove(e.nativeEvent)} onPointerUp={e => interaction.current?.onPointerUp(e.nativeEvent)} onPointerCancel={e => interaction.current?.onPointerCancel(e.nativeEvent)}>
    <div className="timeline-corner">Resource <span>UTC</span></div>
    <div className="timeline-head timeline-canvas">{timeline.slots.map(slot => <div key={slot.start}>{slot.label.replace(':00','')}</div>)}</div>
    {timeline.rows.map(row => <React.Fragment key={row.resource.id}><div className="resource-name"><span className={`avatar avatar-${row.resource.id}`}>{row.resource.title.charAt(0)}</span><span><strong>{row.resource.title}</strong><small>{row.resource.group}</small></span></div><div className="timeline-row timeline-canvas">
      <div className="hour-lines" aria-hidden="true">{timeline.slots.map(slot => <i key={slot.start}></i>)}</div>
      {row.events.length === 0 && <span className="open-label">Open</span>}
      {row.events.map(event => {
        const value = preview?.id === event.id ? preview.value : event
        const start = new Date(value.start), end = new Date(value.end), rangeStart = new Date(state.visibleRange.start), total = new Date(state.visibleRange.end).getTime() - rangeStart.getTime()
        const left = Math.max(0,(start.getTime()-rangeStart.getTime())/total*100), width = Math.max(2,(end.getTime()-start.getTime())/total*100)
        return <button className={`event-block tone-${String(event.meta?.tone ?? 'red')}`} style={{left:`${left}%`,width:`${width}%`}} key={event.id} onPointerDown={e => startDrag(e,event,'move')} onKeyDown={e => { keyMove(e,event); if(e.key==='Delete') remove(event) }} aria-label={`${event.title} ${formatTime(value.start)}–${formatTime(value.end)}. Drag or use left and right arrows to move; Delete to remove.`}><strong>{event.title}</strong><span>{formatTime(value.start)}–{formatTime(value.end)}</span><i className="resize-handle" aria-hidden="true" onPointerDown={e => { e.stopPropagation(); startDrag(e,event,'resize-end') }}></i></button>
      })}
    </div></React.Fragment>)}
  </div>
}

function TimeGrid({ state }: { state: SchedulerState }) {
  const range = state.view === 'day' ? { start: '2026-08-27T07:00:00.000Z', end: '2026-08-27T17:00:00.000Z' } : { start: '2026-08-24T00:00:00.000Z', end: '2026-08-31T00:00:00.000Z' }
  const positioned = buildTimeGrid({ range, events: state.events, adapter: nativeDateAdapter })
  return <div className="time-grid" role="grid" aria-label={`${state.view} calendar`}><div className="time-ruler" aria-hidden="true">{['08:00','10:00','12:00','14:00','16:00'].map(time=><span key={time}>{time}</span>)}</div><div className="time-lane" role="row">{positioned.length ? positioned.map(event=><button className="event-block tone-blue" key={event.id} style={{top:`${event.top}%`,height:`${event.height}%`,left:`${event.column/event.columnCount*100}%`,width:`${100/event.columnCount}%`}}><strong>{event.title}</strong><span>{formatTime(event.start)}</span></button>) : <EmptyState/>}</div></div>
}

function MonthScroller({ state }: { state: SchedulerState }) {
  const [focusIndex, setFocusIndex] = useState(0)
  const months = [-1,0,1].map(offset => buildMonth({ month: nativeDateAdapter.toISO(nativeDateAdapter.addMonths(new Date(state.anchorDate), offset)), events: state.events, adapter: nativeDateAdapter, today: '2026-08-27T00:00:00Z' }))
  const onKey = (e: React.KeyboardEvent, index: number) => { const next = getGridNavigation({key:e.key,index,columns:7,count:126,pageSize:42}); if(next!==null){e.preventDefault();setFocusIndex(next); document.querySelector<HTMLElement>(`[data-day="${next}"]`)?.focus()} }
  let dayIndex = -1
  return <div className="month-scroll" aria-label="Continuous month calendar">{months.map(month=><section key={month.key} aria-labelledby={`month-${month.key}`}><h3 id={`month-${month.key}`}>{month.label}</h3><div className="weekday-row" aria-hidden="true">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day=><span key={day}>{day}</span>)}</div><div className="month-grid" role="grid">{month.weeks.flat().map(day=>{dayIndex++; const index=dayIndex; return <button role="gridcell" data-day={index} tabIndex={focusIndex===index?0:-1} onKeyDown={e=>onKey(e,index)} className={`${day.outside?'outside ':''}${day.today?'today':''}`} key={day.date}><span>{day.dayNumber}</span>{day.events.slice(0,2).map(event=><i key={event.id}>{event.title}</i>)}</button>})}</div></section>)}</div>
}

function EmptyState() { return <div className="empty-state"><span aria-hidden="true">✦</span><strong>No events in this range</strong><p>Choose another date or add the first event.</p></div> }

function EventDialog({ onClose, onNotice }: { onClose(): void; onNotice(value: string): void }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [error, setError] = useState('')
  useEffect(() => { ref.current?.showModal(); ref.current?.querySelector<HTMLInputElement>('input')?.focus() }, [])
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const title = String(data.get('title') ?? '').trim()
    if (!title) { setError('Add a title so people know what is scheduled.'); return }
    const start = `2026-08-27T${data.get('time')}:00.000Z`; const end = new Date(new Date(start).getTime()+60*60_000).toISOString()
    scheduler.createEvent({id:crypto.randomUUID(),title,start,end,resourceId:String(data.get('resource')),meta:{tone:'green'}}); onNotice(`${title} added.`); onClose()
  }
  return <dialog ref={ref} onCancel={onClose} aria-labelledby="dialog-title"><form onSubmit={submit}><div className="dialog-head"><div><p className="kicker">New paper slip</p><h2 id="dialog-title">Add an event</h2></div><button type="button" onClick={onClose} aria-label="Close dialog">×</button></div><label>Event title<input name="title" aria-describedby={error?'form-error':undefined}/></label>{error&&<p className="form-error" id="form-error" role="alert">{error}</p>}<label>Resource<select name="resource">{RESOURCES.map(resource=><option value={resource.id} key={resource.id}>{resource.title}</option>)}</select></label><label>Start time<input type="time" name="time" defaultValue="14:00" required/></label><div className="dialog-actions"><button type="button" onClick={onClose}>Cancel</button><button className="primary" type="submit">Add event</button></div></form></dialog>
}

const formatTime = (iso: string) => new Intl.DateTimeFormat('en',{hour:'numeric',minute:'2-digit',timeZone:'UTC'}).format(new Date(iso))

createRoot(document.getElementById('root')!).render(<App />)
