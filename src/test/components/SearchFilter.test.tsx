import { SearchFilter } from '@components/SearchFilter'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { fireEvent, render, screen } from '../test-utils'

describe('SearchFilter', () => {
  it('renders a text input with the correct placeholder', () => {
    render(<SearchFilter />)
    expect(
      screen.getByPlaceholderText('Entity name, ID, etc...')
    ).toBeInTheDocument()
  })

  it('has an accessible label', () => {
    render(<SearchFilter />)
    expect(screen.getByLabelText('Search Entity')).toBeInTheDocument()
  })

  it('starts with an empty input when no search param is in the URL', () => {
    render(<SearchFilter />)
    const input = screen.getByPlaceholderText('Entity name, ID, etc...')
    expect(input).toHaveValue('')
  })

  it('initializes with the search value from the URL query param', () => {
    render(<SearchFilter />, { initialEntries: ['/?search=alice'] })
    const input = screen.getByPlaceholderText('Entity name, ID, etc...')
    expect(input).toHaveValue('alice')
  })

  it('updates input value as the user types', async () => {
    render(<SearchFilter />)
    const input = screen.getByPlaceholderText('Entity name, ID, etc...')

    // userEvent conflicts with vi.useFakeTimers; use fireEvent for value checks
    fireEvent.change(input, { target: { value: 'test query' } })

    expect(input).toHaveValue('test query')
  })

  it('clears the input when the user deletes all text', async () => {
    render(<SearchFilter />, { initialEntries: ['/?search=alice'] })
    const input = screen.getByPlaceholderText('Entity name, ID, etc...')

    fireEvent.change(input, { target: { value: '' } })

    expect(input).toHaveValue('')
  })

  it('accepts input via keyboard (userEvent)', async () => {
    render(<SearchFilter />)
    const input = screen.getByPlaceholderText('Entity name, ID, etc...')

    // userEvent.setup() creates an isolated instance that does not rely on
    // global fake timers, so it works correctly even inside Vitest's environment
    const user = userEvent.setup()
    await user.type(input, 'hello')

    expect(input).toHaveValue('hello')
  })
})
