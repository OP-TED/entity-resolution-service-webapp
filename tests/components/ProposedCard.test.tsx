import { describe, expect, it, vi } from 'vitest'

import { ProposedCard } from '../../src/components/ProposedCard'
import { render, screen } from '../test-utils'

import type { CanonicalEntityPreview } from '../../src/api/types.gen'

vi.mock('../../src/hooks/useDecisionsLoadingState', () => ({
  useDecisionsLoadingState: () => false
}))

const mockData: CanonicalEntityPreview = {
  top_alignment_links: [
    {
      entity_mention: {
        parsed_data: { name: 'Alice', city: 'Paris' }
      }
    },
    {
      entity_mention: {
        parsed_data: { name: 'Bob', city: 'London' }
      }
    }
  ]
} as unknown as CanonicalEntityPreview

describe('ProposedCard', () => {
  it('renders the default title "Proposed Match"', () => {
    render(
      <ProposedCard
        currentEntity={1}
        data={mockData}
        isLoading={false}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />
    )
    expect(screen.getByText('Proposed Match')).toBeInTheDocument()
  })

  it('renders a custom title', () => {
    render(
      <ProposedCard
        currentEntity={1}
        data={mockData}
        title="Alternative Match"
        isAlternative
        isLoading={false}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />
    )
    expect(screen.getByText('Alternative Match')).toBeInTheDocument()
  })

  it('shows entity count label', () => {
    render(
      <ProposedCard
        currentEntity={1}
        data={mockData}
        isLoading={false}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />
    )
    expect(screen.getByText(/Entity 1 of 2 in cluster/)).toBeInTheDocument()
  })

  it('disables previous button when on first entity', () => {
    render(
      <ProposedCard
        currentEntity={1}
        data={mockData}
        isLoading={false}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons[0]).toBeDisabled()
  })

  it('disables next button when on last entity', () => {
    render(
      <ProposedCard
        currentEntity={2}
        data={mockData}
        isLoading={false}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />
    )
    const buttons = screen.getAllByRole('button')
    expect(buttons[1]).toBeDisabled()
  })

  it('calls onPrevious when previous button is clicked', async () => {
    const onPrevious = vi.fn()
    render(
      <ProposedCard
        currentEntity={2}
        data={mockData}
        isLoading={false}
        onPrevious={onPrevious}
        onNext={vi.fn()}
      />
    )
    const buttons = screen.getAllByRole('button')
    buttons[0].click()
    expect(onPrevious).toHaveBeenCalledOnce()
  })

  it('calls onNext when next button is clicked', async () => {
    const onNext = vi.fn()
    render(
      <ProposedCard
        currentEntity={1}
        data={mockData}
        isLoading={false}
        onPrevious={vi.fn()}
        onNext={onNext}
      />
    )
    const buttons = screen.getAllByRole('button')
    buttons[1].click()
    expect(onNext).toHaveBeenCalledOnce()
  })

  it('shows entity attributes from the current entity index', () => {
    render(
      <ProposedCard
        currentEntity={1}
        data={mockData}
        isLoading={false}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />
    )
    expect(screen.getByText('Alice')).toBeInTheDocument()
  })

  it('renders without data', () => {
    render(
      <ProposedCard
        currentEntity={1}
        isLoading={false}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />
    )
    expect(screen.getByText('Proposed Match')).toBeInTheDocument()
  })
})
