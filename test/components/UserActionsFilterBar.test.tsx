import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { UserActionsFilterBar } from '../../src/components/UserActionsFilterBar'
import { render, screen } from '../test-utils'

// Mock antd Select to use native select for reliable testing
vi.mock('antd', async (importOriginal) => {
  const antd = await importOriginal<typeof import('antd')>()

  const NativeSelect = ({
    value,
    onChange,
    options,
    placeholder,
    ...rest
  }: {
    value?: string
    onChange?: (v: string) => void
    options?: Array<{ label: string; value: string }>
    placeholder?: string
    [key: string]: unknown
  }) => (
    <select
      aria-label={rest['aria-label'] as string | undefined}
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )

  return { ...antd, Select: NativeSelect }
})

describe('UserActionsFilterBar', () => {
  it('renders action type label', () => {
    render(<UserActionsFilterBar />)
    expect(screen.getByText('Action:')).toBeInTheDocument()
  })

  it('renders sort by label', () => {
    render(<UserActionsFilterBar />)
    expect(screen.getByText('Sort by:')).toBeInTheDocument()
  })

  it('action type defaults to "All Actions"', () => {
    render(<UserActionsFilterBar />)
    expect(screen.getByLabelText('Filter by action type')).toHaveValue('')
  })

  it('updates URL when action type is changed to ACCEPT_TOP', async () => {
    render(<UserActionsFilterBar />, { initialEntries: ['/'] })

    await userEvent.selectOptions(
      screen.getByLabelText('Filter by action type'),
      'ACCEPT_TOP'
    )

    expect(screen.getByLabelText('Filter by action type')).toHaveValue('ACCEPT_TOP')
  })

  it('updates URL when action type is changed to REJECT_ALL', async () => {
    render(<UserActionsFilterBar />, { initialEntries: ['/'] })

    await userEvent.selectOptions(
      screen.getByLabelText('Filter by action type'),
      'REJECT_ALL'
    )

    expect(screen.getByLabelText('Filter by action type')).toHaveValue('REJECT_ALL')
  })

  it('shows existing action_type from URL params', () => {
    render(<UserActionsFilterBar />, {
      initialEntries: ['/?action_type=ACCEPT_ALTERNATIVE']
    })

    expect(screen.getByLabelText('Filter by action type')).toHaveValue('ACCEPT_ALTERNATIVE')
  })

  it('shows existing ordering from URL params', () => {
    render(<UserActionsFilterBar />, {
      initialEntries: ['/?ordering=-created_at']
    })

    expect(screen.getByLabelText('Sort by')).toHaveValue('-created_at')
  })

  it('renders all four action type options', () => {
    render(<UserActionsFilterBar />)
    const select = screen.getByLabelText('Filter by action type')
    const options = Array.from(select.querySelectorAll('option'))
    const values = options.map((o) => o.value)
    expect(values).toContain('')
    expect(values).toContain('ACCEPT_TOP')
    expect(values).toContain('ACCEPT_ALTERNATIVE')
    expect(values).toContain('REJECT_ALL')
  })
})
