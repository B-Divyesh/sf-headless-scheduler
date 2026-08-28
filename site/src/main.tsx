import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  buildMonth, buildResourceTimeline, buildTimeGrid, createPointerInteraction,
  createScheduler, getGridNavigation, nativeDateAdapter, PACKAGE_VERSION,
  type PointerPreview, type Scheduler, type SchedulerEvent, type SchedulerState, type SchedulerView
} from 'headless-scheduler'
import './styles.css'
import { formatTimelineInteractionNotice } from './interaction-notice'

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

type Route = 'home' | 'demo' | 'privacy' | 'terms' | 'not-found'

const routeFromLocation = (): Route => {
  if (new URLSearchParams(location.search).get('demo') === '1') return 'demo'
  const path = location.pathname.replace(/\/+$/, '') || '/'
  if (path === '/') return 'home'
  if (path === '/demo') return 'demo'
  if (path === '/privacy') return 'privacy'
  if (path === '/terms') return 'terms'
  return 'not-found'
}

const routeMeta: Record<Route, { title: string; description: string; canonical: string }> = {
  home: { title: 'Headless Scheduler — calendar and timeline logic', description: 'Build calendar and resource timeline interfaces with a typed TypeScript package and optional React adapter.', canonical: '/' },
  demo: { title: 'Demo — Headless Scheduler', description: 'Edit sample event data and try the Headless Scheduler package in an isolated in-memory playground.', canonical: '/demo' },
  privacy: { title: 'Privacy — Headless Scheduler', description: 'How the Headless Scheduler site and package handle data, storage, and network access.', canonical: '/privacy' },
  terms: { title: 'Terms — Headless Scheduler', description: 'License and usage terms for the Headless Scheduler package and documentation site.', canonical: '/terms' },
  'not-found': { title: 'Page not found — Headless Scheduler', description: 'The requested Headless Scheduler page does not exist.', canonical: location.pathname }
}

function setMetadata(route: Route) {
  const meta = routeMeta[route]
  document.title = meta.title
  const set = (selector: string, value: string) => document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', value)
  set('meta[name="description"]', meta.description)
  set('meta[property="og:title"]', meta.title)
  set('meta[property="og:description"]', meta.description)
  set('meta[property="og:url"]', `https://headless-scheduler.sociobot.in${meta.canonical}`)
  set('meta[name="twitter:title"]', meta.title)
  set('meta[name="twitter:description"]', meta.description)
  document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', `https://headless-scheduler.sociobot.in${meta.canonical}`)
}

function AppLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const open = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    history.pushState({}, '', href)
    dispatchEvent(new PopStateEvent('popstate'))
  }
  return <a href={href} className={className} onClick={open}>{children}</a>
}

function Header() {
  return <header className="site-header">
    <AppLink className="brand" href="/"><span className="brand-mark">HS</span><span>headless—scheduler</span></AppLink>
    <nav aria-label="Primary"><AppLink href="/demo">Demo</AppLink><a href="/#api">API</a><a href="/#install">Install</a><a className="repo-link" href="https://github.com/B-Divyesh/sf-headless-scheduler" aria-label="GitHub repository (external link)"><Icon name="github" /><span>GitHub</span></a></nav>
  </header>
}

function Footer() {
  return <footer><div><span className="brand-mark">HS</span><strong>headless—scheduler</strong></div><p>Scheduling logic for interfaces you design.</p><nav aria-label="Legal"><AppLink href="/privacy">Privacy</AppLink><AppLink href="/terms">Terms</AppLink><a href="https://github.com/B-Divyesh/sf-headless-scheduler" aria-label="Source repository (external link)">Source</a></nav><small>Built by Param Factory · v0.1.0 · {docsRelease}</small></footer>
}

