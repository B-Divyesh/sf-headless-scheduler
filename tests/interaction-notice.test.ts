import { describe, expect, it } from 'vitest'
import { formatTimelineInteractionNotice } from '../site/src/interaction-notice'

describe('documentation timeline completion feedback', () => {
  it('announces the new end time after a resize-end commit', () => {
    expect(formatTimelineInteractionNotice('Morning briefing', 'resize-end', {
      start: '2026-08-27T08:30:00.000Z',
      end: '2026-08-27T10:45:00.000Z'
    })).toBe('Morning briefing resized to 10:45 AM.')
  })

  it('continues to announce the new start time after a move commit', () => {
    expect(formatTimelineInteractionNotice('Morning briefing', 'move', {
      start: '2026-08-27T08:45:00.000Z',
      end: '2026-08-27T10:15:00.000Z'
    })).toBe('Morning briefing moved to 8:45 AM.')
  })
})
