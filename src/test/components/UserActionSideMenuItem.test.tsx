import { describe, expect, it, vi } from 'vitest'

import { UserActionSideMenuItem } from '../../components/UserActionSideMenuItem'
import { render, screen } from '../test-utils'

import type { UserActionSummary } from '../../api/types.gen'

const baseAction: UserActionSummary = {
  id: 'action-001',
  about_entity_mention: {
    identified_by: {
      source_id: 'src-1',
      request_id: 'entity-001',
      entity_type: 'Person'
    },
    parsed_representation: { name: 'Alice Corp' }
  },
  candidates: [],
  selected_cluster: { cluster_id: 'cluster-1', confidence_score: 0.85, similarity_score: 0.8 },
  action_type: 'ACCEPT_TOP',
  actor: {
    id: 'user-123',
    email: 'admin@ers.local',
  },
  created_at: new Date(Date.now() - 60_000).toISOString()
}

describe('UserActionSideMenuItem', () => {
  describe('entity name display', () => {
    it('renders name from parsed_representation', () => {
      render(<UserActionSideMenuItem action={baseAction} />)
      expect(screen.getByText('Alice Corp')).toBeInTheDocument()
    })

    it('falls back to request_id when parsed_representation has no name', () => {
      const action: UserActionSummary = {
        ...baseAction,
        about_entity_mention: {
          identified_by: { source_id: 'src-1', request_id: 'entity-fallback', entity_type: 'Person' },
          parsed_representation: {}
        }
      }
      render(<UserActionSideMenuItem action={action} />)
      expect(screen.getByText('entity-fallback')).toBeInTheDocument()
    })

    it('falls back to request_id when parsed_representation is null', () => {
      const action: UserActionSummary = {
        ...baseAction,
        about_entity_mention: {
          identified_by: { source_id: 'src-1', request_id: 'req-null-pr', entity_type: 'Organization' },
          parsed_representation: null as unknown as Record<string, unknown>
        }
      }
      render(<UserActionSideMenuItem action={action} />)
      expect(screen.getByText('req-null-pr')).toBeInTheDocument()
    })

    it('renders different entity names for different actions', () => {
      const action: UserActionSummary = {
        ...baseAction,
        about_entity_mention: {
          ...baseAction.about_entity_mention,
          parsed_representation: { name: 'Acme Industries' }
        }
      }
      render(<UserActionSideMenuItem action={action} />)
      expect(screen.getByText('Acme Industries')).toBeInTheDocument()
      expect(screen.queryByText('Alice Corp')).not.toBeInTheDocument()
    })
  })

  describe('action type tag', () => {
    it.each([
      { type: 'ACCEPT_TOP' as const, label: 'Accept Top', color: 'green' },
      { type: 'ACCEPT_ALTERNATIVE' as const, label: 'Accept Alternative', color: 'blue' },
      { type: 'REJECT_ALL' as const, label: 'Reject All', color: 'red' },
    ])('renders "$label" tag with $color color for $type', ({ type, label, color }) => {
      render(<UserActionSideMenuItem action={{ ...baseAction, action_type: type }} />)

      const tag = screen.getByText(label).closest('.ant-tag')
      expect(tag).toBeInTheDocument()
      expect(tag).toHaveClass(`ant-tag-${color}`)
    })
  })

  describe('time display', () => {
    it('renders "1m ago" for an action created 60 seconds ago', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-15T12:01:00Z'))

      const action: UserActionSummary = {
        ...baseAction,
        created_at: '2026-03-15T12:00:00Z'
      }
      render(<UserActionSideMenuItem action={action} />)
      expect(screen.getByText('1m ago')).toBeInTheDocument()

      vi.useRealTimers()
    })

    it('renders "2h ago" for an action created 2 hours ago', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-15T14:00:00Z'))

      const action: UserActionSummary = {
        ...baseAction,
        created_at: '2026-03-15T12:00:00Z'
      }
      render(<UserActionSideMenuItem action={action} />)
      expect(screen.getByText('2h ago')).toBeInTheDocument()

      vi.useRealTimers()
    })

    it('renders "3d ago" for an action created 3 days ago', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-18T12:00:00Z'))

      const action: UserActionSummary = {
        ...baseAction,
        created_at: '2026-03-15T12:00:00Z'
      }
      render(<UserActionSideMenuItem action={action} />)
      expect(screen.getByText('3d ago')).toBeInTheDocument()

      vi.useRealTimers()
    })
  })

  describe('renders complete item correctly', () => {
    it('displays entity name, action tag, and time together', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-03-15T12:05:00Z'))

      const action: UserActionSummary = {
        ...baseAction,
        about_entity_mention: {
          identified_by: { source_id: 'src-1', request_id: 'req-1', entity_type: 'Organization' },
          parsed_representation: { name: 'Global Tech Ltd' }
        },
        action_type: 'REJECT_ALL',
        created_at: '2026-03-15T12:00:00Z'
      }
      render(<UserActionSideMenuItem action={action} />)

      expect(screen.getByText('Global Tech Ltd')).toBeInTheDocument()
      expect(screen.getByText('Reject All')).toBeInTheDocument()
      expect(screen.getByText('5m ago')).toBeInTheDocument()

      const tag = screen.getByText('Reject All').closest('.ant-tag')
      expect(tag).toHaveClass('ant-tag-red')

      vi.useRealTimers()
    })
  })
})