function App() {
  const [route, setRoute] = useState<Route>(routeFromLocation)
  const [routeNotice, setRouteNotice] = useState('')
  const mounted = useRef(false)
  useEffect(() => {
    const update = () => setRoute(routeFromLocation())
    addEventListener('popstate', update)
    return () => removeEventListener('popstate', update)
  }, [])
  useEffect(() => {
    setMetadata(route)
    const heading = document.querySelector<HTMLElement>('main h1')
    if (mounted.current) {
      heading?.focus()
      scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
    }
    mounted.current = true
    setRouteNotice(routeMeta[route].title)
  }, [route])

  return <>
    <Header />
    <div className="route-announcer" aria-live="polite" aria-atomic="true">{routeNotice}</div>
    {route === 'home' && <Home />}
    {route === 'demo' && <Demo />}
    {route === 'privacy' && <LegalPage kind="privacy" />}
    {route === 'terms' && <LegalPage kind="terms" />}
    {route === 'not-found' && <NotFound />}
    <Footer />
  </>
}

function Home() {
  const [copyNotice, setCopyNotice] = useState('')
  const installCommand = 'npm install https://headless-scheduler.sociobot.in/headless-scheduler-0.1.0.tgz'
  return <main id="main" data-docs-release={docsRelease}>
    <section className="hero" id="top">
      <div className="hero-copy">
        <p className="eyebrow"><span>MIT</span> UI not included</p>
        <h1 tabIndex={-1}>Build calendar and resource timeline UIs</h1>
        <p className="lede">For product engineers who need scheduling behavior without adopting another component library.</p>
        <div className="hero-actions"><AppLink className="button primary" href="/?demo=1">Try it with sample data <Icon name="arrow" /></AppLink><span>Opens an editable resource timeline in this page.</span></div>
        <ul className="proof" aria-label="Package facts"><li><strong>MIT licensed</strong></li><li><strong>No runtime dependencies in core</strong></li><li><strong>Demo edits stay in this tab</strong></li></ul>
      </div>
      <figure className="hero-art"><picture><source media="(max-width: 600px)" srcSet="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E"/><img src="/riso-scheduler.webp" width="768" height="512" alt="Event slips arranged across a resource schedule and folded month strip" fetchPriority="high"/></picture><figcaption>You supply the interface. The package supplies scheduling logic.</figcaption></figure>
    </section>

    <section className="home-preview" aria-labelledby="preview-title"><div><p className="kicker">Package playground</p><h2 id="preview-title">See a staffed studio schedule</h2><p>The sample opens with rooms, people, and scheduled work.</p><AppLink className="button primary" href="/demo">Open the sample schedule <Icon name="arrow" /></AppLink></div><div className="paper-preview" aria-hidden="true"><span>Studio A</span><b>Morning briefing</b><span>Prototype lab</span><b>Prototype review</b><span>Maya Chen</span><b>Field notes</b></div></section>

    <section className="how" aria-labelledby="how-title"><p className="kicker">How it works</p><h2 id="how-title">Add scheduling behavior in three steps</h2><ol><li><strong>Define resources and events.</strong><span>Pass people, rooms, dates, and times as typed data.</span></li><li><strong>Build a view model.</strong><span>Choose day, week, continuous month, or resource timeline.</span></li><li><strong>Render your interface.</strong><span>Use your own components, Tailwind tokens, and data store.</span></li></ol></section>

    <section className="feature-grid" aria-label="Package capabilities">
      <article><span className="feature-index">01 / Layout</span><h2>Lay out resource timelines</h2><p>Calculate clipped event positions across people, rooms, tools, or tracks.</p><div className="mini-timeline" aria-hidden="true"><i></i><i></i><b></b><b></b></div></article>
      <article><span className="feature-index">02 / Months</span><h2>Render nearby months</h2><p>Build a finite month window as the reader scrolls.</p><div className="mini-month" aria-hidden="true">{Array.from({length:21},(_,i)=><i key={i}></i>)}</div></article>
      <article><span className="feature-index">03 / Input</span><h2>Move events with input controls</h2><p>Create, move, and resize events with pointer or keyboard controls.</p><div className="gesture" aria-hidden="true"><Icon name="move"/><span>15 min</span></div></article>
    </section>

    <section className="privacy-note" aria-labelledby="limits-title"><div className="giant-number" aria-hidden="true">04</div><div><p className="kicker">Scope and privacy</p><h2 id="limits-title">You control data and rendering</h2><p>The package does not provide storage, accounts, payments, or recurring-event expansion.</p><p>The documentation site does not load analytics, third-party scripts, or remote fonts.</p><AppLink href="/privacy">Read the privacy details</AppLink></div></section>

    <section className="install" id="install" aria-labelledby="install-title">
      <div><p className="kicker">Versioned release file</p><h2 id="install-title">Install the scheduler package</h2><p>Use the hosted v0.1.0 tarball until registry publication.</p></div>
      <div className="code-panel"><div className="code-label"><span>Terminal</span><button onClick={() => { navigator.clipboard?.writeText(installCommand); setCopyNotice('Install command copied.') }}>Copy install command</button></div><pre tabIndex={0}><code><span>$</span> {installCommand}</code></pre><pre tabIndex={0}><code><span>›</span> import {'{ createScheduler }'} from 'headless-scheduler'</code></pre><p className="copy-notice" role="status">{copyNotice}</p></div>
    </section>

    <section className="api" id="api" aria-labelledby="api-title"><p className="kicker">Core functions</p><h2 id="api-title">Use the typed API</h2><div className="api-list"><code>createScheduler(options)</code><code>buildResourceTimeline(input)</code><code>getContinuousMonthWindow(input)</code><code>createPointerInteraction(options)</code><code>getGridNavigation(input)</code></div><a className="button primary" href="https://github.com/B-Divyesh/sf-headless-scheduler#public-api" aria-label="Read the API on GitHub (external link)">Read the API <Icon name="arrow" /></a></section>
  </main>
}

