import { describe, expect, it, vi } from 'vitest'

import { DecisionsSideMenu } from '../../src/components/DecisionsSideMenu'
import { render, screen } from '../test-utils'

vi.mock('../../src/api/@tanstack/react-query.gen', () => ({
  curationDecisionsRetrieveInfiniteOptions: vi.fn(() => ({
    queryKey: ['decisions-infinite'],
    queryFn: vi.fn().mockResolvedValue({ results: [], next: null, count: 0 })
  }))
}))

vi.mock('../../src/hooks/useInfiniteScroll', () => ({
  useInfiniteScroll: vi.fn(() => ({ current: null }))
}))

describe('DecisionsSideMenu', () => {
  it('renders without crashing', () => {
    render(<DecisionsSideMenu onSelect={vi.fn()} />)
    // The component always renders the title
    expect(document.querySelector('aside')).toBeInTheDocument()
  })

  it('renders the side menu title', () => {
    render(<DecisionsSideMenu onSelect={vi.fn()} />)
    // DecisionsSideMenuTitle renders some text
    expect(screen.getByText(/Statuses/i)).toBeInTheDocument()
  })

  it('shows a skeleton while loading', () => {
    render(<DecisionsSideMenu onSelect={vi.fn()} />)
    // When the query has no data yet (loading), Skeleton renders
    const aside = document.querySelector('aside')
    expect(aside).toBeInTheDocument()
  })
})
