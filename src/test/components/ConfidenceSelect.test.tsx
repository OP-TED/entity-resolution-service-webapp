import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ConfidenceSelect } from '../../components/ConfidenceSelect'
import { render, screen } from '../test-utils'

// antd's virtual-list only renders ~2 items in happy-dom (no real viewport),
// so clicking dropdown options is unreliable. Replace Select with a native
// <select> — same props contract, fully testable, component logic unchanged.
vi.mock('antd', async (importOriginal) => {
  const antd = await importOriginal<typeof import('antd')>()

  const NativeSelect = ({
    value,
    onChange,
    options,
    ...rest
  }: {
    value?: string
    onChange?: (v: string) => void
    options?: Array<{ label: string; value: string }>
    [key: string]: unknown
  }) => (
    <select
      aria-label={rest['aria-label'] as string | undefined}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
    >
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )

  return { ...antd, Select: NativeSelect }
})

describe('ConfidenceSelect', () => {
  it('renders with "All Confidence" selected by default', () => {
    render(<ConfidenceSelect onChange={vi.fn()} />)
    expect(screen.getByRole('combobox')).toHaveValue('All Confidence')
  })

  it('shows "Low (0.0-0.4)" label when min=0 and max=0.4', () => {
    render(
      <ConfidenceSelect onChange={vi.fn()} confidenceMin={0} confidenceMax={0.4} />
    )
    expect(screen.getByRole('combobox')).toHaveValue('Low (0.0-0.4)')
  })

  it('shows "Medium (0.4-0.7)" label when min=0.4 and max=0.7', () => {
    render(
      <ConfidenceSelect onChange={vi.fn()} confidenceMin={0.4} confidenceMax={0.7} />
    )
    expect(screen.getByRole('combobox')).toHaveValue('Medium (0.4-0.7)')
  })

  it('shows "High (0.7-1.0)" label when min=0.7 and max=1.0', () => {
    render(
      <ConfidenceSelect onChange={vi.fn()} confidenceMin={0.7} confidenceMax={1.0} />
    )
    expect(screen.getByRole('combobox')).toHaveValue('High (0.7-1.0)')
  })

  it('calls onChange with correct min/max when Low option is selected', async () => {
    const onChange = vi.fn()
    render(<ConfidenceSelect onChange={onChange} />)

    await userEvent.selectOptions(screen.getByRole('combobox'), 'Low (0.0-0.4)')

    expect(onChange).toHaveBeenCalledWith({ confidence_min: 0.0, confidence_max: 0.4 })
  })

  it('calls onChange with correct min/max when Medium option is selected', async () => {
    const onChange = vi.fn()
    render(<ConfidenceSelect onChange={onChange} />)

    await userEvent.selectOptions(screen.getByRole('combobox'), 'Medium (0.4-0.7)')

    expect(onChange).toHaveBeenCalledWith({ confidence_min: 0.4, confidence_max: 0.7 })
  })

  it('calls onChange with correct min/max when High option is selected', async () => {
    const onChange = vi.fn()
    render(<ConfidenceSelect onChange={onChange} />)

    await userEvent.selectOptions(screen.getByRole('combobox'), 'High (0.7-1.0)')

    expect(onChange).toHaveBeenCalledWith({ confidence_min: 0.7, confidence_max: 1.0 })
  })

  it('calls onChange with undefined min/max when All Confidence is selected', async () => {
    const onChange = vi.fn()
    render(
      <ConfidenceSelect onChange={onChange} confidenceMin={0.4} confidenceMax={0.7} />
    )

    await userEvent.selectOptions(screen.getByRole('combobox'), 'All Confidence')

    expect(onChange).toHaveBeenCalledWith({ confidence_min: undefined, confidence_max: undefined })
  })

  it('has an accessible label', () => {
    render(<ConfidenceSelect onChange={vi.fn()} />)
    expect(screen.getByLabelText('Select Confidence')).toBeInTheDocument()
  })
})