function Demo() {
  const state = useSchedulerState(scheduler)
  const [online, setOnline] = useState(navigator.onLine)
  const [formOpen, setFormOpen] = useState(false)
  const [notice, setNotice] = useState('Tip: drag an event or focus it and use arrow keys.')
  const [preview, setPreview] = useState<{ id: string; value: PointerPreview } | null>(null)
  const [undo, setUndo] = useState<SchedulerEvent | null>(null)
  const [sampleInput, setSampleInput] = useState(() => JSON.stringify(INITIAL_EVENTS[0], null, 2))
  const [inputError, setInputError] = useState('')
  const addButtonRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    const update = () => setOnline(navigator.onLine)
    addEventListener('online', update); addEventListener('offline', update)
    return () => { removeEventListener('online', update); removeEventListener('offline', update) }
  }, [])
  useEffect(() => () => {
    scheduler.setEvents(INITIAL_EVENTS)
    scheduler.setResources(RESOURCES)
    scheduler.setView('resource-timeline')
    scheduler.setVisibleRange({ start: '2026-08-27T07:00:00.000Z', end: '2026-08-27T17:00:00.000Z' })
  }, [])
  const setView = (view: SchedulerView) => {
    scheduler.setView(view)
    if (view === 'resource-timeline') scheduler.setVisibleRange({ start: '2026-08-27T07:00:00.000Z', end: '2026-08-27T17:00:00.000Z' })
  }
  const remove = (event: SchedulerEvent) => { scheduler.removeEvent(event.id); setUndo(event); setNotice(`${event.title} removed. Undo is available.`) }
  const restore = () => { if (undo) { scheduler.createEvent(undo); setNotice(`${undo.title} restored.`); setUndo(null) } }
  const reset = () => {
    scheduler.setEvents(INITIAL_EVENTS)
    scheduler.setResources(RESOURCES)
    setView('resource-timeline')
    setSampleInput(JSON.stringify(INITIAL_EVENTS[0], null, 2))
    setInputError(''); setUndo(null); setNotice('Demo reset to the original five events.')
  }
  const applyInput = () => {
    try {
      const value = JSON.parse(sampleInput) as SchedulerEvent
      if (!value.id || !value.title || !value.start || !value.end || !value.resourceId) throw new Error('Include id, title, resourceId, start, and end.')
      if (!RESOURCES.some(resource => resource.id === value.resourceId)) throw new Error('Use a resourceId shown in the sample schedule.')
      const events = state.events.filter(event => event.id !== value.id)
      scheduler.setEvents([...events, value])
      setInputError(''); setNotice(`${value.title} applied to the timeline.`)
    } catch (error) { setInputError(error instanceof Error ? error.message : 'Enter valid event JSON.') }
  }
  const closeDialog = () => {
    setFormOpen(false)
    requestAnimationFrame(() => addButtonRef.current?.focus())
  }

  return <main id="main" data-docs-release={docsRelease}>
      <aside className="demo-banner" aria-label="Demo mode"><strong>Demo — sample data, nothing is saved</strong><div><button onClick={reset}>Reset demo</button><AppLink href="/">Start for real</AppLink></div></aside>
      <section className="demo-section" aria-labelledby="demo-title">
        <div className="section-heading"><div><p className="kicker">v{PACKAGE_VERSION} package playground</p><h1 id="demo-title" tabIndex={-1}>Edit a resource timeline</h1></div><p>Change the sample JSON and apply it. The schedule updates from isolated in-memory data.</p></div>
        <div className="playground-grid"><div className="sample-editor"><label htmlFor="sample-json">Sample event JSON</label><textarea id="sample-json" value={sampleInput} onChange={event => setSampleInput(event.target.value)} spellCheck={false} aria-describedby={inputError ? 'sample-error' : 'sample-help'}></textarea><p id="sample-help">Edit the title or times, then apply the sample event.</p>{inputError && <p id="sample-error" role="alert">{inputError}</p>}<button className="primary" onClick={applyInput}>Apply sample event</button></div>
        <div className="scheduler-shell">
          <div className="scheduler-topbar">
            <div className="date-controls"><button onClick={() => scheduler.navigate(-1)} aria-label="Show previous period">←</button><button onClick={() => scheduler.setAnchorDate('2026-08-27T09:00:00.000Z')}>Show sample date</button><button onClick={() => scheduler.navigate(1)} aria-label="Show next period">→</button><strong>27 August 2026</strong></div>
            <div className="view-tabs" role="group" aria-label="Calendar view">
              {(['day','week','month','resource-timeline'] as const).map(view => { const label = view === 'resource-timeline' ? 'timeline' : view; return <button key={view} aria-label={`Show ${label} view`} aria-pressed={state.view === view} onClick={() => setView(view)}>{label[0]!.toUpperCase() + label.slice(1)}</button> })}
            </div>
            <button ref={addButtonRef} className="add-button" onClick={() => setFormOpen(true)}><Icon name="plus" />Add event</button>
          </div>
          {!online && <div className="offline" role="status"><strong>You’re offline.</strong> The demo still works. Changes stay in memory until reload.</div>}
          <div className="schedule-stage">
            {state.view === 'resource-timeline' && <Timeline scheduler={scheduler} state={state} preview={preview} setPreview={setPreview} setNotice={setNotice} remove={remove} />}
            {(state.view === 'day' || state.view === 'week') && <TimeGrid state={state} />}
            {state.view === 'month' && <MonthScroller state={state} />}
          </div>
          <div className="scheduler-status"><span className={online ? 'online' : 'offline-dot'}></span>{online ? 'In-memory demo' : 'Offline demo'}<span aria-live="polite">{notice}</span>{undo && <button onClick={restore}>Undo remove</button>}</div>
        </div>
        </div>
      </section>
      <section className="demo-snippet" aria-labelledby="demo-snippet-title"><div><p className="kicker">Fresh project</p><h2 id="demo-snippet-title">Run this schedule locally</h2><p>Install the same version used above, then pass the sample event to <code>createScheduler</code>.</p></div><div className="code-panel"><pre tabIndex={0}><code>npm install https://headless-scheduler.sociobot.in/headless-scheduler-{PACKAGE_VERSION}.tgz</code></pre><pre tabIndex={0}><code>import {'{ createScheduler }'} from 'headless-scheduler'</code></pre></div></section>
      {formOpen && <EventDialog scheduler={scheduler} onClose={closeDialog} onNotice={setNotice} />}
    </main>
}

