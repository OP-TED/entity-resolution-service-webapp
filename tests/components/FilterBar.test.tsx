import { describe, expect, it, vi } from 'vitest'

import { FilterBar } from '../../src/components/FilterBar'
import { render, screen } from '../test-utils'

// Mock the useQueryUpdate hook so FilterBar does not trigger real navigation
vi.mock('../../src/hooks/useQueryUpdate', () => ({
  useQueryUpdate: () => ({
    params: {},
    updateQuery: vi.fn()
  })
}))

describe('FilterBar', () => {
  it('renders the Entity Type filter label', () => {
    render(<FilterBar />)
    expect(screen.getByText('Entity Type:')).toBeInTheDocument()
  })

  it('renders the Confidence filter label', () => {
    render(<FilterBar />)
    expect(screen.getByText('Confidence:')).toBeInTheDocument()
  })

  it('renders the Status filter label', () => {
    render(<FilterBar />)
    expect(screen.getByText('Status:')).toBeInTheDocument()
  })

  it('renders the Sort by filter label', () => {
    render(<FilterBar />)
    expect(screen.getByText('Sort by:')).toBeInTheDocument()
  })

  it('renders the Search filter label', () => {
    render(<FilterBar />)
    expect(screen.getByText('Search:')).toBeInTheDocument()
  })

  it('renders Select Entity Type combobox', () => {
    render(<FilterBar />)
    expect(screen.getByLabelText('Select Entity Type')).toBeInTheDocument()
  })

  it('renders Select Status combobox', () => {
    render(<FilterBar />)
    expect(screen.getByLabelText('Select Status')).toBeInTheDocument()
  })

  it('renders Sort by combobox', () => {
    render(<FilterBar />)
    expect(screen.getByLabelText('Sort by')).toBeInTheDocument()
  })

  it('renders search input', () => {
    render(<FilterBar />)
    expect(screen.getByPlaceholderText('Entity name, ID, etc...')).toBeInTheDocument()
  })
})
