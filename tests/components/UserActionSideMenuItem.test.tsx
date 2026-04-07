import { describe, expect, it } from 'vitest'

import { UserActionSideMenuItem } from '../../src/components/UserActionSideMenuItem'
import { render, screen } from '../test-utils'

import type { UserActionSummary } from '../../src/api/types.gen'

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
  actor: 'admin@ers.local',
  created_at: new Date(Date.now() - 60_000).toISOString()
}

describe('UserActionSideMenuItem', () => {
  it('renders entity name from parsed_representation', () => {
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

  it('renders the ACCEPT_TOP action type label', () => {
    render(<UserActionSideMenuItem action={baseAction} />)
    expect(screen.getByText('Accept Top')).toBeInTheDocument()
  })

  it('renders the ACCEPT_ALTERNATIVE action type label', () => {
    render(<UserActionSideMenuItem action={{ ...baseAction, action_type: 'ACCEPT_ALTERNATIVE' }} />)
    expect(screen.getByText('Accept Alternative')).toBeInTheDocument()
  })

  it('renders the REJECT_ALL action type label', () => {
    render(<UserActionSideMenuItem action={{ ...baseAction, action_type: 'REJECT_ALL' }} />)
    expect(screen.getByText('Reject All')).toBeInTheDocument()
  })

  it('renders a relative time ago label', () => {
    render(<UserActionSideMenuItem action={baseAction} />)
    expect(screen.getByText(/ago/i)).toBeInTheDocument()
  })
})
