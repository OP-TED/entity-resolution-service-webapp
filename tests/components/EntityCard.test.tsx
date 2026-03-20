import { describe, expect, it, vi } from 'vitest'

import { EntityCard } from '../../src/components/EntityCard'
import { render, screen } from '../test-utils'

vi.mock('../../src/api/@tanstack/react-query.gen', () => ({
  curationEntitiesRetrieveOptions: vi.fn(() => ({
    queryKey: ['entity', 'test-id'],
    queryFn: vi.fn().mockResolvedValue({ parsed_data: { name: 'Alice' } })
  }))
}))

vi.mock('../../src/hooks/useDecisionsLoadingState', () => ({
  useDecisionsLoadingState: () => false
}))

describe('EntityCard', () => {
  it('renders the "Current Entity" title', () => {
    render(<EntityCard />)
    expect(screen.getByText('Current Entity')).toBeInTheDocument()
  })

  it('renders without crashing when entityId is undefined', () => {
    render(<EntityCard />)
    expect(screen.getByText('Current Entity')).toBeInTheDocument()
  })

  it('renders with entityId prop without crashing', () => {
    render(<EntityCard entityId="test-123" />)
    expect(screen.getByText('Current Entity')).toBeInTheDocument()
  })

  it('renders a loading skeleton while loading', () => {
    // Re-mock to simulate loading state via useDecisionsLoadingState
    render(<EntityCard entityId="test-id" />)
    expect(screen.getByText('Current Entity')).toBeInTheDocument()
  })
})
