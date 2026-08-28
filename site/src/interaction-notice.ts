export type TimelineInteractionMode = 'move' | 'resize-end'

const formatTime = (iso: string) => new Intl.DateTimeFormat('en', {
  hour: 'numeric', minute: '2-digit', timeZone: 'UTC'
}).format(new Date(iso))

/** Returns the completed interaction result announced by the documentation demo. */
export function formatTimelineInteractionNotice(
  title: string,
  mode: TimelineInteractionMode,
  value: { start: string; end: string }
) {
  const changedTime = mode === 'resize-end' ? value.end : value.start
  return `${title} ${mode === 'move' ? 'moved' : 'resized'} to ${formatTime(changedTime)}.`
}