function LegalPage({ kind }: { kind: 'privacy' | 'terms' }) {
  const privacy = kind === 'privacy'
  return <main id="main" className="legal-page"><p className="kicker">Headless Scheduler</p><h1 tabIndex={-1}>{privacy ? 'Privacy' : 'Terms'}</h1>{privacy ? <><p>The documentation site uses no analytics, accounts, cookies, local storage, or third-party scripts.</p><p>The demo keeps edits in memory and clears them on reload or reset.</p><p>The package includes no telemetry or network calls. Your application chooses where scheduler data is stored.</p></> : <><p>Headless Scheduler is provided under the MIT License, without warranty.</p><p>This site offers no payment or hosted scheduling service.</p><p>Read the repository <a href="https://github.com/B-Divyesh/sf-headless-scheduler/blob/main/LICENSE" aria-label="LICENSE file on GitHub (external link)">LICENSE file on GitHub</a> for the complete terms.</p></>}<p><small>Last updated 28 August 2026.</small></p></main>
}

function NotFound() { return <main id="main" className="not-found"><div className="lost-slip" aria-hidden="true">404</div><p className="kicker">Misfiled paper slip</p><h1 tabIndex={-1}>This page is not on the board</h1><p>Check the address or return to the scheduler library.</p><AppLink className="button primary" href="/">Return home</AppLink></main> }

