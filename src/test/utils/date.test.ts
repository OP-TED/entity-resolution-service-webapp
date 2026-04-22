import { formatTimeAgo } from '@utils/date'
import { describe, expect, it } from 'vitest'


describe('formatTimeAgo', () => {
  const now = new Date()

  it('returns seconds ago for recent dates', () => {
    const date = new Date(now.getTime() - 30 * 1000)
    expect(formatTimeAgo(date.toISOString())).toBe('30s ago')
  })

  it('returns minutes ago', () => {
    const date = new Date(now.getTime() - 5 * 60 * 1000)
    expect(formatTimeAgo(date.toISOString())).toBe('5m ago')
  })

  it('returns hours ago', () => {
    const date = new Date(now.getTime() - 3 * 60 * 60 * 1000)
    expect(formatTimeAgo(date.toISOString())).toBe('3h ago')
  })

  it('returns days ago', () => {
    const date = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    expect(formatTimeAgo(date.toISOString())).toBe('2d ago')
  })
})
