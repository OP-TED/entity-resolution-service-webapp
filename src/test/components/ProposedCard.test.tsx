import { ProposedCard } from '@components/ProposedCard'
import { describe, expect, it, vi } from 'vitest'

import { render, screen } from '../test-utils'

import type { CanonicalEntityPreview } from '@api/types.gen'

vi.mock('@hooks/useDecisionsLoadingState', () => ({
  useDecisionsLoadingState: () => false
}))

const mockData: CanonicalEntityPreview = {
  cluster_id: 'cluster-1',
  confidence_score: 0.9,
  similarity_score: 0.85,
  cluster_size: 12,
  top_entities: [
    {
      identified_by: { source_id: 'src-1', request_id: 'e1', entity_type: 'Person' },
      parsed_representation: { name: 'Alice', city: 'Paris' }
    },
    {
      identified_by: { source_id: 'src-1', request_id: 'e2', entity_type: 'Person' },
      parsed_representation: { name: 'Bob', city: 'London' }
    }
  ]
}

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
    expect(
      screen.getByText(/Entity 1 of 2 loaded entities/)
    ).toBeInTheDocument()
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
    const prevBtn = document
      .querySelector('[aria-label="arrow-left"]')
      ?.closest('button')
    expect(prevBtn).toBeDisabled()
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
    const nextBtn = document
      .querySelector('[aria-label="arrow-right"]')
      ?.closest('button')
    expect(nextBtn).toBeDisabled()
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
    const prevBtn = document
      .querySelector('[aria-label="arrow-left"]')
      ?.closest('button')
    prevBtn?.click()
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
    const nextBtn = document
      .querySelector('[aria-label="arrow-right"]')
      ?.closest('button')
    nextBtn?.click()
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

  it('includes reference-only fields with empty values', () => {
    render(
      <ProposedCard
        currentEntity={1}
        data={mockData}
        referenceEntityData={{ name: 'Alice', city: 'Paris', address: '123 Main St', country: 'US' }}
        isLoading={false}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />
    )

    expect(screen.getByText('Address:')).toBeInTheDocument()
    expect(screen.getByText('Country:')).toBeInTheDocument()
    // Missing fields are rendered as empty values on the proposed side.
    expect(screen.queryByText('123 Main St')).not.toBeInTheDocument()
    expect(screen.queryByText('US')).not.toBeInTheDocument()
  })
})