function Timeline({ scheduler, state, preview, setPreview, setNotice, remove }: { scheduler: Scheduler; state: SchedulerState; preview: { id: string; value: PointerPreview } | null; setPreview(value: { id: string; value: PointerPreview } | null): void; setNotice(value: string): void; remove(event: SchedulerEvent): void }) {
  const timeline = useMemo(() => buildResourceTimeline({ range: state.visibleRange, events: state.events, resources: state.resources, adapter: nativeDateAdapter, slotMinutes: 60, locale: state.locale, timeZone: state.timeZone }), [state])
  const interaction = useRef<ReturnType<typeof createPointerInteraction> | null>(null)
  const startDrag = (reactEvent: React.PointerEvent, event: SchedulerEvent, mode: 'move' | 'resize-end') => {
    const width = (reactEvent.currentTarget.closest('.timeline-canvas') as HTMLElement)?.offsetWidth ?? 960
    interaction.current = createPointerInteraction({ mode, event, pixelsPerMinute: width / 600, snapMinutes: 15, onPreview: value => setPreview({ id: event.id, value }), onCommit: value => {
      if (mode === 'move') scheduler.moveEvent(event.id, { start: value.start })
      else scheduler.resizeEvent(event.id, { end: value.end })
      setPreview(null); setNotice(formatTimelineInteractionNotice(event.title, mode, value))
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
  const keyResize = (keyboard: React.KeyboardEvent, event: SchedulerEvent) => {
    if (!['ArrowLeft','ArrowRight'].includes(keyboard.key)) return
    keyboard.preventDefault()
    const minutes = keyboard.key === 'ArrowRight' ? 15 : -15
    const start = new Date(event.start).getTime()
    const currentEnd = new Date(event.end).getTime()
    const nextEnd = Math.max(start + 15 * 60_000, currentEnd + minutes * 60_000)
    if (nextEnd === currentEnd) {
      setNotice(`${event.title} is already at the minimum duration of 15 minutes.`)
      return
    }
    const end = new Date(nextEnd).toISOString()
    scheduler.resizeEvent(event.id, { end })
    setNotice(formatTimelineInteractionNotice(event.title, 'resize-end', { start: event.start, end }))
  }
  return <div className="timeline" role="region" aria-label="Resource schedule for 27 August 2026" onPointerMove={e => interaction.current?.onPointerMove(e.nativeEvent)} onPointerUp={e => interaction.current?.onPointerUp(e.nativeEvent)} onPointerCancel={e => interaction.current?.onPointerCancel(e.nativeEvent)}>
    <div className="timeline-corner">Resource <span>UTC</span></div>
    <div className="timeline-head timeline-canvas">{timeline.slots.map(slot => <div key={slot.start}>{slot.label.replace(':00','')}</div>)}</div>
    {timeline.rows.map(row => <React.Fragment key={row.resource.id}><div className="resource-name"><span className={`avatar avatar-${row.resource.id}`}>{row.resource.title.charAt(0)}</span><span><strong>{row.resource.title}</strong><small>{row.resource.group}</small></span></div><div className="timeline-row timeline-canvas">
      <div className="hour-lines" aria-hidden="true">{timeline.slots.map(slot => <i key={slot.start}></i>)}</div>
      {row.events.length === 0 && <span className="open-label">Open</span>}
      {row.events.map(event => {
        const value = preview?.id === event.id ? preview.value : event
        const positioned = preview?.id === event.id
          ? buildResourceTimeline({ range: state.visibleRange, events: [{ ...event, ...value }], resources: [row.resource], adapter: nativeDateAdapter, slotMinutes: 60, locale: state.locale, timeZone: state.timeZone }).rows[0]?.events[0]
          : event
        const left = positioned?.left ?? 0
        const width = positioned?.width ?? 0.25
        return <div className="event-placement" style={{left:`${left}%`,width:`${width}%`}} key={event.id}><button className={`event-block tone-${String(event.meta?.tone ?? 'red')}`} onPointerDown={e => startDrag(e,event,'move')} onKeyDown={e => { keyMove(e,event); if(e.key==='Delete') remove(event) }} aria-label={`${event.title} ${formatTime(value.start)}–${formatTime(value.end)}. Drag or use left and right arrows to move; Delete to remove.`}><strong>{event.title}</strong><span>{formatTime(value.start)}–{formatTime(value.end)}</span></button><button className={`resize-handle tone-${String(event.meta?.tone ?? 'red')}`} onPointerDown={e => { e.stopPropagation(); startDrag(e,event,'resize-end') }} onKeyDown={e => keyResize(e,event)} aria-label={`Resize ${event.title}, currently ending at ${formatTime(value.end)}. Use left and right arrows to change the duration by 15 minutes.`}><span aria-hidden="true">↔</span></button></div>
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
  return <div className="month-scroll" aria-label="Continuous month calendar">{months.map(month=><section key={month.key} aria-labelledby={`month-${month.key}`}><h2 id={`month-${month.key}`}>{month.label}</h2><div className="weekday-row" aria-hidden="true">{['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(day=><span key={day}>{day}</span>)}</div><div className="month-grid" role="grid">{month.weeks.flat().map(day=>{dayIndex++; const index=dayIndex; return <button role="gridcell" data-day={index} tabIndex={focusIndex===index?0:-1} onKeyDown={e=>onKey(e,index)} className={`${day.outside?'outside ':''}${day.today?'today':''}`} key={day.date}><span>{day.dayNumber}</span>{day.events.slice(0,2).map(event=><i key={event.id}>{event.title}</i>)}</button>})}</div></section>)}</div>
}

function EmptyState() { return <div className="empty-state"><span aria-hidden="true">✦</span><strong>No events in this range</strong><p>Choose another date or add the first event.</p></div> }

function EventDialog({ scheduler, onClose, onNotice }: { scheduler: Scheduler; onClose(): void; onNotice(value: string): void }) {
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
